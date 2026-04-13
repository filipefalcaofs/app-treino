import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import type { ProgressPhoto } from '../types'

export function useProgressPhotos() {
  const { user } = useAuthStore()
  const [photos, setPhotos] = useState<ProgressPhoto[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPhotos = useCallback(async () => {
    if (!user) {
      setPhotos([])
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('progress_photos')
        .select('*')
        .eq('user_id', user.id)
        .order('taken_at', { ascending: false })

      if (error) throw error
      setPhotos(data ?? [])
    } catch {
      setPhotos([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchPhotos()
  }, [fetchPhotos])

  const addPhoto = useCallback(
    async (file: File, weight_kg?: number, body_fat_pct?: number) => {
      if (!user) return

      const ext = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${ext}`

      try {
        const { error: uploadError } = await supabase.storage
          .from('progress-photos')
          .upload(fileName, file)

        if (uploadError) throw uploadError

        const {
          data: { publicUrl },
        } = supabase.storage.from('progress-photos').getPublicUrl(fileName)

        const { error: insertError } = await supabase
          .from('progress_photos')
          .insert({
            user_id: user.id,
            photo_url: publicUrl,
            weight_kg: weight_kg ?? null,
            body_fat_pct: body_fat_pct ?? null,
            taken_at: new Date().toISOString().split('T')[0],
          })

        if (insertError) throw insertError
        await fetchPhotos()
      } catch (err) {
        console.error('Erro ao adicionar foto:', err)
        throw err
      }
    },
    [user, fetchPhotos],
  )

  const deletePhoto = useCallback(
    async (id: string) => {
      if (!user) return

      try {
        const photo = photos.find((p) => p.id === id)
        if (!photo) return

        const url = new URL(photo.photo_url)
        const storagePath = url.pathname.split('/progress-photos/').pop()

        if (storagePath) {
          await supabase.storage
            .from('progress-photos')
            .remove([decodeURIComponent(storagePath)])
        }

        const { error } = await supabase
          .from('progress_photos')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id)

        if (error) throw error
        setPhotos((prev) => prev.filter((p) => p.id !== id))
      } catch (err) {
        console.error('Erro ao deletar foto:', err)
        throw err
      }
    },
    [user, photos],
  )

  return { photos, loading, addPhoto, deletePhoto }
}

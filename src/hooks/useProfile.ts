import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import type { Profile } from '../types'

export function useProfile() {
  const { user } = useAuthStore()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setProfile(data)
    } catch {
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const updateProfile = useCallback(
    async (updates: Partial<Omit<Profile, 'id' | 'created_at'>>) => {
      if (!user) return

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error
      setProfile(data)
      return data
    },
    [user],
  )

  const uploadAvatar = useCallback(
    async (file: File) => {
      if (!user) return

      const ext = file.name.split('.').pop()
      const path = `${user.id}/avatar.${ext}`

      try {
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, file, { upsert: true })

        if (uploadError) throw uploadError

        const {
          data: { publicUrl },
        } = supabase.storage.from('avatars').getPublicUrl(path)

        const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`
        await updateProfile({ avatar_url: urlWithCacheBust })
      } catch (err) {
        console.error('Erro ao fazer upload do avatar:', err)
        throw err
      }
    },
    [user, updateProfile],
  )

  return { profile, loading, updateProfile, uploadAvatar, refetch: fetchProfile }
}

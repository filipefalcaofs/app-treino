import { useState } from 'react'
import type { ProgressPhoto } from '../../types'

interface PhotoGalleryProps {
  photos: ProgressPhoto[]
  onDelete: (id: string) => Promise<void>
}

function formatPhotoDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00')
  const day = date.getDate().toString().padStart(2, '0')
  const months = [
    'JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN',
    'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ',
  ]
  return `${day} ${months[date.getMonth()]}, ${date.getFullYear()}`
}

export function PhotoGallery({ photos, onDelete }: PhotoGalleryProps) {
  const [deleting, setDeleting] = useState<string | null>(null)

  if (photos.length === 0) {
    return (
      <div className="bg-surface-container-low rounded-xl p-12 flex flex-col items-center justify-center gap-4">
        <span className="material-symbols-outlined text-5xl text-on-surface-variant/40">
          photo_library
        </span>
        <p className="text-on-surface-variant">
          Nenhuma foto de evolucao ainda. Adicione sua primeira foto.
        </p>
      </div>
    )
  }

  async function handleDelete(id: string) {
    setDeleting(id)
    try {
      await onDelete(id)
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {photos.map((photo) => (
        <div
          key={photo.id}
          className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-surface-container-low"
        >
          <img
            src={photo.photo_url}
            alt={`Foto de evolucao ${formatPhotoDate(photo.taken_at)}`}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-100 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

          <div className="absolute bottom-4 left-4">
            <p className="text-primary-fixed font-black text-lg">
              {formatPhotoDate(photo.taken_at)}
            </p>
            <p className="text-white/70 text-xs font-bold tracking-wide">
              {photo.weight_kg != null && `${photo.weight_kg} KG`}
              {photo.weight_kg != null && photo.body_fat_pct != null && ' \u2022 '}
              {photo.body_fat_pct != null && `${photo.body_fat_pct}% GC`}
              {photo.weight_kg == null && photo.body_fat_pct == null && '--'}
            </p>
          </div>

          <button
            onClick={() => handleDelete(photo.id)}
            disabled={deleting === photo.id}
            className="absolute top-4 right-4 bg-black/40 backdrop-blur-md p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error/60 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-on-surface text-sm">
              {deleting === photo.id ? 'hourglass_empty' : 'delete'}
            </span>
          </button>
        </div>
      ))}
    </div>
  )
}

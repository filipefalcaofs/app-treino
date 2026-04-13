import { useState } from 'react'
import { useProfile } from '../hooks/useProfile'
import { useProgressPhotos } from '../hooks/useProgressPhotos'
import { useAuth } from '../hooks/useAuth'
import { ProfileCard } from '../components/profile/ProfileCard'
import { MetricTile } from '../components/profile/MetricTile'
import { ProfileEditModal } from '../components/profile/ProfileEditModal'
import { PhotoGallery } from '../components/profile/PhotoGallery'
import { PhotoUploadButton } from '../components/profile/PhotoUploadButton'

export function Profile() {
  const { profile, loading, updateProfile, uploadAvatar } = useProfile()
  const { photos, loading: photosLoading, addPhoto, deletePhoto } = useProgressPhotos()
  const { signOut } = useAuth()
  const [editOpen, setEditOpen] = useState(false)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 mb-6 md:mb-12">
        <div>
          <h1 className="text-3xl md:text-6xl font-black italic tracking-tighter text-on-surface mb-1 font-headline">
            PERFIL DO ATLETA
          </h1>
          <p className="text-on-surface-variant font-medium text-sm md:text-base">
            Monitorando precisão metabólica e evolução física.
          </p>
        </div>
        <button
          onClick={() => setEditOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary-fixed text-on-primary-fixed rounded-xl font-bold tracking-tight hover:scale-105 active:scale-95 transition-all shadow-lg"
        >
          <span className="material-symbols-outlined">edit</span>
          EDITAR PERFIL
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 mb-8 md:mb-12">
        <ProfileCard profile={profile} />

        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <MetricTile icon="cake" label="Idade" value={profile?.age ?? null} />
          <MetricTile
            icon="weight"
            label="Peso"
            value={profile?.weight_kg ?? null}
            unit="kg"
          />
          <MetricTile
            icon="straighten"
            label="Altura"
            value={profile?.height_cm ?? null}
            unit="cm"
          />
          <MetricTile
            icon="body_fat"
            label="Gordura Corporal"
            value={profile?.body_fat_pct ?? null}
            unit="%"
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 mb-6">
        <div className="flex items-center gap-4">
          <h3 className="text-2xl font-black italic text-on-surface uppercase tracking-tight font-headline">
            Galeria de Evolução
          </h3>
          <span className="px-2 py-0.5 bg-surface-container-highest text-on-surface-variant rounded text-xs font-bold">
            {photos.length} {photos.length === 1 ? 'FOTO' : 'FOTOS'}
          </span>
        </div>
        <PhotoUploadButton onUpload={addPhoto} />
      </div>

      {photosLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <PhotoGallery photos={photos} onDelete={deletePhoto} />
      )}

      <ProfileEditModal
        open={editOpen}
        profile={profile}
        onClose={() => setEditOpen(false)}
        onSave={updateProfile}
        onUploadAvatar={uploadAvatar}
      />

      <div className="mt-12 pt-6 border-t border-outline-variant/15">
        <button
          onClick={signOut}
          className="flex items-center justify-center gap-3 w-full py-4 text-error hover:bg-error/10 transition-colors rounded-xl font-headline font-bold tracking-tight"
        >
          <span className="material-symbols-outlined">logout</span>
          ENCERRAR SESSAO
        </button>
      </div>
    </div>
  )
}

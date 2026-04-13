import { useState, useEffect, useRef } from 'react'
import type { Profile } from '../../types'

interface ProfileEditModalProps {
  open: boolean
  profile: Profile | null
  onClose: () => void
  onSave: (data: Partial<Omit<Profile, 'id' | 'created_at'>>) => Promise<void>
  onUploadAvatar: (file: File) => Promise<void>
}

export function ProfileEditModal({
  open,
  profile,
  onClose,
  onSave,
  onUploadAvatar,
}: ProfileEditModalProps) {
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [bodyFat, setBodyFat] = useState('')
  const [goal, setGoal] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (profile && open) {
      setName(profile.name ?? '')
      setAge(profile.age?.toString() ?? '')
      setWeight(profile.weight_kg?.toString() ?? '')
      setHeight(profile.height_cm?.toString() ?? '')
      setBodyFat(profile.body_fat_pct?.toString() ?? '')
      setGoal(profile.goal ?? '')
      setAvatarPreview(profile.avatar_url)
      setAvatarFile(null)
    }
  }, [profile, open])

  if (!open) return null

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      if (avatarFile) {
        await onUploadAvatar(avatarFile)
      }

      await onSave({
        name: name || null,
        age: age ? parseInt(age) : null,
        weight_kg: weight ? parseFloat(weight) : null,
        height_cm: height ? parseInt(height) : null,
        body_fat_pct: bodyFat ? parseFloat(bodyFat) : null,
        goal: goal || null,
      } as Partial<Omit<Profile, 'id' | 'created_at'>>)

      onClose()
    } catch (err) {
      console.error('Erro ao salvar perfil:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <form
        onSubmit={handleSubmit}
        className="relative bg-surface-container-high rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-8"
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black font-headline text-on-surface">
            Editar Perfil
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex flex-col items-center mb-8">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-outline-variant hover:border-primary-fixed transition-colors group"
          >
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-surface-container-highest flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant">
                  person
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-white">
                photo_camera
              </span>
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <p className="text-on-surface-variant text-xs mt-2">
            Clique para alterar a foto
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest mb-2 block">
              Nome
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-container-highest border-b-2 border-outline-variant focus:border-primary-fixed text-on-surface px-4 py-3 rounded-lg outline-none transition-colors"
              placeholder="Seu nome"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest mb-2 block">
                Idade
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full bg-surface-container-highest border-b-2 border-outline-variant focus:border-primary-fixed text-on-surface px-4 py-3 rounded-lg outline-none transition-colors"
                placeholder="28"
              />
            </div>
            <div>
              <label className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest mb-2 block">
                Peso (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full bg-surface-container-highest border-b-2 border-outline-variant focus:border-primary-fixed text-on-surface px-4 py-3 rounded-lg outline-none transition-colors"
                placeholder="88.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest mb-2 block">
                Altura (cm)
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full bg-surface-container-highest border-b-2 border-outline-variant focus:border-primary-fixed text-on-surface px-4 py-3 rounded-lg outline-none transition-colors"
                placeholder="184"
              />
            </div>
            <div>
              <label className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest mb-2 block">
                Gordura Corporal (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={bodyFat}
                onChange={(e) => setBodyFat(e.target.value)}
                className="w-full bg-surface-container-highest border-b-2 border-outline-variant focus:border-primary-fixed text-on-surface px-4 py-3 rounded-lg outline-none transition-colors"
                placeholder="12.4"
              />
            </div>
          </div>

          <div>
            <label className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest mb-2 block">
              Objetivo
            </label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full bg-surface-container-highest border-b-2 border-outline-variant focus:border-primary-fixed text-on-surface px-4 py-3 rounded-lg outline-none transition-colors appearance-none"
            >
              <option value="">Selecione...</option>
              <option value="Hipertrofia">Hipertrofia</option>
              <option value="Emagrecimento">Emagrecimento</option>
              <option value="Resistência">Resistência</option>
              <option value="Força">Força</option>
              <option value="Saúde">Saúde</option>
              <option value="Recomposição">Recomposição</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-8">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3 text-on-surface-variant font-bold rounded-xl hover:bg-surface-container-highest transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-6 py-3 kinetic-gradient text-on-primary-fixed font-bold rounded-xl hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  )
}

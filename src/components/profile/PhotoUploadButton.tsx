import { useState, useRef } from 'react'

interface PhotoUploadButtonProps {
  onUpload: (file: File, weight_kg?: number, body_fat_pct?: number) => Promise<void>
}

export function PhotoUploadButton({ onUpload }: PhotoUploadButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [weight, setWeight] = useState('')
  const [bodyFat, setBodyFat] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    setPreview(URL.createObjectURL(file))
    setWeight('')
    setBodyFat('')
    setShowModal(true)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleConfirm() {
    if (!selectedFile) return
    setUploading(true)

    try {
      await onUpload(
        selectedFile,
        weight ? parseFloat(weight) : undefined,
        bodyFat ? parseFloat(bodyFat) : undefined,
      )
      handleClose()
    } catch (err) {
      console.error('Erro no upload:', err)
    } finally {
      setUploading(false)
    }
  }

  function handleClose() {
    setShowModal(false)
    setSelectedFile(null)
    setPreview(null)
    setWeight('')
    setBodyFat('')
  }

  return (
    <>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-fixed text-on-primary-fixed font-bold rounded-lg hover:brightness-110 active:scale-95 transition-all shadow-md"
      >
        <span className="material-symbols-outlined text-xl">photo_camera</span>
        ADICIONAR FOTO
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
          />

          <div className="relative bg-surface-container-high rounded-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-black font-headline text-on-surface mb-4">
              Nova foto de evolucao
            </h3>

            {preview && (
              <div className="aspect-[3/4] rounded-xl overflow-hidden mb-4">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <p className="text-on-surface-variant text-xs mb-4">
              Opcionalmente, registre seu peso e gordura corporal atuais.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div>
                <label className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest mb-1 block">
                  Peso (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full bg-surface-container-highest border-b-2 border-outline-variant focus:border-primary-fixed text-on-surface px-3 py-2 rounded-lg outline-none transition-colors text-sm"
                  placeholder="88.5"
                />
              </div>
              <div>
                <label className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest mb-1 block">
                  Gordura (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={bodyFat}
                  onChange={(e) => setBodyFat(e.target.value)}
                  className="w-full bg-surface-container-highest border-b-2 border-outline-variant focus:border-primary-fixed text-on-surface px-3 py-2 rounded-lg outline-none transition-colors text-sm"
                  placeholder="12.4"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2.5 text-on-surface-variant font-bold rounded-xl hover:bg-surface-container-highest transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={uploading}
                className="flex-1 px-4 py-2.5 kinetic-gradient text-on-primary-fixed font-bold rounded-xl hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
              >
                {uploading ? 'Enviando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

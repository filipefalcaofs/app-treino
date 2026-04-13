import { useState } from 'react'

interface RunningFormData {
  date: string
  description: string | null
  distance_km: number | null
  total_time: string | null
  avg_pace: string | null
  moving_time: string | null
  elevation_m: number | null
  elevation_gain_m: number | null
  steps: number | null
  heart_rate: number | null
  surface: string | null
  intensity: string | null
  note: string | null
}

interface RunningFormModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: RunningFormData) => Promise<void>
}

const SURFACES = ['Asfalto', 'Trilha', 'Pista', 'Esteira']
const INTENSITIES = [
  { value: 'leve', label: 'Leve' },
  { value: 'moderado', label: 'Moderado' },
  { value: 'forte', label: 'Forte' },
]

function today(): string {
  return new Date().toISOString().split('T')[0]
}

export function RunningFormModal({ open, onClose, onSave }: RunningFormModalProps) {
  const [form, setForm] = useState<RunningFormData>({
    date: today(),
    description: '',
    distance_km: null,
    total_time: null,
    avg_pace: null,
    moving_time: null,
    elevation_m: null,
    elevation_gain_m: null,
    steps: null,
    heart_rate: null,
    surface: null,
    intensity: null,
    note: null,
  })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!open) return null

  function updateField<K extends keyof RunningFormData>(key: K, value: RunningFormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
    setErrors(prev => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  function updateNumber(key: keyof RunningFormData, raw: string) {
    if (raw === '') {
      updateField(key, null as RunningFormData[typeof key])
      return
    }
    const n = parseFloat(raw)
    if (isNaN(n) || n < 0) {
      setErrors(prev => ({ ...prev, [key]: 'Valor invalido' }))
      return
    }
    updateField(key, n as RunningFormData[typeof key])
  }

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!form.date) e.date = 'Obrigatorio'
    if (form.total_time && !/^\d{1,2}:\d{2}:\d{2}$/.test(form.total_time)) {
      e.total_time = 'Formato HH:MM:SS'
    }
    if (form.avg_pace && !/^\d{1,2}:\d{2}$/.test(form.avg_pace)) {
      e.avg_pace = 'Formato MM:SS'
    }
    if (form.moving_time && !/^\d{1,2}:\d{2}:\d{2}$/.test(form.moving_time)) {
      e.moving_time = 'Formato HH:MM:SS'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    setSaving(true)
    try {
      await onSave({
        ...form,
        description: form.description || null,
        note: form.note || null,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const labelCls = 'text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 block'
  const inputCls = 'w-full bg-surface-container-highest border-b-2 border-outline-variant focus:border-primary-fixed outline-none px-4 py-3 rounded-t-lg text-on-surface placeholder:text-on-surface-variant/50 transition-colors'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-container-low rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-outline-variant/20">
        <div className="sticky top-0 bg-surface-container-low p-6 pb-4 border-b border-outline-variant/10 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary-container">directions_run</span>
              <h3 className="text-xl font-headline font-bold">Registrar Corrida</h3>
            </div>
            <button onClick={onClose} className="p-1 text-on-surface-variant hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>Data</label>
              <input
                type="date"
                value={form.date}
                onChange={e => updateField('date', e.target.value)}
                className={inputCls}
              />
              {errors.date && <p className="text-error text-xs mt-1">{errors.date}</p>}
            </div>
            <div>
              <label className={labelCls}>Descricao</label>
              <input
                type="text"
                value={form.description ?? ''}
                onChange={e => updateField('description', e.target.value)}
                placeholder="Ex: Corrida longa no parque"
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>Distancia (km)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.distance_km ?? ''}
                onChange={e => updateNumber('distance_km', e.target.value)}
                placeholder="0.00"
                className={inputCls}
              />
              {errors.distance_km && <p className="text-error text-xs mt-1">{errors.distance_km}</p>}
            </div>
            <div>
              <label className={labelCls}>Tempo Total (HH:MM:SS)</label>
              <input
                type="text"
                value={form.total_time ?? ''}
                onChange={e => updateField('total_time', e.target.value || null)}
                placeholder="01:30:00"
                className={inputCls}
              />
              {errors.total_time && <p className="text-error text-xs mt-1">{errors.total_time}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>Pace Medio (MM:SS)</label>
              <input
                type="text"
                value={form.avg_pace ?? ''}
                onChange={e => updateField('avg_pace', e.target.value || null)}
                placeholder="05:30"
                className={inputCls}
              />
              {errors.avg_pace && <p className="text-error text-xs mt-1">{errors.avg_pace}</p>}
            </div>
            <div>
              <label className={labelCls}>Tempo de Movimentacao (HH:MM:SS)</label>
              <input
                type="text"
                value={form.moving_time ?? ''}
                onChange={e => updateField('moving_time', e.target.value || null)}
                placeholder="01:25:00"
                className={inputCls}
              />
              {errors.moving_time && <p className="text-error text-xs mt-1">{errors.moving_time}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>Elevacao (m)</label>
              <input
                type="number"
                min="0"
                value={form.elevation_m ?? ''}
                onChange={e => updateNumber('elevation_m', e.target.value)}
                placeholder="0"
                className={inputCls}
              />
              {errors.elevation_m && <p className="text-error text-xs mt-1">{errors.elevation_m}</p>}
            </div>
            <div>
              <label className={labelCls}>Ganho de Elevacao (m)</label>
              <input
                type="number"
                min="0"
                value={form.elevation_gain_m ?? ''}
                onChange={e => updateNumber('elevation_gain_m', e.target.value)}
                placeholder="0"
                className={inputCls}
              />
              {errors.elevation_gain_m && <p className="text-error text-xs mt-1">{errors.elevation_gain_m}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>Passos</label>
              <input
                type="number"
                min="0"
                value={form.steps ?? ''}
                onChange={e => updateNumber('steps', e.target.value)}
                placeholder="0"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Frequencia Cardiaca (bpm)</label>
              <input
                type="number"
                min="0"
                value={form.heart_rate ?? ''}
                onChange={e => updateNumber('heart_rate', e.target.value)}
                placeholder="Opcional"
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>Superficie</label>
              <select
                value={form.surface ?? ''}
                onChange={e => updateField('surface', e.target.value || null)}
                className={inputCls}
              >
                <option value="">Selecionar...</option>
                {SURFACES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Tipo de Treino</label>
              <select
                value={form.intensity ?? ''}
                onChange={e => updateField('intensity', e.target.value || null)}
                className={inputCls}
              >
                <option value="">Selecionar...</option>
                {INTENSITIES.map(i => (
                  <option key={i.value} value={i.value}>{i.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Anotacao</label>
            <textarea
              value={form.note ?? ''}
              onChange={e => updateField('note', e.target.value)}
              placeholder="Observacoes sobre a corrida..."
              rows={3}
              className={`${inputCls} resize-none`}
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-surface-container-low p-6 pt-4 border-t border-outline-variant/10 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="kinetic-gradient text-on-primary-container px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity active:scale-95 disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar Corrida'}
          </button>
        </div>
      </div>
    </div>
  )
}

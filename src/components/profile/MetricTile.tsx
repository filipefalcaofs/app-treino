interface MetricTileProps {
  icon: string
  label: string
  value: string | number | null
  unit?: string
}

export function MetricTile({ icon, label, value, unit }: MetricTileProps) {
  const displayValue = value ?? '--'

  return (
    <div className="bg-surface-container-low rounded-xl p-6 flex flex-col justify-between border-b-2 border-primary-fixed/20 hover:bg-surface-container-high transition-colors">
      <span className="material-symbols-outlined text-primary mb-4">{icon}</span>
      <div>
        <p className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest mb-1">
          {label}
        </p>
        <p className="text-on-surface font-black text-3xl">
          {displayValue}
          {unit && value != null && (
            <span className="text-sm font-bold text-on-surface-variant ml-1">
              {unit}
            </span>
          )}
        </p>
      </div>
    </div>
  )
}

interface MetricCardProps {
  icon: string
  label: string
  value: string
  colorClass: string
}

export function MetricCard({ icon, label, value, colorClass }: MetricCardProps) {
  return (
    <div className="md:col-span-4 bg-surface-container-highest/40 rounded-xl p-6 flex items-center gap-6">
      <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
        <span className="material-symbols-outlined filled text-2xl">{icon}</span>
      </div>
      <div>
        <span className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">
          {label}
        </span>
        <span className="block text-3xl font-extrabold font-headline text-on-surface">{value}</span>
      </div>
    </div>
  )
}

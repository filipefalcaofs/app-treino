interface PRCardProps {
  value: string
  label: string
  sublabel?: string
}

export function PRCard({ value, label, sublabel }: PRCardProps) {
  return (
    <div className="relative overflow-hidden bg-primary text-on-primary-fixed p-8 rounded-xl">
      <span className="material-symbols-outlined absolute -top-2 -right-2 text-[100px] opacity-20 pointer-events-none select-none">
        military_tech
      </span>
      <div className="relative z-10">
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold mb-2">
          {label}
        </p>
        <p className="text-4xl font-extrabold italic font-headline leading-tight">
          {value}
        </p>
        {sublabel && (
          <p className="text-sm opacity-80 mt-1">{sublabel}</p>
        )}
      </div>
    </div>
  )
}

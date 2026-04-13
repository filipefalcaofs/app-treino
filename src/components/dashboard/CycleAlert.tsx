interface CycleAlertProps {
  daysRemaining: number
}

export function CycleAlert({ daysRemaining }: CycleAlertProps) {
  if (daysRemaining > 7) return null

  return (
    <div className="flex items-center gap-3 bg-error/10 border border-error/20 px-4 py-3 rounded-xl animate-pulse mb-6">
      <span className="material-symbols-outlined filled text-error text-2xl">warning</span>
      <span className="text-error font-bold text-sm uppercase">
        Restam apenas {daysRemaining} dias no seu ciclo ativo!
      </span>
    </div>
  )
}

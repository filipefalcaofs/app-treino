import type { CycleWithDays } from '../../hooks/useCycles'

const DAY_LABELS = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'] as const

interface DaySelectorProps {
  activeCycle: CycleWithDays
  selectedDay: number
  onSelectDay: (dayOfWeek: number) => void
}

function getWeekDates(): Date[] {
  const now = new Date()
  const dayIndex = now.getDay()
  const mondayOffset = dayIndex === 0 ? -6 : 1 - dayIndex
  const monday = new Date(now)
  monday.setDate(now.getDate() + mondayOffset)
  monday.setHours(0, 0, 0, 0)

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

export function DaySelector({
  activeCycle,
  selectedDay,
  onSelectDay,
}: DaySelectorProps) {
  const weekDates = getWeekDates()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayDow =
    today.getDay() === 0 ? 7 : today.getDay()

  const cycleDayMap = new Map(
    activeCycle.cycle_days.map((cd) => [cd.day_of_week, cd])
  )

  return (
    <div className="flex gap-2 mb-10 overflow-x-auto hide-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
      {weekDates.map((date, i) => {
        const dow = i + 1
        const cycleDay = cycleDayMap.get(dow)
        const isSelected = dow === selectedDay
        const isToday = dow === todayDow
        const isRest = cycleDay?.is_rest ?? true
        const hasWorkout = !!cycleDay?.workout_id
        const isRunning = cycleDay?.is_running ?? false

        const icon = (() => {
          if (hasWorkout && isRunning) return 'exercise'
          if (hasWorkout) return 'bolt'
          if (isRunning) return 'directions_run'
          return null
        })()

        return (
          <button
            key={dow}
            onClick={() => onSelectDay(dow)}
            className={`
              flex-1 min-w-[72px] h-24 rounded-xl flex flex-col items-center justify-center gap-1
              transition-all
              ${
                isSelected
                  ? 'bg-primary-container shadow-[0_10px_20px_-10px_rgba(207,252,0,0.3)]'
                  : 'bg-surface-container-low border border-transparent hover:border-primary-container/30'
              }
              ${!isSelected && isRest && !hasWorkout && !isRunning ? 'opacity-50' : ''}
            `}
          >
            <span
              className={`text-[10px] font-bold uppercase tracking-widest ${
                isSelected
                  ? 'text-on-primary-container font-black'
                  : 'text-on-surface-variant'
              }`}
            >
              {DAY_LABELS[i]}
            </span>
            <span
              className={`text-xl font-headline font-extrabold ${
                isSelected ? 'text-on-primary-container' : ''
              }`}
            >
              {date.getDate()}
            </span>
            {isSelected && isToday ? (
              <div className="w-1 h-1 bg-on-primary-container rounded-full mt-0.5" />
            ) : isToday && !isSelected ? (
              <div className="w-1 h-1 bg-primary rounded-full mt-0.5" />
            ) : icon ? (
              <span
                className={`material-symbols-outlined text-[14px] ${
                  isSelected
                    ? 'text-on-primary-container'
                    : hasWorkout
                      ? 'text-primary'
                      : 'text-on-surface-variant'
                }`}
              >
                {icon}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

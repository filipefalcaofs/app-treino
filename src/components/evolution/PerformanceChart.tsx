interface DataPoint {
  date: string
  value: number
}

interface PerformanceChartProps {
  data: DataPoint[]
  unit?: string
  label?: string
}

function formatMonth(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
}

function calcPercentChange(data: DataPoint[]): number | null {
  if (data.length < 2) return null

  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const thisMonth = data.filter(d => {
    const dt = new Date(d.date + 'T00:00:00')
    return dt.getMonth() === currentMonth && dt.getFullYear() === currentYear
  })

  const lastMonth = data.filter(d => {
    const dt = new Date(d.date + 'T00:00:00')
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear
    return dt.getMonth() === prevMonth && dt.getFullYear() === prevYear
  })

  if (thisMonth.length === 0 || lastMonth.length === 0) return null

  const avgThis = thisMonth.reduce((s, d) => s + d.value, 0) / thisMonth.length
  const avgLast = lastMonth.reduce((s, d) => s + d.value, 0) / lastMonth.length

  if (avgLast === 0) return null
  return Math.round(((avgThis - avgLast) / avgLast) * 100)
}

export function PerformanceChart({ data, unit = 'kg', label }: PerformanceChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-surface-container-lowest/50 rounded-lg border border-outline-variant/10 h-64 flex items-center justify-center">
        <p className="text-on-surface-variant text-sm">
          Sem dados para exibir o grafico
        </p>
      </div>
    )
  }

  const values = data.map(d => d.value)
  const minVal = Math.min(...values)
  const maxVal = Math.max(...values)
  const range = maxVal - minVal || 1

  const padding = { top: 30, right: 20, bottom: 40, left: 10 }
  const chartW = 600
  const chartH = 256
  const innerW = chartW - padding.left - padding.right
  const innerH = chartH - padding.top - padding.bottom

  const points = data.map((d, i) => ({
    x: padding.left + (i / Math.max(data.length - 1, 1)) * innerW,
    y: padding.top + innerH - ((d.value - minVal) / range) * innerH,
    date: d.date,
    value: d.value,
  }))

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + innerH} L ${points[0].x} ${padding.top + innerH} Z`

  const monthLabels: { x: number; label: string }[] = []
  const seen = new Set<string>()
  for (const p of points) {
    const m = formatMonth(p.date)
    if (!seen.has(m)) {
      seen.add(m)
      monthLabels.push({ x: p.x, label: m })
    }
  }

  const pctChange = calcPercentChange(data)

  return (
    <div className="bg-surface-container-lowest/50 rounded-lg border border-outline-variant/10 p-4 relative">
      {label && (
        <p className="text-xs text-on-surface-variant font-medium mb-2">{label}</p>
      )}

      {pctChange !== null && (
        <div className="absolute top-4 right-4 z-10">
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
            pctChange >= 0
              ? 'bg-primary-container/20 text-primary'
              : 'bg-error/20 text-error'
          }`}>
            {pctChange >= 0 ? '+' : ''}{pctChange}% este mes
          </span>
        </div>
      )}

      <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-64" preserveAspectRatio="none">
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#cffc00" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#cffc00" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path d={areaPath} fill="url(#areaGradient)" />
        <path d={linePath} fill="none" stroke="#cffc00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill="#0e0e0e" stroke="#cffc00" strokeWidth="2" />
        ))}

        {monthLabels.map((m, i) => (
          <text
            key={i}
            x={m.x}
            y={chartH - 8}
            textAnchor="middle"
            className="fill-on-surface-variant"
            style={{ fontSize: '10px' }}
          >
            {m.label}
          </text>
        ))}
      </svg>

      {unit && (
        <p className="text-[10px] text-on-surface-variant text-right mt-1">
          Valores em {unit}
        </p>
      )}
    </div>
  )
}

'use client'
import { useEffect, useRef, useState } from 'react'

interface StatDay {
  date: string
  signups: number
  purchases: number
  revenue: number
}

export default function AdminChart({ stats }: { stats: StatDay[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [metric, setMetric] = useState<'signups' | 'purchases' | 'revenue'>('signups')
  const [chartLoaded, setChartLoaded] = useState(false)
  const chartRef = useRef<any>(null)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js'
    script.onload = () => setChartLoaded(true)
    document.head.appendChild(script)
    return () => { document.head.removeChild(script) }
  }, [])

  useEffect(() => {
    if (!chartLoaded || !canvasRef.current || !stats.length) return
    const Chart = (window as any).Chart
    if (chartRef.current) { chartRef.current.destroy() }

    const labels = stats.map(d => {
      const date = new Date(d.date)
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    })
    const data = stats.map(d => d[metric])
    const colors = { signups: '#f59e0b', purchases: '#10b981', revenue: '#f59e0b' }
    const color = colors[metric]

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: metric.charAt(0).toUpperCase() + metric.slice(1),
          data,
          backgroundColor: color + '40',
          borderColor: color,
          borderWidth: 1.5,
          borderRadius: 4,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx: any) => metric === 'revenue' ? `$${ctx.raw.toLocaleString()}` : String(ctx.raw)
            }
          }
        },
        scales: {
          x: {
            ticks: { color: '#78716c', font: { size: 11 }, maxRotation: 45, autoSkip: stats.length > 30 },
            grid: { color: '#292524' }
          },
          y: {
            ticks: {
              color: '#78716c', font: { size: 11 },
              callback: (v: any) => metric === 'revenue' ? '$' + v.toLocaleString() : v
            },
            grid: { color: '#292524' },
            beginAtZero: true
          }
        }
      }
    })
  }, [chartLoaded, stats, metric])

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {(['signups', 'purchases', 'revenue'] as const).map(m => (
          <button key={m} onClick={() => setMetric(m)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium capitalize transition-colors ${metric === m ? 'border-amber-700 bg-amber-900/20 text-amber-400' : 'border-stone-700 text-stone-500 hover:border-stone-500'}`}>
            {m}
          </button>
        ))}
      </div>
      <div style={{ position: 'relative', height: '240px' }}>
        <canvas ref={canvasRef} role="img" aria-label={`${metric} over time chart`} />
      </div>
    </div>
  )
}

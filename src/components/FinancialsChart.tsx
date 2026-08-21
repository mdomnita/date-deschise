import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { CompanyFinancialYear } from '../types/firme'

interface ChartSeriesDef {
  key: 'cifra' | 'profit'
  label: string
  color: string
  match: string[]
}

const CHART_SERIES: ChartSeriesDef[] = [
  { key: 'cifra', label: 'Cifra de afaceri netă', color: '#2a78d6', match: ['cifra_afaceri', 'Cifra de afaceri neta'] },
  { key: 'profit', label: 'Profit net', color: '#eb6834', match: ['profit_net', 'Profit net'] },
]

function resolveValue(values: Record<string, number | null>, candidates: string[]): number | null {
  for (const key of candidates) {
    if (key in values) return values[key]
  }
  return null
}

function formatCompact(value: number): string {
  return new Intl.NumberFormat('ro-RO', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}

function formatFull(value: number): string {
  return `${value.toLocaleString('ro-RO')} lei`
}

interface FinancialsChartProps {
  years: CompanyFinancialYear[]
}

export function FinancialsChart({ years }: FinancialsChartProps) {
  const data = [...years]
    .sort((a, b) => a.an - b.an)
    .map(y => ({
      an: y.an,
      cifra: resolveValue(y.values, CHART_SERIES[0].match),
      profit: resolveValue(y.values, CHART_SERIES[1].match),
    }))

  const hasAnyValue = data.some(d => d.cifra != null || d.profit != null)

  return (
    <section id="financiar-chart" className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
        Evoluție cifră de afaceri și profit net
      </h2>
      {!hasAnyValue ? (
        <p className="py-10 text-center text-sm text-gray-400">
          Nu există date financiare pentru intervalul selectat.
        </p>
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis
                dataKey="an"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                width={56}
                tickFormatter={formatCompact}
              />
              <Tooltip
                formatter={(value: unknown, name: unknown) => [
                  value == null ? '—' : formatFull(Number(value)),
                  name === 'cifra' ? CHART_SERIES[0].label : CHART_SERIES[1].label,
                ]}
                labelFormatter={label => `Exercițiu financiar ${label}`}
                contentStyle={{ borderRadius: 12, border: '1px solid #f3f4f6', fontSize: 12 }}
                cursor={{ fill: '#f3f4f6' }}
              />
              <Legend
                formatter={value => (value === 'cifra' ? CHART_SERIES[0].label : CHART_SERIES[1].label)}
                wrapperStyle={{ fontSize: 12 }}
              />
              <Bar dataKey="cifra" name="cifra" fill={CHART_SERIES[0].color} radius={[4, 4, 0, 0]} maxBarSize={24} />
              <Bar dataKey="profit" name="profit" fill={CHART_SERIES[1].color} radius={[4, 4, 0, 0]} maxBarSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  )
}

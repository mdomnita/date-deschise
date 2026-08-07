import { useState, useEffect, useRef } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { getValute, getValuteByData, getIstoricCurs } from '../services/schimbApi'
import type { ValutaInfo, CursIstoricPunct } from '../types/schimb'

const PRIMARY_CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF', 'CAD', 'AUD', 'JPY', 'HUF', 'PLN', 'MDL']

const TVA_PRESETS: { label: string; value: number }[] = [
  { label: '0%', value: 0 },
  { label: '11%', value: 11 },
  { label: '21%', value: 21 },
]

const CURRENCY_NAMES: Record<string, string> = {
    "AED": "Dirham Emiratele Arabe Unite",
    "AUD": "Dolar australian",
    "BGN": "Lev bulgăresc (istoric / inactiv)",
    "BRL": "Real brazilian",
    "CAD": "Dolar canadian",
    "CHF": "Franc elvețian",
    "CNY": "Yuan renminbi chinezesc",
    "CZK": "Coroană cehă",
    "DKK": "Coroană daneză",
    "EGP": "Liră egipteană",
    "EUR": "Euro",
    "GBP": "Liră sterlină",
    "HKD": "Dolar Hong Kong",
    "HRK": "Kuna croată",
    "HUF": "Forint maghiar",
    "IDR": "Rupie indoneziană",
    "ILS": "Shekel israelian nou",
    "INR": "Rupie indiană",
    "ISK": "Coroană islandeză",
    "JPY": "Yen japonez",
    "KRW": "Won sud-coreean",
    "MDL": "Leu moldovenesc",
    "MXN": "Peso mexican",
    "MYR": "Ringgit malaezian",
    "NOK": "Coroană norvegiană",
    "NZD": "Dolar neozeelandez",
    "PHP": "Peso filipinez",
    "PLN": "Zlot polonez",
    "RSD": "Dinar sârbesc",
    "RUB": "Rublă rusească",
    "SEK": "Coroană suedeză",
    "SGD": "Dolar Singapore",
    "SKK": "Coroană slovacă",
    "THB": "Baht thailandez",
    "TRY": "Liră turcească",
    "UAH": "Hryvnia ucraineană",
    "USD": "Dolar american",
    "XAU": "Aur",
    "XDR": "Drepturi speciale de tragere",
    "ZAR": "Rand sud-african",
}

const CURRENCY_REGIONS: Record<string, string> = {
  EUR: 'Europa', GBP: 'Europa', CHF: 'Europa', SEK: 'Europa',
  NOK: 'Europa', DKK: 'Europa', HUF: 'Europa', PLN: 'Europa',
  CZK: 'Europa', BGN: 'Europa', MDL: 'Europa', RUB: 'Europa',
  TRY: 'Europa', UAH: 'Europa', HRK: 'Europa',
  USD: 'America', CAD: 'America', MXN: 'America', BRL: 'America',
  JPY: 'Asia', CNY: 'Asia', HKD: 'Asia', KRW: 'Asia',
  INR: 'Asia', SGD: 'Asia', THB: 'Asia', MYR: 'Asia',
  AED: 'Asia', SAR: 'Asia', ILS: 'Asia',
  AUD: 'Pacific', NZD: 'Pacific',
  ZAR: 'Africa',
  XAU: 'Altele', XDR: 'Altele',
}

type SortKey = 'code' | 'rate'
type SortDir = 'asc' | 'desc'
type ConvertTrigger = { currency: string; seq: number } | null

function localToday(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function dateNDaysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  return `${d}.${m}.${y}`
}

function formatNum(n: number, decimals: number): string {
  return n.toLocaleString('ro-RO', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

function SwapIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 16V4m0 0L3 8m4-4 4 4" />
      <path d="M17 8v12m0 0 4-4m-4 4-4-4" />
    </svg>
  )
}

function ConvertorCard({
  valute,
  trigger,
  converterRef,
  onFromCurrencyChange,
}: {
  valute: ValutaInfo[]
  trigger: ConvertTrigger
  converterRef: React.RefObject<HTMLDivElement | null>
  onFromCurrencyChange: (currency: string) => void
}) {
  const [amount, setAmount] = useState('100')
  const [fromCurrency, setFromCurrency] = useState('EUR')
  const [toCurrency, setToCurrency] = useState('RON')
  const [tvaPreset, setTvaPreset] = useState(21)
  const [customTva, setCustomTva] = useState('')
  const [useCustomTva, setUseCustomTva] = useState(false)
  const [includesTva, setIncludesTva] = useState(false)
  const [decimals, setDecimals] = useState(2)

  useEffect(() => {
    if (trigger) {
      setFromCurrency(trigger.currency)
      setToCurrency('RON')
    }
  }, [trigger])

  useEffect(() => {
    onFromCurrencyChange(fromCurrency)
  }, [fromCurrency, onFromCurrencyChange])

  const allOptions = [{ valuta: 'RON', curs_unitar: 1, ultima_data: '' } as ValutaInfo, ...valute]
  
  if (!allOptions.some(v => v.valuta === 'BGN')) {
    const eur = valute.find(v => v.valuta === 'EUR')
    if (eur) {
      allOptions.push({
        valuta: 'BGN',
        curs_unitar: eur.curs_unitar / 1.95583,
        ultima_data: '2025-12-31'
      })
    }
  }

  function getRate(currency: string): number {
    if (currency === 'RON') return 1
    return allOptions.find(v => v.valuta === currency)?.curs_unitar ?? 0
  }

  function swap() {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
  }

  const amountNum = parseFloat(amount.replace(',', '.'))
  const fromRate = getRate(fromCurrency)
  const toRate = getRate(toCurrency)
  const convertedAmount =
    !isNaN(amountNum) && amountNum >= 0 && fromRate > 0 && toRate > 0
      ? (amountNum * fromRate) / toRate
      : null

  const effectiveTvaRate = useCustomTva
    ? parseFloat(customTva.replace(',', '.'))
    : tvaPreset
  const tvaApplies = !isNaN(effectiveTvaRate) && effectiveTvaRate > 0

  let baseAmount: number | null = null
  let tvaAmount: number | null = null
  let totalAmount: number | null = null

  if (convertedAmount !== null && tvaApplies) {
    if (includesTva) {
      baseAmount = convertedAmount / (1 + effectiveTvaRate / 100)
      tvaAmount = convertedAmount - baseAmount
    } else {
      baseAmount = convertedAmount
      tvaAmount = convertedAmount * (effectiveTvaRate / 100)
      totalAmount = convertedAmount + tvaAmount
    }
  }

  const fmt = (n: number) => formatNum(n, decimals)

  return (
    <div id="convertor-card" ref={converterRef} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h2 id="convertor-title" className="text-base font-semibold text-gray-800">Convertor valutar + TVA</h2>
        <div className="flex overflow-hidden rounded-lg border border-gray-200 text-xs">
          {([2, 4, 8] as const).map(d => (
            <button
              key={d}
              type="button"
              onClick={() => setDecimals(d)}
              className={`px-2.5 py-1 font-mono transition ${
                decimals === d ? 'bg-amber-500 text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {d === 8 ? '.∞' : `.${d}`}
            </button>
          ))}
        </div>
      </div>

      {/* Currency row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">Sumă</label>
          <input
            id="convertor-amount"
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          />
        </div>
        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">Din</label>
          <select
            id="convertor-from"
            value={fromCurrency}
            onChange={e => setFromCurrency(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          >
            {allOptions.map(v => (
              <option key={v.valuta} value={v.valuta}>
                {v.valuta}{CURRENCY_NAMES[v.valuta] ? ` — ${CURRENCY_NAMES[v.valuta]}` : ''}
              </option>
            ))}
          </select>
        </div>
        <button
          id="convertor-swap"
          type="button"
          onClick={swap}
          title="Inversează valutele"
          className="self-end rounded-xl border border-gray-200 bg-white p-2.5 text-gray-400 transition hover:bg-gray-50 hover:text-gray-700"
        >
          <SwapIcon />
        </button>
        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">În</label>
          <select
            id="convertor-to"
            value={toCurrency}
            onChange={e => setToCurrency(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          >
            {allOptions.map(v => (
              <option key={v.valuta} value={v.valuta}>
                {v.valuta}{CURRENCY_NAMES[v.valuta] ? ` — ${CURRENCY_NAMES[v.valuta]}` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {(fromCurrency === 'BGN' || toCurrency === 'BGN') && (
        <div className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-xs font-medium text-amber-800 flex items-start sm:items-center gap-3 border border-amber-100">
          <svg className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 sm:mt-0" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
          </svg>
          <span>Monedă scoasă din circulație la 01.01.2026. Conversia folosește cursul fix (1 EUR = 1.95583 BGN).</span>
        </div>
      )}

      {/* TVA row */}
      <div id="convertor-tva" className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">Cotă TVA</label>
          <div className="flex flex-wrap items-center gap-1.5">
            {TVA_PRESETS.map(r => (
              <button
                key={r.value}
                type="button"
                onClick={() => { setTvaPreset(r.value); setUseCustomTva(false) }}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  !useCustomTva && tvaPreset === r.value
                    ? 'bg-amber-500 text-white'
                    : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {r.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setUseCustomTva(true)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                useCustomTva
                  ? 'bg-amber-500 text-white'
                  : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              Altă cotă
            </button>
            {useCustomTva && (
              <input
                type="text"
                inputMode="decimal"
                value={customTva}
                onChange={e => setCustomTva(e.target.value)}
                placeholder="ex: 12"
                className="w-20 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs outline-none focus:border-amber-500"
              />
            )}
          </div>
        </div>
        <div className="shrink-0">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">Suma este</label>
          <div className="flex overflow-hidden rounded-xl border border-gray-200 text-xs">
            <button
              type="button"
              onClick={() => setIncludesTva(false)}
              className={`px-4 py-2 font-semibold transition ${
                !includesTva ? 'bg-amber-500 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              Fără TVA
            </button>
            <button
              type="button"
              onClick={() => setIncludesTva(true)}
              className={`px-4 py-2 font-semibold transition ${
                includesTva ? 'bg-amber-500 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              Cu TVA
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {convertedAmount !== null && (
        <div id="convertor-result" className="mt-5 space-y-3 rounded-xl bg-amber-50 p-4">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-amber-600">Conversie</p>
            <p className="text-lg font-bold text-gray-900">
              {fmt(amountNum)}{' '}
              <span title={CURRENCY_NAMES[fromCurrency]} className="cursor-help">{fromCurrency}</span>
              <span className="mx-2 text-base font-normal text-gray-400">=</span>
              {fmt(convertedAmount)}{' '}
              <span title={CURRENCY_NAMES[toCurrency]} className="cursor-help">{toCurrency}</span>
            </p>
          </div>

          {tvaAmount !== null && !includesTva && (
            <div className="space-y-1.5 border-t border-amber-100 pt-3">
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-gray-500">TVA {effectiveTvaRate}%</span>
                <span className="font-semibold text-amber-800">
                  + {fmt(tvaAmount)}{' '}
                  <span title={CURRENCY_NAMES[toCurrency]} className="cursor-help">{toCurrency}</span>
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-semibold text-gray-700">Total cu TVA</span>
                <span className="text-lg font-bold text-green-700">
                  {fmt(totalAmount!)}{' '}
                  <span title={CURRENCY_NAMES[toCurrency]} className="cursor-help">{toCurrency}</span>
                </span>
              </div>
            </div>
          )}

          {tvaAmount !== null && includesTva && (
            <div className="space-y-1.5 border-t border-amber-100 pt-3">
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-gray-500">Bază fără TVA</span>
                <span className="font-semibold text-gray-800">
                  {fmt(baseAmount!)}{' '}
                  <span title={CURRENCY_NAMES[toCurrency]} className="cursor-help">{toCurrency}</span>
                </span>
              </div>
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-gray-500">TVA inclus ({effectiveTvaRate}%)</span>
                <span className="font-semibold text-amber-800">
                  {fmt(tvaAmount)}{' '}
                  <span title={CURRENCY_NAMES[toCurrency]} className="cursor-help">{toCurrency}</span>
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {valute.length === 0 && (
        <p className="mt-4 text-xs text-gray-400">Se încarcă cursurile...</p>
      )}
    </div>
  )
}

const CHART_PERIODS: { label: string; days: number }[] = [
  { label: '7 zile', days: 7 },
  { label: '30 zile', days: 30 },
  { label: '90 zile', days: 90 },
  { label: '1 an', days: 365 },
]

function RatesChartSection({ valuta }: { valuta: string }) {
  const [periodDays, setPeriodDays] = useState(7)
  const [data, setData] = useState<CursIstoricPunct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    getIstoricCurs(valuta, dateNDaysAgo(periodDays), localToday())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => { setError('Nu s-a putut încărca evoluția cursului.'); setLoading(false) })
  }, [valuta, periodDays])

  const latest = data[data.length - 1]

  return (
    <div id="rates-chart" className="mb-10 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Evoluție curs</h2>
          <p className="mt-1 flex items-baseline gap-2">
            <span
              title={CURRENCY_NAMES[valuta]}
              className="cursor-help rounded-md bg-amber-50 px-2 py-0.5 font-mono text-xs font-bold text-amber-700"
            >
              {valuta}
            </span>
            {latest && (
              <span className="font-mono text-sm font-bold text-gray-900">
                {formatNum(latest.curs, 4)}
                <span className="ml-1 text-xs font-normal text-gray-400">RON</span>
              </span>
            )}
          </p>
        </div>
        <div className="flex overflow-hidden rounded-lg border border-gray-200 text-xs">
          {CHART_PERIODS.map(p => (
            <button
              key={p.days}
              type="button"
              onClick={() => setPeriodDays(p.days)}
              className={`px-2.5 py-1 font-medium transition ${
                periodDays === p.days ? 'bg-amber-500 text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {!error && loading && <div className="h-64 animate-pulse rounded-xl bg-gray-100" />}

      {!error && !loading && data.length === 0 && (
        <p className="py-10 text-center text-sm text-gray-400">Nu există date pentru perioada selectată.</p>
      )}

      {!error && !loading && data.length > 0 && (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="cursGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis
                dataKey="data"
                tickFormatter={formatDate}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={false}
                minTickGap={40}
              />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                width={56}
                tickFormatter={v => formatNum(v, 2)}
              />
              <Tooltip
                formatter={(value: unknown) => [`${formatNum(Number(Array.isArray(value) ? value[0] : value), 4)} RON`, valuta]}
                labelFormatter={label => formatDate(label as string)}
                contentStyle={{ borderRadius: 12, border: '1px solid #f3f4f6', fontSize: 12 }}
              />
              <Area
                type="monotone"
                dataKey="curs"
                stroke="#f59e0b"
                strokeWidth={2}
                fill="url(#cursGradient)"
                dot={false}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

function PrimaryRatesGrid({
  valute,
  loading,
  onConvert,
  tableRef,
}: {
  valute: ValutaInfo[]
  loading: boolean
  onConvert: (v: string) => void
  tableRef: React.RefObject<HTMLDivElement | null>
}) {
  const primaryValute = PRIMARY_CURRENCIES
    .map(code => valute.find(v => v.valuta === code))
    .filter((v): v is ValutaInfo => v !== undefined)

  return (
    <div id="rates-grid">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Cursuri principale</h2>
      {loading ? (
        <div className="grid grid-cols-2 gap-2.5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2.5">
            {primaryValute.map(v => (
              <button
                key={v.valuta}
                type="button"
                onClick={() => onConvert(v.valuta)}
                className="rounded-xl border border-gray-100 bg-white p-3 text-left shadow-sm transition hover:border-amber-200 hover:shadow-md"
              >
                <div className="mb-1.5 flex items-center justify-between">
                  <span
                    title={CURRENCY_NAMES[v.valuta]}
                    className="cursor-help rounded-md bg-amber-50 px-2 py-0.5 font-mono text-xs font-bold text-amber-700"
                  >
                    {v.valuta}
                  </span>
                  <span className="text-xs text-gray-400">{formatDate(v.ultima_data)}</span>
                </div>
                <p className="text-sm font-bold text-gray-900">
                  {formatNum(v.curs_unitar, 4)}
                  <span className="ml-1 text-xs font-normal text-gray-400">RON</span>
                </p>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="mt-3 w-full rounded-xl border border-gray-100 bg-white py-2.5 text-xs font-medium text-gray-500 transition hover:bg-gray-50"
          >
            Vezi toate valutele ↓
          </button>
        </>
      )}
    </div>
  )
}

function SortIndicator({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span className={`ml-1 ${active ? 'text-amber-500' : 'text-gray-300'}`}>
      {active ? (dir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  )
}

function FullRatesTable({
  valute,
  loading,
  onConvert,
}: {
  valute: ValutaInfo[]
  loading: boolean
  onConvert: (v: string) => void
}) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('code')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [region, setRegion] = useState('Toate')

  const regions = ['Toate', 'Europa', 'America', 'Asia', 'Pacific', 'Africa', 'Altele']

  function getRegion(currency: string): string {
    return CURRENCY_REGIONS[currency] ?? 'Altele'
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const filtered = valute
    .filter(v => {
      if (search && !v.valuta.toUpperCase().includes(search.toUpperCase())) return false
      if (region !== 'Toate' && getRegion(v.valuta) !== region) return false
      return true
    })
    .sort((a, b) => {
      const cmp =
        sortKey === 'code'
          ? a.valuta.localeCompare(b.valuta)
          : a.curs_unitar - b.curs_unitar
      return sortDir === 'asc' ? cmp : -cmp
    })

  return (
    <div id="rates-table">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Toate valutele</h2>
        <div className="flex flex-wrap gap-2">
          <input
            id="rates-search"
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Caută valută..."
            className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          />
          <select
            id="rates-region"
            value={region}
            onChange={e => setRegion(e.target.value)}
            className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          >
            {regions.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-xs">
                <th className="px-4 py-3 text-left">
                  <button
                    type="button"
                    onClick={() => toggleSort('code')}
                    className="font-semibold uppercase tracking-wider text-gray-400 hover:text-gray-700"
                  >
                    Valută
                    <SortIndicator active={sortKey === 'code'} dir={sortDir} />
                  </button>
                </th>
                <th className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => toggleSort('rate')}
                    className="font-semibold uppercase tracking-wider text-gray-400 hover:text-gray-700"
                  >
                    Curs BNR
                    <SortIndicator active={sortKey === 'rate'} dir={sortDir} />
                  </button>
                </th>
                <th className="hidden px-4 py-3 text-left font-semibold uppercase tracking-wider text-gray-400 sm:table-cell">
                  Data
                </th>
                <th className="hidden px-4 py-3 text-left font-semibold uppercase tracking-wider text-gray-400 sm:table-cell">
                  Regiune
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(v => (
                <tr key={v.valuta} className="bg-white transition hover:bg-amber-50/30">
                  <td className="px-4 py-2.5">
                    <span
                      title={CURRENCY_NAMES[v.valuta]}
                      className="cursor-help rounded-md bg-amber-50 px-2 py-0.5 font-mono text-xs font-bold text-amber-700"
                    >
                      {v.valuta}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono font-semibold text-gray-900">
                    {formatNum(v.curs_unitar, 4)}
                    <span className="ml-1 text-xs font-normal text-gray-400">RON</span>
                  </td>
                  <td className="hidden px-4 py-2.5 text-sm text-gray-500 sm:table-cell">
                    {formatDate(v.ultima_data)}
                  </td>
                  <td className="hidden px-4 py-2.5 text-sm text-gray-400 sm:table-cell">
                    {getRegion(v.valuta)}
                  </td>
                  <td className="px-4 py-2.5">
                    <button
                      type="button"
                      onClick={() => onConvert(v.valuta)}
                      className="text-xs font-medium text-amber-600 transition hover:text-amber-800"
                    >
                      Convertire →
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">
                    Nicio valută găsită.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {!loading && filtered.length > 0 && (
        <p className="mt-2 text-xs text-gray-400">{filtered.length} valute afișate</p>
      )}
    </div>
  )
}

export function SchimbPage() {
  const [allValute, setAllValute] = useState<ValutaInfo[]>([])
  const [selectedDate, setSelectedDate] = useState(localToday())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [convertTrigger, setConvertTrigger] = useState<ConvertTrigger>(null)
  const [chartCurrency, setChartCurrency] = useState('EUR')

  const converterRef = useRef<HTMLDivElement>(null)
  const tableRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getValute()
      .then(data => { setAllValute(data); setLoading(false) })
      .catch(() => { setError('Nu s-au putut încărca cursurile valutare.'); setLoading(false) })
  }, [])

  function handleRefresh() {
    setLoading(true)
    setError(null)
    const request = selectedDate === localToday() ? getValute() : getValuteByData(selectedDate)
    request
      .then(data => { setAllValute(data); setLoading(false) })
      .catch(() => { setError('Nu s-au putut încărca cursurile valutare.'); setLoading(false) })
  }

  function handleConvert(currency: string) {
    setConvertTrigger(prev => ({ currency, seq: (prev?.seq ?? 0) + 1 }))
    converterRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  const lastUpdate = allValute[0]?.ultima_data

  return (
    <main id="schimb-page" className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div id="schimb-header" className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 id="schimb-title" className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Curs valutar BNR și convertor TVA
          </h1>
          <p id="schimb-subtitle" className="mt-1.5 text-gray-500">
            Cursuri oficiale BNR pentru {formatDate(selectedDate) || selectedDate}.
            Conversie valutară și calcul TVA într-un singur formular.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:shrink-0 sm:items-end">
          <div className="flex gap-2">
            <input
              id="schimb-date"
              type="date"
              value={selectedDate}
              max={localToday()}
              onChange={e => setSelectedDate(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
            <button
              id="schimb-refresh"
              type="button"
              onClick={handleRefresh}
              disabled={loading}
              className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:opacity-40"
            >
              Actualizează
            </button>
          </div>
          {lastUpdate && (
            <p className="text-xs text-gray-400">Ultima actualizare: {formatDate(lastUpdate)}</p>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div id="schimb-error" className="mb-6 rounded-xl border border-red-100 bg-red-50 px-6 py-4 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {/* Main 2-col layout */}
      <div id="schimb-layout" className="mb-10 grid gap-6 lg:grid-cols-[1fr_300px]">
        <ConvertorCard
          valute={allValute}
          trigger={convertTrigger}
          converterRef={converterRef}
          onFromCurrencyChange={setChartCurrency}
        />
        <PrimaryRatesGrid
          valute={allValute}
          loading={loading}
          onConvert={handleConvert}
          tableRef={tableRef}
        />
      </div>

      <RatesChartSection valuta={chartCurrency} />

      {/* Full rates table */}
      <div ref={tableRef}>
        <FullRatesTable valute={allValute} loading={loading} onConvert={handleConvert} />
      </div>
    </main>
  )
}

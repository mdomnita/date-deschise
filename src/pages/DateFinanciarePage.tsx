import { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getCompanyFinancials } from '../services/firmeApi'
import { FinancialsChart } from '../components/FinancialsChart'
import { FINANCIAL_FIELD_LABELS } from '../types/firme'
import type { CompanyFinancialsData, CompanyFinancialYear } from '../types/firme'

const CURRENT_YEAR = new Date().getFullYear()
const DEFAULT_AN_START = String(CURRENT_YEAR - 4)
const DEFAULT_AN_END = String(CURRENT_YEAR)

function formatValue(value: number): string {
  return value.toLocaleString('ro-RO')
}

function FinancialYearSection({ an, sursa, caen, values, fields }: CompanyFinancialYear & { fields: string[] }) {
  const entries = fields
    .filter(field => values[field] != null)
    .map(field => [field, values[field] as number] as const)

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
          Exercițiu financiar {an}
        </h2>
        <span className="rounded-md bg-gray-50 px-2 py-1 text-xs text-gray-400">
          {sursa === 'anaf_live' ? 'Sursă: ANAF (live)' : 'Sursă: date stocate'}
        </span>
      </div>
      {caen && <p className="mb-3 text-xs text-gray-400">CAEN {caen}</p>}
      <dl className="space-y-2.5">
        {entries.map(([field, value]) => (
          <div key={field} className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
            <dt className="min-w-0 flex-1 text-sm text-gray-500">{FINANCIAL_FIELD_LABELS[field] ?? field}</dt>
            <dd className="shrink-0 font-mono text-sm font-semibold text-gray-900">
              {formatValue(value)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

export function DateFinanciarePage() {
  const [searchParams] = useSearchParams()
  const initialCui = searchParams.get('cui') ?? ''

  const [cui, setCui] = useState(initialCui)
  const [anStart, setAnStart] = useState(DEFAULT_AN_START)
  const [anEnd, setAnEnd] = useState(DEFAULT_AN_END)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<CompanyFinancialsData | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  async function fetchFinancials(cuiValue: string, anStartValue: string, anEndValue: string) {
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const start = parseInt(anStartValue.trim(), 10)
      const end = parseInt(anEndValue.trim(), 10)
      const data = await getCompanyFinancials(cuiValue, {
        anStart: Number.isFinite(start) ? start : undefined,
        anEnd: Number.isFinite(end) ? end : undefined,
      })
      setResult(data)
    } catch {
      setError('Nu s-au putut obține datele financiare. Verifică CUI-ul și încearcă din nou.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialCui) {
      void fetchFinancials(initialCui, anStart, anEnd)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const cuiTrimmed = cui.trim()
    if (!cuiTrimmed) return
    void fetchFinancials(cuiTrimmed, anStart, anEnd)
  }

  return (
    <main id="date-financiare-page" className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Date Financiare Firme</h1>
        <p className="mt-1.5 text-sm text-gray-500">
          Indicatori financiari din bilanțurile depuse la ANAF, după CUI.
        </p>
      </div>

      <form id="date-financiare-form" onSubmit={handleSubmit} className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="df-cui" className="mb-1.5 block text-sm font-medium text-gray-700">
              CUI
            </label>
            <input
              id="df-cui"
              type="text"
              inputMode="numeric"
              value={cui}
              onChange={(e) => setCui(e.target.value)}
              placeholder="ex: 14942091"
              className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none ring-inset focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
              required
            />
          </div>
          <div className="w-24">
            <label htmlFor="df-an-start" className="mb-1.5 block text-sm font-medium text-gray-700">
              De la an
            </label>
            <input
              id="df-an-start"
              type="text"
              inputMode="numeric"
              value={anStart}
              onChange={(e) => setAnStart(e.target.value)}
              placeholder={DEFAULT_AN_START}
              className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none ring-inset focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
            />
          </div>
          <div className="w-24">
            <label htmlFor="df-an-end" className="mb-1.5 block text-sm font-medium text-gray-700">
              Până la an
            </label>
            <input
              id="df-an-end"
              type="text"
              inputMode="numeric"
              value={anEnd}
              onChange={(e) => setAnEnd(e.target.value)}
              placeholder={DEFAULT_AN_END}
              className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none ring-inset focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
            />
          </div>
          <button
            id="df-submit"
            type="submit"
            disabled={loading || !cui.trim()}
            className="inline-flex h-[42px] items-center justify-center gap-2 rounded-lg bg-teal-600 px-5 text-sm font-medium text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : null}
            Caută
          </button>
        </div>
      </form>

      {error && (
        <div id="df-error" className="mb-6 rounded-xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div id="df-result" className="space-y-5">
          <div id="df-result-header" className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <span className="mb-3 inline-block rounded-lg bg-teal-50 px-3 py-1.5 font-mono text-sm font-semibold text-teal-700">
              CUI {result.cui}
            </span>
            <h2 className="text-xl font-bold text-gray-900">{result.name}</h2>
            {result.warning && (
              <p className="mt-3 rounded-lg bg-amber-50 px-4 py-2.5 text-sm text-amber-700">
                {result.warning}
              </p>
            )}
          </div>

          <FinancialsChart years={result.years} />

          {result.years.map((yr) => (
            <FinancialYearSection key={yr.an} {...yr} fields={result.fields} />
          ))}
        </div>
      )}
    </main>
  )
}

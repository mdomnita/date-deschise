import { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getBilant } from '../services/firmeApi'
import type { BilantResponse } from '../types/firme'

function formatValue(value: number): string {
  return value.toLocaleString('ro-RO')
}

function BilantYearSection({ year, indicators }: { year: number; indicators: { label: string; value: number }[] }) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
        Exercițiu financiar {year}
      </h2>
      <dl className="space-y-2.5">
        {indicators.map((ind) => (
          <div key={ind.label} className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
            <dt className="min-w-0 flex-1 text-sm text-gray-500">{ind.label}</dt>
            <dd className="shrink-0 font-mono text-sm font-semibold text-gray-900">
              {formatValue(ind.value)}
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
  const [an, setAn] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<BilantResponse | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  async function fetchBilant(cuiValue: string, anValue: string) {
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const ani = anValue.trim() ? [parseInt(anValue.trim(), 10)] : undefined
      const data = await getBilant(cuiValue, ani)
      setResult(data)
    } catch {
      setError('Nu s-au putut obține datele financiare. Verifică CUI-ul și încearcă din nou.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialCui) {
      void fetchBilant(initialCui, '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const cuiTrimmed = cui.trim()
    if (!cuiTrimmed) return
    void fetchBilant(cuiTrimmed, an)
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
          <div className="w-32">
            <label htmlFor="df-an" className="mb-1.5 block text-sm font-medium text-gray-700">
              An (opțional)
            </label>
            <input
              id="df-an"
              type="text"
              inputMode="numeric"
              value={an}
              onChange={(e) => setAn(e.target.value)}
              placeholder="ex: 2023"
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
            {result.caen_label && (
              <p className="mt-1 text-sm text-gray-500">
                CAEN {result.caen_code} — {result.caen_label}
              </p>
            )}
            {result.warning && (
              <p className="mt-3 rounded-lg bg-amber-50 px-4 py-2.5 text-sm text-amber-700">
                {result.warning}
              </p>
            )}
          </div>

          {result.years.map((yr) => (
            <BilantYearSection key={yr.year} year={yr.year} indicators={yr.indicators} />
          ))}
        </div>
      )}
    </main>
  )
}

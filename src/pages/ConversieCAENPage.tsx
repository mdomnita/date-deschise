import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getCAENv2ByCode, getCAENv3Predecesori } from '../services/caenApi'
import type { CAENv2Detail, CAENv3Predecesori } from '../types/caen'

type Versiune = 'v2' | 'v3'

const TIP_LABELS: Record<string, string> = {
  NESCHIMBAT: 'Cod păstrat',
  RECODIFICARE: 'Cod renumerotat',
  AGREGARE: 'Mai multe coduri reunite',
  MIXT: 'Necesită verificarea activității',
}

function tipLabel(tip: string): string {
  const label = TIP_LABELS[tip]
  if (label) return label
  return `Necesită verificarea activității (tip: ${tip})`
}

function normalizeCod(raw: string): string {
  return raw.trim()
}

function isValidCod(cod: string): boolean {
  return /^\d{4}$/.test(cod)
}

interface DestinationItem {
  cod: string | null
  denumire: string | null
  revizuire: Versiune
  tip_corespondenta: string
}

function VersiuneBadge({ revizuire }: { revizuire: Versiune }) {
  return (
    <span className="rounded-lg bg-blue-50 px-2.5 py-1 font-mono text-xs font-bold text-blue-700">
      CAEN Rev. {revizuire === 'v2' ? '2' : '3'}
    </span>
  )
}

function DestinationCard({ item }: { item: DestinationItem }) {
  if (!item.cod || !item.denumire) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <VersiuneBadge revizuire={item.revizuire} />
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
            {tipLabel(item.tip_corespondenta)}
          </span>
        </div>
        <p className="text-sm text-gray-500">Fără cod corespondent direct.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <VersiuneBadge revizuire={item.revizuire} />
        <span className="font-mono text-sm font-semibold text-gray-900">{item.cod}</span>
        <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
          {tipLabel(item.tip_corespondenta)}
        </span>
      </div>
      <p className="mb-3 text-sm text-gray-700">{item.denumire}</p>
      <a
        href={`/caen?q=${encodeURIComponent(item.cod)}`}
        className="text-xs font-medium text-blue-600 underline underline-offset-2 hover:text-blue-800"
      >
        Vezi în căutarea CAEN →
      </a>
    </div>
  )
}

export function ConversieCAENPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialCod = searchParams.get('cod') ?? ''
  const initialVersiune: Versiune = searchParams.get('versiune') === 'v3' ? 'v3' : 'v2'

  const [cod, setCod] = useState(initialCod)
  const [versiune, setVersiune] = useState<Versiune>(initialVersiune)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [result, setResult] = useState<CAENv2Detail | CAENv3Predecesori | null>(null)
  const [resultVersiune, setResultVersiune] = useState<Versiune>('v2')
  const abortRef = useRef<AbortController | null>(null)

  async function runConversion(codValue: string, versiuneValue: Versiune) {
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    setLoading(true)
    setError(null)
    setNotFound(false)
    setResult(null)

    try {
      const data =
        versiuneValue === 'v2'
          ? await getCAENv2ByCode(codValue)
          : await getCAENv3Predecesori(codValue)
      setResult(data)
      setResultVersiune(versiuneValue)
    } catch (err) {
      if (err instanceof Error && err.message === 'HTTP 404') {
        setNotFound(true)
        setResultVersiune(versiuneValue)
      } else {
        setError('Nu s-au putut obține datele de corespondență. Încearcă din nou.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const trimmed = normalizeCod(initialCod)
    if (trimmed && isValidCod(trimmed)) {
      void runConversion(trimmed, initialVersiune)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = normalizeCod(cod)
    if (!isValidCod(trimmed)) {
      setValidationError('Codul CAEN trebuie să conțină exact 4 cifre.')
      return
    }
    setValidationError(null)
    setCod(trimmed)
    setSearchParams({ cod: trimmed, versiune })
    void runConversion(trimmed, versiune)
  }

  const destinationItems: DestinationItem[] =
    result && resultVersiune === 'v2'
      ? (result as CAENv2Detail).corespondente.map((c) => ({
          cod: c.cod_v3,
          denumire: c.denumire_v3,
          revizuire: 'v3' as const,
          tip_corespondenta: c.tip_corespondenta,
        }))
      : result && resultVersiune === 'v3'
        ? (result as CAENv3Predecesori).predecesori.map((p) => ({
            cod: p.cod_v2,
            denumire: p.denumire_v2,
            revizuire: 'v2' as const,
            tip_corespondenta: p.tip_corespondenta,
          }))
        : []

  const showNotFoundState = notFound || (result !== null && destinationItems.length === 0)

  return (
    <main id="conversie-caen-page" className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div id="conversie-caen-header" className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Conversie coduri CAEN Rev. 2 – Rev. 3
        </h1>
        <p className="mt-1.5 text-sm text-gray-500">
          Convertește un cod CAEN între clasificarea Rev. 2 și clasificarea Rev. 3, în oricare
          dintre cele două direcții.
        </p>
      </div>

      <form
        id="conversie-caen-form"
        onSubmit={handleSubmit}
        className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="conversie-caen-cod" className="mb-1.5 block text-sm font-medium text-gray-700">
              Cod CAEN
            </label>
            <input
              id="conversie-caen-cod"
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={cod}
              onChange={(e) => {
                setCod(e.target.value)
                if (validationError) setValidationError(null)
              }}
              placeholder="ex: 6201"
              className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none ring-inset focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              required
            />
          </div>

          <div className="sm:w-64">
            <label htmlFor="conversie-caen-versiune" className="mb-1.5 block text-sm font-medium text-gray-700">
              Direcție conversie
            </label>
            <select
              id="conversie-caen-versiune"
              value={versiune}
              onChange={(e) => setVersiune(e.target.value === 'v3' ? 'v3' : 'v2')}
              className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 outline-none ring-inset focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              <option value="v2">CAEN Rev. 2 → Rev. 3</option>
              <option value="v3">CAEN Rev. 3 → Rev. 2</option>
            </select>
          </div>

          <button
            id="conversie-caen-submit"
            type="submit"
            disabled={loading}
            className="inline-flex h-[42px] items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : null}
            Convertește
          </button>
        </div>

        {validationError && (
          <p id="conversie-caen-validation" className="mt-3 text-sm text-red-600">
            {validationError}
          </p>
        )}
      </form>

      {error && (
        <div id="conversie-caen-error" className="mb-6 rounded-xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {showNotFoundState && (
        <div id="conversie-caen-not-found" className="mb-6 rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm text-gray-600">
          Nu a fost găsită o corespondență.
        </div>
      )}

      {result && !showNotFoundState && (
        <div id="conversie-caen-result" className="space-y-5">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <VersiuneBadge revizuire={resultVersiune} />
              <span className="font-mono text-sm font-semibold text-gray-900">{result.cod}</span>
            </div>
            <h2 className="text-lg font-bold text-gray-900">{result.denumire}</h2>
          </div>

          {destinationItems.length === 1 && (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
              Corespondență directă.
            </div>
          )}

          {destinationItems.length > 1 && resultVersiune === 'v2' && (
            <div className="rounded-xl border border-amber-100 bg-amber-50 px-5 py-4 text-sm text-amber-700">
              Acest cod CAEN Rev. 2 a fost împărțit în mai multe clase CAEN Rev. 3. Codul corect
              trebuie ales în funcție de activitatea desfășurată efectiv.
            </div>
          )}

          {destinationItems.length > 1 && resultVersiune === 'v3' && (
            <div className="rounded-xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-blue-700">
              Mai multe coduri reunite: acest cod CAEN Rev. 3 corespunde mai multor coduri CAEN
              Rev. 2.
            </div>
          )}

          <div id="conversie-caen-destinations" className="space-y-3">
            {destinationItems.map((item, idx) => (
              <DestinationCard key={`${item.cod ?? 'null'}-${idx}`} item={item} />
            ))}
          </div>
        </div>
      )}
    </main>
  )
}

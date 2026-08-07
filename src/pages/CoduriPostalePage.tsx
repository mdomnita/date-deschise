import { useState } from 'react'
import { cautaCoduriPostale, getCodPostal, rezolvaAdresa } from '../services/postalApi'
import type { AdresaCandidate, CautareCoduriPostaleParams, CodPostalEntry } from '../types/postal'

type Mod = 'adresa' | 'componente' | 'cod'

const TABS: { id: Mod; label: string }[] = [
  { id: 'adresa', label: 'Căutare după adresă' },
  { id: 'componente', label: 'Căutare după componente' },
  { id: 'cod', label: 'Verificare cod poștal' },
]

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
      {message}
    </div>
  )
}

function EmptyBox({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 px-6 py-10 text-center text-sm text-gray-500">
      {message}
    </div>
  )
}

function numarRangeLabel(entry: CodPostalEntry): string | null {
  if (entry.numar_min == null) return null
  if (entry.numar_open_ended) return `${entry.numar_min}+`
  if (entry.numar_max != null && entry.numar_max !== entry.numar_min) {
    return `${entry.numar_min}–${entry.numar_max}`
  }
  return String(entry.numar_min)
}

function CodPostalCard({ entry }: { entry: CodPostalEntry }) {
  const numarLabel = numarRangeLabel(entry)
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-gray-200 hover:shadow-md">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="rounded-lg bg-rose-50 px-2.5 py-1 font-mono text-sm font-bold text-rose-700">
          {entry.cod_postal}
        </span>
        {entry.sector != null && (
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
            Sector {entry.sector}
          </span>
        )}
      </div>
      <p className="text-sm font-medium text-gray-900">
        {entry.localitate_raw}, {entry.judet_raw}
      </p>
      {entry.strada_raw && (
        <p className="mt-1 text-sm text-gray-600">
          {entry.tip_artera_raw ? `${entry.tip_artera_raw} ` : ''}
          {entry.strada_raw}
          {numarLabel && <span className="text-gray-400"> · nr. {numarLabel}</span>}
        </p>
      )}
      {entry.oficiu_distribuire && (
        <p className="mt-2 text-xs text-gray-400">Oficiu: {entry.oficiu_distribuire}</p>
      )}
    </div>
  )
}

function CandidateCard({ candidate }: { candidate: AdresaCandidate }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-gray-200 hover:shadow-md">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        {candidate.cod_postal && (
          <span className="rounded-lg bg-rose-50 px-2.5 py-1 font-mono text-sm font-bold text-rose-700">
            {candidate.cod_postal}
          </span>
        )}
        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
          {candidate.source === 'local' ? 'sursă locală' : candidate.source}
        </span>
      </div>
      <p className="text-sm font-medium text-gray-900">
        {[candidate.localitate, candidate.judet].filter(Boolean).join(', ')}
      </p>
      {candidate.strada && <p className="mt-1 text-sm text-gray-600">{candidate.strada}</p>}
      {candidate.formatted_address && (
        <p className="mt-2 text-xs text-gray-400">{candidate.formatted_address}</p>
      )}
    </div>
  )
}

// --- Mode: freeform address search ---

function AdresaSearchSection() {
  const [adresa, setAdresa] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [candidates, setCandidates] = useState<AdresaCandidate[] | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = adresa.trim()
    if (!trimmed) return

    setLoading(true)
    setError(null)
    setCandidates(null)
    try {
      const data = await rezolvaAdresa(trimmed)
      setCandidates(data.candidates)
    } catch {
      setError('Nu s-a putut rezolva adresa. Încearcă din nou.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div id="coduri-postale-adresa">
      <form
        id="coduri-postale-adresa-form"
        onSubmit={handleSubmit}
        className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
      >
        <label htmlFor="coduri-postale-adresa-input" className="mb-1.5 block text-sm font-medium text-gray-700">
          Adresă completă
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="coduri-postale-adresa-input"
            type="text"
            value={adresa}
            onChange={e => setAdresa(e.target.value)}
            placeholder="ex: Str. Cuza Vodă, Focșani, Vrancea"
            className="w-full flex-1 rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none ring-inset focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
          />
          <button
            id="coduri-postale-adresa-submit"
            type="submit"
            disabled={loading || !adresa.trim()}
            className="inline-flex h-[42px] items-center justify-center gap-2 rounded-lg bg-rose-600 px-5 text-sm font-medium text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && <Spinner />}
            Caută
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-400">
          Caută întâi în baza de date locală, apoi la nevoie printr-un serviciu de geocodare extern.
        </p>
      </form>

      {error && <ErrorBox message={error} />}

      {candidates && candidates.length === 0 && (
        <EmptyBox message="Nu s-a găsit nicio adresă potrivită." />
      )}

      {candidates && candidates.length > 0 && (
        <div id="coduri-postale-adresa-results" className="grid gap-4 sm:grid-cols-2">
          {candidates.map((c, idx) => (
            <CandidateCard key={idx} candidate={c} />
          ))}
        </div>
      )}
    </div>
  )
}

// --- Mode: search by address components ---

const NUMAR_TIP_OPTIONS = [
  { value: '', label: 'Oricare' },
  { value: 'nr', label: 'Număr stradă' },
  { value: 'bl', label: 'Bloc' },
]

function ComponenteSearchSection() {
  const [judet, setJudet] = useState('')
  const [localitate, setLocalitate] = useState('')
  const [strada, setStrada] = useState('')
  const [numar, setNumar] = useState('')
  const [numarTip, setNumarTip] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [results, setResults] = useState<CodPostalEntry[] | null>(null)
  const [total, setTotal] = useState(0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!judet.trim() && !localitate.trim() && !strada.trim() && !numar.trim()) {
      setValidationError('Completează cel puțin unul dintre câmpuri: județ, localitate, stradă sau număr.')
      return
    }
    setValidationError(null)

    const filters: CautareCoduriPostaleParams = {
      judet: judet.trim() || undefined,
      localitate: localitate.trim() || undefined,
      strada: strada.trim() || undefined,
      numar: numar.trim() || undefined,
      numar_tip: numarTip || undefined,
      limit: 30,
    }

    setLoading(true)
    setError(null)
    setResults(null)
    try {
      const data = await cautaCoduriPostale(filters)
      setResults(data.results)
      setTotal(data.total)
    } catch {
      setError('Nu s-a putut efectua căutarea. Încearcă din nou.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div id="coduri-postale-componente">
      <form
        id="coduri-postale-componente-form"
        onSubmit={handleSubmit}
        className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="cp-judet" className="mb-1.5 block text-sm font-medium text-gray-700">
              Județ
            </label>
            <input
              id="cp-judet"
              type="text"
              value={judet}
              onChange={e => setJudet(e.target.value)}
              placeholder="ex: Vrancea"
              className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none ring-inset focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
            />
          </div>
          <div>
            <label htmlFor="cp-localitate" className="mb-1.5 block text-sm font-medium text-gray-700">
              Localitate
            </label>
            <input
              id="cp-localitate"
              type="text"
              value={localitate}
              onChange={e => setLocalitate(e.target.value)}
              placeholder="ex: Focșani"
              className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none ring-inset focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
            />
          </div>
          <div>
            <label htmlFor="cp-strada" className="mb-1.5 block text-sm font-medium text-gray-700">
              Stradă
            </label>
            <input
              id="cp-strada"
              type="text"
              value={strada}
              onChange={e => setStrada(e.target.value)}
              placeholder="ex: Cuza Vodă"
              className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none ring-inset focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label htmlFor="cp-numar" className="mb-1.5 block text-sm font-medium text-gray-700">
                Număr
              </label>
              <input
                id="cp-numar"
                type="text"
                value={numar}
                onChange={e => setNumar(e.target.value)}
                placeholder="ex: 10"
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none ring-inset focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
              />
            </div>
            <div className="w-36">
              <label htmlFor="cp-numar-tip" className="mb-1.5 block text-sm font-medium text-gray-700">
                Tip
              </label>
              <select
                id="cp-numar-tip"
                value={numarTip}
                onChange={e => setNumarTip(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 outline-none ring-inset focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
              >
                {NUMAR_TIP_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {validationError && <p className="mt-3 text-sm text-red-600">{validationError}</p>}

        <button
          id="coduri-postale-componente-submit"
          type="submit"
          disabled={loading}
          className="mt-5 inline-flex h-[42px] items-center justify-center gap-2 rounded-lg bg-rose-600 px-5 text-sm font-medium text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading && <Spinner />}
          Caută
        </button>
      </form>

      {error && <ErrorBox message={error} />}

      {results && results.length === 0 && <EmptyBox message="Nu s-a găsit niciun cod poștal potrivit." />}

      {results && results.length > 0 && (
        <div id="coduri-postale-componente-results">
          <p className="mb-4 text-sm text-gray-500">
            {total} {total === 1 ? 'rezultat găsit' : 'rezultate găsite'}
            {total > results.length ? ` (afișate primele ${results.length})` : ''}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {results.map(entry => (
              <CodPostalCard key={entry.id} entry={entry} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// --- Mode: lookup by postal code ---

function CodLookupSection() {
  const [cod, setCod] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [results, setResults] = useState<CodPostalEntry[] | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = cod.trim()
    if (!trimmed) return

    setLoading(true)
    setError(null)
    setNotFound(false)
    setResults(null)
    try {
      const data = await getCodPostal(trimmed)
      setResults(data)
    } catch (err) {
      if (err instanceof Error && err.message === 'HTTP 404') {
        setNotFound(true)
      } else {
        setError('Nu s-a putut verifica codul poștal. Încearcă din nou.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div id="coduri-postale-cod">
      <form
        id="coduri-postale-cod-form"
        onSubmit={handleSubmit}
        className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
      >
        <label htmlFor="coduri-postale-cod-input" className="mb-1.5 block text-sm font-medium text-gray-700">
          Cod poștal
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="coduri-postale-cod-input"
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={cod}
            onChange={e => setCod(e.target.value)}
            placeholder="ex: 011357"
            className="w-full flex-1 rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none ring-inset focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
          />
          <button
            id="coduri-postale-cod-submit"
            type="submit"
            disabled={loading || !cod.trim()}
            className="inline-flex h-[42px] items-center justify-center gap-2 rounded-lg bg-rose-600 px-5 text-sm font-medium text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && <Spinner />}
            Verifică
          </button>
        </div>
      </form>

      {error && <ErrorBox message={error} />}

      {notFound && <EmptyBox message="Nu există niciun cod poștal cu această valoare." />}

      {results && results.length > 0 && (
        <div id="coduri-postale-cod-results" className="grid gap-4 sm:grid-cols-2">
          {results.map(entry => (
            <CodPostalCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  )
}

export function CoduriPostalePage() {
  const [mod, setMod] = useState<Mod>('adresa')

  return (
    <main id="coduri-postale-page" className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div id="coduri-postale-header" className="mb-10 text-center">
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Coduri Poștale
        </h1>
        <p className="text-gray-500">
          Caută adrese, componente de adresă sau verifică un cod poștal existent
        </p>
      </div>

      <div id="coduri-postale-tabs" className="mb-8 flex flex-wrap justify-center gap-2">
        {TABS.map(tab => (
          <button
            key={tab.id}
            id={`coduri-postale-tab-${tab.id}`}
            onClick={() => setMod(tab.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              mod === tab.id
                ? 'bg-rose-600 text-white'
                : 'bg-white text-gray-600 ring-1 ring-inset ring-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {mod === 'adresa' && <AdresaSearchSection />}
      {mod === 'componente' && <ComponenteSearchSection />}
      {mod === 'cod' && <CodLookupSection />}
    </main>
  )
}

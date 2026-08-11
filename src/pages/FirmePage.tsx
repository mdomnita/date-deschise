import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { searchCompanii, getCompanie } from '../services/firmeApi'
import { CompanyMap } from '../components/CompanyMap'
import type { CompanyOut } from '../types/firme'

type SearchMode = 'name' | 'cui'

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
      <dt className="w-44 shrink-0 text-sm font-medium text-gray-400">{label}</dt>
      <dd className="text-sm text-gray-900 break-words">{value}</dd>
    </div>
  )
}

function buildAddress(c: CompanyOut): string | null {
  const parts: string[] = []
  if (c.street) {
    let streetPart = `Str. ${c.street}`
    if (c.street_number) streetPart += ` nr. ${c.street_number}`
    parts.push(streetPart)
  }
  if (c.building) parts.push(`Bloc ${c.building}`)
  if (c.staircase) parts.push(`Sc. ${c.staircase}`)
  if (c.floor) parts.push(`Et. ${c.floor}`)
  if (c.apartment) parts.push(`Ap. ${c.apartment}`)
  if (c.postal_code) parts.push(`CP ${c.postal_code}`)
  if (c.locality) parts.push(c.locality)
  if (c.sector) parts.push(`Sector ${c.sector}`)
  if (c.county) parts.push(c.county)
  if (c.country && c.country.toLowerCase() !== 'romania' && c.country.toLowerCase() !== 'românia') {
    parts.push(c.country)
  }
  return parts.length > 0 ? parts.join(', ') : null
}

function CompanyDetail({ company }: { company: CompanyOut }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <span className="rounded-lg bg-indigo-50 px-3 py-1.5 font-mono text-sm font-semibold text-indigo-700">
            CUI {company.cui}
          </span>
          {company.registration_number && (
            <span className="rounded-lg bg-gray-50 px-3 py-1.5 font-mono text-sm text-gray-500">
              {company.registration_number}
            </span>
          )}
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">{company.name}</h2>
        {company.legal_form && (
          <p className="mt-1 text-sm text-gray-500">{company.legal_form}</p>
        )}
        <div className="mt-5 border-t border-gray-100 pt-4">
          <Link
            to={`/date-financiare?cui=${company.cui}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700 transition hover:bg-teal-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18" />
              <path d="m19 9-5 5-4-4-3 3" />
            </svg>
            Date financiare
          </Link>
        </div>
      </div>

      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Informații generale
        </h3>
        <dl className="space-y-3">
          <DetailRow label="Data înregistrării" value={company.registration_date} />
          <DetailRow label="Formă juridică" value={company.legal_form} />
          <DetailRow label="EUID" value={company.euid} />
          {company.website && (
            <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
              <dt className="w-44 shrink-0 text-sm font-medium text-gray-400">Website</dt>
              <dd className="text-sm">
                <a
                  href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  {company.website}
                </a>
              </dd>
            </div>
          )}
          <DetailRow label="Țara societate-mamă" value={company.parent_company_country} />
        </dl>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Adresă
        </h3>
        <dl className="space-y-3">
          <DetailRow label="Adresă completă" value={buildAddress(company)} />
          <DetailRow label="Localitate" value={company.locality} />
          <DetailRow label="Sector" value={company.sector} />
          <DetailRow label="Județ" value={company.county} />
          <DetailRow label="Cod poștal" value={company.postal_code} />
          <DetailRow label="Țară" value={company.country} />
          <DetailRow label="Info adiționale" value={company.address_extra} />
          <DetailRow
            label="Coordonate (sediu)"
            value={company.latitude != null && company.longitude != null
              ? `${company.latitude}, ${company.longitude}`
              : null}
          />
        </dl>
      </section>

      {company.latitude != null && company.longitude != null && (
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Locație
          </h3>
          <CompanyMap
            name={company.name}
            address={buildAddress(company)}
            latitude={company.latitude}
            longitude={company.longitude}
          />
        </section>
      )}
    </div>
  )
}

export function FirmePage() {
  const [mode, setMode] = useState<SearchMode>('name')
  const [query, setQuery] = useState('')
  const [company, setCompany] = useState<CompanyOut | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  function switchMode(m: SearchMode) {
    setMode(m)
    setQuery('')
    setCompany(null)
    setNotFound(false)
    setError(null)
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (!q) return

    abortRef.current?.abort()
    abortRef.current = new AbortController()

    setLoading(true)
    setError(null)
    setCompany(null)
    setNotFound(false)

    try {
      if (mode === 'cui') {
        const data = await getCompanie(q)
        setCompany(data)
      } else {
        const { results } = await searchCompanii(q, 1)
        if (results.length === 0) {
          setNotFound(true)
        } else {
          const data = await getCompanie(results[0].cui)
          setCompany(data)
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        if (mode === 'cui') {
          setError('Firma cu acest CUI nu a fost găsită sau a apărut o eroare.')
        } else {
          setError('A apărut o eroare la căutare. Încearcă din nou.')
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const isCuiMode = mode === 'cui'
  const minLen = isCuiMode ? 1 : 2
  const canSubmit = !loading && query.trim().length >= minLen && (!isCuiMode || /^\d+$/.test(query.trim()))

  return (
    <main id="firme-page" className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div id="firme-header" className="mb-8 text-center">
        <h1 id="firme-title" className="mb-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Căutare Firme
        </h1>
        <p id="firme-subtitle" className="text-gray-500">Caută companii din România după denumire sau CUI</p>
      </div>

      {/* Mode toggle */}
      <div className="mb-6 flex justify-center">
        <div id="firme-mode-toggle" className="inline-flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
          <button
            id="firme-mode-name"
            type="button"
            onClick={() => switchMode('name')}
            className={`rounded-lg px-5 py-2 text-sm font-medium transition ${
              mode === 'name'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Denumire
          </button>
          <button
            id="firme-mode-cui"
            type="button"
            onClick={() => switchMode('cui')}
            className={`rounded-lg px-5 py-2 text-sm font-medium transition ${
              mode === 'cui'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            CUI
          </button>
        </div>
      </div>

      {/* Search form */}
      <form id="firme-search-form" onSubmit={handleSearch} className="mb-8 flex justify-center">
        <div className="flex w-full gap-2">
          <div className="relative flex-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              id="firme-search-input"
              key={mode}
              name={isCuiMode ? 'firme-cui' : 'firme-name'}
              autoComplete={isCuiMode ? 'off' : 'on'}
              type={isCuiMode ? 'number' : 'text'}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={isCuiMode ? 'Ex: 2816464' : 'Ex: Dedeman, Kaufland, Dacia...'}
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              autoFocus
              min={isCuiMode ? 1 : undefined}
            />
          </div>
          <button
            id="firme-search-btn"
            type="submit"
            disabled={!canSubmit}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
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
        <div id="firme-error" className="mb-6 rounded-xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {notFound && (
        <div id="firme-not-found" className="mb-6 rounded-xl border border-amber-100 bg-amber-50 px-5 py-4 text-sm text-amber-700">
          Nicio firmă găsită pentru această căutare.
        </div>
      )}

      {company && <div id="firme-result"><CompanyDetail company={company} /></div>}

      {!company && !error && !notFound && !loading && (
        <div className="flex flex-col items-center gap-3 py-16 text-center text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
            <rect width="16" height="20" x="4" y="2" rx="2" />
            <path d="M9 22v-4h6v4" />
            <path d="M8 6h.01" /><path d="M16 6h.01" />
            <path d="M8 10h.01" /><path d="M16 10h.01" />
            <path d="M8 14h.01" /><path d="M16 14h.01" />
          </svg>
          <p className="text-sm">
            {isCuiMode
              ? 'Introdu un CUI numeric și apasă Caută'
              : 'Introdu cel puțin 2 caractere și apasă Caută'}
          </p>
        </div>
      )}
    </main>
  )
}

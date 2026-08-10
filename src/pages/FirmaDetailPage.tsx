import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getCompanie } from '../services/firmeApi'
import { CompanyMap } from '../components/CompanyMap'
import type { CompanyOut } from '../types/firme'

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
      <dt className="w-40 shrink-0 text-sm font-medium text-gray-400">{label}</dt>
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

export function FirmaDetailPage() {
  const { cui } = useParams<{ cui: string }>()
  const [company, setCompany] = useState<CompanyOut | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!cui) return
    const cuiValue = cui
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await getCompanie(cuiValue)
        if (!cancelled) setCompany(data)
      } catch {
        if (!cancelled) setError('Firma nu a putut fi încărcată. Verifică CUI-ul și încearcă din nou.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => { cancelled = true }
  }, [cui])

  return (
    <main id="firma-detail-page" className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link
        id="firma-detail-back"
        to="/firme"
        className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Înapoi la căutare
      </Link>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <svg className="h-7 w-7 animate-spin text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      )}

      {error && (
        <div id="firma-detail-error" className="rounded-xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {company && (
        <div className="space-y-6">
          {/* Header */}
          <div id="firma-detail-header" className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <span id="firma-detail-cui" className="rounded-lg bg-indigo-50 px-3 py-1.5 font-mono text-sm font-semibold text-indigo-700">
                CUI {company.cui}
              </span>
              {company.registration_number && (
                <span className="rounded-lg bg-gray-50 px-3 py-1.5 font-mono text-sm text-gray-500">
                  {company.registration_number}
                </span>
              )}
            </div>
            <h1 id="firma-detail-name" className="text-2xl font-bold tracking-tight text-gray-900">
              {company.name}
            </h1>
            {company.legal_form && (
              <p className="mt-1 text-sm text-gray-500">{company.legal_form}</p>
            )}
            <div className="mt-5 border-t border-gray-100 pt-4">
              <Link
                id="link-date-financiare"
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

          {/* General info */}
          <section id="firma-detail-info" className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
              Informații generale
            </h2>
            <dl className="space-y-3">
              <DetailRow label="Data înregistrării" value={company.registration_date} />
              <DetailRow label="Formă juridică" value={company.legal_form} />
              <DetailRow label="EUID" value={company.euid} />
              {company.website && (
                <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
                  <dt className="w-40 shrink-0 text-sm font-medium text-gray-400">Website</dt>
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

          {/* Address */}
          <section id="firma-detail-adresa" className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
              Adresă
            </h2>
            <dl className="space-y-3">
              <DetailRow label="Adresă completă" value={buildAddress(company)} />
              <DetailRow label="Stradă" value={company.street} />
              <DetailRow label="Număr" value={company.street_number} />
              <DetailRow label="Bloc" value={company.building} />
              <DetailRow label="Scară" value={company.staircase} />
              <DetailRow label="Etaj" value={company.floor} />
              <DetailRow label="Apartament" value={company.apartment} />
              <DetailRow label="Cod poștal" value={company.postal_code} />
              <DetailRow label="Sector" value={company.sector} />
              <DetailRow label="Localitate" value={company.locality} />
              <DetailRow label="Județ" value={company.county} />
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

          {/* Location map */}
          {company.latitude != null && company.longitude != null && (
            <section id="firma-detail-locatie" className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
                Locație
              </h2>
              <CompanyMap
                name={company.name}
                address={buildAddress(company)}
                latitude={company.latitude}
                longitude={company.longitude}
              />
            </section>
          )}
        </div>
      )}
    </main>
  )
}

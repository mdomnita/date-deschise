import { Link } from 'react-router-dom'
import type { CompanySearchItem } from '../types/firme'

interface Props {
  company: CompanySearchItem
}

export function FirmaResultCard({ company }: Props) {
  const locationParts = [company.locality, company.county].filter(Boolean)
  const similarityPct = Math.round(company.similarity * 100)

  return (
    <Link
      to={`/firme/${company.cui}`}
      className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="shrink-0 rounded-lg bg-indigo-50 px-2.5 py-1 font-mono text-sm font-semibold text-indigo-700">
          CUI {company.cui}
        </span>
        <span
          title="Scor similaritate"
          className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500"
        >
          {similarityPct}%
        </span>
      </div>

      <h2 className="text-base font-semibold leading-snug text-gray-900">
        {company.name}
      </h2>

      <dl className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-500">
        {locationParts.length > 0 && (
          <div className="flex gap-1">
            <dt className="font-medium text-gray-400">Localitate</dt>
            <dd>{locationParts.join(', ')}</dd>
          </div>
        )}
        {company.registration_number && (
          <div className="flex gap-1">
            <dt className="font-medium text-gray-400">Nr. reg.</dt>
            <dd>{company.registration_number}</dd>
          </div>
        )}
      </dl>

      <div className="flex items-center gap-1 text-xs font-medium text-indigo-600">
        <span>Vezi detalii</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  )
}

import type { CompanySearchResponse, CompanyOut, BilantResponse, CompanyFinancialsResponse, CompanyFinancialsData } from '../types/firme'

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string

export async function searchCompanii(q: string, limit = 1): Promise<CompanySearchResponse> {
  const res = await fetch(`${BASE_URL}/companii/search?q=${encodeURIComponent(q)}&limit=${limit}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function getCompanie(cui: number | string): Promise<CompanyOut> {
  const res = await fetch(`${BASE_URL}/companii/${cui}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function getBilant(cui: number | string, ani?: number[]): Promise<BilantResponse> {
  if (!ani || ani.length === 0) {
    const res = await fetch(`${BASE_URL}/companii/${cui}/bilant/ultimul-an`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  }

  const params = new URLSearchParams()
  ani.forEach(an => params.append('ani', String(an)))
  const res = await fetch(`${BASE_URL}/companii/${cui}/bilant?${params.toString()}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export interface FinanciarQuery {
  ani?: number[]
  anStart?: number
  anEnd?: number
}

export async function getFinanciar(cui: number | string, query?: FinanciarQuery): Promise<CompanyFinancialsResponse> {
  const params = new URLSearchParams()
  if (query?.ani && query.ani.length > 0) {
    query.ani.forEach(an => params.append('ani', String(an)))
  } else {
    if (query?.anStart != null) params.append('an_start', String(query.anStart))
    if (query?.anEnd != null) params.append('an_end', String(query.anEnd))
  }
  const qs = params.toString() ? `?${params.toString()}` : ''
  const res = await fetch(`${BASE_URL}/companii/${cui}/financiar${qs}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// Indicatori financiari stocati (rapid); doar daca nu exista date stocate se
// interogheaza bilantul live de la ANAF ca alternativa.
export async function getCompanyFinancials(cui: number | string, query?: FinanciarQuery): Promise<CompanyFinancialsData> {
  try {
    const data = await getFinanciar(cui, query)
    return { ...data, warning: null }
  } catch (err) {
    if (!(err instanceof Error) || err.message !== 'HTTP 404') throw err

    // /bilant nu suporta an_start/an_end, doar o lista explicita de ani.
    const ani = query?.ani && query.ani.length > 0
      ? query.ani
      : query?.anStart != null && query?.anEnd != null
        ? Array.from({ length: query.anEnd - query.anStart + 1 }, (_, i) => query.anStart! + i)
        : undefined

    const bilant = await getBilant(cui, ani)
    return {
      cui: bilant.cui,
      name: bilant.name,
      fields: [...new Set(bilant.years.flatMap(y => y.indicators.map(i => i.label)))],
      years: bilant.years.map(y => ({
        an: y.year,
        sursa: 'anaf_live',
        caen: bilant.caen_code ? `${bilant.caen_code} - ${bilant.caen_label}` : null,
        values: Object.fromEntries(y.indicators.map(i => [i.label, i.value])),
      })),
      warning: bilant.warning,
    }
  }
}

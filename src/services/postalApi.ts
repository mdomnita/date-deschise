import type {
  CautareCoduriPostaleParams,
  CodPostalEntry,
  CodPostalSearchResponse,
  RezolvareAdresaResponse,
} from '../types/postal'

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string

export async function rezolvaAdresa(adresa: string): Promise<RezolvareAdresaResponse> {
  const params = new URLSearchParams({ adresa })
  const res = await fetch(`${BASE_URL}/coduripostale/rezolvare?${params}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function cautaCoduriPostale(
  filters: CautareCoduriPostaleParams,
): Promise<CodPostalSearchResponse> {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== '') params.set(key, String(value))
  }
  const res = await fetch(`${BASE_URL}/coduripostale/cautare?${params}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function getCodPostal(cod: string): Promise<CodPostalEntry[]> {
  const res = await fetch(`${BASE_URL}/coduripostale/${encodeURIComponent(cod)}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

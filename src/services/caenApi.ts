import type {
  CAENEntry,
  SearchResponse,
  Section,
  Division,
  Group,
  CAENv2Detail,
  CAENv3Predecesori,
  CorespondentaSearchResponse,
} from '../types/caen'

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string

export async function searchCAEN(
  query: string,
  limit = 50,
  offset = 0,
): Promise<SearchResponse> {
  const params = new URLSearchParams({ q: query, limit: String(limit), offset: String(offset) })
  const res = await fetch(`${BASE_URL}/caen?${params}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function getCAENByCode(code: string): Promise<CAENEntry> {
  const res = await fetch(`${BASE_URL}/caen/${code}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function getSectiuni(): Promise<Section[]> {
  const res = await fetch(`${BASE_URL}/sectiuni`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function getDiviziuni(sectionCod: string): Promise<Division[]> {
  const res = await fetch(`${BASE_URL}/sectiuni/${sectionCod}/diviziuni`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function getGrupe(divisionCod: string): Promise<Group[]> {
  const res = await fetch(`${BASE_URL}/diviziuni/${divisionCod}/grupe`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function getClase(groupCod: string): Promise<CAENEntry[]> {
  const res = await fetch(`${BASE_URL}/grupe/${groupCod}/clase`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function getCAENv2ByCode(cod: string): Promise<CAENv2Detail> {
  const res = await fetch(`${BASE_URL}/caen/v2/${cod}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function getCAENv3Predecesori(cod: string): Promise<CAENv3Predecesori> {
  const res = await fetch(`${BASE_URL}/caen/v3/${cod}/v2`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function searchCorespondenta(params: {
  v2?: string
  v3?: string
  tip?: string
  limit?: number
  offset?: number
}): Promise<CorespondentaSearchResponse> {
  const query = new URLSearchParams()
  if (params.v2) query.set('v2', params.v2)
  if (params.v3) query.set('v3', params.v3)
  if (params.tip) query.set('tip', params.tip)
  if (params.limit !== undefined) query.set('limit', String(params.limit))
  if (params.offset !== undefined) query.set('offset', String(params.offset))
  const res = await fetch(`${BASE_URL}/caen/corespondenta?${query}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
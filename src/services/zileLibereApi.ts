import type { ZiLibera, PunteRecomandare } from '../types/zileLibere'

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string

export async function getZileLibere(): Promise<ZiLibera[]> {
  const res = await fetch(`${BASE_URL}/zilelibere`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function getZileLibereByLuna(luna: number): Promise<ZiLibera[]> {
  const res = await fetch(`${BASE_URL}/zilelibere/luna/${luna}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function getPunti(maxZileConcediu = 4, minZileLibere = 3): Promise<PunteRecomandare[]> {
  const params = new URLSearchParams({
    max_zile_concediu: String(maxZileConcediu),
    min_zile_libere: String(minZileLibere),
  })
  const res = await fetch(`${BASE_URL}/zilelibere/punti?${params}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

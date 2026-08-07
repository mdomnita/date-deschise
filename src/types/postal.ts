export interface CodPostalEntry {
  id: number
  cod_postal: string
  judet_raw: string
  judet_norm: string
  cod_judet: number | null
  localitate_raw: string
  localitate_norm: string
  localitate_parinte_raw: string | null
  localitate_parinte_norm: string | null
  cod_siruta: number | null
  siruta_sirsup: number | null
  siruta_niv: number | null
  sector: number | null
  tip_artera_raw: string | null
  tip_artera_norm: string | null
  strada_raw: string | null
  strada_norm: string | null
  numar_raw: string | null
  numar_tip: string | null
  numar_min: number | null
  numar_max: number | null
  numar_open_ended: boolean
  numar_paritate: string | null
  oficiu_distribuire: string | null
  sursa: string | null
  sursa_versiune: string | null
}

export interface CodPostalSearchResponse {
  total: number
  results: CodPostalEntry[]
}

export interface AdresaCandidate {
  source: string
  judet: string | null
  localitate: string | null
  strada: string | null
  cod_postal: string | null
  cod_siruta: number | null
  lat: number | null
  lon: number | null
  score: number | null
  formatted_address: string | null
}

export interface RezolvareAdresaResponse {
  query: string
  candidates: AdresaCandidate[]
}

export interface CautareCoduriPostaleParams {
  judet?: string
  localitate?: string
  strada?: string
  numar?: string
  numar_tip?: string
  limit?: number
  offset?: number
}

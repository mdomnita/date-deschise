export interface CAENEntry {
  cod_caen: string
  denumire: string
  sectiune_cod: string
  sectiune: string
  diviziune_cod: string
  diviziune: string
  grupa_cod: string
  grupa: string
}

export interface SearchResponse {
  total: number
  results: CAENEntry[]
}

export interface Section {
  cod: string
  denumire: string
}

export interface Division {
  cod: string
  denumire: string
}

export interface Group {
  cod: string
  denumire: string
}

export interface CorespondentaV3Item {
  cod_v3: string
  denumire_v3: string
  tip_corespondenta: string
}

export interface CAENv2Detail {
  cod: string
  denumire: string
  corespondente: CorespondentaV3Item[]
}

export interface CorespondentaV2Item {
  cod_v2: string | null
  denumire_v2: string | null
  tip_corespondenta: string
}

export interface CAENv3Predecesori {
  cod: string
  denumire: string
  predecesori: CorespondentaV2Item[]
}

export interface CorespondentaFullItem {
  id: number
  cod_v2: string | null
  denumire_v2: string | null
  cod_v3: string
  denumire_v3: string
  tip_corespondenta: string
}

export interface CorespondentaSearchResponse {
  total: number
  results: CorespondentaFullItem[]
}
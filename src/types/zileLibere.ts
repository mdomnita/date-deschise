export interface ZiLibera {
  data: string
  zi_saptamana: string
  denumire_sarbatoare: string
  temei_art_139_codul_muncii: string
  cade_in_weekend: boolean
  observatii: string | null
  sursa_legala: string
  sursa_calendar: string
  sursa_verificare_suplimentara: string
}

export interface PunteRecomandare {
  interval_start: string
  interval_end: string
  zile_libere_totale: number
  zile_concediu_necesare: number
  zile_concediu: string[]
  zile_libere_legale: string[]
}

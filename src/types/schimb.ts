export interface ValutaInfo {
  valuta: string
  ultima_data: string
  curs_unitar: number
}

export interface CursZi {
  data: string
  valuta: string
  curs: number
  multiplicator: number
  curs_unitar: number
}

export interface CursIstoricPunct {
  data: string
  curs: number
}

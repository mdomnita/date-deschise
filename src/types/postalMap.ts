export interface PostalPin {
  id: number
  lat: number
  lon: number
  codPostal: string
  ruleLabel: string
}

export interface NotFoundEntry {
  id: number
  codPostal: string
  strada: string | null
}

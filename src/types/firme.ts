export interface CompanySearchItem {
  name: string
  cui: number
  county: string | null
  locality: string | null
  registration_number: string | null
  similarity: number
}

export interface CompanySearchResponse {
  total: number
  results: CompanySearchItem[]
}

export interface BilantIndicator {
  label: string
  value: number
}

export interface BilantYear {
  year: number
  indicators: BilantIndicator[]
}

export interface BilantResponse {
  cui: number
  name: string
  caen_code: number
  caen_label: string
  years: BilantYear[]
  warning: string | null
}

export interface CompanyOut {
  name: string
  cui: number
  registration_number: string | null
  registration_date: string | null
  euid: string | null
  legal_form: string | null
  country: string | null
  county: string | null
  locality: string | null
  street: string | null
  street_number: string | null
  building: string | null
  staircase: string | null
  floor: string | null
  apartment: string | null
  postal_code: string | null
  sector: string | null
  address_extra: string | null
  website: string | null
  parent_company_country: string | null
  latitude: number | null
  longitude: number | null
}

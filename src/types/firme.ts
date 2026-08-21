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

export interface CompanyFinancialYear {
  an: number
  sursa: string
  caen: string | null
  values: Record<string, number | null>
}

export interface CompanyFinancialsResponse {
  cui: number
  name: string
  fields: string[]
  years: CompanyFinancialYear[]
}

export interface CompanyFinancialsData extends CompanyFinancialsResponse {
  warning: string | null
}

export const FINANCIAL_FIELD_LABELS: Record<string, string> = {
  cifra_afaceri: 'Cifra de afaceri netă',
  venituri_totale: 'Venituri totale',
  cheltuieli_totale: 'Cheltuieli totale',
  profit_brut: 'Profit brut',
  profit_net: 'Profit net',
  capitaluri_total: 'Capitaluri - total',
  capital_social: 'Capital social',
  active_imobilizate_total: 'Active imobilizate - total',
  active_circulante_total: 'Active circulante - total',
  stocuri: 'Stocuri',
  creante: 'Creanțe',
  casa_conturi: 'Casă și conturi la bănci',
  datorii: 'Datorii',
  provizioane: 'Provizioane',
  patrimoniul_public: 'Patrimoniul public',
  patrimoniul_regiei: 'Patrimoniul regiei',
  numar_salariati: 'Număr mediu de salariați',
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

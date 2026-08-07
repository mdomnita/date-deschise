import type { CodPostalEntry } from '../types/postal'

export function numarRangeLabel(entry: CodPostalEntry): string | null {
  if (entry.numar_min == null) return null
  if (entry.numar_open_ended) return `${entry.numar_min}+`
  if (entry.numar_max != null && entry.numar_max !== entry.numar_min) {
    return `${entry.numar_min}–${entry.numar_max}`
  }
  return String(entry.numar_min)
}

export function buildRuleLabel(entry: CodPostalEntry): string {
  const street = [entry.tip_artera_raw, entry.strada_raw].filter(Boolean).join(' ')
  const numarLabel = numarRangeLabel(entry)
  if (street && numarLabel) return `${street} · nr. ${numarLabel}`
  if (street) return street
  return [entry.localitate_raw, entry.judet_raw].filter(Boolean).join(', ')
}

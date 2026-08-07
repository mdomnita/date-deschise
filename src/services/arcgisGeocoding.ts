import type { AdresaCandidate, CodPostalEntry } from '../types/postal'

const ARCGIS_FIND_CANDIDATES_URL =
  'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates'

const STREET_LEVEL_ADDR_TYPES = new Set([
  'PointAddress',
  'StreetAddress',
  'StreetAddressExt',
  'StreetName',
  'BuildingName',
  'Intersection',
])

export interface AddressQuery {
  singleLine: string
  hasStreet: boolean
}

export function buildAddressQuery(entry: CodPostalEntry): AddressQuery {
  const numar = entry.numar_raw ?? (entry.numar_min != null ? String(entry.numar_min) : null)
  const streetPart = entry.strada_raw
    ? [entry.tip_artera_raw, entry.strada_raw, numar].filter(Boolean).join(' ')
    : null
  return {
    singleLine: [streetPart, entry.localitate_raw, entry.judet_raw, 'Romania'].filter(Boolean).join(', '),
    hasStreet: streetPart != null,
  }
}

export function buildAddressQueryFromCandidate(candidate: AdresaCandidate): AddressQuery {
  const streetPart = candidate.strada ?? null
  return {
    singleLine: [streetPart, candidate.localitate, candidate.judet, 'Romania'].filter(Boolean).join(', '),
    hasStreet: streetPart != null,
  }
}

export interface ArcGisGeocodeResult {
  lat: number
  lon: number
  matchAddress: string
}

export async function geocodeAddress(
  query: AddressQuery,
  signal?: AbortSignal,
): Promise<ArcGisGeocodeResult | null> {
  const params = new URLSearchParams({
    SingleLine: query.singleLine,
    f: 'json',
    outFields: 'Match_addr,Addr_type',
    maxLocations: '1',
    countryCode: 'ROU',
  })

  try {
    const res = await fetch(`${ARCGIS_FIND_CANDIDATES_URL}?${params}`, { signal })
    if (!res.ok) return null
    const data = await res.json()
    const candidate = data.candidates?.[0]
    if (!candidate?.location) return null

    // ArcGIS silently falls back to a coarser match (e.g. locality/country-level)
    // instead of returning no candidates when the street can't be resolved — reject
    // those fallbacks when a street was actually requested, so we never plot a
    // generic locality pin as if it were the real address.
    if (query.hasStreet && !STREET_LEVEL_ADDR_TYPES.has(candidate.attributes?.Addr_type)) {
      return null
    }

    return {
      lat: candidate.location.y,
      lon: candidate.location.x,
      matchAddress: candidate.attributes?.Match_addr ?? '',
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err
    return null
  }
}

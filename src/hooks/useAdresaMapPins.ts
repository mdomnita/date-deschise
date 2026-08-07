import { useEffect, useRef, useState } from 'react'
import { buildAddressQueryFromCandidate, geocodeAddress } from '../services/arcgisGeocoding'
import type { AdresaCandidate } from '../types/postal'
import type { NotFoundEntry, PostalPin } from '../types/postalMap'

function ruleLabelForCandidate(candidate: AdresaCandidate): string {
  if (candidate.strada) return candidate.strada
  return [candidate.localitate, candidate.judet].filter(Boolean).join(', ')
}

export function useAdresaMapPins(candidates: AdresaCandidate[] | null, limit = 10) {
  const abortRef = useRef<AbortController | null>(null)
  const [pins, setPins] = useState<PostalPin[]>([])
  const [notFound, setNotFound] = useState<NotFoundEntry[]>([])
  const [geocoding, setGeocoding] = useState(false)

  useEffect(() => {
    abortRef.current?.abort()

    if (!candidates || candidates.length === 0) {
      setPins([])
      setNotFound([])
      setGeocoding(false)
      return
    }

    const controller = new AbortController()
    abortRef.current = controller
    const subset = candidates.slice(0, limit)

    setGeocoding(true)
    ;(async () => {
      const newPins: PostalPin[] = []
      const newNotFound: NotFoundEntry[] = []

      for (let i = 0; i < subset.length; i++) {
        if (controller.signal.aborted) return
        const candidate = subset[i]
        const codPostal = candidate.cod_postal ?? '—'

        // Local-source candidates already carry lat/lon from the backend — only
        // fall back to a fresh ArcGIS geocode when those are missing.
        if (candidate.lat != null && candidate.lon != null) {
          newPins.push({
            id: i,
            lat: candidate.lat,
            lon: candidate.lon,
            codPostal,
            ruleLabel: ruleLabelForCandidate(candidate),
          })
          continue
        }

        try {
          const result = await geocodeAddress(buildAddressQueryFromCandidate(candidate), controller.signal)
          if (result) {
            newPins.push({
              id: i,
              lat: result.lat,
              lon: result.lon,
              codPostal,
              ruleLabel: ruleLabelForCandidate(candidate),
            })
          } else {
            newNotFound.push({ id: i, codPostal, strada: candidate.strada })
          }
        } catch (err) {
          if (err instanceof DOMException && err.name === 'AbortError') return
          newNotFound.push({ id: i, codPostal, strada: candidate.strada })
        }
      }

      if (!controller.signal.aborted) {
        setPins(newPins)
        setNotFound(newNotFound)
        setGeocoding(false)
      }
    })()

    return () => controller.abort()
  }, [candidates, limit])

  return {
    pins,
    notFound,
    geocoding,
    truncatedCount: Math.max(0, (candidates?.length ?? 0) - limit),
  }
}

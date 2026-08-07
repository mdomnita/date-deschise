import { useEffect, useRef, useState } from 'react'
import { buildAddressQuery, geocodeAddress } from '../services/arcgisGeocoding'
import { buildRuleLabel } from '../lib/postalFormat'
import type { CodPostalEntry } from '../types/postal'
import type { NotFoundEntry, PostalPin } from '../types/postalMap'

export function usePostalMapPins(entries: CodPostalEntry[] | null, limit = 10) {
  const abortRef = useRef<AbortController | null>(null)
  const [pins, setPins] = useState<PostalPin[]>([])
  const [notFound, setNotFound] = useState<NotFoundEntry[]>([])
  const [geocoding, setGeocoding] = useState(false)

  useEffect(() => {
    abortRef.current?.abort()

    if (!entries || entries.length === 0) {
      setPins([])
      setNotFound([])
      setGeocoding(false)
      return
    }

    const controller = new AbortController()
    abortRef.current = controller
    const subset = entries.slice(0, limit)

    setGeocoding(true)
    ;(async () => {
      const newPins: PostalPin[] = []
      const newNotFound: NotFoundEntry[] = []

      for (const entry of subset) {
        if (controller.signal.aborted) return
        try {
          const result = await geocodeAddress(buildAddressQuery(entry), controller.signal)
          if (result) {
            newPins.push({
              id: entry.id,
              lat: result.lat,
              lon: result.lon,
              codPostal: entry.cod_postal,
              ruleLabel: buildRuleLabel(entry),
            })
          } else {
            newNotFound.push({ id: entry.id, codPostal: entry.cod_postal, strada: entry.strada_raw })
          }
        } catch (err) {
          if (err instanceof DOMException && err.name === 'AbortError') return
          newNotFound.push({ id: entry.id, codPostal: entry.cod_postal, strada: entry.strada_raw })
        }
      }

      if (!controller.signal.aborted) {
        setPins(newPins)
        setNotFound(newNotFound)
        setGeocoding(false)
      }
    })()

    return () => controller.abort()
  }, [entries, limit])

  return {
    pins,
    notFound,
    geocoding,
    truncatedCount: Math.max(0, (entries?.length ?? 0) - limit),
  }
}

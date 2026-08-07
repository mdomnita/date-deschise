import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import '../lib/leafletIconFix'
import type { PostalPin } from '../types/postalMap'

interface PostalMapProps {
  pins: PostalPin[]
  loading?: boolean
}

function Spinner() {
  return (
    <svg className="h-3.5 w-3.5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

export function PostalMap({ pins, loading }: PostalMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = L.map(containerRef.current).setView([45.9432, 24.9668], 6)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)
    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    markersRef.current.forEach(m => m.remove())
    markersRef.current = pins.map(pin => {
      const marker = L.marker([pin.lat, pin.lon]).addTo(map)
      marker.bindPopup(`<strong>${pin.codPostal}</strong><br/>${pin.ruleLabel}`)
      return marker
    })

    if (pins.length === 1) {
      map.setView([pins[0].lat, pins[0].lon], 15)
    } else if (pins.length > 1) {
      map.fitBounds(
        L.latLngBounds(pins.map(p => [p.lat, p.lon] as [number, number])),
        { padding: [40, 40], maxZoom: 16 },
      )
    }
  }, [pins])

  return (
    <div id="coduri-postale-map-wrapper" className="relative">
      <div
        id="coduri-postale-map"
        ref={containerRef}
        className="h-80 w-full rounded-xl border border-gray-100 shadow-sm"
      />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/60">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow">
            <Spinner />
            Se localizează adresele…
          </span>
        </div>
      )}
    </div>
  )
}

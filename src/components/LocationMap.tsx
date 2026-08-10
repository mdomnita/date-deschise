import { useEffect, useRef } from 'react'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

export interface LocationPin {
  id: string | number
  lat: number
  lon: number
  popupHtml: string
}

interface LocationMapProps {
  pins: LocationPin[]
  loading?: boolean
  mapId: string
}

function Spinner() {
  return (
    <svg className="h-3.5 w-3.5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

export function LocationMap({ pins, loading, mapId }: LocationMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          carto: {
            type: 'raster',
            tiles: [
              'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
              'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
              'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
              'https://d.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
            ],
            tileSize: 256,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          },
        },
        layers: [
          {
            id: 'carto-layer',
            type: 'raster',
            source: 'carto',
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [24.9668, 45.9432], // [lng, lat]
      zoom: 6,
      attributionControl: false,
    })

    map.addControl(new maplibregl.AttributionControl({ compact: true }))
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-left')
    map.addControl(new maplibregl.FullscreenControl(), 'top-left')

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
      // Create a custom DOM element for the marker to mimic the previous Leaflet look
      const el = document.createElement('div')
      el.className = 'w-[18px] h-[18px] bg-rose-600 rounded-full border-[2px] border-white shadow-sm'
      el.style.cursor = 'pointer'

      const popup = new maplibregl.Popup({ offset: 12, closeButton: false })
        .setHTML(pin.popupHtml)

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([pin.lon, pin.lat]) // MapLibre takes [lng, lat]
        .setPopup(popup)
        .addTo(map)

      return marker
    })

    if (pins.length === 1) {
      map.flyTo({ center: [pins[0].lon, pins[0].lat], zoom: 15, duration: 1000 })
    } else if (pins.length > 1) {
      const bounds = new maplibregl.LngLatBounds()
      pins.forEach(p => bounds.extend([p.lon, p.lat]))
      map.fitBounds(bounds, { padding: 50, maxZoom: 16, duration: 1000 })
    }
  }, [pins])

  return (
    <div className="relative">
      <div
        id={mapId}
        ref={containerRef}
        className="h-80 w-full rounded-xl border border-gray-100 shadow-sm overflow-hidden"
      />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/60 z-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow">
            <Spinner />
            Se localizează adresele…
          </span>
        </div>
      )}
    </div>
  )
}

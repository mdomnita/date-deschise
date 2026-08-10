import { LocationMap } from './LocationMap'
import { escapeHtml } from '../lib/htmlEscape'
import type { PostalPin } from '../types/postalMap'

interface PostalMapProps {
  pins: PostalPin[]
  loading?: boolean
}

export function PostalMap({ pins, loading }: PostalMapProps) {
  const locationPins = pins.map(pin => ({
    id: pin.id,
    lat: pin.lat,
    lon: pin.lon,
    popupHtml: `<strong style="color: #111827;">${escapeHtml(pin.codPostal)}</strong><br/><span style="color: #4b5563;">${escapeHtml(pin.ruleLabel)}</span>`,
  }))

  return <LocationMap pins={locationPins} loading={loading} mapId="coduri-postale-map" />
}

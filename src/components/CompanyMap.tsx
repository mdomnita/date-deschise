import { LocationMap } from './LocationMap'
import { escapeHtml } from '../lib/htmlEscape'

interface CompanyMapProps {
  name: string
  address: string | null
  latitude: number
  longitude: number
}

export function CompanyMap({ name, address, latitude, longitude }: CompanyMapProps) {
  const popupHtml = `<strong style="color: #111827;">${escapeHtml(name)}</strong>`
    + (address ? `<br/><span style="color: #4b5563;">${escapeHtml(address)}</span>` : '')

  const pins = [{ id: 'company', lat: latitude, lon: longitude, popupHtml }]

  return <LocationMap pins={pins} mapId="firma-detail-map" autoOpenPopup />
}

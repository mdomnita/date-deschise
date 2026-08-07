import type { ValutaInfo, CursZi, CursIstoricPunct } from '../types/schimb'

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string

export async function getValute(): Promise<ValutaInfo[]> {
  const res = await fetch(`${BASE_URL}/schimb/valute`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function getValuteByData(data: string): Promise<ValutaInfo[]> {
  const res = await fetch(`${BASE_URL}/schimb/valute/${data}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function getCursZi(valuta: string, data: string): Promise<CursZi> {
  const res = await fetch(`${BASE_URL}/schimb/curs/${valuta}/${data}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function getIstoricCurs(valuta: string, from: string, to: string): Promise<CursIstoricPunct[]> {
  let queryFrom = from;
  let queryTo = to;
  
  if (valuta === 'BGN') {
    const cutoff = '2025-12-31';
    if (queryTo > cutoff) queryTo = cutoff;
    if (queryFrom > cutoff) {
      const dFrom = new Date(from);
      const dTo = new Date(to);
      const diffTime = Math.abs(dTo.getTime() - dFrom.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const newFrom = new Date('2025-12-31');
      newFrom.setDate(newFrom.getDate() - diffDays);
      queryFrom = `${newFrom.getFullYear()}-${String(newFrom.getMonth() + 1).padStart(2, '0')}-${String(newFrom.getDate()).padStart(2, '0')}`;
    }
  }

  const res = await fetch(`${BASE_URL}/schimb/istoric/${valuta}?from=${queryFrom}&to=${queryTo}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

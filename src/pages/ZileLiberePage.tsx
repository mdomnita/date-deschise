import { useState, useEffect } from 'react'
import type { ZiLibera, PunteRecomandare } from '../types/zileLibere'
import { getZileLibere, getZileLibereByLuna, getPunti } from '../services/zileLibereApi'

// --- Helpers ---

const LUNI = [
  'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
  'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie',
]
const LUNI_LOWER = [
  'ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie',
  'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie',
]

function formatFull(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  return `${day} ${LUNI_LOWER[month - 1]} ${year}`
}

function formatShort(dateStr: string): string {
  const [, month, day] = dateStr.split('-').map(Number)
  return `${day} ${LUNI_LOWER[month - 1].slice(0, 3)}.`
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

function compactDate(dateStr: string): string {
  return dateStr.replaceAll('-', '')
}

function compactDatePlusOne(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const next = new Date(Date.UTC(y, m - 1, d + 1))
  return `${next.getUTCFullYear()}${String(next.getUTCMonth() + 1).padStart(2, '0')}${String(next.getUTCDate()).padStart(2, '0')}`
}

function googleCalendarLink({ title, start, end, details }: { title: string; start: string; end?: string; details?: string }): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${compactDate(start)}/${compactDatePlusOne(end ?? start)}`,
  })
  if (details) params.set('details', details)
  return `https://calendar.google.com/calendar/render?${params}`
}

const ZILE_SAPTAMANA_SCURT = ['Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm', 'Dum']

function pad2(n: number): string {
  return n.toString().padStart(2, '0')
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

function firstWeekdayOffset(year: number, month: number): number {
  const jsDay = new Date(year, month - 1, 1).getDay()
  return (jsDay + 6) % 7
}

// --- Shared UI ---

function SkeletonRows() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100" />
      ))}
    </div>
  )
}

function SkeletonCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-44 animate-pulse rounded-2xl bg-gray-100" />
      ))}
    </div>
  )
}

function CalendarPlusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4M12 14v6M9 17h6" />
    </svg>
  )
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-xl border border-red-100 bg-red-50 p-8 text-center">
      <p className="font-medium text-red-600">Nu s-au putut încărca datele</p>
      <p className="mt-1 text-sm text-red-400">{message}</p>
      <button
        onClick={onRetry}
        className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
      >
        Încearcă din nou
      </button>
    </div>
  )
}

// --- Calendar Tab ---

function ZiLiberaRow({ zi }: { zi: ZiLibera }) {
  const isWeekend = zi.cade_in_weekend
  const isPast = zi.data < todayStr()

  return (
    <div
      className={`flex items-center gap-4 rounded-xl border p-4 transition ${
        isWeekend
          ? 'border-amber-100 bg-amber-50/40'
          : 'border-green-100 bg-green-50/30 hover:border-green-200'
      } ${isPast ? 'opacity-50' : ''}`}
    >
      <div className="shrink-0 w-10 text-center">
        <div className="text-xl font-bold leading-none text-gray-900">
          {zi.data.split('-')[2].replace(/^0/, '')}
        </div>
        <div className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-400">
          {zi.zi_saptamana.slice(0, 3)}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 leading-snug">{zi.denumire_sarbatoare}</p>
        {zi.observatii && (
          <p className="mt-0.5 text-xs text-gray-400 truncate">{zi.observatii}</p>
        )}
      </div>

      {isWeekend ? (
        <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
          Weekend
        </span>
      ) : (
        <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
          Zi de lucru
        </span>
      )}

      <a
        href={googleCalendarLink({ title: zi.denumire_sarbatoare, start: zi.data, details: zi.observatii ?? undefined })}
        target="_blank"
        rel="noopener noreferrer"
        title="Adaugă în Google Calendar"
        className="shrink-0 rounded-full border border-gray-200 bg-white p-2 text-gray-400 transition hover:border-blue-200 hover:text-blue-600"
      >
        <CalendarPlusIcon className="h-4 w-4" />
      </a>
    </div>
  )
}

function CalendarTab() {
  const [luna, setLuna] = useState<number | null>(null)
  const [zile, setZile] = useState<ZiLibera[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryToken, setRetryToken] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    async function load() {
      try {
        const data = luna === null ? await getZileLibere() : await getZileLibereByLuna(luna)
        if (!cancelled) setZile(data)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Eroare necunoscută')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [luna, retryToken])

  const today = todayStr()
  const weekdayCount = zile.filter(z => !z.cade_in_weekend).length
  const weekendCount = zile.filter(z => z.cade_in_weekend).length
  const remainingCount = zile.filter(z => z.data >= today).length

  const byMonth = zile.reduce<Record<number, ZiLibera[]>>((acc, z) => {
    const m = parseInt(z.data.split('-')[1], 10)
    if (!acc[m]) acc[m] = []
    acc[m].push(z)
    return acc
  }, {})

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-gray-700 shadow-sm">
            Total <strong className="ml-1">{zile.length}</strong>
          </span>
          <span className="rounded-full border border-green-100 bg-green-50 px-3 py-1 text-sm font-semibold text-green-700">
            Zi de lucru <strong className="ml-1">{weekdayCount}</strong>
          </span>
          <span className="rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
            Weekend <strong className="ml-1">{weekendCount}</strong>
          </span>
          {remainingCount > 0 && (
            <span className="rounded-full border border-purple-100 bg-purple-50 px-3 py-1 text-sm font-semibold text-purple-700">
              Rămase <strong className="ml-1">{remainingCount}</strong>
            </span>
          )}
        </div>

        <select
          id="calendar-luna-select"
          value={luna ?? ''}
          onChange={e => setLuna(e.target.value === '' ? null : parseInt(e.target.value, 10))}
          className="shrink-0 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="">Tot anul</option>
          {LUNI.map((l, i) => (
            <option key={i + 1} value={i + 1}>{l}</option>
          ))}
        </select>
      </div>

      {loading && <SkeletonRows />}

      {!loading && error && (
        <ErrorState message={error} onRetry={() => setRetryToken(t => t + 1)} />
      )}

      {!loading && !error && zile.length === 0 && (
        <div className="py-16 text-center text-gray-400">
          Nu există zile libere în această perioadă.
        </div>
      )}

      {!loading && !error && zile.length > 0 && (
        <div className="space-y-8">
          {luna === null
            ? Object.entries(byMonth)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .map(([month, monthZile]) => (
                  <div key={month}>
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
                      {LUNI[parseInt(month) - 1]}
                    </h3>
                    <div className="space-y-2">
                      {monthZile.map(z => (
                        <ZiLiberaRow key={`${z.data}-${z.denumire_sarbatoare}`} zi={z} />
                      ))}
                    </div>
                  </div>
                ))
            : (
              <div className="space-y-2">
                {zile.map(z => (
                  <ZiLiberaRow key={`${z.data}-${z.denumire_sarbatoare}`} zi={z} />
                ))}
              </div>
            )}
        </div>
      )}
    </div>
  )
}

// --- Calendar Vizual Tab ---

function celulaZiClase(zi: ZiLibera | undefined, esteConcediu: boolean): string {
  if (zi) {
    return zi.cade_in_weekend
      ? 'border-amber-100 bg-amber-50 text-amber-700'
      : 'border-green-100 bg-green-50 text-green-700'
  }
  if (esteConcediu) return 'border-sky-100 bg-sky-50 text-sky-700'
  return 'border-gray-100 bg-white text-gray-500'
}

function LunaGrid({
  an, luna, nume, zileMap, concediuSet, today,
}: {
  an: number
  luna: number
  nume: string
  zileMap: Map<string, ZiLibera>
  concediuSet: Set<string>
  today: string
}) {
  const nrZile = daysInMonth(an, luna)
  const offset = firstWeekdayOffset(an, luna)
  const celule: (string | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: nrZile }, (_, i) => `${an}-${pad2(luna)}-${pad2(i + 1)}`),
  ]

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-gray-700">{nume}</h3>
      <div className="grid grid-cols-7 gap-1">
        {ZILE_SAPTAMANA_SCURT.map(z => (
          <div key={z} className="pb-1 text-center text-[9px] font-semibold uppercase tracking-wide text-gray-400">
            {z[0]}
          </div>
        ))}

        {celule.map((data, i) => {
          if (!data) return <div key={`gol-${i}`} />

          const zi = zileMap.get(data)
          const esteConcediu = !zi && concediuSet.has(data)
          const esteAzi = data === today
          const trecut = data < today

          return (
            <div
              key={data}
              title={zi?.denumire_sarbatoare ?? (esteConcediu ? 'Concediu recomandat (punte)' : undefined)}
              className={`flex aspect-square items-center justify-center rounded-md border text-xs font-semibold transition ${celulaZiClase(zi, esteConcediu)} ${
                trecut ? 'opacity-50' : 'opacity-100'
              } ${esteAzi ? 'ring-2 ring-blue-400 ring-offset-1' : ''}`}
            >
              {parseInt(data.split('-')[2], 10)}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CalendarVizualTab() {
  const [zile, setZile] = useState<ZiLibera[]>([])
  const [punti, setPunti] = useState<PunteRecomandare[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryToken, setRetryToken] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    async function load() {
      try {
        const [zileData, puntiData] = await Promise.all([getZileLibere(), getPunti()])
        if (!cancelled) {
          setZile(zileData)
          setPunti(puntiData)
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Eroare necunoscută')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [retryToken])

  const an = zile.length > 0 ? parseInt(zile[0].data.split('-')[0], 10) : new Date().getFullYear()
  const zileMap = new Map(zile.map(z => [z.data, z]))
  const concediuSet = new Set(punti.flatMap(p => p.zile_concediu))
  const today = todayStr()

  return (
    <div>
      <p className="mb-5 text-sm text-gray-500">
        Vizualizare anuală a sărbătorilor legale, weekendurilor și zilelor de concediu recomandate pentru punți. Zilele din trecut apar semitransparente.
      </p>

      {!loading && !error && (
        <div className="mb-5 flex flex-wrap items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Sărbătoare în weekend
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-green-400" /> Sărbătoare în zi lucrătoare
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-400" /> Concediu recomandat (punte)
          </span>
        </div>
      )}

      {loading && <SkeletonCards />}

      {!loading && error && (
        <ErrorState message={error} onRetry={() => setRetryToken(t => t + 1)} />
      )}

      {!loading && !error && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LUNI.map((nume, i) => (
            <LunaGrid
              key={i + 1}
              an={an}
              luna={i + 1}
              nume={nume}
              zileMap={zileMap}
              concediuSet={concediuSet}
              today={today}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// --- Punti Tab ---

function PunteCard({ punta }: { punta: PunteRecomandare }) {
  const { zile_concediu_necesare: nrConcediu, zile_concediu, zile_libere_legale, zile_libere_totale } = punta

  const isPast = punta.interval_end < todayStr()
  const concediuLabel = nrConcediu === 1 ? 'o zi' : `${nrConcediu} zile`
  const concediuDates = zile_concediu.map(d => formatShort(d)).join(', ')
  const intervalLabel = `${formatFull(punta.interval_start)} – ${formatFull(punta.interval_end)}`

  return (
    <article className={`flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md ${isPast ? 'opacity-50' : ''}`}>
      <div className="flex flex-wrap gap-2">
        <span className="rounded-xl bg-green-100 px-3 py-1.5 text-sm font-bold text-green-700">
          {zile_libere_totale} zile libere
        </span>
        <span className="rounded-xl bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700">
          {nrConcediu} {nrConcediu === 1 ? 'zi' : 'zile'} concediu
        </span>
        {isPast && (
          <span className="rounded-xl bg-gray-100 px-3 py-1.5 text-sm font-semibold text-gray-500">
            Trecut
          </span>
        )}
      </div>

      <p className="text-xs font-medium text-gray-400">{intervalLabel}</p>

      <p className="text-sm leading-relaxed text-gray-800">
        Ia{' '}
        <span className="font-semibold text-blue-700">{concediuLabel} de concediu</span>
        {' '}pe{' '}
        <span className="font-semibold text-blue-700">{concediuDates}</span>
        {' '}și ai{' '}
        <span className="font-bold text-green-700">{zile_libere_totale} zile libere</span>
        {' '}consecutive.
      </p>

      <div>
        <p className="mb-1.5 text-xs font-medium text-gray-400">Sărbători legale incluse</p>
        <div className="flex flex-wrap gap-1.5">
          {zile_libere_legale.map(d => (
            <span key={d} className="rounded-lg bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700">
              {formatShort(d)}
            </span>
          ))}
          {zile_concediu.map(d => (
            <span key={`c-${d}`} className="rounded-lg bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
              {formatShort(d)} ✦
            </span>
          ))}
        </div>
        <p className="mt-1.5 text-[10px] text-gray-300">✦ concediu</p>
      </div>

      <a
        href={googleCalendarLink({
          title: `Punte de ${zile_libere_totale} zile libere`,
          start: punta.interval_start,
          end: punta.interval_end,
          details: `Ia ${concediuLabel} de concediu pe ${concediuDates} și ai ${zile_libere_totale} zile libere consecutive.`,
        })}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-fit items-center gap-2 self-start rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-blue-200 hover:text-blue-600"
      >
        <CalendarPlusIcon className="h-4 w-4" />
        Adaugă în Google Calendar
      </a>
    </article>
  )
}

function PuntiTab() {
  const [punti, setPunti] = useState<PunteRecomandare[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryToken, setRetryToken] = useState(0)
  const [filtruZile, setFiltruZile] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    async function load() {
      try {
        const data = await getPunti()
        if (!cancelled) setPunti(data)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Eroare necunoscută')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [retryToken])

  const optiuniZile = [...new Set(punti.map(p => p.zile_concediu_necesare))].sort((a, b) => a - b)
  const puntiFiltrate = filtruZile === null ? punti : punti.filter(p => p.zile_concediu_necesare <= filtruZile)

  return (
    <div>
      <p className="mb-5 text-sm text-gray-500">
        Sugestii pentru a maximiza timpul liber prin combinarea zilelor de concediu cu weekendurile și sărbătorile legale.
      </p>

      {!loading && !error && punti.length > 0 && (
        <div id="punti-filtru" className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-400">Zile concediu (maxim):</span>
          <button
            onClick={() => setFiltruZile(null)}
            className={`rounded-full px-3.5 py-1 text-sm font-medium transition ${
              filtruZile === null
                ? 'bg-blue-600 text-white shadow-sm'
                : 'border border-gray-200 bg-white text-gray-600 hover:border-blue-200 hover:text-blue-600'
            }`}
          >
            Toate
          </button>
          {optiuniZile.map(n => (
            <button
              key={n}
              onClick={() => setFiltruZile(filtruZile === n ? null : n)}
              className={`rounded-full px-3.5 py-1 text-sm font-medium transition ${
                filtruZile === n
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'border border-gray-200 bg-white text-gray-600 hover:border-blue-200 hover:text-blue-600'
              }`}
            >
              {n} {n === 1 ? 'zi' : 'zile'}
            </button>
          ))}
        </div>
      )}

      {loading && <SkeletonCards />}

      {!loading && error && (
        <ErrorState message={error} onRetry={() => setRetryToken(t => t + 1)} />
      )}

      {!loading && !error && punti.length === 0 && (
        <div className="py-16 text-center text-gray-400">
          Nu există sugestii de punți disponibile.
        </div>
      )}

      {!loading && !error && puntiFiltrate.length === 0 && punti.length > 0 && (
        <div className="py-16 text-center text-gray-400">
          Nu există punți cu exact {filtruZile} {filtruZile === 1 ? 'zi' : 'zile'} de concediu.
        </div>
      )}

      {!loading && !error && puntiFiltrate.length > 0 && (
        <div id="punti-results" className="grid gap-4 sm:grid-cols-2">
          {puntiFiltrate.map((p, i) => (
            <PunteCard key={`${p.interval_start}-${i}`} punta={p} />
          ))}
        </div>
      )}
    </div>
  )
}

// --- Page ---

export function ZileLiberePage() {
  const [tab, setTab] = useState<'calendar' | 'lunar' | 'punti'>('calendar')

  return (
    <main id="zile-libere-page" className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div id="zile-libere-header" className="mb-10 text-center">
        <h1 id="zile-libere-title" className="mb-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Zile Libere & Idei de Concediu
        </h1>
        <p id="zile-libere-subtitle" className="text-gray-500">Calendarul zilelor libere legale din România și sugestii de punți</p>
      </div>

      <div id="zile-libere-tabs" className="mb-8 flex rounded-xl border border-gray-100 bg-gray-50 p-1">
        <button
          id="tab-calendar"
          onClick={() => setTab('calendar')}
          className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
            tab === 'calendar'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Calendar Sărbători Legale
        </button>
        <button
          id="tab-lunar"
          onClick={() => setTab('lunar')}
          className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
            tab === 'lunar'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Calendar Vizual
        </button>
        <button
          id="tab-punti"
          onClick={() => setTab('punti')}
          className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
            tab === 'punti'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Idei de Concediu / Punți
        </button>
      </div>

      <div id="panel-calendar" className={tab !== 'calendar' ? 'hidden' : ''}>
        <CalendarTab />
      </div>
      <div id="panel-lunar" className={tab !== 'lunar' ? 'hidden' : ''}>
        <CalendarVizualTab />
      </div>
      <div id="panel-punti" className={tab !== 'punti' ? 'hidden' : ''}>
        <PuntiTab />
      </div>
    </main>
  )
}

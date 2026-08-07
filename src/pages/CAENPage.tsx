import { useState, useMemo } from 'react'
import { CAENSearchBar, type CAENSuggestionItem } from '../components/CAENSearchBar'
import { CAENResultsList } from '../components/CAENResultsList'
import { CAENResultCard } from '../components/CAENResultCard'
import { CAENHierarchyExplorer } from '../components/CAENHierarchyExplorer'
import { useCAENSearch } from '../hooks/useCAENSearch'
import { useCAENFavorites } from '../hooks/useCAENFavorites'
import type { CAENEntry } from '../types/caen'

const MAX_SUGGESTIONS = 8
const MAX_FAV_SUGGESTIONS = 5

export function CAENPage() {
  const [query, setQuery] = useState('')
  const [showFavorites, setShowFavorites] = useState(true)
  const { results, total, loading, error } = useCAENSearch(query)
  const { favorites, isFavorite, toggleFavorite } = useCAENFavorites()
  const isSearchActive = query.trim().length > 0

  const suggestions = useMemo<CAENSuggestionItem[]>(() => {
    const trimmed = query.trim().toLowerCase()
    if (!trimmed) return []

    const favMatches = favorites
      .filter(f =>
        f.cod_caen.startsWith(trimmed) ||
        f.denumire.toLowerCase().includes(trimmed),
      )
      .slice(0, MAX_FAV_SUGGESTIONS)
      .map(e => ({ ...e, isFavorite: true }))

    const favCodes = new Set(favMatches.map(f => f.cod_caen))
    const otherMatches = results
      .filter(r => !favCodes.has(r.cod_caen))
      .slice(0, MAX_SUGGESTIONS - favMatches.length)
      .map(e => ({ ...e, isFavorite: false }))

    return [...favMatches, ...otherMatches]
  }, [query, favorites, results])

  function handleSelectSuggestion(entry: CAENEntry) {
    setQuery(entry.cod_caen)
  }

  return (
    <main id="caen-page" className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div id="caen-header" className="mb-10 text-center">
        <h1 id="caen-title" className="mb-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Coduri CAEN Rev. 3
        </h1>
        <p id="caen-subtitle" className="text-gray-500">
          Caută orice cod sau explorează ierarhia completă a clasificării CAEN Rev. 3
        </p>
      </div>

      <div id="caen-search-wrapper" className="mb-8 flex justify-center">
        <CAENSearchBar
          value={query}
          onChange={setQuery}
          suggestions={suggestions}
          onSelectSuggestion={handleSelectSuggestion}
        />
      </div>

      {/* Favorites — only when not searching */}
      {!isSearchActive && favorites.length > 0 && (
        <section id="caen-favorites" className="mb-10">
          <button
            id="caen-favorites-toggle"
            onClick={() => setShowFavorites(v => !v)}
            className="mb-4 flex w-full items-center justify-between rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-left transition hover:bg-amber-100"
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-amber-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
              </svg>
              Favorite ({favorites.length})
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`text-amber-500 transition-transform duration-200 ${showFavorites ? 'rotate-180' : ''}`}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {showFavorites && (
            <div className="grid gap-4 sm:grid-cols-2">
              {favorites.map(entry => (
                <CAENResultCard
                  key={entry.cod_caen}
                  entry={entry}
                  isFavorite
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Search results */}
      {isSearchActive && (
        <div id="caen-results">
        <CAENResultsList
          results={results}
          total={total}
          loading={loading}
          error={error}
          query={query}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
        />
        </div>
      )}

      {/* Hierarchy explorer — kept mounted to preserve navigation state */}
      <div id="caen-hierarchy" className={isSearchActive ? 'hidden' : ''}>
        <CAENHierarchyExplorer
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
        />
      </div>
    </main>
  )
}

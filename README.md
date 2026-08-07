# Date Deschise România — Portal date publice

A React frontend for browsing and searching Romanian open data sets, backed by the [caen-api.ro](https://caen-api.ro) REST API.

Currently available datasets:

- **CAEN Rev. 3** — Romanian economic activity codes (NACE Rev. 2.1)
- **SIRUTA** — Administrative-territorial unit codes (localities, communes, cities, municipalities)
- **BNR Exchange Rates** — official daily currency exchange rates against RON

Planned datasets already signaled in the UI roadmap:

- Companies
- Fiscal status / VAT
- Counties and UAT
- COR
- Postal codes
- Public holidays

## Features

- **Full-text search** — query by code or name with debounced live results and autocomplete suggestions
- **Favorites** — pin any entry to localStorage for quick access across sessions
- **Hierarchy explorer** — drill-down navigation (CAEN: sections → divisions → groups → classes; SIRUTA: counties → localities)
- **API documentation** — built-in docs page covering the routes exposed in the frontend, plus Swagger UI for the public API
- **Exchange rates** — browse all currencies, filter by date, and inspect a single currency on a given day
- **Responsive UI** — built with Tailwind CSS v4, works on mobile and desktop

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build tool | Vite 8 |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 |
| API | [caen-api.ro](https://caen-api.ro) |

## Getting Started

**Prerequisites:** Node.js 18+

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Other Commands

```bash
npm run build    # Type-check and build for production
npm run preview  # Preview the production build locally
npm run lint     # Run ESLint
```

## Project Structure

```
src/
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── CAENSearchBar.tsx          # CAEN autocomplete search bar
│   ├── CAENResultCard.tsx         # CAEN result card
│   ├── CAENResultsList.tsx        # CAEN search results list
│   ├── CAENHierarchyExplorer.tsx  # CAEN drill-down explorer
│   ├── SirutaSearchBar.tsx        # SIRUTA autocomplete search bar
│   ├── SirutaResultCard.tsx       # SIRUTA locality card
│   ├── SirutaResultsList.tsx      # SIRUTA search results list
│   ├── SirutaHierarchyExplorer.tsx  # SIRUTA county → localities explorer
│   └── Footer.tsx
├── hooks/
│   ├── useCAENSearch.ts           # Debounced CAEN search with abort-controller
│   ├── useCAENFavorites.ts        # CAEN localStorage favorites
│   ├── useSirutaSearch.ts         # Debounced SIRUTA search
│   └── useSirutaFavorites.ts      # SIRUTA localStorage favorites
├── pages/
│   ├── HomePage.tsx
│   ├── CAENPage.tsx
│   ├── SirutaPage.tsx
│   ├── SchimbPage.tsx
│   ├── DocsPage.tsx
│   └── AboutPage.tsx
├── services/
│   ├── caenApi.ts                 # Typed fetch wrappers — CAEN endpoints
│   ├── sirutaApi.ts               # Typed fetch wrappers — SIRUTA endpoints
│   └── schimbApi.ts               # Typed fetch wrappers — BNR exchange-rate endpoints
└── types/
    ├── caen.ts                    # CAENEntry, SearchResponse, Section, Division, Group
│   ├── siruta.ts                  # LocalitateEntry, LocalitateSearchResponse, Judet
│   └── schimb.ts                  # ValutaInfo, CursZi
```

## API

All data is fetched from `https://caen-api.ro/api`. Full interactive documentation is available at `https://caen-api.ro/api/docs`.

### CAEN Rev. 3

| Endpoint | Description |
|---|---|
| `GET /caen?q=&limit=&offset=` | Search codes by keyword or partial code |
| `GET /caen/{cod}` | Fetch a single entry by its 4-digit code |
| `GET /sectiuni` | List all sections |
| `GET /sectiuni/{cod}/diviziuni` | List divisions within a section |
| `GET /diviziuni/{cod}/grupe` | List groups within a division |
| `GET /grupe/{cod}/clase` | List classes within a group |

### SIRUTA

| Endpoint | Description |
|---|---|
| `GET /siruta/cautare?q=&limit=&offset=` | Search localities by name (min. 2 chars) |
| `GET /siruta/localitate/{cod}` | Fetch a single locality by SIRUTA code |
| `GET /siruta/judete` | List all counties |
| `GET /siruta/judet/{cod_judet}` | List all localities in a county |

### BNR Exchange Rates

| Endpoint | Description |
|---|---|
| `GET /schimb/valute` | List all currencies with the latest published rate |
| `GET /schimb/valute/{data}` | List all currencies available for a specific ISO date |
| `GET /schimb/curs/{valuta}/{data}` | Fetch one currency for a specific ISO date |

## About

Developed by [Mapnology SRL](https://mapnology.eu). Current live data is sourced from Romanian official institutions including INS, ONRC, and BNR. For legal, fiscal, or administrative use, always verify against the original source.

## License

See [LICENSE](LICENSE).

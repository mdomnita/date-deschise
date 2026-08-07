function CodeBlock({ code, language = 'bash' }: { code: string; language?: string }) {
  return (
    <div className="overflow-x-auto rounded-xl bg-gray-900 p-4 text-sm">
      <pre className="text-gray-100">
        <code data-language={language}>{code}</code>
      </pre>
    </div>
  )
}

function ParamRow({ name, type, required, description }: { name: string; type: string; required: boolean; description: string }) {
  return (
    <tr className="border-t border-gray-100">
      <td className="py-2.5 pr-4 align-top font-mono text-sm font-medium text-blue-700">{name}</td>
      <td className="py-2.5 pr-4 align-top text-sm text-gray-500">{type}</td>
      <td className="py-2.5 pr-4 align-top text-sm">
        {required
          ? <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">obligatoriu</span>
          : <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">opțional</span>
        }
      </td>
      <td className="py-2.5 align-top text-sm text-gray-600">{description}</td>
    </tr>
  )
}

function ParamsTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6 overflow-x-auto rounded-xl border border-gray-100 bg-white px-4">
      <table className="w-full">
        <thead>
          <tr>
            <th className="py-2.5 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Nume</th>
            <th className="py-2.5 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Tip</th>
            <th className="py-2.5 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Cerut</th>
            <th className="py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Descriere</th>
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

function SectionLabel({ label }: { label: string }) {
  return (
    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">{label}</h3>
  )
}

function EndpointHeader({ method, path, accent = 'blue' }: { method: string; path: string; accent?: 'blue' | 'emerald' | 'amber' }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
  }
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="rounded-lg bg-green-100 px-2.5 py-1 font-mono text-xs font-bold text-green-700">{method}</span>
      <code className={`rounded-lg px-3 py-1 font-mono text-sm font-semibold ${colors[accent]}`}>{path}</code>
    </div>
  )
}

// ─── SCHIMB ──────────────────────────────────────────────────────────────────

const SCHIMB_VALUTE_FETCH = `const res = await fetch('https://caen-api.ro/api/schimb/valute');
const data = await res.json();
// [{ valuta: "EUR", ultima_data: "2026-06-04", curs_unitar: 5.0291 }, ...]`

const SCHIMB_VALUTE_CURL = `curl "https://caen-api.ro/api/schimb/valute"`

const SCHIMB_VALUTE_BY_DATE_FETCH = `const res = await fetch('https://caen-api.ro/api/schimb/valute/2026-06-03');
const data = await res.json();
// toate valutele disponibile pentru data cerută`

const SCHIMB_VALUTE_BY_DATE_CURL = `curl "https://caen-api.ro/api/schimb/valute/2026-06-03"`

const SCHIMB_CURS_FETCH = `const res = await fetch('https://caen-api.ro/api/schimb/curs/EUR/2026-06-03');
const data = await res.json();
// { data: "2026-06-03", valuta: "EUR", curs: 5.0291, multiplicator: 1, curs_unitar: 5.0291 }`

const SCHIMB_CURS_CURL = `curl "https://caen-api.ro/api/schimb/curs/EUR/2026-06-03"`

const SCHIMB_VALUTE_RESPONSE = `[
  {
    "valuta": "EUR",
    "ultima_data": "2026-06-04",
    "curs_unitar": 5.0291
  },
  {
    "valuta": "USD",
    "ultima_data": "2026-06-04",
    "curs_unitar": 4.6325
  }
]`

const SCHIMB_CURS_RESPONSE = `{
  "data": "2026-06-03",
  "valuta": "EUR",
  "curs": 5.0291,
  "multiplicator": 1,
  "curs_unitar": 5.0291
}`

function SchimbDocsSection() {
  return (
    <section id="schimb">
      <div className="mb-8 flex items-center gap-3">
        <span className="rounded-xl bg-amber-50 px-3 py-1.5 font-mono text-sm font-bold text-amber-700">BNR</span>
        <h2 className="text-xl font-bold text-gray-900">Curs valutar oficial față de RON</h2>
      </div>

      <div className="space-y-10">
        <div>
          <EndpointHeader method="GET" path="/schimb/valute" accent="amber" />
          <p className="mb-5 text-gray-600">
            Returnează lista tuturor valutelor disponibile împreună cu ultima dată publicată și cursul unitar raportat la RON.
          </p>
          <SectionLabel label="Exemple" />
          <div className="space-y-3">
            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-500">JavaScript (fetch)</p>
              <CodeBlock code={SCHIMB_VALUTE_FETCH} language="javascript" />
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-500">cURL</p>
              <CodeBlock code={SCHIMB_VALUTE_CURL} />
            </div>
          </div>
          <SectionLabel label="Răspuns" />
          <CodeBlock code={SCHIMB_VALUTE_RESPONSE} language="json" />
        </div>

        <hr className="border-gray-100" />

        <div>
          <EndpointHeader method="GET" path="/schimb/valute/{data}" accent="amber" />
          <p className="mb-5 text-gray-600">
            Returnează toate cursurile disponibile pentru o dată anume, în format <code className="rounded bg-amber-50 px-1.5 py-0.5 font-mono text-xs text-amber-700">YYYY-MM-DD</code>.
          </p>
          <SectionLabel label="Parametri" />
          <ParamsTable>
            <ParamRow name="data" type="string" required description="Data pentru care se cer cursurile, în format ISO (ex: 2026-06-03)." />
          </ParamsTable>
          <SectionLabel label="Exemple" />
          <div className="space-y-3">
            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-500">JavaScript (fetch)</p>
              <CodeBlock code={SCHIMB_VALUTE_BY_DATE_FETCH} language="javascript" />
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-500">cURL</p>
              <CodeBlock code={SCHIMB_VALUTE_BY_DATE_CURL} />
            </div>
          </div>
          <SectionLabel label="Răspuns" />
          <CodeBlock code={SCHIMB_VALUTE_RESPONSE} language="json" />
        </div>

        <hr className="border-gray-100" />

        <div>
          <EndpointHeader method="GET" path="/schimb/curs/{valuta}/{data}" accent="amber" />
          <p className="mb-5 text-gray-600">
            Returnează cursul pentru o singură valută și o anumită dată. Util pentru interogări punctuale sau afișarea detaliilor unei monede.
          </p>
          <SectionLabel label="Parametri" />
          <ParamsTable>
            <ParamRow name="valuta" type="string" required description="Codul valutei, de regulă ISO 4217, scris cu majuscule (ex: EUR, USD, GBP)." />
            <ParamRow name="data" type="string" required description="Data cursului în format ISO YYYY-MM-DD (ex: 2026-06-03)." />
          </ParamsTable>
          <SectionLabel label="Exemple" />
          <div className="space-y-3">
            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-500">JavaScript (fetch)</p>
              <CodeBlock code={SCHIMB_CURS_FETCH} language="javascript" />
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-500">cURL</p>
              <CodeBlock code={SCHIMB_CURS_CURL} />
            </div>
          </div>
          <SectionLabel label="Răspuns" />
          <CodeBlock code={SCHIMB_CURS_RESPONSE} language="json" />
        </div>

        <hr className="border-gray-100" />

        <div>
          <h3 className="mb-4 text-base font-bold text-gray-900">Schema <code className="rounded bg-amber-50 px-2 py-0.5 font-mono text-sm text-amber-700">ValutaInfo</code></h3>
          <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white px-4">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="py-2.5 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Câmp</th>
                  <th className="py-2.5 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Tip</th>
                  <th className="py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Descriere</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['valuta', 'string', 'Codul valutei'],
                  ['ultima_data', 'string', 'Ultima dată pentru care există curs publicat'],
                  ['curs_unitar', 'number', 'Valoarea unei unități din valută exprimată în RON'],
                ].map(([field, type, desc]) => (
                  <tr key={field} className="border-t border-gray-100">
                    <td className="py-2.5 pr-4 font-mono text-sm font-medium text-amber-700">{field}</td>
                    <td className="py-2.5 pr-4 font-mono text-xs text-gray-400">{type}</td>
                    <td className="py-2.5 text-sm text-gray-600">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-base font-bold text-gray-900">Schema <code className="rounded bg-amber-50 px-2 py-0.5 font-mono text-sm text-amber-700">CursZi</code></h3>
          <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white px-4">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="py-2.5 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Câmp</th>
                  <th className="py-2.5 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Tip</th>
                  <th className="py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Descriere</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['data', 'string', 'Data pentru care a fost returnat cursul'],
                  ['valuta', 'string', 'Codul valutei cerute'],
                  ['curs', 'number', 'Valoarea totală publicată de BNR pentru multiplicatorul monedei'],
                  ['multiplicator', 'integer', 'Numărul de unități valutare la care se referă câmpul curs'],
                  ['curs_unitar', 'number', 'Valoarea unei unități din valută exprimată în RON'],
                ].map(([field, type, desc]) => (
                  <tr key={field} className="border-t border-gray-100">
                    <td className="py-2.5 pr-4 font-mono text-sm font-medium text-amber-700">{field}</td>
                    <td className="py-2.5 pr-4 font-mono text-xs text-gray-400">{type}</td>
                    <td className="py-2.5 text-sm text-gray-600">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── CAEN ────────────────────────────────────────────────────────────────────

const CAEN_SEARCH_FETCH = `const res = await fetch('https://caen-api.ro/api/caen?q=cereale&limit=10');
const data = await res.json();
// { total: 3, results: [...] }`

const CAEN_SEARCH_CURL = `curl "https://caen-api.ro/api/caen?q=cereale&limit=10"`

const CAEN_LOOKUP_FETCH = `const res = await fetch('https://caen-api.ro/api/caen/0111');
const data = await res.json();`

const CAEN_LOOKUP_CURL = `curl "https://caen-api.ro/api/caen/0111"`

const CAEN_SEARCH_RESPONSE = `{
  "total": 3,
  "results": [
    {
      "cod_caen": "0111",
      "denumire": "Cultivarea cerealelor (exclusiv orez), plantelor leguminoase și a plantelor producătoare de semințe oleaginoase",
      "sectiune_cod": "A",
      "sectiune": "Agricultură, silvicultură și pescuit",
      "diviziune_cod": "01",
      "diviziune": "Agricultură, vânătoare și activități de servicii anexe",
      "grupa_cod": "011",
      "grupa": "Cultivarea plantelor nepermanente"
    }
  ]
}`

const CAEN_LOOKUP_RESPONSE = `{
  "cod_caen": "0111",
  "denumire": "Cultivarea cerealelor (exclusiv orez)...",
  "sectiune_cod": "A",
  "sectiune": "Agricultură, silvicultură și pescuit",
  "diviziune_cod": "01",
  "diviziune": "Agricultură, vânătoare și activități de servicii anexe",
  "grupa_cod": "011",
  "grupa": "Cultivarea plantelor nepermanente"
}`

function CAENDocsSection() {
  return (
    <section id="caen">
      <div className="mb-8 flex items-center gap-3">
        <span className="rounded-xl bg-blue-50 px-3 py-1.5 font-mono text-sm font-bold text-blue-700">CAEN Rev. 3</span>
        <h2 className="text-xl font-bold text-gray-900">Clasificarea activităților din economia națională</h2>
      </div>

      <div className="space-y-10">
        {/* GET /caen */}
        <div>
          <EndpointHeader method="GET" path="/caen" accent="blue" />
          <p className="mb-5 text-gray-600">
            Caută coduri CAEN după cod parțial sau text din denumire. Suportă paginare.
          </p>
          <SectionLabel label="Parametri" />
          <ParamsTable>
            <ParamRow name="q" type="string" required description="Text de căutare (cod sau parte din denumire)" />
            <ParamRow name="limit" type="integer" required={false} description="Număr maxim de rezultate. Implicit 50, maxim 200." />
            <ParamRow name="offset" type="integer" required={false} description="Poziția de start pentru paginare. Implicit 0." />
          </ParamsTable>
          <SectionLabel label="Exemple" />
          <div className="space-y-3">
            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-500">JavaScript (fetch)</p>
              <CodeBlock code={CAEN_SEARCH_FETCH} language="javascript" />
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-500">cURL</p>
              <CodeBlock code={CAEN_SEARCH_CURL} />
            </div>
          </div>
          <SectionLabel label="Răspuns" />
          <CodeBlock code={CAEN_SEARCH_RESPONSE} language="json" />
        </div>

        <hr className="border-gray-100" />

        {/* GET /caen/{cod} */}
        <div>
          <EndpointHeader method="GET" path="/caen/{cod}" accent="blue" />
          <p className="mb-5 text-gray-600">
            Returnează detalii complete pentru un cod CAEN exact de 4 cifre.
          </p>
          <SectionLabel label="Parametri" />
          <ParamsTable>
            <ParamRow name="cod" type="string" required description="Codul CAEN de 4 cifre (ex: 0111)" />
          </ParamsTable>
          <SectionLabel label="Exemple" />
          <div className="space-y-3">
            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-500">JavaScript (fetch)</p>
              <CodeBlock code={CAEN_LOOKUP_FETCH} language="javascript" />
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-500">cURL</p>
              <CodeBlock code={CAEN_LOOKUP_CURL} />
            </div>
          </div>
          <SectionLabel label="Răspuns" />
          <CodeBlock code={CAEN_LOOKUP_RESPONSE} language="json" />
        </div>

        <hr className="border-gray-100" />

        <div>
          <h3 className="mb-4 text-base font-bold text-gray-900">Endpoint-uri pentru explorarea ierarhiei</h3>
          <p className="mb-4 text-gray-600">
            Frontend-ul folosește și endpoint-urile de mai jos pentru navigatorul ierarhic CAEN, astfel încât utilizatorii să poată parcurge clasificarea fără căutare textuală.
          </p>
          <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white px-4">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="py-2.5 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Endpoint</th>
                  <th className="py-2.5 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Returnează</th>
                  <th className="py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Descriere</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['/sectiuni', 'Section[]', 'Lista secțiunilor CAEN disponibile.'],
                  ['/sectiuni/{cod}/diviziuni', 'Division[]', 'Diviziunile pentru o secțiune CAEN.'],
                  ['/diviziuni/{cod}/grupe', 'Group[]', 'Grupele dintr-o diviziune CAEN.'],
                  ['/grupe/{cod}/clase', 'CAENEntry[]', 'Clasele finale dintr-o grupă CAEN.'],
                ].map(([endpoint, result, description]) => (
                  <tr key={endpoint} className="border-t border-gray-100">
                    <td className="py-2.5 pr-4 font-mono text-sm font-medium text-blue-700">{endpoint}</td>
                    <td className="py-2.5 pr-4 font-mono text-xs text-gray-400">{result}</td>
                    <td className="py-2.5 text-sm text-gray-600">{description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Schema */}
        <div>
          <h3 className="mb-4 text-base font-bold text-gray-900">Schema <code className="rounded bg-blue-50 px-2 py-0.5 font-mono text-sm text-blue-700">CAENEntry</code></h3>
          <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white px-4">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="py-2.5 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Câmp</th>
                  <th className="py-2.5 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Tip</th>
                  <th className="py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Descriere</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['cod_caen', 'string', 'Codul CAEN (4 cifre)'],
                  ['denumire', 'string', 'Denumirea activității economice'],
                  ['sectiune_cod', 'string', 'Codul secțiunii (ex: A)'],
                  ['sectiune', 'string', 'Denumirea secțiunii'],
                  ['diviziune_cod', 'string', 'Codul diviziunii (ex: 01)'],
                  ['diviziune', 'string', 'Denumirea diviziunii'],
                  ['grupa_cod', 'string', 'Codul grupei (ex: 011)'],
                  ['grupa', 'string', 'Denumirea grupei'],
                ].map(([field, type, desc]) => (
                  <tr key={field} className="border-t border-gray-100">
                    <td className="py-2.5 pr-4 font-mono text-sm font-medium text-blue-700">{field}</td>
                    <td className="py-2.5 pr-4 font-mono text-xs text-gray-400">{type}</td>
                    <td className="py-2.5 text-sm text-gray-600">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── SIRUTA ──────────────────────────────────────────────────────────────────

const SIRUTA_SEARCH_FETCH = `const res = await fetch('https://caen-api.ro/api/siruta/cautare?q=Focșani&limit=10');
const data = await res.json();
// { total: 1, results: [...] }`

const SIRUTA_SEARCH_CURL = `curl "https://caen-api.ro/api/siruta/cautare?q=Focsani&limit=10"`

const SIRUTA_LOOKUP_FETCH = `const res = await fetch('https://caen-api.ro/api/siruta/localitate/152756');
const data = await res.json();`

const SIRUTA_LOOKUP_CURL = `curl "https://caen-api.ro/api/siruta/localitate/152756"`

const SIRUTA_JUDETE_FETCH = `const res = await fetch('https://caen-api.ro/api/siruta/judete');
const judete = await res.json();
// [{ cod_judet: 1, denumire: "ALBA" }, ...]`

const SIRUTA_JUDETE_CURL = `curl "https://caen-api.ro/api/siruta/judete"`

const SIRUTA_JUDET_FETCH = `const res = await fetch('https://caen-api.ro/api/siruta/judet/41');
const localitati = await res.json();
// toate localitățile din Vrancea`

const SIRUTA_JUDET_CURL = `curl "https://caen-api.ro/api/siruta/judet/41"`

const SIRUTA_SEARCH_RESPONSE = `{
  "total": 1,
  "results": [
    {
      "cod_siruta": 152756,
      "denumire": "FOCȘANI",
      "tip_cod": 12,
      "tip_abrev": "M",
      "tip_denumire": "Municipiu",
      "cod_judet": 41,
      "judet_denumire": "VRANCEA"
    }
  ]
}`

const SIRUTA_JUDETE_RESPONSE = `[
  { "cod_judet": 1, "denumire": "ALBA" },
  { "cod_judet": 2, "denumire": "ARAD" },
  ...
]`

const SIRUTA_JUDET_RESPONSE = `[
  {
    "cod_siruta": 152756,
    "denumire": "FOCȘANI",
    "tip_cod": 12,
    "tip_abrev": "M",
    "tip_denumire": "Municipiu",
    "cod_judet": 41,
    "judet_denumire": "VRANCEA"
  },
  {
    "cod_siruta": 152809,
    "denumire": "ADJUD",
    "tip_cod": 13,
    "tip_abrev": "O",
    "tip_denumire": "Oraș",
    "cod_judet": 41,
    "judet_denumire": "VRANCEA"
  }
]`

function SirutaDocsSection() {
  return (
    <section id="siruta">
      <div className="mb-8 flex items-center gap-3">
        <span className="rounded-xl bg-emerald-50 px-3 py-1.5 font-mono text-sm font-bold text-emerald-700">SIRUTA</span>
        <h2 className="text-xl font-bold text-gray-900">Sistemul de identificare a unităților teritoriale</h2>
      </div>

      <div className="space-y-10">
        {/* GET /siruta/cautare */}
        <div>
          <EndpointHeader method="GET" path="/siruta/cautare" accent="emerald" />
          <p className="mb-5 text-gray-600">
            Caută localități după nume (minim 2 caractere). Returnează localități din toată țara. Suportă paginare.
          </p>
          <SectionLabel label="Parametri" />
          <ParamsTable>
            <ParamRow name="q" type="string" required description="Numele localității (minim 2 caractere, ex: Focșani)" />
            <ParamRow name="limit" type="integer" required={false} description="Număr maxim de rezultate. Implicit 50, maxim 200." />
            <ParamRow name="offset" type="integer" required={false} description="Poziția de start pentru paginare. Implicit 0." />
          </ParamsTable>
          <SectionLabel label="Exemple" />
          <div className="space-y-3">
            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-500">JavaScript (fetch)</p>
              <CodeBlock code={SIRUTA_SEARCH_FETCH} language="javascript" />
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-500">cURL</p>
              <CodeBlock code={SIRUTA_SEARCH_CURL} />
            </div>
          </div>
          <SectionLabel label="Răspuns" />
          <CodeBlock code={SIRUTA_SEARCH_RESPONSE} language="json" />
        </div>

        <hr className="border-gray-100" />

        {/* GET /siruta/localitate/{cod} */}
        <div>
          <EndpointHeader method="GET" path="/siruta/localitate/{cod}" accent="emerald" />
          <p className="mb-5 text-gray-600">
            Returnează detalii complete pentru o localitate identificată prin codul SIRUTA numeric.
          </p>
          <SectionLabel label="Parametri" />
          <ParamsTable>
            <ParamRow name="cod" type="integer" required description="Codul SIRUTA numeric unic al localității (ex: 152756)" />
          </ParamsTable>
          <SectionLabel label="Exemple" />
          <div className="space-y-3">
            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-500">JavaScript (fetch)</p>
              <CodeBlock code={SIRUTA_LOOKUP_FETCH} language="javascript" />
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-500">cURL</p>
              <CodeBlock code={SIRUTA_LOOKUP_CURL} />
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* GET /siruta/judete */}
        <div>
          <EndpointHeader method="GET" path="/siruta/judete" accent="emerald" />
          <p className="mb-5 text-gray-600">
            Returnează lista tuturor județelor din România cu codurile lor numerice. Nu necesită parametri.
          </p>
          <SectionLabel label="Exemple" />
          <div className="space-y-3">
            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-500">JavaScript (fetch)</p>
              <CodeBlock code={SIRUTA_JUDETE_FETCH} language="javascript" />
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-500">cURL</p>
              <CodeBlock code={SIRUTA_JUDETE_CURL} />
            </div>
          </div>
          <SectionLabel label="Răspuns" />
          <CodeBlock code={SIRUTA_JUDETE_RESPONSE} language="json" />
        </div>

        <hr className="border-gray-100" />

        {/* GET /siruta/judet/{cod_judet} */}
        <div>
          <EndpointHeader method="GET" path="/siruta/judet/{cod_judet}" accent="emerald" />
          <p className="mb-5 text-gray-600">
            Returnează toate localitățile dintr-un județ. Opțional se poate filtra după tipul unității administrative.
          </p>
          <SectionLabel label="Parametri" />
          <ParamsTable>
            <ParamRow name="cod_judet" type="integer" required description="Codul numeric al județului (ex: 41 pentru Vrancea)" />
            <ParamRow name="tip_cod" type="integer" required={false} description="Filtrare după tip: 10 județ, 11 sector, 12 municipiu, 13 oraș, 17 comună, 18 sat" />
          </ParamsTable>
          <SectionLabel label="Exemple" />
          <div className="space-y-3">
            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-500">JavaScript (fetch)</p>
              <CodeBlock code={SIRUTA_JUDET_FETCH} language="javascript" />
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-500">cURL</p>
              <CodeBlock code={SIRUTA_JUDET_CURL} />
            </div>
          </div>
          <SectionLabel label="Răspuns" />
          <CodeBlock code={SIRUTA_JUDET_RESPONSE} language="json" />
        </div>

        <hr className="border-gray-100" />

        {/* Schema */}
        <div>
          <h3 className="mb-4 text-base font-bold text-gray-900">Schema <code className="rounded bg-emerald-50 px-2 py-0.5 font-mono text-sm text-emerald-700">LocalitateEntry</code></h3>
          <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white px-4">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="py-2.5 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Câmp</th>
                  <th className="py-2.5 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Tip</th>
                  <th className="py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Descriere</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['cod_siruta', 'integer', 'Codul SIRUTA unic al localității'],
                  ['denumire', 'string', 'Denumirea localității'],
                  ['tip_cod', 'integer', 'Codul tipului de unitate administrativă'],
                  ['tip_abrev', 'string', 'Abrevierea tipului (ex: M, O, C, S)'],
                  ['tip_denumire', 'string', 'Denumirea tipului (ex: Municipiu, Oraș, Comună, Sat)'],
                  ['cod_judet', 'integer', 'Codul numeric al județului'],
                  ['judet_denumire', 'string', 'Denumirea județului'],
                ].map(([field, type, desc]) => (
                  <tr key={field} className="border-t border-gray-100">
                    <td className="py-2.5 pr-4 font-mono text-sm font-medium text-emerald-700">{field}</td>
                    <td className="py-2.5 pr-4 font-mono text-xs text-gray-400">{type}</td>
                    <td className="py-2.5 text-sm text-gray-600">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── CONVERSIE CAEN v2/v3 ───────────────────────────────────────────────────

const CAEN_V2_LOOKUP_FETCH = `const res = await fetch('https://caen-api.ro/api/caen/v2/6202');
const data = await res.json();
// { cod: "6202", denumire: "...", corespondente: [{ cod_v3: "6220", ... }] }`

const CAEN_V2_LOOKUP_CURL = `curl "https://caen-api.ro/api/caen/v2/6202"`

const CAEN_V3_PREDECESORI_FETCH = `const res = await fetch('https://caen-api.ro/api/caen/v3/4791/v2');
const data = await res.json();
// { cod: "4791", denumire: "...", predecesori: [{ cod_v2: "4711", ... }, ...] }`

const CAEN_V3_PREDECESORI_CURL = `curl "https://caen-api.ro/api/caen/v3/4791/v2"`

const CAEN_CORESPONDENTA_FETCH = `const res = await fetch('https://caen-api.ro/api/caen/corespondenta?v2=4711&limit=20');
const data = await res.json();
// { total: 2, results: [{ id: 512, cod_v2: "4711", cod_v3: "4711", ... }, ...] }`

const CAEN_CORESPONDENTA_CURL = `curl "https://caen-api.ro/api/caen/corespondenta?v2=4711&limit=20"`

const CAEN_V2_LOOKUP_RESPONSE = `{
  "cod": "6202",
  "denumire": "Activităţi de consultanţă în tehnologia informaţiei",
  "corespondente": [
    {
      "cod_v3": "6220",
      "denumire_v3": "Activităţi de consultanţă în tehnologia informaţiei și de management (gestiune şi exploatare) a mijloacelor de calcul",
      "tip_corespondenta": "AGREGARE"
    }
  ]
}`

const CAEN_V3_PREDECESORI_RESPONSE = `{
  "cod": "4791",
  "denumire": "Intermedieri în comerţul cu amănuntul nespecializat",
  "predecesori": [
    {
      "cod_v2": "4711",
      "denumire_v2": "Comerţ cu amănuntul în magazine nespecializate, cu vânzare predominantă de produse alimentare, băuturi şi tutun",
      "tip_corespondenta": "MIXT"
    },
    {
      "cod_v2": "4719",
      "denumire_v2": "Comerţ cu amănuntul în magazine nespecializate, cu vânzare predominantă de produse nealimentare",
      "tip_corespondenta": "MIXT"
    }
  ]
}`

const CAEN_CORESPONDENTA_RESPONSE = `{
  "total": 2,
  "results": [
    {
      "id": 512,
      "cod_v2": "4711",
      "denumire_v2": "Comerţ cu amănuntul în magazine nespecializate, cu vânzare predominantă de produse alimentare, băuturi şi tutun",
      "cod_v3": "4711",
      "denumire_v3": "Comerţ cu amănuntul nespecializat, cu vânzare predominantă de produse alimentare, băuturi şi tutun",
      "tip_corespondenta": "MIXT"
    },
    {
      "id": 513,
      "cod_v2": "4711",
      "denumire_v2": "Comerţ cu amănuntul în magazine nespecializate, cu vânzare predominantă de produse alimentare, băuturi şi tutun",
      "cod_v3": "4791",
      "denumire_v3": "Intermedieri în comerţul cu amănuntul nespecializat",
      "tip_corespondenta": "MIXT"
    }
  ]
}`

function ConversieCAENDocsSection() {
  return (
    <section id="conversie-caen">
      <div className="mb-8 flex items-center gap-3">
        <span className="rounded-xl bg-blue-50 px-3 py-1.5 font-mono text-sm font-bold text-blue-700">CAEN v2 ↔ v3</span>
        <h2 className="text-xl font-bold text-gray-900">Corespondență CAEN Rev. 2 – Rev. 3</h2>
      </div>

      <div className="space-y-10">
        <div>
          <EndpointHeader method="GET" path="/caen/v2/{cod}" accent="blue" />
          <p className="mb-5 text-gray-600">
            Returnează detaliile unei clase CAEN Rev. 2 împreună cu toate codurile CAEN Rev. 3 corespunzătoare.
          </p>
          <SectionLabel label="Parametri" />
          <ParamsTable>
            <ParamRow name="cod" type="string" required description="Codul CAEN Rev. 2 (2-4 cifre, ex: 6202)." />
          </ParamsTable>
          <SectionLabel label="Exemple" />
          <div className="space-y-3">
            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-500">JavaScript (fetch)</p>
              <CodeBlock code={CAEN_V2_LOOKUP_FETCH} language="javascript" />
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-500">cURL</p>
              <CodeBlock code={CAEN_V2_LOOKUP_CURL} />
            </div>
          </div>
          <SectionLabel label="Răspuns" />
          <CodeBlock code={CAEN_V2_LOOKUP_RESPONSE} language="json" />
        </div>

        <hr className="border-gray-100" />

        <div>
          <EndpointHeader method="GET" path="/caen/v3/{cod}/v2" accent="blue" />
          <p className="mb-5 text-gray-600">
            Returnează codurile CAEN Rev. 2 care corespund unui cod CAEN Rev. 3 dat (predecesorii săi).
          </p>
          <SectionLabel label="Parametri" />
          <ParamsTable>
            <ParamRow name="cod" type="string" required description="Codul CAEN Rev. 3 (2-4 cifre, ex: 4791)." />
          </ParamsTable>
          <SectionLabel label="Exemple" />
          <div className="space-y-3">
            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-500">JavaScript (fetch)</p>
              <CodeBlock code={CAEN_V3_PREDECESORI_FETCH} language="javascript" />
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-500">cURL</p>
              <CodeBlock code={CAEN_V3_PREDECESORI_CURL} />
            </div>
          </div>
          <SectionLabel label="Răspuns" />
          <CodeBlock code={CAEN_V3_PREDECESORI_RESPONSE} language="json" />
        </div>

        <hr className="border-gray-100" />

        <div>
          <EndpointHeader method="GET" path="/caen/corespondenta" accent="blue" />
          <p className="mb-5 text-gray-600">
            Caută înregistrări de corespondență CAEN Rev. 2 ↔ Rev. 3 după cod și/sau tip de corespondență. Suportă paginare.
          </p>
          <SectionLabel label="Parametri" />
          <ParamsTable>
            <ParamRow name="v2" type="string" required={false} description="Filtrează după codul CAEN Rev. 2 (2-4 cifre)." />
            <ParamRow name="v3" type="string" required={false} description="Filtrează după codul CAEN Rev. 3 (2-4 cifre)." />
            <ParamRow name="tip" type="string" required={false} description="Filtrează după tipul de corespondență (ex: NESCHIMBAT, RECODIFICARE, AGREGARE, MIXT)." />
            <ParamRow name="limit" type="integer" required={false} description="Număr maxim de rezultate. Implicit 50, maxim 200." />
            <ParamRow name="offset" type="integer" required={false} description="Poziția de start pentru paginare. Implicit 0." />
          </ParamsTable>
          <SectionLabel label="Exemple" />
          <div className="space-y-3">
            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-500">JavaScript (fetch)</p>
              <CodeBlock code={CAEN_CORESPONDENTA_FETCH} language="javascript" />
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-500">cURL</p>
              <CodeBlock code={CAEN_CORESPONDENTA_CURL} />
            </div>
          </div>
          <SectionLabel label="Răspuns" />
          <CodeBlock code={CAEN_CORESPONDENTA_RESPONSE} language="json" />
        </div>

        <hr className="border-gray-100" />

        <div>
          <h3 className="mb-4 text-base font-bold text-gray-900">Tipuri de corespondență (<code className="rounded bg-blue-50 px-2 py-0.5 font-mono text-sm text-blue-700">tip_corespondenta</code>)</h3>
          <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white px-4">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="py-2.5 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Valoare</th>
                  <th className="py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Descriere</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['NESCHIMBAT', 'Codul a rămas identic din Rev. 2 în Rev. 3 (cod păstrat).'],
                  ['RECODIFICARE', 'Codul a fost renumerotat, corespondența fiind directă (1:1).'],
                  ['AGREGARE', 'Mai multe coduri Rev. 2 au fost reunite într-un singur cod Rev. 3.'],
                  ['MIXT', 'Corespondență parțială/amestecată; activitatea efectivă trebuie verificată pentru alegerea codului corect.'],
                ].map(([tip, desc]) => (
                  <tr key={tip} className="border-t border-gray-100">
                    <td className="py-2.5 pr-4 font-mono text-sm font-medium text-blue-700">{tip}</td>
                    <td className="py-2.5 text-sm text-gray-600">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-gray-500">
            Un cod CAEN Rev. 2 poate corespunde mai multor coduri CAEN Rev. 3 (cod împărțit în mai multe activități) — în acest caz, codul corect trebuie ales în funcție de activitatea desfășurată efectiv, nu presupus automat din prima corespondență returnată.
          </p>
        </div>
      </div>
    </section>
  )
}

// ─── FIRME ───────────────────────────────────────────────────────────────────

const FIRME_SEARCH_FETCH = `const res = await fetch('https://caen-api.ro/api/companii/search?q=OMV+Petrom&limit=5');
const data = await res.json();
// { total: 1, results: [{ name: "OMV PETROM SA", cui: 1590082, ... }] }`

const FIRME_SEARCH_CURL = `curl "https://caen-api.ro/api/companii/search?q=OMV+Petrom&limit=5"`

const FIRME_LOOKUP_FETCH = `const res = await fetch('https://caen-api.ro/api/companii/1590082');
const data = await res.json();`

const FIRME_LOOKUP_CURL = `curl "https://caen-api.ro/api/companii/1590082"`

const FIRME_BILANT_FETCH = `const res = await fetch('https://caen-api.ro/api/companii/1590082/bilant?ani=2022&ani=2023');
const data = await res.json();`

const FIRME_BILANT_CURL = `curl "https://caen-api.ro/api/companii/1590082/bilant?ani=2022&ani=2023"`

const FIRME_SEARCH_RESPONSE = `{
  "total": 1,
  "results": [
    {
      "name": "OMV PETROM SA",
      "cui": 1590082,
      "county": "BUCURESTI",
      "locality": "SECTOR 1",
      "registration_number": "J40/8302/1997",
      "similarity": 0.92
    }
  ]
}`

const FIRME_LOOKUP_RESPONSE = `{
  "name": "OMV PETROM SA",
  "cui": 1590082,
  "registration_number": "J40/8302/1997",
  "registration_date": "1997-05-14",
  "euid": "ROONRC.J40/8302/1997",
  "legal_form": "Societate pe acțiuni",
  "country": "România",
  "county": "BUCURESTI",
  "locality": "SECTOR 1",
  "street": "Str. Coralilor",
  "street_number": "22",
  "building": null,
  "staircase": null,
  "floor": null,
  "apartment": null,
  "postal_code": "013329",
  "sector": "1",
  "address_extra": null,
  "website": "https://www.omvpetrom.com",
  "parent_company_country": "Austria"
}`

const FIRME_BILANT_RESPONSE = `{
  "cui": 1590082,
  "name": "OMV PETROM SA",
  "caen_code": 620,
  "caen_label": "Extracția petrolului brut",
  "years": [
    {
      "year": 2022,
      "indicators": [
        { "label": "Cifra de afaceri netă", "value": 25123456789 },
        { "label": "Profit net", "value": 3456789012 }
      ]
    }
  ],
  "warning": null
}`

function FirmeDocsSection() {
  return (
    <section id="firme">
      <div className="mb-8 flex items-center gap-3">
        <span className="rounded-xl bg-violet-50 px-3 py-1.5 font-mono text-sm font-bold text-violet-700">ONRC</span>
        <h2 className="text-xl font-bold text-gray-900">Date despre firme și bilanțuri financiare</h2>
      </div>

      <div className="space-y-10">
        <div>
          <EndpointHeader method="GET" path="/companii/search" accent="blue" />
          <p className="mb-5 text-gray-600">
            Caută firme după denumire. Rezultatele sunt ordonate după similaritatea textuală cu termenul căutat.
          </p>
          <SectionLabel label="Parametri" />
          <ParamsTable>
            <ParamRow name="q" type="string" required description="Denumirea firmei sau parte din aceasta." />
            <ParamRow name="limit" type="integer" required={false} description="Număr maxim de rezultate. Implicit 1." />
          </ParamsTable>
          <SectionLabel label="Exemple" />
          <div className="space-y-3">
            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-500">JavaScript (fetch)</p>
              <CodeBlock code={FIRME_SEARCH_FETCH} language="javascript" />
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-500">cURL</p>
              <CodeBlock code={FIRME_SEARCH_CURL} />
            </div>
          </div>
          <SectionLabel label="Răspuns" />
          <CodeBlock code={FIRME_SEARCH_RESPONSE} language="json" />
        </div>

        <hr className="border-gray-100" />

        <div>
          <EndpointHeader method="GET" path="/companii/{cui}" accent="blue" />
          <p className="mb-5 text-gray-600">
            Returnează datele de identificare și adresa unei firme, după codul unic de identificare (CUI).
          </p>
          <SectionLabel label="Parametri" />
          <ParamsTable>
            <ParamRow name="cui" type="integer" required description="Codul unic de identificare al firmei (ex: 1590082)." />
          </ParamsTable>
          <SectionLabel label="Exemple" />
          <div className="space-y-3">
            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-500">JavaScript (fetch)</p>
              <CodeBlock code={FIRME_LOOKUP_FETCH} language="javascript" />
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-500">cURL</p>
              <CodeBlock code={FIRME_LOOKUP_CURL} />
            </div>
          </div>
          <SectionLabel label="Răspuns" />
          <CodeBlock code={FIRME_LOOKUP_RESPONSE} language="json" />
        </div>

        <hr className="border-gray-100" />

        <div>
          <EndpointHeader method="GET" path="/companii/{cui}/bilant" accent="blue" />
          <p className="mb-5 text-gray-600">
            Returnează indicatorii financiari din bilanțul depus, pentru unul sau mai mulți ani.
          </p>
          <SectionLabel label="Parametri" />
          <ParamsTable>
            <ParamRow name="cui" type="integer" required description="Codul unic de identificare al firmei." />
            <ParamRow name="ani" type="integer[]" required={false} description="Anii pentru care se cer indicatorii (parametru repetabil, ex: ani=2022&ani=2023). Implicit toți anii disponibili." />
          </ParamsTable>
          <SectionLabel label="Exemple" />
          <div className="space-y-3">
            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-500">JavaScript (fetch)</p>
              <CodeBlock code={FIRME_BILANT_FETCH} language="javascript" />
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-500">cURL</p>
              <CodeBlock code={FIRME_BILANT_CURL} />
            </div>
          </div>
          <SectionLabel label="Răspuns" />
          <CodeBlock code={FIRME_BILANT_RESPONSE} language="json" />
          <p className="mt-3 text-sm text-gray-500">
            Câmpul <code className="rounded bg-blue-50 px-1.5 py-0.5 font-mono text-xs text-blue-700">warning</code> este popular cu un mesaj dacă bilanțul pentru unul sau mai mulți ani ceruți nu este disponibil.
          </p>
        </div>
      </div>
    </section>
  )
}

// ─── ZILE LIBERE ─────────────────────────────────────────────────────────────

const ZILE_LIBERE_FETCH = `const res = await fetch('https://caen-api.ro/api/zilelibere');
const data = await res.json();
// [{ data: "2026-01-01", denumire_sarbatoare: "Anul Nou", ... }, ...]`

const ZILE_LIBERE_CURL = `curl "https://caen-api.ro/api/zilelibere"`

const ZILE_LIBERE_LUNA_FETCH = `const res = await fetch('https://caen-api.ro/api/zilelibere/luna/12');
const data = await res.json();
// zilele libere legale din luna decembrie`

const ZILE_LIBERE_LUNA_CURL = `curl "https://caen-api.ro/api/zilelibere/luna/12"`

const ZILE_LIBERE_PUNTI_FETCH = `const res = await fetch('https://caen-api.ro/api/zilelibere/punti?max_zile_concediu=4&min_zile_libere=3');
const data = await res.json();`

const ZILE_LIBERE_PUNTI_CURL = `curl "https://caen-api.ro/api/zilelibere/punti?max_zile_concediu=4&min_zile_libere=3"`

const ZILE_LIBERE_RESPONSE = `[
  {
    "data": "2026-01-01",
    "zi_saptamana": "Joi",
    "denumire_sarbatoare": "Anul Nou",
    "temei_art_139_codul_muncii": "art. 139 alin. (1) lit. a)",
    "cade_in_weekend": false,
    "observatii": null,
    "sursa_legala": "Codul Muncii",
    "sursa_calendar": "Guvernul României",
    "sursa_verificare_suplimentara": "Ministerul Muncii"
  }
]`

const ZILE_LIBERE_PUNTI_RESPONSE = `[
  {
    "interval_start": "2026-01-01",
    "interval_end": "2026-01-04",
    "zile_libere_totale": 4,
    "zile_concediu_necesare": 1,
    "zile_concediu": ["2026-01-02"],
    "zile_libere_legale": ["2026-01-01"]
  }
]`

function ZileLibereDocsSection() {
  return (
    <section id="zilelibere">
      <div className="mb-8 flex items-center gap-3">
        <span className="rounded-xl bg-rose-50 px-3 py-1.5 font-mono text-sm font-bold text-rose-700">Codul Muncii</span>
        <h2 className="text-xl font-bold text-gray-900">Zile libere legale și punți de concediu</h2>
      </div>

      <div className="space-y-10">
        <div>
          <EndpointHeader method="GET" path="/zilelibere" accent="emerald" />
          <p className="mb-5 text-gray-600">
            Returnează lista tuturor zilelor libere legale din anul curent, conform art. 139 din Codul Muncii.
          </p>
          <SectionLabel label="Exemple" />
          <div className="space-y-3">
            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-500">JavaScript (fetch)</p>
              <CodeBlock code={ZILE_LIBERE_FETCH} language="javascript" />
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-500">cURL</p>
              <CodeBlock code={ZILE_LIBERE_CURL} />
            </div>
          </div>
          <SectionLabel label="Răspuns" />
          <CodeBlock code={ZILE_LIBERE_RESPONSE} language="json" />
        </div>

        <hr className="border-gray-100" />

        <div>
          <EndpointHeader method="GET" path="/zilelibere/luna/{luna}" accent="emerald" />
          <p className="mb-5 text-gray-600">
            Returnează zilele libere legale dintr-o anumită lună.
          </p>
          <SectionLabel label="Parametri" />
          <ParamsTable>
            <ParamRow name="luna" type="integer" required description="Numărul lunii, de la 1 (ianuarie) la 12 (decembrie)." />
          </ParamsTable>
          <SectionLabel label="Exemple" />
          <div className="space-y-3">
            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-500">JavaScript (fetch)</p>
              <CodeBlock code={ZILE_LIBERE_LUNA_FETCH} language="javascript" />
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-500">cURL</p>
              <CodeBlock code={ZILE_LIBERE_LUNA_CURL} />
            </div>
          </div>
          <SectionLabel label="Răspuns" />
          <CodeBlock code={ZILE_LIBERE_RESPONSE} language="json" />
        </div>

        <hr className="border-gray-100" />

        <div>
          <EndpointHeader method="GET" path="/zilelibere/punti" accent="emerald" />
          <p className="mb-5 text-gray-600">
            Recomandă intervale ("punți") în care câteva zile de concediu, combinate cu zilele libere legale și weekendurile, produc o vacanță mai lungă.
          </p>
          <SectionLabel label="Parametri" />
          <ParamsTable>
            <ParamRow name="max_zile_concediu" type="integer" required={false} description="Numărul maxim de zile de concediu de folosit pentru o punte. Implicit 4." />
            <ParamRow name="min_zile_libere" type="integer" required={false} description="Numărul minim de zile libere consecutive rezultate pentru a recomanda puntea. Implicit 3." />
          </ParamsTable>
          <SectionLabel label="Exemple" />
          <div className="space-y-3">
            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-500">JavaScript (fetch)</p>
              <CodeBlock code={ZILE_LIBERE_PUNTI_FETCH} language="javascript" />
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-500">cURL</p>
              <CodeBlock code={ZILE_LIBERE_PUNTI_CURL} />
            </div>
          </div>
          <SectionLabel label="Răspuns" />
          <CodeBlock code={ZILE_LIBERE_PUNTI_RESPONSE} language="json" />
        </div>

        <hr className="border-gray-100" />

        <div>
          <h3 className="mb-4 text-base font-bold text-gray-900">Schema <code className="rounded bg-emerald-50 px-2 py-0.5 font-mono text-sm text-emerald-700">ZiLibera</code></h3>
          <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white px-4">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="py-2.5 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Câmp</th>
                  <th className="py-2.5 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Tip</th>
                  <th className="py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Descriere</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['data', 'string', 'Data zilei libere, format ISO YYYY-MM-DD'],
                  ['zi_saptamana', 'string', 'Ziua săptămânii'],
                  ['denumire_sarbatoare', 'string', 'Denumirea sărbătorii legale'],
                  ['temei_art_139_codul_muncii', 'string', 'Temeiul legal din Codul Muncii'],
                  ['cade_in_weekend', 'boolean', 'Dacă data respectivă cade sâmbătă sau duminică'],
                  ['observatii', 'string | null', 'Observații suplimentare, dacă există'],
                  ['sursa_legala', 'string', 'Sursa legală care reglementează ziua liberă'],
                  ['sursa_calendar', 'string', 'Sursa calendarului oficial'],
                  ['sursa_verificare_suplimentara', 'string', 'Sursă adițională de verificare'],
                ].map(([field, type, desc]) => (
                  <tr key={field} className="border-t border-gray-100">
                    <td className="py-2.5 pr-4 font-mono text-sm font-medium text-emerald-700">{field}</td>
                    <td className="py-2.5 pr-4 font-mono text-xs text-gray-400">{type}</td>
                    <td className="py-2.5 text-sm text-gray-600">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function DocsPage() {
  return (
    <main id="docs-page" className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div id="docs-header" className="mb-10">
        <h1 id="docs-title" className="mb-2 text-3xl font-bold tracking-tight text-gray-900">
          Documentație API
        </h1>
        <p id="docs-subtitle" className="text-gray-500">
          API-uri REST gratuite pentru date publice din România. Toate endpoint-urile returnează JSON, iar documentația de mai jos acoperă rutele folosite în frontend.
        </p>
        <div id="docs-base-url" className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
          <span className="text-sm font-semibold text-gray-600">Base URL</span>
          <code className="ml-2 font-mono text-sm text-gray-800">https://caen-api.ro/api</code>
          <a
            href="https://caen-api.ro/api/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-xs text-blue-600 underline underline-offset-2 hover:text-blue-800"
          >
            Swagger UI →
          </a>
        </div>

        {/* Section nav */}
        <div id="docs-nav" className="mt-5 flex flex-wrap gap-2">
          <a
            href="#caen"
            className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
          >
            <span className="font-mono">CAEN</span>
            <span className="text-blue-400">Rev. 3</span>
          </a>
          <a
            href="#conversie-caen"
            className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
          >
            <span className="font-mono">CAEN v2 ↔ v3</span>
          </a>
          <a
            href="#siruta"
            className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
          >
            <span className="font-mono">SIRUTA</span>
          </a>
          <a
            href="#schimb"
            className="flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
          >
            <span className="font-mono">BNR</span>
            <span className="text-amber-500">Curs valutar</span>
          </a>
          <a
            href="#firme"
            className="flex items-center gap-2 rounded-xl border border-violet-100 bg-violet-50 px-4 py-2.5 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
          >
            <span className="font-mono">ONRC</span>
            <span className="text-violet-400">Firme</span>
          </a>
          <a
            href="#zilelibere"
            className="flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
          >
            <span className="font-mono">Zile libere</span>
          </a>
        </div>
      </div>

      <div className="space-y-16">
        <CAENDocsSection />
        <hr className="border-gray-200" />
        <ConversieCAENDocsSection />
        <hr className="border-gray-200" />
        <SirutaDocsSection />
        <hr className="border-gray-200" />
        <SchimbDocsSection />
        <hr className="border-gray-200" />
        <FirmeDocsSection />
        <hr className="border-gray-200" />
        <ZileLibereDocsSection />
      </div>
    </main>
  )
}

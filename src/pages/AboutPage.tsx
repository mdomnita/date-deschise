export function AboutPage() {
  return (
    <main id="about-page" className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 id="about-title" className="mb-2 text-3xl font-bold tracking-tight text-gray-900">
        Despre proiect
      </h1>
      <p id="about-subtitle" className="mb-10 text-gray-500">
        Context despre platformă, sursele de date utilizate, endpoint-urile disponibile și direcțiile de extindere.
      </p>

      <div className="space-y-10">
        <section id="about-ce-este" className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm">
          <h2 className="mb-3 text-lg font-bold text-gray-900">Ce este Date Deschise România</h2>
          <p className="leading-relaxed text-gray-600">
            Date Deschise România este interfața web publică pentru API-ul{' '}
            <a
              href="https://caen-api.ro/api/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-800"
            >
              caen-api.ro
            </a>
            . Platforma este dezvoltată și operată de{' '}
            <a
              href="https://mapnology.eu"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-800"
            >
              Mapnology SRL
            </a>
            , cu scopul de a transforma seturi de date publice românești în endpoint-uri REST moderne,
            ușor de integrat în aplicații, formulare, procese interne și produse software.
          </p>
        </section>

        <section id="about-disponibil" className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm">
          <h2 className="mb-3 text-lg font-bold text-gray-900">Ce este disponibil acum</h2>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
              <span>
                <strong className="text-gray-800">CAEN Rev. 3</strong> pentru căutare rapidă, sugestii și explorarea ierarhiei complete.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
              <span>
                <strong className="text-gray-800">SIRUTA</strong> pentru localități, județe și navigare administrativ-teritorială.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
              <span>
                <strong className="text-gray-800">Curs valutar BNR</strong> pentru cursurile oficiale publicate zilnic față de RON, cu istoric al cursurilor
                și convertor valutar cu TVA inclus.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-500" />
              <span>
                <strong className="text-gray-800">Căutare firme</strong> după CUI sau denumire, cu detalii despre fiecare companie și date financiare
                (cifră de afaceri, profit, angajați) preluate din bilanțurile depuse.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
              <span>
                <strong className="text-gray-800">Conversie CAEN Rev. 2 ↔ Rev. 3</strong> pentru corespondența dintre codurile din cele două clasificări.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
              <span>
                <strong className="text-gray-800">Zile libere legale</strong> din România, cu sugestii de punți și posibilitatea de a adăuga zilele
                direct în Google Calendar.
              </span>
            </li>
          </ul>
          <p className="mt-5 leading-relaxed text-gray-600">
            În interfața principală sunt afișate și seturi de date marcate „În construcție”. Acestea reprezintă direcții de extindere ale proiectului,
            nu endpoint-uri publice active în acest moment.
          </p>
        </section>

        <section id="about-surse" className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm">
          <h2 className="mb-3 text-lg font-bold text-gray-900">Surse de date și acuratețe</h2>
          <p className="mb-4 leading-relaxed text-gray-600">
            Datele utilizate în platformă provin din surse oficiale românești și sunt transformate într-un format API consistent.
            În funcție de setul de date, sursele curente includ:
          </p>
          <ul className="mb-4 space-y-2 text-gray-600">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
              <span>
                <strong className="text-gray-800">INS</strong> – Institutul Național de
                Statistică, pentru clasificări și nomenclatoare precum CAEN și SIRUTA.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
              <span>
                <strong className="text-gray-800">ONRC</strong> – Oficiul Național al
                Registrului Comerțului, pentru context operațional legat de utilizarea codurilor CAEN, căutarea firmelor și datele lor financiare.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
              <span>
                <strong className="text-gray-800">BNR</strong> – Banca Națională a României, pentru cursurile valutare oficiale.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
              <span>
                <strong className="text-gray-800">data.gov.ro și alte surse oficiale</strong> – pentru extinderile viitoare ale platformei.
              </span>
            </li>
          </ul>
          <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Datele au caracter informativ. Pentru uz juridic, fiscal sau administrativ oficial, consultați întotdeauna sursele originale publicate de instituția emitentă.
          </div>
        </section>

        <section id="about-opensource" className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm">
          <h2 className="mb-3 text-lg font-bold text-gray-900">Open-source și integrare</h2>
          <p className="mb-4 leading-relaxed text-gray-600">
            Frontend-ul acestui portal este open-source, iar documentația API este disponibilă public atât în site, cât și în Swagger UI.
            Dacă vrei să urmărești evoluția proiectului sau să contribui, folosește resursele de mai jos:
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              Cod sursă:{' '}
              <a
                href="https://github.com/mapnology/date-deschise"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-800"
              >
                github.com/mapnology/date-deschise
              </a>
            </li>
            <li>
              Documentație interactivă API:{' '}
              <a
                href="https://caen-api.ro/api/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-800"
              >
                caen-api.ro/api/docs
              </a>
            </li>
          </ul>
        </section>

        <section id="about-contact" className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm">
          <h2 className="mb-3 text-lg font-bold text-gray-900">Contact</h2>
          <p className="mb-4 leading-relaxed text-gray-600">
            Pentru întrebări, sugestii, parteneriate sau propuneri de noi seturi de date, ne poți contacta la:
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              Email:{' '}
              <a
                href="mailto:administrator@mapnology.eu"
                className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-800"
              >
                administrator@mapnology.eu
              </a>
            </li>
            <li>
              Web:{' '}
              <a
                href="https://mapnology.eu"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-800"
              >
                mapnology.eu
              </a>
            </li>
          </ul>
        </section>
      </div>
    </main>
  )
}

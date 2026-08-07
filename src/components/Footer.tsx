export function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-100 px-6 py-10 text-sm text-gray-500">
      {/* Slogan banner */}
      <div className="mx-auto mb-8 max-w-4xl text-center">
        <p className="text-base font-medium text-gray-700">
          Date guvernamentale din România, transformate în API-uri moderne pentru developeri
        </p>
        <p className="mt-1.5 text-xs text-gray-400">
          Proiect independent, open-source — contribuie pe{' '}
          <a
            href="https://github.com/mapnology/date-deschise"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-gray-600"
          >
            GitHub
          </a>{' '}
          sau
          {' '}
          <a
            href="https://github.com/sponsors/mdomnita"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-gray-600"
          >
            susține proiectul
          </a>
        </p>
      </div>

      <div className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-3">
        <div>
          <h3 className="mb-2 font-semibold text-gray-700">Despre</h3>
          <p className="leading-relaxed">
            Proiect independent dezvoltat de{' '}
            <a
              href="https://mapnology.eu"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-gray-700"
            >
              Mapnology SRL
            </a>{' '}
            pentru accesarea datelor publice din România printr-un API modern. Cod sursă disponibil public.
          </p>
        </div>
        <div>
          <h3 className="mb-2 font-semibold text-gray-700">Contact</h3>
          <ul className="space-y-1 leading-relaxed">
            <li>
              <a
                href="mailto:administrator@mapnology.eu"
                className="underline underline-offset-2 hover:text-gray-700"
              >
                administrator@mapnology.eu
              </a>
            </li>
            <li>
              <a
                href="https://mapnology.eu"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-gray-700"
              >
                mapnology.eu
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="mb-2 font-semibold text-gray-700">Sursă</h3>
          <p className="leading-relaxed">
            Datele provin din surse oficiale românești, inclusiv INS, ONRC, BNR și data.gov.ro, și au caracter informativ.
            Pentru uz oficial, consultați sursele originale.
          </p>
        </div>
      </div>
    </footer>
  )
}

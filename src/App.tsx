import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { HomePage } from './pages/HomePage'
import { CAENPage } from './pages/CAENPage'
import { SirutaPage } from './pages/SirutaPage'
import { SchimbPage } from './pages/SchimbPage'
import { ZileLiberePage } from './pages/ZileLiberePage'
import { DocsPage } from './pages/DocsPage'
import { AboutPage } from './pages/AboutPage'
import { FirmePage } from './pages/FirmePage'
import { FirmaDetailPage } from './pages/FirmaDetailPage'
import { DateFinanciarePage } from './pages/DateFinanciarePage'
import { ConversieCAENPage } from './pages/ConversieCAENPage'
import { CoduriPostalePage } from './pages/CoduriPostalePage'

const PAGE_TITLES: Record<string, string> = {
  '/': 'Date Deschise',
  '/caen': 'Coduri CAEN Rev. 3',
  '/siruta': 'Coduri SIRUTA',
  '/schimb': 'Curs Valutar BNR',
  '/coduri-postale': 'Coduri Poștale',
  '/zile-libere': 'Zile Libere & Idei de Concediu',
  '/firme': 'Căutare Firme',
  '/date-financiare': 'Date Financiare Firme',
  '/conversie-caen': 'Conversie CAEN Rev. 2 – Rev. 3',
  '/documentatie': 'Documentație API',
  '/despre': 'Despre proiect',
}

function PageTitleUpdater() {
  const location = useLocation()
  useEffect(() => {
    const title = PAGE_TITLES[location.pathname] || PAGE_TITLES['/']
    document.title = title
  }, [location.pathname])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <PageTitleUpdater />
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/caen" element={<CAENPage />} />
            <Route path="/siruta" element={<SirutaPage />} />
            <Route path="/schimb" element={<SchimbPage />} />
            <Route path="/coduri-postale" element={<CoduriPostalePage />} />
            <Route path="/zile-libere" element={<ZileLiberePage />} />
            <Route path="/firme" element={<FirmePage />} />
            <Route path="/firme/:cui" element={<FirmaDetailPage />} />
            <Route path="/date-financiare" element={<DateFinanciarePage />} />
            <Route path="/conversie-caen" element={<ConversieCAENPage />} />
            <Route path="/documentatie" element={<DocsPage />} />
            <Route path="/despre" element={<AboutPage />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
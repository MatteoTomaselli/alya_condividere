'use client';

import EventCarousel from '@/components/EventCarousel';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function Home() {
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-pink-100 relative">
      {/* Side Menu Overlay */}
      {sideMenuOpen && (
        <div 
          className="fixed inset-0 z-40 pointer-events-none"
          onClick={() => setSideMenuOpen(false)}
        />
      )}

      {/* Side Menu */}
      <div 
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 z-50 ${
          sideMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          <button
            onClick={() => setSideMenuOpen(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
          
          <div className="mt-12">
            <Link
              href="/"
              className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-gray-100 transition text-gray-900 font-semibold mb-4"
              onClick={() => setSideMenuOpen(false)}
            >
              <i className="mdi mdi-home text-2xl" />
              Home Page
            </Link>
            <Link
              href="/about"
              className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-gray-100 transition text-gray-900 font-semibold mb-4"
              onClick={() => setSideMenuOpen(false)}
            >
              <i className="mdi mdi-information-variant-circle text-2xl" />
              Chi Siamo
            </Link>
            <button
              onClick={() => {
                const element = document.getElementById('collaborations');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                  setSideMenuOpen(false);
                }
              }}
              className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-gray-100 transition text-gray-900 font-semibold w-full text-left"
            >
              <i className="mdi mdi-handshake text-2xl" />
              Con chi collaboriamo
            </button>
          </div>
        </div>
      </div>
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <button
            onClick={() => setSideMenuOpen(!sideMenuOpen)}
            className="text-gray-900 font-bold text-2xl hover:text-amber-600 transition"
          >
            ☰
          </button>
          <Link href="/" className="flex items-center gap-4 hover:opacity-80 transition">
            <div className="w-14 h-14 relative">
              <Image 
                src="/alya-logo.jpeg" 
                alt="Alya Logo" 
                width={56} 
                height={56}
                className="rounded-full"
              />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold italic text-gray-900">Alya</h1>
              <p className="text-sm font-semibold italic text-gray-600">Crea, Condividi, Vivi</p>
            </div>
          </Link>
          <Link
            href="/admin"
            className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition"
          >
            <i className="mdi mdi-account text-2xl" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Logo Card */}
        <div className="shadow-lg p-12 flex justify-center mb-16 rounded-lg border-4 border-white" style={{ backgroundColor: '#EEEDEB' }}>
          <div className="w-80 h-80 relative overflow-hidden">
            <Image 
              src="/alya-logo.jpeg" 
              alt="Alya Logo"
              fill
              className="object-cover rounded-full"
            />
          </div>
        </div>

        {/* Next Events Section */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">Prossimi Eventi</h3>
          <EventCarousel />
        </div>

        {/* Activities Section */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">Le nostre attività</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Creative Labs */}
            <div className="bg-white p-8 rounded-lg shadow-lg border-t-4 border-pink-400">
              <h4 className="text-2xl font-bold text-black mb-4">🎨 Laboratori Creativi</h4>
              <p className="text-gray-700">
                Spazi pensati per stimolare la tua creatività e permetterti di sperimentare diverse tecniche artistiche. Un luogo dove esprimere la tua fantasia, scoprire nuove passioni e creare qualcosa di unico e personale, in un ambiente accogliente e ispirato.
              </p>
            </div>

            {/* Wellness Activities */}
            <div className="bg-white p-8 rounded-lg shadow-lg border-t-4 border-purple-400">
              <h4 className="text-2xl font-bold text-black mb-4">🌸 Attività di Benessere</h4>
              <p className="text-gray-700">
                Momenti dedicati al relax e alla cura di sé, pensati per rigenerarti corpo e mente. Attività che favoriscono il benessere personale, il rilassamento e l'armonia, in un ambiente tranquillo e rigenerante.
              </p>
            </div>
          </div>

          {/* Community & Sharing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-lg border-t-4 border-green-400 hover:shadow-lg transition">
              <h4 className="text-2xl font-bold text-black mb-4">👥 Comunità Accogliente</h4>
              <p className="text-gray-700">
                Incontri in piccoli gruppi per mantenere un'atmosfera intima e favorire le connessioni
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg border-t-4 border-amber-400 hover:shadow-lg transition">
              <h4 className="text-2xl font-bold text-black mb-4">🤝 Condivisione Autentica</h4>
              <p className="text-gray-700">
                Momenti di convivialità e connessione autentica in un ambiente sicuro e inclusivo
              </p>
            </div>
          </div>
        </div>

        {/* Collaborations Section */}
        <div className="mb-16" id="collaborations">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">Con chi collaboriamo</h3>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-lg border-t-4 border-blue-900">
              <h4 className="text-2xl font-bold text-black mb-4">🏞️ Cascina Argentera</h4>
              <p className="text-gray-700">
                Una location meravigliosa e accogliente nel cuore della Cascina, perfetta per i nostri eventi e attività. Uno spazio dove la natura incontra la creatività, un'oasi di pace e ispirazione.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-between items-start">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1">
              <div>
                <h4 className="text-lg font-semibold mb-4">Alya</h4>
                <p className="text-gray-400 text-sm">
                  Spazio creativo e di benessere per donne e ragazze. Un progetto di Giorgia e Valeria.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Link Utili</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <button 
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      className="hover:text-amber-400 transition cursor-pointer"
                    >
                      Home
                    </button>
                  </li>
                  <li><Link href="/about" className="hover:text-amber-400 transition">Chi Siamo</Link></li>
                  <li><Link href="/admin" className="hover:text-amber-400 transition">Area Admin</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Contatti</h4>
                <div className="flex gap-3 mb-4">
                  <a href="https://www.instagram.com/alya.condividere" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-amber-400 transition">
                    <i className="mdi mdi-instagram text-2xl" />
                  </a>
                  <a href="https://www.facebook.com/share/1HNSQR6Leb/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-amber-400 transition">
                    <i className="mdi mdi-facebook text-2xl" />
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <i className="mdi mdi-email text-gray-400" />
                  <p className="text-gray-400 text-sm">alya.condividere@gmail.com</p>
                </div>
              </div>
            </div>
            <div className="w-20 h-20 relative ml-8">
              <Image 
                src="/alya-logo.jpeg" 
                alt="Alya Logo" 
                width={80} 
                height={80}
                className="rounded-full"
              />
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 flex justify-end">
            <p className="text-gray-400 text-sm">© 2026 Alya - Crea, Condividi, Vivi. Tutti i diritti riservati.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

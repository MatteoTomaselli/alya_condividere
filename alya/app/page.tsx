import EventCarousel from '@/components/EventCarousel';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Alya Events</h1>
          </div>
          <Link
            href="/admin"
            className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition"
          >
            Admin
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Scopri i nostri prossimi eventi
          </h2>
          <p className="text-xl text-gray-600">
            Scegli gli eventi che ti interessano e prenota i tuoi posti ora
          </p>
        </div>

        {/* Event Carousel */}
        <div className="mb-12">
          <EventCarousel />
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="text-lg font-semibold mb-2">Eventi Curati</h3>
            <p className="text-gray-600">
              Selezioniamo con cura gli eventi migliori per offrirti esperienze indimenticabili
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl mb-3">📅</div>
            <h3 className="text-lg font-semibold mb-2">Facile da Prenotare</h3>
            <p className="text-gray-600">
              Prenota i tuoi posti in pochi click e iscrivi più persone contemporaneamente
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl mb-3">✨</div>
            <h3 className="text-lg font-semibold mb-2">Sicuro e Affidabile</h3>
            <p className="text-gray-600">
              Le tue informazioni sono protette secondo i più alti standard di sicurezza
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">Alya Events</h4>
              <p className="text-gray-400">
                Scopri e prenota i migliori eventi della tua città
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Link Utili</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/" className="hover:text-white">Home</Link></li>
                <li><Link href="/admin" className="hover:text-white">Area Admin</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contatti</h4>
              <p className="text-gray-400">info@alya-events.it</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <p className="text-gray-400 text-sm">© 2026 Alya Events. Tutti i diritti riservati.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

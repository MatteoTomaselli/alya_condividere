'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { formatDate } from '@/lib/dateFormatter';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  max_capacity: number;
  price: string;
  image_url: string;
  available_seats: number;
}

interface Photo {
  id: string;
  url: string;
  uploadedAt: string;
}

export default function EventGallery() {
  const params = useParams();
  const eventId = params.id as string;
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchEventAndPhotos = async () => {
      try {
        const eventResponse = await fetch(`/api/events/${eventId}`, { cache: 'no-store' });
        const eventData = await eventResponse.json();
        setEvent(eventData);
        
        // Fetch photos for this event (stored in public/event-photos/{eventId})
        try {
          const photosResponse = await fetch(`/api/photos?event_id=${eventId}`);
          if (photosResponse.ok) {
            const photosData = await photosResponse.json();
            setPhotos(photosData);
          }
        } catch (err) {
          console.log('No photos yet for this event');
        }
      } catch (err) {
        console.error('Errore nel caricamento dell\'evento:', err);
        setError('Errore nel caricamento dell\'evento');
      } finally {
        setLoading(false);
      }
    };

    // Check if user is admin
    const adminEmail = localStorage.getItem('admin_email');
    const adminSession = localStorage.getItem('admin_session');
    setIsAdmin(!!(adminEmail && adminSession));

    fetchEventAndPhotos();
  }, [eventId]);

  // Handle keyboard navigation for the photo modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedPhotoIndex === null) return;
      
      if (e.key === 'Escape') {
        setSelectedPhotoIndex(null);
      } else if (e.key === 'ArrowRight') {
        setSelectedPhotoIndex((prev) => (prev! + 1) % photos.length);
      } else if (e.key === 'ArrowLeft') {
        setSelectedPhotoIndex((prev) => (prev! - 1 + photos.length) % photos.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhotoIndex, photos.length]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError('');

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('event_id', eventId);

        const response = await fetch('/api/photos', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Errore caricamento immagine');
        }
      }

      // Reload photos
      const photosResponse = await fetch(`/api/photos?event_id=${eventId}`);
      if (photosResponse.ok) {
        const photosData = await photosResponse.json();
        setPhotos(photosData);
      }
    } catch (err) {
      console.error('Errore:', err);
      setError(err instanceof Error ? err.message : 'Errore durante il caricamento delle immagini');
    } finally {
      setUploading(false);
      if (e.currentTarget) {
        e.currentTarget.value = '';
      }
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa foto?')) return;

    try {
      const response = await fetch('/api/photos', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ photoId })
      });

      if (response.ok) {
        setPhotos(photos.filter(p => p.id !== photoId));
      } else {
        setError('Errore nell\'eliminazione della foto');
      }
    } catch (err) {
      console.error('Errore:', err);
      setError('Errore nell\'eliminazione della foto');
    }
  };

  const handleDownloadPhoto = async (photo: Photo) => {
    try {
      // Usa l'endpoint proxy per evitare problemi CORS
      const encodedUrl = encodeURIComponent(photo.url);
      const response = await fetch(`/api/photos/download?url=${encodedUrl}`);
      
      if (!response.ok) {
        throw new Error('Errore nel download');
      }
      
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `alya-${photo.id.split('/')[1]}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Errore download:', err);
      setError('Errore durante il download della foto');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-pink-100 flex items-center justify-center">
        <p className="text-gray-600">Caricamento...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-pink-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Evento non trovato</p>
          <Link href="/events" className="text-pink-400 hover:text-pink-500 font-semibold">
            Torna agli eventi
          </Link>
        </div>
      </div>
    );
  }

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
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 z-50 ${sideMenuOpen ? 'translate-x-0' : '-translate-x-full'
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
              href="/events"
              className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-gray-100 transition text-gray-900 font-semibold mb-4"
              onClick={() => setSideMenuOpen(false)}
            >
              <i className="mdi mdi-calendar text-2xl" />
              Eventi
            </Link>
            <Link
              href="/about"
              className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-gray-100 transition text-gray-900 font-semibold mb-4"
              onClick={() => setSideMenuOpen(false)}
            >
              <i className="mdi mdi-information-variant-circle text-2xl" />
              Chi Siamo
            </Link>
            <Link
              href="/collaborations"
              className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-gray-100 transition text-gray-900 font-semibold"
              onClick={() => setSideMenuOpen(false)}
            >
              <i className="mdi mdi-handshake text-2xl" />
              I nostri spazi
            </Link>
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
                src="/logo_alya_def.jpeg"
                alt="Alya Logo"
                width={56}
                height={56}
                className="rounded-full"
              />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold italic text-gray-900 breathing">Alya</h1>
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Link */}
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-pink-400 hover:text-pink-500 font-semibold mb-8"
        >
          <i className="mdi mdi-arrow-left" />
          Torna agli eventi
        </Link>

        {/* Event Info */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
          <div className="space-y-1 text-gray-600">
            <p><span className="font-semibold">Data:</span> {formatDate(event.date)} - {event.time}</p>
            <p><span className="font-semibold">Luogo:</span> {event.location}</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Upload Section */}
        {isAdmin ? (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Carica Foto</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-pink-400 transition">
              <div className="mb-4">
                <i className="mdi mdi-camera-plus text-5xl text-gray-400" />
              </div>
              <p className="text-gray-600 mb-4">Clicca o trascina le immagini qui per caricarle</p>
              <label className="inline-block">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                  className="hidden"
                />
                <span className="inline-block bg-pink-400 hover:bg-pink-500 text-white font-bold py-2 px-6 rounded-lg cursor-pointer transition disabled:opacity-50">
                  {uploading ? 'Caricamento...' : 'Seleziona Immagini'}
                </span>
              </label>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-300 rounded-lg p-6 mb-8">
            <p className="text-blue-700">Solo gli admin possono caricare foto. <Link href="/admin" className="font-semibold hover:underline">Accedi come admin</Link></p>
          </div>
        )}

        {/* Photos Gallery */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Foto della Galleria ({photos.length})
          </h2>
          
          {photos.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <p className="text-gray-600">Nessuna foto ancora. Inizia a caricare!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {photos.map((photo, index) => (
                <div key={photo.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
                  <div 
                    className="h-48 relative bg-gray-100 flex items-center justify-center cursor-pointer hover:opacity-90 transition"
                    onClick={() => setSelectedPhotoIndex(index)}
                  >
                    <Image
                      src={photo.url}
                      alt="Foto evento"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDownloadPhoto(photo)}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition"
                      >
                        <i className="mdi mdi-download" /> Scarica
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => handleDeletePhoto(photo.id)}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition"
                        >
                          <i className="mdi mdi-trash-can-outline" /> Elimina
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Photo Modal */}
      {selectedPhotoIndex !== null && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={() => setSelectedPhotoIndex(null)}
        >
          {/* Close button */}
          <button
            onClick={() => setSelectedPhotoIndex(null)}
            className="absolute top-6 right-6 text-white hover:text-gray-300 text-4xl font-bold z-50"
          >
            ✕
          </button>

          <div 
            className="relative w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Main Image */}
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={photos[selectedPhotoIndex].url}
                alt="Foto ingrandita"
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Previous Button */}
            <button
              onClick={() => setSelectedPhotoIndex((prev) => (prev! - 1 + photos.length) % photos.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition z-10"
            >
              <i className="mdi mdi-chevron-left text-3xl" />
            </button>

            {/* Next Button */}
            <button
              onClick={() => setSelectedPhotoIndex((prev) => (prev! + 1) % photos.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition z-10"
            >
              <i className="mdi mdi-chevron-right text-3xl" />
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-center text-gray-400">© 2024 Alya Condividere. Tutti i diritti riservati.</p>
        </div>
      </footer>
    </div>
  );
}

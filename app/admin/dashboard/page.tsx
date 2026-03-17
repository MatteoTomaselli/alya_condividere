'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/dateFormatter';

interface Person {
  name: string;
  surname: string;
  email: string;
  dateOfBirth: string;
  phone: string;
  allergies?: string;
}

interface Booking {
  id: number;
  event_id: number;
  people: string;
  status: string;
  created_at: string;
  photo_auth?: boolean;
}

interface Event {
  id: number;
  title: string;
  description?: string;
  date: string;
  time: string;
  location?: string;
  max_capacity: number;
  price?: string;
  image_url?: string;
  booked_seats?: number;
  available_seats?: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingBooking, setEditingBooking] = useState<number | null>(null);
  const [editingPeople, setEditingPeople] = useState<Person[]>([]);
  const [eventPhotos, setEventPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    max_capacity: 20,
    price: '',
    image_url: ''
  });
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [uploadingEventImage, setUploadingEventImage] = useState(false);
  const [eventImagePreview, setEventImagePreview] = useState<string>('');
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [editingEventData, setEditingEventData] = useState<Partial<Event>>({});

  useEffect(() => {
    const adminEmail = localStorage.getItem('admin_email');
    const adminSession = localStorage.getItem('admin_session');
    
    if (!adminEmail || !adminSession) {
      router.push('/admin');
      return;
    }
    
    setIsAuthorized(true);
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const [eventsRes, bookingsRes] = await Promise.all([
        fetch('/api/events'),
        fetch('/api/bookings')
      ]);

      const eventsData = await eventsRes.json();
      const bookingsData = await bookingsRes.json();

      // Carica i posti prenotati per ogni evento
      const eventsWithBookings = await Promise.all(
        eventsData.map(async (event: Event) => {
          const eventResponse = await fetch(`/api/events/${event.id}`);
          const eventData = await eventResponse.json();
          return eventData;
        })
      );

      setEvents(eventsWithBookings);
      setBookings(bookingsData);
      
      if (eventsWithBookings.length > 0) {
        setSelectedEvent(eventsWithBookings[0].id);
      }
    } catch (error) {
      console.error('Errore nel caricamento dei dati:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_email');
    localStorage.removeItem('admin_session');
    router.push('/admin');
  };

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking.id);
    setEditingPeople(JSON.parse(booking.people));
  };

  const handleSaveBooking = async (bookingId: number) => {
    try {
      const adminEmail = localStorage.getItem('admin_email');
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Email': adminEmail || ''
        },
        body: JSON.stringify({ people: editingPeople })
      });

      if (response.ok) {
        setEditingBooking(null);
        fetchData();
      }
    } catch (error) {
      console.error('Errore nell\'aggiornamento:', error);
    }
  };

  const handleDeleteBooking = async (bookingId: number) => {
    if (!confirm('Sei sicuro di voler eliminare questa prenotazione?')) return;

    try {
      const adminEmail = localStorage.getItem('admin_email');
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'X-Admin-Email': adminEmail || ''
        }
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Errore nell\'eliminazione:', error);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newEvent.title || !newEvent.date || !newEvent.time || !newEvent.location || !newEvent.price) {
      alert('Compila tutti i campi obbligatori');
      return;
    }

    if (!newEvent.image_url) {
      alert('Carica un\'immagine per l\'evento');
      return;
    }

    setCreatingEvent(true);
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent)
      });

      if (response.ok) {
        alert('Evento creato con successo!');
        setShowCreateEvent(false);
        setNewEvent({
          title: '',
          description: '',
          date: '',
          time: '',
          location: '',
          max_capacity: 20,
          price: '',
          image_url: ''
        });
        setEventImagePreview('');
        fetchData();
      } else {
        alert('Errore nella creazione dell\'evento');
      }
    } catch (error) {
      console.error('Errore:', error);
      alert('Errore nella creazione dell\'evento');
    } finally {
      setCreatingEvent(false);
    }
  };

  const handleEventImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;

    setUploadingEventImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('event_id', '0');

      const response = await fetch('/api/photos', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setNewEvent(prev => ({ ...prev, image_url: data.url }));
        setEventImagePreview(data.url);
      } else {
        alert('Errore caricamento immagine: ' + data.error);
      }
    } catch (error) {
      console.error('Errore:', error);
      alert('Errore durante il caricamento dell\'immagine');
    } finally {
      setUploadingEventImage(false);
      if (e.currentTarget) {
        e.currentTarget.value = '';
      }
    }
  };

  const handleDeleteEvent = async (eventId: number, eventTitle: string) => {
    if (!confirm(`Sei sicuro di voler eliminare l'evento "${eventTitle}"? Questa azione eliminerà anche tutte le prenotazioni associate.`)) return;

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        alert('Evento eliminato con successo!');
        if (selectedEvent === eventId) {
          setSelectedEvent(null);
        }
        fetchData();
      } else {
        alert('Errore nell\'eliminazione dell\'evento');
      }
    } catch (error) {
      console.error('Errore:', error);
      alert('Errore nell\'eliminazione dell\'evento');
    }
  };

  const handleEditEvent = (event: Event) => {
    setEditingEventId(event.id);
    setEditingEventData({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      max_capacity: event.max_capacity,
      price: event.price,
      image_url: event.image_url
    });
  };

  const handleUpdateEvent = async () => {
    // Verifica più dettagliatamente i campi
    const missingFields = [];
    if (!editingEventId) missingFields.push('ID evento');
    if (!editingEventData.title) missingFields.push('Titolo');
    if (!editingEventData.date) missingFields.push('Data');
    if (!editingEventData.time) missingFields.push('Ora');
    if (!editingEventData.location) missingFields.push('Luogo');
    if (!editingEventData.price) missingFields.push('Prezzo');
    if (!editingEventData.max_capacity) missingFields.push('Posti disponibili');

    if (missingFields.length > 0) {
      alert('Compila i campi obbligatori:\n- ' + missingFields.join('\n- '));
      return;
    }

    try {
      const response = await fetch(`/api/events/${editingEventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingEventData)
      });

      const responseData = await response.json();

      if (response.ok) {
        alert('Evento aggiornato con successo!');
        setEditingEventId(null);
        setEditingEventData({});
        fetchData();
      } else {
        alert('Errore nell\'aggiornamento dell\'evento: ' + (responseData.error || 'Errore sconosciuto'));
        console.error('API Error:', responseData);
      }
    } catch (error) {
      console.error('Errore:', error);
      alert('Errore nell\'aggiornamento dell\'evento: ' + (error as Error).message);
    }
  };

  const handleCancelEditEvent = () => {
    setEditingEventId(null);
    setEditingEventData({});
  };

  const filteredBookings = selectedEvent
    ? bookings.filter(b => b.event_id === selectedEvent)
    : bookings;

  const selectedEventInfo = events.find(e => e.id === selectedEvent);

  useEffect(() => {
    if (selectedEvent) {
      loadEventPhotos();
    }
  }, [selectedEvent]);

  const loadEventPhotos = async () => {
    if (!selectedEvent) return;
    
    try {
      console.log('Loading photos for event:', selectedEvent);
      const response = await fetch(`/api/photos?event_id=${selectedEvent}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Photos loaded:', data);
        setEventPhotos(data.photos || []);
      } else {
        console.error('Failed to load photos:', response.status);
      }
    } catch (error) {
      console.error('Errore caricamento foto:', error);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files || !selectedEvent) {
      console.log('No files or selectedEvent:', { hasFiles: !!files, selectedEvent });
      return;
    }

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('file', files[i]);
        formData.append('event_id', selectedEvent.toString());

        console.log('Uploading file:', files[i].name, 'for event:', selectedEvent);

        const response = await fetch('/api/photos', {
          method: 'POST',
          body: formData
        });

        const data = await response.json();
        console.log('Upload response:', { ok: response.ok, data });

        if (response.ok) {
          setEventPhotos(prev => [...prev, data.url]);
        } else {
          console.error('Upload failed:', data.error);
        }
      }
    } catch (error) {
      console.error('Errore caricamento foto:', error);
      alert('Errore durante il caricamento: ' + (error as Error).message);
    } finally {
      setUploading(false);
      if (e.currentTarget) {
        e.currentTarget.value = '';
      }
    }
  };

  const handleDeletePhoto = async (index: number) => {
    const photoUrl = eventPhotos[index];
    try {
      await fetch('/api/photos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: photoUrl })
      });
      setEventPhotos(prev => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error('Errore eliminazione foto:', error);
    }
  };

  const handleDownloadPhoto = async (photo: string, index: number) => {
    try {
      // Estrai il nome del file dall'URL
      const urlParts = photo.split('/');
      const filename = urlParts[urlParts.length - 1];
      
      // Fetcha il file
      const response = await fetch(photo);
      if (!response.ok) throw new Error('Errore download');
      
      const blob = await response.blob();
      
      // Crea un link e scarica
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Errore download foto:', error);
      alert('Errore durante il download');
    }
  };

  if (!isAuthorized) {
    return <div className="min-h-screen flex items-center justify-center">Verifica autorizzazione...</div>;
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
              Con chi collaboriamo
            </Link>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <button
            onClick={() => setSideMenuOpen(!sideMenuOpen)}
            className="text-gray-900 font-bold text-2xl hover:text-amber-600 transition"
          >
            ☰
          </button>
          <div className="flex items-center gap-3 hover:opacity-80 cursor-pointer">
            <div className="w-10 h-10 bg-pink-400 rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-lg">A</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Alya Admin</h1>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-8">Caricamento dati...</div>
        ) : (
          <div>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm">Totale Eventi</p>
                <p className="text-3xl font-bold text-blue-600">{events.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm">Totale Prenotazioni</p>
                <p className="text-3xl font-bold text-green-600">{bookings.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm">Partecipanti Confermati</p>
                <p className="text-3xl font-bold text-purple-600">
                  {bookings.reduce((sum, b) => sum + JSON.parse(b.people).length, 0)}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm">Posti Utilizzati</p>
                <p className="text-3xl font-bold text-orange-600">
                  {bookings.reduce((sum, b) => sum + JSON.parse(b.people).length, 0)}/
                  {events.reduce((sum, e) => sum + e.max_capacity, 0)}
                </p>
              </div>
            </div>

            {/* Crea Nuovo Evento */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-black">Crea Nuovo Evento</h2>
                <button
                  onClick={() => setShowCreateEvent(!showCreateEvent)}
                  className="px-4 py-2 bg-pink-400 hover:bg-pink-500 text-white rounded-lg transition font-semibold"
                >
                  {showCreateEvent ? 'Chiudi' : 'Nuovo Evento'}
                </button>
              </div>

              {showCreateEvent && (
                <form onSubmit={handleCreateEvent} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">Titolo *</label>
                      <input
                        type="text"
                        required
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-black"
                        placeholder="Es. Paint your Totebag con aperitivo"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">Data *</label>
                      <input
                        type="date"
                        required
                        value={newEvent.date}
                        onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">Ora *</label>
                      <input
                        type="time"
                        required
                        value={newEvent.time}
                        onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">Posti Disponibili *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={newEvent.max_capacity || ''}
                        onChange={(e) => setNewEvent({...newEvent, max_capacity: e.target.value ? parseInt(e.target.value) : 20})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">Prezzo (€) *</label>
                      <input
                        type="text"
                        required
                        value={newEvent.price}
                        onChange={(e) => setNewEvent({...newEvent, price: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-black"
                        placeholder="Es. 22 o 15.50"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Luogo *</label>
                    <input
                      type="text"
                      required
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-black"
                      placeholder="Es. Cascina Argentera, Torino"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Descrizione</label>
                    <textarea
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-black"
                      placeholder="Descrizione dell'evento"
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Immagine Evento *</label>
                    <div className="flex gap-4 items-start">
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleEventImageUpload}
                          disabled={uploadingEventImage}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                        />
                        {uploadingEventImage && <p className="text-sm text-gray-600 mt-2">Caricamento...</p>}
                        {newEvent.image_url && <p className="text-sm text-green-600 mt-2">✓ Immagine caricata</p>}
                      </div>
                      {eventImagePreview && (
                        <div className="w-24 h-24 flex-shrink-0 relative rounded-lg overflow-hidden border border-gray-200">
                          <img
                            src={eventImagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={creatingEvent}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition"
                    >
                      {creatingEvent ? 'Creando...' : 'Crea Evento'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateEvent(false);
                        setNewEvent({
                          title: '',
                          description: '',
                          date: '',
                          time: '',
                          location: '',
                          max_capacity: 20,
                          price: '',
                          image_url: ''
                        });
                        setEventImagePreview('');
                      }}
                      className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition"
                    >
                      Annulla
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Selezione Evento */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-bold mb-4 text-black">Seleziona Evento</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {events.map(event => (
                  <div
                    key={event.id}
                    className={`p-6 rounded-lg border-2 transition ${
                      selectedEvent === event.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <button
                        onClick={() => setSelectedEvent(event.id)}
                        className="flex-1 text-left"
                      >
                        <h3 className="font-semibold text-lg text-gray-900">{event.title}</h3>
                        <p className="text-base text-gray-600 mt-1">{formatDate(event.date)} - {event.time}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Posti disponibili: <span className="font-bold">{event.available_seats}/{event.max_capacity}</span>
                        </p>
                      </button>
                      <button
                        onClick={() => handleEditEvent(event)}
                        className="ml-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg transition"
                        title="Modifica evento"
                      >
                        <i className="mdi mdi-pencil text-2xl" />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id, event.title)}
                        className="ml-2 text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition"
                        title="Elimina evento"
                      >
                        <i className="mdi mdi-delete text-2xl" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modifica Evento */}
            {editingEventId && (
              <div className="bg-white rounded-lg shadow p-6 mb-8 border-l-4 border-blue-500">
                <h2 className="text-xl font-bold text-black mb-6">Modifica Evento</h2>
                <form onSubmit={(e) => { e.preventDefault(); handleUpdateEvent(); }} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">Titolo *</label>
                      <input
                        type="text"
                        required
                        value={editingEventData.title || ''}
                        onChange={(e) => setEditingEventData({...editingEventData, title: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">Data *</label>
                      <input
                        type="date"
                        required
                        value={editingEventData.date || ''}
                        onChange={(e) => setEditingEventData({...editingEventData, date: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">Ora *</label>
                      <input
                        type="time"
                        required
                        value={editingEventData.time || ''}
                        onChange={(e) => setEditingEventData({...editingEventData, time: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">Posti Disponibili *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={editingEventData.max_capacity || ''}
                        onChange={(e) => setEditingEventData({...editingEventData, max_capacity: e.target.value ? parseInt(e.target.value) : 20})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">Prezzo (€) *</label>
                      <input
                        type="text"
                        required
                        value={editingEventData.price || ''}
                        onChange={(e) => setEditingEventData({...editingEventData, price: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Luogo *</label>
                    <input
                      type="text"
                      required
                      value={editingEventData.location || ''}
                      onChange={(e) => setEditingEventData({...editingEventData, location: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Descrizione</label>
                    <textarea
                      value={editingEventData.description || ''}
                      onChange={(e) => setEditingEventData({...editingEventData, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold"
                    >
                      Salva Modifiche
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEditEvent}
                      className="px-6 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg transition font-semibold"
                    >
                      Annulla
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Prenotazioni */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-black">
                  Prenotazioni {selectedEventInfo ? `- ${selectedEventInfo.title}` : ''}
                </h2>
              </div>

              {filteredBookings.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  Nessuna prenotazione per questo evento
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">ID</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Nome</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Cognome</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Data di Nascita</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Telefono</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Allergie</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Foto/Video</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Data Prenotazione</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Stato</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Azioni</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredBookings.map(booking => {
                        const people = JSON.parse(booking.people) as Person[];
                        const isEditing = editingBooking === booking.id;

                        return (
                          <tr key={booking.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-base text-gray-900">{booking.id}</td>
                            {people.map((p, idx) => (
                              <td key={idx} colSpan={people.length === 1 ? 1 : 0} className="px-6 py-4 text-base">
                                {isEditing ? (
                                  <div className="space-y-1">
                                    <input
                                      type="text"
                                      value={p.name}
                                      onChange={(e) => {
                                        const newPeople = [...editingPeople];
                                        newPeople[idx].name = e.target.value;
                                        setEditingPeople(newPeople);
                                      }}
                                      className="block w-full px-2 py-1 border rounded text-sm text-black"
                                      placeholder="Nome"
                                    />
                                  </div>
                                ) : (
                                  <div className="text-sm text-gray-900">{p.name}</div>
                                )}
                              </td>
                            ))}
                            {people.map((p, idx) => (
                              <td key={`surname-${idx}`} className="px-6 py-4 text-base">
                                {isEditing ? (
                                  <div className="space-y-1">
                                    <input
                                      type="text"
                                      value={p.surname}
                                      onChange={(e) => {
                                        const newPeople = [...editingPeople];
                                        newPeople[idx].surname = e.target.value;
                                        setEditingPeople(newPeople);
                                      }}
                                      className="block w-full px-2 py-1 border rounded text-sm text-black"
                                      placeholder="Cognome"
                                    />
                                  </div>
                                ) : (
                                  <div className="text-sm text-gray-900">{p.surname}</div>
                                )}
                              </td>
                            ))}
                            {people.map((p, idx) => (
                              <td key={`email-${idx}`} className="px-6 py-4 text-base">
                                {isEditing ? (
                                  <input
                                    type="email"
                                    value={p.email}
                                    onChange={(e) => {
                                      const newPeople = [...editingPeople];
                                      newPeople[idx].email = e.target.value;
                                      setEditingPeople(newPeople);
                                    }}
                                    className="w-full px-2 py-1 border rounded text-sm text-black"
                                    placeholder="Email"
                                  />
                                ) : (
                                  <div className="text-sm text-gray-600">{p.email}</div>
                                )}
                              </td>
                            ))}
                            {people.map((p, idx) => (
                              <td key={`dob-${idx}`} className="px-6 py-4 text-base">
                                {isEditing ? (
                                  <input
                                    type="date"
                                    value={p.dateOfBirth}
                                    onChange={(e) => {
                                      const newPeople = [...editingPeople];
                                      newPeople[idx].dateOfBirth = e.target.value;
                                      setEditingPeople(newPeople);
                                    }}
                                    className="w-full px-2 py-1 border rounded text-sm text-black"
                                  />
                                ) : (
                                  <div className="text-sm text-gray-600">{formatDate(p.dateOfBirth)}</div>
                                )}
                              </td>
                            ))}
                            {people.map((p, idx) => (
                              <td key={`phone-${idx}`} className="px-6 py-4 text-base">
                                {isEditing ? (
                                  <input
                                    type="tel"
                                    value={p.phone}
                                    onChange={(e) => {
                                      const newPeople = [...editingPeople];
                                      newPeople[idx].phone = e.target.value;
                                      setEditingPeople(newPeople);
                                    }}
                                    className="w-full px-2 py-1 border rounded text-sm text-black"
                                    placeholder="Telefono"
                                  />
                                ) : (
                                  <div className="text-sm text-gray-600">{p.phone}</div>
                                )}
                              </td>
                            ))}
                            {people.map((p, idx) => (
                              <td key={`allergies-${idx}`} className="px-6 py-4 text-base">
                                {isEditing ? (
                                  <textarea
                                    value={p.allergies || ''}
                                    onChange={(e) => {
                                      const newPeople = [...editingPeople];
                                      newPeople[idx].allergies = e.target.value;
                                      setEditingPeople(newPeople);
                                    }}
                                    className="w-full px-2 py-1 border rounded text-sm text-black"
                                    placeholder="Allergie"
                                    rows={1}
                                  />
                                ) : (
                                  <div className="text-sm text-gray-600">{p.allergies || '-'}</div>
                                )}
                              </td>
                            ))}
                            <td className="px-6 py-4 text-base">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${booking.photo_auth ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {booking.photo_auth ? 'Sì' : 'No'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-base text-gray-600">
                              {formatDate(booking.created_at)}
                            </td>
                            <td className="px-6 py-4 text-base">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                {booking.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-base space-x-2 flex">
                              {isEditing ? (
                                <>
                                  <button
                                    onClick={() => handleSaveBooking(booking.id)}
                                    className="text-green-600 hover:text-green-800 font-semibold"
                                  >
                                    Salva
                                  </button>
                                  <button
                                    onClick={() => setEditingBooking(null)}
                                    className="text-gray-600 hover:text-gray-800"
                                  >
                                    Annulla
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleEditBooking(booking)}
                                    className="text-blue-600 hover:text-blue-800"
                                  >
                                    <i className="mdi mdi-pencil text-xl" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteBooking(booking.id)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <i className="mdi mdi-delete text-xl" />
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Sezione Foto */}
      {selectedEventInfo && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-black">
                Foto Evento - {selectedEventInfo.title}
              </h2>
            </div>

            <div className="p-6">
              {/* Caricamento Foto */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-black mb-4">
                  Carica foto dell'evento
                </label>
                <div className="border-2 border-dashed border-pink-300 rounded-lg p-6 text-center hover:bg-pink-50 transition cursor-pointer">
                  <input
                    type="file"
                    id="photo-upload"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="cursor-pointer block"
                  >
                    <i className="mdi mdi-cloud-upload text-4xl text-pink-400 mb-2" />
                    <p className="text-gray-600 font-medium">
                      {uploading ? 'Caricamento in corso...' : 'Clicca per selezionare le foto o trascinale qui'}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">PNG, JPG, GIF fino a 10MB</p>
                  </label>
                </div>
              </div>

              {/* Galleria Foto */}
              {eventPhotos.length > 0 ? (
                <div>
                  <h3 className="text-lg font-semibold text-black mb-4">Foto caricate ({eventPhotos.length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {eventPhotos.map((photo, index) => (
                      <div key={index} className="relative group rounded-lg overflow-hidden shadow-md">
                        <img
                          src={photo}
                          alt={`Foto ${index + 1}`}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition">
                          <button
                            onClick={() => handleDownloadPhoto(photo, index)}
                            className="text-white hover:text-amber-400 transition"
                            title="Scarica foto"
                          >
                            <i className="mdi mdi-download text-3xl" />
                          </button>
                          <button
                            onClick={() => handleDeletePhoto(index)}
                            className="text-white hover:text-red-400 transition"
                            title="Elimina foto"
                          >
                            <i className="mdi mdi-delete text-3xl" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  Nessuna foto caricata ancora
                </p>
              )}
            </div>
          </div>
        </div>
      )}

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
                    <Link href="/" className="hover:text-amber-400 transition">
                      Home
                    </Link>
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

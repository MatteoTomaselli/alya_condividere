'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/dateFormatter';

interface Person {
  name: string;
  surname: string;
  email: string;
  dateOfBirth: string;
  phone: string;
}

interface Booking {
  id: number;
  event_id: number;
  people: string;
  status: string;
  created_at: string;
}

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  max_capacity: number;
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

      setEvents(eventsData);
      setBookings(bookingsData);
      
      if (eventsData.length > 0) {
        setSelectedEvent(eventsData[0].id);
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

  const filteredBookings = selectedEvent
    ? bookings.filter(b => b.event_id === selectedEvent)
    : bookings;

  const selectedEventInfo = events.find(e => e.id === selectedEvent);

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
              href="/about"
              className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-gray-100 transition text-gray-900 font-semibold"
              onClick={() => setSideMenuOpen(false)}
            >
              <i className="mdi mdi-information-variant-circle text-2xl" />
              Chi Siamo
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

            {/* Selezione Evento */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-bold mb-4 text-black">Seleziona Evento</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {events.map(event => (
                  <button
                    key={event.id}
                    onClick={() => setSelectedEvent(event.id)}
                    className={`p-6 rounded-lg border-2 transition text-left min-h-[150px] flex flex-col justify-between ${
                      selectedEvent === event.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <h3 className="font-semibold text-gray-900">{event.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{formatDate(event.date)} - {event.time}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Posti: {event.max_capacity}
                    </p>
                  </button>
                ))}
              </div>
            </div>

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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Nome</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Cognome</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Data di Nascita</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Telefono</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Data Prenotazione</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Stato</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Azioni</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredBookings.map(booking => {
                        const people = JSON.parse(booking.people) as Person[];
                        const isEditing = editingBooking === booking.id;

                        return (
                          <tr key={booking.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-900">{booking.id}</td>
                            {people.map((p, idx) => (
                              <td key={idx} colSpan={people.length === 1 ? 1 : 0} className="px-6 py-4 text-sm">
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
                                      className="block w-full px-2 py-1 border rounded text-xs text-black"
                                      placeholder="Nome"
                                    />
                                  </div>
                                ) : (
                                  <div className="text-xs text-gray-900">{p.name}</div>
                                )}
                              </td>
                            ))}
                            {people.map((p, idx) => (
                              <td key={`surname-${idx}`} className="px-6 py-4 text-sm">
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
                                      className="block w-full px-2 py-1 border rounded text-xs text-black"
                                      placeholder="Cognome"
                                    />
                                  </div>
                                ) : (
                                  <div className="text-xs text-gray-900">{p.surname}</div>
                                )}
                              </td>
                            ))}
                            {people.map((p, idx) => (
                              <td key={`email-${idx}`} className="px-6 py-4 text-sm">
                                {isEditing ? (
                                  <input
                                    type="email"
                                    value={p.email}
                                    onChange={(e) => {
                                      const newPeople = [...editingPeople];
                                      newPeople[idx].email = e.target.value;
                                      setEditingPeople(newPeople);
                                    }}
                                    className="w-full px-2 py-1 border rounded text-xs text-black"
                                    placeholder="Email"
                                  />
                                ) : (
                                  <div className="text-xs text-gray-600">{p.email}</div>
                                )}
                              </td>
                            ))}
                            {people.map((p, idx) => (
                              <td key={`dob-${idx}`} className="px-6 py-4 text-sm">
                                {isEditing ? (
                                  <input
                                    type="date"
                                    value={p.dateOfBirth}
                                    onChange={(e) => {
                                      const newPeople = [...editingPeople];
                                      newPeople[idx].dateOfBirth = e.target.value;
                                      setEditingPeople(newPeople);
                                    }}
                                    className="w-full px-2 py-1 border rounded text-xs text-black"
                                  />
                                ) : (
                                  <div className="text-xs text-gray-600">{formatDate(p.dateOfBirth)}</div>
                                )}
                              </td>
                            ))}
                            {people.map((p, idx) => (
                              <td key={`phone-${idx}`} className="px-6 py-4 text-sm">
                                {isEditing ? (
                                  <input
                                    type="tel"
                                    value={p.phone}
                                    onChange={(e) => {
                                      const newPeople = [...editingPeople];
                                      newPeople[idx].phone = e.target.value;
                                      setEditingPeople(newPeople);
                                    }}
                                    className="w-full px-2 py-1 border rounded text-xs text-black"
                                    placeholder="Telefono"
                                  />
                                ) : (
                                  <div className="text-xs text-gray-600">{p.phone}</div>
                                )}
                              </td>
                            ))}
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {formatDate(booking.created_at)}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {booking.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm space-x-2 flex">
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
                                    className="text-blue-600 hover:text-blue-800 font-semibold"
                                  >
                                    Modifica
                                  </button>
                                  <button
                                    onClick={() => handleDeleteBooking(booking.id)}
                                    className="text-red-600 hover:text-red-800 font-semibold"
                                  >
                                    Elimina
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
    </div>
  );
}

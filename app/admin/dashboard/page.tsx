'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Person {
  name: string;
  surname: string;
  email: string;
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
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <Link href="/">
            <div className="flex items-center gap-3 hover:opacity-80 cursor-pointer">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Alya Admin</h1>
            </div>
          </Link>
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
              <h2 className="text-xl font-bold mb-4">Seleziona Evento</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {events.map(event => (
                  <button
                    key={event.id}
                    onClick={() => setSelectedEvent(event.id)}
                    className={`p-4 rounded-lg border-2 transition text-left ${
                      selectedEvent === event.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <h3 className="font-semibold text-gray-900">{event.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{event.date} - {event.time}</p>
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
                <h2 className="text-xl font-bold">
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Partecipanti</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Email</th>
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
                            <td className="px-6 py-4 text-sm">
                              {isEditing ? (
                                <div className="space-y-2">
                                  {editingPeople.map((p, idx) => (
                                    <div key={idx} className="text-xs">
                                      <input
                                        type="text"
                                        value={p.name}
                                        onChange={(e) => {
                                          const newPeople = [...editingPeople];
                                          newPeople[idx].name = e.target.value;
                                          setEditingPeople(newPeople);
                                        }}
                                        className="block w-full mb-1 px-2 py-1 border rounded"
                                        placeholder="Nome"
                                      />
                                      <input
                                        type="text"
                                        value={p.surname}
                                        onChange={(e) => {
                                          const newPeople = [...editingPeople];
                                          newPeople[idx].surname = e.target.value;
                                          setEditingPeople(newPeople);
                                        }}
                                        className="block w-full mb-1 px-2 py-1 border rounded"
                                        placeholder="Cognome"
                                      />
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-xs">
                                  {people.map((p, idx) => (
                                    <div key={idx} className="text-gray-900">
                                      {p.name} {p.surname}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {isEditing ? (
                                <input
                                  type="email"
                                  value={editingPeople[0]?.email || ''}
                                  onChange={(e) => {
                                    const newPeople = [...editingPeople];
                                    newPeople[0].email = e.target.value;
                                    setEditingPeople(newPeople);
                                  }}
                                  className="w-full px-2 py-1 border rounded"
                                  placeholder="Email"
                                />
                              ) : (
                                <div className="text-xs text-gray-600">
                                  {people.map((p, idx) => (
                                    <div key={idx}>{p.email}</div>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {new Date(booking.created_at).toLocaleDateString('it-IT')}
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

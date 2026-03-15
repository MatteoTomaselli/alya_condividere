'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { formatDate } from '@/lib/dateFormatter';

interface Person {
  name: string;
  surname: string;
  email: string;
  dateOfBirth: string;
  phone: string;
}

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  max_capacity: number;
  image_url: string;
  available_seats: number;
}

export default function EventDetail() {
  const params = useParams();
  const eventId = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [people, setPeople] = useState<Person[]>([{ name: '', surname: '', email: '', dateOfBirth: '', phone: '' }]);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [photoAuthAccepted, setPhotoAuthAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${eventId}`);
        const data = await response.json();
        setEvent(data);
      } catch (error) {
        console.error('Errore nel caricamento dell\'evento:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const addPerson = () => {
    setPeople([...people, { name: '', surname: '', email: '' }]);
  };

  const removePerson = (index: number) => {
    const newPeople = people.filter((_, i) => i !== index);
    setPeople(newPeople);
  };

  const updatePerson = (index: number, field: string, value: string) => {
    const newPeople = [...people];
    newPeople[index] = { ...newPeople[index], [field]: value };
    setPeople(newPeople);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!privacyAccepted) {
      setMessage('Devi accettare la normativa sulla privacy');
      return;
    }

    if (people.some(p => !p.name || !p.surname || !p.email || !p.dateOfBirth || !p.phone)) {
      setMessage('Compila tutti i campi');
      return;
    }

    if (!eventId) {
      setMessage('Errore: evento non valido');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: parseInt(eventId as string),
          people
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        // Invia email di conferma
        try {
          await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: people[0].email,
              name: people[0].name,
              surname: people[0].surname,
              event: {
                title: event?.title,
                date: event?.date,
                time: event?.time,
                location: event?.location,
                price: '22€'
              }
            })
          });
        } catch (emailError) {
          console.error('Errore nell\'invio email:', emailError);
        }
        
        setMessage('Prenotazione confermata! Ti abbiamo inviato un\'email di conferma.');
        setPeople([{ name: '', surname: '', email: '', dateOfBirth: '', phone: '' }]);
        setPrivacyAccepted(false);
        // Ricarica l'evento per aggiornare i posti disponibili
        const eventResponse = await fetch(`/api/events/${eventId}`);
        const eventData = await eventResponse.json();
        setEvent(eventData);
      } else {
        setMessage(data.error || 'Errore nella prenotazione');
      }
    } catch (error) {
      setMessage('Errore nella prenotazione');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Caricamento evento...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Evento non trovato</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <Link href="/">
            <div className="flex items-center gap-3 hover:opacity-80">
              <img 
                src="/alya-logo.jpeg" 
                alt="Alya Logo" 
                className="w-10 h-10 rounded-lg object-cover"
              />
              <h1 className="text-2xl font-bold text-gray-900">Alya Events</h1>
            </div>
          </Link>
          <Link href="/admin" className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300">
            Admin
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/" className="text-black hover:text-gray-700 mb-6 inline-block">
          ← Torna agli eventi
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Dettagli evento */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <h2 className="text-2xl font-bold mb-4 text-black">Dettagli</h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-black text-sm">Data</p>
                  <p className="font-semibold text-black">{formatDate(event.date)}</p>
                </div>
                <div>
                  <p className="text-black text-sm">Ora</p>
                  <p className="font-semibold text-black">{event.time}</p>
                </div>
                <div>
                  <p className="text-black text-sm">Luogo</p>
                  <p className="font-semibold text-black">{event.location}</p>
                </div>
                <div>
                  <p className="text-black text-sm">Prezzo</p>
                  <p className="font-semibold text-black">22€</p>
                </div>
                <div>
                  <p className="text-black text-sm">Posti Disponibili</p>
                  <p className={`font-semibold text-lg ${event.available_seats > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {event.available_seats > 0 ? event.available_seats : 'Esaurito'}
                  </p>
                </div>
              </div>

              <div className={`p-3 rounded-lg text-sm ${event.available_seats > 0 ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {event.available_seats > 0 
                  ? `${event.available_seats} posti ancora disponibili`
                  : 'Questo evento è al completo'
                }
              </div>
            </div>
          </div>

          {/* Immagine e form */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <div className="mb-8">
              <img
                src={event.image_url}
                alt={event.title}
                className="w-full h-96 object-cover rounded-lg shadow"
              />
            </div>

            <div className="bg-white rounded-lg shadow p-8 mb-8">
              <h1 className="text-4xl font-bold mb-4 text-black">{event.title}</h1>
              <p className="text-black text-lg leading-relaxed mb-8">{event.description}</p>

              {/* Form di prenotazione */}
              {event.available_seats > 0 && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-black">Registra i partecipanti</h3>

                    {people.map((person, index) => (
                      <div key={index} className="mb-6 pb-6 border-b last:border-b-0">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-semibold text-black">Persona {index + 1}</h4>
                          {people.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removePerson(index)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Rimuovi
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-black mb-1">
                              Nome *
                            </label>
                            <input
                              type="text"
                              required
                              value={person.name}
                              onChange={(e) => updatePerson(index, 'name', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                              placeholder="Es. Marco"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-black mb-1">
                              Cognome *
                            </label>
                            <input
                              type="text"
                              required
                              value={person.surname}
                              onChange={(e) => updatePerson(index, 'surname', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                              placeholder="Es. Rossi"
                            />
                          </div>
                        </div>
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-black mb-1">
                            Email *
                          </label>
                          <input
                            type="email"
                            required
                            value={person.email}
                            onChange={(e) => updatePerson(index, 'email', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                            placeholder="esempio@email.com"
                          />
                        </div>
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-black mb-1">
                              Data di Nascita *
                            </label>
                            <input
                              type="date"
                              required
                              value={person.dateOfBirth}
                              onChange={(e) => updatePerson(index, 'dateOfBirth', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-black mb-1">
                              Numero di Telefono *
                            </label>
                            <input
                              type="tel"
                              required
                              value={person.phone}
                              onChange={(e) => updatePerson(index, 'phone', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                              placeholder="Es. +39 123 456 7890"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    {people.length < Math.min(event.available_seats, 10) && (
                      <button
                        type="button"
                        onClick={addPerson}
                        className="text-black hover:text-gray-700 font-semibold text-sm mb-6"
                      >
                        + Aggiungi un'altra persona
                      </button>
                    )}
                  </div>

                  {/* Privacy Checkbox */}
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="privacy"
                      checked={privacyAccepted}
                      onChange={(e) => setPrivacyAccepted(e.target.checked)}
                      className="mt-1 w-4 h-4 text-pink-600 border-gray-300 rounded cursor-pointer"
                    />
                    <label htmlFor="privacy" className="ml-3 text-sm text-black">
                      Accetto la normativa sulla privacy e i termini e condizioni *
                    </label>
                  </div>

                  {/* Photo Authorization Checkbox */}
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="photoAuth"
                      checked={photoAuthAccepted}
                      onChange={(e) => setPhotoAuthAccepted(e.target.checked)}
                      className="mt-1 w-4 h-4 text-pink-600 border-gray-300 rounded cursor-pointer"
                    />
                    <label htmlFor="photoAuth" className="ml-3 text-sm text-black">
                      Autorizzo la realizzazione e l'utilizzo di foto e video durante gli eventi per finalità promozionali
                    </label>
                  </div>

                  <div className="text-sm">
                    <a
                      href="/privacy.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-black underline hover:text-gray-700"
                    >
                      Visualizza i termini privacy
                    </a>
                  </div>

                  {/* Message */}
                  {message && (
                    <div className={`p-4 rounded-lg ${message.includes('confermata') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                      {message}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting || !privacyAccepted}
                    className="w-full bg-pink-400 hover:bg-pink-500 disabled:bg-gray-400 text-black font-semibold py-3 px-4 rounded-lg transition"
                  >
                    {submitting ? 'Prenotazione in corso...' : 'Prenota Ora'}
                  </button>
                </form>
              )}

              {event.available_seats === 0 && (
                <div className="bg-red-50 text-red-800 p-6 rounded-lg text-center">
                  <p className="font-semibold mb-2">Questo evento è al completo</p>
                  <p className="text-sm">Purtroppo non ci sono più posti disponibili. Torna a breve per nuovi eventi!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

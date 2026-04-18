'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { formatDate } from '@/lib/dateFormatter';
import { LIABILITY_WAIVER_LABEL, LIABILITY_WAIVER_TEXT } from '@/lib/eventConsents';

interface Person {
  name: string;
  surname: string;
  email: string;
  dateOfBirth: string;
  phone: string;
  allergies?: string;
  photo_auth?: boolean;
}

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
  requires_liability_waiver?: boolean;
}

export default function EventDetail() {
  const params = useParams();
  const eventId = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [people, setPeople] = useState<Person[]>([{ name: '', surname: '', email: '', dateOfBirth: '', phone: '', allergies: '' }]);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [womenOnlyAcknowledged, setWomenOnlyAcknowledged] = useState(false);
  const [liabilityWaiverAccepted, setLiabilityWaiverAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [sideMenuOpen, setSideMenuOpen] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${eventId}`, { cache: 'no-store' });
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
    setPeople([...people, { name: '', surname: '', email: '', dateOfBirth: '', phone: '', allergies: '', photo_auth: false }]);
  };

  const removePerson = (index: number) => {
    const newPeople = people.filter((_, i) => i !== index);
    setPeople(newPeople);
  };

  const updatePerson = (index: number, field: string, value: string | boolean) => {
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

    if (!womenOnlyAcknowledged) {
      setMessage("Devi dichiarare di aver letto che l'evento è dedicato a donnne e ragazze");
      return;
    }

    if (event?.requires_liability_waiver && !liabilityWaiverAccepted) {
      setMessage('Devi accettare lo scarico di responsabilità');
      return;
    }

    if (people.some(p => !p.name || !p.surname || !p.email || !p.dateOfBirth || !p.phone)) {
      setMessage('Compila tutti i campi');
      return;
    }

    if (people.some(p => p.photo_auth === undefined || p.photo_auth === null)) {
      setMessage('Devi scegliere se autorizzare le foto per ogni partecipante');
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
          people,
          liability_waiver_accepted: liabilityWaiverAccepted
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage('Prenotazione confermata! Ti abbiamo inviato un\'email di conferma.');
        setPeople([{ name: '', surname: '', email: '', dateOfBirth: '', phone: '', allergies: '' }]);
        setPrivacyAccepted(false);
        setWomenOnlyAcknowledged(false);
        setLiabilityWaiverAccepted(false);
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
              I nostri spazi
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
          <Link href="/admin" className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300">
            <i className="mdi mdi-account text-2xl" />
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/events" className="text-black hover:text-gray-700 mb-6 inline-block">
          ← Torna agli eventi
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Dettagli evento */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <h2 className="text-2xl font-bold mb-4 text-black">Dettagli</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-2">
                  <i className="mdi mdi-calendar text-pink-400 text-xl" />
                  <div>
                    <p className="text-black text-sm">Data</p>
                    <p className="font-semibold text-black">{formatDate(event.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <i className="mdi mdi-clock text-pink-400 text-xl" />
                  <div>
                    <p className="text-black text-sm">Ora</p>
                    <p className="font-semibold text-black">{event.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <i className="mdi mdi-map-marker text-pink-400 text-xl" />
                  <div>
                    <p className="text-black text-sm">Luogo</p>
                    <p className="font-semibold text-black">{event.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <i className="mdi mdi-currency-eur text-pink-400 text-xl" />
                  <div>
                    <p className="text-black text-sm">Prezzo</p>
                    <p className="font-semibold text-black">{event.price}€ a persona</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <i className="mdi mdi-seat text-pink-400 text-xl" />
                  <div>
                    <p className="text-black text-sm">Posti Disponibili</p>
                    <p className={`font-semibold text-lg ${event.available_seats > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {event.available_seats > 0 ? event.available_seats : 'Esaurito'}
                    </p>
                  </div>
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
                className="w-full h-auto max-h-96 object-contain rounded-lg shadow"
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
                              value={person.name || ''}
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
                              value={person.surname || ''}
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
                            value={person.email || ''}
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
                              value={person.dateOfBirth || ''}
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
                              value={person.phone || ''}
                              onChange={(e) => updatePerson(index, 'phone', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                              placeholder="Es. +39 123 456 7890"
                            />
                          </div>
                        </div>
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-black mb-1">
                            Allergie
                          </label>
                          <textarea
                            value={person.allergies || ''}
                            onChange={(e) => updatePerson(index, 'allergies', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                            placeholder="Es. Nocciole, latticini, gluten-free"
                            rows={3}
                          />
                        </div>
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-black mb-2">
                            Autorizzo la realizzazione e l'utilizzo di foto e video durante gli eventi per finalità promozionali *
                          </label>
                          <div className="flex gap-6">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name={`photo_auth_${index}`}
                                checked={person.photo_auth === true}
                                onChange={() => updatePerson(index, 'photo_auth', true)}
                                className="w-4 h-4 text-pink-600 border-gray-300 cursor-pointer"
                              />
                              <span className="ml-2 text-sm text-black">
                                Si, autorizzo
                              </span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name={`photo_auth_${index}`}
                                checked={person.photo_auth === false}
                                onChange={() => updatePerson(index, 'photo_auth', false)}
                                className="w-4 h-4 text-pink-600 border-gray-300 cursor-pointer"
                              />
                              <span className="ml-2 text-sm text-black">
                                No, non autorizzo
                              </span>
                            </label>
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

                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="women-only-acknowledged"
                      checked={womenOnlyAcknowledged}
                      onChange={(e) => setWomenOnlyAcknowledged(e.target.checked)}
                      className="mt-1 w-4 h-4 text-pink-600 border-gray-300 rounded cursor-pointer"
                    />
                    <label htmlFor="women-only-acknowledged" className="ml-3 text-sm text-black">
                      Dichiaro di aver letto che l&apos;evento è dedicato a donnne e ragazze *
                    </label>
                  </div>

                  <div className="text-sm">
                    <a
                      href="/Privacy.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-black underline hover:text-gray-700"
                    >
                      Visualizza i termini privacy
                    </a>
                  </div>

                  {event.requires_liability_waiver && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          id="liability-waiver"
                          checked={liabilityWaiverAccepted}
                          onChange={(e) => setLiabilityWaiverAccepted(e.target.checked)}
                          className="mt-1 w-4 h-4 text-pink-600 border-gray-300 rounded cursor-pointer"
                        />
                        <label htmlFor="liability-waiver" className="ml-3 text-sm text-black">
                          <span className="block font-medium mb-1">{LIABILITY_WAIVER_LABEL} *</span>
                          <span>{LIABILITY_WAIVER_TEXT}</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Message */}
                  {message && (
                    <div className={`p-4 rounded-lg ${message.includes('confermata') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                      {message}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting || !privacyAccepted || !womenOnlyAcknowledged || (event.requires_liability_waiver && !liabilityWaiverAccepted)}
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

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-between items-start">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1">
              <div>
                <h4 className="text-lg font-semibold mb-4"><span className="breathing">Alya</span></h4>
                <p className="text-gray-400 text-sm">
                  Spazio creativo e di benessere per donne e ragazze. Un progetto di Giorgia e Valeria.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Link Utili</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <Link href="/" className="hover:text-amber-400 transition">Home</Link>
                  </li>
                  <li><Link href="/events" className="hover:text-amber-400 transition">Eventi</Link></li>
                  <li><Link href="/about" className="hover:text-amber-400 transition">Chi Siamo</Link></li>
                  <li><Link href="/collaborations" className="hover:text-amber-400 transition">Con chi collaboriamo</Link></li>
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
                src="/logo_alya_def.jpeg" 
                alt="Alya Logo" 
                width={80} 
                height={80}
                className="rounded-full"
              />
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 flex justify-end">
            <p className="text-gray-400 text-sm">© 2026 <span className="breathing">Alya</span> - Crea, Condividi, Vivi. Tutti i diritti riservati.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

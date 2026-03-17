'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDate } from '@/lib/dateFormatter';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  max_capacity: number;
  image_url: string;
  booked_seats?: number;
  available_seats?: number;
}

export default function EventCarousel() {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events', { cache: 'no-store' });
        const data = await response.json();
        
        // Carica i posti prenotati per ogni evento
        const eventsWithBookings = await Promise.all(
          data.map(async (event: Event) => {
            const eventResponse = await fetch(`/api/events/${event.id}`, { cache: 'no-store' });
            const eventData = await eventResponse.json();
            return eventData;
          })
        );
        
        setEvents(eventsWithBookings);
      } catch (error) {
        console.error('Errore nel caricamento degli eventi:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % events.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + events.length) % events.length);
  };

  if (loading) {
    return <div className="text-center py-8">Caricamento eventi...</div>;
  }

  if (events.length === 0) {
    return <div className="text-center py-8">Nessun evento disponibile</div>;
  }

  return (
    <div className="w-full">
      <div className="relative bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="relative h-[500px]">
          {events.map((event, index) => (
            <div
              key={event.id}
              className={`absolute inset-0 transition-opacity duration-500 ${
                index === currentIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <Link href={`/events/${event.id}`}>
                <div className="cursor-pointer h-full">
                  <div className="relative h-full w-full">
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-full h-full object-contain md:object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-end">
                      <div className="w-full p-6 text-white">
                        <h3 className="text-3xl font-bold mb-2">{event.title}</h3>
                        <p className="text-base opacity-90">{event.location}</p>
                        <p className="text-base mb-2">{formatDate(event.date)} - {event.time}</p>
                        <div className="mt-3 text-base">
                          Posti disponibili: <span className="font-bold">{event.available_seats}/{event.max_capacity}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Frecce di navigazione */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white hover:bg-white rounded-full p-2 z-10"
          aria-label="Evento precedente"
        >
          <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white hover:bg-white rounded-full p-2 z-10"
          aria-label="Evento successivo"
        >
          <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Indicatori */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {events.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? 'bg-white w-8' : 'bg-white/50'
              }`}
              aria-label={`Vai all'evento ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

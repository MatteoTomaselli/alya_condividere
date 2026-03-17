import { NextRequest, NextResponse } from 'next/server';
import { allAsync, runAsync } from '@/lib/db';

export async function GET() {
  try {
    const events = await allAsync('SELECT * FROM events ORDER BY date ASC');
    
    // Calcola posti disponibili per ogni evento
    const eventsWithSeats = await Promise.all(events.map(async (event: any) => {
      try {
        const bookings = await allAsync('SELECT * FROM bookings WHERE event_id = ? AND status = ?', [event.id, 'confirmed']);
        
        let totalBookedSeats = 0;
        bookings.forEach((booking: any) => {
          try {
            const people = JSON.parse(booking.people);
            totalBookedSeats += people.length;
          } catch (e) {
            console.error('Errore parsing people:', e);
          }
        });
        
        return {
          ...event,
          available_seats: Math.max(0, event.max_capacity - totalBookedSeats)
        };
      } catch (error) {
        console.error(`Errore nel calcolo posti per evento ${event.id}:`, error);
        return {
          ...event,
          available_seats: event.max_capacity
        };
      }
    }));
    
    return NextResponse.json(eventsWithSeats);
  } catch (error) {
    console.error('Errore nel recupero degli eventi:', error);
    return NextResponse.json({ error: 'Errore nel recupero degli eventi' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, date, time, location, max_capacity, price, image_url } = body;

    if (!title || !date || !time || !location || !price) {
      return NextResponse.json({ error: 'Campi obbligatori mancanti' }, { status: 400 });
    }

    const result = await runAsync(
      'INSERT INTO events (title, description, date, time, location, max_capacity, price, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, description || '', date, time, location, max_capacity || 20, price, image_url || '']
    );

    return NextResponse.json({ id: result.id, message: 'Evento creato con successo' });
  } catch (error: any) {
    console.error('Errore nella creazione evento:', error.message, error);
    return NextResponse.json({ error: error.message || 'Errore nella creazione evento' }, { status: 500 });
  }
}

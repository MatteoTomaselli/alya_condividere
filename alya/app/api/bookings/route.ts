import { NextRequest, NextResponse } from 'next/server';
import { runAsync, getAsync, allAsync } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event_id, people } = body;

    if (!event_id || !people || people.length === 0) {
      return NextResponse.json({ error: 'Dati mancanti' }, { status: 400 });
    }

    // Verifica disponibilità
    const event = await getAsync('SELECT * FROM events WHERE id = ?', [event_id]);
    if (!event) {
      return NextResponse.json({ error: 'Evento non trovato' }, { status: 404 });
    }

    const bookings = await allAsync('SELECT * FROM bookings WHERE event_id = ? AND status = ?', [event_id, 'confirmed']);
    const totalBookedSeats = bookings.reduce((sum: number, booking: any) => {
      const bookedPeople = JSON.parse(booking.people);
      return sum + bookedPeople.length;
    }, 0);

    if (totalBookedSeats + people.length > event.max_capacity) {
      return NextResponse.json({ error: 'Non ci sono abbastanza posti disponibili' }, { status: 400 });
    }

    // Crea la prenotazione
    const result = await runAsync(
      'INSERT INTO bookings (event_id, people, status) VALUES (?, ?, ?)',
      [event_id, JSON.stringify(people), 'confirmed']
    );

    return NextResponse.json({ id: result.id, message: 'Prenotazione confermata' });
  } catch (error: any) {
    console.error('Errore:', error);
    return NextResponse.json({ error: 'Errore nella prenotazione' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');

    if (eventId) {
      const bookings = await allAsync('SELECT * FROM bookings WHERE event_id = ? ORDER BY created_at DESC', [eventId]);
      return NextResponse.json(bookings);
    }

    const allBookings = await allAsync('SELECT * FROM bookings ORDER BY created_at DESC');
    return NextResponse.json(allBookings);
  } catch (error) {
    return NextResponse.json({ error: 'Errore nel recupero delle prenotazioni' }, { status: 500 });
  }
}

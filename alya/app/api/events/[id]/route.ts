import { NextRequest, NextResponse } from 'next/server';
import { getAsync, allAsync } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const eventId = parseInt(id);
    const event = await getAsync('SELECT * FROM events WHERE id = ?', [eventId]);
    
    if (!event) {
      return NextResponse.json({ error: 'Evento non trovato' }, { status: 404 });
    }

    const bookings = await allAsync('SELECT * FROM bookings WHERE event_id = ? AND status = ?', [eventId, 'confirmed']);
    const totalBookedSeats = bookings.reduce((sum: number, booking: any) => {
      const people = JSON.parse(booking.people);
      return sum + people.length;
    }, 0);

    return NextResponse.json({
      ...event,
      booked_seats: totalBookedSeats,
      available_seats: event.max_capacity - totalBookedSeats
    });
  } catch (error) {
    return NextResponse.json({ error: 'Errore nel recupero dell\'evento' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getAsync, allAsync, runAsync } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const eventId = parseInt(id);
    const event = await getAsync('SELECT * FROM events WHERE id = ?', [eventId]);
    
    if (!event) {
      return NextResponse.json({ error: 'Evento non trovato' }, { status: 404 });
    }

    const bookings = await allAsync('SELECT COUNT(*) as count FROM bookings WHERE event_id = ? AND status = ?', [eventId, 'confirmed']);
    const totalBookedSeats = bookings[0]?.count || 0;

    return NextResponse.json({
      ...event,
      booked_seats: totalBookedSeats,
      available_seats: event.max_capacity - totalBookedSeats
    });
  } catch (error) {
    return NextResponse.json({ error: 'Errore nel recupero dell\'evento' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const eventId = parseInt(id);

    // Elimina prima tutte le prenotazioni associate all'evento
    await runAsync('DELETE FROM bookings WHERE event_id = ?', [eventId]);

    // Poi elimina l'evento
    await runAsync('DELETE FROM events WHERE id = ?', [eventId]);

    return NextResponse.json({ message: 'Evento eliminato con successo' });
  } catch (error: any) {
    console.error('Errore nell\'eliminazione evento:', error.message, error);
    return NextResponse.json({ error: error.message || 'Errore nell\'eliminazione dell\'evento' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const eventId = parseInt(id);
    const body = await request.json();

    const {
      title,
      description,
      date,
      time,
      location,
      max_capacity,
      price,
      image_url,
      requires_liability_waiver,
    } = body;

    console.log('PUT request received:', { eventId, body });

    if (!title || !date || !time || !location || !price || !max_capacity) {
      console.log('Validation failed:', { title, date, time, location, price, max_capacity });
      return NextResponse.json({ error: 'Campi obbligatori mancanti' }, { status: 400 });
    }

    const maxCapInt = parseInt(max_capacity.toString());
    console.log('Updating event with:', { title, date, time, location, maxCapInt, price });

    await runAsync(
      'UPDATE events SET title = ?, description = ?, date = ?, time = ?, location = ?, max_capacity = ?, price = ?, image_url = ?, requires_liability_waiver = ? WHERE id = ?',
      [
        title,
        description || null,
        date,
        time,
        location,
        maxCapInt,
        price,
        image_url || null,
        Boolean(requires_liability_waiver),
        eventId,
      ]
    );

    return NextResponse.json({ message: 'Evento aggiornato con successo' });
  } catch (error: any) {
    console.error('Errore nell\'aggiornamento evento:', error.message, error);
    return NextResponse.json({ error: error.message || 'Errore nell\'aggiornamento dell\'evento' }, { status: 500 });
  }
}

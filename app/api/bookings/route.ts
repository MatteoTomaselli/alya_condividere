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

    const bookings = await allAsync('SELECT COUNT(*) as count FROM bookings WHERE event_id = ? AND status = ?', [event_id, 'confirmed']);
    const totalBookedSeats = bookings[0]?.count || 0;

    if (totalBookedSeats + people.length > event.max_capacity) {
      return NextResponse.json({ error: 'Non ci sono abbastanza posti disponibili' }, { status: 400 });
    }

    // Crea un ID unico per il gruppo di prenotazione
    const bookingGroupId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Inserisci una riga per ogni persona
    for (const person of people) {
      await runAsync(
        'INSERT INTO bookings (event_id, name, surname, email, date_of_birth, phone, allergies, photo_auth, status, booking_group_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          event_id,
          person.name,
          person.surname,
          person.email,
          person.dateOfBirth,
          person.phone,
          person.allergies || null,
          person.photo_auth || false,
          'confirmed',
          bookingGroupId
        ]
      );
    }

    // Invia email di conferma per ogni persona
    try {
      for (const person of people) {
        console.log(`Invio email a: ${person.email}`);
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: person.email,
            name: person.name,
            surname: person.surname,
            event: {
              title: event.title,
              date: event.date,
              time: event.time,
              location: event.location,
              price: event.price,
            },
          }),
        });
      }

      // Invia email admin di notifica
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      console.log(`Invio email admin a: ${process.env.ADMIN_EMAIL}, URL: ${appUrl}`);
      const adminEmailResponse = await fetch(`${appUrl}/api/send-email-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          people,
          event: {
            title: event.title,
            date: event.date,
            time: event.time,
            location: event.location,
            price: event.price,
          },
        }),
      });
      console.log(`Email admin response status: ${adminEmailResponse.status}`);
      const adminEmailData = await adminEmailResponse.json();
      console.log(`Email admin response: ${JSON.stringify(adminEmailData)}`);
    } catch (emailError) {
      console.error('Errore nell\'invio dell\'email di conferma:', emailError);
      // Non fallire la prenotazione se l'email fallisce
    }

    return NextResponse.json({ booking_group_id: bookingGroupId, message: 'Prenotazione confermata' });
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

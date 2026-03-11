import { NextRequest, NextResponse } from 'next/server';
import { runAsync, getAsync } from '@/lib/db';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const bookingId = parseInt(id);
    const adminEmail = request.headers.get('X-Admin-Email');

    // Verifica autenticazione admin (semplice per questo esempio)
    if (!adminEmail) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    await runAsync('DELETE FROM bookings WHERE id = ?', [bookingId]);
    return NextResponse.json({ message: 'Prenotazione eliminata' });
  } catch (error) {
    return NextResponse.json({ error: 'Errore nell\'eliminazione' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const bookingId = parseInt(id);
    const adminEmail = request.headers.get('X-Admin-Email');
    const body = await request.json();

    if (!adminEmail) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const { people, status } = body;

    if (people) {
      await runAsync('UPDATE bookings SET people = ? WHERE id = ?', [JSON.stringify(people), bookingId]);
    }

    if (status) {
      await runAsync('UPDATE bookings SET status = ? WHERE id = ?', [status, bookingId]);
    }

    return NextResponse.json({ message: 'Prenotazione aggiornata' });
  } catch (error) {
    return NextResponse.json({ error: 'Errore nell\'aggiornamento' }, { status: 500 });
  }
}

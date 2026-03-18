import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const bookingId = parseInt(id);
    const adminEmail = request.headers.get('X-Admin-Email');

    // Verifica autenticazione admin (semplice per questo esempio)
    if (!adminEmail) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId);

    if (error) throw error;

    return NextResponse.json({ message: 'Persona eliminata' });
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

    const { name, surname, email, date_of_birth, phone, allergies, photo_auth, status } = body;

    // Aggiorna i campi singoli della persona
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (surname !== undefined) updates.surname = surname;
    if (email !== undefined) updates.email = email;
    if (date_of_birth !== undefined) updates.date_of_birth = date_of_birth;
    if (phone !== undefined) updates.phone = phone;
    if (allergies !== undefined) updates.allergies = allergies;
    if (photo_auth !== undefined) updates.photo_auth = photo_auth;
    if (status !== undefined) updates.status = status;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Nessun campo da aggiornare' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', bookingId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ message: 'Persona aggiornata', data });
  } catch (error) {
    return NextResponse.json({ error: 'Errore nell\'aggiornamento' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email e password richieste' }, { status: 400 });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

    console.log('Email ricevuta:', email);
    console.log('Email attesa:', adminEmail);
    console.log('Hash da .env:', adminPasswordHash);
    console.log('Password ricevuta:', password);

    if (!adminEmail || !adminPasswordHash) {
      return NextResponse.json({ error: 'Configurazione admin mancante' }, { status: 500 });
    }

    if (email !== adminEmail) {
      return NextResponse.json({ error: 'Credenziali non valide' }, { status: 401 });
    }

    const isPasswordValid = bcrypt.compareSync(password, adminPasswordHash);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Credenziali non valide' }, { status: 401 });
    }

    return NextResponse.json({ 
      success: true, 
      email: adminEmail,
      message: 'Login riuscito'
    });
  } catch (error) {
    console.error('Errore di login:', error);
    return NextResponse.json({ error: 'Errore nel login' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getAsync } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email e password richieste' }, { status: 400 });
    }

    const admin = await getAsync('SELECT * FROM admin WHERE email = ?', [email]);

    if (!admin) {
      return NextResponse.json({ error: 'Credenziali non valide' }, { status: 401 });
    }

    const isPasswordValid = bcrypt.compareSync(password, admin.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Credenziali non valide' }, { status: 401 });
    }

    return NextResponse.json({ 
      success: true, 
      email: admin.email,
      message: 'Login riuscito'
    });
  } catch (error) {
    console.error('Errore di login:', error);
    return NextResponse.json({ error: 'Errore nel login' }, { status: 500 });
  }
}

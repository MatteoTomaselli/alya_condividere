import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { formatDate } from '@/lib/dateFormatter';

export async function POST(request: NextRequest) {
  try {
    const { email, name, surname, event } = await request.json();

    // Formatta la data dell'evento
    const formattedDate = formatDate(event.date);

    // Configura il transporter di nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'alya.condividere@gmail.com',
        pass: process.env.EMAIL_PASSWORD, // Deve essere un'app password di Google
      },
    });

    // Crea il corpo dell'email
    const emailBody = `Ciao,

grazie per aver prenotato il nostro evento Alya – crea, condividi, vivi ✨

Siamo felici di averti con noi per:

🌿 Pilates class con aperitivo

Un momento dedicato al benessere, immerso nella natura, per muoversi, rilassarsi e condividere un’esperienza insieme.

📍 Dove  
${event.location}

🗓 Quando
${formattedDate}

⏰ Orario
${event.time}

💶 Costo
${event.price} € a persona (lezione e aperitivo inclusi)
La lezione sarà guidata da Lidia ed è adatta a tutti i livelli.

👉 Ti chiediamo di portare con te il tuo tappetino  
👉 Ti consigliamo un abbigliamento comodo

Il pagamento verrà effettuato direttamente all’arrivo.

Ti chiediamo gentilmente di arrivare 5/10 minuti prima dell’inizio.

Nel caso in cui non riuscissi più a partecipare, ti chiediamo di comunicarlo almeno 24 ore prima, così da poter eventualmente liberare il posto.

Se hai domande puoi rispondere direttamente a questa email.

Non vediamo l’ora di condividere questo momento insieme ✨

A presto,

Alya – crea, condividi, vivi`;

    // Invia l'email
    await transporter.sendMail({
      from: 'alya.condividere@gmail.com',
      to: email,
      subject: 'Conferma prenotazione - Pilates class con aperitivo 🌿',
      text: emailBody,
    });

    return NextResponse.json({ success: true, message: 'Email inviata con successo' });
  } catch (error) {
    console.error('Errore nell\'invio email:', error);
    return NextResponse.json(
      { success: false, error: 'Errore nell\'invio dell\'email' },
      { status: 500 }
    );
  }
}

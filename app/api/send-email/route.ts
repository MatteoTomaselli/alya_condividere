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
grazie per aver prenotato il nostro primo evento Alya – crea, condividi, vivi ✨

Siamo felici di averti con noi all'attività creativa:

🎨 Paint your Totebag con aperitivo

Durante il pomeriggio dipingerai la tua tote bag personalizzata che potrai portare a casa con te, il tutto in un momento di creatività, condivisione e relax.

📍 Dove: ${event.location}

🗓 Quando: ${formattedDate}

⏰ Orario: ${event.time}

💶 Costo: ${event.price} a persona (materiali e aperitivo inclusi)

Il pagamento verrà effettuato all'arrivo. È possibile pagare in contanti, con carta o tramite Satispay.

Dovrai portare solo la tua voglia di creare e di passare un bel pomeriggio insieme.

Nel caso in cui non riuscissi più a partecipare, ti chiediamo di comunicarlo almeno 24 ore prima dell'evento, così da poter eventualmente liberare il posto per altre persone interessate.

Se hai domande o necessità puoi rispondere direttamente a questa email.

Non vediamo l'ora di conoscerti 🌷

A presto,

Giorgia e Valeria di Alya`;

    // Invia l'email
    await transporter.sendMail({
      from: 'alya.condividere@gmail.com',
      to: email,
      subject: 'Conferma prenotazione - Paint your Totebag con aperitivo 🎨',
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

import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { formatDate } from '@/lib/dateFormatter';

export async function POST(request: NextRequest) {
    try {
        const { people, event } = await request.json();

        // Formatta la data dell'evento
        const formattedDate = formatDate(event.date);

        // Configura il transporter di nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER || 'alya.condividere@gmail.com',
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        // Crea il listato delle persone prenotate
        const peopleList = people
            .map(
                (p: any) =>
                    `• ${p.name} ${p.surname} - ${p.email} - Tel: ${p.phone}${p.allergies ? ` - Allergie: ${p.allergies}` : ''}`
            )
            .join('\n');

        // Crea il corpo dell'email per l'admin
        const emailBody = `Nuova prenotazione per l'evento:

📍 Evento: ${event.title}
🗓 Data: ${formattedDate}
⏰ Orario: ${event.time}
📍 Luogo: ${event.location}

Persone prenotate (${people.length}):
${peopleList}



    // Invia l'email all'admin
    await transporter.sendMail({
      from: 'alya.condividere@gmail.com',
      to: process.env.ADMIN_EMAIL || 'alya.condividere@gmail.com',
      subject: `Nuova prenotazione - ${ event.title } `,
      text: emailBody,
    });

    return NextResponse.json({ success: true, message: 'Email admin inviata con successo' });
  } catch (error) {
    console.error('Errore nell\'invio email admin:', error);
    return NextResponse.json(
      { success: false, error: 'Errore nell\'invio dell\'email' },
      { status: 500 }
    );
  }
}

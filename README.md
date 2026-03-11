# Alya Events - Sistema di Gestione Eventi

Un'applicazione web completa per la gestione e prenotazione di eventi personalizzati.

## Caratteristiche

✅ **Home Page Dinamica**
- Logo della compagnia organizzatrice
- Carousel scorrevole degli eventi
- Informazioni generali sull'applicazione

✅ **Pagine Dettagli Evento**
- Informazioni complete dell'evento
- Visualizzazione della disponibilità dei posti
- Sistema di prenotazione con pagina dedicata

✅ **Sistema di Prenotazione**
- Prenotazioni per più persone contemporaneamente
- Modulo con campi: Nome, Cognome, Email
- Checkbox per l'accettazione della privacy
- Gestione automatica della capacità massima dell'evento

✅ **Area Admin**
- Login protetto con credenziali
- Dashboard con statistiche
- Visualizzazione di tutte le prenotazioni
- Possibilità di modificare le prenotazioni
- Possibilità di eliminare le prenotazioni
- Filtro per evento

## Tecnologie Utilizzate

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **SQLite3** - Database
- **bcryptjs** - Autenticazione

## Installazione

### Prerequisiti
- Node.js (v18 o superiore)
- npm

### Setup

```bash
# Installare le dipendenze
npm install

# Avviare il server di sviluppo
npm run dev
```

L'applicazione sarà disponibile a `http://localhost:3000`

## Utilizzo

### Home Page (`/`)
- Visualizza il carousel degli eventi
- Clicca su un evento per visualizzare i dettagli
- Naviga all'area admin dal menu

### Pagina Evento (`/events/[id]`)
- Visualizza i dettagli completi dell'evento
- Mostra i posti disponibili
- Prenota uno o più posti
- Compila il form con i dati dei partecipanti
- Accetta la privacy per completare la prenotazione

### Area Admin (`/admin`)

**Credenziali di accesso:**
- Email: `admin@alya.it`
- Password: `admin123`

**Funzionalità:**
- Visualizzazione di tutte le prenotazioni
- Statistiche generali (eventi, prenotazioni, partecipanti)
- Filtro per evento
- Modifica dei dati dei prenotati
- Eliminazione di prenotazioni
- Logout

## Struttura del Progetto

```
alya/
├── app/
│   ├── page.tsx                 # Home page
│   ├── events/
│   │   └── [id]/
│   │       └── page.tsx         # Pagina dettagli evento
│   ├── admin/
│   │   ├── page.tsx             # Login admin
│   │   └── dashboard/
│   │       └── page.tsx         # Dashboard admin
│   └── api/
│       ├── events/              # API endpoints per gli eventi
│       ├── bookings/            # API endpoints per le prenotazioni
│       └── admin/
│           └── login/           # API login admin
├── components/
│   └── EventCarousel.tsx        # Componente carousel eventi
├── lib/
│   └── db.ts                    # Configurazione database
├── public/                      # File statici
└── package.json
```

## API Endpoints

### Events
- `GET /api/events` - Ottieni tutti gli eventi
- `GET /api/events/[id]` - Ottieni dettagli di un evento specifico

### Bookings
- `GET /api/bookings` - Ottieni tutte le prenotazioni
- `GET /api/bookings?event_id=[id]` - Ottieni prenotazioni di un evento
- `POST /api/bookings` - Crea una nuova prenotazione
- `PUT /api/bookings/[id]` - Modifica una prenotazione
- `DELETE /api/bookings/[id]` - Elimina una prenotazione

### Admin
- `POST /api/admin/login` - Login amministratore

## Database

Il database SQLite viene creato automaticamente al primo avvio con:
- Tabella `events` - Memorizza gli eventi
- Tabella `bookings` - Memorizza le prenotazioni
- Tabella `admin` - Memorizza le credenziali admin

### Dati di Esempio
L'applicazione include automaticamente 4 eventi di esempio al primo avvio.

## Sicurezza

- Autenticazione admin con password hashata (bcryptjs)
- Validazione dei form sul client e server
- Check della capacità massima dell'evento
- Verifica della privacy per le prenotazioni

## Personalizzazione

### Aggiungere Nuovi Eventi
Modifica il file `lib/db.ts` nella funzione `initializeDb()` per aggiungere più eventi di esempio.

### Cambiare le Credenziali Admin
Le credenziali di default sono memorizzate nel database. Per cambiarle:
1. Connettiti al database con uno strumento SQLite
2. Aggiorna la password hashata nella tabella `admin`

### Personalizzare lo Stile
Modifica il file `app/globals.css` e i className Tailwind nei file `.tsx`

## Build per la Produzione

```bash
npm run build
npm start
```

## Troubleshooting

### Il database non viene creato
Verifica che la cartella abbia permessi di scrittura

### Errore di connessione al database
Assicurati di avere SQLite3 installato e le dipendenze npm aggiornate

### Il carousel non funziona
Verifica che gli eventi siano presenti nel database

## Supporto

Per segnalare bug o richiedere features, contatta il team di sviluppo.

---

**Alya Events** © 2026 - Tutti i diritti riservati

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

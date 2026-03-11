# Istruzioni Rapide - Alya Events

## 🚀 Avvio Rapido

```bash
# Il server dev è già in esecuzione su http://localhost:3000
# Apri il browser e visita la pagina home
```

## 📋 Funzionalità Disponibili

### 1. **Home Page** (`http://localhost:3000`)
- Visualizza il logo Alya
- Carousel scorrevole con gli eventi
- Info sulla piattaforma
- Link all'area admin

### 2. **Pagina Evento** (Clicca su un evento nel carousel)
- Dettagli completi dell'evento
- Mostra posti disponibili
- Form di prenotazione per più persone
- Checkbox privacy obbligatorio

### 3. **Area Admin** (`http://localhost:3000/admin`)

**Login:**
- Email: `admin@alya.it`
- Password: `admin123`

**Nel Dashboard:**
- Statistiche generali (eventi, prenotazioni, partecipanti)
- Selezione evento con filtro
- Tabella di tutte le prenotazioni
- Pulsanti per modificare ed eliminare prenotazioni

## 🗄️ Database

Il database SQLite (`events.db`) viene creato automaticamente con:
- 4 eventi di esempio
- Admin di default
- Tabelle per prenotazioni

## 🔧 Comandi Utili

```bash
# Avviare dev server (se non già avviato)
npm run dev

# Build per produzione
npm run build

# Avviare build di produzione
npm start

# Pulire cache
rm -r .next
```

## 📝 Note Importanti

1. **Database**: Il file `events.db` viene creato nella root del progetto
2. **Password Admin**: Hashata con bcryptjs per sicurezza
3. **Validazione**: Tutti i form sono validati lato client e server
4. **Posti**: La capacità massima viene gestita automaticamente

## 🎨 Personalizzazioni Facili

- **Logo**: Modifica il "A" in `app/page.tsx` e `app/admin/page.tsx`
- **Colori**: Cambia i valori Tailwind (blue-600, green-600, etc.)
- **Testo**: Modifica gli heading e le descrizioni nei file `.tsx`
- **Eventi**: Aggiungi eventi in `lib/db.ts` nella funzione `initializeDb()`

## 📞 Contatti

Per supporto, scrivi a: info@alya-events.it

---

**Progetto completato! Enjoy! 🎉**

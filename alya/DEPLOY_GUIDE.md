# 📖 Guida Completa - Deploy Alya Events Online

## PASSO 1: Preparare GitHub

### 1.1 Creare account GitHub (se non hai)
- Vai a https://github.com
- Clicca "Sign up"
- Compila il modulo
- Verifica email

### 1.2 Creare un nuovo repository
- Una volta loggato, clicca **"+"** in alto a destra
- Seleziona **"New repository"**
- **Repository name**: `alya-events`
- Descrizione: `Sistema di gestione e prenotazione eventi`
- Seleziona **"Public"**
- NON selezionare "Initialize with README"
- Clicca **"Create repository"**

### 1.3 Caricare il progetto su GitHub

Nel terminal PowerShell, esegui questi comandi nella cartella del progetto:

```powershell
cd "C:\Users\matte\Desktop\alya_condividere\alya"

# Inizializza git
git init

# Configura credenziali
git config user.email "tuo.email@gmail.com"
git config user.name "Tuo Nome"

# Aggiungi tutti i file
git add .

# Crea il commit
git commit -m "Initial commit - Alya Events Application"

# Aggiungi il remote (sostituisci USERNAME con il tuo username GitHub)
git remote add origin https://github.com/USERNAME/alya-events.git

# Rinomina il branch
git branch -M main

# Push su GitHub
git push -u origin main
```

**Se chiede credenziali:**
- Genera un Personal Access Token su GitHub:
  1. Settings → Developer settings → Personal access tokens
  2. Clicca "Generate new token"
  3. Seleziona "repo" 
  4. Copia il token
  5. Usa come password quando richiesto

---

## PASSO 2: Deploy su Vercel

### 2.1 Creare account Vercel
1. Vai a https://vercel.com
2. Clicca **"Sign Up"**
3. Seleziona **"Continue with GitHub"**
4. Autorizza Vercel ad accedere ai tuoi repository
5. Completa la registrazione

### 2.2 Deploy del progetto
1. Clicca **"Add New"** → **"Project"**
2. Seleziona il repository `alya-events`
3. Clicca **"Import"**
4. Vercel detecta automaticamente Next.js
5. Clicca **"Deploy"**
6. Aspetta 1-2 minuti (vedrai una progress bar)

### 2.3 Al termine
- Vedrai una schermata di successo
- Il tuo URL sarà qualcosa come: `https://alya-events-abc123.vercel.app`
- Clicca il link per accedere al sito!

---

## 📋 Credenziali per Condividere

Condividi con le persone queste info:

```
🌐 URL SITO: https://alya-events-abc123.vercel.app

👤 AREA ADMIN:
   Email: admin@alya.it
   Password: admin123

ℹ️ NOTE:
   - Clicca su un evento per prenotare
   - Compila i dati di chi parteciperà
   - Accetta la privacy
   - Clicca "Prenota Ora"
```

---

## 🌐 OPZIONALE: Collegare Dominio Personalizzato

Se vuoi un URL come `www.alya-events.it` invece di `alya-events-abc.vercel.app`:

### Comprare un dominio
1. Vai su Namecheap, GoDaddy o Register
2. Cerca il dominio desiderato
3. Completa l'acquisto

### Collegare a Vercel
1. Nel dashboard Vercel, seleziona il progetto
2. Vai a **Settings** → **Domains**
3. Aggiungi il tuo dominio (es: alya-events.it)
4. Segui le istruzioni per i DNS
5. Aspetta 24-48 ore per la propagazione DNS

---

## ✅ Checklist Finale

- [ ] Account GitHub creato
- [ ] Repository caricato su GitHub
- [ ] Account Vercel creato
- [ ] Progetto deployato su Vercel
- [ ] URL generato e testato
- [ ] Credenziali condivise con i colleghi
- [ ] (Opzionale) Dominio personalizzato collegato

---

## 🆘 Problemi Comuni

### "Git non riconosciuto"
- Installa Git da https://git-scm.com
- Riavvia PowerShell

### "Repository not found" su GitHub
- Controlla di aver copiato l'URL corretto
- Verifica che il repository sia public

### "Build failed" su Vercel
- Aspetta qualche minuto e ritenta
- Controlla i log nel dashboard Vercel

### Il sito non carica i dati
- Probabilmente il database SQLite ha perso i dati
- Soluzione: Usa Neon (vedi sezione "Database")

---

## 📚 Prossimi Passi

Dopo il deploy puoi:

1. **Aggiungere più eventi** - Modifica `lib/db.ts`
2. **Cambiare password admin** - Modifica nel database
3. **Personalizzare colori** - Modifica Tailwind CSS
4. **Aggiungere logo proprio** - Sostituisci il "A" con il tuo logo

---

**Fatto! La tua app è online! 🚀**

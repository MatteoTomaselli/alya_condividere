import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'events.db');

let db: sqlite3.Database;

export function getDb(): sqlite3.Database {
  if (!db) {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Errore di connessione al database:', err);
      } else {
        console.log('Connessione al database riuscita');
        initializeDb();
      }
    });
  }
  return db;
}

function initializeDb() {
  db.serialize(() => {
    // Tabella per gli eventi
    db.run(`
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        location TEXT NOT NULL,
        max_capacity INTEGER NOT NULL,
        image_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabella per le prenotazioni
    db.run(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER NOT NULL,
        people JSON NOT NULL,
        status TEXT DEFAULT 'confirmed',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
      )
    `);

    // Tabella per l'admin
    db.run(`
      CREATE TABLE IF NOT EXISTS admin (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (!err) {
        // Crea un admin di default se non esiste
        db.get('SELECT * FROM admin WHERE email = ?', ['admin@alya.it'], (err, row) => {
          if (!row) {
            const bcrypt = require('bcryptjs');
            const hashedPassword = bcrypt.hashSync('admin123', 10);
            db.run(
              'INSERT INTO admin (email, password) VALUES (?, ?)',
              ['admin@alya.it', hashedPassword]
            );
          }
        });
      }
    });

    // Inserisci eventi di esempio se la tabella è vuota
    db.get('SELECT COUNT(*) as count FROM events', (err, row: any) => {
      if (!err && row.count === 0) {
        const sampleEvents = [
          {
            title: 'Conferenza Tecnologia 2026',
            description: 'Una conferenza entusiasmante su le ultime innovazioni in tecnologia, intelligenza artificiale e trasformazione digitale.',
            date: '2026-04-15',
            time: '09:00',
            location: 'Centro Congressi Milano',
            max_capacity: 500,
            image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400'
          },
          {
            title: 'Workshop Design UI/UX',
            description: 'Impara i principi fondamentali del design UI/UX con esperti del settore. Perfetto per designer e sviluppatori.',
            date: '2026-04-20',
            time: '14:00',
            location: 'Studio Design Roma',
            max_capacity: 30,
            image_url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400'
          },
          {
            title: 'Networking Event Tech',
            description: 'Incontra professionisti del settore tecnologico e crea nuove connessioni di business.',
            date: '2026-05-10',
            time: '18:00',
            location: 'Rooftop Bar Torino',
            max_capacity: 100,
            image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400'
          },
          {
            title: 'Masterclass Marketing Digitale',
            description: 'Scopri le strategie più efficaci per il marketing digitale nel 2026.',
            date: '2026-05-25',
            time: '10:00',
            location: 'Aula Magna Università Bocconi',
            max_capacity: 75,
            image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400'
          }
        ];

        sampleEvents.forEach((event) => {
          db.run(
            `INSERT INTO events (title, description, date, time, location, max_capacity, image_url) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [event.title, event.description, event.date, event.time, event.location, event.max_capacity, event.image_url]
          );
        });
      }
    });
  });
}

export function runAsync(query: string, params: any[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    getDb().run(query, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

export function getAsync(query: string, params: any[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    getDb().get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export function allAsync(query: string, params: any[] = []): Promise<any[]> {
  return new Promise((resolve, reject) => {
    getDb().all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

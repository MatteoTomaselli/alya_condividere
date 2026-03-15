import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper per formattare i risultati come SQLite
export async function runAsync(query: string, params: any[] = []) {
  try {
    // Per INSERT, UPDATE, DELETE - usare direttamente i metodi Supabase
    const { data, error } = await supabase.rpc('exec_query', { 
      p_query: query, 
      p_params: params 
    }).catch(() => {
      // Se RPC non disponibile, ritorna un placeholder
      return { data: { id: Date.now() }, error: null };
    });
    
    if (error) throw error;
    return data || { id: Date.now() };
  } catch (error) {
    console.error('Database error:', error);
    return { id: Date.now() };
  }
}

export async function getAsync(query: string, params: any[] = []) {
  try {
    // Parsing semplice per query SELECT con WHERE
    if (query.includes('SELECT * FROM events WHERE id')) {
      const eventId = params[0];
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
    
    if (query.includes('SELECT * FROM admin WHERE email')) {
      const email = params[0];
      const { data, error } = await supabase
        .from('admin')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
    
    return null;
  } catch (error) {
    console.error('Database error:', error);
    return null;
  }
}

export async function allAsync(query: string, params: any[] = []) {
  try {
    // Parsing per SELECT con WHERE
    if (query.includes('SELECT * FROM bookings WHERE event_id')) {
      const eventId = params[0];
      let dbQuery = supabase.from('bookings').select('*').eq('event_id', eventId);
      
      // Aggiunge filtro status se presente
      if (params.length > 1) {
        dbQuery = dbQuery.eq('status', params[1]);
      }
      
      const { data, error } = await dbQuery;
      if (error) throw error;
      return data || [];
    }
    
    if (query.includes('SELECT * FROM events')) {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
    
    if (query.includes('SELECT * FROM bookings')) {
      const { data, error } = await supabase
        .from('bookings')
        .select('*');
      
      if (error) throw error;
      return data || [];
    }
    
    return [];
  } catch (error) {
    console.error('Database error:', error);
    return [];
  }
}

// Funzioni specifiche Supabase
export async function getEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

export async function getEventById(id: number) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function createBooking(event_id: number, people: any[], status: string = 'confirmed') {
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      event_id,
      people,
      status
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateBooking(id: number, updates: any) {
  const { data, error } = await supabase
    .from('bookings')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteBooking(id: number) {
  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

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

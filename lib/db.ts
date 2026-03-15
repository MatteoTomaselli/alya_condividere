import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper per formattare i risultati come SQLite
export async function runAsync(query: string, params: any[] = []) {
  try {
    // Per INSERT INTO bookings
    if (query.includes('INSERT INTO bookings')) {
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          event_id: params[0],
          people: params[1],
          status: params[2] || 'confirmed'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }

    // Per UPDATE bookings
    if (query.includes('UPDATE bookings')) {
      const id = params[0];
      const updates = params[1] || {};
      
      const { data, error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }

    // Per DELETE bookings
    if (query.includes('DELETE FROM bookings')) {
      const id = params[0];
      
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { success: true };
    }

    // Fallback per altre query
    return { id: Date.now() };
  } catch (error) {
    console.error('Database error:', error);
    throw error;
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

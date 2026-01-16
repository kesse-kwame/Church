import { supabase, isSupabaseEnabled } from '../lib/supabaseClient';

const STORAGE_KEY = 'churchAttendance';

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || '[]';
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function write(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list, null, 2));
}

export async function getAll() {
  if (isSupabaseEnabled()) {
    const { data, error } = await supabase.from('attendance').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
  return read().sort((a, b) => (a.timestamp > b.timestamp ? -1 : 1));
}

export async function create(record) {
  if (isSupabaseEnabled()) {
    const { data, error } = await supabase.from('attendance').insert(record).select().single();
    if (error) throw error;
    return data;
  }
  const all = read();
  all.push(record);
  write(all);
  return record;
}

export async function remove(id) {
  if (isSupabaseEnabled()) {
    const { error } = await supabase.from('attendance').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
  const all = read().filter(a => a.id !== id);
  write(all);
  return true;
}

export async function clearAll() {
  if (isSupabaseEnabled()) {
    const { error } = await supabase.from('attendance').delete().neq('id', '');
    if (error) throw error;
    return true;
  }
  localStorage.removeItem(STORAGE_KEY);
  return true;
}

// Fallback localStorage service with optional Supabase-backed implementation
import { supabase, isSupabaseEnabled } from '../lib/supabaseClient';

const STORAGE_KEY = 'church_members_v1';

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

// Supabase-aware functions
async function getAll() {
  if (isSupabaseEnabled()) {
    const { data, error } = await supabase.from('members').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
  return read().sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
}

async function get(id) {
  if (isSupabaseEnabled()) {
    const { data, error } = await supabase.from('members').select('*').eq('id', id).single();
    if (error) return null;
    return data;
  }
  return read().find(m => m.id === id);
}

async function create(member) {
  if (isSupabaseEnabled()) {
    const payload = { ...member };
    const { data, error } = await supabase.from('members').insert(payload).select().single();
    if (error) throw error;
    return data;
  }

  const all = read();
  all.push(member);
  write(all);
  return member;
}

async function update(id, changes) {
  if (isSupabaseEnabled()) {
    const { data, error } = await supabase.from('members').update(changes).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  const all = read();
  const idx = all.findIndex(m => m.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...changes, updatedAt: new Date().toISOString() };
  write(all);
  return all[idx];
}

async function remove(id) {
  if (isSupabaseEnabled()) {
    const { error } = await supabase.from('members').delete().eq('id', id);
    if (error) throw error;
    return true;
  }

  const all = read().filter(m => m.id !== id);
  write(all);
  return true;
}

async function importList(list) {
  if (!Array.isArray(list)) return;
  if (isSupabaseEnabled()) {
    // naive: upsert by member_code if present
    const { data, error } = await supabase.from('members').upsert(list);
    if (error) throw error;
    return data;
  }

  const existing = read();
  const map = new Map(existing.map(m => [m.id, m]));
  list.forEach(item => {
    if (!item.id) return;
    map.set(item.id, { ...map.get(item.id), ...item });
  });
  const merged = Array.from(map.values());
  write(merged);
}

export default {
  getAll,
  get,
  create,
  update,
  remove,
  import: importList
};
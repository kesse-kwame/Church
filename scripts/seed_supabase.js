import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error('Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your env');
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

async function seed() {
  try {
    // Insert sample members
    const members = [
      { member_code: 'CH-2025-0001', first_name: 'John', last_name: 'Doe', email: 'john@example.com' },
      { member_code: 'CH-2025-0002', first_name: 'Mary', last_name: 'Smith', email: 'mary@example.com' },
      { member_code: 'CH-2025-0003', first_name: 'Peter', last_name: 'Johnson', email: 'peter@example.com' }
    ];

    const { data: mdata, error: merr } = await supabase.from('members').upsert(members).select();
    if (merr) throw merr;
    console.log('Members seeded:', mdata.length);

    // Insert sample attendance
    const attendance = [
      { attendance_code: 'ATT-1', member_name: 'John Doe', member_member_code: 'CH-2025-0001', service_date: '2026-01-04', service_type: 'Sunday Service', group_name: 'Choir', department: 'Choir', status: 'Present' },
      { attendance_code: 'ATT-2', member_name: 'Mary Smith', member_member_code: 'CH-2025-0002', service_date: '2026-01-04', service_type: 'Sunday Service', group_name: 'Youth Group', department: 'Children Ministry', status: 'Late' }
    ];

    const { data: adata, error: aerr } = await supabase.from('attendance').upsert(attendance).select();
    if (aerr) throw aerr;
    console.log('Attendance seeded:', adata.length);
  } catch (err) {
    console.error('Seed failed', err);
  }
}

seed();

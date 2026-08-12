export default async function handler(req, res) {
  // Set CORS headers for Vercel
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const payload = req.body;

    const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ozmvemetjpohyirfqyji.supabase.co';
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96bXZlbWV0anBvaHlpcmZxeWppIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjUzMDIxMCwiZXhwIjoyMTAyMTA6MjEwfQ.cgCCCCOjHyvo36Rw02YEN8ZkV7h2Hca1WVP92J52sas';
    const SUPABASE_KEY_CLEAN = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96bXZlbWV0anBvaHlpcmZxeWppIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjUzMDIxMCwiZXhwIjoyMTAyMTA2MjEwfQ.cgCCCCOjHyvo36Rw02YEN8ZkV7h2Hca1WVP92J52sas';

    const restEndpoint = `${SUPABASE_URL}/rest/v1/partner_with_us`;

    const leadRecord = {
      developer_firm_name: String(payload.developer_firm_name || 'Direct Inquiry').trim(),
      contact_person: String(payload.contact_person || 'Anonymous').trim(),
      phone_number: String(payload.phone_number || '').trim(),
      work_email: String(payload.work_email || '').trim(),
      project_category: String(payload.project_category || 'General Real Estate Mandate').trim(),
      project_location_units: String(payload.project_location_units || '').trim(),
      mandate_requirements_message: String(payload.mandate_requirements_message || '').trim()
    };

    const response = await fetch(restEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY_CLEAN,
        'Authorization': `Bearer ${SUPABASE_KEY_CLEAN}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify([leadRecord])
    });

    const data = await response.json().catch(() => ([]));

    if (response.ok) {
      return res.status(200).json({ success: true, message: 'Saved to Supabase via Vercel Function', data });
    } else {
      return res.status(response.status).json({ success: false, error: data });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

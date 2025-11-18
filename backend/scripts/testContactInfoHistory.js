/**
 * Minimal test script for Contact Info history snapshots.
 * Requires Node 18+ (fetch available) and ADMIN_TOKEN env var with a valid JWT that has canEditProfile permission.
 * Usage (Windows cmd):
 *   set ADMIN_TOKEN=YOUR_TOKEN_HERE && node backend\scripts\testContactInfoHistory.js
 */

const API_BASE = process.env.API_BASE || 'http://localhost:5000';
const TOKEN = process.env.ADMIN_TOKEN;

if (!TOKEN) {
  console.error('Missing ADMIN_TOKEN environment variable. Aborting test.');
  process.exit(1);
}

async function run() {
  try {
    // Upsert contact info (controller will create or update singleton and write history)
    const payload = {
      email: 'admin@example.com',
      phone: '+1-555-000-1234',
      address: { city: 'Testville', state: 'TS', country: 'Wonderland' },
      socialLinks: { github: 'https://github.com/example' },
      availability: 'available',
      responseTime: '12 hours'
    };

    const upsertRes = await fetch(`${API_BASE}/api/admin/contact-info`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` },
      body: JSON.stringify(payload)
    });
    const upsertJson = await upsertRes.json();
    console.log('Upsert contact-info status:', upsertRes.status, upsertJson.action || upsertJson.message); 

    // Fetch history
    const histRes = await fetch(`${API_BASE}/api/admin/contact-info/history`, {
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    });
    const histJson = await histRes.json();
    console.log('History status:', histRes.status);
    if (histJson.success) {
      console.log(`History entries: ${histJson.data.length}`);
      console.log('Most recent entry snapshotAt:', histJson.data[0]?.snapshotAt);
      console.log('Recent entry action:', histJson.data[0]?.action);
    } else {
      console.error('Failed to fetch history:', histJson.error || histJson.message);
    }
  } catch (err) {
    console.error('Test script error:', err);
    process.exit(1);
  }
}

run();

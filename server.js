/**
 * Saravest Ultra-Luxury Real Estate Node.js Server Application
 * Express.js Backend Server with Latitude & Longitude GPS Reverse Market Lookup API
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const SUPABASE_REST_URL = 'https://heewyxwpvgytooarfpcp.supabase.co/rest/v1/sales_mandate_inquiries';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhlZXd5eHdwdmd5dG9vYXJmcGNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0NjU2NjEsImV4cCI6MjEwMjA0MTY2MX0.-RsxFahCNx7Ph3ZHrDq9gDyiqAKn7YwPyKNyJ_X0SOU';

function forwardLeadToSupabase(leadObj) {
  try {
    const postData = JSON.stringify([leadObj]);
    const parsedUrl = new URL(SUPABASE_REST_URL);

    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=minimal'
      }
    };

    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        console.log(`[NODE SERVER ➔ SUPABASE REST] Response status: ${res.statusCode}`);
      });
    });

    req.on('error', (e) => {
      console.error('[NODE SERVER ➔ SUPABASE REST ERROR]', e.message);
    });

    req.write(postData);
    req.end();
  } catch (err) {
    console.error('[NODE SERVER ➔ SUPABASE EXCEPTION]', err);
  }
}

const PORT = process.env.PORT || 8080;
const PUBLIC_DIR = path.join(__dirname, 'public');

// South India GPS Coordinate Micro-Market Benchmarks (Lat, Lng)
const gpsMarketIndex = [
  // TAMIL NADU
  { locality: 'ECR Highway Corridor', city: 'Chennai', state: 'Tamil Nadu', lat: 12.8914, lng: 80.2520, ratePlotSqft: 5400, rateFlatSqft: 8200, cagr: 14.2 },
  { locality: 'OMR / IT Expressway', city: 'Chennai', state: 'Tamil Nadu', lat: 12.8449, lng: 80.2265, ratePlotSqft: 6200, rateFlatSqft: 7500, cagr: 12.8 },
  { locality: 'Anna Nagar Prime', city: 'Chennai', state: 'Tamil Nadu', lat: 13.0850, lng: 80.2101, ratePlotSqft: 14500, rateFlatSqft: 16800, cagr: 10.5 },
  { locality: 'Tambaram / GST Road', city: 'Chennai', state: 'Tamil Nadu', lat: 12.9249, lng: 80.1000, ratePlotSqft: 3800, rateFlatSqft: 5200, cagr: 13.5 },
  { locality: 'Avinashi Road Corridor', city: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0267, lng: 77.0142, ratePlotSqft: 4800, rateFlatSqft: 6800, cagr: 13.1 },
  { locality: 'Saravanampatti IT Zone', city: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0797, lng: 76.9997, ratePlotSqft: 3200, rateFlatSqft: 4900, cagr: 14.6 },
  { locality: 'SIPCOT Industrial Belt', city: 'Hosur', state: 'Tamil Nadu', lat: 12.7409, lng: 77.8253, ratePlotSqft: 2800, rateFlatSqft: 4200, cagr: 16.2 },

  // KARNATAKA
  { locality: 'Whitefield Tech Corridor', city: 'Bengaluru', state: 'Karnataka', lat: 12.9698, lng: 77.7499, ratePlotSqft: 7200, rateFlatSqft: 9800, cagr: 13.8 },
  { locality: 'Sarjapur Road Hub', city: 'Bengaluru', state: 'Karnataka', lat: 12.9098, lng: 77.6850, ratePlotSqft: 6800, rateFlatSqft: 8900, cagr: 14.5 },
  { locality: 'Yelahanka North Expressway', city: 'Bengaluru', state: 'Karnataka', lat: 13.1007, lng: 77.5963, ratePlotSqft: 5900, rateFlatSqft: 7600, cagr: 15.2 },
  { locality: 'Devanahalli Airport Zone', city: 'Bengaluru', state: 'Karnataka', lat: 13.2458, lng: 77.7122, ratePlotSqft: 4800, rateFlatSqft: 6800, cagr: 16.8 },

  // TELANGANA
  { locality: 'Gachibowli Financial Hub', city: 'Hyderabad', state: 'Telangana', lat: 17.4401, lng: 78.3489, ratePlotSqft: 9500, rateFlatSqft: 11200, cagr: 16.4 },
  { locality: 'Kokapet Golden Mile', city: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.3275, ratePlotSqft: 11800, rateFlatSqft: 13500, cagr: 17.8 },
  { locality: 'Tellapur Growth Belt', city: 'Hyderabad', state: 'Telangana', lat: 17.4623, lng: 78.2811, ratePlotSqft: 6500, rateFlatSqft: 8200, cagr: 15.5 },

  // ANDHRA PRADESH & KERALA
  { locality: 'MVP Colony Belt', city: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.7431, lng: 83.3327, ratePlotSqft: 5200, rateFlatSqft: 6800, cagr: 13.5 },
  { locality: 'Kakkanad InfoPark Zone', city: 'Kochi', state: 'Kerala', lat: 10.0069, lng: 76.3574, ratePlotSqft: 5200, rateFlatSqft: 6900, cagr: 13.4 },
  { locality: 'Kazhakkoottam TechnoPark', city: 'Thiruvananthapuram', state: 'Kerala', lat: 8.5581, lng: 76.8814, ratePlotSqft: 4800, rateFlatSqft: 6400, cagr: 13.8 }
];

// Calculate Haversine distance in km between two GPS points
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const leadsDatabase = [];

// MIME Types map
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  // GPS Reverse Geocode API Endpoint
  if (url.pathname === '/api/geocode' && req.method === 'GET') {
    const lat = parseFloat(url.searchParams.get('lat'));
    const lng = parseFloat(url.searchParams.get('lng'));

    if (isNaN(lat) || isNaN(lng)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Please provide valid lat and lng coordinates' }));
      return;
    }

    // Find nearest market node
    let nearest = gpsMarketIndex[0];
    let minDistance = haversineDistance(lat, lng, nearest.lat, nearest.lng);

    gpsMarketIndex.forEach(loc => {
      const dist = haversineDistance(lat, lng, loc.lat, loc.lng);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = loc;
      }
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      query: { lat, lng },
      matchedLocation: nearest,
      distanceKm: parseFloat(minDistance.toFixed(2))
    }));
    return;
  }

  if (url.pathname === '/api/leads' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const rawDate = payload.site_visit_date ? String(payload.site_visit_date).trim() : '';
        const validDate = (rawDate && rawDate.length >= 8) ? rawDate : null;

        const rawSize = parseInt(payload.preferred_plot_size_sqft, 10);
        const validPlotSize = (!isNaN(rawSize) && rawSize > 0) ? rawSize : 2400;

        const newLead = {
          id: 'lead_' + Date.now(),
          full_name: payload.full_name || payload.name || 'Anonymous Plot Buyer',
          phone_number: payload.phone_number || payload.phone || '',
          email: payload.email || '',
          plot_purpose: payload.plot_purpose || payload.interest || 'Residential / Villa Plot Purchase',
          target_budget: payload.target_budget || payload.budget || '',
          target_location: payload.target_location || '',
          preferred_plot_size_sqft: validPlotSize,
          orientation: payload.orientation || 'East Facing',
          site_visit_date: validDate,
          specific_requirements: payload.specific_requirements || payload.message || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        leadsDatabase.push(newLead);
        console.log('[NODE SERVER] Saved lead for plot_inquiry_leads:', newLead);

        // Forward lead asynchronously to Supabase REST API
        forwardLeadToSupabase(newLead);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          table: 'plot_inquiry_leads',
          message: 'Enquiry submitted successfully. Your details have been recorded.',
          leadId: newLead.id,
          data: newLead
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid JSON payload' }));
      }
    });
    return;
  }

  // Serve static assets from /public or root
  let filePath = path.join(PUBLIC_DIR, url.pathname === '/' ? 'index.html' : url.pathname);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, url.pathname === '/' ? 'index.html' : url.pathname);
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'text/plain';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1><p>Saravest Node Server could not locate the requested resource.</p>');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`[SARAVEST NODE SERVER] Operating on http://localhost:${PORT}`);
});

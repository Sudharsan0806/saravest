/**
 * Saravest Frontend Application Controller (app.js)
 * Connects UI elements, GSAP scroll triggers, GPS Latitude/Longitude Geocode Search Engine & Property Appreciation Calculator
 */

document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  // Loader animation fallback & instant execution
  function dismissLoader() {
    const loader = document.getElementById('loader');
    if (!loader || loader.dataset.dismissed) return;
    loader.dataset.dismissed = 'true';

    gsap.to('#loader-fill', { width: '100%', duration: 0.4, ease: 'power2.inOut' });
    gsap.timeline({ delay: 0.4 })
      .to('#loader', { opacity: 0, duration: 0.4, ease: 'power2.inOut', onComplete: () => { loader.style.display = 'none'; } })
      .from('.hero h1 .line span', { yPercent: 110, duration: 0.8, ease: 'power4.out', stagger: 0.1 }, '-=.3')
      .to('.hero-sub', { opacity: 1, duration: 0.6 }, '-=.4')
      .to('.hero-ctas .btn', { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' }, '-=.5')
      .to('.scroll-indicator', { opacity: 1, duration: 0.5 }, '-=.3');
    gsap.from('.hero-eyebrow span', { yPercent: 120, duration: 0.8, delay: 0.5, ease: 'power4.out' });
  }

  if (document.readyState === 'complete') {
    dismissLoader();
  } else {
    window.addEventListener('load', dismissLoader);
    setTimeout(dismissLoader, 1000); // 1-second failsafe timer
  }

  // Custom Cursor
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  let mx = 0, my = 0, rx = 0, ry = 0;

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    if (dot) {
      dot.style.left = mx + 'px';
      dot.style.top = my + 'px';
    }
  });

  gsap.ticker.add(() => {
    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    if (ring) {
      ring.style.left = rx + 'px';
      ring.style.top = ry + 'px';
    }
  });

  document.querySelectorAll('a, button, .service-card, .project-card, .leader-card').forEach((el) => {
    el.addEventListener('mouseenter', () => ring && ring.classList.add('grow'));
    el.addEventListener('mouseleave', () => ring && ring.classList.remove('grow'));
  });

  // Scroll Progress Bar & Navbar Scroll State
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    const h = document.documentElement;
    const pct = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    const progressEl = document.getElementById('scroll-progress');
    if (progressEl) progressEl.style.width = pct + '%';
    if (nav) nav.classList.toggle('scrolled', h.scrollTop > 40);
  });

  // Mobile Nav Toggle
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));
  }

  // Magnetic Buttons & Ripple Effect
  document.querySelectorAll('.btn').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      gsap.to(btn, { x: x * 0.25, y: y * 0.35, duration: 0.4, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1,0.4)' }));
    btn.addEventListener('click', function (e) {
      const r = document.createElement('span');
      r.className = 'ripple';
      const rect = this.getBoundingClientRect();
      r.style.left = (e.clientX - rect.left) + 'px';
      r.style.top = (e.clientY - rect.top) + 'px';
      this.appendChild(r);
      setTimeout(() => r.remove(), 650);
    });
  });

  // Card Glow Follow
  document.querySelectorAll('.service-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  // Scroll Reveals
  gsap.utils.toArray('.reveal').forEach((el) => {
    gsap.to(el, {
      opacity: 1, y: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%' }
    });
  });

  // Animated Stat Counters
  document.querySelectorAll('.stat-num').forEach((el) => {
    const target = +el.dataset.count;
    const pre = el.dataset.prefix || '';
    const suf = el.dataset.suffix || '';
    ScrollTrigger.create({
      trigger: el, start: 'top 85%', once: true, onEnter: () => {
        let obj = { val: 0 };
        gsap.to(obj, {
          val: target, duration: 2, ease: 'power2.out', onUpdate: () => {
            el.textContent = pre + Math.floor(obj.val) + suf;
          }
        });
      }
    });
  });

  // Dynamic Project Category Filter Tabs
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;

      projectCards.forEach(card => {
        if (cat === 'all' || card.dataset.category === cat) {
          card.style.display = 'block';
          gsap.fromTo(card, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 });
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // -----------------------------------------------------------------------
  // LATITUDE & LONGITUDE GPS MARKET ESTIMATOR ENGINE
  // -----------------------------------------------------------------------
  const gpsIndex = [
    { locality: 'ECR Highway Corridor', city: 'Chennai', state: 'Tamil Nadu', lat: 12.8914, lng: 80.2520, ratePlotSqft: 5400, rateFlatSqft: 8200, cagr: 14.2 },
    { locality: 'OMR / IT Expressway', city: 'Chennai', state: 'Tamil Nadu', lat: 12.8449, lng: 80.2265, ratePlotSqft: 6200, rateFlatSqft: 7500, cagr: 12.8 },
    { locality: 'Anna Nagar Prime', city: 'Chennai', state: 'Tamil Nadu', lat: 13.0850, lng: 80.2101, ratePlotSqft: 14500, rateFlatSqft: 16800, cagr: 10.5 },
    { locality: 'Tambaram / GST Road', city: 'Chennai', state: 'Tamil Nadu', lat: 12.9249, lng: 80.1000, ratePlotSqft: 3800, rateFlatSqft: 5200, cagr: 13.5 },
    { locality: 'Avinashi Road Corridor', city: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0267, lng: 77.0142, ratePlotSqft: 4800, rateFlatSqft: 6800, cagr: 13.1 },
    { locality: 'Saravanampatti IT Zone', city: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0797, lng: 76.9997, ratePlotSqft: 3200, rateFlatSqft: 4900, cagr: 14.6 },
    { locality: 'SIPCOT Industrial Belt', city: 'Hosur', state: 'Tamil Nadu', lat: 12.7409, lng: 77.8253, ratePlotSqft: 2800, rateFlatSqft: 4200, cagr: 16.2 },
    { locality: 'Whitefield Tech Corridor', city: 'Bengaluru', state: 'Karnataka', lat: 12.9698, lng: 77.7499, ratePlotSqft: 7200, rateFlatSqft: 9800, cagr: 13.8 },
    { locality: 'Sarjapur Road Hub', city: 'Bengaluru', state: 'Karnataka', lat: 12.9098, lng: 77.6850, ratePlotSqft: 6800, rateFlatSqft: 8900, cagr: 14.5 },
    { locality: 'Yelahanka North Expressway', city: 'Bengaluru', state: 'Karnataka', lat: 13.1007, lng: 77.5963, ratePlotSqft: 5900, rateFlatSqft: 7600, cagr: 15.2 },
    { locality: 'Gachibowli Financial Hub', city: 'Hyderabad', state: 'Telangana', lat: 17.4401, lng: 78.3489, ratePlotSqft: 9500, rateFlatSqft: 11200, cagr: 16.4 },
    { locality: 'Kokapet Golden Mile', city: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.3275, ratePlotSqft: 11800, rateFlatSqft: 13500, cagr: 17.8 },
    { locality: 'MVP Colony Belt', city: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.7431, lng: 83.3327, ratePlotSqft: 5200, rateFlatSqft: 6800, cagr: 13.5 },
    { locality: 'Kakkanad InfoPark Zone', city: 'Kochi', state: 'Kerala', lat: 10.0069, lng: 76.3574, ratePlotSqft: 5200, rateFlatSqft: 6900, cagr: 13.4 }
  ];

  function calcDist(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }

  const inputLat = document.getElementById('inputLat');
  const inputLng = document.getElementById('inputLng');
  const btnGeocodeSearch = document.getElementById('btnGeocodeSearch');

  const selectPropType = document.getElementById('calcPropType');
  const sliderArea = document.getElementById('calcArea');

  const valArea = document.getElementById('valArea');
  const valMarketRate = document.getElementById('valMarketRate');
  const valCAGR = document.getElementById('valCAGR');
  const valLocLabel = document.getElementById('valLocLabel');

  const resValuation = document.getElementById('resValuation');
  const resFutureVal = document.getElementById('resFutureVal');
  const resGain = document.getElementById('resGain');

  const gmapsDynamicLink = document.getElementById('gmapsDynamicLink');
  const googleMapIframe = document.getElementById('googleMapIframe');

  let currentLat = 12.8914;
  let currentLng = 80.2520;
  let currentMatch = gpsIndex[0];

  async function performGeocodeLookup(lat, lng) {
    currentLat = lat;
    currentLng = lng;

    // Try Node backend reverse geocode API if reachable
    try {
      const res = await fetch(`/api/geocode?lat=${lat}&lng=${lng}`);
      const data = await res.json();
      if (data.success && data.matchedLocation) {
        currentMatch = data.matchedLocation;
        updateGpsCalculator();
        return;
      }
    } catch (err) {
      console.log('[CLIENT] Geocode fallback active:', err);
    }

    // Client-side Haversine matching fallback
    let nearest = gpsIndex[0];
    let minDist = calcDist(lat, lng, nearest.lat, nearest.lng);

    gpsIndex.forEach(item => {
      const d = calcDist(lat, lng, item.lat, item.lng);
      if (d < minDist) {
        minDist = d;
        nearest = item;
      }
    });

    currentMatch = nearest;
    updateGpsCalculator();
  }

  function updateGpsCalculator() {
    if (!sliderArea || !currentMatch) return;
    const propType = selectPropType ? selectPropType.value : 'plot';
    const areaSqft = parseFloat(sliderArea.value);
    const ratePerSqft = propType === 'plot' ? currentMatch.ratePlotSqft : currentMatch.rateFlatSqft;
    const cagrPercent = currentMatch.cagr;

    // Calculations
    const currentValuation = areaSqft * ratePerSqft;
    const futureValuation5Yr = currentValuation * Math.pow(1 + (cagrPercent / 100), 5);
    const netAppreciationGain = futureValuation5Yr - currentValuation;

    function formatMoney(num) {
      if (num >= 10000000) return '₹' + (num / 10000000).toFixed(2) + ' Cr';
      if (num >= 100000) return '₹' + (num / 100000).toFixed(2) + ' Lakhs';
      return '₹' + Math.round(num).toLocaleString('en-IN');
    }

    if (valLocLabel) valLocLabel.textContent = `${currentMatch.locality}, ${currentMatch.city} [GPS: ${currentLat.toFixed(4)}, ${currentLng.toFixed(4)}]`;
    if (valArea) valArea.textContent = areaSqft.toLocaleString('en-IN') + ' sqft';
    if (valMarketRate) valMarketRate.textContent = '₹' + ratePerSqft.toLocaleString('en-IN') + '/sqft';
    if (valCAGR) valCAGR.textContent = '+' + cagrPercent + '% p.a.';

    if (resValuation) resValuation.textContent = formatMoney(currentValuation);
    if (resFutureVal) resFutureVal.textContent = formatMoney(futureValuation5Yr);
    if (resGain) resGain.textContent = '+' + formatMoney(netAppreciationGain);

    // Update Google Maps Link with exact Lat, Lng
    if (gmapsDynamicLink) {
      gmapsDynamicLink.href = `https://www.google.com/maps/search/?api=1&query=${currentLat},${currentLng}`;
      gmapsDynamicLink.innerHTML = `<span>View GPS Coordinates (${currentLat.toFixed(4)}, ${currentLng.toFixed(4)}) on Google Maps</span> 📍`;
    }

    // Update Google Maps Iframe with exact Lat, Lng
    if (googleMapIframe) {
      googleMapIframe.src = `https://maps.google.com/maps?q=${currentLat},${currentLng}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
    }
  }

  if (btnGeocodeSearch && inputLat && inputLng) {
    btnGeocodeSearch.addEventListener('click', (e) => {
      e.preventDefault();
      const lat = parseFloat(inputLat.value);
      const lng = parseFloat(inputLng.value);
      if (!isNaN(lat) && !isNaN(lng)) {
        performGeocodeLookup(lat, lng);
      }
    });
  }

  // Handle Preset GPS Pills
  document.querySelectorAll('.gps-preset-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const lat = parseFloat(pill.dataset.lat);
      const lng = parseFloat(pill.dataset.lng);
      if (inputLat) inputLat.value = lat;
      if (inputLng) inputLng.value = lng;
      performGeocodeLookup(lat, lng);
    });
  });

  if (selectPropType) selectPropType.addEventListener('change', updateGpsCalculator);
  if (sliderArea) sliderArea.addEventListener('input', updateGpsCalculator);

  // Initial calculation trigger
  updateGpsCalculator();

  // Lead Popup Modal
  const overlay = document.getElementById('popupOverlay');
  const popupClose = document.getElementById('popupClose');
  const formView = document.getElementById('formView');
  const thankView = document.getElementById('thankyouView');
  const plotPurposeSelect = document.getElementById('formPlotPurpose') || document.getElementById('interestSelect');

  function openPopup(kind, detailName = '') {
    if (!overlay) return;
    if (formView) formView.style.display = 'block';
    if (thankView) thankView.style.display = 'none';

    if (plotPurposeSelect) {
      if (kind === 'land') plotPurposeSelect.value = 'Residential / Villa Plot Purchase';
      else if (kind === 'builder') plotPurposeSelect.value = 'Commercial Land Plot Purchase';
      else if (kind === 'ready') plotPurposeSelect.value = 'High ROI Investment Land';
    }

    if (detailName) {
      const msgField = document.querySelector('#formSpecificRequirements') || document.querySelector('#leadForm textarea');
      if (msgField) msgField.value = `Enquiry regarding: ${detailName}`;
    }

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closePopup() {
    if (!overlay) return;
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-popup]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      openPopup(el.dataset.popup, el.dataset.detail || '');
    });
  });

  if (popupClose) popupClose.addEventListener('click', closePopup);
  if (overlay) overlay.addEventListener('click', (e) => { if (e.target === overlay) closePopup(); });

  // Founder Bio & Consultation Modal Handlers
  const founderOverlay = document.getElementById('founderOverlay');
  const founderClose = document.getElementById('founderClose');
  const btnConsultFounder = document.getElementById('btnConsultFounder');
  const btnFounderBookInquiry = document.getElementById('btnFounderBookInquiry');

  function openFounderModal() {
    if (founderOverlay) {
      founderOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeFounderModal() {
    if (founderOverlay) {
      founderOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (btnConsultFounder) {
    btnConsultFounder.addEventListener('click', (e) => {
      e.preventDefault();
      openFounderModal();
    });
  }

  if (founderClose) founderClose.addEventListener('click', closeFounderModal);
  if (founderOverlay) {
    founderOverlay.addEventListener('click', (e) => {
      if (e.target === founderOverlay) closeFounderModal();
    });
  }

  if (btnFounderBookInquiry) {
    btnFounderBookInquiry.addEventListener('click', () => {
      closeFounderModal();
      openPopup('land', 'Advisory Session with Founder Bhupathy');
    });
  }

  // Sudharsan Bio & Advisory Modal Handlers
  const sudharsanOverlay = document.getElementById('sudharsanOverlay');
  const sudharsanClose = document.getElementById('sudharsanClose');
  const btnContactPlotAdvisory = document.getElementById('btnContactPlotAdvisory');
  const btnSudharsanBookInquiry = document.getElementById('btnSudharsanBookInquiry');

  function openSudharsanModal() {
    if (sudharsanOverlay) {
      sudharsanOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeSudharsanModal() {
    if (sudharsanOverlay) {
      sudharsanOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (btnContactPlotAdvisory) {
    btnContactPlotAdvisory.addEventListener('click', (e) => {
      e.preventDefault();
      openSudharsanModal();
    });
  }

  if (sudharsanClose) sudharsanClose.addEventListener('click', closeSudharsanModal);
  if (sudharsanOverlay) {
    sudharsanOverlay.addEventListener('click', (e) => {
      if (e.target === sudharsanOverlay) closeSudharsanModal();
    });
  }

  if (btnSudharsanBookInquiry) {
    btnSudharsanBookInquiry.addEventListener('click', () => {
      closeSudharsanModal();
      openPopup('land', 'Inquiry for Marketing Manager Sudharsan');
    });
  }

  // Supabase Client Config & Storage Initialization
  const cfgUrlInput = document.getElementById('cfgSupabaseUrl');
  const cfgKeyInput = document.getElementById('cfgSupabaseAnonKey');
  const btnSaveConfig = document.getElementById('btnSaveSupabaseConfig');
  const cfgStatusMsg = document.getElementById('cfgStatusMsg');

  const DEFAULT_SUPABASE_URL = 'https://ozmvemetjpohyirfqyji.supabase.co';
  const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96bXZlbWV0anBvaHlpcmZxeWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1MzAyMTAsImV4cCI6MjEwMjEwNjIxMH0.v4PkR9iH0uQFrG-ZqD3TdUB5BDAsNn7XHWJgxTxCAVM';

  let savedUrl = localStorage.getItem('SARAVEST_SUPABASE_URL') || window.SUPABASE_URL || DEFAULT_SUPABASE_URL;
  let savedKey = localStorage.getItem('SARAVEST_SUPABASE_KEY') || window.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY;

  if (cfgUrlInput) cfgUrlInput.value = savedUrl;
  if (cfgKeyInput) cfgKeyInput.value = savedKey;

  let supabaseClient = null;

  function initSupabase(url, key) {
    if (typeof supabase !== 'undefined' && url && key && !url.includes('your-supabase-project-id')) {
      try {
        supabaseClient = supabase.createClient(url, key);
        console.log('[SUPABASE] Client initialized for plot_inquiry_leads table:', url);
        return true;
      } catch (err) {
        console.error('[SUPABASE INIT ERROR]', err);
        return false;
      }
    }
    return false;
  }

  if (savedUrl && savedKey) {
    initSupabase(savedUrl, savedKey);
  }

  if (btnSaveConfig) {
    btnSaveConfig.addEventListener('click', () => {
      const url = cfgUrlInput ? cfgUrlInput.value.trim() : '';
      const key = cfgKeyInput ? cfgKeyInput.value.trim() : '';

      if (!url || !key) {
        if (cfgStatusMsg) cfgStatusMsg.textContent = '❌ Please enter both Supabase URL & Anon Key';
        return;
      }

      localStorage.setItem('SARAVEST_SUPABASE_URL', url);
      localStorage.setItem('SARAVEST_SUPABASE_KEY', key);

      const ok = initSupabase(url, key);
      if (ok && cfgStatusMsg) {
        cfgStatusMsg.textContent = '✓ Saved! Submissions will now write to plot_inquiry_leads table.';
      } else if (cfgStatusMsg) {
        cfgStatusMsg.textContent = '⚠️ Check console for connection details.';
      }
    });
  }

  // Node.js API AJAX & Supabase Database Lead Form Submission
  const leadForm = document.getElementById('leadForm');
  const thankyouText = document.getElementById('thankyouText');

  if (leadForm) {
    leadForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const rawDate = document.getElementById('formSiteVisitDate')?.value?.trim();
      const validDate = (rawDate && rawDate.length >= 8) ? rawDate : null;

      const rawPlotSize = parseInt(document.getElementById('formPlotSizeSqft')?.value, 10);
      const validPlotSize = (!isNaN(rawPlotSize) && rawPlotSize > 0) ? rawPlotSize : 2400;

      const leadRecord = {
        full_name: document.getElementById('formFullName')?.value?.trim() || 'Plot Buyer',
        phone_number: document.getElementById('formPhoneNumber')?.value?.trim() || '',
        email: document.getElementById('formEmail')?.value?.trim() || '',
        plot_purpose: document.getElementById('formPlotPurpose')?.value || 'Residential / Villa Plot Purchase',
        target_budget: document.getElementById('formTargetBudget')?.value?.trim() || '',
        target_location: document.getElementById('formTargetLocation')?.value?.trim() || '',
        preferred_plot_size_sqft: validPlotSize,
        orientation: document.getElementById('formOrientation')?.value || 'East Facing',
        site_visit_date: validDate,
        specific_requirements: document.getElementById('formSpecificRequirements')?.value?.trim() || ''
      };

      console.log('[LEAD SUBMISSION] Submitting payload for plot_inquiry_leads:', leadRecord);

      let supabaseSaved = false;
      let sbErrorMessage = '';

      // 1. Submit via backend server endpoint /api/leads (uses Secret Key in protected environment)
      try {
        const response = await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(leadRecord)
        });
        const resData = await response.json();
        console.log('[SERVER API] Response:', resData);
        if (resData.success) {
          supabaseSaved = true;
        }
      } catch (err) {
        console.warn('[SERVER API FALLBACK]', err);
      }

      // 2. Direct browser REST API call with JWT Anon Key
      if (!supabaseSaved) {
        try {
          const anonJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96bXZlbWV0anBvaHlpcmZxeWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1MzAyMTAsImV4cCI6MjEwMjEwNjIxMH0.v4PkR9iH0uQFrG-ZqD3TdUB5BDAsNn7XHWJgxTxCAVM';
          const sbResponse = await fetch('https://ozmvemetjpohyirfqyji.supabase.co/rest/v1/partner_with_us', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': anonJwt,
              'Authorization': `Bearer ${anonJwt}`,
              'Prefer': 'return=representation'
            },
            body: JSON.stringify([leadRecord])
          });

          if (sbResponse.ok) {
            const sbData = await sbResponse.json();
            console.log('[SUPABASE ANON SUCCESS] Saved to plot_inquiry_leads:', sbData);
            supabaseSaved = true;
          }
        } catch (sbErr) {
          console.warn('[SUPABASE ANON EXCEPTION]', sbErr);
        }
      }

      // Populate Submitted Inquiry Summary Details
      const setSummary = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val || 'Not specified';
      };

      setSummary('summaryName', leadRecord.full_name);
      setSummary('summaryPhone', leadRecord.phone_number);
      setSummary('summaryEmail', leadRecord.email);
      setSummary('summaryPurpose', leadRecord.plot_purpose);
      setSummary('summaryBudget', leadRecord.target_budget);
      setSummary('summaryLocation', leadRecord.target_location);
      setSummary('summaryPlotSize', leadRecord.preferred_plot_size_sqft ? `${leadRecord.preferred_plot_size_sqft} sqft` : '2400 sqft');
      setSummary('summaryOrientation', leadRecord.orientation);
      setSummary('summaryVisitDate', leadRecord.site_visit_date || 'Flexible / To be confirmed');
      setSummary('summaryNotes', leadRecord.specific_requirements || 'None');

      formView.style.display = 'none';
      thankView.style.display = 'block';

      const btnDoneClose = document.getElementById('btnDoneClose');
      if (btnDoneClose) {
        btnDoneClose.onclick = closePopup;
      }
    });
  }

  // Timeline Fill
  ScrollTrigger.create({
    trigger: '.timeline-wrap', start: 'top 70%', end: 'bottom 60%', scrub: 1,
    onUpdate: (self) => {
      const fill = document.getElementById('timelineFill');
      if (fill) fill.style.width = (self.progress * 100) + '%';
      document.querySelectorAll('.tstep').forEach((s, i) => {
        s.classList.toggle('on', self.progress > i / 4 - 0.05);
      });
    }
  });

  // Project Scroll Buttons
  const projScroll = document.getElementById('projScroll');
  const projNext = document.getElementById('projNext');
  const projPrev = document.getElementById('projPrev');
  if (projScroll && projNext && projPrev) {
    projNext.addEventListener('click', () => projScroll.scrollBy({ left: 400, behavior: 'smooth' }));
    projPrev.addEventListener('click', () => projScroll.scrollBy({ left: -400, behavior: 'smooth' }));
  }

  // Testimonial Slider
  const testiTrack = document.getElementById('testiTrack');
  const testiDots = document.getElementById('testiDots');
  const slides = document.querySelectorAll('.testi-slide');
  let testiIndex = 0;

  if (testiTrack && testiDots && slides.length) {
    slides.forEach((_, i) => {
      const d = document.createElement('div');
      d.className = 'tdotb' + (i === 0 ? ' active' : '');
      d.addEventListener('click', () => goTesti(i));
      testiDots.appendChild(d);
    });

    function goTesti(i) {
      testiIndex = i;
      testiTrack.style.transform = `translateX(-${i * 100}%)`;
      document.querySelectorAll('.tdotb').forEach((d, j) => d.classList.toggle('active', j === i));
    }
    setInterval(() => goTesti((testiIndex + 1) % slides.length), 5000);
  }

  // CTA Particles
  const pf = document.getElementById('particleField');
  if (pf) {
    for (let i = 0; i < 40; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.top = Math.random() * 100 + '%';
      pf.appendChild(p);
      gsap.to(p, { y: '-=40', opacity: 0, duration: 3 + Math.random() * 3, repeat: -1, delay: Math.random() * 3, ease: 'sine.inOut' });
    }
  }
});

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  let currentScanData = null;
  let activeBudget = 10000;
  let activeFilter = 'all';

  const originSelect = document.getElementById('originSelect');
  const scanBtn = document.getElementById('scanBtn');
  const emailInput = document.getElementById('emailInput');
  const testEmailBtn = document.getElementById('testEmailBtn');
  const emailStatus = document.getElementById('emailStatus');
  const flightsGrid = document.getElementById('flightsGrid');

  const totalDestCount = document.getElementById('totalDestCount');
  const deals10kCount = document.getElementById('deals10kCount');
  const deals15kCount = document.getElementById('deals15kCount');

  // Load saved email from localStorage
  const savedEmail = localStorage.getItem('flight_alert_email');
  if (savedEmail) {
    emailInput.value = savedEmail;
  }

  // Budget selector logic
  const budgetBtns = document.querySelectorAll('.budget-btn');
  budgetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      budgetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeBudget = parseInt(btn.dataset.budget, 10);
      renderFlights();
    });
  });

  // Filter tab logic
  const filterTabs = document.querySelectorAll('.filter-tab');
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeFilter = tab.dataset.filter;
      renderFlights();
    });
  });

  // Scan flight prices
  async function fetchFlightScan() {
    flightsGrid.innerHTML = `
      <div class="loading-spinner">
        <i data-lucide="loader-2" class="spin"></i> Fetching live round-trip flight prices for visa-free countries...
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();

    const origin = originSelect.value;

    try {
      const response = await fetch(`/api/check-flights?origin=${origin}&maxPrice=25000`);
      const json = await response.json();

      if (json.success && json.data) {
        currentScanData = json.data;
        updateStats();
        renderFlights();
      } else {
        flightsGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #f87171;">Failed to load flight data: ${json.error}</div>`;
      }
    } catch (err) {
      console.error('Scan error:', err);
      flightsGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #f87171;">Error connecting to scanner server. Please try again.</div>`;
    }
  }

  function updateStats() {
    if (!currentScanData) return;
    totalDestCount.textContent = currentScanData.totalDestinationsScanned;
    deals10kCount.textContent = currentScanData.dealsCountUnder10k;
    deals15kCount.textContent = currentScanData.dealsCountUnder15k;
  }

  function renderFlights() {
    if (!currentScanData || !currentScanData.allDestinations) return;

    let list = [...currentScanData.allDestinations];

    // Filter by budget
    if (activeBudget <= 15000) {
      list = list.filter(item => item.roundTripPriceINR <= activeBudget);
    }

    // Filter tabs
    if (activeFilter === '10k') {
      list = list.filter(item => item.roundTripPriceINR <= 10000);
    } else if (activeFilter === '15k') {
      list = list.filter(item => item.roundTripPriceINR > 10000 && item.roundTripPriceINR <= 15000);
    }

    if (list.length === 0) {
      flightsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 50px; color: #94a3b8;">
          <div style="font-size: 32px; margin-bottom: 8px;">✈️</div>
          <h3>No flights found under ₹${activeBudget.toLocaleString('en-IN')}</h3>
          <p style="font-size: 13px; margin-top: 4px;">Try selecting "All Deals" or changing your origin city above.</p>
        </div>
      `;
      return;
    }

    flightsGrid.innerHTML = list.map(item => {
      const is10k = item.roundTripPriceINR <= 10000;
      const is15k = item.roundTripPriceINR <= 15000;

      let badgeHtml = '';
      if (is10k) {
        badgeHtml = `<span class="badge badge-10k">🔥 UNDER ₹10,000</span>`;
      } else if (is15k) {
        badgeHtml = `<span class="badge badge-15k">⚡ UNDER ₹15,000</span>`;
      }

      return `
        <div class="flight-card ${is10k ? 'is-super-deal' : ''}">
          <div>
            <div class="card-top">
              <div class="country-info">
                <span class="country-flag">${item.flag}</span>
                <div>
                  <div class="country-name">${item.country}</div>
                  <div class="city-code">${item.city} (${item.code})</div>
                </div>
              </div>
              <div class="price-tag">
                <div class="price-val ${is10k ? 'super-low' : ''}">₹${item.roundTripPriceINR.toLocaleString('en-IN')}</div>
                <div class="price-sub">Round Trip</div>
              </div>
            </div>

            ${badgeHtml}

            <div class="card-details">
              <div class="detail-row">
                <span class="detail-label">Visa Policy:</span>
                <strong style="color: #f8fafc;">${item.visaType}</strong>
              </div>
              <div class="detail-row">
                <span class="detail-label">Allowed Stay:</span>
                <span>${item.allowedStay}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Best Season:</span>
                <span>${item.bestMonths}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Travel Dates:</span>
                <span>${item.departureDate} &rarr; ${item.returnDate}</span>
              </div>
            </div>
          </div>

          <div class="card-actions">
            <a href="${item.bookingLinks.googleFlightsUrl}" target="_blank" class="btn-book btn-gf">
              ✈️ Google Flights
            </a>
            <a href="${item.bookingLinks.skyscannerUrl}" target="_blank" class="btn-book btn-sky">
              🔍 Skyscanner
            </a>
          </div>
        </div>
      `;
    }).join('');
  }

  // Handle Send Test Email
  testEmailBtn.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    if (!email) {
      emailStatus.className = 'email-status-msg error';
      emailStatus.textContent = '⚠️ Please enter a valid email address first.';
      return;
    }

    localStorage.setItem('flight_alert_email', email);

    testEmailBtn.disabled = true;
    testEmailBtn.innerHTML = `<i data-lucide="loader-2" class="spin"></i> Sending Alert Email...`;
    if (window.lucide) window.lucide.createIcons();

    emailStatus.style.display = 'none';

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          origin: originSelect.value,
          maxPrice: activeBudget
        })
      });

      const result = await response.json();

      if (result.success) {
        emailStatus.className = 'email-status-msg success';
        emailStatus.textContent = `✅ Flight Alert Email Sent to ${email}! (${result.provider})`;
      } else {
        emailStatus.className = 'email-status-msg error';
        emailStatus.textContent = `❌ ${result.error || 'Failed to send email.'}`;
      }
    } catch (err) {
      emailStatus.className = 'email-status-msg error';
      emailStatus.textContent = `❌ Network error sending test email.`;
    } finally {
      testEmailBtn.disabled = false;
      testEmailBtn.innerHTML = `<i data-lucide="send"></i> Send Test Email Alert`;
      if (window.lucide) window.lucide.createIcons();
    }
  });

  // Event Listeners
  scanBtn.addEventListener('click', fetchFlightScan);
  originSelect.addEventListener('change', fetchFlightScan);

  // Initial scan on load
  fetchFlightScan();
});

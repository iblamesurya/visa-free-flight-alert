const { Resend } = require('resend');
const nodemailer = require('nodemailer');

/**
 * Generate responsive HTML email for flight deal alerts
 */
function buildFlightAlertEmailHtml({ deals, origin, maxPriceThreshold, scanTime }) {
  const dealsUnder10k = deals.filter(d => d.roundTripPriceINR <= 10000);
  const dealsUnder15k = deals.filter(d => d.roundTripPriceINR > 10000 && d.roundTripPriceINR <= 15000);

  const formattedScanDate = new Date(scanTime).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const dealCardsHtml = deals.map(deal => {
    const isSuperCheap = deal.roundTripPriceINR <= 10000;
    const badgeColor = isSuperCheap ? '#10B981' : '#3B82F6';
    const badgeText = isSuperCheap ? '🔥 UNDER ₹10K' : '⚡ UNDER ₹15K';

    return `
    <div style="background-color: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 20px; margin-bottom: 16px; font-family: 'Segoe UI', Arial, sans-serif;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
        <div>
          <span style="font-size: 28px; margin-right: 8px;">${deal.flag}</span>
          <strong style="font-size: 20px; color: #f8fafc;">${deal.country} (${deal.city})</strong>
          <div style="color: #94a3b8; font-size: 13px; margin-top: 4px;">
            📍 Airport: ${deal.airportName} | 📜 ${deal.visaType}
          </div>
        </div>
        <div style="text-align: right;">
          <span style="background-color: ${badgeColor}; color: #ffffff; font-weight: bold; font-size: 11px; padding: 4px 10px; border-radius: 20px; display: inline-block;">
            ${badgeText}
          </span>
          <div style="font-size: 24px; font-weight: 800; color: #34d399; margin-top: 6px;">
            ₹${deal.roundTripPriceINR.toLocaleString('en-IN')}
          </div>
          <div style="font-size: 11px; color: #94a3b8;">Round Trip</div>
        </div>
      </div>

      <div style="background: #0f172a; border-radius: 8px; padding: 12px; margin: 12px 0; color: #cbd5e1; font-size: 13px;">
        📅 <strong>Travel Dates:</strong> ${deal.departureDate} &rarr; ${deal.returnDate} (7 Days)<br>
        💡 <strong>Visa Details:</strong> ${deal.notes}
      </div>

      <div style="display: flex; gap: 10px; margin-top: 14px;">
        <a href="${deal.bookingLinks.googleFlightsUrl}" target="_blank" style="background-color: #3b82f6; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 13px; padding: 10px 18px; border-radius: 6px; display: inline-block;">
          ✈️ Book on Google Flights
        </a>
        <a href="${deal.bookingLinks.skyscannerUrl}" target="_blank" style="background-color: #0284c7; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 13px; padding: 10px 18px; border-radius: 6px; display: inline-block;">
          🔍 Check Skyscanner
        </a>
      </div>
    </div>
    `;
  }).join('');

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visa-Free Flight Price Alert</title>
  </head>
  <body style="background-color: #0f172a; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px;">
    <div style="max-width: 640px; margin: 0 auto; background-color: #0b1329; border: 1px solid #1e293b; border-radius: 16px; padding: 32px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
      
      <!-- Header -->
      <div style="text-align: center; border-bottom: 1px solid #1e293b; padding-bottom: 24px; margin-bottom: 24px;">
        <div style="font-size: 42px; margin-bottom: 8px;">✈️🌴</div>
        <h1 style="font-size: 24px; font-weight: 800; color: #f8fafc; margin: 0 0 8px 0; background: linear-gradient(90deg, #38bdf8, #34d399); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
          Visa-Free Flight Deals Alert
        </h1>
        <p style="color: #94a3b8; font-size: 14px; margin: 0;">
          Origin: <strong>${origin}</strong> | Target: <strong>Under ₹${maxPriceThreshold.toLocaleString('en-IN')} Round-Trip</strong>
        </p>
      </div>

      <!-- Stats Summary Banner -->
      <div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(16, 185, 129, 0.2)); border: 1px solid #3b82f6; border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: center;">
        <div style="font-size: 16px; font-weight: 700; color: #60a5fa;">
          🎉 Found ${deals.length} Visa-Free Flight Deals!
        </div>
        <div style="font-size: 13px; color: #cbd5e1; margin-top: 4px;">
          ${dealsUnder10k.length} flights under <strong>₹10,000</strong> &bull; ${dealsUnder15k.length} flights under <strong>₹15,000</strong>
        </div>
      </div>

      <!-- Flight Deals Cards -->
      <div>
        ${dealCardsHtml}
      </div>

      <!-- Footer -->
      <div style="border-top: 1px solid #1e293b; padding-top: 20px; margin-top: 32px; text-align: center; font-size: 12px; color: #64748b;">
        <p style="margin: 0 0 6px 0;">Automated alert triggered by your Vercel Flight Tracker Cron Engine.</p>
        <p style="margin: 0;">Scanned on ${formattedScanDate} | Indian Passport Holder Visa Rules applied.</p>
      </div>
    </div>
  </body>
  </html>
  `;
}

/**
 * Send flight alert email via Resend or Nodemailer
 */
async function sendFlightAlertEmail({ recipientEmail, deals, origin, maxPriceThreshold, scanTime }) {
  if (!recipientEmail) {
    throw new Error('Recipient email is required.');
  }

  const htmlContent = buildFlightAlertEmailHtml({ deals, origin, maxPriceThreshold, scanTime });
  const subject = `✈️ Alert: ${deals.length} Visa-Free Flights Under ₹${maxPriceThreshold.toLocaleString('en-IN')} Found! (${origin})`;

  // 1. Try Resend API if API Key is set
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const data = await resend.emails.send({
      from: 'FlightAlerts <onboarding@resend.dev>',
      to: recipientEmail,
      subject: subject,
      html: htmlContent
    });
    return { provider: 'Resend', result: data };
  }

  // 2. Try Nodemailer SMTP if SMTP host is configured
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const info = await transporter.sendMail({
      from: `"Visa-Free Flight Alert" <${process.env.SMTP_USER}>`,
      to: recipientEmail,
      subject: subject,
      html: htmlContent
    });

    return { provider: 'Nodemailer (SMTP)', result: info };
  }

  // 3. Fallback simulated mode (when no API key configured yet)
  console.log(`[SIMULATED EMAIL SENT] To: ${recipientEmail} | Subject: ${subject}`);
  return {
    provider: 'Simulated (Log Mode)',
    message: 'Email content generated successfully. Configure RESEND_API_KEY or SMTP parameters in Vercel Environment Variables to send actual emails.',
    subject,
    dealsCount: deals.length
  };
}

module.exports = {
  buildFlightAlertEmailHtml,
  sendFlightAlertEmail
};

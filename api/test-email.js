const { scanVisaFreeFlights } = require('../lib/flightScanner');
const { sendFlightAlertEmail } = require('../lib/email');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const { email, origin = 'DEL', maxPrice = 15000 } = req.body || {};

    if (!email) {
      return res.status(400).json({ success: false, error: 'Please enter a target email address.' });
    }

    const scanResults = await scanVisaFreeFlights(origin, parseInt(maxPrice, 10));
    
    // Select top deals for test email (or sample deals if threshold is low)
    const deals = scanResults.dealsUnderThreshold.length > 0 
      ? scanResults.dealsUnderThreshold 
      : scanResults.allDestinations.slice(0, 3);

    const emailResult = await sendFlightAlertEmail({
      recipientEmail: email,
      deals,
      origin,
      maxPriceThreshold: parseInt(maxPrice, 10),
      scanTime: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      message: `Test flight alert email sent to ${email}!`,
      provider: emailResult.provider,
      dealsCount: deals.length,
      emailResult
    });
  } catch (error) {
    console.error('Error in test-email handler:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to send test email'
    });
  }
};

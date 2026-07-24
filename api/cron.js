const { scanVisaFreeFlights } = require('../lib/flightScanner');
const { sendFlightAlertEmail } = require('../lib/email');

module.exports = async function handler(req, res) {
  // Verify Vercel Cron authorization if CRON_SECRET is set
  const authHeader = req.headers['authorization'];
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.warn('Unauthorized cron invocation attempt');
  }

  try {
    const origin = process.env.DEFAULT_ORIGIN || 'DEL';
    const maxPrice = parseInt(process.env.DEFAULT_MAX_PRICE || '15000', 10);
    const recipientEmail = process.env.RECIPIENT_EMAIL;

    console.log(`[VERCEL CRON RUNNING] Origin: ${origin}, Max Price: ${maxPrice}`);

    const scanResults = await scanVisaFreeFlights(origin, maxPrice);

    let emailSent = false;
    let emailResult = null;

    if (recipientEmail && scanResults.dealsUnderThreshold.length > 0) {
      emailResult = await sendFlightAlertEmail({
        recipientEmail,
        deals: scanResults.dealsUnderThreshold,
        origin,
        maxPriceThreshold: maxPrice,
        scanTime: scanResults.scanTime
      });
      emailSent = true;
    }

    return res.status(200).json({
      success: true,
      message: `Cron executed. Scanned ${scanResults.totalDestinationsScanned} destinations. Found ${scanResults.dealsUnderThreshold.length} deals under ₹${maxPrice}.`,
      dealsFound: scanResults.dealsUnderThreshold.length,
      emailSent,
      emailResult
    });
  } catch (error) {
    console.error('Error executing Vercel Cron:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

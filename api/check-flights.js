const { scanVisaFreeFlights } = require('../lib/flightScanner');
const { sendFlightAlertEmail } = require('../lib/email');

module.exports = async function handler(req, res) {
  try {
    const origin = req.query?.origin || req.body?.origin || process.env.DEFAULT_ORIGIN || 'DEL';
    const maxPrice = parseInt(req.query?.maxPrice || req.body?.maxPrice || process.env.DEFAULT_MAX_PRICE || '15000', 10);
    const sendEmail = req.query?.sendEmail === 'true' || req.body?.sendEmail === true;
    const recipient = req.query?.email || req.body?.email || process.env.RECIPIENT_EMAIL;

    // Run flight scan
    const scanResults = await scanVisaFreeFlights(origin, maxPrice);

    let emailResult = null;

    if (sendEmail && recipient && scanResults.dealsUnderThreshold.length > 0) {
      emailResult = await sendFlightAlertEmail({
        recipientEmail: recipient,
        deals: scanResults.dealsUnderThreshold,
        origin: scanResults.origin,
        maxPriceThreshold: scanResults.maxPriceThreshold,
        scanTime: scanResults.scanTime
      });
    }

    return res.status(200).json({
      success: true,
      data: scanResults,
      emailSent: !!emailResult,
      emailResult
    });
  } catch (error) {
    console.error('Error in check-flights handler:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal Server Error'
    });
  }
};

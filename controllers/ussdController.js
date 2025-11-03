const { getSession } = require('../services/sessionService');
const { handleMenu } = require('../services/menuService');
const logger = require('../utils/logger');

exports.handleUssd = async (req, res) => {
  const body = req.body || {};
  let { sessionId, serviceCode, phoneNumber, input } = body;
  if (typeof input === 'undefined' || input === null) input = '';

  // Redact sensitive info for logging
  const sensitiveInputs = ['PIN', 'CODE', 'activation']; 
  const safeInput = input && input.match(/^\d{4,6}$/) ? '***' : input; // redact PINs and codes only in logs
  logger.info(`[Incoming] sessionId=${sessionId} phone=${phoneNumber} input=${safeInput}`);

  try {
    const session = await getSession(sessionId, phoneNumber);
    if (!session) return res.send('END Session expired. Please start again.');
    const response = await handleMenu(sessionId, input);

    // Log the response safely (truncate or redact long data if necessary)
    const truncatedResponse = response.length > 500 ? response.slice(0, 500) + '...' : response;
    logger.info(`[Response] sessionId=${session.sessionId} response="${truncatedResponse}"`);

    res.set('Content-Type', 'text/plain');
    res.send(response);
  } catch (err) {
    logger.error(`[Error] sessionId=${sessionId} ${err.stack || err.message}`);
    res.status(500).send('Internal server error');
  }
};

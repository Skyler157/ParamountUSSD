const { getSession } = require('../services/sessionService');
const { handleMenu } = require('../services/menuService');

exports.handleUssd = async (req, res) => {
  const body = req.body || {};
  let { sessionId, serviceCode, phoneNumber, input } = body;

  if (typeof input === 'undefined' || input === null) input = '';

  // Get or create session
  const session = getSession(sessionId, phoneNumber);

  // Call menu handler
  const response = await handleMenu(session.sessionId, input);

  res.set('Content-Type', 'text/plain');
  res.send(response);
};

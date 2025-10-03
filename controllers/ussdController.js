const { getSession } = require('../services/sessionService');
const { handleMenu } = require('../services/menuService');

exports.handleUssd = async (req, res) => {

  const body = req.body || {};
  let { sessionId, serviceCode, phoneNumber, text } = body;


  if (typeof text === 'undefined' || text === null) text = '';


  const session = getSession(sessionId, phoneNumber);


  const response = await handleMenu(session.sessionId, text);

  res.set('Content-Type', 'text/plain');
  res.send(response);
};

const sessions = {};
const SESSION_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

function getSession(sessionId, phoneNumber) {
  if (!sessions[sessionId]) {
    sessions[sessionId] = {
      sessionId,
      phoneNumber,
      loggedIn: false,
      username: null,
      accountNumber: null,
      step: 0,
      inputs: [],
      logs: [],
      lastActivity: Date.now()
    };
  } else {
    // Reset session if expired
    if (Date.now() - sessions[sessionId].lastActivity > SESSION_TIMEOUT_MS) {
      sessions[sessionId] = {
        sessionId,
        phoneNumber,
        loggedIn: false,
        username: null,
        accountNumber: null,
        step: 0,
        inputs: [],
        logs: [],
        lastActivity: Date.now()
      };
    }
  }
  sessions[sessionId].lastActivity = Date.now();
  return sessions[sessionId];
}

function logStep(sessionId, message) {
  const timestamp = new Date().toISOString();
  if (!sessions[sessionId]) getSession(sessionId);
  sessions[sessionId].logs.push(`[${timestamp}] ${message}`);
  console.log(`[${timestamp}] [Session ${sessionId}] ${message}`);
}

function getLogs(sessionId) {
  return sessions[sessionId]?.logs || [];
}

function setSessionData(sessionId, data) {
  if (!sessions[sessionId]) return;
  Object.assign(sessions[sessionId], data);
}

function getSessionData(sessionId) {
  return sessions[sessionId];
}

module.exports = { getSession, getSessionData, setSessionData, logStep, getLogs };
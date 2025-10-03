// sessionService.js

const sessions = {}; // in-memory store, keyed by sessionId

// Get or create session
function getSession(sessionId, phoneNumber) {
  if (!sessions[sessionId]) {
    sessions[sessionId] = { sessionId, phoneNumber, loggedIn: false, username: null, inputs: [] };
  }
  return sessions[sessionId];
}

// Get session data only
function getSessionData(sessionId) {
  return sessions[sessionId] || null;
}

// Update session data
function setSessionData(sessionId, data) {
  if (!sessions[sessionId]) sessions[sessionId] = {};
  sessions[sessionId] = { ...sessions[sessionId], ...data };
}

// Clear session
function clearSession(sessionId) {
  delete sessions[sessionId];
}

// Optional: log each step
function logStep(sessionId, message) {
  console.log(`[Session ${sessionId}] ${message}`);
}

module.exports = {
  getSession,
  getSessionData,
  setSessionData,
  clearSession,
  logStep
};

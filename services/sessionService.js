const fs = require("fs");
const path = require("path");
const logger = require('../utils/logger');

const SESSION_FILE = path.join(__dirname, "..", "sessions.json");
const SESSION_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

let sessions = {};
try {
  if (fs.existsSync(SESSION_FILE)) {
    const data = fs.readFileSync(SESSION_FILE, "utf8");
    sessions = JSON.parse(data);
  }
} catch (err) {
  logger.error("Failed to load sessions.json: " + err.message);
}

function saveSessions() {
  try {
    fs.writeFileSync(SESSION_FILE, JSON.stringify(sessions, null, 2), "utf8");
  } catch (err) {
    logger.error("Failed to save sessions: " + err.message);
  }
}

function getReadableTimestamp() {
  const now = new Date();
  return `${now.toISOString().split("T")[0]} ${now.toTimeString().split(" ")[0]}`;
}

function getSession(sessionId, phoneNumber) {
  const now = Date.now();

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
      lastActivity: now
    };
    logger.info(`[Session Created] sessionId=${sessionId} phone=${phoneNumber}`);
  } else if (now - sessions[sessionId].lastActivity > SESSION_TIMEOUT_MS) {
    sessions[sessionId] = {
      sessionId,
      phoneNumber,
      loggedIn: false,
      username: null,
      accountNumber: null,
      step: 0,
      inputs: [],
      logs: [],
      lastActivity: now
    };
    logger.info(`[Session Reset] sessionId=${sessionId}`);
  }

  sessions[sessionId].lastActivity = now;
  saveSessions();
  return sessions[sessionId];
}

function logStep(sessionId, message, redactInput = false) {
  const timestamp = getReadableTimestamp();
  if (!sessions[sessionId]) getSession(sessionId);
  const safeMessage = redactInput ? message.replace(/([0-9]{4,})/g, '***') : message; // Redact PINs, codes
  const logEntry = `[${timestamp}] ${safeMessage}`;
  sessions[sessionId].logs.push(logEntry);
  logger.info(`[Session ${sessionId}] ${safeMessage}`);
  saveSessions();
}

function getLogs(sessionId) {
  return sessions[sessionId]?.logs || [];
}

function setSessionData(sessionId, data) {
  if (!sessions[sessionId]) return;
  Object.assign(sessions[sessionId], data);
  saveSessions();
}

function getSessionData(sessionId) {
  return sessions[sessionId];
}

module.exports = {
  getSession,
  getSessionData,
  setSessionData,
  logStep,
  getLogs
};

const fs = require("fs");
const path = require("path");

const SESSION_FILE = path.join(__dirname, "..", "sessions.json");
const SESSION_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

// Load sessions from file or initialize empty object
let sessions = {};
try {
  if (fs.existsSync(SESSION_FILE)) {
    const data = fs.readFileSync(SESSION_FILE, "utf8");
    sessions = JSON.parse(data);
  }
} catch (err) {
  console.error("Failed to load sessions.json:", err);
  sessions = {};
}

// Utility: Save sessions to file
function saveSessions() {
  try {
    fs.writeFileSync(SESSION_FILE, JSON.stringify(sessions, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to save sessions:", err);
  }
}

// Utility: human-readable timestamp
function getReadableTimestamp() {
  const now = new Date();
  const date = now.toISOString().split("T")[0];
  const time = now.toTimeString().split(" ")[0];
  return `${date} ${time}`;
}

// Initialize or refresh session
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
  } else {
    // Reset if expired
    if (now - sessions[sessionId].lastActivity > SESSION_TIMEOUT_MS) {
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
    }
  }

  sessions[sessionId].lastActivity = now;
  saveSessions();
  return sessions[sessionId];
}

function logStep(sessionId, message) {
  const timestamp = getReadableTimestamp();
  if (!sessions[sessionId]) getSession(sessionId);
  const logEntry = `[${timestamp}] ${message}`;
  sessions[sessionId].logs.push(logEntry);
  console.log(`[Session ${sessionId}] ${logEntry}`);
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

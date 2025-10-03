const express = require('express');
const router = express.Router();
const { handleUssd } = require('../controllers/ussdController');
const { getLogs } = require('../services/sessionService');

router.post('/', handleUssd);

// Optional: view logs
router.get('/logs/:sessionId', (req, res) => {
  const logs = getLogs(req.params.sessionId);
  res.json({ sessionId: req.params.sessionId, logs });
});

module.exports = router;

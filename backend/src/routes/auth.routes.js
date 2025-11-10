const express = require('express');
const router = express.Router();

// Route de login (placeholder)
router.post('/login', (req, res) => {
  res.json({ message: 'Auth route - À implémenter' });
});

// Route de register (placeholder)
router.post('/register', (req, res) => {
  res.json({ message: 'Register route - À implémenter' });
});

module.exports = router;

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Flightcases route - À implémenter' });
});

module.exports = router;

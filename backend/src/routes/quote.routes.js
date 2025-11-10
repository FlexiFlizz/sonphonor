const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Quotes route - À implémenter' });
});

module.exports = router;

const express = require('express');
const { authenticate, requireMember } = require('../middleware/auth.middleware');

const router = express.Router();

// Toutes les routes nécessitent l'authentification et le rôle membre
router.use(authenticate);
router.use(requireMember);

// Placeholder - À implémenter selon les besoins
router.get('/', (req, res) => {
  res.json({ message: 'FlightCases route - À implémenter' });
});

module.exports = router;

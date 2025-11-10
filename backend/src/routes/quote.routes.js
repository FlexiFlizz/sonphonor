const express = require('express');
const { body } = require('express-validator');
const quoteController = require('../controllers/quote.controller');
const { authenticate, requireMember } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');

const router = express.Router();

// Toutes les routes nécessitent l'authentification
router.use(authenticate);

// Routes publiques (tous les utilisateurs authentifiés)
router.get('/', quoteController.getAllQuotes);
router.get('/stats', quoteController.getQuoteStats);
router.get('/:id', quoteController.getQuoteById);

// Routes réservées aux membres et admins
router.post('/',
  requireMember,
  [
    body('clientName').notEmpty().withMessage('Le nom du client est requis'),
    body('clientEmail').isEmail().withMessage('Email du client invalide'),
    body('clientPhone').notEmpty().withMessage('Le téléphone du client est requis'),
    body('eventName').notEmpty().withMessage('Le nom de l\'événement est requis'),
    body('eventDate').isISO8601().withMessage('Date de l\'événement invalide'),
    body('validUntil').isISO8601().withMessage('Date de validité invalide'),
    body('items').isArray({ min: 1 }).withMessage('Au moins un article est requis'),
    validate
  ],
  quoteController.createQuote
);

router.put('/:id',
  requireMember,
  quoteController.updateQuote
);

router.patch('/:id/status',
  requireMember,
  [
    body('status').isIn(['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED']).withMessage('Statut invalide'),
    validate
  ],
  quoteController.updateQuoteStatus
);

router.delete('/:id',
  requireMember,
  quoteController.deleteQuote
);

module.exports = router;

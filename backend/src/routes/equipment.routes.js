const express = require('express');
const { body } = require('express-validator');
const equipmentController = require('../controllers/equipment.controller');
const { authenticate, requireMember } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');

const router = express.Router();

// Toutes les routes nécessitent l'authentification
router.use(authenticate);

// Routes publiques (tous les utilisateurs authentifiés)
router.get('/', equipmentController.getAllEquipment);
router.get('/stats', equipmentController.getStockStats);
router.get('/:id', equipmentController.getEquipmentById);

// Routes réservées aux membres et admins
router.post('/',
  requireMember,
  [
    body('name').notEmpty().withMessage('Le nom est requis'),
    body('categoryId').notEmpty().withMessage('La catégorie est requise'),
    body('brand').notEmpty().withMessage('La marque est requise'),
    body('model').notEmpty().withMessage('Le modèle est requis'),
    body('quantity').isInt({ min: 0 }).withMessage('La quantité doit être un nombre positif'),
    body('dailyRateHT').isFloat({ min: 0 }).withMessage('Le tarif journalier doit être un nombre positif'),
    validate
  ],
  equipmentController.createEquipment
);

router.put('/:id',
  requireMember,
  equipmentController.updateEquipment
);

router.delete('/:id',
  requireMember,
  equipmentController.deleteEquipment
);

// Signaler un dommage
router.post('/:equipmentId/damage',
  [
    body('description').notEmpty().withMessage('La description est requise'),
    body('incidentDate').isISO8601().withMessage('Date invalide'),
    body('incidentLocation').notEmpty().withMessage('Le lieu est requis'),
    validate
  ],
  equipmentController.reportDamage
);

module.exports = router;

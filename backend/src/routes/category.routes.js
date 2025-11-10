const express = require('express');
const { body } = require('express-validator');
const categoryController = require('../controllers/category.controller');
const { authenticate, requireMember } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');

const router = express.Router();

// Toutes les routes nécessitent l'authentification
router.use(authenticate);

// Routes publiques (tous les utilisateurs authentifiés)
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

// Routes réservées aux membres et admins
router.post('/',
  requireMember,
  [
    body('name').notEmpty().withMessage('Le nom est requis'),
    validate
  ],
  categoryController.createCategory
);

router.put('/:id',
  requireMember,
  [
    body('name').notEmpty().withMessage('Le nom est requis'),
    validate
  ],
  categoryController.updateCategory
);

router.delete('/:id',
  requireMember,
  categoryController.deleteCategory
);

module.exports = router;

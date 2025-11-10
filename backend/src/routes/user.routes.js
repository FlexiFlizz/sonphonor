const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/user.controller');
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');

const router = express.Router();

// Toutes les routes nécessitent l'authentification
router.use(authenticate);

// Routes pour l'utilisateur actuel
router.put('/profile',
  [
    body('firstName').notEmpty().withMessage('Le prénom est requis'),
    body('lastName').notEmpty().withMessage('Le nom est requis'),
    validate
  ],
  userController.updateProfile
);

// Routes admin uniquement
router.get('/', requireAdmin, userController.getAllUsers);
router.get('/stats', requireAdmin, userController.getUserStats);
router.get('/:id', requireAdmin, userController.getUserById);

router.put('/:id',
  requireAdmin,
  [
    body('firstName').notEmpty().withMessage('Le prénom est requis'),
    body('lastName').notEmpty().withMessage('Le nom est requis'),
    body('email').isEmail().withMessage('Email invalide'),
    body('role').isIn(['ADMIN', 'MEMBER', 'VOLUNTEER']).withMessage('Rôle invalide'),
    body('status').isIn(['ACTIVE', 'INACTIVE']).withMessage('Statut invalide'),
    validate
  ],
  userController.updateUser
);

router.delete('/:id', requireAdmin, userController.deleteUser);

router.post('/:id/reset-password',
  requireAdmin,
  [
    body('newPassword').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
    validate
  ],
  userController.resetUserPassword
);

module.exports = router;

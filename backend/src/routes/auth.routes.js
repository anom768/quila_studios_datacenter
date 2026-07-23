const express = require('express');
const validate = require('../middleware/validate');
const { loginSchema, registerSchema } = require('../validations/auth.validation');
const authController = require('../controllers/auth.controller');
const authGuard = require('../middleware/authGuard');
const roleGuard = require('../middleware/roleGuard');

const router = express.Router();

router.post('/login', validate(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.get('/me', authGuard, authController.me);
router.post(
  '/register',
  authGuard,
  roleGuard('admin'),
  validate(registerSchema),
  authController.register
);

module.exports = router;

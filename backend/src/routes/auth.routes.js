const express = require('express');
const rateLimit = require('express-rate-limit');
const validate = require('../middleware/validate');
const { loginSchema, registerSchema } = require('../validations/auth.validation');
const authController = require('../controllers/auth.controller');
const authGuard = require('../middleware/authGuard');
const roleGuard = require('../middleware/roleGuard');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per `window` (here, per 15 minutes)
  message: { success: false, error: 'Too many login attempts, please try again after 15 minutes' },
});

router.post('/login', loginLimiter, validate(loginSchema), authController.login);
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

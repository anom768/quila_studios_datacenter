const express = require('express');
const validate = require('../middleware/validate');
const { createStaffSchema, updateStaffSchema } = require('../validations/staff.validation');
const staffController = require('../controllers/staff.controller');
const authGuard = require('../middleware/authGuard');
const roleGuard = require('../middleware/roleGuard');
const staffApplication = require('../application/staff.application');
const upload = require('../middleware/upload');

const router = express.Router();

// Middleware to fetch staff and attach to req for upload processing
const attachStaff = async (req, res, next) => {
  try {
    const staff = await staffApplication.getStaffById(req.params.id);
    req.staff = staff;
    next();
  } catch (err) {
    next(err);
  }
};

// Protect all staff routes with authGuard
router.use(authGuard);

router.get('/', staffController.getStaffList);
router.get('/:id', staffController.getStaffById);

// Restrict mutating routes to admin
router.post('/', roleGuard('admin'), validate(createStaffSchema), staffController.createStaff);
router.put('/:id', roleGuard('admin'), validate(updateStaffSchema), staffController.updateStaff);
router.delete('/:id', roleGuard('admin'), staffController.deleteStaff);

// Photo upload route
router.post(
  '/:id/photo',
  roleGuard('admin'),
  attachStaff,
  upload.single('photo'),
  staffController.uploadPhoto
);

module.exports = router;

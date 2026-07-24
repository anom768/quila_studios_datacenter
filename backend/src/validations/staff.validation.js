const Joi = require('joi');

const createStaffSchema = Joi.object({
  fullName: Joi.string().min(3).max(100).required(),
  position: Joi.string().valid('IT Staff', 'Management', 'Comic Mentor', '3D Mentor').required(),
  phoneNumber: Joi.string().required(),
  email: Joi.string().email().required(),
  joinDate: Joi.date().iso().required(),
  exitDate: Joi.date().iso().min(Joi.ref('joinDate')).optional().allow(null),
  status: Joi.string().valid('Active', 'Inactive', 'Resigned').default('Active'),
  employmentType: Joi.string().valid('Permanent', 'Contract', 'Internship').required(),
});

const updateStaffSchema = Joi.object({
  fullName: Joi.string().min(3).max(100).optional(),
  position: Joi.string().valid('IT Staff', 'Management', 'Comic Mentor', '3D Mentor').optional(),
  phoneNumber: Joi.string().optional(),
  email: Joi.string().email().optional(),
  joinDate: Joi.date().iso().optional(),
  exitDate: Joi.date().iso().min(Joi.ref('joinDate')).optional().allow(null),
  status: Joi.string().valid('Active', 'Inactive', 'Resigned').optional(),
  employmentType: Joi.string().valid('Permanent', 'Contract', 'Internship').optional(),
});

module.exports = {
  createStaffSchema,
  updateStaffSchema,
};

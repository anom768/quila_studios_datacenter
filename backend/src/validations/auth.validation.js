const Joi = require('joi');

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

const registerSchema = Joi.object({
  username: Joi.string().min(3).required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid('admin', 'staff').required(),
});

module.exports = {
  loginSchema,
  registerSchema,
};

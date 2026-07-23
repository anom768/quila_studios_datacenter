const Joi = require('joi');

const healthQuerySchema = Joi.object({
  echo: Joi.string().optional(),
});

module.exports = {
  healthQuerySchema,
};

const ValidationError = require('../errors/ValidationError');

/**
 * Reusable Joi validation middleware factory
 * @param {Object} schema - Joi schema object
 * @param {string} [source='body'] - Property of req to validate ('body', 'query', 'params')
 */
const validate = (schema, source = 'body') => (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ');
      return next(new ValidationError(errorMessage));
    }

    req[source] = value;
    return next();
};

module.exports = validate;

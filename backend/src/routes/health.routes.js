const express = require('express');
const validate = require('../middleware/validate');
const { healthQuerySchema } = require('../validations/health.validation');
const { sendSuccess } = require('../utils/response');

const router = express.Router();

router.get('/health', validate(healthQuerySchema, 'query'), (req, res) => {
  const data = {
    status: 'ok',
    timestamp: new Date().toISOString(),
  };

  if (req.query.echo) {
    data.echo = req.query.echo;
  }

  return sendSuccess(res, data);
});

module.exports = router;

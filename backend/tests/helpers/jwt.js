const jwt = require('jsonwebtoken');
const config = require('../../src/config');

function makeExpiredToken(payload) {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '-1s' });
}

function makeTamperedToken(payload) {
  return jwt.sign(payload, 'wrong_secret', { expiresIn: config.jwtExpiresIn });
}

function makeMalformedToken() {
  return 'not.a.jwt';
}

module.exports = {
  makeExpiredToken,
  makeTamperedToken,
  makeMalformedToken,
};

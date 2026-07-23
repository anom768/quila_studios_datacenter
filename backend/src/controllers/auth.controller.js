const ms = require('ms');
const authApplication = require('../application/auth.application');
const config = require('../config');
const { sendSuccess } = require('../utils/response');
const tokenService = require('../services/tokenService');

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    const token = await authApplication.loginUseCase(username, password);

    res.cookie('quila_token', token, {
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: 'strict',
      maxAge: ms(config.jwtExpiresIn), // parse '7d' or '1h' to ms
    });

    // Decoding token to send user info back
    const payload = tokenService.verifyToken(token);

    sendSuccess(res, {
      id: payload.sub,
      username: payload.username,
      role: payload.role,
    });
  } catch (error) {
    next(error);
  }
};

const register = async (req, res, next) => {
  try {
    const user = await authApplication.registerUseCase(req.body);
    sendSuccess(res, user, undefined, 201);
  } catch (error) {
    next(error);
  }
};

const me = (req, res, next) => {
  try {
    sendSuccess(res, {
      id: req.user.sub,
      username: req.user.username,
      role: req.user.role,
    });
  } catch (error) {
    next(error);
  }
};

const logout = (req, res, next) => {
  try {
    res.clearCookie('quila_token');
    sendSuccess(res, { message: 'Logged out' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  register,
  me,
  logout,
};

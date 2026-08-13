const jwt = require('jsonwebtoken');
const env = require('../config/env');

const generateToken = (userId, role) =>
  jwt.sign({ id: userId, role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

module.exports = { generateToken };

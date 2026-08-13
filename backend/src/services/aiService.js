const axios = require('axios');
const env = require('../config/env');
const logger = require('../utils/logger');
const AppError = require('../utils/AppError');

const predictFoodRisk = async (payload) => {
  try {
    const { data } = await axios.post(`${env.aiServiceUrl}/predict`, payload, {
      timeout: 15000,
      headers: { 'Content-Type': 'application/json' },
    });
    return data;
  } catch (error) {
    logger.error('AI service error:', error.response?.data || error.message);
    throw new AppError(
      error.response?.data?.detail?.[0]?.msg || 'AI prediction service unavailable.',
      error.response?.status || 503
    );
  }
};

const checkAIHealth = async () => {
  try {
    const { data } = await axios.get(`${env.aiServiceUrl}/`, { timeout: 5000 });
    return data;
  } catch {
    return null;
  }
};

module.exports = { predictFoodRisk, checkAIHealth };

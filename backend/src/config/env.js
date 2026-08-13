require('dotenv').config();

const env = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/fitscan',
  jwtSecret: process.env.JWT_SECRET || 'fitscan_dev_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  adminEmail: process.env.ADMIN_EMAIL || 'admin@fitscan.com',
  adminPassword: process.env.ADMIN_PASSWORD || 'Admin@123456',
};

module.exports = env;

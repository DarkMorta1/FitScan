const app = require('./app');
const connectDB = require('./config/db');
const env = require('./config/env');
const logger = require('./utils/logger');
const User = require('./models/User');

const seedAdmin = async () => {
  const existing = await User.findOne({ email: env.adminEmail });
  if (!existing) {
    await User.create({
      name: 'Admin',
      email: env.adminEmail,
      password: env.adminPassword,
      role: 'admin',
      onboardingComplete: true,
      profile: {
        age: 30,
        gender: 'Male',
        height: 175,
        weight: 75,
        goal: 'Maintain',
        activityLevel: 'Moderate',
        dietaryPreference: 'Non-Vegetarian',
        medicalConditions: [],
        allergies: [],
      },
    });
    logger.info('Default admin user created.');
  }
};

const start = async () => {
  await connectDB();
  await seedAdmin();

  app.listen(env.port, () => {
    logger.info(`FITSCAN backend running on port ${env.port}`);
  });
};

start();

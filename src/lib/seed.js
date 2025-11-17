import seedUserDB from './seed_user.js';
import seedSRDDB from './seed_srd.js';
import mongoose from 'mongoose';

const seedAll = async () => {
  await seedUserDB();
  await seedSRDDB();
  mongoose.connection.close();
  console.log('All data seeded and connection closed.');
  process.exit();
};

seedAll();
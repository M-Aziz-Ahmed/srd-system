import dbConnect from './db.js';
import SRD from '../models/SRD.js';
import { seedSRDs } from './seedSRDs.js';

const seedSRDDB = async () => {
  await dbConnect();
  await SRD.deleteMany({});
  await SRD.insertMany(seedSRDs);
  console.log('SRD Database seeded!');
};

export default seedSRDDB;
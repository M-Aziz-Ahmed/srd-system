import dbConnect from './db.js';
import User from '../models/User.js';
import { seedUsers } from './seedUsers.js';
import bcrypt from 'bcrypt';

const seedUserDB = async () => {
  await dbConnect();
  await User.deleteMany({});

  const usersWithHashedPasswords = await Promise.all(
    seedUsers.map(async (user) => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      return { ...user, password: hashedPassword };
    })
  );

  await User.insertMany(usersWithHashedPasswords);
  console.log('User Database seeded!');
};

export default seedUserDB;
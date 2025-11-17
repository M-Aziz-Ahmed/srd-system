import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();


const MONGODB_URI = process.env.MONGODB_URI;

async function migrateUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Drop the User collection to remove old schema constraints
    try {
      await mongoose.connection.db.collection('users').drop();
      console.log('Dropped users collection (will be recreated with new schema)');
    } catch (error) {
      if (error.code === 26) {
        console.log('Users collection does not exist yet');
      } else {
        throw error;
      }
    }

    console.log('\n✅ User migration complete!');
    console.log('You can now create users with any role.');
    
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

migrateUsers();

import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function createManualBackup() {
  try {
    console.log('Creating manual backup...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');

    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    const backupData = {};

    console.log(`Found ${collections.length} collections`);

    // Export all collections
    for (const collection of collections) {
      const collectionName = collection.name;
      const data = await mongoose.connection.db.collection(collectionName).find({}).toArray();
      backupData[collectionName] = data;
      console.log(`Exported ${data.length} documents from ${collectionName}`);
    }

    // Create backup directory if it doesn't exist
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Generate backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `manual-backup-${timestamp}`;
    const backupPath = path.join(backupDir, `${backupName}.json`);

    // Create backup data with metadata
    const backupData_with_metadata = {
      metadata: {
        created: new Date().toISOString(),
        version: '1.0',
        type: 'manual',
        collections: Object.keys(backupData),
        totalRecords: Object.values(backupData).reduce((sum, data) => sum + data.length, 0)
      },
      data: backupData
    };

    // Write backup to file
    fs.writeFileSync(backupPath, JSON.stringify(backupData_with_metadata, null, 2));
    
    const stats = fs.statSync(backupPath);
    console.log(`Backup created: ${backupPath} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);

    // Save backup record to database
    const backupRecord = {
      id: backupName,
      name: `${backupName}.json`,
      location: 'local',
      size: stats.size,
      createdAt: new Date(),
      status: 'completed',
      path: backupPath,
      type: 'manual'
    };

    await mongoose.connection.db.collection('backups').insertOne(backupRecord);
    console.log('Backup record saved to database');

    console.log('Manual backup completed successfully!');
    
  } catch (error) {
    console.error('Error creating manual backup:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

// Run the backup
createManualBackup();
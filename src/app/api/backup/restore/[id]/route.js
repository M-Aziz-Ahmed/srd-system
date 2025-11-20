import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
// import AdmZip from 'adm-zip';

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Connect to database
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    // Find backup record
    const backup = await mongoose.connection.db
      .collection('backups')
      .findOne({ id });

    if (!backup) {
      return NextResponse.json({ success: false, message: 'Backup not found' }, { status: 404 });
    }

    // Only support local backups for now
    if (backup.location !== 'local') {
      return NextResponse.json({ 
        success: false, 
        message: 'Remote backup restore not implemented yet' 
      }, { status: 400 });
    }

    const filePath = backup.path;
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ success: false, message: 'Backup file not found' }, { status: 404 });
    }

    // Read JSON backup file
    const backupContent = fs.readFileSync(filePath, 'utf8');
    const backupJson = JSON.parse(backupContent);
    
    let databaseData = null;
    let metadata = null;

    // Handle different backup formats
    if (backupJson.data && backupJson.metadata) {
      // New format with metadata
      databaseData = backupJson.data;
      metadata = backupJson.metadata;
    } else {
      // Old format - direct data
      databaseData = backupJson;
    }

    if (!databaseData) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid backup file - no database data found' 
      }, { status: 400 });
    }

    // Create backup of current data before restore
    const currentBackupName = `pre-restore-${new Date().toISOString().replace(/[:.]/g, '-')}`;
    await createCurrentDataBackup(currentBackupName);

    // Restore collections
    const restoredCollections = [];
    
    for (const [collectionName, data] of Object.entries(databaseData)) {
      try {
        // Skip system collections
        if (collectionName.startsWith('system.')) {
          continue;
        }

        // Clear existing collection
        await mongoose.connection.db.collection(collectionName).deleteMany({});
        
        // Insert backup data
        if (data.length > 0) {
          await mongoose.connection.db.collection(collectionName).insertMany(data);
        }
        
        restoredCollections.push(collectionName);
      } catch (error) {
        console.error(`Error restoring collection ${collectionName}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Backup restored successfully',
      restoredCollections,
      metadata
    });

  } catch (error) {
    console.error('Error restoring backup:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to restore backup',
      error: error.message
    }, { status: 500 });
  }
}

async function createCurrentDataBackup(backupName) {
  try {
    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    const backupData = {};

    // Export all collections
    for (const collection of collections) {
      const collectionName = collection.name;
      const data = await mongoose.connection.db.collection(collectionName).find({}).toArray();
      backupData[collectionName] = data;
    }

    // Create backup directory if it doesn't exist
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Save current data as JSON (simple backup before restore)
    const backupPath = path.join(backupDir, `${backupName}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));

    // Save backup record
    const backupRecord = {
      id: backupName,
      name: `${backupName}.json`,
      location: 'local',
      size: fs.statSync(backupPath).size,
      createdAt: new Date(),
      status: 'completed',
      path: backupPath,
      type: 'pre-restore'
    };

    await mongoose.connection.db.collection('backups').insertOne(backupRecord);
    
  } catch (error) {
    console.error('Error creating pre-restore backup:', error);
  }
}
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
// import archiver from 'archiver';
// import { google } from 'googleapis';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { location = 'local' } = await request.json();
    
    // Connect to database
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    // Create backup directory if it doesn't exist
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Generate backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `backup-${timestamp}`;
    const backupPath = path.join(backupDir, `${backupName}.zip`);

    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    const backupData = {};

    // Export all collections
    for (const collection of collections) {
      const collectionName = collection.name;
      const data = await mongoose.connection.db.collection(collectionName).find({}).toArray();
      backupData[collectionName] = data;
    }

    // Create JSON backup (simplified version)
    const backupData_with_metadata = {
      metadata: {
        created: new Date().toISOString(),
        version: '1.0',
        collections: Object.keys(backupData),
        totalRecords: Object.values(backupData).reduce((sum, data) => sum + data.length, 0)
      },
      data: backupData
    };

    // Write backup to file
    const jsonBackupPath = backupPath.replace('.zip', '.json');
    fs.writeFileSync(jsonBackupPath, JSON.stringify(backupData_with_metadata, null, 2));
    
    const stats = fs.statSync(jsonBackupPath);
    
    let finalLocation = 'local';
    let uploadUrl = null;

    // Upload to Google Drive if requested
    if (location === 'google') {
      try {
        uploadUrl = await uploadToGoogleDrive(jsonBackupPath, backupName);
        finalLocation = 'google';
      } catch (error) {
        console.error('Google Drive upload failed:', error);
        // Keep local backup if Google Drive fails
      }
    }

    // Save backup record to database
    const backupRecord = {
      id: backupName,
      name: `${backupName}.json`,
      location: finalLocation,
      size: stats.size,
      createdAt: new Date(),
      status: 'completed',
      path: finalLocation === 'local' ? jsonBackupPath : uploadUrl
    };

    // Store backup metadata
    await mongoose.connection.db.collection('backups').insertOne(backupRecord);

    return NextResponse.json({
      success: true,
      message: 'Backup created successfully',
      backup: backupRecord
    });

  } catch (error) {
    console.error('Backup creation error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create backup',
      error: error.message
    }, { status: 500 });
  }
}

async function uploadToGoogleDrive(filePath, fileName) {
  // This is a placeholder for Google Drive integration
  // You would need to set up Google Drive API credentials
  // and implement the actual upload logic
  
  try {
    // const auth = new google.auth.GoogleAuth({
    //   keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
    //   scopes: ['https://www.googleapis.com/auth/drive.file'],
    // });
    
    // const drive = google.drive({ version: 'v3', auth });
    
    // const fileMetadata = {
    //   name: `${fileName}.zip`,
    //   parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
    // };
    
    // const media = {
    //   mimeType: 'application/zip',
    //   body: fs.createReadStream(filePath),
    // };
    
    // const response = await drive.files.create({
    //   resource: fileMetadata,
    //   media: media,
    //   fields: 'id',
    // });
    
    // return `https://drive.google.com/file/d/${response.data.id}/view`;
    
    // For now, return a placeholder URL
    return `https://drive.google.com/placeholder/${fileName}`;
  } catch (error) {
    throw new Error(`Google Drive upload failed: ${error.message}`);
  }
}
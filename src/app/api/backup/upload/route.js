import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('backup');
    
    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
    }

    // Connect to database
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    // Create backup directory if it doesn't exist
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `uploaded-backup-${timestamp}.json`;
    const filePath = path.join(backupDir, fileName);

    // Save uploaded file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    fs.writeFileSync(filePath, buffer);

    // Validate backup file
    try {
      const backupContent = fs.readFileSync(filePath, 'utf8');
      const backupJson = JSON.parse(backupContent);
      
      // Basic validation
      if (!backupJson || (typeof backupJson !== 'object')) {
        throw new Error('Invalid backup format');
      }
    } catch (error) {
      // Delete invalid file
      fs.unlinkSync(filePath);
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid backup file format' 
      }, { status: 400 });
    }

    const stats = fs.statSync(filePath);

    // Save backup record to database
    const backupRecord = {
      id: fileName.replace('.json', ''),
      name: fileName,
      location: 'local',
      size: stats.size,
      createdAt: new Date(),
      status: 'completed',
      path: filePath,
      type: 'uploaded'
    };

    await mongoose.connection.db.collection('backups').insertOne(backupRecord);

    return NextResponse.json({
      success: true,
      message: 'Backup uploaded successfully',
      backup: backupRecord
    });

  } catch (error) {
    console.error('Backup upload error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to upload backup',
      error: error.message
    }, { status: 500 });
  }
}
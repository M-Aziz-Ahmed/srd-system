import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'audio');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const uniqueName = `voice-${Date.now()}.webm`;
    const filePath = path.join(uploadsDir, uniqueName);

    // Write file
    fs.writeFileSync(filePath, buffer);

    const url = `/audio/${uniqueName}`;

    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error('Error uploading audio:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

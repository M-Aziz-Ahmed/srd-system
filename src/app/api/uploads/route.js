import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const body = await request.json();
    const { fileName, fileData } = body;

    if (!fileName || !fileData) {
      return NextResponse.json({ success: false, error: 'Missing fileName or fileData' }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // handle data URL or raw base64
    const matches = fileData.match(/^data:(.+);base64,(.+)$/);
    let base64Data = fileData;
    if (matches) {
      base64Data = matches[2];
    }

    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '-');
    const uniqueName = `${Date.now()}-${safeName}`;
    const filePath = path.join(uploadsDir, uniqueName);

    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

    const url = `/uploads/${uniqueName}`;

    return NextResponse.json({ success: true, url });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

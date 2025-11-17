import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // Convert file to base64 data URL (works in serverless environments)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    
    // Create data URL
    const mimeType = file.type || 'audio/webm';
    const dataUrl = `data:${mimeType};base64,${base64}`;

    return NextResponse.json({ 
      success: true, 
      url: dataUrl,
      size: buffer.length,
      mimeType: mimeType
    });
  } catch (error) {
    console.error('Error uploading audio:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

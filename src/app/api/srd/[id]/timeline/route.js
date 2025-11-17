import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SRD from '@/models/SRD';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const resolvedParams = await params;
    const srd = await SRD.findById(resolvedParams.id);
    
    if (!srd) {
      return NextResponse.json({
        success: false,
        error: 'SRD not found'
      }, { status: 404 });
    }
    
    // Combine audit log and comments into timeline
    const timeline = [
      ...srd.audit.map(entry => ({
        type: 'audit',
        timestamp: entry.timestamp,
        action: entry.action,
        department: entry.department,
        author: entry.author,
        details: entry.details
      })),
      ...srd.comments.map(comment => ({
        type: 'comment',
        timestamp: comment.date,
        department: comment.department,
        author: comment.author,
        role: comment.role,
        text: comment.text
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return NextResponse.json({
      success: true,
      data: timeline
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Stage from '@/models/Stage';
import Department from '@/models/Department';

export async function GET() {
  await dbConnect();
  try {
    const stages = await Stage.find({}).populate('departments').sort({ order: 1 });
    return NextResponse.json({ success: true, data: stages });
  } catch (error) {
    console.error('Error fetching stages:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  await dbConnect();
  try {
    const body = await request.json();
    
    // Generate slug from name if not provided
    if (!body.slug) {
      body.slug = body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }

    // Validate departments if provided
    if (body.departments && Array.isArray(body.departments)) {
      const validDepts = await Department.find({ _id: { $in: body.departments } });
      if (validDepts.length !== body.departments.length) {
        return NextResponse.json(
          { success: false, error: 'Some departments are invalid' },
          { status: 400 }
        );
      }
    }

    const newStage = await Stage.create(body);
    const populatedStage = await Stage.findById(newStage._id).populate('departments');
    
    return NextResponse.json({ success: true, data: populatedStage }, { status: 201 });
  } catch (error) {
    console.error('Error creating stage:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

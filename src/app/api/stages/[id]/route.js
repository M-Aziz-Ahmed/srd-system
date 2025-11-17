import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Stage from '@/models/Stage';
import Department from '@/models/Department';

export async function GET(request, { params }) {
  await dbConnect();
  const { id } = await params;
  try {
    const stage = await Stage.findById(id).populate('departments');
    if (!stage) {
      return NextResponse.json({ success: false, error: 'Stage not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: stage });
  } catch (error) {
    console.error('Error fetching stage:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  await dbConnect();
  const { id } = await params;
  try {
    const body = await request.json();
    
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

    const updatedStage = await Stage.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('departments');

    if (!updatedStage) {
      return NextResponse.json({ success: false, error: 'Stage not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedStage });
  } catch (error) {
    console.error('Error updating stage:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  await dbConnect();
  const { id } = await params;
  try {
    // Soft delete by setting isActive to false
    const deletedStage = await Stage.findByIdAndUpdate(
      id,
      { isActive: false, updatedAt: new Date() },
      { new: true }
    );

    if (!deletedStage) {
      return NextResponse.json({ success: false, error: 'Stage not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: deletedStage });
  } catch (error) {
    console.error('Error deleting stage:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

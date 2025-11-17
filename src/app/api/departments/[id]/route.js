import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Department from '@/models/Department';
import Field from '@/models/Field';

export async function GET(request, { params }) {
  const {id} = await params;
  await dbConnect();
  try {
    const department = await Department.findById(id);
    if (!department) {
      return NextResponse.json({ success: false, error: 'Department not found' }, { status: 404 });
    }
    const fields = await Field.find({ department: department.slug });
    return NextResponse.json({ success: true, data: { department, fields } });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  await dbConnect();
  const {id} = await params;
  try {
    const body = await request.json();
    const updatedDepartment = await Department.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!updatedDepartment) {
      return NextResponse.json({ success: false, error: 'Department not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updatedDepartment });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PATCH(request, { params }) {
  await dbConnect();
  const {id} = await params;
  try {
    const body = await request.json();
    const updatedDepartment = await Department.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!updatedDepartment) {
      return NextResponse.json({ success: false, error: 'Department not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updatedDepartment });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  await dbConnect();
  const {id} = await params;
  try {
    const deletedDepartment = await Department.findByIdAndDelete(id);
    if (!deletedDepartment) {
      return NextResponse.json({ success: false, error: 'Department not found' }, { status: 404 });
    }
    // Also delete associated fields
    await Field.deleteMany({ department: deletedDepartment.slug });
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Department from '@/models/Department';

export async function GET() {
  await dbConnect();
  try {
    const departments = await Department.find({});
    return NextResponse.json({ success: true, data: departments });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  await dbConnect();
  try {
    const body = await request.json();
    const newDepartment = await Department.create(body);
    return NextResponse.json({ success: true, data: newDepartment }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

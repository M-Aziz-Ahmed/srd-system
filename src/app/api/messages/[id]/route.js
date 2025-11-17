import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Message from '@/models/Message';
import User from '@/models/User';

// PATCH - Mark message as read
export async function PATCH(request, context) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const params = await context.params;
    const { id } = params;

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const message = await Message.findById(id);
    if (!message) {
      return NextResponse.json({ success: false, error: 'Message not found' }, { status: 404 });
    }

    // Check if already read by this user
    const alreadyRead = message.readBy.some(r => r.user.toString() === user._id.toString());
    
    if (!alreadyRead) {
      message.readBy.push({
        user: user._id,
        readAt: new Date(),
      });
      await message.save();
    }

    return NextResponse.json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE - Delete message
export async function DELETE(request, context) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const params = await context.params;
    const { id } = params;

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const message = await Message.findById(id);
    if (!message) {
      return NextResponse.json({ success: false, error: 'Message not found' }, { status: 404 });
    }

    // Only sender can delete
    if (message.sender.toString() !== user._id.toString()) {
      return NextResponse.json({ success: false, error: 'Unauthorized to delete this message' }, { status: 403 });
    }

    await Message.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

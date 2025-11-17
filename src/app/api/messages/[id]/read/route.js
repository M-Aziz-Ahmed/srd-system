import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Message from '@/models/Message';
import User from '@/models/User';
import pusher from '@/lib/pusher-server';

export async function POST(request, { params }) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { id } = await params;
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Find message
    const message = await Message.findById(id);
    
    if (!message) {
      return NextResponse.json({ success: false, error: 'Message not found' }, { status: 404 });
    }

    // Check if already read by this user
    const alreadyRead = message.readBy?.some(r => r.user.toString() === user._id.toString());
    
    if (!alreadyRead) {
      // Add to readBy array
      message.readBy = message.readBy || [];
      message.readBy.push({
        user: user._id,
        readAt: new Date()
      });
      
      await message.save();

      // Broadcast read receipt via Pusher
      try {
        const sender = await User.findById(message.sender);
        if (sender) {
          await pusher.trigger(`user-${sender.email}`, 'message-read', {
            messageId: message._id,
            readBy: user._id,
            readAt: new Date()
          });
        }
      } catch (pusherError) {
        console.error('Pusher error:', pusherError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking message as read:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

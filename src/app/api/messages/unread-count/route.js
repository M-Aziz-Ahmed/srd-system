import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Message from '@/models/Message';
import User from '@/models/User';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Count unread messages
    const count = await Message.countDocuments({
      $or: [
        { recipient: user._id },
        { department: user.role }
      ],
      sender: { $ne: user._id },
      'readBy.user': { $ne: user._id }
    });

    return NextResponse.json({ success: true, count });
  } catch (error) {
    console.error('Error counting unread messages:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

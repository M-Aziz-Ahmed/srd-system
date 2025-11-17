import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Message from '@/models/Message';
import User from '@/models/User';

// GET - Fetch messages (inbox)
export async function GET(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'direct' or 'department'
    const department = searchParams.get('department');
    const userId = searchParams.get('userId'); // For DM conversations

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    let query = {};

    if (type === 'direct') {
      if (userId) {
        // Get conversation with specific user
        query = {
          type: 'direct',
          $or: [
            { sender: user._id, recipient: userId },
            { sender: userId, recipient: user._id },
          ],
        };
      } else {
        // Get all DM conversations
        query = {
          type: 'direct',
          $or: [{ sender: user._id }, { recipient: user._id }],
        };
      }
    } else if (type === 'department') {
      if (department) {
        // Get messages for specific department
        query = {
          type: 'department',
          department: department,
        };
      } else {
        // Get all department messages for user's department
        query = {
          type: 'department',
          department: user.role,
        };
      }
    } else {
      // Get all messages for user
      query = {
        $or: [
          { sender: user._id },
          { recipient: user._id },
          { department: user.role },
        ],
      };
    }

    const messages = await Message.find(query)
      .populate('sender', 'name email role')
      .populate('recipient', 'name email role')
      .populate('srd', 'refNo title description progress')
      .populate('srdId', 'refNo title description progress')
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST - Send a message
export async function POST(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { type, recipientId, department, subject, content, srdId } = body;

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Validate message type
    if (!['direct', 'department'].includes(type)) {
      return NextResponse.json({ success: false, error: 'Invalid message type' }, { status: 400 });
    }

    // Validate required fields
    if (type === 'direct' && !recipientId) {
      return NextResponse.json({ success: false, error: 'Recipient required for direct messages' }, { status: 400 });
    }

    if (type === 'department' && !department) {
      return NextResponse.json({ success: false, error: 'Department required for department messages' }, { status: 400 });
    }

    if (!content || !content.trim()) {
      return NextResponse.json({ success: false, error: 'Message content is required' }, { status: 400 });
    }

    // Create message
    const messageData = {
      type,
      sender: user._id,
      content: content.trim(),
      subject: subject?.trim(),
    };

    if (type === 'direct') {
      messageData.recipient = recipientId;
    } else {
      messageData.department = department;
    }

    if (srdId) {
      messageData.srd = srdId;
    }

    // Set srd field from srdId for consistency
    if (body.srdId) {
      messageData.srd = body.srdId;
      messageData.srdId = body.srdId;
    }

    const message = await Message.create(messageData);
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email role')
      .populate('recipient', 'name email role')
      .populate('srd', 'refNo title description progress')
      .populate('srdId', 'refNo title description progress');

    // Trigger Pusher event for real-time updates
    try {
      const pusher = (await import('@/lib/pusher-server')).default;
      
      if (type === 'direct') {
        // Send to recipient's channel
        const recipient = await User.findById(recipientId);
        if (recipient) {
          await pusher.trigger(`user-${recipient.email}`, 'new-message', {
            message: populatedMessage,
          });
        }
        
        // Send to sender's channel (for multi-device sync)
        await pusher.trigger(`user-${user.email}`, 'new-message', {
          message: populatedMessage,
        });
      } else {
        // Send to department channel
        await pusher.trigger(`department-${department}`, 'new-message', {
          message: populatedMessage,
        });
      }
    } catch (pusherError) {
      console.error('Pusher error:', pusherError);
    }

    return NextResponse.json({
      success: true,
      data: populatedMessage,
      message: 'Message sent successfully',
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

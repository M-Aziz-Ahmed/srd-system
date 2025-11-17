import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import pusher from '@/lib/pusher-server';
import User from '@/models/User';
import dbConnect from '@/lib/db';

export async function POST(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { to, type, offer, answer, candidate } = body;

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Send WebRTC signaling via Pusher
    const eventData = {
      from: session.user.email,
      type,
    };

    if (offer) eventData.offer = offer;
    if (answer) eventData.answer = answer;
    if (candidate) eventData.candidate = candidate;

    await pusher.trigger(`user-${to}`, type, eventData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('WebRTC signaling error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

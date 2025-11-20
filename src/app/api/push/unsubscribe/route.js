import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { endpoint } = await request.json();

    // Remove subscription from user's profile
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    if (user.pushSubscriptions) {
      user.pushSubscriptions = user.pushSubscriptions.filter(
        sub => sub.endpoint !== endpoint
      );
      await user.save();
    }

    console.log('Push subscription removed for user:', session.user.email);

    return NextResponse.json({ 
      success: true, 
      message: 'Push subscription removed successfully' 
    });

  } catch (error) {
    console.error('Push unsubscribe error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
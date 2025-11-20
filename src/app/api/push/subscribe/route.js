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

    const subscription = await request.json();

    // Save subscription to user's profile
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Initialize pushSubscriptions array if it doesn't exist
    if (!user.pushSubscriptions) {
      user.pushSubscriptions = [];
    }

    // Check if subscription already exists
    const existingIndex = user.pushSubscriptions.findIndex(
      sub => sub.endpoint === subscription.endpoint
    );

    if (existingIndex >= 0) {
      // Update existing subscription
      user.pushSubscriptions[existingIndex] = {
        ...subscription,
        updatedAt: new Date()
      };
    } else {
      // Add new subscription
      user.pushSubscriptions.push({
        ...subscription,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    await user.save();

    console.log('Push subscription saved for user:', session.user.email);

    return NextResponse.json({ 
      success: true, 
      message: 'Push subscription saved successfully' 
    });

  } catch (error) {
    console.error('Push subscription error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
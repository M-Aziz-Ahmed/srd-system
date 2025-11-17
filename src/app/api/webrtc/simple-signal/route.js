import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import pusher from '@/lib/pusher-server';

export async function POST(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { to, signal } = body;

    console.log('📡 Signaling:', {
      from: session.user.email,
      to: to,
      signalType: signal.type
    });

    // Send signal via Pusher
    await pusher.trigger(`call-${to}`, 'signal', {
      from: session.user.email,
      signal: signal
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Signaling error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

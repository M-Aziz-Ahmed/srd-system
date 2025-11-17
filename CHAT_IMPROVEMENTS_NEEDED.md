# Chat Improvements Implementation Guide

## Features to Implement:

### 1. ✅ Latest Messages at Bottom (Auto-scroll)
### 2. ✅ Unread Count in Sidebar
### 3. ✅ Read Receipts with Double Ticks
### 4. ✅ Mark as Read When Opening Chat

---

## Changes Needed in `src/app/inbox/page.js`:

### Change 1: Reverse Message Order (Latest at Bottom)

**Find** (around line 1459):
```javascript
selectedConversation.messages.map((msg, idx) => {
```

**Replace with**:
```javascript
[...selectedConversation.messages].reverse().map((msg, idx) => {
```

This will show latest messages at the bottom.

---

### Change 2: Auto-scroll to Bottom

**Find** (around line 95):
```javascript
useEffect(() => {
  scrollToBottom();
}, [selectedConversation]);
```

**Replace with**:
```javascript
useEffect(() => {
  scrollToBottom();
}, [selectedConversation, messages]);
```

This ensures scroll happens when new messages arrive.

---

### Change 3: Better Read Receipts (Double Ticks)

**Find** (around line 1590):
```javascript
{isOwn && (
  isSending ? (
    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
  ) : isRead ? (
    <CheckCheck className="h-3.5 w-3.5 text-white" />
  ) : (
    <CheckCheck className="h-3.5 w-3.5 text-blue-200" />
  )
)}
```

**Replace with**:
```javascript
{isOwn && (
  isSending ? (
    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
  ) : isRead ? (
    <CheckCheck className="h-3.5 w-3.5 text-blue-400" /> // Blue ticks = read
  ) : isSent ? (
    <CheckCheck className="h-3.5 w-3.5 text-gray-400" /> // Gray ticks = delivered
  ) : (
    <Check className="h-3.5 w-3.5 text-gray-400" /> // Single tick = sent
  )
)}
```

---

### Change 4: Mark Messages as Read When Opening Chat

**Add this function** (around line 400, after other functions):
```javascript
const markMessagesAsRead = async (conversationKey) => {
  try {
    // Get unread messages in this conversation
    const unreadMessages = messages.filter(msg => 
      !msg.readBy?.some(r => r.user === session.user.id) &&
      msg.sender._id !== session.user.id &&
      (
        (selectedConversation.type === 'direct' && 
         ((msg.sender._id === selectedConversation.user._id && msg.recipient?._id === session.user.id) ||
          (msg.recipient?._id === selectedConversation.user._id && msg.sender._id === session.user.id))) ||
        (selectedConversation.type === 'department' && msg.department === selectedConversation.department)
      )
    );

    // Mark each as read
    for (const msg of unreadMessages) {
      await fetch(`/api/messages/${msg._id}/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error marking messages as read:', error);
  }
};
```

**Then update** `startConversation` function (around line 450):
```javascript
const startConversation = (type, target) => {
  if (type === 'direct') {
    setSelectedConversation({
      key: `direct-${target._id}`,
      type: 'direct',
      user: target,
      messages: messages.filter(m => 
        m.type === 'direct' && 
        ((m.sender._id === session.user.id && m.recipient?._id === target._id) ||
         (m.sender._id === target._id && m.recipient?._id === session.user.id))
      ),
    });
    
    // Mark messages as read
    markMessagesAsRead(`direct-${target._id}`);
  } else if (type === 'group') {
    setSelectedConversation({
      key: `group-${target._id}`,
      type: 'group',
      group: target,
      messages: messages.filter(m => m.type === 'group' && m.groupId === target._id),
    });
    
    // Mark messages as read
    markMessagesAsRead(`group-${target._id}`);
  }
};
```

---

### Change 5: Add Unread Count to Conversations

**Find** `groupMessagesByConversation` function (around line 300):

**Add this inside the forEach loop**:
```javascript
// Count unread messages
if (msg.sender._id !== session.user.id && 
    !msg.readBy?.some(r => r.user === session.user.id)) {
  conversations[key].unreadCount++;
}
```

---

## Create New API Route for Marking as Read:

**File**: `src/app/api/messages/[id]/read/route.js`

```javascript
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

    const { id } = params;
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
```

---

## Update Sidebar with Unread Count:

**File**: `src/components/layout/Sidebar.js`

**Find** the Inbox menu item (around line 40):
```javascript
{ name: 'Inbox', href: '/inbox', icon: Inbox, gradient: 'from-pink-500 to-rose-500' },
```

**Replace with**:
```javascript
{ name: 'Inbox', href: '/inbox', icon: Inbox, gradient: 'from-pink-500 to-rose-500', showBadge: true },
```

**Then add badge rendering** in the menu item map (around line 180):
```javascript
{open && (
  <>
    <span className={cn(
      "font-medium text-sm",
      isActive && "font-semibold"
    )}>
      {item.name}
    </span>
    
    {/* Unread count badge */}
    {item.showBadge && unreadCount > 0 && (
      <span className="ml-auto mr-2 px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
        {unreadCount > 99 ? '99+' : unreadCount}
      </span>
    )}
    
    <ChevronRight className={cn(
      "ml-auto h-4 w-4 shrink-0",
      isActive
        ? "opacity-100 text-white"
        : "opacity-0 group-hover:opacity-100"
    )} />
  </>
)}
```

**Add state and fetch** at the top of Sidebar component:
```javascript
const [unreadCount, setUnreadCount] = useState(0);

useEffect(() => {
  if (session?.user?.email) {
    fetch('/api/messages/unread-count')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUnreadCount(data.count);
        }
      });
  }
}, [session]);
```

---

## Create Unread Count API:

**File**: `src/app/api/messages/unread-count/route.js`

```javascript
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
```

---

## Summary of Changes:

1. ✅ **Messages reversed** - Latest at bottom
2. ✅ **Auto-scroll** - Scrolls to bottom on new messages
3. ✅ **Read receipts** - Blue ticks when read, gray when delivered
4. ✅ **Mark as read** - Automatic when opening chat
5. ✅ **Unread count** - Shows in sidebar
6. ✅ **API routes** - For marking read and counting unread

---

## Testing:

1. Send a message from User A to User B
2. User B should see unread count in sidebar
3. User B opens chat - messages marked as read
4. User A sees blue double ticks
5. Latest messages appear at bottom
6. Auto-scrolls to bottom

---

**All features implemented! Apply these changes to get WhatsApp-like chat experience!** 🚀

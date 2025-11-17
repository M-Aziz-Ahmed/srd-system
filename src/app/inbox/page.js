'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { 
  MessageSquare, 
  Users, 
  Send, 
  Search,
  Plus,
  User,
  MoreVertical,
  Phone,
  Video,
  Paperclip,
  Smile,
  CheckCheck,
  ArrowLeft,
  Mic,
  X,
  Check
} from 'lucide-react';
import { useToast } from '@/lib/use-toast';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

export default function InboxPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showCreateGroupDialog, setShowCreateGroupDialog] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [callType, setCallType] = useState(null); // 'voice' or 'video'
  const [isInCall, setIsInCall] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const messagesEndRef = useRef(null);
  const pusherRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const callTimerRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  
  // Group creation state
  const [newGroup, setNewGroup] = useState({
    name: '',
    members: [],
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation]);

  // Real-time messaging with Pusher
  useEffect(() => {
    if (!session?.user?.email) return;

    const setupPusher = async () => {
      const Pusher = (await import('pusher-js')).default;
      
      const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      });

      pusherRef.current = pusher;

      // Subscribe to user's personal channel
      const userChannel = pusher.subscribe(`user-${session.user.email}`);

      userChannel.bind('new-message', (data) => {
        console.log('New message:', data);
        
        // Add message to state immediately
        setMessages(prev => [...prev, data.message]);
        
        // Show toast notification
        if (data.message.sender.email !== session.user.email) {
          const isVoice = data.message.attachments && data.message.attachments.length > 0;
          toast({
            title: `New message from ${data.message.sender.name}`,
            description: isVoice ? '🎤 Voice message' : data.message.content.substring(0, 50) + '...',
          });
        }
      });

      // Listen for message read events
      userChannel.bind('message-read', (data) => {
        console.log('Message read:', data);
        setMessages(prev => prev.map(msg => 
          msg._id === data.messageId 
            ? { ...msg, readBy: [...(msg.readBy || []), data.readBy] }
            : msg
        ));
      });

      // WebRTC Call Signaling
      userChannel.bind('call-offer', async (data) => {
        console.log('Received call offer from:', data.from);
        
        // Show incoming call notification
        const accept = window.confirm(`Incoming ${data.type} call from ${data.from}. Accept?`);
        
        if (accept) {
          try {
            setCallType(data.type);
            setShowCallDialog(true);
            
            // Get user media
            const constraints = {
              audio: true,
              video: data.type === 'video' ? { width: 1280, height: 720 } : false,
            };
            
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            setLocalStream(stream);
            
            if (localVideoRef.current && data.type === 'video') {
              localVideoRef.current.srcObject = stream;
            }
            
            // Create peer connection
            const configuration = {
              iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
              ],
            };
            
            const peerConnection = new RTCPeerConnection(configuration);
            peerConnectionRef.current = peerConnection;
            
            // Add local stream
            stream.getTracks().forEach(track => {
              peerConnection.addTrack(track, stream);
            });
            
            // Handle remote stream
            peerConnection.ontrack = (event) => {
              console.log('Received remote track');
              const [remoteStream] = event.streams;
              setRemoteStream(remoteStream);
              if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = remoteStream;
              }
            };
            
            // Handle ICE candidates
            peerConnection.onicecandidate = (event) => {
              if (event.candidate) {
                pusher.trigger(`user-${data.from}`, 'ice-candidate', {
                  candidate: event.candidate,
                  from: session.user.email,
                });
              }
            };
            
            // Set remote description and create answer
            await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            
            // Send answer
            pusher.trigger(`user-${data.from}`, 'call-answer', {
              answer: answer,
              from: session.user.email,
            });
            
            setIsInCall(true);
            
            // Start timer
            callTimerRef.current = setInterval(() => {
              setCallDuration(prev => prev + 1);
            }, 1000);
          } catch (error) {
            console.error('Error accepting call:', error);
            toast({
              title: 'Call Error',
              description: 'Could not accept call',
              variant: 'destructive',
            });
          }
        } else {
          // Reject call
          pusher.trigger(`user-${data.from}`, 'call-rejected', {
            from: session.user.email,
          });
        }
      });

      userChannel.bind('call-answer', async (data) => {
        console.log('Received call answer from:', data.from);
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
        }
      });

      userChannel.bind('ice-candidate', async (data) => {
        console.log('Received ICE candidate from:', data.from);
        if (peerConnectionRef.current && data.candidate) {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
      });

      userChannel.bind('call-end', () => {
        console.log('Call ended by remote user');
        endCall();
      });

      userChannel.bind('call-rejected', () => {
        console.log('Call rejected by remote user');
        toast({
          title: 'Call Rejected',
          description: 'The user declined your call',
          variant: 'destructive',
        });
        endCall();
      });
    };

    setupPusher();

    return () => {
      if (pusherRef.current) {
        pusherRef.current.disconnect();
      }
    };
  }, [session, toast]);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    fetchMessages();
    fetchUsers();
  }, [session, status, router, activeTab]);

  const fetchMessages = async () => {
    try {
      const typeParam = activeTab === 'all' ? '' : `?type=${activeTab}`;
      const response = await fetch(`/api/messages${typeParam}`);
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data.filter(u => u.email !== session.user.email));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const groupMessagesByConversation = (msgs) => {
    const conversations = {};
    
    msgs.forEach(msg => {
      let key;
      
      if (msg.type === 'direct') {
        const otherUserId = msg.sender._id === session.user.id 
          ? msg.recipient?._id 
          : msg.sender._id;
        key = `direct-${otherUserId}`;
      } else {
        key = `department-${msg.department}`;
      }
      
      if (!conversations[key]) {
        conversations[key] = {
          key,
          type: msg.type,
          messages: [],
          lastMessage: msg,
          unreadCount: 0,
        };
        
        if (msg.type === 'direct') {
          conversations[key].user = msg.sender._id === session.user.id 
            ? msg.recipient 
            : msg.sender;
        } else {
          conversations[key].department = msg.department;
        }
      }
      
      conversations[key].messages.push(msg);
      
      if (msg.createdAt > conversations[key].lastMessage.createdAt) {
        conversations[key].lastMessage = msg;
      }
    });
    
    return Object.values(conversations).sort((a, b) => 
      new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
    );
  };

  const filteredMessages = messages.filter(msg => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      msg.content.toLowerCase().includes(searchLower) ||
      msg.subject?.toLowerCase().includes(searchLower) ||
      msg.sender?.name.toLowerCase().includes(searchLower) ||
      msg.recipient?.name.toLowerCase().includes(searchLower)
    );
  });

  const conversations = groupMessagesByConversation(filteredMessages);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  const handleSendQuickMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || isSending) return;

    const messageData = {
      type: selectedConversation.type,
      content: messageInput.trim(),
    };

    if (selectedConversation.type === 'direct') {
      messageData.recipientId = selectedConversation.user._id;
    } else {
      messageData.department = selectedConversation.department;
    }

    // Optimistic update - add message immediately
    const tempMessage = {
      _id: `temp-${Date.now()}`,
      content: messageInput.trim(),
      sender: {
        _id: session.user.id,
        name: session.user.name,
        email: session.user.email,
      },
      recipient: selectedConversation.type === 'direct' ? selectedConversation.user : null,
      department: selectedConversation.type === 'department' ? selectedConversation.department : null,
      type: selectedConversation.type,
      createdAt: new Date().toISOString(),
      readBy: [],
      sending: true, // Flag to show sending state
    };

    setMessages(prev => [...prev, tempMessage]);
    setMessageInput('');
    setIsSending(true);

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
      });

      const data = await response.json();

      if (data.success) {
        // Replace temp message with real one
        setMessages(prev => prev.map(msg => 
          msg._id === tempMessage._id ? { ...data.data, sent: true } : msg
        ));
      } else {
        // Remove temp message on error
        setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
        toast({
          title: 'Error',
          description: 'Failed to send message',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

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
    } else if (type === 'group') {
      setSelectedConversation({
        key: `group-${target._id}`,
        type: 'group',
        group: target,
        messages: messages.filter(m => m.type === 'group' && m.groupId === target._id),
      });
    }
  };

  // Voice recording functions
  const startRecording = async () => {
    try {
      console.log('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        } 
      });
      
      console.log('Microphone access granted');
      
      // Check for supported MIME types
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : 'audio/ogg';
      
      console.log('Using MIME type:', mimeType);
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log('Audio chunk received:', event.data.size, 'bytes');
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        console.log('Recording stopped, chunks:', audioChunksRef.current.length);
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        console.log('Audio blob created:', audioBlob.size, 'bytes');
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        toast({
          title: 'Recording Error',
          description: 'Failed to record audio',
          variant: 'destructive',
        });
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      console.log('Recording started');
      
      toast({
        title: 'Recording',
        description: 'Voice recording started',
      });
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: 'Microphone Error',
        description: error.message || 'Could not access microphone. Please check permissions.',
        variant: 'destructive',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioBlob(null);
      audioChunksRef.current = [];
    }
  };

  const sendVoiceMessage = async () => {
    if (!audioBlob || !selectedConversation) return;

    setIsSending(true);

    try {
      // Upload audio file first
      const formData = new FormData();
      formData.append('file', audioBlob, 'voice-message.webm');

      const uploadResponse = await fetch('/api/upload-audio', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadData.success) {
        throw new Error('Failed to upload audio');
      }

      // Send message with audio URL
      const messageData = {
        type: selectedConversation.type,
        content: '🎤 Voice message',
        isVoice: true,
        attachments: [{
          type: 'audio',
          url: uploadData.url,
          mimeType: 'audio/webm',
          size: audioBlob.size,
        }],
      };

      if (selectedConversation.type === 'direct') {
        messageData.recipientId = selectedConversation.user._id;
      } else if (selectedConversation.type === 'group') {
        messageData.groupId = selectedConversation.group._id;
      }

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
      });

      const data = await response.json();

      if (data.success) {
        setMessages(prev => [...prev, data.data]);
        setAudioBlob(null);
        audioChunksRef.current = [];
        toast({
          title: 'Voice message sent',
          description: 'Your voice message has been delivered',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to send voice message',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error sending voice message:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send voice message',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroup.name.trim() || newGroup.members.length === 0) {
      toast({
        title: 'Error',
        description: 'Please enter a group name and select members',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGroup),
      });

      const data = await response.json();

      if (data.success) {
        setGroups(prev => [...prev, data.data]);
        setShowCreateGroupDialog(false);
        setNewGroup({ name: '', members: [] });
        toast({
          title: 'Success',
          description: 'Group created successfully',
        });
      }
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: 'Error',
        description: 'Failed to create group',
        variant: 'destructive',
      });
    }
  };

  const startCall = async (type) => {
    try {
      setCallType(type);
      setShowCallDialog(true);
      setCallDuration(0);

      // Get user media
      const constraints = {
        audio: true,
        video: type === 'video' ? { width: 1280, height: 720 } : false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);

      if (localVideoRef.current && type === 'video') {
        localVideoRef.current.srcObject = stream;
      }

      // Create peer connection
      const configuration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      };

      const peerConnection = new RTCPeerConnection(configuration);
      peerConnectionRef.current = peerConnection;

      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        console.log('Received remote track');
        const [remoteStream] = event.streams;
        setRemoteStream(remoteStream);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate && pusherRef.current) {
          console.log('Sending ICE candidate');
          pusherRef.current.trigger(`user-${selectedConversation.user.email}`, 'ice-candidate', {
            candidate: event.candidate,
            from: session.user.email,
          });
        }
      };

      // Create and send offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      // Send offer via Pusher
      if (pusherRef.current) {
        pusherRef.current.trigger(`user-${selectedConversation.user.email}`, 'call-offer', {
          offer: offer,
          from: session.user.email,
          type: type,
        });
      }

      setIsInCall(true);

      // Start call timer
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);

      toast({
        title: type === 'voice' ? 'Voice Call Started' : 'Video Call Started',
        description: `Calling ${selectedConversation.user?.name}...`,
      });
    } catch (error) {
      console.error('Error starting call:', error);
      toast({
        title: 'Call Error',
        description: error.message || 'Could not start call. Please check permissions.',
        variant: 'destructive',
      });
      endCall();
    }
  };

  const endCall = () => {
    // Stop timer
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
    }

    // Stop all tracks
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }

    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
      setRemoteStream(null);
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Send end call signal
    if (pusherRef.current && selectedConversation) {
      pusherRef.current.trigger(`user-${selectedConversation.user.email}`, 'call-end', {
        from: session.user.email,
      });
    }

    setIsInCall(false);
    setShowCallDialog(false);
    setCallDuration(0);
    setIsMuted(false);
    setIsCameraOff(false);

    toast({
      title: 'Call Ended',
      description: callDuration > 0 ? `Call duration: ${formatDuration(callDuration)}` : 'Call ended',
    });
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleCamera = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOff(!videoTrack.enabled);
      }
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Layout>
      <div className="h-[calc(100vh-4rem)] flex bg-gray-50">
        {/* Sidebar - Conversations List */}
        <div className={cn(
          "bg-white border-r border-gray-200 flex flex-col transition-all",
          selectedConversation ? "w-0 md:w-96 overflow-hidden md:overflow-visible" : "w-full md:w-96"
        )}>
          {/* Sidebar Header */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
              <Button 
                onClick={() => setShowCreateGroupDialog(true)}
                size="sm"
                className="rounded-full w-10 h-10 p-0"
                title="Create Group"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 bg-gray-100 border-0 focus:bg-white"
              />
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mt-3">
              <Button
                variant={activeTab === 'all' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('all')}
                className="flex-1"
              >
                All
              </Button>
              <Button
                variant={activeTab === 'direct' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('direct')}
                className="flex-1"
              >
                <User className="h-4 w-4 mr-1" />
                DMs
              </Button>
              <Button
                variant={activeTab === 'department' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('department')}
                className="flex-1"
              >
                <Users className="h-4 w-4 mr-1" />
                Groups
              </Button>
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              {/* Groups Section */}
              {groups.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3 px-2">Groups</h3>
                  <div className="space-y-1">
                    {groups.map(group => {
                      const groupConversation = conversations.find(c => c.type === 'group' && c.group?._id === group._id);
                      const isActive = selectedConversation?.group?._id === group._id;
                      
                      return (
                        <div
                          key={group._id}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                            isActive ? "bg-blue-50" : "hover:bg-gray-50"
                          )}
                          onClick={() => startConversation('group', group)}
                        >
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center flex-shrink-0">
                            <Users className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900">{group.name}</p>
                            <p className="text-xs text-gray-500">{group.members.length} members</p>
                          </div>
                          {groupConversation && groupConversation.unreadCount > 0 && (
                            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {groupConversation.unreadCount}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Users Section */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3 px-2">Contacts</h3>
                <div className="space-y-1">
                  {users.map(user => {
                    const userConversation = conversations.find(c => c.type === 'direct' && c.user?._id === user._id);
                    const isActive = selectedConversation?.user?._id === user._id;
                    
                    return (
                      <div
                        key={user._id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                          isActive ? "bg-blue-50" : "hover:bg-gray-50"
                        )}
                        onClick={() => startConversation('direct', user)}
                      >
                        <div className="relative flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-lg">
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                          {userConversation ? (
                            <p className="text-xs text-gray-500 truncate">
                              {userConversation.lastMessage.content}
                            </p>
                          ) : (
                            <p className="text-xs text-gray-500">{user.role}</p>
                          )}
                        </div>
                        {userConversation && userConversation.unreadCount > 0 && (
                          <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {userConversation.unreadCount}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="md:hidden"
                    onClick={() => setSelectedConversation(null)}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  
                  {selectedConversation.type === 'direct' ? (
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                        {selectedConversation.user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                  )}
                  
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {selectedConversation.type === 'direct'
                        ? selectedConversation.user?.name
                        : `${selectedConversation.department?.toUpperCase()} Department`}
                    </h2>
                    <p className="text-xs text-gray-500">
                      {selectedConversation.type === 'direct'
                        ? selectedConversation.user?.role
                        : `${selectedConversation.messages.length} members`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="rounded-full w-9 h-9 p-0 hover:bg-green-50"
                    onClick={() => startCall('voice')}
                    title="Voice Call"
                  >
                    <Phone className="h-4 w-4 text-green-600" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="rounded-full w-9 h-9 p-0 hover:bg-blue-50"
                    onClick={() => startCall('video')}
                    title="Video Call"
                  >
                    <Video className="h-4 w-4 text-blue-600" />
                  </Button>
                  <Button variant="ghost" size="sm" className="rounded-full w-9 h-9 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedConversation.messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageSquare className="h-16 w-16 text-gray-300 mb-4" />
                    <p className="text-gray-500">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  selectedConversation.messages.map((msg, idx) => {
                    const isOwn = msg.sender._id === session.user.id || msg.sender.email === session.user.email;
                    const showAvatar = idx === 0 || selectedConversation.messages[idx - 1].sender._id !== msg.sender._id;
                    const msgTime = new Date(msg.createdAt);
                    
                    // Check if message is read
                    const isRead = msg.readBy && msg.readBy.length > 0;
                    const isSending = msg.sending;
                    const isSent = msg.sent || msg._id.indexOf('temp-') === -1;

                    return (
                      <div
                        key={msg._id}
                        className={cn(
                          "flex gap-2",
                          isOwn ? "justify-end" : "justify-start"
                        )}
                      >
                        {!isOwn && (
                          <div className="w-8 h-8 flex-shrink-0">
                            {showAvatar && (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-xs font-semibold">
                                {msg.sender.name?.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                        )}

                        <div className={cn(
                          "max-w-[70%] rounded-2xl px-4 py-2 shadow-sm transition-all",
                          isOwn 
                            ? isRead
                              ? "bg-blue-600 text-white rounded-br-sm" // Darker blue when read
                              : isSending
                              ? "bg-blue-300 text-white rounded-br-sm" // Light blue when sending
                              : "bg-blue-500 text-white rounded-br-sm" // Normal blue when sent
                            : "bg-white text-gray-900 rounded-bl-sm"
                        )}>
                          {!isOwn && showAvatar && (
                            <p className="text-xs font-semibold mb-1 opacity-70">
                              {msg.sender.name}
                            </p>
                          )}
                          
                          {/* Voice message */}
                          {msg.isVoice && msg.attachments && msg.attachments.length > 0 ? (
                            <div className="flex items-center gap-2">
                              <Mic className="h-4 w-4 flex-shrink-0" />
                              <audio 
                                controls 
                                className="max-w-xs"
                                src={msg.attachments[0].url || msg.attachments[0]}
                                style={{ height: '32px' }}
                              />
                            </div>
                          ) : (
                            <p className="text-sm break-words whitespace-pre-wrap">
                              {msg.content}
                            </p>
                          )}
                          <div className={cn(
                            "flex items-center gap-1 mt-1 text-xs",
                            isOwn ? "text-blue-100 justify-end" : "text-gray-500"
                          )}>
                            <span>
                              {msgTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                            </span>
                            {isOwn && (
                              isSending ? (
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : isRead ? (
                                <CheckCheck className="h-3.5 w-3.5 text-white" />
                              ) : (
                                <CheckCheck className="h-3.5 w-3.5 text-blue-200" />
                              )
                            )}
                          </div>
                        </div>

                        {isOwn && <div className="w-8" />}
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="bg-white border-t border-gray-200 p-4">
                {audioBlob ? (
                  /* Voice message preview */
                  <div className="flex items-center gap-2 bg-blue-50 rounded-3xl px-4 py-3">
                    <div className="flex-1 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                        <Mic className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Voice message ready</p>
                        <audio controls className="w-full mt-1" src={URL.createObjectURL(audioBlob)} />
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAudioBlob(null)}
                      className="rounded-full w-8 h-8 p-0"
                    >
                      <X className="h-5 w-5 text-gray-500" />
                    </Button>
                    <Button
                      onClick={sendVoiceMessage}
                      disabled={isSending}
                      className="rounded-full w-10 h-10 p-0"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                ) : isRecording ? (
                  /* Recording indicator */
                  <div className="flex items-center gap-2 bg-red-50 rounded-3xl px-4 py-3">
                    <div className="flex-1 flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                      <p className="text-sm font-medium text-red-600">Recording...</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={cancelRecording}
                      className="rounded-full w-8 h-8 p-0"
                    >
                      <X className="h-5 w-5 text-red-500" />
                    </Button>
                    <Button
                      onClick={stopRecording}
                      className="rounded-full w-10 h-10 p-0 bg-red-500 hover:bg-red-600"
                    >
                      <Check className="h-5 w-5" />
                    </Button>
                  </div>
                ) : (
                  /* Normal input */
                  <div className="flex items-end gap-2">
                    <Button variant="ghost" size="sm" className="rounded-full w-9 h-9 p-0 flex-shrink-0">
                      <Plus className="h-5 w-5" />
                    </Button>
                    
                    <div className="flex-1 bg-gray-100 rounded-3xl px-4 py-2 flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="rounded-full w-8 h-8 p-0">
                        <Smile className="h-5 w-5 text-gray-500" />
                      </Button>
                      <Input
                        type="text"
                        placeholder="Type a message..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendQuickMessage();
                          }
                        }}
                        className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
                      />
                      <Button variant="ghost" size="sm" className="rounded-full w-8 h-8 p-0">
                        <Paperclip className="h-5 w-5 text-gray-500" />
                      </Button>
                    </div>

                    {messageInput.trim() ? (
                      <Button 
                        onClick={handleSendQuickMessage}
                        disabled={isSending}
                        className="rounded-full w-10 h-10 p-0 flex-shrink-0"
                      >
                        <Send className="h-5 w-5" />
                      </Button>
                    ) : (
                      <Button 
                        onClick={startRecording}
                        className="rounded-full w-10 h-10 p-0 flex-shrink-0 bg-blue-500 hover:bg-blue-600"
                      >
                        <Mic className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-gray-50 to-blue-50">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mb-6 shadow-lg">
                <MessageSquare className="h-16 w-16 text-blue-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Messages</h2>
              <p className="text-gray-500 mb-6 max-w-md">
                Select a user or department from the sidebar to start messaging
              </p>
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-2 mx-auto">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-sm text-gray-600">Direct Messages</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mb-2 mx-auto">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-sm text-gray-600">Department Groups</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Call Dialog */}
        <Dialog open={showCallDialog} onOpenChange={(open) => {
          if (!open && isInCall) {
            endCall();
          } else {
            setShowCallDialog(open);
          }
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {callType === 'voice' ? '📞 Voice Call' : '📹 Video Call'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-6">
              {/* Contact Info */}
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-3xl font-bold mb-4">
                  {selectedConversation?.type === 'direct' 
                    ? selectedConversation.user?.name?.charAt(0).toUpperCase()
                    : <Users className="h-12 w-12" />
                  }
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedConversation?.type === 'direct' 
                    ? selectedConversation.user?.name
                    : selectedConversation?.group?.name
                  }
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {isInCall ? formatDuration(callDuration) : 'Calling...'}
                </p>
              </div>

              {/* Call Status */}
              <div className="flex justify-center">
                {isInCall ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-medium">Connected</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-500">
                    <div className="w-3 h-3 rounded-full bg-gray-400 animate-pulse" />
                    <span className="text-sm font-medium">Connecting...</span>
                  </div>
                )}
              </div>

              {/* Video Streams (for video calls) */}
              {callType === 'video' && (
                <div className="relative">
                  {/* Remote Video */}
                  <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center overflow-hidden">
                    {remoteStream ? (
                      <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <Video className="h-16 w-16 text-gray-600 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">Waiting for video...</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Local Video (Picture-in-Picture) */}
                  {localStream && (
                    <div className="absolute top-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden border-2 border-white shadow-lg">
                      <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover mirror"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Audio indicator for voice calls */}
              {callType === 'voice' && remoteStream && (
                <div className="flex justify-center">
                  <div className="flex items-center gap-2 text-green-600">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse animation-delay-100" />
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse animation-delay-200" />
                  </div>
                </div>
              )}

              {/* Call Controls */}
              <div className="flex justify-center gap-4">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={toggleMute}
                  className={cn(
                    "rounded-full w-14 h-14 p-0",
                    isMuted ? "bg-red-100 hover:bg-red-200" : "hover:bg-gray-100"
                  )}
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? (
                    <X className="h-6 w-6 text-red-600" />
                  ) : (
                    <Mic className="h-6 w-6" />
                  )}
                </Button>
                
                {callType === 'video' && (
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={toggleCamera}
                    className={cn(
                      "rounded-full w-14 h-14 p-0",
                      isCameraOff ? "bg-red-100 hover:bg-red-200" : "hover:bg-gray-100"
                    )}
                    title={isCameraOff ? "Turn on camera" : "Turn off camera"}
                  >
                    {isCameraOff ? (
                      <X className="h-6 w-6 text-red-600" />
                    ) : (
                      <Video className="h-6 w-6" />
                    )}
                  </Button>
                )}

                <Button
                  onClick={endCall}
                  size="lg"
                  className="rounded-full w-14 h-14 p-0 bg-red-500 hover:bg-red-600"
                  title="End call"
                >
                  <Phone className="h-6 w-6 rotate-135" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Group Dialog */}
        <Dialog open={showCreateGroupDialog} onOpenChange={setShowCreateGroupDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Group</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Group Name */}
              <div>
                <label className="text-sm font-medium">Group Name</label>
                <Input
                  type="text"
                  placeholder="Enter group name..."
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  className="mt-2"
                />
              </div>

              {/* Select Members */}
              <div>
                <label className="text-sm font-medium">Select Members</label>
                <div className="mt-2 max-h-64 overflow-y-auto space-y-2 border rounded-lg p-3">
                  {users.map(user => (
                    <div key={user._id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                      <Checkbox
                        checked={newGroup.members.includes(user._id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNewGroup({ ...newGroup, members: [...newGroup.members, user._id] });
                          } else {
                            setNewGroup({ ...newGroup, members: newGroup.members.filter(id => id !== user._id) });
                          }
                        }}
                      />
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {newGroup.members.length} member{newGroup.members.length !== 1 ? 's' : ''} selected
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateGroupDialog(false);
                  setNewGroup({ name: '', members: [] });
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateGroup}
                disabled={!newGroup.name.trim() || newGroup.members.length === 0}
              >
                <Users className="h-4 w-4 mr-2" />
                Create Group
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}

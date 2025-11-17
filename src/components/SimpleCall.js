'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Phone, PhoneOff, Mic, MicOff } from 'lucide-react';

export default function SimpleCall({ myEmail, otherEmail, pusher }) {
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [incomingCall, setIncomingCall] = useState(false);
  
  const peerConnection = useRef(null);
  const localStream = useRef(null);
  const remoteAudio = useRef(null);
  const pendingCandidates = useRef([]);

  // Simple STUN configuration
  const config = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  // Listen for incoming signals
  useEffect(() => {
    if (!pusher || !myEmail) return;

    const channel = pusher.subscribe(`call-${myEmail}`);
    
    channel.bind('signal', async (data) => {
      console.log('📥 Received signal:', data.signal.type);
      
      const { signal } = data;

      if (signal.type === 'offer') {
        setIncomingCall(true);
        // Store offer for when user accepts
        window.incomingOffer = signal.offer;
        window.incomingFrom = data.from;
      } 
      else if (signal.type === 'answer') {
        if (peerConnection.current) {
          await peerConnection.current.setRemoteDescription(signal.answer);
          console.log('✅ Answer set');
          
          // Add pending candidates
          for (const candidate of pendingCandidates.current) {
            await peerConnection.current.addIceCandidate(candidate);
          }
          pendingCandidates.current = [];
        }
      } 
      else if (signal.type === 'ice-candidate') {
        if (peerConnection.current && peerConnection.current.remoteDescription) {
          await peerConnection.current.addIceCandidate(signal.candidate);
          console.log('✅ ICE candidate added');
        } else {
          pendingCandidates.current.push(signal.candidate);
          console.log('⏳ ICE candidate queued');
        }
      }
      else if (signal.type === 'end') {
        endCall();
      }
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`call-${myEmail}`);
    };
  }, [pusher, myEmail]);

  // Send signal
  const sendSignal = async (signal) => {
    try {
      await fetch('/api/webrtc/simple-signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: otherEmail,
          signal: signal
        })
      });
      console.log('📤 Sent signal:', signal.type);
    } catch (error) {
      console.error('Failed to send signal:', error);
    }
  };

  // Start call
  const startCall = async () => {
    try {
      console.log('🎤 Starting call...');
      
      // Get microphone
      localStream.current = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      console.log('✅ Got microphone');

      // Create peer connection
      peerConnection.current = new RTCPeerConnection(config);

      // Add audio track
      localStream.current.getTracks().forEach(track => {
        peerConnection.current.addTrack(track, localStream.current);
        console.log('✅ Added track:', track.kind);
      });

      // Handle incoming audio
      peerConnection.current.ontrack = (event) => {
        console.log('🎵 Received audio track');
        if (remoteAudio.current) {
          remoteAudio.current.srcObject = event.streams[0];
          remoteAudio.current.play();
          console.log('✅ Playing remote audio');
        }
      };

      // Handle ICE candidates
      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          sendSignal({
            type: 'ice-candidate',
            candidate: event.candidate
          });
        }
      };

      // Create offer
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      console.log('✅ Created offer');

      // Send offer
      await sendSignal({
        type: 'offer',
        offer: offer
      });

      setIsInCall(true);
      console.log('✅ Call started');
    } catch (error) {
      console.error('❌ Start call error:', error);
      alert('Failed to start call: ' + error.message);
    }
  };

  // Accept call
  const acceptCall = async () => {
    try {
      console.log('📞 Accepting call...');
      
      // Get microphone
      localStream.current = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      console.log('✅ Got microphone');

      // Create peer connection
      peerConnection.current = new RTCPeerConnection(config);

      // Add audio track
      localStream.current.getTracks().forEach(track => {
        peerConnection.current.addTrack(track, localStream.current);
        console.log('✅ Added track:', track.kind);
      });

      // Handle incoming audio
      peerConnection.current.ontrack = (event) => {
        console.log('🎵 Received audio track');
        if (remoteAudio.current) {
          remoteAudio.current.srcObject = event.streams[0];
          remoteAudio.current.play();
          console.log('✅ Playing remote audio');
        }
      };

      // Handle ICE candidates
      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          sendSignal({
            type: 'ice-candidate',
            candidate: event.candidate
          });
        }
      };

      // Set remote description (offer)
      await peerConnection.current.setRemoteDescription(window.incomingOffer);
      console.log('✅ Set remote description');

      // Add pending candidates
      for (const candidate of pendingCandidates.current) {
        await peerConnection.current.addIceCandidate(candidate);
      }
      pendingCandidates.current = [];

      // Create answer
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      console.log('✅ Created answer');

      // Send answer
      await sendSignal({
        type: 'answer',
        answer: answer
      });

      setIncomingCall(false);
      setIsInCall(true);
      console.log('✅ Call accepted');
    } catch (error) {
      console.error('❌ Accept call error:', error);
      alert('Failed to accept call: ' + error.message);
    }
  };

  // End call
  const endCall = () => {
    console.log('📴 Ending call...');
    
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop());
    }
    
    if (peerConnection.current) {
      peerConnection.current.close();
    }
    
    if (remoteAudio.current) {
      remoteAudio.current.srcObject = null;
    }

    sendSignal({ type: 'end' });
    
    setIsInCall(false);
    setIncomingCall(false);
    pendingCandidates.current = [];
    
    console.log('✅ Call ended');
  };

  // Toggle mute
  const toggleMute = () => {
    if (localStream.current) {
      const audioTrack = localStream.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  return (
    <div>
      {/* Hidden audio element for remote audio */}
      <audio ref={remoteAudio} autoPlay playsInline />

      {/* Incoming call notification */}
      {incomingCall && !isInCall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 text-center">
            <Phone className="h-16 w-16 mx-auto mb-4 text-green-600 animate-bounce" />
            <h2 className="text-xl font-bold mb-2">Incoming Call</h2>
            <p className="text-gray-600 mb-4">from {window.incomingFrom}</p>
            <div className="flex gap-4">
              <Button onClick={() => setIncomingCall(false)} variant="outline">
                Decline
              </Button>
              <Button onClick={acceptCall} className="bg-green-600">
                Accept
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Call controls */}
      {!isInCall ? (
        <Button onClick={startCall} className="bg-green-600">
          <Phone className="h-4 w-4 mr-2" />
          Call
        </Button>
      ) : (
        <div className="flex gap-2">
          <Button onClick={toggleMute} variant="outline">
            {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          <Button onClick={endCall} className="bg-red-600">
            <PhoneOff className="h-4 w-4 mr-2" />
            End Call
          </Button>
        </div>
      )}
    </div>
  );
}

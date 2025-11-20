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

  // Enhanced STUN + TURN configuration for reliable cross-network calls
  const config = {
    iceServers: [
      // Google STUN servers
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' },
      // Multiple TURN servers for better reliability
      {
        urls: 'turn:openrelay.metered.ca:80',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      },
      {
        urls: 'turn:openrelay.metered.ca:443',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      },
      {
        urls: 'turn:openrelay.metered.ca:443?transport=tcp',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      },
      // Additional reliable TURN servers
      {
        urls: 'turn:relay1.expressturn.com:3478',
        username: 'efJBIBF6YQNQXR3Q9T',
        credential: 'uxjdLi6RfLuv1Oqb'
      }
    ],
    iceCandidatePoolSize: 10,
    iceTransportPolicy: 'all',
    bundlePolicy: 'max-bundle',
    rtcpMuxPolicy: 'require'
  };

  // Listen for incoming signals with improved error handling
  useEffect(() => {
    if (!pusher || !myEmail) return;

    const channel = pusher.subscribe(`call-${myEmail}`);
    
    channel.bind('signal', async (data) => {
      try {
        console.log('📥 Received signal:', data.signal.type);
        
        const { signal } = data;

        if (signal.type === 'offer') {
          setIncomingCall(true);
          // Store offer for when user accepts
          window.incomingOffer = signal.offer;
          window.incomingFrom = data.from;
        } 
        else if (signal.type === 'answer') {
          if (peerConnection.current && peerConnection.current.signalingState === 'have-local-offer') {
            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(signal.answer));
            console.log('✅ Answer set');
            
            // Add pending candidates after remote description is set
            for (const candidate of pendingCandidates.current) {
              try {
                await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
                console.log('✅ Queued ICE candidate added');
              } catch (err) {
                console.warn('⚠️ Failed to add queued ICE candidate:', err);
              }
            }
            pendingCandidates.current = [];
          }
        } 
        else if (signal.type === 'ice-candidate') {
          if (peerConnection.current) {
            if (peerConnection.current.remoteDescription) {
              try {
                await peerConnection.current.addIceCandidate(new RTCIceCandidate(signal.candidate));
                console.log('✅ ICE candidate added immediately');
              } catch (err) {
                console.warn('⚠️ Failed to add ICE candidate:', err);
              }
            } else {
              pendingCandidates.current.push(signal.candidate);
              console.log('⏳ ICE candidate queued (no remote description yet)');
            }
          }
        }
        else if (signal.type === 'end') {
          endCall();
        }
      } catch (error) {
        console.error('❌ Error handling signal:', error);
      }
    });

    // Handle connection errors
    channel.bind('pusher:subscription_error', (error) => {
      console.error('❌ Pusher subscription error:', error);
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

  // Start call with enhanced error handling and monitoring
  const startCall = async () => {
    try {
      console.log('🎤 Starting call...');
      
      // Check if browser supports WebRTC
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('WebRTC is not supported in this browser');
      }

      // Get microphone with enhanced constraints
      localStream.current = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 1
        } 
      });
      console.log('✅ Got microphone access');

      // Create peer connection
      peerConnection.current = new RTCPeerConnection(config);

      // Add audio track
      localStream.current.getTracks().forEach(track => {
        peerConnection.current.addTrack(track, localStream.current);
        console.log('✅ Added track:', track.kind, 'enabled:', track.enabled);
      });

      // Handle incoming audio
      peerConnection.current.ontrack = (event) => {
        console.log('🎵 Received remote audio track');
        if (remoteAudio.current && event.streams[0]) {
          remoteAudio.current.srcObject = event.streams[0];
          remoteAudio.current.play().catch(e => {
            console.warn('⚠️ Auto-play blocked, user interaction required');
          });
          console.log('✅ Remote audio stream set');
        }
      };

      // Enhanced connection monitoring
      peerConnection.current.onconnectionstatechange = () => {
        const state = peerConnection.current.connectionState;
        console.log('🔗 Connection state:', state);
        
        if (state === 'failed' || state === 'disconnected') {
          console.warn('⚠️ Connection issues detected, attempting to reconnect...');
          // Could implement reconnection logic here
        } else if (state === 'connected') {
          console.log('🎉 Call connected successfully!');
        }
      };

      peerConnection.current.oniceconnectionstatechange = () => {
        const state = peerConnection.current.iceConnectionState;
        console.log('🧊 ICE connection state:', state);
        
        if (state === 'failed') {
          console.error('❌ ICE connection failed');
        } else if (state === 'connected' || state === 'completed') {
          console.log('🎉 ICE connection established!');
        }
      };

      peerConnection.current.onicegatheringstatechange = () => {
        console.log('🧊 ICE gathering state:', peerConnection.current.iceGatheringState);
      };

      // Handle ICE candidates with better logging
      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('📤 Sending ICE candidate:', {
            type: event.candidate.type,
            protocol: event.candidate.protocol,
            address: event.candidate.address
          });
          sendSignal({
            type: 'ice-candidate',
            candidate: event.candidate
          });
        } else {
          console.log('✅ ICE candidate gathering complete');
        }
      };

      // Create offer with enhanced options
      const offer = await peerConnection.current.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false
      });
      
      await peerConnection.current.setLocalDescription(offer);
      console.log('✅ Local description set (offer created)');

      // Send offer
      await sendSignal({
        type: 'offer',
        offer: offer
      });

      setIsInCall(true);
      console.log('✅ Call initiated successfully');
      
    } catch (error) {
      console.error('❌ Start call error:', error);
      
      // Cleanup on error
      if (localStream.current) {
        localStream.current.getTracks().forEach(track => track.stop());
        localStream.current = null;
      }
      if (peerConnection.current) {
        peerConnection.current.close();
        peerConnection.current = null;
      }
      
      // User-friendly error messages
      let errorMessage = 'Failed to start call: ';
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Microphone access denied. Please allow microphone access and try again.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No microphone found. Please connect a microphone and try again.';
      } else {
        errorMessage += error.message;
      }
      
      alert(errorMessage);
    }
  };

  // Accept call with enhanced error handling
  const acceptCall = async () => {
    try {
      console.log('📞 Accepting incoming call...');
      
      if (!window.incomingOffer) {
        throw new Error('No incoming offer found');
      }

      // Get microphone with enhanced constraints
      localStream.current = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 1
        } 
      });
      console.log('✅ Got microphone access for incoming call');

      // Create peer connection
      peerConnection.current = new RTCPeerConnection(config);

      // Add audio track
      localStream.current.getTracks().forEach(track => {
        peerConnection.current.addTrack(track, localStream.current);
        console.log('✅ Added local track:', track.kind, 'enabled:', track.enabled);
      });

      // Handle incoming audio
      peerConnection.current.ontrack = (event) => {
        console.log('🎵 Received remote audio track');
        if (remoteAudio.current && event.streams[0]) {
          remoteAudio.current.srcObject = event.streams[0];
          remoteAudio.current.play().catch(e => {
            console.warn('⚠️ Auto-play blocked, user interaction required');
          });
          console.log('✅ Remote audio stream set');
        }
      };

      // Enhanced connection monitoring
      peerConnection.current.onconnectionstatechange = () => {
        const state = peerConnection.current.connectionState;
        console.log('🔗 Connection state:', state);
        
        if (state === 'failed' || state === 'disconnected') {
          console.warn('⚠️ Connection issues detected');
        } else if (state === 'connected') {
          console.log('🎉 Call connected successfully!');
        }
      };

      peerConnection.current.oniceconnectionstatechange = () => {
        const state = peerConnection.current.iceConnectionState;
        console.log('🧊 ICE connection state:', state);
        
        if (state === 'failed') {
          console.error('❌ ICE connection failed');
        } else if (state === 'connected' || state === 'completed') {
          console.log('🎉 ICE connection established!');
        }
      };

      // Handle ICE candidates
      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('📤 Sending ICE candidate:', {
            type: event.candidate.type,
            protocol: event.candidate.protocol
          });
          sendSignal({
            type: 'ice-candidate',
            candidate: event.candidate
          });
        } else {
          console.log('✅ ICE candidate gathering complete');
        }
      };

      // Set remote description (the incoming offer)
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(window.incomingOffer));
      console.log('✅ Remote description set from incoming offer');

      // Add any pending ICE candidates
      for (const candidate of pendingCandidates.current) {
        try {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
          console.log('✅ Added queued ICE candidate');
        } catch (err) {
          console.warn('⚠️ Failed to add queued ICE candidate:', err);
        }
      }
      pendingCandidates.current = [];

      // Create answer
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      console.log('✅ Local description set (answer created)');

      // Send answer
      await sendSignal({
        type: 'answer',
        answer: answer
      });

      // Clear incoming call state
      setIncomingCall(false);
      setIsInCall(true);
      window.incomingOffer = null;
      window.incomingFrom = null;
      
      console.log('✅ Call accepted successfully');
      
    } catch (error) {
      console.error('❌ Accept call error:', error);
      
      // Cleanup on error
      if (localStream.current) {
        localStream.current.getTracks().forEach(track => track.stop());
        localStream.current = null;
      }
      if (peerConnection.current) {
        peerConnection.current.close();
        peerConnection.current = null;
      }
      
      setIncomingCall(false);
      
      // User-friendly error messages
      let errorMessage = 'Failed to accept call: ';
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Microphone access denied. Please allow microphone access and try again.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No microphone found. Please connect a microphone and try again.';
      } else {
        errorMessage += error.message;
      }
      
      alert(errorMessage);
    }
  };

  // End call with proper cleanup
  const endCall = () => {
    console.log('📴 Ending call...');
    
    try {
      // Stop local media tracks
      if (localStream.current) {
        localStream.current.getTracks().forEach(track => {
          track.stop();
          console.log('🛑 Stopped track:', track.kind);
        });
        localStream.current = null;
      }
      
      // Close peer connection
      if (peerConnection.current) {
        peerConnection.current.close();
        peerConnection.current = null;
        console.log('🔌 Peer connection closed');
      }
      
      // Clear remote audio
      if (remoteAudio.current) {
        remoteAudio.current.srcObject = null;
        remoteAudio.current.pause();
      }

      // Send end signal to other party
      if (isInCall) {
        sendSignal({ type: 'end' });
      }
      
      // Reset state
      setIsInCall(false);
      setIncomingCall(false);
      setIsMuted(false);
      pendingCandidates.current = [];
      
      // Clear stored offer data
      window.incomingOffer = null;
      window.incomingFrom = null;
      
      console.log('✅ Call ended and cleaned up');
    } catch (error) {
      console.error('❌ Error during call cleanup:', error);
    }
  };

  // Decline incoming call
  const declineCall = () => {
    console.log('📴 Declining incoming call...');
    
    // Send decline signal
    if (window.incomingFrom) {
      sendSignal({ type: 'end' });
    }
    
    // Reset state
    setIncomingCall(false);
    window.incomingOffer = null;
    window.incomingFrom = null;
    pendingCandidates.current = [];
    
    console.log('✅ Call declined');
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
          <div className="bg-white rounded-lg p-6 text-center shadow-2xl">
            <Phone className="h-16 w-16 mx-auto mb-4 text-green-600 animate-bounce" />
            <h2 className="text-xl font-bold mb-2">Incoming Call</h2>
            <p className="text-gray-600 mb-6">from {window.incomingFrom}</p>
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={declineCall} 
                variant="outline" 
                className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
              >
                <PhoneOff className="h-4 w-4 mr-2" />
                Decline
              </Button>
              <Button 
                onClick={acceptCall} 
                className="bg-green-600 hover:bg-green-700"
              >
                <Phone className="h-4 w-4 mr-2" />
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

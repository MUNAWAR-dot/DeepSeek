import { Platform } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { v4 as uuidv4 } from 'uuid';
import {
  emitCallInitiate,
  emitCallAccept,
  emitCallReject,
  emitCallEnd,
  emitIceCandidate,
} from './socket';
import useStore from '../store/store';

class CallService {
  constructor() {
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.agoraEngine = null;
    this.currentCallId = null;
    this.callTimerInterval = null;
  }

  // Initialize WebRTC or Agora
  async initializeCallEngine() {
    try {
      // Using Agora for production-quality calls
      // You can replace with WebRTC if preferred
      const AgoraUIKit = require('agora-rn-uikit');
      
      const agoraConfig = {
        appId: process.env.AGORA_APP_ID,
        token: null, // You'll generate this on your server
      };

      return agoraConfig;
    } catch (error) {
      console.error('Initialize call engine failed:', error);
      throw error;
    }
  }

  // Initiate a call
  async initiateCall(targetUserId, callType = 'voice') {
    try {
      const userId = auth().currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      const callId = uuidv4();
      this.currentCallId = callId;

      const callData = {
        id: callId,
        callerId: userId,
        receiverId: targetUserId,
        type: callType,
        status: 'initiating',
        startTime: firestore.FieldValue.serverTimestamp(),
        endTime: null,
        duration: 0,
        isVideo: callType === 'video',
      };

      // Save call to Firestore
      await firestore().collection('calls').doc(callId).set(callData);

      // Emit call via socket
      emitCallInitiate(callData);

      // Update store
      const store = useStore.getState();
      store.setActiveCall({
        ...callData,
        startTime: new Date().toISOString(),
      });
      store.addCall(callData);

      return callData;
    } catch (error) {
      console.error('Initiate call failed:', error);
      throw error;
    }
  }

  // Accept incoming call
  async acceptCall(callId) {
    try {
      const callRef = firestore().collection('calls').doc(callId);
      const callDoc = await callRef.get();

      if (!callDoc.exists) throw new Error('Call not found');

      const callData = callDoc.data();

      await callRef.update({
        status: 'ongoing',
        startTime: firestore.FieldValue.serverTimestamp(),
      });

      // Emit call acceptance via socket
      emitCallAccept(callId);

      // Update store
      const store = useStore.getState();
      store.setActiveCall({
        ...callData,
        status: 'ongoing',
        startTime: new Date().toISOString(),
      });
      store.setIncomingCall(null);
      store.startCallTimer();

      return callData;
    } catch (error) {
      console.error('Accept call failed:', error);
      throw error;
    }
  }

  // Reject incoming call
  async rejectCall(callId) {
    try {
      const callRef = firestore().collection('calls').doc(callId);
      
      await callRef.update({
        status: 'rejected',
        endTime: firestore.FieldValue.serverTimestamp(),
      });

      // Emit call rejection via socket
      emitCallReject(callId);

      // Update store
      const store = useStore.getState();
      store.setIncomingCall(null);
      store.updateCall(callId, {
        status: 'rejected',
        endTime: new Date().toISOString(),
      });

      return true;
    } catch (error) {
      console.error('Reject call failed:', error);
      throw error;
    }
  }

  // End ongoing call
  async endCall(callId, duration = 0) {
    try {
      const callRef = firestore().collection('calls').doc(callId);
      
      await callRef.update({
        status: 'ended',
        endTime: firestore.FieldValue.serverTimestamp(),
        duration,
      });

      // Emit call end via socket
      emitCallEnd(callId);

      // Stop call timer
      const store = useStore.getState();
      store.stopCallTimer();
      store.endCall();
      store.updateCall(callId, {
        status: 'ended',
        endTime: new Date().toISOString(),
        duration,
      });

      // Clean up
      this.cleanupCall();

      return true;
    } catch (error) {
      console.error('End call failed:', error);
      throw error;
    }
  }

  // Handle missed call
  async handleMissedCall(callId) {
    try {
      const callRef = firestore().collection('calls').doc(callId);
      
      await callRef.update({
        status: 'missed',
        endTime: firestore.FieldValue.serverTimestamp(),
      });

      const store = useStore.getState();
      store.setIncomingCall(null);
      store.updateCall(callId, {
        status: 'missed',
        endTime: new Date().toISOString(),
      });

      return true;
    } catch (error) {
      console.error('Handle missed call failed:', error);
      throw error;
    }
  }

  // Get call history
  async getCallHistory(userId = null) {
    try {
      const currentUserId = userId || auth().currentUser?.uid;
      if (!currentUserId) throw new Error('User not authenticated');

      const snapshot = await firestore()
        .collection('calls')
        .where('participants', 'array-contains', currentUserId)
        .orderBy('startTime', 'desc')
        .limit(50)
        .get();

      const calls = [];
      snapshot.forEach((doc) => {
        calls.push({ id: doc.id, ...doc.data() });
      });

      return calls;
    } catch (error) {
      console.error('Get call history failed:', error);
      throw error;
    }
  }

  // Get call token from server (for Agora)
  async getCallToken(channelName) {
    try {
      const response = await fetch(
        `${process.env.API_URL}/calls/token?channel=${channelName}`,
        {
          headers: {
            Authorization: `Bearer ${auth().currentUser?.getIdToken()}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to get call token');
      
      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error('Get call token failed:', error);
      throw error;
    }
  }

  // Toggle speaker
  toggleSpeaker() {
    const store = useStore.getState();
    store.toggleSpeaker();
    
    // Here you would toggle the actual audio output
    // For Agora: this.agoraEngine?.setEnableSpeakerphone(!store.callConfig.speakerEnabled);
  }

  // Toggle microphone
  toggleMicrophone() {
    const store = useStore.getState();
    store.toggleMicrophone();
    
    // Mute/unmute local audio
    // For Agora: this.agoraEngine?.muteLocalAudioStream(!store.callConfig.microphoneEnabled);
  }

  // Toggle camera (video calls)
  toggleCamera() {
    const store = useStore.getState();
    store.toggleCamera();
    
    // Enable/disable local video
    // For Agora: this.agoraEngine?.muteLocalVideoStream(!store.callConfig.cameraEnabled);
  }

  // Switch camera (front/back)
  switchCamera() {
    const store = useStore.getState();
    store.switchCamera();
    
    // Switch camera
    // For Agora: this.agoraEngine?.switchCamera();
  }

  // Clean up call resources
  cleanupCall() {
    // Stop all tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach((track) => track.stop());
      this.remoteStream = null;
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    // Leave Agora channel
    if (this.agoraEngine) {
      this.agoraEngine.leaveChannel();
      this.agoraEngine = null;
    }

    this.currentCallId = null;
  }

  // Subscribe to call updates
  subscribeToCall(callId, callback) {
    return firestore()
      .collection('calls')
      .doc(callId)
      .onSnapshot(
        (doc) => {
          if (doc.exists) {
            callback({ id: doc.id, ...doc.data() });
          }
        },
        (error) => {
          console.error('Call subscription error:', error);
        }
      );
  }

  // Subscribe to all calls
  subscribeToCalls(callback) {
    const userId = auth().currentUser?.uid;
    if (!userId) return () => {};

    return firestore()
      .collection('calls')
      .where('participants', 'array-contains', userId)
      .orderBy('startTime', 'desc')
      .onSnapshot(
        (snapshot) => {
          const calls = [];
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added' || change.type === 'modified') {
              const index = calls.findIndex((c) => c.id === change.doc.id);
              const callData = { id: change.doc.id, ...change.doc.data() };
              if (index !== -1) {
                calls[index] = callData;
              } else {
                calls.push(callData);
              }
            } else if (change.type === 'removed') {
              const index = calls.findIndex((c) => c.id === change.doc.id);
              if (index !== -1) {
                calls.splice(index, 1);
              }
            }
          });

          // Sort by start time
          calls.sort(
            (a, b) =>
              (b.startTime?.toMillis() || 0) - (a.startTime?.toMillis() || 0)
          );

          callback(calls);
        },
        (error) => {
          console.error('Calls subscription error:', error);
          callback([]);
        }
      );
  }
}

export default new CallService();

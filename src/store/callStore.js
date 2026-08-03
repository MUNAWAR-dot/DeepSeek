const callStore = (set, get) => ({
  // Call State
  calls: [],
  activeCall: null,
  incomingCall: null,
  callLoading: false,
  callError: null,

  // Call Configuration
  callConfig: {
    speakerEnabled: false,
    microphoneEnabled: true,
    cameraEnabled: true,
    frontCamera: true,
  },

  // Call Timer
  callTimer: 0,
  callTimerInterval: null,

  // Actions
  setCalls: (calls) =>
    set({
      calls,
      callLoading: false,
    }),

  setCallLoading: (callLoading) => set({ callLoading }),

  setCallError: (callError) =>
    set({
      callError,
      callLoading: false,
    }),

  setActiveCall: (activeCall) => set({ activeCall }),

  setIncomingCall: (incomingCall) => set({ incomingCall }),

  updateCallConfig: (updates) =>
    set((state) => ({
      callConfig: { ...state.callConfig, ...updates },
    })),

  toggleSpeaker: () =>
    set((state) => ({
      callConfig: {
        ...state.callConfig,
        speakerEnabled: !state.callConfig.speakerEnabled,
      },
    })),

  toggleMicrophone: () =>
    set((state) => ({
      callConfig: {
        ...state.callConfig,
        microphoneEnabled: !state.callConfig.microphoneEnabled,
      },
    })),

  toggleCamera: () =>
    set((state) => ({
      callConfig: {
        ...state.callConfig,
        cameraEnabled: !state.callConfig.cameraEnabled,
      },
    })),

  switchCamera: () =>
    set((state) => ({
      callConfig: {
        ...state.callConfig,
        frontCamera: !state.callConfig.frontCamera,
      },
    })),

  startCallTimer: () => {
    const interval = setInterval(() => {
      set((state) => ({
        callTimer: state.callTimer + 1,
      }));
    }, 1000);
    set({ callTimer: 0, callTimerInterval: interval });
  },

  stopCallTimer: () => {
    const state = get();
    if (state.callTimerInterval) {
      clearInterval(state.callTimerInterval);
    }
    set({ callTimerInterval: null });
  },

  endCall: () => {
    const state = get();
    if (state.callTimerInterval) {
      clearInterval(state.callTimerInterval);
    }
    set({
      activeCall: null,
      callTimer: 0,
      callTimerInterval: null,
      callConfig: {
        speakerEnabled: false,
        microphoneEnabled: true,
        cameraEnabled: true,
        frontCamera: true,
      },
    });
  },

  addCall: (call) =>
    set((state) => ({
      calls: [call, ...state.calls],
    })),

  updateCall: (callId, updates) =>
    set((state) => ({
      calls: state.calls.map((call) =>
        call.id === callId ? { ...call, ...updates } : call
      ),
    })),

  clearCalls: () =>
    set({
      calls: [],
      activeCall: null,
      incomingCall: null,
      callTimer: 0,
      callTimerInterval: null,
    }),
});

export default callStore;

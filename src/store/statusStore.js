const statusStore = (set, get) => ({
  // Status State
  statuses: [],
  myStatuses: [],
  viewedStatuses: [],
  statusLoading: false,
  statusError: null,

  // Status Viewer State
  statusViewers: {},
  currentViewingStatus: null,

  // Actions
  setStatuses: (statuses) =>
    set({
      statuses,
      statusLoading: false,
    }),

  setMyStatuses: (myStatuses) => set({ myStatuses }),

  setViewedStatuses: (viewedStatuses) => set({ viewedStatuses }),

  setStatusLoading: (statusLoading) => set({ statusLoading }),

  setStatusError: (statusError) =>
    set({
      statusError,
      statusLoading: false,
    }),

  addStatus: (status) =>
    set((state) => ({
      myStatuses: [...state.myStatuses, status],
    })),

  removeStatus: (statusId) =>
    set((state) => ({
      myStatuses: state.myStatuses.filter((s) => s.id !== statusId),
      statuses: state.statuses.filter((s) => s.id !== statusId),
    })),

  markStatusAsViewed: (statusId, userId) =>
    set((state) => ({
      viewedStatuses: [...new Set([...state.viewedStatuses, statusId])],
      statusViewers: {
        ...state.statusViewers,
        [statusId]: [
          ...(state.statusViewers[statusId] || []),
          {
            userId,
            viewedAt: new Date().toISOString(),
          },
        ],
      },
    })),

  setCurrentViewingStatus: (currentViewingStatus) =>
    set({ currentViewingStatus }),

  updateStatusPrivacy: (privacy) =>
    set((state) => ({
      myStatuses: state.myStatuses.map((status) => ({
        ...status,
        privacy,
      })),
    })),

  clearStatuses: () =>
    set({
      statuses: [],
      myStatuses: [],
      viewedStatuses: [],
      statusViewers: {},
      currentViewingStatus: null,
    }),
});

export default statusStore;

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

interface OfflineAction {
  action: any;
  timestamp: number;
  attempts?: number;
}

interface OfflineState {
  isOnline: boolean;
  pendingActions: OfflineAction[];
  lastSyncTimestamp: number | null;
}

const initialState: OfflineState = {
  isOnline: true,
  pendingActions: [],
  lastSyncTimestamp: null,
};

// Thunk to sync offline data when back online
export const syncOfflineData = createAsyncThunk(
  'offline/syncData',
  async (_, { getState, dispatch }) => {
    const state = getState() as RootState;
    const { pendingActions } = state.offline;
    
    // Process each pending action
    const results = [];
    for (const pendingAction of pendingActions) {
      try {
        // Dispatch the original action
        const result = await dispatch(pendingAction.action).unwrap();
        results.push({ success: true, action: pendingAction.action, result });
      } catch (error) {
        results.push({ success: false, action: pendingAction.action, error });
      }
    }
    
    return results;
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as RootState;
      return state.offline.isOnline && state.offline.pendingActions.length > 0;
    },
  }
);

const offlineSlice = createSlice({
  name: 'offline',
  initialState,
  reducers: {
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    markOfflineAction: (state, action: PayloadAction<OfflineAction>) => {
      state.pendingActions.push({
        ...action.payload,
        attempts: 0,
      });
    },
    removePendingAction: (state, action: PayloadAction<{ id: number }>) => {
      state.pendingActions = state.pendingActions.filter(
        (_, index) => index !== action.payload.id
      );
    },
    clearPendingActions: (state) => {
      state.pendingActions = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(syncOfflineData.fulfilled, (state, action) => {
      // Remove successful actions from pending list
      const successfulActionIndexes = action.payload
        .filter(result => result.success)
        .map(result => {
          return state.pendingActions.findIndex(
            pa => pa.action.type === result.action.type
          );
        })
        .filter(index => index !== -1);
      
      state.pendingActions = state.pendingActions.filter(
        (_, index) => !successfulActionIndexes.includes(index)
      );
      
      state.lastSyncTimestamp = Date.now();
    });
  },
});

export const {
  setOnlineStatus,
  markOfflineAction,
  removePendingAction,
  clearPendingActions,
} = offlineSlice.actions;

export default offlineSlice.reducer;

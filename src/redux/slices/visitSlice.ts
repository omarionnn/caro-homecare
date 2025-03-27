import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/apiService';
import { ENDPOINTS } from '../../constants/apiConstants';
import { VISIT_STATUS } from '../../constants/appConstants';

// Types
export interface VisitLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

export interface VisitDocument {
  id: string;
  type: string; // text, image, audio, form, signature
  content: string;
  createdAt: number;
}

export interface Visit {
  id: string;
  patientId: string;
  caregiverId: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  status: string;
  tasks: string[];
  notes?: string;
  clockInLocation?: VisitLocation;
  clockOutLocation?: VisitLocation;
  documents: VisitDocument[];
  isOffline?: boolean;
}

interface VisitState {
  entities: Record<string, Visit>;
  activeVisit: string | null;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: VisitState = {
  entities: {},
  activeVisit: null,
  loading: false,
  error: null,
};

// Thunks
export const fetchVisits = createAsyncThunk(
  'visits/fetchVisits',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get(ENDPOINTS.VISITS.GET_ALL);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch visits');
    }
  },
  {
    // This action can be processed offline
    condition: (_, { getState }) => {
      // Only fetch if we have a network connection
      const { offline } = getState() as { offline: { isOnline: boolean } };
      return offline.isOnline;
    },
  }
);

export const fetchVisitById = createAsyncThunk(
  'visits/fetchVisitById',
  async (visitId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.get(ENDPOINTS.VISITS.GET_BY_ID.replace(':id', visitId));
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch visit');
    }
  }
);

export const clockIn = createAsyncThunk(
  'visits/clockIn',
  async ({ visitId, location }: { visitId: string; location: VisitLocation }, { rejectWithValue }) => {
    try {
      const response = await apiService.post(
        ENDPOINTS.VISITS.CLOCK_IN.replace(':id', visitId),
        { location }
      );
      return { visitId, data: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Clock in failed');
    }
  },
  {
    // This action can be processed offline
    meta: {
      processOffline: true,
    },
  }
);

export const clockOut = createAsyncThunk(
  'visits/clockOut',
  async ({ visitId, location }: { visitId: string; location: VisitLocation }, { rejectWithValue }) => {
    try {
      const response = await apiService.post(
        ENDPOINTS.VISITS.CLOCK_OUT.replace(':id', visitId),
        { location }
      );
      return { visitId, data: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Clock out failed');
    }
  },
  {
    // This action can be processed offline
    meta: {
      processOffline: true,
    },
  }
);

export const addVisitDocument = createAsyncThunk(
  'visits/addVisitDocument',
  async ({ visitId, document }: { visitId: string; document: Omit<VisitDocument, 'id'> }, { rejectWithValue }) => {
    try {
      const response = await apiService.post(
        `${ENDPOINTS.VISITS.GET_BY_ID.replace(':id', visitId)}/documents`,
        document
      );
      return { visitId, document: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add document');
    }
  },
  {
    // This action can be processed offline
    meta: {
      processOffline: true,
    },
  }
);

// Slice
const visitSlice = createSlice({
  name: 'visits',
  initialState,
  reducers: {
    setActiveVisit: (state, action: PayloadAction<string>) => {
      state.activeVisit = action.payload;
    },
    clearActiveVisit: (state) => {
      state.activeVisit = null;
    },
    addOfflineVisit: (state, action: PayloadAction<Visit>) => {
      const visit = { ...action.payload, isOffline: true };
      state.entities[visit.id] = visit;
    },
    updateVisitOfflineStatus: (state, action: PayloadAction<{ id: string; isOffline: boolean }>) => {
      const { id, isOffline } = action.payload;
      if (state.entities[id]) {
        state.entities[id].isOffline = isOffline;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch all visits
    builder.addCase(fetchVisits.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchVisits.fulfilled, (state, action) => {
      state.loading = false;
      // Convert array to object with ID as key
      const visits = action.payload.reduce((acc: Record<string, Visit>, visit: Visit) => {
        acc[visit.id] = visit;
        return acc;
      }, {});
      state.entities = { ...state.entities, ...visits };
    });
    builder.addCase(fetchVisits.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch visit by ID
    builder.addCase(fetchVisitById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchVisitById.fulfilled, (state, action) => {
      state.loading = false;
      state.entities[action.payload.id] = action.payload;
    });
    builder.addCase(fetchVisitById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Clock in
    builder.addCase(clockIn.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(clockIn.fulfilled, (state, action) => {
      state.loading = false;
      const { visitId, data } = action.payload;
      state.entities[visitId] = {
        ...state.entities[visitId],
        ...data,
        status: VISIT_STATUS.IN_PROGRESS,
      };
    });
    builder.addCase(clockIn.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Clock out
    builder.addCase(clockOut.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(clockOut.fulfilled, (state, action) => {
      state.loading = false;
      const { visitId, data } = action.payload;
      state.entities[visitId] = {
        ...state.entities[visitId],
        ...data,
        status: VISIT_STATUS.COMPLETED,
      };
      // Clear active visit if it's the one we just completed
      if (state.activeVisit === visitId) {
        state.activeVisit = null;
      }
    });
    builder.addCase(clockOut.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Add visit document
    builder.addCase(addVisitDocument.fulfilled, (state, action) => {
      const { visitId, document } = action.payload;
      if (state.entities[visitId]) {
        state.entities[visitId].documents.push(document);
      }
    });
  },
});

export const {
  setActiveVisit,
  clearActiveVisit,
  addOfflineVisit,
  updateVisitOfflineStatus,
} = visitSlice.actions;

export default visitSlice.reducer;

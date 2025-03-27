import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/apiService';
import { ENDPOINTS } from '../../constants/apiConstants';
import { SHIFT_REQUEST_STATUS } from '../../constants/appConstants';

// Types
export interface Schedule {
  id: string;
  caregiverId: string;
  patientId: string;
  startTime: string;
  endTime: string;
  status: string; // scheduled, pending, completed, cancelled
  recurring?: boolean;
  recurrencePattern?: string; // daily, weekly, bi-weekly, monthly
  tasks: string[];
  notes?: string;
}

export interface AvailableShift {
  id: string;
  patientId: string;
  startTime: string;
  endTime: string;
  taskDescription: string;
  requiredSkills: string[];
  status: string;
  notes?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
}

export interface ShiftRequest {
  id: string;
  shiftId: string;
  caregiverId: string;
  requestTime: string;
  status: string; // pending, approved, rejected, cancelled
  notes?: string;
}

interface ScheduleState {
  schedules: Record<string, Schedule>;
  availableShifts: Record<string, AvailableShift>;
  shiftRequests: Record<string, ShiftRequest>;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: ScheduleState = {
  schedules: {},
  availableShifts: {},
  shiftRequests: {},
  loading: false,
  error: null,
};

// Thunks
export const fetchSchedules = createAsyncThunk(
  'schedules/fetchSchedules',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get(ENDPOINTS.SCHEDULES.GET_ALL);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch schedules');
    }
  }
);

export const fetchAvailableShifts = createAsyncThunk(
  'schedules/fetchAvailableShifts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get(ENDPOINTS.SCHEDULES.AVAILABLE_SHIFTS);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch available shifts');
    }
  }
);

export const requestShift = createAsyncThunk(
  'schedules/requestShift',
  async (shiftId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.post(ENDPOINTS.SCHEDULES.REQUEST_SHIFT, { shiftId });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to request shift');
    }
  }
);

export const cancelShiftRequest = createAsyncThunk(
  'schedules/cancelShiftRequest',
  async (requestId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.post(`${ENDPOINTS.SCHEDULES.REQUEST_SHIFT}/${requestId}/cancel`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel shift request');
    }
  }
);

// Slice
const scheduleSlice = createSlice({
  name: 'schedules',
  initialState,
  reducers: {
    updateScheduleNotes: (state, action: PayloadAction<{ scheduleId: string; notes: string }>) => {
      const { scheduleId, notes } = action.payload;
      if (state.schedules[scheduleId]) {
        state.schedules[scheduleId].notes = notes;
      }
    },
    clearSchedules: (state) => {
      state.schedules = {};
    },
    clearAvailableShifts: (state) => {
      state.availableShifts = {};
    },
  },
  extraReducers: (builder) => {
    // Fetch all schedules
    builder.addCase(fetchSchedules.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchSchedules.fulfilled, (state, action) => {
      state.loading = false;
      // Convert array to object with ID as key
      const schedules = action.payload.reduce((acc: Record<string, Schedule>, schedule: Schedule) => {
        acc[schedule.id] = schedule;
        return acc;
      }, {});
      state.schedules = schedules;
    });
    builder.addCase(fetchSchedules.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch available shifts
    builder.addCase(fetchAvailableShifts.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAvailableShifts.fulfilled, (state, action) => {
      state.loading = false;
      // Convert array to object with ID as key
      const shifts = action.payload.reduce((acc: Record<string, AvailableShift>, shift: AvailableShift) => {
        acc[shift.id] = shift;
        return acc;
      }, {});
      state.availableShifts = shifts;
    });
    builder.addCase(fetchAvailableShifts.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Request shift
    builder.addCase(requestShift.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(requestShift.fulfilled, (state, action) => {
      state.loading = false;
      const request = action.payload;
      state.shiftRequests[request.id] = request;
    });
    builder.addCase(requestShift.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Cancel shift request
    builder.addCase(cancelShiftRequest.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(cancelShiftRequest.fulfilled, (state, action) => {
      state.loading = false;
      const request = action.payload;
      if (state.shiftRequests[request.id]) {
        state.shiftRequests[request.id].status = SHIFT_REQUEST_STATUS.CANCELLED;
      }
    });
    builder.addCase(cancelShiftRequest.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const {
  updateScheduleNotes,
  clearSchedules,
  clearAvailableShifts,
} = scheduleSlice.actions;

export default scheduleSlice.reducer;

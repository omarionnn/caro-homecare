import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/apiService';
import { ENDPOINTS } from '../../constants/apiConstants';

// Types
export interface MedicalCondition {
  id: string;
  name: string;
  description?: string;
  diagnosisDate?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  instructions?: string;
  startDate?: string;
}

export interface Allergy {
  id: string;
  name: string;
  severity: string; // mild, moderate, severe
  reaction?: string;
}

export interface CarePlan {
  id: string;
  goals: string[];
  instructions: string;
  specialNotes?: string;
  lastUpdated: string;
}

export interface ContactPerson {
  id: string;
  relationship: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  isEmergencyContact: boolean;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  phone: string;
  email?: string;
  preferredLanguage?: string;
  medicalConditions: MedicalCondition[];
  medications: Medication[];
  allergies: Allergy[];
  carePlan: CarePlan;
  contactPersons: ContactPerson[];
  notes?: string;
}

interface PatientState {
  entities: Record<string, Patient>;
  selectedPatient: string | null;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: PatientState = {
  entities: {},
  selectedPatient: null,
  loading: false,
  error: null,
};

// Thunks
export const fetchPatients = createAsyncThunk(
  'patients/fetchPatients',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get(ENDPOINTS.PATIENTS.GET_ALL);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch patients');
    }
  }
);

export const fetchPatientById = createAsyncThunk(
  'patients/fetchPatientById',
  async (patientId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.get(ENDPOINTS.PATIENTS.GET_BY_ID.replace(':id', patientId));
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch patient');
    }
  }
);

// Slice
const patientSlice = createSlice({
  name: 'patients',
  initialState,
  reducers: {
    setSelectedPatient: (state, action: PayloadAction<string>) => {
      state.selectedPatient = action.payload;
    },
    clearSelectedPatient: (state) => {
      state.selectedPatient = null;
    },
    updatePatientNotes: (state, action: PayloadAction<{ patientId: string; notes: string }>) => {
      const { patientId, notes } = action.payload;
      if (state.entities[patientId]) {
        state.entities[patientId].notes = notes;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch all patients
    builder.addCase(fetchPatients.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchPatients.fulfilled, (state, action) => {
      state.loading = false;
      // Convert array to object with ID as key
      const patients = action.payload.reduce((acc: Record<string, Patient>, patient: Patient) => {
        acc[patient.id] = patient;
        return acc;
      }, {});
      state.entities = patients;
    });
    builder.addCase(fetchPatients.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch patient by ID
    builder.addCase(fetchPatientById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchPatientById.fulfilled, (state, action) => {
      state.loading = false;
      state.entities[action.payload.id] = action.payload;
      state.selectedPatient = action.payload.id;
    });
    builder.addCase(fetchPatientById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const {
  setSelectedPatient,
  clearSelectedPatient,
  updatePatientNotes,
} = patientSlice.actions;

export default patientSlice.reducer;

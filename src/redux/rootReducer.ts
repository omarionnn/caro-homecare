import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import visitReducer from './slices/visitSlice';
import scheduleReducer from './slices/scheduleSlice';
import patientReducer from './slices/patientSlice';
import messageReducer from './slices/messageSlice';
import offlineReducer from './slices/offlineSlice';
import settingsReducer from './slices/settingsSlice';

export const rootReducer = combineReducers({
  auth: authReducer,
  visits: visitReducer,
  schedules: scheduleReducer,
  patients: patientReducer,
  messages: messageReducer,
  offline: offlineReducer,
  settings: settingsReducer,
});

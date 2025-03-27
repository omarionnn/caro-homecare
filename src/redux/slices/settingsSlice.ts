import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '../../constants/appConstants';

interface SettingsState {
  language: string;
  darkMode: boolean;
  pushNotifications: boolean;
  locationPermissionRequested: boolean;
  cameraPermissionRequested: boolean;
  microphonePermissionRequested: boolean;
  notificationPermissionRequested: boolean;
  autoClockOutEnabled: boolean;
  autoClockOutWarningMinutes: number;
}

const initialState: SettingsState = {
  language: DEFAULT_LANGUAGE,
  darkMode: false,
  pushNotifications: true,
  locationPermissionRequested: false,
  cameraPermissionRequested: false,
  microphonePermissionRequested: false,
  notificationPermissionRequested: false,
  autoClockOutEnabled: true,
  autoClockOutWarningMinutes: 10,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<string>) => {
      // Validate language is supported
      const supportedLanguagesValues = Object.values(SUPPORTED_LANGUAGES);
      if (supportedLanguagesValues.includes(action.payload)) {
        state.language = action.payload;
      }
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
    },
    togglePushNotifications: (state) => {
      state.pushNotifications = !state.pushNotifications;
    },
    setPushNotifications: (state, action: PayloadAction<boolean>) => {
      state.pushNotifications = action.payload;
    },
    setLocationPermissionRequested: (state, action: PayloadAction<boolean>) => {
      state.locationPermissionRequested = action.payload;
    },
    setCameraPermissionRequested: (state, action: PayloadAction<boolean>) => {
      state.cameraPermissionRequested = action.payload;
    },
    setMicrophonePermissionRequested: (state, action: PayloadAction<boolean>) => {
      state.microphonePermissionRequested = action.payload;
    },
    setNotificationPermissionRequested: (state, action: PayloadAction<boolean>) => {
      state.notificationPermissionRequested = action.payload;
    },
    toggleAutoClockOut: (state) => {
      state.autoClockOutEnabled = !state.autoClockOutEnabled;
    },
    setAutoClockOutWarningMinutes: (state, action: PayloadAction<number>) => {
      state.autoClockOutWarningMinutes = action.payload;
    },
    resetSettings: () => initialState,
  },
});

export const {
  setLanguage,
  toggleDarkMode,
  setDarkMode,
  togglePushNotifications,
  setPushNotifications,
  setLocationPermissionRequested,
  setCameraPermissionRequested,
  setMicrophonePermissionRequested,
  setNotificationPermissionRequested,
  toggleAutoClockOut,
  setAutoClockOutWarningMinutes,
  resetSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;

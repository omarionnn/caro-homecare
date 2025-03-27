// App-wide constants

// Supported languages
export const SUPPORTED_LANGUAGES = {
  ENGLISH: 'en',
  SPANISH: 'es',
  FRENCH: 'fr',
  CHINESE: 'zh',
  VIETNAMESE: 'vi'
};

// Default language
export const DEFAULT_LANGUAGE = SUPPORTED_LANGUAGES.ENGLISH;

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  LANGUAGE: 'language',
  DARK_MODE: 'dark_mode',
  OFFLINE_DATA: 'offline_data',
  LOCATION_PERMISSIONS: 'location_permissions'
};

// App-wide timeouts (milliseconds)
export const TIMEOUTS = {
  LOCATION_UPDATE: 60000, // 1 minute
  SESSION_EXPIRY: 3600000, // 1 hour
  SYNC_INTERVAL: 300000, // 5 minutes
  INACTIVITY: 1800000 // 30 minutes
};

// Location accuracy settings
export const LOCATION = {
  HIGH_ACCURACY: true,
  DISTANCE_FILTER: 10, // meters
  TIMEOUT: 15000, // milliseconds
  MAXIMUM_AGE: 10000, // milliseconds
  SIGNIFICANT_CHANGE: 50 // meters
};

// Visit status
export const VISIT_STATUS = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  MISSED: 'missed',
  CANCELLED: 'cancelled',
  RESCHEDULED: 'rescheduled'
};

// Shift request status
export const SHIFT_REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
};

// Message priority
export const MESSAGE_PRIORITY = {
  URGENT: 'urgent',
  HIGH: 'high',
  NORMAL: 'normal',
  LOW: 'low'
};

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  SUPERVISOR: 'supervisor',
  CAREGIVER: 'caregiver',
  PATIENT: 'patient',
  FAMILY: 'family'
};

// Documentation types
export const DOCUMENTATION_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  AUDIO: 'audio',
  FORM: 'form',
  SIGNATURE: 'signature'
};

// App routes
export const ROUTES = {
  AUTH: {
    LOGIN: 'Login',
    REGISTER: 'Register',
    FORGOT_PASSWORD: 'ForgotPassword'
  },
  MAIN: {
    HOME: 'Home',
    SCHEDULE: 'Schedule',
    PATIENTS: 'Patients',
    VISITS: 'Visits',
    MESSAGES: 'Messages',
    PROFILE: 'Profile'
  },
  VISITS: {
    VISIT_DETAILS: 'VisitDetails',
    CLOCK_IN: 'ClockIn',
    CLOCK_OUT: 'ClockOut',
    DOCUMENTATION: 'Documentation',
    VISIT_HISTORY: 'VisitHistory'
  },
  PATIENTS: {
    PATIENT_DETAILS: 'PatientDetails',
    CARE_PLAN: 'CarePlan',
    HEALTH_METRICS: 'HealthMetrics',
    MEDICAL_HISTORY: 'MedicalHistory'
  },
  SCHEDULE: {
    CALENDAR: 'Calendar',
    SHIFT_MARKETPLACE: 'ShiftMarketplace',
    AVAILABILITY: 'Availability'
  },
  MESSAGES: {
    INBOX: 'Inbox',
    CONVERSATION: 'Conversation',
    NEW_MESSAGE: 'NewMessage'
  }
};

// Environment
export const IS_DEV = __DEV__;

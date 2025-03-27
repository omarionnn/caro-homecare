export const API_BASE_URL = 'https://api.example.com';

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH_TOKEN: '/auth/refresh',
    PASSWORD_RESET: '/auth/password-reset'
  },
  VISITS: {
    GET_ALL: '/visits',
    GET_BY_ID: '/visits/:id',
    CREATE: '/visits',
    UPDATE: '/visits/:id',
    DELETE: '/visits/:id',
    CLOCK_IN: '/visits/:id/clock-in',
    CLOCK_OUT: '/visits/:id/clock-out'
  },
  PATIENTS: {
    GET_ALL: '/patients',
    GET_BY_ID: '/patients/:id',
    CREATE: '/patients',
    UPDATE: '/patients/:id',
    DELETE: '/patients/:id'
  },
  SCHEDULES: {
    GET_ALL: '/schedules',
    GET_BY_ID: '/schedules/:id',
    CREATE: '/schedules',
    UPDATE: '/schedules/:id',
    DELETE: '/schedules/:id',
    AVAILABLE_SHIFTS: '/schedules/available-shifts',
    REQUEST_SHIFT: '/schedules/request-shift'
  },
  MESSAGES: {
    GET_ALL: '/messages',
    GET_BY_ID: '/messages/:id',
    CREATE: '/messages',
    UPDATE: '/messages/:id',
    DELETE: '/messages/:id',
    MARK_READ: '/messages/:id/read'
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    AVAILABILITY: '/user/availability',
    UPDATE_AVAILABILITY: '/user/availability'
  }
};

export const API_TIMEOUT = 30000; // 30 seconds

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500
};

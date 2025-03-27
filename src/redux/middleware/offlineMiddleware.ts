import { Middleware } from 'redux';
import { netInfoService } from '../../services/netInfoService';
import { markOfflineAction, syncOfflineData } from '../slices/offlineSlice';

/**
 * Middleware to handle offline actions
 * - Marks actions as offline when device is offline
 * - Triggers sync when connection is restored
 */
export const offlineMiddleware: Middleware = (store) => (next) => async (action) => {
  // Check if action is marked to be processed when offline
  if (action.meta?.processOffline) {
    const isConnected = await netInfoService.isConnected();

    if (!isConnected) {
      // Device is offline, mark the action for later processing
      store.dispatch(
        markOfflineAction({
          action,
          timestamp: Date.now(),
        })
      );
      
      // Don't process the action now
      return next({
        type: action.type + '_QUEUED',
        meta: {
          originalAction: action,
        },
      });
    }
  }

  // Continue with normal action processing
  return next(action);
};

/**
 * Function to setup offline sync handling
 * Should be called when the app initializes
 */
export const setupOfflineSync = (store: any) => {
  netInfoService.addConnectivityListener((isConnected) => {
    if (isConnected) {
      // Connection restored, sync offline data
      store.dispatch(syncOfflineData());
    }
  });
};

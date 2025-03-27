import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { setOnlineStatus } from '../redux/slices/offlineSlice';
import { netInfoService } from '../services/netInfoService';

const OfflineIndicator: React.FC = () => {
  const dispatch = useDispatch();
  const isOnline = useSelector((state: RootState) => state.offline.isOnline);
  const pendingActionsCount = useSelector(
    (state: RootState) => state.offline.pendingActions.length
  );
  
  const [slideAnim] = useState(new Animated.Value(-50));

  useEffect(() => {
    // Listen to connectivity changes
    const unsubscribe = netInfoService.addConnectivityListener(
      (connected) => {
        dispatch(setOnlineStatus(connected));
      }
    );

    // Initial connectivity check
    netInfoService.isConnected().then((connected) => {
      dispatch(setOnlineStatus(connected));
    });

    return () => {
      // Clean up listener on unmount
      netInfoService.removeConnectivityListener(unsubscribe);
    };
  }, [dispatch]);

  useEffect(() => {
    if (!isOnline || pendingActionsCount > 0) {
      // Slide in
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else {
      // Slide out
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 300,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [isOnline, pendingActionsCount, slideAnim]);

  if (isOnline && pendingActionsCount === 0) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }] },
        isOnline ? styles.syncContainer : styles.offlineContainer,
      ]}
    >
      <Text style={styles.text}>
        {!isOnline
          ? 'You are offline. Changes will be saved locally.'
          : `Syncing ${pendingActionsCount} pending ${pendingActionsCount === 1 ? 'change' : 'changes'}...`}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  offlineContainer: {
    backgroundColor: '#F44336',
  },
  syncContainer: {
    backgroundColor: '#FF9800',
  },
  text: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
});

export default OfflineIndicator;

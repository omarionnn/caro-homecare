import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { fetchSchedules } from '../../redux/slices/scheduleSlice';
import { ROUTES } from '../../constants/appConstants';
import Button from '../../components/Button';
import CalendarView from './components/CalendarView';
import UpcomingShifts from './components/UpcomingShifts';

interface ScheduleScreenProps {
  navigation: any;
}

type ScheduleTab = 'calendar' | 'upcomingShifts' | 'marketplace';

const ScheduleScreen: React.FC<ScheduleScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { schedules, loading, error } = useSelector(
    (state: RootState) => state.schedules
  );
  
  const [activeTab, setActiveTab] = useState<ScheduleTab>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadScheduleData();
  }, []);

  const loadScheduleData = async () => {
    try {
      await dispatch(fetchSchedules());
    } catch (error) {
      console.error('Error loading schedule data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadScheduleData();
    setRefreshing(false);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const navigateToAvailability = () => {
    navigation.navigate(ROUTES.SCHEDULE.AVAILABILITY);
  };

  const navigateToShiftMarketplace = () => {
    navigation.navigate(ROUTES.SCHEDULE.SHIFT_MARKETPLACE);
  };

  const renderTabContent = () => {
    if (loading && !refreshing && Object.keys(schedules).length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3F51B5" />
          <Text style={styles.loadingText}>Loading schedule...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button
            title="Retry"
            onPress={loadScheduleData}
            variant="primary"
            style={styles.retryButton}
          />
        </View>
      );
    }

    switch (activeTab) {
      case 'calendar':
        return (
          <CalendarView 
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            schedules={Object.values(schedules)}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        );
      case 'upcomingShifts':
        return (
          <UpcomingShifts
            schedules={Object.values(schedules)}
            refreshing={refreshing}
            onRefresh={onRefresh}
            navigation={navigation}
          />
        );
      case 'marketplace':
        return (
          <View style={styles.redirectContainer}>
            <Text style={styles.redirectText}>
              Explore available shifts that match your qualifications and availability.
            </Text>
            <Button
              title="Go to Shift Marketplace"
              onPress={navigateToShiftMarketplace}
              variant="primary"
              size="large"
              style={styles.redirectButton}
            />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Schedule</Text>
        <TouchableOpacity onPress={navigateToAvailability}>
          <Text style={styles.availabilityButton}>My Availability</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'calendar' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('calendar')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'calendar' && styles.activeTabText,
            ]}
          >
            Calendar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'upcomingShifts' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('upcomingShifts')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'upcomingShifts' && styles.activeTabText,
            ]}
          >
            My Shifts
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'marketplace' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('marketplace')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'marketplace' && styles.activeTabText,
            ]}
          >
            Marketplace
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {renderTabContent()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  availabilityButton: {
    fontSize: 14,
    color: '#3F51B5',
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3F51B5',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#757575',
  },
  activeTabText: {
    color: '#3F51B5',
  },
  content: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    width: 200,
  },
  redirectContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  redirectText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  redirectButton: {
    width: '100%',
  },
});

export default ScheduleScreen;
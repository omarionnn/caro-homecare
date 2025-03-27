import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { fetchVisits } from '../../redux/slices/visitSlice';
import { fetchSchedules } from '../../redux/slices/scheduleSlice';
import { fetchMessages } from '../../redux/slices/messageSlice';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { ROUTES, VISIT_STATUS } from '../../constants/appConstants';
import { formatDate, formatTime } from '../../utils/dateUtils';

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { entities: visits, activeVisit } = useSelector((state: RootState) => state.visits);
  const { schedules } = useSelector((state: RootState) => state.schedules);
  const { conversations } = useSelector((state: RootState) => state.messages);
  
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        dispatch(fetchVisits()),
        dispatch(fetchSchedules()),
        dispatch(fetchMessages()),
      ]);
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Get today's date for filtering
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Filter visits for today
  const todayVisits = Object.values(visits).filter(visit => {
    const visitDate = new Date(visit.scheduledStartTime);
    visitDate.setHours(0, 0, 0, 0);
    return visitDate.getTime() === today.getTime();
  });

  // Upcoming schedules (next 7 days)
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const upcomingSchedules = Object.values(schedules)
    .filter(schedule => {
      const scheduleDate = new Date(schedule.startTime);
      return scheduleDate >= today && scheduleDate <= nextWeek;
    })
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 3);

  // Unread message count
  const unreadCount = Object.values(conversations).reduce(
    (count, conversation) => count + conversation.unreadCount,
    0
  );

  const navigateToSchedule = () => {
    navigation.navigate(ROUTES.MAIN.SCHEDULE);
  };

  const navigateToVisits = () => {
    navigation.navigate(ROUTES.MAIN.VISITS);
  };

  const navigateToMessages = () => {
    navigation.navigate(ROUTES.MAIN.MESSAGES);
  };

  const navigateToVisitDetails = (visitId: string) => {
    navigation.navigate(ROUTES.VISITS.VISIT_DETAILS, { visitId });
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3F51B5" />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.greeting}>
          Hello, {user?.firstName || 'Caregiver'}!
        </Text>
        <Text style={styles.dateText}>{formatDate(new Date())}</Text>
      </View>

      {/* Active Visit Card */}
      {activeVisit && visits[activeVisit] && (
        <Card variant="filled" style={styles.activeVisitCard}>
          <View style={styles.activeVisitContent}>
            <View style={styles.activeVisitHeader}>
              <Text style={styles.activeVisitTitle}>Active Visit</Text>
              <View style={styles.activeVisitBadge}>
                <Text style={styles.activeVisitBadgeText}>IN PROGRESS</Text>
              </View>
            </View>

            <Text style={styles.patientName}>
              {visits[activeVisit].patientId}
            </Text>
            <Text style={styles.visitTime}>
              Started at {formatTime(visits[activeVisit].actualStartTime || '')}
            </Text>

            <Button
              title="Continue Visit"
              onPress={() => navigateToVisitDetails(activeVisit)}
              variant="primary"
              size="medium"
              style={styles.continueButton}
            />
          </View>
        </Card>
      )}

      {/* Today's Visits */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Today's Visits</Text>
        <TouchableOpacity onPress={navigateToVisits}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      {todayVisits.length > 0 ? (
        todayVisits.map((visit) => (
          <TouchableOpacity
            key={visit.id}
            onPress={() => navigateToVisitDetails(visit.id)}
            activeOpacity={0.7}
          >
            <Card variant="outlined" style={styles.visitCard}>
              <View style={styles.visitCardContent}>
                <View style={styles.visitCardHeader}>
                  <Text style={styles.visitPatientName}>
                    {visit.patientId}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      visit.status === VISIT_STATUS.COMPLETED
                        ? styles.completedBadge
                        : visit.status === VISIT_STATUS.IN_PROGRESS
                        ? styles.inProgressBadge
                        : styles.scheduledBadge,
                    ]}
                  >
                    <Text style={styles.statusText}>{visit.status}</Text>
                  </View>
                </View>

                <View style={styles.visitTimes}>
                  <Text style={styles.visitTimeText}>
                    {formatTime(visit.scheduledStartTime)} - {formatTime(visit.scheduledEndTime)}
                  </Text>
                </View>

                {visit.tasks && visit.tasks.length > 0 && (
                  <View style={styles.taskContainer}>
                    <Text style={styles.tasksLabel}>Tasks:</Text>
                    <Text style={styles.tasksText}>
                      {visit.tasks.slice(0, 2).join(', ')}
                      {visit.tasks.length > 2 ? '...' : ''}
                    </Text>
                  </View>
                )}
              </View>
            </Card>
          </TouchableOpacity>
        ))
      ) : (
        <Card variant="outlined" style={styles.emptyCard}>
          <Text style={styles.emptyText}>No visits scheduled for today</Text>
        </Card>
      )}

      {/* Upcoming Schedule */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Upcoming Schedule</Text>
        <TouchableOpacity onPress={navigateToSchedule}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      {upcomingSchedules.length > 0 ? (
        upcomingSchedules.map((schedule) => (
          <Card key={schedule.id} variant="outlined" style={styles.scheduleCard}>
            <View style={styles.scheduleCardContent}>
              <Text style={styles.scheduleDate}>
                {formatDate(new Date(schedule.startTime))}
              </Text>
              <View style={styles.scheduleDetails}>
                <Text style={styles.schedulePatient}>
                  {schedule.patientId}
                </Text>
                <Text style={styles.scheduleTime}>
                  {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                </Text>
              </View>
            </View>
          </Card>
        ))
      ) : (
        <Card variant="outlined" style={styles.emptyCard}>
          <Text style={styles.emptyText}>No upcoming schedules</Text>
        </Card>
      )}

      {/* Notifications */}
      <View style={styles.messageSection}>
        <View style={styles.messageHeader}>
          <Text style={styles.messageTitle}>Messages</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        
        <Card variant={unreadCount > 0 ? 'elevated' : 'outlined'} style={styles.messageCard}>
          <TouchableOpacity onPress={navigateToMessages}>
            <View style={styles.messageCardContent}>
              <Text style={styles.messageText}>
                {unreadCount > 0
                  ? `You have ${unreadCount} unread message${unreadCount > 1 ? 's' : ''}`
                  : 'No new messages'}
              </Text>
              <Button
                title="View Messages"
                onPress={navigateToMessages}
                variant={unreadCount > 0 ? 'primary' : 'outline'}
                size="small"
              />
            </View>
          </TouchableOpacity>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  welcomeSection: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  dateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  activeVisitCard: {
    backgroundColor: '#E8EAF6',
    marginBottom: 20,
  },
  activeVisitContent: {
    padding: 16,
  },
  activeVisitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activeVisitTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3F51B5',
  },
  activeVisitBadge: {
    backgroundColor: '#3F51B5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  activeVisitBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  patientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  visitTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  continueButton: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    color: '#3F51B5',
    fontSize: 14,
  },
  visitCard: {
    marginBottom: 8,
  },
  visitCardContent: {
    padding: 12,
  },
  visitCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  visitPatientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  scheduledBadge: {
    backgroundColor: '#FFECB3',
  },
  inProgressBadge: {
    backgroundColor: '#C8E6C9',
  },
  completedBadge: {
    backgroundColor: '#BBDEFB',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  visitTimes: {
    marginBottom: 8,
  },
  visitTimeText: {
    fontSize: 14,
    color: '#666',
  },
  taskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tasksLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginRight: 4,
  },
  tasksText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  emptyCard: {
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  scheduleCard: {
    marginBottom: 8,
  },
  scheduleCardContent: {
    padding: 12,
  },
  scheduleDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3F51B5',
    marginBottom: 4,
  },
  scheduleDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  schedulePatient: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  scheduleTime: {
    fontSize: 14,
    color: '#666',
  },
  messageSection: {
    marginTop: 24,
    marginBottom: 20,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  messageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  unreadBadge: {
    backgroundColor: '#F44336',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  messageCard: {
    marginBottom: 8,
  },
  messageCardContent: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageText: {
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
});

export default HomeScreen;
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Schedule } from '../../../redux/slices/scheduleSlice';
import Card from '../../../components/Card';
import { formatTime, formatDate, isToday, isTomorrow, getRelativeDateString } from '../../../utils/dateUtils';
import { ROUTES } from '../../../constants/appConstants';

interface UpcomingShiftsProps {
  schedules: Schedule[];
  refreshing: boolean;
  onRefresh: () => void;
  navigation: any;
}

type FilterType = 'upcoming' | 'today' | 'thisWeek' | 'all';

const UpcomingShifts: React.FC<UpcomingShiftsProps> = ({
  schedules,
  refreshing,
  onRefresh,
  navigation,
}) => {
  const [filter, setFilter] = useState<FilterType>('upcoming');
  const [filteredSchedules, setFilteredSchedules] = useState<Schedule[]>([]);

  useEffect(() => {
    applyFilter();
  }, [schedules, filter]);

  const applyFilter = () => {
    const now = new Date();
    let filtered: Schedule[] = [];

    switch (filter) {
      case 'today':
        filtered = schedules.filter(schedule => {
          const scheduleDate = new Date(schedule.startTime);
          return isToday(scheduleDate);
        });
        break;

      case 'thisWeek': {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // End of current week (Saturday)
        endOfWeek.setHours(23, 59, 59, 999);
        
        filtered = schedules.filter(schedule => {
          const scheduleDate = new Date(schedule.startTime);
          return scheduleDate >= startOfWeek && scheduleDate <= endOfWeek;
        });
        break;
      }

      case 'upcoming':
        filtered = schedules.filter(schedule => {
          const scheduleDate = new Date(schedule.startTime);
          return scheduleDate >= now;
        });
        break;

      case 'all':
      default:
        filtered = [...schedules];
        break;
    }

    // Sort by start time (earliest first)
    filtered.sort((a, b) => {
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });

    setFilteredSchedules(filtered);
  };

  const navigateToVisitDetails = (scheduleId: string) => {
    // Ideally we'd have a schedule detail screen, but for now we can reuse visit detail
    navigation.navigate(ROUTES.VISITS.VISIT_DETAILS, { visitId: scheduleId });
  };

  const getGroupHeaderText = (date: Date) => {
    if (isToday(date)) {
      return 'Today';
    } else if (isTomorrow(date)) {
      return 'Tomorrow';
    } else {
      return formatDate(date);
    }
  };

  const renderShiftItem = ({ item }: { item: Schedule }) => {
    const startTime = new Date(item.startTime);
    
    return (
      <TouchableOpacity
        onPress={() => navigateToVisitDetails(item.id)}
        activeOpacity={0.7}
      >
        <Card variant="outlined" style={styles.shiftCard}>
          <View style={styles.shiftHeader}>
            <View style={styles.shiftTimeContainer}>
              <Text style={styles.dateText}>{getGroupHeaderText(startTime)}</Text>
              <Text style={styles.timeText}>
                {formatTime(item.startTime)} - {formatTime(item.endTime)}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusBackground(item.status) },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(item.status) },
                ]}
              >
                {item.status}
              </Text>
            </View>
          </View>
          
          <Text style={styles.patientName}>{item.patientId}</Text>
          
          {item.tasks && item.tasks.length > 0 && (
            <View style={styles.tasksContainer}>
              <Text style={styles.tasksLabel}>Tasks:</Text>
              {item.tasks.slice(0, 2).map((task, index) => (
                <Text key={index} style={styles.taskItem}>• {task}</Text>
              ))}
              {item.tasks.length > 2 && (
                <Text style={styles.moreTasks}>+{item.tasks.length - 2} more</Text>
              )}
            </View>
          )}
          
          {item.recurring && (
            <View style={styles.recurringBadge}>
              <Text style={styles.recurringText}>
                {item.recurrencePattern || 'Recurring'}
              </Text>
            </View>
          )}
        </Card>
      </TouchableOpacity>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return '#FF9800';
      case 'completed':
        return '#4CAF50';
      case 'cancelled':
        return '#F44336';
      case 'pending':
        return '#9E9E9E';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusBackground = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return '#FFF3E0';
      case 'completed':
        return '#E8F5E9';
      case 'cancelled':
        return '#FFEBEE';
      case 'pending':
        return '#F5F5F5';
      default:
        return '#F5F5F5';
    }
  };

  const renderFilterButton = (type: FilterType, label: string) => (
    <TouchableOpacity
      style={[styles.filterButton, filter === type && styles.activeFilterButton]}
      onPress={() => setFilter(type)}
    >
      <Text
        style={[
          styles.filterButtonText,
          filter === type && styles.activeFilterButtonText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.filtersContainer}>
        {renderFilterButton('upcoming', 'Upcoming')}
        {renderFilterButton('today', 'Today')}
        {renderFilterButton('thisWeek', 'This Week')}
        {renderFilterButton('all', 'All')}
      </View>
      
      <FlatList
        data={filteredSchedules}
        renderItem={renderShiftItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {filter === 'upcoming'
                ? 'No upcoming shifts scheduled'
                : filter === 'today'
                ? 'No shifts scheduled for today'
                : filter === 'thisWeek'
                ? 'No shifts scheduled for this week'
                : 'No shifts found'}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  filtersContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F5F5F5',
  },
  activeFilterButton: {
    backgroundColor: '#3F51B5',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666666',
  },
  activeFilterButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  shiftCard: {
    marginBottom: 12,
  },
  shiftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  shiftTimeContainer: {
    flex: 1,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 2,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3F51B5',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  tasksContainer: {
    marginTop: 4,
  },
  tasksLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 4,
  },
  taskItem: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
    marginBottom: 2,
  },
  moreTasks: {
    fontSize: 12,
    color: '#3F51B5',
    marginLeft: 8,
    marginTop: 2,
  },
  recurringBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  recurringText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
});

export default UpcomingShifts;
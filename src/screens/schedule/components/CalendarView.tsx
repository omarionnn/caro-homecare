import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Schedule } from '../../../redux/slices/scheduleSlice';
import Card from '../../../components/Card';
import { formatTime, formatDate, isToday, isTomorrow, getRelativeDateString } from '../../../utils/dateUtils';

interface CalendarViewProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  schedules: Schedule[];
  refreshing: boolean;
  onRefresh: () => void;
}

interface MarkedDates {
  [date: string]: {
    marked: boolean;
    dotColor: string;
    selected?: boolean;
    selectedColor?: string;
  };
}

const CalendarView: React.FC<CalendarViewProps> = ({
  selectedDate,
  onDateSelect,
  schedules,
  refreshing,
  onRefresh,
}) => {
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [selectedDateShifts, setSelectedDateShifts] = useState<Schedule[]>([]);

  useEffect(() => {
    generateMarkedDates();
  }, [schedules, selectedDate]);

  useEffect(() => {
    filterShiftsForSelectedDate();
  }, [selectedDate, schedules]);

  const generateMarkedDates = () => {
    const marked: MarkedDates = {};
    
    // Mark dates with schedules
    schedules.forEach(schedule => {
      const dateString = new Date(schedule.startTime).toISOString().split('T')[0];
      
      if (marked[dateString]) {
        // Date already marked, just update it
        marked[dateString].dotColor = '#3F51B5';
      } else {
        // Add new marked date
        marked[dateString] = {
          marked: true,
          dotColor: '#3F51B5',
        };
      }
    });
    
    // Mark selected date
    const selectedDateString = selectedDate.toISOString().split('T')[0];
    marked[selectedDateString] = {
      ...marked[selectedDateString],
      selected: true,
      selectedColor: '#E8EAF6',
    };
    
    setMarkedDates(marked);
  };

  const filterShiftsForSelectedDate = () => {
    // Get the start and end of the selected date
    const start = new Date(selectedDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(selectedDate);
    end.setHours(23, 59, 59, 999);
    
    // Filter schedules that occur on the selected date
    const filtered = schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.startTime);
      return scheduleDate >= start && scheduleDate <= end;
    });
    
    // Sort by start time
    filtered.sort((a, b) => {
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });
    
    setSelectedDateShifts(filtered);
  };

  const handleDateSelect = (day: any) => {
    const newDate = new Date(day.dateString);
    onDateSelect(newDate);
  };

  const getTimeString = (schedule: Schedule) => {
    return `${formatTime(schedule.startTime)} - ${formatTime(schedule.endTime)}`;
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

  return (
    <View style={styles.container}>
      <Calendar
        current={selectedDate.toISOString()}
        onDayPress={handleDateSelect}
        markedDates={markedDates}
        theme={{
          todayTextColor: '#3F51B5',
          arrowColor: '#3F51B5',
          monthTextColor: '#333333',
          textMonthFontWeight: 'bold',
          textDayFontSize: 14,
          textMonthFontSize: 16,
        }}
      />
      
      <View style={styles.shiftsHeaderContainer}>
        <Text style={styles.dayText}>{getRelativeDateString(selectedDate)}</Text>
        <Text style={styles.shiftsCountText}>
          {selectedDateShifts.length} {selectedDateShifts.length === 1 ? 'shift' : 'shifts'}
        </Text>
      </View>
      
      <ScrollView
        style={styles.shiftsContainer}
        contentContainerStyle={styles.shiftsContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {selectedDateShifts.length === 0 ? (
          <Card variant="outlined" style={styles.emptyCard}>
            <Text style={styles.emptyText}>No shifts scheduled for this day</Text>
          </Card>
        ) : (
          selectedDateShifts.map((schedule) => (
            <Card key={schedule.id} variant="outlined" style={styles.shiftCard}>
              <View style={styles.shiftHeader}>
                <Text style={styles.timeText}>{getTimeString(schedule)}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: `${getStatusColor(schedule.status)}20` },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(schedule.status) },
                    ]}
                  >
                    {schedule.status}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.patientName}>{schedule.patientId}</Text>
              
              {schedule.tasks && schedule.tasks.length > 0 && (
                <View style={styles.tasksContainer}>
                  <Text style={styles.tasksLabel}>Tasks:</Text>
                  {schedule.tasks.slice(0, 2).map((task, index) => (
                    <Text key={index} style={styles.taskItem}>• {task}</Text>
                  ))}
                  {schedule.tasks.length > 2 && (
                    <Text style={styles.moreTasks}>+{schedule.tasks.length - 2} more</Text>
                  )}
                </View>
              )}
              
              {schedule.notes && (
                <Text style={styles.notesText}>{schedule.notes}</Text>
              )}
              
              {schedule.recurring && (
                <View style={styles.recurringBadge}>
                  <Text style={styles.recurringText}>
                    {schedule.recurrencePattern || 'Recurring'}
                  </Text>
                </View>
              )}
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  shiftsHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  dayText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  shiftsCountText: {
    fontSize: 14,
    color: '#666666',
  },
  shiftsContainer: {
    flex: 1,
  },
  shiftsContent: {
    padding: 16,
    paddingBottom: 24,
  },
  emptyCard: {
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
    alignItems: 'center',
    marginBottom: 8,
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
  notesText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 8,
    fontStyle: 'italic',
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

export default CalendarView;
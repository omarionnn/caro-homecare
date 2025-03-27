import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { formatDate } from '../../utils/dateUtils';

interface AvailabilityScreenProps {
  navigation: any;
}

interface TimeSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface DailyAvailability {
  day: string;
  isAvailable: boolean;
  timeSlots: TimeSlot[];
}

const weekDays = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const defaultStartTime = '09:00';
const defaultEndTime = '17:00';

const AvailabilityScreen: React.FC<AvailabilityScreenProps> = ({ navigation }) => {
  const [weeklyAvailability, setWeeklyAvailability] = useState<DailyAvailability[]>([]);
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Initialize weekly availability with default values
    initializeWeeklyAvailability();
  }, []);

  const initializeWeeklyAvailability = () => {
    const initialAvailability: DailyAvailability[] = weekDays.map((day, index) => ({
      day,
      isAvailable: index !== 0 && index !== 6, // Weekdays available by default
      timeSlots: [
        {
          id: `${day.toLowerCase()}_1`,
          day,
          startTime: defaultStartTime,
          endTime: defaultEndTime,
          isAvailable: index !== 0 && index !== 6, // Weekdays available by default
        },
      ],
    }));

    setWeeklyAvailability(initialAvailability);
  };

  const toggleDayAvailability = (dayIndex: number) => {
    const updatedAvailability = [...weeklyAvailability];
    updatedAvailability[dayIndex].isAvailable = !updatedAvailability[dayIndex].isAvailable;
    
    // Update all time slots for this day
    updatedAvailability[dayIndex].timeSlots.forEach(slot => {
      slot.isAvailable = updatedAvailability[dayIndex].isAvailable;
    });
    
    setWeeklyAvailability(updatedAvailability);
  };

  const updateTimeSlot = (dayIndex: number, slotIndex: number, field: 'startTime' | 'endTime', value: string) => {
    const updatedAvailability = [...weeklyAvailability];
    updatedAvailability[dayIndex].timeSlots[slotIndex][field] = value;
    setWeeklyAvailability(updatedAvailability);
  };

  const addTimeSlot = (dayIndex: number) => {
    if (weeklyAvailability[dayIndex].timeSlots.length >= 3) {
      Alert.alert('Maximum Reached', 'You can only add up to 3 time slots per day.');
      return;
    }

    const updatedAvailability = [...weeklyAvailability];
    const day = updatedAvailability[dayIndex].day;
    const newId = `${day.toLowerCase()}_${updatedAvailability[dayIndex].timeSlots.length + 1}`;
    
    updatedAvailability[dayIndex].timeSlots.push({
      id: newId,
      day,
      startTime: defaultStartTime,
      endTime: defaultEndTime,
      isAvailable: updatedAvailability[dayIndex].isAvailable,
    });
    
    setWeeklyAvailability(updatedAvailability);
  };

  const removeTimeSlot = (dayIndex: number, slotIndex: number) => {
    if (weeklyAvailability[dayIndex].timeSlots.length <= 1) {
      Alert.alert('Cannot Remove', 'Each day must have at least one time slot.');
      return;
    }

    const updatedAvailability = [...weeklyAvailability];
    updatedAvailability[dayIndex].timeSlots.splice(slotIndex, 1);
    setWeeklyAvailability(updatedAvailability);
  };

  const addUnavailableDate = () => {
    // In a real app, this would show a date picker
    // For now, let's simulate adding a date
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + 14); // 2 weeks from now
    
    const dateString = formatDate(futureDate);
    
    if (unavailableDates.includes(dateString)) {
      Alert.alert('Date Already Added', 'This date is already marked as unavailable.');
      return;
    }
    
    setUnavailableDates([...unavailableDates, dateString]);
  };

  const removeUnavailableDate = (index: number) => {
    const updatedDates = [...unavailableDates];
    updatedDates.splice(index, 1);
    setUnavailableDates(updatedDates);
  };

  const validateAvailability = () => {
    let isValid = true;
    let errorMessage = '';
    
    // Check for overlapping time slots
    weeklyAvailability.forEach(day => {
      if (day.isAvailable && day.timeSlots.length > 1) {
        const sortedSlots = [...day.timeSlots].sort((a, b) => {
          return a.startTime.localeCompare(b.startTime);
        });
        
        for (let i = 0; i < sortedSlots.length - 1; i++) {
          if (sortedSlots[i].endTime > sortedSlots[i + 1].startTime) {
            isValid = false;
            errorMessage = `You have overlapping time slots on ${day.day}. Please adjust your availability.`;
            break;
          }
        }
      }
    });
    
    return { isValid, errorMessage };
  };

  const handleSaveAvailability = () => {
    const { isValid, errorMessage } = validateAvailability();
    
    if (!isValid) {
      Alert.alert('Invalid Availability', errorMessage);
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        'Availability Updated',
        'Your availability has been updated successfully.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }, 1000);
  };

  // Render time picker (simplified for this example)
  const renderTimePicker = (
    value: string,
    onChange: (value: string) => void,
    label: string
  ) => {
    const times = [
      '00:00', '01:00', '02:00', '03:00', '04:00', '05:00',
      '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
      '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
      '18:00', '19:00', '20:00', '21:00', '22:00', '23:00',
    ];
    
    return (
      <View style={styles.timePickerContainer}>
        <Text style={styles.timePickerLabel}>{label}</Text>
        <View style={styles.timePicker}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {times.map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.timeOption,
                  value === time && styles.selectedTimeOption,
                ]}
                onPress={() => onChange(time)}
              >
                <Text
                  style={[
                    styles.timeOptionText,
                    value === time && styles.selectedTimeOptionText,
                  ]}
                >
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.headerTitle}>Set Your Availability</Text>
      <Text style={styles.subtitle}>
        Define when you're available to work. This helps us find the best shifts for you.
      </Text>
      
      <Card variant="outlined" style={styles.weeklyCard}>
        <Text style={styles.cardTitle}>Weekly Availability</Text>
        
        {weeklyAvailability.map((day, dayIndex) => (
          <View key={day.day} style={styles.dayContainer}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayText}>{day.day}</Text>
              <Switch
                value={day.isAvailable}
                onValueChange={() => toggleDayAvailability(dayIndex)}
                trackColor={{ false: '#E0E0E0', true: '#C5CAE9' }}
                thumbColor={day.isAvailable ? '#3F51B5' : '#BDBDBD'}
              />
            </View>
            
            {day.isAvailable ? (
              <View style={styles.timeSlotsContainer}>
                {day.timeSlots.map((slot, slotIndex) => (
                  <View key={slot.id} style={styles.timeSlotRow}>
                    {renderTimePicker(
                      slot.startTime,
                      (value) => updateTimeSlot(dayIndex, slotIndex, 'startTime', value),
                      'From'
                    )}
                    
                    {renderTimePicker(
                      slot.endTime,
                      (value) => updateTimeSlot(dayIndex, slotIndex, 'endTime', value),
                      'To'
                    )}
                    
                    <TouchableOpacity
                      style={styles.removeSlotButton}
                      onPress={() => removeTimeSlot(dayIndex, slotIndex)}
                    >
                      <Text style={styles.removeSlotText}>𝗫</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                
                <TouchableOpacity
                  style={styles.addSlotButton}
                  onPress={() => addTimeSlot(dayIndex)}
                >
                  <Text style={styles.addSlotText}>+ Add Time Slot</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.unavailableText}>Not available</Text>
            )}
          </View>
        ))}
      </Card>
      
      <Card variant="outlined" style={styles.unavailableDatesCard}>
        <Text style={styles.cardTitle}>Unavailable Dates</Text>
        <Text style={styles.cardDescription}>
          Mark specific dates when you're unavailable (vacations, appointments, etc.)
        </Text>
        
        {unavailableDates.length > 0 ? (
          <View style={styles.datesList}>
            {unavailableDates.map((date, index) => (
              <View key={index} style={styles.dateItem}>
                <Text style={styles.dateText}>{date}</Text>
                <TouchableOpacity
                  style={styles.removeDateButton}
                  onPress={() => removeUnavailableDate(index)}
                >
                  <Text style={styles.removeSlotText}>𝗫</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noDateText}>No unavailable dates added</Text>
        )}
        
        <TouchableOpacity
          style={styles.addDateButton}
          onPress={addUnavailableDate}
        >
          <Text style={styles.addDateText}>+ Add Unavailable Date</Text>
        </TouchableOpacity>
      </Card>
      
      <View style={styles.buttonContainer}>
        <Button
          title="Cancel"
          onPress={() => navigation.goBack()}
          variant="outline"
          size="large"
          style={styles.cancelButton}
        />
        <Button
          title="Save Availability"
          onPress={handleSaveAvailability}
          variant="primary"
          size="large"
          isLoading={isSubmitting}
          disabled={isSubmitting}
          style={styles.saveButton}
        />
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
    paddingBottom: 32,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  weeklyCard: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  dayContainer: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  unavailableText: {
    fontSize: 14,
    color: '#9E9E9E',
    fontStyle: 'italic',
  },
  timeSlotsContainer: {
    marginLeft: 16,
  },
  timeSlotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timePickerContainer: {
    flex: 1,
    marginRight: 8,
  },
  timePickerLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  timePicker: {
    height: 40,
  },
  timeOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  selectedTimeOption: {
    backgroundColor: '#3F51B5',
  },
  timeOptionText: {
    fontSize: 14,
    color: '#666666',
  },
  selectedTimeOptionText: {
    color: '#FFFFFF',
  },
  removeSlotButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFEBEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeSlotText: {
    fontSize: 12,
    color: '#F44336',
    fontWeight: 'bold',
  },
  addSlotButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  addSlotText: {
    fontSize: 14,
    color: '#3F51B5',
  },
  unavailableDatesCard: {
    marginBottom: 24,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  datesList: {
    marginBottom: 16,
  },
  dateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  dateText: {
    fontSize: 14,
    color: '#333333',
  },
  removeDateButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFEBEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDateText: {
    fontSize: 14,
    color: '#9E9E9E',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  addDateButton: {
    alignSelf: 'flex-start',
  },
  addDateText: {
    fontSize: 14,
    color: '#3F51B5',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
  },
});

export default AvailabilityScreen;
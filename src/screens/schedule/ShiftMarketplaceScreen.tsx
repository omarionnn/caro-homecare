import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { fetchAvailableShifts, requestShift, AvailableShift } from '../../redux/slices/scheduleSlice';
import Card from '../../components/Card';
import Button from '../../components/Button';
import TextField from '../../components/TextField';
import { formatTime, formatDate, isToday, isTomorrow, getRelativeDateString } from '../../utils/dateUtils';

interface ShiftMarketplaceScreenProps {
  navigation: any;
}

type SortOption = 'nearest' | 'soonest' | 'longest' | 'shortest';
type FilterOption = 'all' | 'urgent' | 'nearby';

const ShiftMarketplaceScreen: React.FC<ShiftMarketplaceScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { availableShifts, loading, error } = useSelector(
    (state: RootState) => state.schedules
  );
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSort, setSelectedSort] = useState<SortOption>('soonest');
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>('all');
  const [displayedShifts, setDisplayedShifts] = useState<AvailableShift[]>([]);

  useEffect(() => {
    loadAvailableShifts();
  }, []);

  useEffect(() => {
    filterAndSortShifts();
  }, [availableShifts, searchQuery, selectedSort, selectedFilter]);

  const loadAvailableShifts = async () => {
    try {
      await dispatch(fetchAvailableShifts());
    } catch (error) {
      console.error('Error loading available shifts:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAvailableShifts();
    setRefreshing(false);
  };

  const filterAndSortShifts = () => {
    // Start with all available shifts
    let shifts = [...Object.values(availableShifts)];
    
    // Apply search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      shifts = shifts.filter(shift => {
        return (
          shift.patientId.toLowerCase().includes(query) ||
          shift.taskDescription.toLowerCase().includes(query) ||
          shift.address.city.toLowerCase().includes(query) ||
          shift.requiredSkills.some(skill => skill.toLowerCase().includes(query))
        );
      });
    }
    
    // Apply category filter
    if (selectedFilter !== 'all') {
      if (selectedFilter === 'urgent') {
        shifts = shifts.filter(shift => {
          // Consider shifts in the next 24 hours as urgent
          const shiftTime = new Date(shift.startTime);
          const twentyFourHoursFromNow = new Date();
          twentyFourHoursFromNow.setHours(twentyFourHoursFromNow.getHours() + 24);
          
          return shiftTime <= twentyFourHoursFromNow;
        });
      } else if (selectedFilter === 'nearby') {
        // In a real app, this would filter based on user's location
        // For now, we'll just simulate this
        shifts = shifts.filter(shift => {
          // Randomly select some shifts as "nearby"
          return shift.id.charCodeAt(0) % 2 === 0;
        });
      }
    }
    
    // Apply sorting
    switch (selectedSort) {
      case 'soonest':
        shifts.sort((a, b) => {
          return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
        });
        break;
      case 'nearest':
        // In a real app, this would sort based on distance from user's location
        // For now, we'll just simulate this based on zip code
        shifts.sort((a, b) => {
          return a.address.zipCode.localeCompare(b.address.zipCode);
        });
        break;
      case 'longest':
        shifts.sort((a, b) => {
          const aDuration = new Date(a.endTime).getTime() - new Date(a.startTime).getTime();
          const bDuration = new Date(b.endTime).getTime() - new Date(b.startTime).getTime();
          return bDuration - aDuration;
        });
        break;
      case 'shortest':
        shifts.sort((a, b) => {
          const aDuration = new Date(a.endTime).getTime() - new Date(a.startTime).getTime();
          const bDuration = new Date(b.endTime).getTime() - new Date(b.startTime).getTime();
          return aDuration - bDuration;
        });
        break;
    }
    
    setDisplayedShifts(shifts);
  };

  const handleRequestShift = async (shiftId: string) => {
    try {
      await dispatch(requestShift(shiftId)).unwrap();
      Alert.alert(
        'Success',
        'Your shift request has been submitted. You will be notified when it is approved.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to request shift. Please try again.');
    }
  };

  const renderSortOption = (option: SortOption, label: string) => (
    <TouchableOpacity
      style={[styles.sortOption, selectedSort === option && styles.selectedSortOption]}
      onPress={() => setSelectedSort(option)}
    >
      <Text
        style={[
          styles.sortOptionText,
          selectedSort === option && styles.selectedSortOptionText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderFilterOption = (option: FilterOption, label: string) => (
    <TouchableOpacity
      style={[styles.filterOption, selectedFilter === option && styles.selectedFilterOption]}
      onPress={() => setSelectedFilter(option)}
    >
      <Text
        style={[
          styles.filterOptionText,
          selectedFilter === option && styles.selectedFilterOptionText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderShiftItem = ({ item }: { item: AvailableShift }) => {
    const startTime = new Date(item.startTime);
    const isUrgent = startTime.getTime() - new Date().getTime() < 24 * 60 * 60 * 1000;
    
    return (
      <Card
        variant="outlined"
        style={[styles.shiftCard, isUrgent && styles.urgentShiftCard]}
      >
        <View style={styles.shiftHeader}>
          <View>
            <Text style={styles.dateText}>{getRelativeDateString(startTime)}</Text>
            <Text style={styles.timeText}>
              {formatTime(item.startTime)} - {formatTime(item.endTime)}
            </Text>
          </View>
          
          {isUrgent && (
            <View style={styles.urgentBadge}>
              <Text style={styles.urgentText}>Urgent</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.patientText}>{item.patientId}</Text>
        <Text style={styles.taskDescription}>{item.taskDescription}</Text>
        
        <View style={styles.addressContainer}>
          <Text style={styles.addressLabel}>Location:</Text>
          <Text style={styles.addressText}>
            {item.address.street}, {item.address.city}, {item.address.state} {item.address.zipCode}
          </Text>
        </View>
        
        {item.requiredSkills && item.requiredSkills.length > 0 && (
          <View style={styles.skillsContainer}>
            <Text style={styles.skillsLabel}>Required Skills:</Text>
            <View style={styles.skillsList}>
              {item.requiredSkills.map((skill, index) => (
                <View key={index} style={styles.skillBadge}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        <View style={styles.actionsContainer}>
          <Button
            title="Request Shift"
            onPress={() => handleRequestShift(item.id)}
            variant="primary"
            size="medium"
            style={styles.requestButton}
          />
          <Button
            title="Details"
            onPress={() => {
              // Navigate to shift details screen
              // For now, just show an alert
              Alert.alert('Shift Details', 'Detailed view will be implemented soon');
            }}
            variant="outline"
            size="medium"
          />
        </View>
      </Card>
    );
  };

  if (loading && !refreshing && Object.keys(availableShifts).length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3F51B5" />
        <Text style={styles.loadingText}>Loading available shifts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shift Marketplace</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <TextField
          placeholder="Search patient, tasks, location..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          containerStyle={styles.searchField}
          fullWidth
        />
      </View>
      
      <View style={styles.sortFilterContainer}>
        <View style={styles.sortContainer}>
          <Text style={styles.sortFilterLabel}>Sort by:</Text>
          <ScrollableOptions>
            {renderSortOption('soonest', 'Soonest')}
            {renderSortOption('nearest', 'Nearest')}
            {renderSortOption('longest', 'Longest')}
            {renderSortOption('shortest', 'Shortest')}
          </ScrollableOptions>
        </View>
        
        <View style={styles.filterContainer}>
          <Text style={styles.sortFilterLabel}>Filter:</Text>
          <ScrollableOptions>
            {renderFilterOption('all', 'All Shifts')}
            {renderFilterOption('urgent', 'Urgent')}
            {renderFilterOption('nearby', 'Nearby')}
          </ScrollableOptions>
        </View>
      </View>
      
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button
            title="Retry"
            onPress={loadAvailableShifts}
            variant="primary"
            style={styles.retryButton}
          />
        </View>
      ) : (
        <FlatList
          data={displayedShifts}
          renderItem={renderShiftItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery
                  ? 'No shifts match your search criteria'
                  : 'No available shifts at the moment'}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

// Helper component for horizontal scrollable options
const ScrollableOptions: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.scrollableOptionsContent}
  >
    {children}
  </ScrollView>
);

// Had to define this here as it wasn't imported
const ScrollView = ({ children, horizontal, showsHorizontalScrollIndicator, contentContainerStyle }) => (
  <View style={contentContainerStyle}>
    <View style={{ flexDirection: horizontal ? 'row' : 'column' }}>
      {children}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#FFFFFF',
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
  searchContainer: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  searchField: {
    marginBottom: 0,
  },
  sortFilterContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  sortContainer: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
  },
  filterContainer: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  sortFilterLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  scrollableOptionsContent: {
    paddingRight: 16,
  },
  sortOption: {
    marginRight: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
  },
  selectedSortOption: {
    backgroundColor: '#3F51B5',
  },
  sortOptionText: {
    fontSize: 14,
    color: '#666666',
  },
  selectedSortOptionText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  filterOption: {
    marginRight: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
  },
  selectedFilterOption: {
    backgroundColor: '#3F51B5',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#666666',
  },
  selectedFilterOptionText: {
    color: '#FFFFFF',
    fontWeight: '500',
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
  urgentShiftCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  shiftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
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
  urgentBadge: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  urgentText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#F44336',
  },
  patientText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  addressContainer: {
    marginBottom: 8,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 2,
  },
  addressText: {
    fontSize: 14,
    color: '#666666',
  },
  skillsContainer: {
    marginBottom: 16,
  },
  skillsLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 4,
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillBadge: {
    backgroundColor: '#E8EAF6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  skillText: {
    fontSize: 12,
    color: '#3F51B5',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  requestButton: {
    flex: 1,
    marginRight: 8,
  },
});

export default ShiftMarketplaceScreen;
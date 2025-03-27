import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { fetchVisits, Visit } from '../../redux/slices/visitSlice';
import Card from '../../components/Card';
import { ROUTES, VISIT_STATUS } from '../../constants/appConstants';
import { formatDate, formatTime } from '../../utils/dateUtils';

interface VisitListScreenProps {
  navigation: any;
}

// Custom button for the filter tabs
const FilterButton = ({ 
  title, 
  active, 
  onPress 
}: { 
  title: string; 
  active: boolean; 
  onPress: () => void; 
}) => (
  <TouchableOpacity
    style={[styles.filterButton, active && styles.activeFilterButton]}
    onPress={onPress}
  >
    <Text style={[styles.filterButtonText, active && styles.activeFilterButtonText]}>
      {title}
    </Text>
  </TouchableOpacity>
);

const VisitListScreen: React.FC<VisitListScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { entities: visits, loading, error } = useSelector((state: RootState) => state.visits);

  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('upcoming');
  const [filteredVisits, setFilteredVisits] = useState<Visit[]>([]);

  useEffect(() => {
    loadVisits();
  }, []);

  useEffect(() => {
    filterVisits();
  }, [visits, activeFilter]);

  const loadVisits = async () => {
    try {
      await dispatch(fetchVisits());
    } catch (error) {
      console.error('Error loading visits:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVisits();
    setRefreshing(false);
  };

  const filterVisits = () => {
    const visitsArray = Object.values(visits);
    const now = new Date();
    
    let filtered: Visit[];
    
    switch (activeFilter) {
      case 'upcoming':
        filtered = visitsArray.filter(visit => {
          const visitDate = new Date(visit.scheduledStartTime);
          return (
            visitDate > now && 
            visit.status !== VISIT_STATUS.CANCELLED && 
            visit.status !== VISIT_STATUS.COMPLETED
          );
        });
        break;
        
      case 'today':
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        filtered = visitsArray.filter(visit => {
          const visitDate = new Date(visit.scheduledStartTime);
          return visitDate >= today && visitDate < tomorrow;
        });
        break;
        
      case 'completed':
        filtered = visitsArray.filter(visit => 
          visit.status === VISIT_STATUS.COMPLETED
        );
        break;
        
      case 'all':
      default:
        filtered = visitsArray;
        break;
    }
    
    // Sort by scheduled start time (newest first for completed, oldest first for others)
    filtered.sort((a, b) => {
      if (activeFilter === 'completed') {
        return new Date(b.scheduledStartTime).getTime() - new Date(a.scheduledStartTime).getTime();
      }
      return new Date(a.scheduledStartTime).getTime() - new Date(b.scheduledStartTime).getTime();
    });
    
    setFilteredVisits(filtered);
  };

  const navigateToVisitDetails = (visitId: string) => {
    navigation.navigate(ROUTES.VISITS.VISIT_DETAILS, { visitId });
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case VISIT_STATUS.SCHEDULED:
        return styles.scheduledBadge;
      case VISIT_STATUS.IN_PROGRESS:
        return styles.inProgressBadge;
      case VISIT_STATUS.COMPLETED:
        return styles.completedBadge;
      case VISIT_STATUS.MISSED:
        return styles.missedBadge;
      case VISIT_STATUS.CANCELLED:
        return styles.cancelledBadge;
      default:
        return styles.scheduledBadge;
    }
  };

  const renderVisitItem = ({ item }: { item: Visit }) => {
    // Format date to display
    const visitDate = new Date(item.scheduledStartTime);
    const formattedDate = formatDate(visitDate);
    
    return (
      <TouchableOpacity
        onPress={() => navigateToVisitDetails(item.id)}
        activeOpacity={0.7}
      >
        <Card variant="outlined" style={styles.visitCard}>
          <View style={styles.visitHeader}>
            <Text style={styles.visitDateText}>{formattedDate}</Text>
            <View style={[styles.statusBadge, getStatusBadgeStyle(item.status)]}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
          
          <View style={styles.visitDetails}>
            <Text style={styles.patientName}>{item.patientId}</Text>
            <Text style={styles.visitTime}>
              {formatTime(item.scheduledStartTime)} - {formatTime(item.scheduledEndTime)}
            </Text>
          </View>
          
          {item.status === VISIT_STATUS.IN_PROGRESS && (
            <View style={styles.activeVisitIndicator}>
              <Text style={styles.activeVisitText}>Currently Active</Text>
            </View>
          )}
          
          {item.tasks && item.tasks.length > 0 && (
            <View style={styles.tasksContainer}>
              <Text style={styles.tasksLabel}>Tasks:</Text>
              {item.tasks.slice(0, 3).map((task, index) => (
                <Text key={index} style={styles.taskItem}>
                  • {task}
                </Text>
              ))}
              {item.tasks.length > 3 && (
                <Text style={styles.moreTasks}>+{item.tasks.length - 3} more</Text>
              )}
            </View>
          )}
          
          {item.isOffline && (
            <View style={styles.offlineIndicator}>
              <Text style={styles.offlineText}>Saved Offline</Text>
            </View>
          )}
        </Card>
      </TouchableOpacity>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyListContainer}>
      <Text style={styles.emptyListText}>
        {activeFilter === 'upcoming' ? "You don't have any upcoming visits." :
         activeFilter === 'today' ? "No visits scheduled for today." :
         activeFilter === 'completed' ? "You haven't completed any visits yet." :
         "No visits found."}
      </Text>
    </View>
  );

  if (loading && !refreshing && Object.keys(visits).length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3F51B5" />
        <Text style={styles.loadingText}>Loading visits...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter buttons */}
      <View style={styles.filterContainer}>
        <FilterButton
          title="Upcoming"
          active={activeFilter === 'upcoming'}
          onPress={() => setActiveFilter('upcoming')}
        />
        <FilterButton
          title="Today"
          active={activeFilter === 'today'}
          onPress={() => setActiveFilter('today')}
        />
        <FilterButton
          title="Completed"
          active={activeFilter === 'completed'}
          onPress={() => setActiveFilter('completed')}
        />
        <FilterButton
          title="All"
          active={activeFilter === 'all'}
          onPress={() => setActiveFilter('all')}
        />
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadVisits}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredVisits}
          renderItem={renderVisitItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginHorizontal: 4,
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
    backgroundColor: '#3F51B5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  visitCard: {
    marginBottom: 12,
  },
  visitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 8,
    marginBottom: 8,
  },
  visitDateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3F51B5',
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
  missedBadge: {
    backgroundColor: '#FFCDD2',
  },
  cancelledBadge: {
    backgroundColor: '#E0E0E0',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  visitDetails: {
    marginBottom: 8,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  visitTime: {
    fontSize: 14,
    color: '#666666',
  },
  activeVisitIndicator: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  activeVisitText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
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
  offlineIndicator: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  offlineText: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '500',
  },
  emptyListContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyListText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
});

export default VisitListScreen;
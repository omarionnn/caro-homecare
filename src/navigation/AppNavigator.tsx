import React from 'react';
import { useSelector } from 'react-redux';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootState } from '../redux/store';
import { ROUTES } from '../constants/appConstants';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Main screens
import HomeScreen from '../screens/home/HomeScreen';
import VisitListScreen from '../screens/visits/VisitListScreen';
import VisitDetailScreen from '../screens/visits/VisitDetailScreen';
import EVVScreen from '../screens/visits/EVVScreen';

// Patient screens
import PatientListScreen from '../screens/patients/PatientListScreen';
import PatientDetailScreen from '../screens/patients/PatientDetailScreen';
import CarePlanScreen from '../screens/patients/CarePlanScreen';
import MedicalHistoryScreen from '../screens/patients/MedicalHistoryScreen';

// Schedule screens
import ScheduleScreen from '../screens/schedule/ScheduleScreen';
import ShiftMarketplaceScreen from '../screens/schedule/ShiftMarketplaceScreen';
import AvailabilityScreen from '../screens/schedule/AvailabilityScreen';

// We'll need to implement these screens next
const MessageScreen = () => null;
const ProfileScreen = () => null;
const DocumentationScreen = () => null;

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name={ROUTES.AUTH.LOGIN} component={LoginScreen} />
      <Stack.Screen name={ROUTES.AUTH.REGISTER} component={RegisterScreen} />
      <Stack.Screen name={ROUTES.AUTH.FORGOT_PASSWORD} component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};

const VisitsStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="VisitsList" 
        component={VisitListScreen} 
        options={{ title: 'Visits' }}
      />
      <Stack.Screen 
        name={ROUTES.VISITS.VISIT_DETAILS} 
        component={VisitDetailScreen}
        options={{ title: 'Visit Details' }}
      />
      <Stack.Screen 
        name={ROUTES.VISITS.CLOCK_IN} 
        component={EVVScreen}
        options={{ title: 'Clock In' }}
      />
      <Stack.Screen 
        name={ROUTES.VISITS.CLOCK_OUT} 
        component={EVVScreen}
        options={{ title: 'Clock Out' }}
      />
      <Stack.Screen 
        name={ROUTES.VISITS.DOCUMENTATION} 
        component={DocumentationScreen}
        options={{ title: 'Documentation' }}
      />
    </Stack.Navigator>
  );
};

const PatientsStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="PatientsList" 
        component={PatientListScreen} 
        options={{ title: 'Patients' }}
      />
      <Stack.Screen 
        name={ROUTES.PATIENTS.PATIENT_DETAILS} 
        component={PatientDetailScreen}
        options={{ title: 'Patient Details' }}
      />
      <Stack.Screen 
        name={ROUTES.PATIENTS.CARE_PLAN} 
        component={CarePlanScreen}
        options={{ title: 'Care Plan' }}
      />
      <Stack.Screen 
        name={ROUTES.PATIENTS.MEDICAL_HISTORY} 
        component={MedicalHistoryScreen}
        options={{ title: 'Medical History' }}
      />
    </Stack.Navigator>
  );
};

const ScheduleStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ScheduleMain" 
        component={ScheduleScreen} 
        options={{ title: 'Schedule' }}
      />
      <Stack.Screen 
        name={ROUTES.SCHEDULE.SHIFT_MARKETPLACE} 
        component={ShiftMarketplaceScreen}
        options={{ title: 'Shift Marketplace' }}
      />
      <Stack.Screen 
        name={ROUTES.SCHEDULE.AVAILABILITY} 
        component={AvailabilityScreen}
        options={{ title: 'My Availability' }}
      />
    </Stack.Navigator>
  );
};

const MessagesStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="MessagesMain" 
        component={MessageScreen} 
        options={{ title: 'Messages' }}
      />
    </Stack.Navigator>
  );
};

const ProfileStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ProfileMain" 
        component={ProfileScreen} 
        options={{ title: 'Profile' }}
      />
    </Stack.Navigator>
  );
};

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#3F51B5',
        tabBarInactiveTintColor: '#757575',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name={ROUTES.MAIN.HOME} 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          // We'll add icons later
        }}
      />
      <Tab.Screen 
        name={ROUTES.MAIN.SCHEDULE} 
        component={ScheduleStack}
        options={{
          tabBarLabel: 'Schedule',
          // We'll add icons later
        }}
      />
      <Tab.Screen 
        name={ROUTES.MAIN.VISITS} 
        component={VisitsStack}
        options={{
          tabBarLabel: 'Visits',
          // We'll add icons later
        }}
      />
      <Tab.Screen 
        name={ROUTES.MAIN.PATIENTS} 
        component={PatientsStack}
        options={{
          tabBarLabel: 'Patients',
          // We'll add icons later
        }}
      />
      <Tab.Screen 
        name={ROUTES.MAIN.MESSAGES} 
        component={MessagesStack}
        options={{
          tabBarLabel: 'Messages',
          // We'll add icons later
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainTabs} />
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
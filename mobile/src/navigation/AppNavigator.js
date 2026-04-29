import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { colors } from '../styles/colors';

import HomeScreen from '../screens/HomeScreen';
import PatientListScreen from '../screens/PatientListScreen';
import PatientDetailScreen from '../screens/PatientDetailScreen';
import AddPatientScreen from '../screens/AddPatientScreen';
import AddVisitScreen from '../screens/AddVisitScreen';
import PendingSyncScreen from '../screens/PendingSyncScreen';
import ReportScreen from '../screens/ReportScreen';

const Stack = createStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: colors.primary, elevation: 4 },
  headerTintColor: colors.textLight,
  headerTitleStyle: { fontWeight: '600', fontSize: 18 },
  cardStyle: { backgroundColor: colors.background },
};

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={screenOptions}>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Village Health Assistant' }} />
        <Stack.Screen name="PatientList" component={PatientListScreen} options={{ title: 'Patients / मरीज़' }} />
        <Stack.Screen name="PatientDetail" component={PatientDetailScreen} options={{ title: 'Patient Details' }} />
        <Stack.Screen name="AddPatient" component={AddPatientScreen} options={{ title: 'Add Patient / मरीज़ जोड़ें' }} />
        <Stack.Screen name="AddVisit" component={AddVisitScreen} options={{ title: 'Add Visit / विजिट' }} />
        <Stack.Screen name="PendingSync" component={PendingSyncScreen} options={{ title: 'Sync Status / सिंक' }} />
        <Stack.Screen name="Report" component={ReportScreen} options={{ title: 'Report / रिपोर्ट' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

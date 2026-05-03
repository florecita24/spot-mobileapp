import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import DashboardScreen from './screens/DashboardScreen';
import DeviceDetailScreen from './screens/DeviceDetailScreen';
import AddDeviceScreen from './screens/AddDeviceScreen';
import EditConnectionScreen from './screens/EditConnectionScreen';
import NotificationScreen from './screens/NotificationScreen';
import TrackDeviceScreen from './screens/TrackDeviceScreen';
import ProfileScreen from './screens/ProfileScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import { getSession, getProfile, signOut } from './constants/supabase';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userSession, setUserSession] = useState(null);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const { session } = await getSession();
    
    if (session) {
      // Check if profile still exists (in case table was dropped)
      const { error } = await getProfile(session.user.id);
      if (error) {
        // Profile not found, sign out to clear local session
        await signOut();
        setUserSession(null);
      } else {
        setUserSession(session);
      }
    } else {
      setUserSession(null);
    }
    
    // Splash screen duration: 2 seconds
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={userSession ? 'Dashboard' : 'Login'}
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ animation: 'fade' }}
        />
        <Stack.Screen
          name="SignUp"
          component={SignUpScreen}
          options={{ animation: 'fade' }}
        />
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ animation: 'fade' }}
        />
        <Stack.Screen
          name="DeviceDetail"
          component={DeviceDetailScreen}
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="AddDevice"
          component={AddDeviceScreen}
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="EditConnection"
          component={EditConnectionScreen}
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="Notification"
          component={NotificationScreen}
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="TrackDevice"
          component={TrackDeviceScreen}
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="EditProfile"
          component={EditProfileScreen}
          options={{
            animation: 'fade',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

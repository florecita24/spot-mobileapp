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
      // Cek apakah data profil benar-benar ada dan tidak ada error
      const { profile, error } = await getProfile(session.user.id);
      
      if (error || !profile) {
        // Profil tidak ditemukan (misal karena drop table), hapus sesi
        await signOut();
        setUserSession(null);
      } else {
        // Sesi dan data profil valid
        setUserSession(session);
      }
    } else {
      // Tidak ada sesi yang aktif
      setUserSession(null);
    }
    
    // Perhatikan: setTimeout 2 detik sudah DIHAPUS dari sini
    // agar SplashScreen.js yang mengambil alih kapan loading selesai.
  };

  // Kirimkan fungsi untuk mengubah isLoading ke SplashScreen
  if (isLoading) {
    return <SplashScreen onFinish={() => setIsLoading(false)} />;
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
          options={{ animation: 'fade' }}
        />
        <Stack.Screen
          name="AddDevice"
          component={AddDeviceScreen}
          options={{ animation: 'fade' }}
        />
        <Stack.Screen
          name="EditConnection"
          component={EditConnectionScreen}
          options={{ animation: 'fade' }}
        />
        <Stack.Screen
          name="Notification"
          component={NotificationScreen}
          options={{ animation: 'fade' }}
        />
        <Stack.Screen
          name="TrackDevice"
          component={TrackDeviceScreen}
          options={{ animation: 'fade' }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ animation: 'fade' }}
        />
        <Stack.Screen
          name="EditProfile"
          component={EditProfileScreen}
          options={{ animation: 'fade' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
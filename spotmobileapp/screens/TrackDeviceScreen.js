import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Platform,
  ScrollView,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Svg, Path, Circle, Line, Polyline, Rect } from 'react-native-svg';
import { COLORS } from '../constants/colors';
import { getSession, getUserDevices, getLatestDeviceLocation } from '../constants/supabase';

const primaryColor = COLORS?.primary || '#FF6B47';
const primaryLight = '#FFF0ED';
const bgColor = '#F4F6F8';
const surfaceColor = '#FFFFFF';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const BOTTOM_SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.6;
const BOTTOM_SHEET_MIN_HEIGHT = 260; 
const MAX_UPWARD_TRANSLATE_Y = BOTTOM_SHEET_MIN_HEIGHT - BOTTOM_SHEET_MAX_HEIGHT; 
const MAX_DOWNWARD_TRANSLATE_Y = 0;

// --- Icons ---
const BellIcon = ({ color, size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </Svg>
);

const PlusIcon = ({ color, size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Line x1="12" y1="5" x2="12" y2="19" />
    <Line x1="5" y1="12" x2="19" y2="12" />
  </Svg>
);

const TargetIcon = ({ color, size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Circle cx="12" cy="12" r="3" />
    <Line x1="12" y1="2" x2="12" y2="6" />
    <Line x1="12" y1="18" x2="12" y2="22" />
    <Line x1="2" y1="12" x2="6" y2="12" />
    <Line x1="18" y1="12" x2="22" y2="12" />
  </Svg>
);

const HomeIcon = ({ color, size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <Polyline points="9 22 9 12 15 12 15 22" />
  </Svg>
);

const UserIcon = ({ color, size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <Circle cx="12" cy="7" r="4" />
  </Svg>
);

const ArrowRightIcon = ({ color, size = 16 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Polyline points="12 16 16 12 12 8" />
    <Line x1="8" y1="12" x2="16" y2="12" />
  </Svg>
);

const DeviceIcon = ({ color, size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="2" y="4" width="20" height="14" rx="2" ry="2" />
    <Line x1="8" y1="22" x2="16" y2="22" />
    <Line x1="12" y1="18" x2="12" y2="22" />
    <Rect x="14" y="10" width="8" height="12" rx="2" ry="2" fill={surfaceColor} />
    <Rect x="14" y="10" width="8" height="12" rx="2" ry="2" />
  </Svg>
);

const MapMarkerDeviceIcon = ({ color, size = 44 }) => (
  <Svg width={size} height={size * 1.25} viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Map Pin Background */}
    <Path 
      d="M12 29C12 29 22 20.4183 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 20.4183 12 29 12 29Z" 
      fill={color} 
    />
    {/* Tablet / Monitor */}
    <Rect x="6" y="7" width="10" height="7" rx="1" stroke="#FFF" strokeWidth="1.2" />
    <Line x1="9" y1="16" x2="13" y2="16" stroke="#FFF" strokeWidth="1.2" strokeLinecap="round" />
    <Line x1="11" y1="14" x2="11" y2="16" stroke="#FFF" strokeWidth="1.2" />
    {/* Phone (Overlapping) */}
    <Rect x="13" y="10" width="5" height="7" rx="1" fill={color} stroke="#FFF" strokeWidth="1.2" />
  </Svg>
);

const GoogleMapsUserDot = ({ size = 24 }) => (
  <Svg width={size * 1.5} height={size * 1.5} viewBox="0 0 36 36" fill="none">
    {/* Outer halo */}
    <Circle cx="18" cy="18" r="14" fill="#4285F4" fillOpacity="0.3" />
    {/* White border */}
    <Circle cx="18" cy="18" r="8" fill="#FFF" />
    {/* Inner blue dot */}
    <Circle cx="18" cy="18" r="6" fill="#4285F4" />
  </Svg>
);

export default function TrackDeviceScreen({ route, navigation }) {
  const [devices, setDevices] = useState([]);
  const [loadingDevices, setLoadingDevices] = useState(true);

  // Fetch devices and their latest locations on mount
  useEffect(() => {
    const fetchDevicesWithLocations = async () => {
      try {
        const { session } = await getSession();
        if (!session?.user?.id) return;

        const { devices: fetched } = await getUserDevices(session.user.id);
        if (!fetched?.length) {
          setDevices([]);
          setLoadingDevices(false);
          return;
        }

        // Fetch latest location for each device
        const devicesWithLocations = await Promise.all(
          fetched.map(async (d) => {
            const { location } = await getLatestDeviceLocation(d.id);
            return {
              id: d.id,
              name: d.name,
              identifier: d.identifier,
              status: d.is_active ? 'Connected' : 'Disconnected',
              isConnected: d.is_active ?? !!d.last_seen,
              lat: location?.lat ? Number(location.lat) : null,
              lng: location?.lng ? Number(location.lng) : null,
            };
          })
        );

        setDevices(devicesWithLocations);
      } catch (error) {
        console.error('Failed to fetch devices with locations:', error);
      } finally {
        setLoadingDevices(false);
      }
    };

    fetchDevicesWithLocations();
  }, []);

  const focusDeviceName = route?.params?.focusDevice?.name;
  const targetDevice = focusDeviceName ? devices.find(d => d.name === focusDeviceName) : null;

  // Only use device location if available, otherwise fallback to default
  const defaultRegion = {
    latitude: -6.8910,
    longitude: 107.6110,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const initialRegion = targetDevice && targetDevice.lat != null ? {
    latitude: targetDevice.lat - 0.0004,
    longitude: targetDevice.lng,
    latitudeDelta: 0.001,
    longitudeDelta: 0.001,
  } : defaultRegion;

  const mapRef = useRef(null);

  const handleRecenter = () => {
    mapRef.current?.animateToRegion(initialRegion, 1000);
  };

  const handleTrackDevice = (device) => {
    if (!device.isConnected) return;
    
    // Zoom map to the device location
    const region = {
      latitude: device.lat - 0.0004, // Offset slightly so it's not hidden behind the bottom sheet
      longitude: device.lng,
      latitudeDelta: 0.001,
      longitudeDelta: 0.001,
    };
    mapRef.current?.animateToRegion(region, 1000);

    // Collapse the bottom sheet
    Animated.spring(animatedValue, {
      toValue: MAX_DOWNWARD_TRANSLATE_Y,
      useNativeDriver: true,
      bounciness: 0,
    }).start();
    lastGestureDy.current = MAX_DOWNWARD_TRANSLATE_Y;
  };

  // --- Bottom Sheet Animation Logic ---
  const animatedValue = useRef(new Animated.Value(0)).current;
  const lastGestureDy = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only take over if there's significant vertical movement
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        animatedValue.setOffset(lastGestureDy.current);
        animatedValue.setValue(0);
      },
      onPanResponderMove: (e, gesture) => {
        const newDy = lastGestureDy.current + gesture.dy;
        if (newDy < MAX_UPWARD_TRANSLATE_Y) {
           animatedValue.setValue(MAX_UPWARD_TRANSLATE_Y - lastGestureDy.current);
        } else if (newDy > MAX_DOWNWARD_TRANSLATE_Y) {
           animatedValue.setValue(MAX_DOWNWARD_TRANSLATE_Y - lastGestureDy.current);
        } else {
           animatedValue.setValue(gesture.dy);
        }
      },
      onPanResponderRelease: (e, gesture) => {
        animatedValue.flattenOffset();
        lastGestureDy.current += gesture.dy;

        // Snap to nearest point based on velocity or distance
        if (gesture.vy < -0.5 || lastGestureDy.current < MAX_UPWARD_TRANSLATE_Y / 2) {
          // Snap UP
          Animated.spring(animatedValue, {
            toValue: MAX_UPWARD_TRANSLATE_Y,
            useNativeDriver: true,
            bounciness: 0,
          }).start();
          lastGestureDy.current = MAX_UPWARD_TRANSLATE_Y;
        } else {
          // Snap DOWN
          Animated.spring(animatedValue, {
            toValue: MAX_DOWNWARD_TRANSLATE_Y,
            useNativeDriver: true,
            bounciness: 0,
          }).start();
          lastGestureDy.current = MAX_DOWNWARD_TRANSLATE_Y;
        }
      },
    })
  ).current;

  const bottomSheetTranslateY = animatedValue.interpolate({
    inputRange: [MAX_UPWARD_TRANSLATE_Y, MAX_DOWNWARD_TRANSLATE_Y],
    outputRange: [MAX_UPWARD_TRANSLATE_Y, MAX_DOWNWARD_TRANSLATE_Y],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      
      {/* Interactive Map */}
      <MapView 
        ref={mapRef}
        style={StyleSheet.absoluteFillObject} 
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={false} // Custom button used
        showsCompass={false}
      >
        {/* Device Markers - only show devices with valid locations */}
        {devices.filter(d => d.lat != null && d.lng != null).map((device) => {
          const pulseAnim = new Animated.Value(0);
          
          if (device.isConnected) {
            Animated.loop(
              Animated.sequence([
                Animated.timing(pulseAnim, {
                  toValue: 1,
                  duration: 2000,
                  useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                  toValue: 0,
                  duration: 0,
                  useNativeDriver: true,
                }),
              ])
            ).start();
          }

          return (
            <Marker 
              key={device.id}
              coordinate={{ latitude: device.lat, longitude: device.lng }}
              title={device.name}
              description={device.status}
              anchor={{ x: 0.5, y: 1 }}
            >
              <View style={{ alignItems: 'center', justifyContent: 'flex-end', width: 80, height: 80 }}>
                {device.isConnected && (
                  <Animated.View
                    style={{
                      position: 'absolute',
                      top: 10,
                      width: 80,
                      height: 80,
                      borderRadius: 40,
                      backgroundColor: primaryColor,
                      opacity: pulseAnim.interpolate({
                        inputRange: [0, 0.2, 1],
                        outputRange: [0, 0.4, 0],
                      }),
                      transform: [
                        {
                          scale: pulseAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.3, 1.2],
                          }),
                        },
                      ],
                    }}
                  />
                )}
                <MapMarkerDeviceIcon color={device.isConnected ? primaryColor : '#9CA3AF'} />
              </View>
            </Marker>
          );
        })}

        {/* Dummy User Location */}
        <Marker 
          coordinate={{ latitude: -6.8910, longitude: 107.6110 }}
          title="Posisi Anda"
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <GoogleMapsUserDot />
        </Marker>
      </MapView>

      {/* Recenter Button */}
      <TouchableOpacity style={styles.recenterBtn} onPress={handleRecenter}>
        <TargetIcon color={primaryColor} />
      </TouchableOpacity>

      {/* Smooth Top Header (Semi-transparent Glassmorphism feel) */}
      <View style={styles.headerContainer}>
        <SafeAreaView style={{ flex: 0 }} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Lacak Perangkat</Text>
        </View>
      </View>

      {/* Draggable Bottom Sheet */}
      <Animated.View 
        style={[
          styles.bottomSheet, 
          { transform: [{ translateY: bottomSheetTranslateY }] }
        ]}
      >
        <View {...panResponder.panHandlers} style={styles.dragZone}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Pilih Perangkat yang Ingin Dilacak</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetScroll}>
          {devices.map((device) => (
            <TouchableOpacity 
              key={device.id} 
              style={[styles.deviceCard, !device.isConnected && styles.deviceCardInactive]}
              onPress={() => handleTrackDevice(device)}
              activeOpacity={device.isConnected ? 0.7 : 1}
            >
              <View style={styles.deviceCardLeft}>
                <View style={[styles.deviceIconWrapper, !device.isConnected && { backgroundColor: '#F3F4F6' }]}>
                  <DeviceIcon color={device.isConnected ? primaryColor : '#9CA3AF'} size={28} />
                </View>
                <View>
                  <Text style={[styles.deviceName, !device.isConnected && { color: '#9CA3AF' }]}>{device.name}</Text>
                  <View style={styles.statusRow}>
                    <Text style={styles.statusLabel}>Status:</Text>
                    <View style={[styles.statusDot, { backgroundColor: device.isConnected ? '#10B981' : '#EF4444' }]} />
                    <Text style={[styles.statusText, { color: device.isConnected ? '#10B981' : '#EF4444' }]}>
                      {device.status}
                    </Text>
                  </View>
                </View>
              </View>
              
              {/* Action Button */}
              <View style={[styles.actionBtn, device.isConnected ? styles.actionBtnActive : styles.actionBtnInactive]}>
                <Text style={device.isConnected ? styles.actionBtnTextActive : styles.actionBtnTextInactive}>Lacak</Text>
              </View>
            </TouchableOpacity>
          ))}
          {/* Extra spacer to account for bottom nav */}
          <View style={{ height: 120 }} />
        </ScrollView>
      </Animated.View>

      {/* Floating Bottom Nav (Island Style) */}
      <View style={styles.floatingNavContainer}>
        <View style={styles.floatingNav}>
          <TouchableOpacity 
            style={styles.navItem} 
            onPress={() => navigation.navigate('Dashboard')}
          >
            <HomeIcon color="#9CA3AF" />
            <Text style={styles.navText}>Beranda</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navItem}>
            <TargetIcon color={primaryColor} />
            <Text style={[styles.navText, { color: primaryColor }]}>Lacak</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => navigation.navigate('Profile')}
          >
            <UserIcon color="#9CA3AF" />
            <Text style={styles.navText}>Profil</Text>
          </TouchableOpacity>
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: bgColor,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 107, 71, 0.95)', // Slightly transparent primary color for a smooth look
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 16 : 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    padding: 6,
  },
  recenterBtn: {
    position: 'absolute',
    right: 20,
    bottom: BOTTOM_SHEET_MIN_HEIGHT + 20, // Lowered closer to the bottom sheet
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 5,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: -(BOTTOM_SHEET_MAX_HEIGHT - BOTTOM_SHEET_MIN_HEIGHT), // Starts collapsed
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    height: BOTTOM_SHEET_MAX_HEIGHT, 
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 10,
  },
  dragZone: {
    paddingTop: 16,
    paddingBottom: 20,
    alignItems: 'center',
  },
  sheetHandle: {
    width: 50,
    height: 5,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
  },
  sheetScroll: {
    paddingBottom: 40,
  },
  deviceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  deviceCardInactive: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  deviceCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  deviceIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
  },
  actionBtnActive: {
    backgroundColor: primaryColor,
  },
  actionBtnInactive: {
    backgroundColor: '#E5E7EB',
  },
  actionBtnTextActive: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  actionBtnTextInactive: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '700',
  },
  floatingNavContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 30 : 20,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 20,
  },
  floatingNav: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    width: '100%',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    width: 60,
  },
  navText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
  },
});

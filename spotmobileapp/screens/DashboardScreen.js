import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Platform,
  Dimensions,
  Image,
  Alert,
} from 'react-native';
import { Svg, Path, Circle, Rect, Line, Polyline } from 'react-native-svg';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { getSession, getProfile, getUserDevices, saveDeviceLocation, saveMotionLog, updateDevice, saveNotification } from '../constants/supabase';
import { MQTT_TOPICS } from '../constants/mqtt';
import { connectMqtt, subscribeTopic, publishJson, disconnectMqtt, publishText } from '../services/mqttService';

const { width } = Dimensions.get('window');
const primaryColor = COLORS?.primary || '#FF6B47';
const primaryLight = '#FFF0ED'; // Very soft orange tint
const bgColor = '#F4F6F8'; // Modern light cool-gray
const cardColor = '#FFFFFF';

// --- Icon Components ---
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

const DeviceIcon = ({ color, size = 28 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="2" y="4" width="20" height="14" rx="2" ry="2" />
    <Line x1="8" y1="22" x2="16" y2="22" />
    <Line x1="12" y1="18" x2="12" y2="22" />
    <Rect x="14" y="10" width="8" height="12" rx="2" ry="2" fill={cardColor} />
    <Rect x="14" y="10" width="8" height="12" rx="2" ry="2" />
  </Svg>
);

const BatteryIcon = ({ level, color }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="2" y="7" width="16" height="10" rx="2" ry="2" />
    <Line x1="22" y1="11" x2="22" y2="13" />
    <Rect x="4" y="9" width={12 * (level / 100)} height="6" fill={color} stroke="none" />
  </Svg>
);

const LockIcon = ({ isLocked, color }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    {isLocked ? (
      <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
    ) : (
      <Path d="M7 11V7a5 5 0 0 1 9.9-1" />
    )}
  </Svg>
);

const AlarmIcon = ({ color }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <Line x1="12" y1="9" x2="12" y2="13" />
    <Line x1="12" y1="17" x2="12.01" y2="17" />
  </Svg>
);

const HomeIcon = ({ color }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <Polyline points="9 22 9 12 15 12 15 22" />
  </Svg>
);

const TargetIcon = ({ color }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Circle cx="12" cy="12" r="3" />
    <Line x1="12" y1="2" x2="12" y2="6" />
    <Line x1="12" y1="18" x2="12" y2="22" />
    <Line x1="2" y1="12" x2="6" y2="12" />
    <Line x1="18" y1="12" x2="22" y2="12" />
  </Svg>
);

const ProfileIcon = ({ color }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <Circle cx="12" cy="7" r="4" />
  </Svg>
);

// --- Component ---
export default function DashboardScreen({ navigation }) {
  const [firstName, setFirstName] = useState('User');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [mqttClient, setMqttClient] = useState(null);
  const [isMqttConnected, setIsMqttConnected] = useState(false);
  const [devices, setDevices] = useState([]);
  const devicesRef = useRef([]);
  const lowBatteryNotified = useRef({});
  const lastSavedBattery = useRef({}); // Untuk menyimpan angka baterai terakhir
  const lastSavedLocation = useRef({}); // Untuk menyimpan lokasi terakhir
  const userIdRef = useRef(null);
  const [latestSensorByIdentifier, setLatestSensorByIdentifier] = useState({});

  useEffect(() => {
    const client = connectMqtt({
      onConnect: async () => {
        setIsMqttConnected(true);
        try {
          await subscribeTopic(client, MQTT_TOPICS.sensorData);
          await subscribeTopic(client, MQTT_TOPICS.motionDetected);
          await subscribeTopic(client, 'esp32/status');
        } catch (error) {
          console.error('MQTT subscribe error:', error);
        }
      },
      onMessage: async (topic, message) => {
        try {
          // Helper untuk mendapatkan userId jika belum di-set
          const ensureUserId = async () => {
            if (userIdRef.current) return userIdRef.current;
            const { session } = await getSession();
            if (session?.user?.id) {
              userIdRef.current = session.user.id;
              return session.user.id;
            }
            return null;
          };

          if (topic === 'esp32/status') {
            const currentDevices = devicesRef.current;
            if (currentDevices.length > 0) {
              const firstDeviceIdentifier = currentDevices[0].identifier || currentDevices[0].id;
              const isOnline = message === 'ONLINE';

              setLatestSensorByIdentifier((prev) => ({
                ...prev,
                [firstDeviceIdentifier]: {
                  ...prev[firstDeviceIdentifier],
                  online: isOnline
                },
              }));

              if (!isOnline) {
                // Notifikasi In-App (Simpan ke database Supabase)
                const uId = await ensureUserId();
                if (uId) {
                  await saveNotification({
                    userId: uId,
                    deviceId: currentDevices[0]?.dbId || null,
                    title: '🔌 Perangkat Terputus',
                    body: 'Koneksi perangkat SPOT terputus. Pastikan alat menyala.',
                    data: { type: 'alarm' }
                  });
                }
                Alert.alert('Perangkat Terputus', 'Koneksi MQTT perangkat SPOT Anda terputus.');
              }
            }
            return;
          }

          const payload = JSON.parse(message);
          const identifier = payload?.deviceId || payload?.identifier || payload?.device_id;
          console.log('[MQTT sensorData] Payload:', payload);
          console.log('[MQTT sensorData] Identifier:', identifier);
          if (!identifier) {
            console.warn('[MQTT] No identifier found in payload');
            return;
          }

          if (topic === MQTT_TOPICS.motionDetected) {
            if (payload.acc_peak != null) {
              const { error } = await saveMotionLog({
                deviceIdentifier: identifier,
                accPeak: payload.acc_peak,
              });
              if (error) console.error('Save motion log error:', error);

              // Notifikasi In-App (Simpan ke DB)
              const uId = await ensureUserId();
              if (uId) {
                const currentDevices = devicesRef.current;
                const matchedDevice = currentDevices.find(d => d.identifier === identifier);
                await saveNotification({
                  userId: uId,
                  deviceId: matchedDevice?.dbId || null,
                  title: '🚨 PERINGATAN KEAMANAN!',
                  body: `Terdeteksi pergerakan mencurigakan pada perangkat SPOT!`,
                  data: { type: 'activity' }
                });
              }
              Alert.alert('Peringatan Keamanan', 'Terdeteksi pergerakan mencurigakan pada perangkat SPOT Anda!');
            }
            return;
          }

          if (topic === MQTT_TOPICS.sensorData) {
            setLatestSensorByIdentifier((prev) => ({
              ...prev,
              [identifier]: { ...prev[identifier], ...payload, online: true },
            }));

            if (payload.battPct != null) {
              const currentDevices = devicesRef.current;
              console.log('[MQTT Battery] battPct:', payload.battPct, 'currentDevices:', currentDevices.length);
              const matchedDevice = currentDevices.find(d => d.identifier === identifier);
              console.log('[MQTT Battery] matchedDevice:', matchedDevice);
              if (matchedDevice?.dbId) {
                console.log('[MQTT Battery] Updating device', matchedDevice.dbId, 'with battery', payload.battPct);
                await updateDevice(matchedDevice.dbId, { battery_percentage: payload.battPct });
                lastSavedBattery.current[identifier] = payload.battPct;
                console.log('[MQTT Battery] Update sent to DB');
              } else {
                console.warn('[MQTT Battery] No matchedDevice or dbId:', matchedDevice);
              }

              if (payload.battPct <= 20 && !lowBatteryNotified.current[identifier]) {
                // Notifikasi In-App Baterai Lemah
                const uId = await ensureUserId();
                if (uId) {
                  await saveNotification({
                    userId: uId,
                    deviceId: matchedDevice?.dbId || null,
                    title: '🔋 Baterai Lemah',
                    body: `Baterai SPOT tersisa ${payload.battPct}%. Segera isi daya agar alat tetap aktif.`,
                    data: { type: 'default' }
                  });
                }

                lowBatteryNotified.current[identifier] = true;
              } else if (payload.battPct > 20) {
                lowBatteryNotified.current[identifier] = false;
              }
            }

            // Simpan lokasi ke database jika ada latitude dan longitude di MQTT
            // --- BLOK PENYIMPANAN LOKASI YANG SUDAH DIOPTIMASI ---
            if (payload.lat != null && payload.lng != null && payload.lat !== 0) {
              
              // Cek memori lokasi terakhir untuk alat ini
              const lastLoc = lastSavedLocation.current[identifier];

              // Filter: Simpan JIKA belum ada data sama sekali, ATAU alat bergeser > 0.0001 derajat (~11 meter)
              const isSignificantMove = !lastLoc || 
                Math.abs(payload.lat - lastLoc.lat) > 0.0001 || 
                Math.abs(payload.lng - lastLoc.lng) > 0.0001;

              if (isSignificantMove) {
                const { error } = await saveDeviceLocation({
                  deviceIdentifier: identifier,
                  lat: payload.lat,
                  lng: payload.lng,
                  heading: payload.heading ?? null,
                });

                if (!error) {
                  // Jika berhasil simpan, perbarui memori dengan koordinat terbaru ini
                  lastSavedLocation.current[identifier] = { lat: payload.lat, lng: payload.lng };
                  console.log(`[Filter Aktif] Lokasi baru ${identifier} disimpan ke Database!`);
                } else {
                  console.error('Save location error:', error);
                }
              }
            }
            // -----------------------------------------------------
          }
        } catch (error) {
          console.error('MQTT payload parse error:', error);
        }
      },
      onError: (error) => {
        console.error('MQTT connection error:', error);
      },
      onClose: () => {
        setIsMqttConnected(false);
      },
    });

    setMqttClient(client);

    return () => {
      disconnectMqtt(client);
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchUserProfile = async () => {
        try {
          const { session } = await getSession();
          if (session?.user?.id) {
            userIdRef.current = session.user.id;
            const { devices: fetchedDevices } = await getUserDevices(session.user.id);
            console.log('[Dashboard] Fetched devices from DB:', fetchedDevices);
            if (fetchedDevices?.length) {
              const mappedDevices = fetchedDevices.map((item) => ({
                id: item.identifier || item.id,
                dbId: item.id,
                name: item.name,
                identifier: item.identifier,
                battery: item.battery_percentage || 90, // Dummy 90% jika 0 atau belum ada data
                isConnected: false,
                isLocked: item.mode === 'Locked',
                buzzerOn: item.buzzer_on || false,
                isActive: item.is_active || false,
              }));
              console.log('[Dashboard] Mapped devices:', mappedDevices);
              setDevices(mappedDevices);
              devicesRef.current = mappedDevices;
            }

            const { profile } = await getProfile(session.user.id);
            if (profile?.full_name) {
              const firstNameOnly = profile.full_name.split(' ')[0];
              setFirstName(firstNameOnly);
            }
            if (profile?.avatar_url) {
              setAvatarUrl(`${profile.avatar_url}?t=${Date.now()}`);
            }
          }
        } catch (error) {
          console.error('Failed to fetch profile:', error);
        }
      };

      fetchUserProfile();
    }, [])
  );

  const devicesToRender = devices.length
    ? devices.map((device) => {
      const liveData = latestSensorByIdentifier[device.identifier || device.id] || {};
      let currentBattery = Number.isFinite(liveData?.battPct) ? liveData.battPct : device.battery;
      if (currentBattery === 0) currentBattery = 90; // Fallback ke 90% (dummy) jika bernilai 0

      return {
        ...device,
        battery: currentBattery,

        // Perangkat hanya 'Connected' jika belum di-unpair (isActive) DAN sedang online di MQTT
        isConnected: device.isActive && (liveData.online !== false),

        isLocked: typeof liveData?.isLocked === 'boolean' ? liveData.isLocked : device.isLocked,
        latestTemp: liveData?.temperature,
      };
    })
    : [];

  const handleRingAlarm = async (device) => {
    if (!mqttClient || !isMqttConnected) {
      Alert.alert('MQTT Belum Terhubung', 'Pastikan koneksi MQTT aktif sebelum mengirim perintah buzzer.');
      return;
    }

    try {
      await publishText(mqttClient, MQTT_TOPICS.buzzerControl, 'ON');
      Alert.alert('Perintah Terkirim', `Buzzer untuk ${device.name} berhasil dipicu.`);

      // Notifikasi In-App Ring Alarm
      if (userIdRef.current) {
        await saveNotification({
          userId: userIdRef.current,
          deviceId: device.dbId || null,
          title: `Ring Alarm Perangkat ${device.name}`,
          body: `Ring Alarm Perangkat ${device.name} dibunyikan`,
          data: { type: 'alarm' }
        });
      }
    } catch (error) {
      Alert.alert('Gagal Mengirim Perintah', error.message || 'Terjadi kesalahan saat publish MQTT.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={bgColor} />

      {/* Sleek Header */}
      <View style={styles.header}>
        <View style={styles.headerTextGroup}>
          <Text style={styles.greeting}>Halo, {firstName}! 👋</Text>
          <Text style={styles.subtitle}>Siap melacak perangkatmu?</Text>
        </View>
        <TouchableOpacity style={styles.profileAvatar}>
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={styles.profileAvatarImage}
              onError={() => {
                console.warn('DashboardScreen: avatar URL broken, clearing...');
                setAvatarUrl(null);
              }}
            />
          ) : (
            <Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase()}</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Perangkat Saya</Text>
          <Text style={styles.connectionLabel}>{isMqttConnected ? 'MQTT Online' : 'MQTT Offline'}</Text>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('Notification')}
          >
            <BellIcon color="#6B7280" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        {/* Device Cards Grid/List */}
        <View style={styles.deviceList}>
          {devicesToRender.map((device) => {
            const isConnected = device.isConnected;
            const statusColor = isConnected ? '#10B981' : '#EF4444';
            const statusBg = isConnected ? '#D1FAE5' : '#FEE2E2';

            return (
              <View key={device.id} style={styles.card}>

                {/* Top Row: Icon & Status */}
                <View style={styles.cardHeader}>
                  <View style={[styles.deviceIconWrapper, { backgroundColor: isConnected ? primaryLight : '#F3F4F6' }]}>
                    <DeviceIcon color={isConnected ? primaryColor : '#9CA3AF'} />
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                    <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                    <Text style={[styles.statusText, { color: statusColor }]}>
                      {isConnected ? 'Connected' : 'Disconnected'}
                    </Text>
                  </View>
                </View>

                {/* Middle Row: Name & Quick Stats */}
                <Text style={styles.deviceName}>{device.name}</Text>

                <View style={styles.statsRow}>
                  <View style={styles.statPill}>
                    <BatteryIcon level={device.battery} color={device.battery > 20 ? '#10B981' : '#EF4444'} />
                    <Text style={styles.statText}>{device.battery}%</Text>
                  </View>
                  <View style={styles.statPill}>
                    <LockIcon isLocked={device.isLocked} color="#6B7280" />
                    <Text style={styles.statText}>{device.isLocked ? 'Locked' : 'Unlocked'}</Text>
                  </View>
                </View>

                {typeof device.latestTemp === 'number' && (
                  <Text style={styles.liveTelemetryText}>Suhu terbaru: {device.latestTemp}°C</Text>
                )}

                {/* Bottom Row: Actions */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.btnOutline, !isConnected && styles.btnOutlineDisabled]}
                    disabled={!isConnected}
                    onPress={() => handleRingAlarm(device)}
                  >
                    <AlarmIcon color={isConnected ? primaryColor : '#9CA3AF'} />
                    <Text style={[styles.btnOutlineText, !isConnected && styles.btnOutlineTextDisabled]}>Ring Alarm</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.btnSolid}
                    onPress={() => navigation.navigate('DeviceDetail', { device })}
                  >
                    <Text style={styles.btnSolidText}>Detail</Text>
                  </TouchableOpacity>
                </View>

              </View>
            );
          })}
        </View>

        {/* Add Device Button */}
        <TouchableOpacity
          style={styles.addDeviceCard}
          onPress={() => navigation.navigate('AddDevice')}
        >
          <PlusIcon color={primaryColor} />
          <Text style={styles.addDeviceText}>Tambahkan Perangkat Baru</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Floating Bottom Navigation */}
      <View style={styles.floatingNavContainer}>
        <View style={styles.floatingNav}>
          <TouchableOpacity style={styles.navItem}>
            <HomeIcon color={primaryColor} />
            <Text style={[styles.navText, { color: primaryColor }]}>Beranda</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate('TrackDevice')}
          >
            <TargetIcon color="#9CA3AF" />
            <Text style={styles.navText}>Lacak</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate('Profile')}
          >
            <ProfileIcon color="#9CA3AF" />
            <Text style={styles.navText}>Profil</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: bgColor,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 20 : 20,
    paddingBottom: 10,
  },
  headerTextGroup: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: primaryColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: primaryColor,
  },
  profileAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120, // Extra space for floating nav
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  connectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    marginLeft: 'auto',
    marginRight: 8,
  },
  iconBtn: {
    padding: 8,
    backgroundColor: '#FFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  deviceList: {
    gap: 16,
    marginBottom: 16,
  },
  card: {
    backgroundColor: cardColor,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardInactive: {
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  deviceIconWrapper: {
    width: 54,
    height: 54,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
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
  deviceName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
  },
  statText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  liveTelemetryText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  btnOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: primaryLight,
    borderRadius: 14,
    paddingVertical: 12,
    gap: 6,
  },
  btnOutlineDisabled: {
    backgroundColor: '#F3F4F6',
  },
  btnOutlineText: {
    fontSize: 14,
    fontWeight: '700',
    color: primaryColor,
  },
  btnOutlineTextDisabled: {
    color: '#9CA3AF',
  },
  btnSolid: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: primaryColor,
    borderRadius: 14,
    paddingVertical: 12,
    shadowColor: primaryColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  btnSolidText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  addDeviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: primaryLight,
    borderWidth: 2,
    borderColor: primaryColor,
    borderStyle: 'dashed',
    borderRadius: 20,
    padding: 18,
    gap: 12,
    marginTop: 8,
  },
  addDeviceText: {
    fontSize: 16,
    fontWeight: '700',
    color: primaryColor,
  },
  floatingNavContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 30 : 20,
    left: 20,
    right: 20,
    alignItems: 'center',
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

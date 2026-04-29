import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Platform,
  Animated,
  Modal,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Svg, Path, Circle, Rect, Line, Polyline } from 'react-native-svg';
import { COLORS } from '../constants/colors';

const primaryColor = COLORS?.primary || '#FF6B47';
const primaryLight = '#FFF0ED';
const bgColor = '#F4F6F8';
const cardColor = '#FFFFFF';

// --- Icon Components ---
const ArrowLeftIcon = ({ color, size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Line x1="19" y1="12" x2="5" y2="12" />
    <Polyline points="12 19 5 12 12 5" />
  </Svg>
);

const EditIcon = ({ color, size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </Svg>
);

const DeviceIconBig = ({ color, size = 64 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="2" y="4" width="20" height="14" rx="2" ry="2" />
    <Line x1="8" y1="22" x2="16" y2="22" />
    <Line x1="12" y1="18" x2="12" y2="22" />
    <Rect x="14" y="10" width="8" height="12" rx="2" ry="2" fill={cardColor} />
    <Rect x="14" y="10" width="8" height="12" rx="2" ry="2" />
  </Svg>
);

const BatteryIcon = ({ level, color }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
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

const TargetIcon = ({ color, size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Circle cx="12" cy="12" r="3" />
    <Line x1="12" y1="2" x2="12" y2="6" />
    <Line x1="12" y1="18" x2="12" y2="22" />
    <Line x1="2" y1="12" x2="6" y2="12" />
    <Line x1="18" y1="12" x2="22" y2="12" />
  </Svg>
);

const ArrowRightIcon = ({ color }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Polyline points="12 16 16 12 12 8" />
    <Line x1="8" y1="12" x2="16" y2="12" />
  </Svg>
);

// --- Component ---
export default function DeviceDetailScreen({ navigation, route }) {
  // Use passed params or fallback to mock data
  const device = route?.params?.device || {
    id: 'SPOT-1',
    name: 'SPOT-1',
    battery: 90,
    isConnected: true,
    isLocked: true,
  };

  const [isLocked, setIsLocked] = useState(device.isLocked);
  const [isConnected, setIsConnected] = useState(device.isConnected);
  const [deviceName, setDeviceName] = useState(device.name);

  // Rename Modal Logic
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [renameInput, setRenameInput] = useState(device.name);

  const handleRenameDevice = () => {
    if (renameInput.trim()) {
      setDeviceName(renameInput.trim());
      setRenameModalVisible(false);
    }
  };

  // Connection Modal Logic
  const [modalVisible, setModalVisible] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('idle'); // 'connecting', 'success', 'failed'

  const handleToggleConnection = () => {
    if (isConnected) {
      // Direct disconnect for now
      setIsConnected(false);
    } else {
      // Simulate Connection
      setConnectionStatus('connecting');
      setModalVisible(true);
      
      // Simulate API call delay (2 seconds)
      setTimeout(() => {
        // Randomize success/fail for testing purposes (50% chance)
        const isSuccess = Math.random() > 0.5;
        
        if (isSuccess) {
          setConnectionStatus('success');
          setIsConnected(true);
        } else {
          setConnectionStatus('failed');
          setIsConnected(false);
        }
      }, 2000);
    }
  };

  // Custom Animated Toggle Logic
  const [trackWidth, setTrackWidth] = useState(0);
  const toggleAnim = useRef(new Animated.Value(device.isLocked ? 1 : 0)).current;

  const toggleMode = () => {
    const newValue = !isLocked;
    setIsLocked(newValue);
    Animated.timing(toggleAnim, {
      toValue: newValue ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const thumbTranslateX = toggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [4, (trackWidth / 2) - 2] // 4 is left padding, 2 is adjustment
  });

  const logs = [
    { time: '10 April 2026, 14:05:30', text: 'Perangkat berhasil terhubung', type: 'normal' },
    { time: '10 April 2026, 14:05:40', text: 'Lokasi terakhir Perangkat tersimpan', type: 'normal' },
    { time: '10 April 2026, 14:06:45', text: 'Mode \'Locked\' diaktifkan', type: 'normal' },
    { time: '10 April 2026, 15:05:40', text: 'Lokasi terakhir Perangkat tersimpan', type: 'normal' },
    { time: '10 April 2026, 15:30:03', text: 'Terdeteksi pergerakan mencurigakan', type: 'danger' },
    { time: '10 April 2026, 15:33:22', text: 'Alarm Perangkat berhasil dibunyikan', type: 'normal' },
    { time: '10 April 2026, 15:34:10', text: 'Alarm Perangkat berhasil dibunyikan', type: 'normal' },
    { time: '10 April 2026, 16:05:40', text: 'Lokasi terakhir Perangkat tersimpan', type: 'normal' },
    { time: '10 April 2026, 16:10:50', text: 'Mode \'Locked\' dinonaktifkan', type: 'normal' },
    { time: '10 April 2026, 16:20:13', text: 'Baterai perangkat di bawah 5%', type: 'danger' },
    { time: '10 April 2026, 17:01:40', text: 'Koneksi perangkat terputus', type: 'normal' },
  ];

  const statusColor = isConnected ? '#10B981' : '#EF4444';
  const statusBg = isConnected ? '#D1FAE5' : '#FEE2E2';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={bgColor} />
      
      {/* Sleek Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeftIcon color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Perangkat</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Main Device Card */}
        <View style={styles.card}>
          <View style={styles.cardTopRow}>
            {/* Big Icon */}
            <View style={styles.bigIconContainer}>
              <DeviceIconBig color={primaryColor} />
            </View>

            {/* Info */}
            <View style={styles.deviceInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.deviceName}>{deviceName}</Text>
                <TouchableOpacity style={styles.editBtn} onPress={() => {
                  setRenameInput(deviceName);
                  setRenameModalVisible(true);
                }}>
                  <EditIcon color={primaryColor} />
                </TouchableOpacity>
              </View>

              <View style={styles.batteryRow}>
                <BatteryIcon level={device.battery} color={device.battery > 20 ? '#10B981' : '#EF4444'} />
                <Text style={styles.batteryText}>{device.battery}%</Text>
              </View>

              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Status:</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                  <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                  <Text style={[styles.statusText, { color: statusColor }]}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Connection Actions */}
          <View style={styles.actionGroupRow}>
            <TouchableOpacity 
              style={styles.btnOutline}
              onPress={() => navigation.navigate('EditConnection')}
            >
              <Text style={styles.btnOutlineText}>Ubah Koneksi</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.btnSolid, isConnected && styles.btnSolidDanger]}
              onPress={handleToggleConnection}
            >
              <Text style={styles.btnSolidText}>
                {isConnected ? 'Unpair' : 'Pair'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Mode Settings */}
          <View style={styles.modeSection}>
            <View style={styles.modeHeader}>
              <Text style={styles.modeLabel}>Mode Perangkat</Text>
            </View>
            <View style={styles.customToggleContainer}>
              <TouchableOpacity 
                activeOpacity={1} 
                onPress={toggleMode}
                disabled={!isConnected}
                style={[styles.customToggleTrack, !isConnected && styles.customToggleTrackDisabled]}
                onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
              >
                <Animated.View style={[styles.customToggleThumb, !isConnected && styles.customToggleThumbDisabled, { transform: [{ translateX: thumbTranslateX }] }]} />
                
                <View style={styles.customToggleLabelContainer}>
                  <View style={styles.customToggleLabel}>
                    <LockIcon isLocked={false} color={!isConnected ? '#D1D5DB' : (!isLocked ? primaryColor : '#9CA3AF')} size={16} />
                    <Text style={[styles.customToggleText, !isConnected && styles.customToggleTextDisabled, !isLocked && !isConnected === false && styles.customToggleTextActive]}>Unlocked</Text>
                  </View>
                  <View style={styles.customToggleLabel}>
                    <LockIcon isLocked={true} color={!isConnected ? '#D1D5DB' : (isLocked ? primaryColor : '#9CA3AF')} size={16} />
                    <Text style={[styles.customToggleText, !isConnected && styles.customToggleTextDisabled, isLocked && !isConnected === false && styles.customToggleTextActive]}>Locked</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.actionGroupRow}>
              <TouchableOpacity 
                style={[styles.btnOutlinePill, !isConnected && styles.btnOutlineDisabled]}
                disabled={!isConnected}
              >
                <AlarmIcon color={isConnected ? primaryColor : '#9CA3AF'} />
                <Text style={[styles.btnOutlineText, !isConnected && styles.btnOutlineTextDisabled]}>Ring Alarm</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.btnSolid, !isConnected && styles.btnSolidDisabled]}
                disabled={!isConnected}
                onPress={() => navigation.navigate('TrackDevice', { focusDevice: device })}
              >
                <TargetIcon color={isConnected ? '#FFF' : '#E5E7EB'} />
                <Text style={[styles.btnSolidText, !isConnected && styles.btnSolidTextDisabled]}>Lacak</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Activity Log */}
        <View style={styles.logSection}>
          <Text style={styles.logSectionTitle}>Log Aktivitas Perangkat</Text>
          <View style={styles.logCard}>
            {logs.map((log, index) => (
              <View key={index} style={styles.logItem}>
                <View style={[styles.logTimelineDot, log.type === 'danger' && styles.logTimelineDotDanger]} />
                <View style={styles.logContent}>
                  <Text style={[styles.logTime, log.type === 'danger' && styles.logTimeDanger]}>[{log.time}]</Text>
                  <Text style={[styles.logText, log.type === 'danger' && styles.logTextDanger]}>
                    {log.text}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>

      {/* IoT Connection Simulation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          if (connectionStatus !== 'connecting') setModalVisible(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {connectionStatus === 'connecting' && (
              <View style={styles.modalStateContainer}>
                <View style={styles.modalIconWrap}>
                  <View style={styles.modalIconBg}>
                    <Svg width={68} height={68} viewBox="0 0 100 100" fill="none">
                      <Path d="M20 40 C30 15 70 15 80 40" stroke={primaryColor} strokeWidth={6} strokeLinecap="round" />
                      <Path d="M32 50 C40 30 60 30 68 50" stroke={primaryColor} strokeWidth={6} strokeLinecap="round" />
                      <Path d="M43 60 C47 50 53 50 57 60" stroke={primaryColor} strokeWidth={6} strokeLinecap="round" />
                      <Rect x="35" y="45" width="30" height="45" rx="8" fill={primaryColor} />
                      <Line x1="45" y1="80" x2="55" y2="80" stroke="#FFF" strokeWidth={3} strokeLinecap="round" />
                    </Svg>
                  </View>
                  <View style={styles.modalSpinnerWrap}>
                    <ActivityIndicator size="small" color={primaryColor} />
                  </View>
                </View>
                <Text style={styles.modalTitle}>Sedang menghubungkan ke perangkat</Text>
                <Text style={styles.modalSubtitle}>Tunggu sekitar 10-20 detik</Text>
              </View>
            )}

            {connectionStatus === 'success' && (
              <View style={styles.modalStateContainer}>
                <View style={[styles.statusSquare, styles.statusSquareSuccess]}>
                  <Svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
                    <Polyline points="20 6 9 17 4 12" />
                  </Svg>
                </View>
                <Text style={styles.modalTitle}>Perangkat <Text style={{ color: primaryColor }}>SPOT</Text> berhasil terhubung</Text>
                <Text style={styles.modalSubtitle}>Perangkat sekarang siap digunakan.</Text>
                <TouchableOpacity style={styles.modalBtn} onPress={() => setModalVisible(false)}>
                  <Text style={styles.modalBtnText}>Selesai</Text>
                </TouchableOpacity>
              </View>
            )}

            {connectionStatus === 'failed' && (
              <View style={styles.modalStateContainer}>
                <View style={[styles.statusSquare, styles.statusSquareDanger]}>
                  <Svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
                    <Line x1="18" y1="6" x2="6" y2="18" />
                    <Line x1="6" y1="6" x2="18" y2="18" />
                  </Svg>
                </View>
                <Text style={styles.modalTitle}>Perangkat <Text style={{ color: '#EF4444' }}>SPOT</Text> gagal terhubung</Text>
                <Text style={styles.modalSubtitle}>Silahkan coba lagi!</Text>
                <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#EF4444' }]} onPress={handleToggleConnection}>
                  <Text style={styles.modalBtnText}>Coba Lagi</Text>
                </TouchableOpacity>
              </View>
            )}

          </View>
        </View>
      </Modal>

      {/* Rename Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={renameModalVisible}
        onRequestClose={() => setRenameModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rename Perangkat</Text>
            
            <TextInput
              style={styles.renameInput}
              placeholder="Masukkan nama perangkat..."
              placeholderTextColor="#9CA3AF"
              value={renameInput}
              onChangeText={setRenameInput}
            />
            
            <TouchableOpacity 
              style={styles.modalBtn}
              onPress={handleRenameDevice}
            >
              <Text style={styles.modalBtnText}>Simpan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 16 : 16,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: cardColor,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFF',
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 71, 0.15)',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.18,
    shadowRadius: 30,
    elevation: 10,
  },
  modalStateContainer: {
    alignItems: 'center',
  },
  modalIconWrap: {
    width: 112,
    height: 112,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalIconBg: {
    width: 112,
    height: 112,
    borderRadius: 32,
    backgroundColor: primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 71, 0.12)',
  },
  modalSpinnerWrap: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 71, 0.16)',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F2937',
    marginTop: 2,
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: 28,
  },
  modalSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  statusSquare: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: primaryColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: primaryColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  statusSquareSuccess: {
    backgroundColor: primaryColor,
  },
  statusSquareDanger: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
  },
  cardTopRow: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  bigIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  deviceInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  deviceName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    marginRight: 8,
  },
  editBtn: {
    padding: 4,
  },
  batteryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  batteryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginLeft: 6,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginRight: 8,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
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
  actionGroupRow: {
    flexDirection: 'row',
    gap: 12,
  },
  btnOutline: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: primaryColor,
    borderRadius: 14,
    paddingVertical: 12,
  },
  btnOutlinePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: primaryLight,
    borderRadius: 14,
    paddingVertical: 12,
    gap: 8,
  },
  btnOutlineText: {
    fontSize: 14,
    fontWeight: '700',
    color: primaryColor,
  },
  btnOutlineDisabled: {
    backgroundColor: '#F3F4F6',
  },
  btnOutlineTextDisabled: {
    color: '#9CA3AF',
  },
  btnSolid: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: primaryColor,
    borderRadius: 14,
    paddingVertical: 12,
    gap: 6,
    shadowColor: primaryColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  btnSolidDanger: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
  },
  btnSolidText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },
  btnSolidDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  btnSolidTextDisabled: {
    color: '#E5E7EB',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 20,
  },
  modeHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  modeLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#374151',
  },
  customToggleContainer: {
    width: '100%',
    marginBottom: 24,
  },
  customToggleTrack: {
    height: 48,
    backgroundColor: '#F3F4F6', // Lighter gray
    borderRadius: 24,
    flexDirection: 'row',
    position: 'relative',
    padding: 4,
  },
  customToggleThumb: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    width: '50%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  customToggleLabelContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'center',
  },
  customToggleLabel: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    zIndex: 2,
  },
  customToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  customToggleTextActive: {
    color: primaryColor,
    fontWeight: '800',
  },
  customToggleTrackDisabled: {
    backgroundColor: '#E5E7EB',
    opacity: 0.6,
  },
  customToggleThumbDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
  },
  customToggleTextDisabled: {
    color: '#B4B9C1',
    fontWeight: '500',
  },
  logSection: {
    marginBottom: 40,
  },
  logSectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
  },
  logCard: {
    backgroundColor: cardColor,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  logItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  logTimelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
    marginTop: 6,
    marginRight: 12,
  },
  logTimelineDotDanger: {
    backgroundColor: primaryColor,
  },
  logContent: {
    flex: 1,
  },
  logTime: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    marginBottom: 2,
  },
  logText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
  },
  logTextDanger: {
    color: primaryColor,
    fontWeight: '700',
  },
  logTimeDanger: {
    color: 'rgba(255, 107, 71, 0.65)',
  },
  modalBtn: {
    backgroundColor: primaryColor,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  modalBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalBtnOutline: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalBtnOutlineText: {
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '700',
  },
  renameInput: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: primaryColor,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#1F2937',
    backgroundColor: '#FFF',
    marginVertical: 16,
    fontWeight: '500',
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Platform,
  Switch,
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
                <Text style={styles.deviceName}>{device.name}</Text>
                <TouchableOpacity style={styles.editBtn}>
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
              style={styles.btnSolid}
              onPress={() => setIsConnected(!isConnected)}
              activeOpacity={0.8}
            >
              <Text style={styles.btnSolidText}>{isConnected ? 'Unpair' : 'Pair'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Mode Settings */}
          <View style={styles.modeSection}>
            <View style={styles.modeHeader}>
              <Text style={styles.modeLabel}>Mode Perangkat</Text>
              <View style={styles.modeToggleRow}>
                <LockIcon isLocked={false} color={!isLocked ? '#6B7280' : '#D1D5DB'} />
                <Text style={[styles.modeText, !isLocked && styles.modeTextActive]}>Unlocked</Text>
                
                <Switch
                  trackColor={{ false: '#D1D5DB', true: primaryLight }}
                  thumbColor={isLocked ? primaryColor : '#FFF'}
                  ios_backgroundColor="#D1D5DB"
                  onValueChange={setIsLocked}
                  value={isLocked}
                  style={styles.switchControl}
                />
                
                <LockIcon isLocked={true} color={isLocked ? primaryColor : '#D1D5DB'} />
                <Text style={[styles.modeText, isLocked && styles.modeTextLockedActive]}>Locked</Text>
              </View>
            </View>

            <View style={styles.actionGroupRow}>
              <TouchableOpacity style={styles.btnOutlinePill}>
                <Text style={styles.btnOutlineText}>Ring Alarm</Text>
                <AlarmIcon color={primaryColor} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnOutlinePill}>
                <Text style={styles.btnOutlineText}>Lacak Perangkat</Text>
                <TargetIcon color={primaryColor} />
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
                  <Text style={styles.logTime}>[{log.time}]</Text>
                  <Text style={[styles.logText, log.type === 'danger' && styles.logTextDanger]}>
                    {log.text}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
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
    borderWidth: 1.5,
    borderColor: primaryColor,
    borderRadius: 20,
    paddingVertical: 16,
    gap: 8,
  },
  btnOutlineText: {
    fontSize: 14,
    fontWeight: '700',
    color: primaryColor,
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
  btnSolidText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 20,
  },
  modeSection: {
    // Container for mode section
  },
  modeHeader: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  modeLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
  },
  modeToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    marginHorizontal: 4,
  },
  modeTextActive: {
    color: '#4B5563',
  },
  modeTextLockedActive: {
    color: primaryColor,
  },
  switchControl: {
    marginHorizontal: 4,
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
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
});

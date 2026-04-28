import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Svg, Path, Circle, Line, Polyline, Rect } from 'react-native-svg';
import { COLORS } from '../constants/colors';

const primaryColor = COLORS?.primary || '#FF6B47';
const bgColor = '#F4F6F8';
const surfaceColor = '#FFFFFF';

// --- Icon Components ---
const ArrowLeftIcon = ({ color, size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Line x1="19" y1="12" x2="5" y2="12" />
    <Polyline points="12 19 5 12 12 5" />
  </Svg>
);

const AlarmIcon = ({ color, size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <Line x1="12" y1="9" x2="12" y2="13" />
    <Line x1="12" y1="17" x2="12.01" y2="17" />
  </Svg>
);

const ActivityIcon = ({ color, size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </Svg>
);

const LockIcon = ({ color, size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </Svg>
);

const CheckIcon = ({ color, size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <Polyline points="22 4 12 14.01 9 11.01" />
  </Svg>
);

// --- Dummy Data ---
const notifications = [
  {
    id: '1',
    title: 'Ring Alarm Perangkat SPOT 1',
    description: 'Ring Alarm Perangkat SPOT 1 dibunyikan sebanyak 5 kali hari ini',
    time: '10:13',
    type: 'alarm',
  },
  {
    id: '2',
    title: 'Terdeteksi Pergerakan pada SPOT 1',
    description: 'Dideteksi pergerakan pada perangkat SPOT 1',
    time: '10:00',
    type: 'activity',
  },
  {
    id: '3',
    title: 'Mode Perangkat SPOT 1',
    description: 'Mode Perangkat SPOT 1 berhasil diubah ke Mode Locked',
    time: '09:40',
    type: 'lock',
  },
  {
    id: '4',
    title: 'Berhasil Terhubung dengan Perangkat SPOT 1',
    description: 'Perangkat SPOT 1 telah terhubung ke jaringan dan siap digunakan',
    time: '09:35',
    type: 'success',
  },
];

// Helper for icon rendering based on type
const getIconForType = (type) => {
  switch (type) {
    case 'alarm':
      return { Icon: AlarmIcon, color: '#EF4444', bg: '#FEE2E2' };
    case 'activity':
      return { Icon: ActivityIcon, color: '#F59E0B', bg: '#FEF3C7' };
    case 'lock':
      return { Icon: LockIcon, color: primaryColor, bg: '#FFF0ED' };
    case 'success':
      return { Icon: CheckIcon, color: '#10B981', bg: '#D1FAE5' };
    default:
      return { Icon: ActivityIcon, color: '#6B7280', bg: '#F3F4F6' };
  }
};

// --- Component ---
export default function NotificationScreen({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <SafeAreaView style={{ flex: 0, backgroundColor: primaryColor }} />
      <SafeAreaView style={styles.innerContainer}>
        <StatusBar barStyle="light-content" backgroundColor={primaryColor} />
        
        {/* Modern Top Header Colored Block */}
        <View style={styles.headerBackground}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <ArrowLeftIcon color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Notifikasi</Text>
            <View style={{ width: 40 }} />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.listContainer}>
            {notifications.map((notif, index) => {
              const { Icon, color, bg } = getIconForType(notif.type);
              const isLast = index === notifications.length - 1;
              
              return (
                <View key={notif.id} style={[styles.notificationCard, isLast && styles.lastCard]}>
                  <View style={[styles.iconContainer, { backgroundColor: bg }]}>
                    <Icon color={color} />
                  </View>
                  
                  <View style={styles.contentContainer}>
                    <View style={styles.titleRow}>
                      <Text style={styles.title}>{notif.title}</Text>
                    </View>
                    <Text style={styles.description}>{notif.description}</Text>
                    <Text style={styles.timeText}>{notif.time}</Text>
                  </View>
                </View>
              );
            })}
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  innerContainer: {
    flex: 1,
    backgroundColor: bgColor,
  },
  headerBackground: {
    backgroundColor: primaryColor,
    paddingTop: Platform.OS === 'android' ? 16 : 10,
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  listContainer: {
    backgroundColor: surfaceColor,
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
    marginTop: 20,
  },
  notificationCard: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  lastCard: {
    borderBottomWidth: 0,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1F2937',
    flex: 1,
  },
  description: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    alignSelf: 'flex-end',
  },
});

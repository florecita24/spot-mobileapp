import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  SafeAreaView,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { Svg, Path, Circle, Line, Polyline, Rect } from 'react-native-svg';
import { COLORS } from '../constants/colors';

const primaryColor = COLORS?.primary || '#FF6B47';
const bgColor = '#F4F6F8';
const surfaceColor = '#FFFFFF';

// --- Icons ---
const BackIcon = ({ color, size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Line x1="19" y1="12" x2="5" y2="12" />
    <Polyline points="12 19 5 12 12 5" />
  </Svg>
);

const UserAvatarIcon = ({ color, size = 100 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <Circle cx="12" cy="7" r="4" />
  </Svg>
);

const PencilIcon = ({ color, size = 16 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </Svg>
);

const LockIcon = ({ color, size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </Svg>
);

const AsteriskIcon = ({ color, size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 6v12" />
    <Path d="M17.196 9L6.804 15" />
    <Path d="M6.804 9l10.392 6" />
  </Svg>
);

export default function EditProfileScreen({ navigation }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // States for modern input focus effects
  const [isOldFocused, setIsOldFocused] = useState(false);
  const [isNewFocused, setIsNewFocused] = useState(false);
  const [isConfirmFocused, setIsConfirmFocused] = useState(false);

  const handleSave = () => {
    // Save logic here
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={primaryColor} />
      
      {/* Header */}
      <View style={styles.headerBackground}>
        <SafeAreaView style={{ flex: 0 }} />
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <BackIcon color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pengaturan Akun</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Profile Picture Section */}
          <View style={styles.profileSection}>
            <View style={styles.avatarWrapper}>
              <UserAvatarIcon color={primaryColor} />
              <TouchableOpacity style={styles.editAvatarBtn} activeOpacity={0.8}>
                <PencilIcon color={primaryColor} size={14} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.nameRow}>
              <Text style={styles.profileName}>Favian Rafi L</Text>
              <TouchableOpacity style={styles.editNameBtn}>
                <PencilIcon color={primaryColor} size={16} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Password Change Form */}
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Ubah Password</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password Lama</Text>
              <View style={[styles.inputWrapper, isOldFocused && styles.inputWrapperFocused]}>
                <View style={styles.iconContainer}>
                  <LockIcon color={isOldFocused ? primaryColor : '#9CA3AF'} size={20} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Masukkan Password Lama Anda..."
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  onFocus={() => setIsOldFocused(true)}
                  onBlur={() => setIsOldFocused(false)}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password Baru</Text>
              <View style={[styles.inputWrapper, isNewFocused && styles.inputWrapperFocused]}>
                <View style={styles.iconContainer}>
                  <LockIcon color={isNewFocused ? primaryColor : '#9CA3AF'} size={20} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Masukkan Password Baru Anda..."
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                  onFocus={() => setIsNewFocused(true)}
                  onBlur={() => setIsNewFocused(false)}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Konfirmasi Password Baru</Text>
              <View style={[styles.inputWrapper, isConfirmFocused && styles.inputWrapperFocused]}>
                <View style={styles.iconContainer}>
                  <AsteriskIcon color={isConfirmFocused ? primaryColor : '#9CA3AF'} size={20} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Masukkan Ulang Password Baru Anda..."
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  onFocus={() => setIsConfirmFocused(true)}
                  onBlur={() => setIsConfirmFocused(false)}
                />
              </View>
            </View>

          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
            <Text style={styles.saveBtnText}>Simpan</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: bgColor,
  },
  headerBackground: {
    backgroundColor: primaryColor,
    paddingTop: Platform.OS === 'android' ? 16 : 10,
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: primaryColor,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFF',
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: primaryColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F2937',
  },
  editNameBtn: {
    padding: 4,
  },
  formContainer: {
    backgroundColor: surfaceColor,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
    elevation: 2,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: bgColor,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  inputWrapperFocused: {
    borderColor: primaryColor,
    backgroundColor: '#FFF',
    shadowColor: primaryColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    height: '100%',
  },
  saveBtn: {
    backgroundColor: primaryColor,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: primaryColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 5,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
});

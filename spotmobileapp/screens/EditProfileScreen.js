import React, { useState, useEffect } from 'react';
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
  Modal,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../constants/colors';
import { getSession, getProfile, updateProfile, changePassword, uploadAvatar } from '../constants/supabase';

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
  const [profileName, setProfileName] = useState('User');
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // States for modern input focus effects
  const [isOldFocused, setIsOldFocused] = useState(false);
  const [isNewFocused, setIsNewFocused] = useState(false);
  const [isConfirmFocused, setIsConfirmFocused] = useState(false);

  // Rename Modal Logic
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [renameInput, setRenameInput] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { session } = await getSession();
        if (session?.user?.id) {
          setUserId(session.user.id);
          const { profile } = await getProfile(session.user.id);
          if (profile?.full_name) {
            setProfileName(profile.full_name);
            setRenameInput(profile.full_name);
                     setAvatarUrl(profile?.avatar_url);
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  const handleRenameProfile = async () => {
    if (renameInput.trim() && userId) {
      setLoading(true);
      try {
        const { error } = await updateProfile(userId, { full_name: renameInput.trim() });
        if (error) {
          setErrorMessage('Gagal mengubah nama: ' + error.message);
          setShowErrorModal(true);
          setTimeout(() => setShowErrorModal(false), 2500);
        } else {
          setProfileName(renameInput.trim());
          setRenameModalVisible(false);
          setSuccessMessage('Nama profil Anda telah berhasil diperbarui.');
          setShowSuccessModal(true);
          setTimeout(() => setShowSuccessModal(false), 2000);
        }
      } catch (error) {
        setErrorMessage('Terjadi kesalahan: ' + error.message);
        setShowErrorModal(true);
        setTimeout(() => setShowErrorModal(false), 2500);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setErrorMessage('Semua field password wajib diisi.');
      setShowErrorModal(true);
      setTimeout(() => setShowErrorModal(false), 2500);
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('Password baru minimal 6 karakter.');
      setShowErrorModal(true);
      setTimeout(() => setShowErrorModal(false), 2500);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Konfirmasi password tidak cocok.');
      setShowErrorModal(true);
      setTimeout(() => setShowErrorModal(false), 2500);
      return;
    }

    if (oldPassword === newPassword) {
      setErrorMessage('Password baru harus berbeda dari password lama.');
      setShowErrorModal(true);
      setTimeout(() => setShowErrorModal(false), 2500);
      return;
    }

    setLoading(true);
    try {
      const { error } = await changePassword(oldPassword, newPassword);

      if (error) {
        setErrorMessage(error.message || 'Gagal mengubah password.');
        setShowErrorModal(true);
        setTimeout(() => setShowErrorModal(false), 2500);
      } else {
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setSuccessMessage('Password Anda telah berhasil diperbarui.');
        setShowSuccessModal(true);
        setTimeout(() => setShowSuccessModal(false), 2000);
      }
    } catch (error) {
      setErrorMessage('Terjadi kesalahan: ' + error.message);
      setShowErrorModal(true);
      setTimeout(() => setShowErrorModal(false), 2500);
    } finally {
      setLoading(false);
    }
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
              {uploadingAvatar ? (
                <ActivityIndicator size="large" color={primaryColor} />
              ) : avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  style={styles.avatarImage}
                />
              ) : (
                <UserAvatarIcon color={primaryColor} />
              )}
              <TouchableOpacity 
                style={styles.editAvatarBtn} 
                activeOpacity={0.8}
                onPress={handlePickAvatar}
                disabled={uploadingAvatar}
              >
                <PencilIcon color={primaryColor} size={14} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.nameRow}>
              <Text style={styles.profileName}>{profileName}</Text>
              <TouchableOpacity style={styles.editNameBtn} onPress={() => {
                setRenameInput(profileName);
                setRenameModalVisible(true);
              }}>
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
          <TouchableOpacity
            style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
            onPress={handleSave}
            activeOpacity={0.8}
            disabled={loading}
          >
            <Text style={styles.saveBtnText}>{loading ? 'Menyimpan...' : 'Simpan'}</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Rename Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={renameModalVisible}
        onRequestClose={() => setRenameModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ubah Nama Profil</Text>
            
            <TextInput
              style={styles.renameInput}
              placeholder="Masukkan nama profil..."
              placeholderTextColor="#9CA3AF"
              value={renameInput}
              onChangeText={setRenameInput}
            />
            
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity 
                style={styles.modalBtn}
                onPress={handleRenameProfile}
                disabled={loading}
              >
                <Text style={styles.modalBtnText}>{loading ? 'Menyimpan...' : 'Simpan'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showSuccessModal}
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.successModalOverlay}>
          <View style={styles.successModalContent}>
            <View style={styles.successIconContainer}>
              <Svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <Polyline points="20 6 9 17 4 12" />
              </Svg>
            </View>
            <Text style={styles.successTitle}>Perubahan Tersimpan!</Text>
            <Text style={styles.successMessage}>{successMessage}</Text>
          </View>
        </View>
      </Modal>

      {/* Error Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showErrorModal}
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={styles.errorModalOverlay}>
          <View style={styles.errorModalContent}>
            <View style={styles.errorIconContainer}>
              <Svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <Circle cx="12" cy="12" r="10" />
                <Line x1="15" y1="9" x2="9" y2="15" />
                <Line x1="9" y1="9" x2="15" y2="15" />
              </Svg>
            </View>
            <Text style={styles.errorTitle}>Gagal!</Text>
            <Text style={styles.errorMessage}>{errorMessage}</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

  const handlePickAvatar = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Denied', 'Izin akses galeri diperlukan untuk mengubah foto profil.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploadingAvatar(true);
        const { uri, fileName } = result.assets[0];
        const { url, error } = await uploadAvatar(userId, uri, fileName || 'avatar.jpg');
        setUploadingAvatar(false);

        if (error) {
          Alert.alert('Upload Gagal', 'Terjadi kesalahan saat mengupload foto profil.');
          console.error('Avatar upload error:', error);
          return;
        }

        setAvatarUrl(url);
        Alert.alert('Sukses', 'Foto profil berhasil diperbarui!');
      }
    } catch (error) {
      setUploadingAvatar(false);
      Alert.alert('Error', 'Terjadi kesalahan: ' + error.message);
      console.error('Image picker error:', error);
    }
  };

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
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
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
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 71, 0.15)',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.18,
    shadowRadius: 30,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 28,
  },
  renameInput: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: primaryColor,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#1F2937',
    backgroundColor: '#FFF',
    marginTop: 16,
    marginBottom: 20,
    fontWeight: '500',
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButtonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  modalBtn: {
    width: '100%',
    backgroundColor: primaryColor,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: primaryColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  modalBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
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
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModalContent: {
    backgroundColor: '#FFF',
    borderRadius: 28,
    paddingVertical: 40,
    paddingHorizontal: 32,
    alignItems: 'center',
    maxWidth: 280,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.15)',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.18,
    shadowRadius: 30,
    elevation: 10,
  },
  successIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  errorModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorModalContent: {
    backgroundColor: '#FFF',
    borderRadius: 28,
    paddingVertical: 40,
    paddingHorizontal: 32,
    alignItems: 'center',
    maxWidth: 280,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.15)',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.18,
    shadowRadius: 30,
    elevation: 10,
  },
  errorIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});

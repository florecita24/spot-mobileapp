import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Svg, Path, Circle, Rect, Line, Polyline } from 'react-native-svg';
import { COLORS } from '../constants/colors';
import { signUp } from '../constants/supabase';

// Fallback colors to ensure stability
const primaryColor = COLORS?.primary || '#FF6B47';
const backgroundColor = '#F9FAFB'; 
const surfaceColor = '#FFFFFF';

export default function SignUpScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // States for modern input focus effects
  const [isUserFocused, setIsUserFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPassFocused, setIsPassFocused] = useState(false);
  const [isConfirmPassFocused, setIsConfirmPassFocused] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSignUp = async () => {
    // Helper function biar error otomatis hilang dalam 2 detik
    const triggerError = (message) => {
      setErrorMessage(message);
      setShowErrorModal(true);
      setTimeout(() => {
        setShowErrorModal(false);
      }, 2000);
    };

    if (!fullName || !email || !password || !confirmPassword) {
      triggerError('Mohon isi semua field');
      return;
    }

    if (password !== confirmPassword) {
      triggerError('Password tidak cocok');
      return;
    }

    if (password.length < 6) {
      triggerError('Password minimal 6 karakter');
      return;
    }

    setLoading(true);
    const { user, error } = await signUp(email, password, fullName);
    setLoading(false);

    if (error) {
      triggerError('Sign up gagal: ' + error.message);
      return;
    }

    if (user) {
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        navigation.navigate('Login');
      }, 2000);
    }
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor={primaryColor} />
      
      {/* Background is Orange/Primary */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Floating White Card */}
        <View style={styles.card}>
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              Buat Akun <Text style={styles.titleHighlight}>SPOT</Text>-mu
            </Text>
            <Text style={styles.subtitle}>
              dan jadilah bagian dari SPOT!
            </Text>
          </View>

          {/* Form Container */}
          <View style={styles.formContainer}>
            
            {/* Full Name Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={[styles.inputWrapper, isUserFocused && styles.inputWrapperFocused]}>
                <View style={styles.iconContainer}>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={isUserFocused ? primaryColor : '#9CA3AF'} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <Circle cx="12" cy="7" r="4" />
                  </Svg>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Masukkan Full Name..."
                  placeholderTextColor="#9CA3AF"
                  value={fullName}
                  onChangeText={setFullName}
                  onFocus={() => setIsUserFocused(true)}
                  onBlur={() => setIsUserFocused(false)}
                />
              </View>
            </View>

            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={[styles.inputWrapper, isEmailFocused && styles.inputWrapperFocused]}>
                <View style={styles.iconContainer}>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={isEmailFocused ? primaryColor : '#9CA3AF'} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <Path d="M22 6l-10 7L2 6" />
                  </Svg>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Masukkan Email..."
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => setIsEmailFocused(false)}
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputWrapper, isPassFocused && styles.inputWrapperFocused]}>
                <View style={styles.iconContainer}>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={isPassFocused ? primaryColor : '#9CA3AF'} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </Svg>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Masukkan Password..."
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setIsPassFocused(true)}
                  onBlur={() => setIsPassFocused(false)}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  {showPassword ? (
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <Circle cx="12" cy="12" r="3" />
                    </Svg>
                  ) : (
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <Line x1="1" y1="1" x2="23" y2="23" />
                    </Svg>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Konfirmasi Password</Text>
              <View style={[styles.inputWrapper, isConfirmPassFocused && styles.inputWrapperFocused]}>
                <View style={styles.iconContainer}>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={isConfirmPassFocused ? primaryColor : '#9CA3AF'} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </Svg>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Masukkan Ulang Password..."
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  onFocus={() => setIsConfirmPassFocused(true)}
                  onBlur={() => setIsConfirmPassFocused(false)}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  {showConfirmPassword ? (
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <Circle cx="12" cy="12" r="3" />
                    </Svg>
                  ) : (
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <Line x1="1" y1="1" x2="23" y2="23" />
                    </Svg>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[styles.signUpButton, loading && styles.signUpButtonDisabled]}
              onPress={handleSignUp}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.signUpButtonText}>Sign Up</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Sudah memiliki akun? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Log In</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>

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
            <Text style={styles.errorTitle}>Sign Up Gagal</Text>
            <Text style={styles.errorMessage}>{errorMessage}</Text>
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
              <Svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <Polyline points="22 4 12 14.01 9 11.01" />
              </Svg>
            </View>
            <Text style={styles.successTitle}>Sign Up Berhasil!</Text>
            <Text style={styles.successMessage}>Silakan login dengan akun Anda.</Text>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: primaryColor, // ORANGE BACKGROUND
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: surfaceColor,
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  titleHighlight: {
    color: primaryColor,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    marginBottom: 8,
  },
  inputGroup: {
    marginBottom: 16,
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
    backgroundColor: backgroundColor,
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
  eyeIcon: {
    padding: 8,
    marginLeft: 8,
  },
  signUpButton: {
    backgroundColor: primaryColor,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
    shadowColor: primaryColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  signUpButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  signUpButtonDisabled: {
    opacity: 0.6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '800',
    color: primaryColor,
  },
  errorModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorModalContent: {
    width: '100%',
    maxWidth: 300,
    backgroundColor: '#FFF',
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.15)',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  errorIconContainer: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
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
    lineHeight: 21,
  },
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  successModalContent: {
    width: '100%',
    maxWidth: 300,
    backgroundColor: '#FFF',
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.15)',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  successIconContainer: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
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
    lineHeight: 21,
  },
});

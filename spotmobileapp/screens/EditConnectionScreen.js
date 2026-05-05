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
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { Svg, Path, Rect, Line, Polyline } from 'react-native-svg';
import { COLORS } from '../constants/colors';
import { supabase } from '../constants/supabase';

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

const WifiIcon = ({ color, size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M5 12.55a11 11 0 0 1 14.08 0" />
    <Path d="M1.42 9a16 16 0 0 1 21.16 0" />
    <Path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <Line x1="12" y1="20" x2="12.01" y2="20" />
  </Svg>
);

const LockIcon = ({ color, size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </Svg>
);

const ChevronDownIcon = ({ color, size = 20, isExpanded }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }}
  >
    <Polyline points="6 9 12 15 18 9" />
  </Svg>
);

// --- Component ---
export default function EditConnectionScreen({ navigation, route }) {
  const device = route?.params?.device || {};
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const [isSsidFocused, setIsSsidFocused] = useState(false);
  const [isPassFocused, setIsPassFocused] = useState(false);

  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  const handleSave = async () => {
    if (!ssid.trim()) {
      navigation.goBack();
      return;
    }

    setSaving(true);
    try {
      const deviceId = device.dbId || device.id;
      if (deviceId) {
        // 1. Cek apakah koneksi untuk device ini sudah ada di database
        const { data: existingConnection } = await supabase
          .from('connections')
          .select('id')
          .eq('device_id', deviceId)
          .single(); // Ambil satu baris saja

        let dbError = null;

        if (existingConnection) {
          // 2. Jika sudah ada, lakukan UPDATE
          const { error } = await supabase
            .from('connections')
            .update({ ssid: ssid.trim(), password: password })
            .eq('device_id', deviceId);
          dbError = error;
        } else {
          // 3. Jika belum ada, lakukan INSERT baru
          const { error } = await supabase
            .from('connections')
            .insert({ device_id: deviceId, ssid: ssid.trim(), password: password });
          dbError = error;
        }

        if (dbError) {
          console.error('Save connection error:', dbError);
        }
      }
    } catch (error) {
      console.error('Connection save error:', error);
    } finally {
      setSaving(false);
      navigation.goBack();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <SafeAreaView style={{ flex: 0, backgroundColor: primaryColor }} />
      <SafeAreaView style={styles.innerContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <StatusBar barStyle="light-content" backgroundColor={primaryColor} />

          {/* Modern Top Header Colored Block */}
          <View style={styles.headerBackground}>
            <View style={styles.header}>
              <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                <ArrowLeftIcon color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Ubah Koneksi Perangkat</Text>
              <View style={{ width: 40 }} />
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

            {/* Form Card */}
            <View style={styles.card}>

              {/* SSID Input */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <WifiIcon color="#4B5563" />
                  <Text style={styles.label}>Nama / SSID Wi-Fi</Text>
                </View>
                <View style={[styles.inputWrapper, isSsidFocused && styles.inputWrapperFocused]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Masukkan Nama Wi-Fi untuk koneksi..."
                    placeholderTextColor="#9CA3AF"
                    value={ssid}
                    onChangeText={setSsid}
                    onFocus={() => setIsSsidFocused(true)}
                    onBlur={() => setIsSsidFocused(false)}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <LockIcon color="#4B5563" />
                  <Text style={styles.label}>Password Wi-Fi</Text>
                </View>
                <View style={[styles.inputWrapper, isPassFocused && styles.inputWrapperFocused]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Masukkan Password Wi-Fi tersebut..."
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setIsPassFocused(true)}
                    onBlur={() => setIsPassFocused(false)}
                  />
                </View>
              </View>

              {/* Save Button */}
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
                <Text style={styles.saveBtnText}>Simpan dan Hubungkan</Text>
              </TouchableOpacity>

            </View>

            {/* Instructions Accordion */}
            <View style={styles.accordionCard}>
              <TouchableOpacity
                style={styles.accordionHeader}
                activeOpacity={0.7}
                onPress={() => setIsAccordionOpen(!isAccordionOpen)}
              >
                <Text style={styles.accordionTitle}>Bagaimana cara menghubungkan perangkat SPOT?</Text>
                <ChevronDownIcon color="#4B5563" isExpanded={isAccordionOpen} />
              </TouchableOpacity>

              {isAccordionOpen && (
                <View style={styles.accordionBody}>
                  <View style={styles.instructionItem}>
                    <Text style={styles.instructionNumber}>1.</Text>
                    <Text style={styles.instructionText}>Masukkan ID perangkat SPOT yang tertera pada perangkat fisik SPOT.</Text>
                  </View>
                  <View style={styles.instructionItem}>
                    <Text style={styles.instructionNumber}>2.</Text>
                    <Text style={styles.instructionText}>Masukkan nama / SSID dan password dari Wi-Fi yang akan dihubungi oleh perangkat SPOT.</Text>
                  </View>
                  <View style={styles.instructionItem}>
                    <Text style={styles.instructionNumber}>3.</Text>
                    <Text style={styles.instructionText}>Simpan Pengaturan, lalu nyalakan perangkat SPOT dengan cara menekan tombol reset selama 5 detik hingga lampu indikator berkedip cepat.</Text>
                  </View>
                  <View style={styles.instructionItem}>
                    <Text style={styles.instructionNumber}>4.</Text>
                    <Text style={styles.instructionText}>Tunggu hingga muncul pesan perangkat terhubung.</Text>
                  </View>
                  <View style={styles.instructionItem}>
                    <Text style={styles.instructionNumber}>5.</Text>
                    <Text style={styles.instructionText}>Perangkat SPOT berhasil terhubung dan Anda dapat mulai memberikan perintah terhadap perangkat SPOT.</Text>
                  </View>
                </View>
              )}
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
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
  card: {
    backgroundColor: surfaceColor,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
    marginTop: 20,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
  },
  inputWrapper: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    justifyContent: 'center',
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
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
  },
  saveBtn: {
    backgroundColor: primaryColor,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: primaryColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
  },
  accordionCard: {
    backgroundColor: surfaceColor,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accordionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    flex: 1,
    marginRight: 10,
  },
  accordionBody: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  instructionNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: primaryColor,
    width: 16,
  },
  instructionText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: '#4B5563',
    fontWeight: '500',
  },
});

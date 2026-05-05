# Tugas Besar II3240 Rekayasa Sistem dan Teknologi Informasi

## SPOT: Smart Protection & Object Tracker - Mobile Application

Aplikasi mobile ini dikembangkan untuk melengkapi ekosistem SPOT sebagai antarmuka pemantauan dan kontrol perangkat IoT langsung dari smartphone.

Kelompok 5  
Anggota:
- Ratukhansa Salsabila / 18223034
- Favian Rafi Laftiyanto / 18223036
- Rafli Dwi Nugraha / 18223038
- Florecita Natawirya / 18223040

### A. Deskripsi

SPOT (Smart Protection & Object Tracker) adalah sistem keamanan IoT terintegrasi berupa perangkat berbasis ESP32 yang dipadukan dengan aplikasi mobile untuk kebutuhan monitoring dan kontrol real-time. Aplikasi ini memungkinkan pengguna untuk:
- mengelola akun dan profil,
- menghubungkan perangkat SPOT ke akun,
- melacak lokasi perangkat di peta,
- memantau status perangkat (mode, koneksi, baterai),
- menerima dan melihat log notifikasi keamanan.

Arsitektur layanan mobile app memanfaatkan integrasi Hybrid antara Backend-as-a-Service (BaaS) dan protokol WebSockets (MQTT):
1. **Supabase (Backend & Database)**  
	Digunakan untuk autentikasi pengguna, penyimpanan data profil, data perangkat, histori lokasi perangkat, serta log notifikasi dan aktivitas.
2. **HiveMQ (MQTT Broker)**  
	Digunakan untuk komunikasi real-time dua arah antara aplikasi mobile dan perangkat ESP32, termasuk telemetry sensor serta command execution (mode lock/unlock dan buzzer).

### B. Fitur Utama

1. **Autentikasi dan Manajemen Akun**  
	Pengguna dapat melakukan registrasi, login, melihat profil, mengubah profil, mengganti password, serta upload foto profil.
2. **Manajemen Perangkat SPOT**  
	Menambahkan perangkat dengan identifier unik dan konfigurasi koneksi (SSID/password), melihat daftar perangkat, serta mengatur status koneksi perangkat.
3. **Monitoring Real-time Perangkat**  
	Dashboard menampilkan status perangkat (online/offline), mode perangkat (Locked/Unlocked), dan persentase baterai berdasarkan data MQTT terbaru.
4. **Tracking Lokasi di Mobile Map**  
	Pengguna dapat melacak posisi perangkat langsung di peta serta melihat posisi pengguna saat ini menggunakan layanan lokasi perangkat mobile.
5. **Kontrol Perangkat (Remote Command)**  
	Aplikasi dapat mengirim perintah ke perangkat untuk mengubah mode keamanan dan memicu buzzer alarm melalui MQTT.
6. **Notifikasi dan Activity Log**  
	Sistem menyimpan notifikasi penting seperti deteksi pergerakan, status koneksi perangkat, baterai lemah, dan aksi kontrol perangkat.

### C. Technology Stack

- **Mobile Framework**: React Native (Expo)
- **Navigation**: React Navigation (Native Stack)
- **Backend, Database, Auth & Storage**: Supabase (PostgreSQL + Auth + Storage)
- **IoT Real-time Communication**: MQTT (Paho MQTT + HiveMQ Cloud via secure WebSocket)
- **Map & Geolocation**: react-native-maps + expo-location
- **Push/Local Notification Support**: expo-notifications
- **Image Upload**: expo-image-picker + expo-file-system

### D. Struktur Proyek

```text
spot-mobileapp/
├─ README.md
├─ package.json
├─ supabase/
│  └─ init.sql
└─ spotmobileapp/
	├─ App.js
	├─ app.json
	├─ eas.json
	├─ package.json
	├─ constants/
	│  ├─ colors.js
	│  ├─ mqtt.js
	│  └─ supabase.js
	├─ screens/
	│  ├─ SplashScreen.js
	│  ├─ LoginScreen.js
	│  ├─ SignUpScreen.js
	│  ├─ DashboardScreen.js
	│  ├─ DeviceDetailScreen.js
	│  ├─ AddDeviceScreen.js
	│  ├─ EditConnectionScreen.js
	│  ├─ NotificationScreen.js
	│  ├─ TrackDeviceScreen.js
	│  ├─ ProfileScreen.js
	│  └─ EditProfileScreen.js
	└─ services/
		└─ mqttService.js
```

### E. Cara Menjalankan Aplikasi

#### 1. Prasyarat
- Node.js LTS
- npm
- Expo CLI (opsional, bisa via `npx expo`)
- Android Studio Emulator / iOS Simulator / Expo Go di perangkat fisik

#### 2. Install Dependency

```bash
cd spotmobileapp
npm install
```

#### 3. Konfigurasi Environment (Disarankan)

Pada saat development, MQTT dapat dikonfigurasi melalui environment variable Expo:

- `EXPO_PUBLIC_MQTT_HOST`
- `EXPO_PUBLIC_MQTT_PORT`
- `EXPO_PUBLIC_MQTT_USER`
- `EXPO_PUBLIC_MQTT_PASSWORD`
- `EXPO_PUBLIC_MQTT_PATH`

Contoh (PowerShell):

```powershell
$env:EXPO_PUBLIC_MQTT_HOST="your-hivemq-host"
$env:EXPO_PUBLIC_MQTT_PORT="8884"
$env:EXPO_PUBLIC_MQTT_USER="your-username"
$env:EXPO_PUBLIC_MQTT_PASSWORD="your-password"
$env:EXPO_PUBLIC_MQTT_PATH="/mqtt"
```

#### 4. Menjalankan Aplikasi

```bash
npm run start
```

Lalu pilih target:
- tekan `a` untuk Android emulator,
- tekan `i` untuk iOS simulator (macOS),
- atau scan QR dari Expo Go untuk perangkat fisik.

### F. Catatan Implementasi

- Data akun, profil, perangkat, lokasi, dan notifikasi disimpan di Supabase.
- Komunikasi command dan telemetry perangkat dilakukan melalui MQTT broker HiveMQ menggunakan koneksi aman `wss`.
- Aplikasi memanfaatkan permission perangkat (lokasi, media library) agar fitur tracking dan upload avatar berjalan optimal.

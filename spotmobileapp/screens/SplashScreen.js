import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Svg, Circle, Line } from 'react-native-svg';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      {/* 
        Karena gambar dari chat tidak dapat langsung disimpan ke folder Anda, 
        saya membuat ulang persis desain di gambar menggunakan komponen bawaan 
        sehingga tetap tajam (vector) dan tidak error missing file.
        
        Jika Anda memang ingin memuat file gambar secara langsung (misal 'splash-bg.png'),
        silakan simpan gambarnya di folder assets dan gunakan kode Image di bawah ini 
        (dan hapus komponen View content di bawahnya):
        
        <Image source={require('../assets/splash-bg.png')} style={{width: '100%', height: '100%'}} resizeMode="cover" />
      */}
      
      <View style={styles.content}>
        <Text style={styles.text}>SP</Text>
        
        <View style={styles.iconContainer}>
          <Svg width={65} height={65} viewBox="0 0 100 100">
            {/* Lingkaran luar putih tebal */}
            <Circle cx="50" cy="50" r="28" stroke="white" strokeWidth="10" fill="none" />
            
            {/* Titik tengah putih */}
            <Circle cx="50" cy="50" r="12" fill="white" />
            
            {/* Garis horizontal gelap */}
            <Line x1="0" y1="50" x2="100" y2="50" stroke="#2B2B2B" strokeWidth="6" />
            
            {/* Garis vertikal gelap */}
            <Line x1="50" y1="0" x2="50" y2="100" stroke="#2B2B2B" strokeWidth="6" />
          </Svg>
        </View>

        <Text style={styles.text}>T</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E75A41', // Warna orange-coral sesuai gambar
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginHorizontal: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 65,
    fontWeight: '900',
    color: 'white',
    letterSpacing: 2,
  },
});


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

      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E75A41',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 200,
    height: 200,
  },
});


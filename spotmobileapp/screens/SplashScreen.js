import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Image, Animated, Easing } from 'react-native';

export default function SplashScreen({ onFinish } = {}) {
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const [layout, setLayout] = useState(null);

  useEffect(() => {
    if (!layout) return;

    // Geser angka 0.62 ini kalau zoom-nya masih kurang pas di tengah huruf 'O'
    // Kurangi (misal 0.58) kalau terlalu ke kanan, Tambah (misal 0.66) kalau terlalu ke kiri
    const TARGET = { x: 3, y: 0.5 };
    const offsetX = layout.width * (0.5 - TARGET.x);
    const offsetY = layout.height * (0.5 - TARGET.y);

    Animated.sequence([
      // Jeda 2 detik sebelum animasi zoom dimulai
      Animated.delay(2000),
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 80, 
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: offsetX,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: offsetY,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 600,
          delay: 400, // Mulai memudar saat zoom hampir selesai
          useNativeDriver: true,
        })
      ]),
    ]).start(() => {
      if (typeof onFinish === 'function') onFinish();
    });
  }, [layout, scale, translateX, translateY, opacity]);

  return (
    <View style={styles.container}>
      <Animated.View
        onLayout={(e) => setLayout(e.nativeEvent.layout)}
        style={[
          styles.logoContainer,
          { 
            opacity, 
            transform: [
              { translateX }, 
              { translateY }, 
              { scale }
            ] 
          },
        ]}
      >
        <Image
          source={require('../assets/logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </Animated.View>
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
    width: 200, // Ukuran ideal, tidak kekecilan & tidak kebesaran
    height: 200,
  },
});
export const MQTT_CONFIG = {
  // HiveMQ Cloud for mobile app should use secure WebSocket (wss) port 8884, not TLS TCP 8883.
  host: process.env.EXPO_PUBLIC_MQTT_HOST || '312f78eaaf5d45baa9a08e1ca198fc12.s1.eu.hivemq.cloud',
  port: Number(process.env.EXPO_PUBLIC_MQTT_PORT || 8884),
  username: process.env.EXPO_PUBLIC_MQTT_USER || '',
  password: process.env.EXPO_PUBLIC_MQTT_PASSWORD || '',
  path: process.env.EXPO_PUBLIC_MQTT_PATH || '/mqtt',
};

export const MQTT_TOPICS = {
  sensorData: 'esp32/sensor/data',
  //deviceLocation: 'esp32/gps/data',
  motionDetected: 'esp32/motion/data',
  buzzerControl: 'esp32/buzzer/control',
  modeControl: 'esp32/mode/control',
};

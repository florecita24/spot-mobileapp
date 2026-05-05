import Paho from 'paho-mqtt';
import { MQTT_CONFIG } from '../constants/mqtt';

let activeMqttClient = null;
// FIX KHUSUS REACT NATIVE: Paho kadang mencari localStorage (bawaan browser). 
// Kita akali dengan membuat storage bohongan agar tidak error di HP.
if (!global.localStorage) {
  global.localStorage = {
    getItem: () => null,
    setItem: () => { },
    removeItem: () => { },
  };
}

export const connectMqtt = ({ onConnect, onMessage, onError, onClose } = {}) => {
  // Bikin Client ID unik agar tidak diblokir oleh HiveMQ
  const clientId = `spot_mobile_${Math.random().toString(16).substring(2, 10)}`;

  // Inisialisasi Paho Client (Host, Port, Path, ClientID)
  const client = new Paho.Client(
    MQTT_CONFIG.host,
    Number(MQTT_CONFIG.port),
    MQTT_CONFIG.path,
    clientId
  );

  activeMqttClient = client;

  // Event: Saat koneksi terputus
  client.onConnectionLost = (responseObject) => {
    if (responseObject.errorCode !== 0) {
      if (typeof onError === 'function') onError(responseObject.errorMessage);
    }
    if (typeof onClose === 'function') onClose();
  };

  // Event: Saat pesan baru masuk
  client.onMessageArrived = (message) => {
    if (typeof onMessage === 'function') {
      onMessage(message.destinationName, message.payloadString);
    }
  };

  // Mulai proses koneksi ke broker
  client.connect({
    userName: MQTT_CONFIG.username,
    password: MQTT_CONFIG.password,
    useSSL: true, // Wajib true untuk koneksi aman HiveMQ
    keepAliveInterval: 30,
    cleanSession: true,
    timeout: 30,
    onSuccess: () => {
      if (typeof onConnect === 'function') onConnect();
    },
    onFailure: (err) => {
      if (typeof onError === 'function') onError(err.errorMessage);
    }
  });

  return client;
};

export const subscribeTopic = (client, topic) => {
  return new Promise((resolve, reject) => {
    // Cek apakah client ada dan sedang terhubung
    if (!client || !client.isConnected()) {
      return reject(new Error('MQTT client belum terhubung'));
    }

    client.subscribe(topic, {
      qos: 1,
      onSuccess: () => resolve(true),
      onFailure: (err) => reject(new Error(err.errorMessage))
    });
  });
};

export const publishJson = (client, topic, payload, qos = 1, retained = false) => {
  return new Promise((resolve, reject) => {
    // Cek apakah client ada dan sedang terhubung
    if (!client || !client.isConnected()) {
      return reject(new Error('MQTT client belum terhubung'));
    }

    try {
      const body = JSON.stringify(payload);
      const message = new Paho.Message(body);

      message.destinationName = topic;
      message.qos = qos;              // Gunakan parameter qos
      message.retained = retained;    // Gunakan parameter retained (Paho MQTT menggunakan istilah 'retained')

      client.send(message);
      resolve(true);
    } catch (err) {
      reject(err);
    }
  });
};

export const disconnectMqtt = (client) => {
  // Tambahkan pengecekan client.isConnected()
  if (client && client.isConnected()) {
    try {
      client.disconnect();
    } catch (err) {
      console.log("Abaikan error disconnect:", err);
    }
  }
};

export const publishText = (client, topic, payload) => {
  return new Promise((resolve, reject) => {
    // Cek apakah client ada dan sedang terhubung
    if (!client || !client.isConnected()) {
      return reject(new Error('MQTT client belum terhubung'));
    }

    try {
      // Untuk publishText, kita langsung jadikan payload sebagai message (bukan JSON)
      const message = new Paho.Message(payload);

      message.destinationName = topic;
      message.qos = 1;

      client.send(message);
      resolve(true);
    } catch (err) {
      reject(err);
    }
  });
};

export const getActiveMqttClient = () => {
  return activeMqttClient;
};
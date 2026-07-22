import { Platform } from 'react-native';

/*
 * Backend stays the same: Node/Express runs on port 5000.
 * Android emulator uses 10.0.2.2 for the host machine.
 * iOS simulator uses localhost.
 * For a real phone, set LAN_HOST to your computer's Wi-Fi IP.
 */
const LAN_HOST = '';
const DEV_HOST =
  LAN_HOST || (Platform.OS === 'android' ? '10.0.2.2' : 'localhost');
const PROD_HOST = 'your-production-backend.com';

const host = __DEV__ ? DEV_HOST : PROD_HOST;
const protocol = __DEV__ ? 'http' : 'https';
const port = __DEV__ ? ':5000' : '';

export const API_BASE_URL = `${protocol}://${host}${port}/api`;
export const SOCKET_URL = `${protocol}://${host}${port}`;

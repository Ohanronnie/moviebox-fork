import axios from 'axios';
console.log("process.env.EXPO_PUBLIC_API_URL", process.env.EXPO_PUBLIC_API_URL);
const USING_LOCAL_API = true;
// On a physical device, use your machine's LAN IP (e.g. EXPO_PUBLIC_API_URL=http://192.168.1.x:8000)
const API_BASE_URL = USING_LOCAL_API
  ? "http://localhost:8000"
  : "https://movie.itoolsai.com";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 1500000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export { API_BASE_URL };

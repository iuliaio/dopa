import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDPtX9j-Tmtu7y0dADOIZz65nhgkLSuYGQ",
  authDomain: "dopa-443105.firebaseapp.com",
  projectId: "dopa-443105",
  storageBucket: "dopa-443105.firebasestorage.app",
  messagingSenderId: "669636631202",
  appId: "1:669636631202:web:0d2b2c4656deba8f79d5fb",
  measurementId: "G-E2S2WT0S94",
};

// Initialize the Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export { app, auth };

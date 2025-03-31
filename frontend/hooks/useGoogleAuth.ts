import {
  FIREBASE_REDIRECT_URI,
  GOOGLE_IOS_CLIENT_ID,
  OAUTH_GOOGLE_IOS_REDIRECT_URI,
} from "@/config/constants";
import * as Google from "expo-auth-session/providers/google";
import * as SecureStore from "expo-secure-store";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { auth, GOOGLE_ANDROID_CLIENT_ID } from "../config";

export const useGoogleAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [calendarAccessToken, setCalendarAccessToken] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);

  // Determine the correct redirect URI based on platform
  // iOS and Android have different OAuth configurations
  const REDIRECT_URI =
    Platform.OS === "ios"
      ? OAUTH_GOOGLE_IOS_REDIRECT_URI
      : FIREBASE_REDIRECT_URI;

  // Configure Google OAuth request with platform-specific client IDs
  // Includes calendar scope for task synchronization
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId:
      Platform.OS === "ios" ? GOOGLE_IOS_CLIENT_ID : GOOGLE_ANDROID_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    redirectUri: REDIRECT_URI,
    scopes: [
      "profile",
      "email",
      "https://www.googleapis.com/auth/calendar.events",
    ],
    extraParams: { access_type: "offline", prompt: "consent" },
  });

  // Load previously saved Google access token from secure storage
  // Used to restore calendar access after app restart
  const loadSavedToken = async () => {
    try {
      const savedToken = await SecureStore.getItemAsync("googleAccessToken");
      console.log("🔍 Loaded saved token:", savedToken ? "Found" : "Not found");
      if (savedToken) {
        setCalendarAccessToken(savedToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error("❌ Error loading saved token:", error);
      return false;
    }
  };

  useEffect(() => {
    loadSavedToken();

    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        loadSavedToken();
      } else {
        setCalendarAccessToken(null);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (response?.type === "success") {
      setLoading(true);
      handleGoogleResponse(response);
    } else if (response?.type === "error") {
      console.error("Google Auth Error:", response.error);
      setLoading(false);
    }
  }, [response]);

  const handleGoogleResponse = async (response: any) => {
    try {
      const { id_token, access_token } = response.params;
      if (!id_token || !access_token) throw new Error("Missing Google tokens");

      const credential = GoogleAuthProvider.credential(id_token);
      const userCredential = await signInWithCredential(auth, credential);

      setUser(userCredential.user);
      setCalendarAccessToken(access_token);

      await SecureStore.setItemAsync("googleAccessToken", access_token);
      console.log("✅ Saved Google access token");
    } catch (error) {
      console.error("Firebase Google Auth Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      if (!request) {
        console.error("❌ Auth request not initialized");
        return false;
      }

      console.log("🔑 Starting Google authentication...");
      const result = await promptAsync();
      console.log("🔑 Auth result type:", result.type);

      return result.type === "success";
    } catch (error) {
      console.error("❌ Error during Google sign-in:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const fetchCalendarData = async () => {
    if (!calendarAccessToken) {
      console.error("No calendar access token available");
      return null;
    }

    try {
      const response = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          headers: { Authorization: `Bearer ${calendarAccessToken}` },
        }
      );

      if (!response.ok)
        throw new Error(`Failed to fetch calendar data: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching calendar data:", error);
      return null;
    }
  };

  return {
    user,
    loading,
    promptAsync,
    signInWithGoogle,
    fetchCalendarData,
    calendarAccessToken,
    loadSavedToken,
  };
};

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

  const REDIRECT_URI =
    Platform.OS === "ios"
      ? OAUTH_GOOGLE_IOS_REDIRECT_URI
      : FIREBASE_REDIRECT_URI;

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId:
      Platform.OS === "ios" ? GOOGLE_IOS_CLIENT_ID : GOOGLE_ANDROID_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    redirectUri: REDIRECT_URI,
    scopes: ["profile", "email", "https://www.googleapis.com/auth/calendar"],
    extraParams: { access_type: "offline", prompt: "consent" },
  });

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
      if (!id_token) throw new Error("No ID token received from Google");

      const credential = GoogleAuthProvider.credential(id_token);
      const userCredential = await signInWithCredential(auth, credential);

      setUser(userCredential.user);
      setCalendarAccessToken(access_token);
      await SecureStore.setItemAsync("googleAccessToken", access_token);
    } catch (error) {
      console.error("Firebase Google Auth Error:", error);
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
    fetchCalendarData,
  };
};

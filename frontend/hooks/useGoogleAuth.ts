import * as Google from "expo-auth-session/providers/google";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { GOOGLE_ANDROID_CLIENT_ID, GOOGLE_WEB_CLIENT_ID } from "../config";

export const useGoogleAuth = () => {
  const [user, setUser] = useState(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_WEB_CLIENT_ID, // For web
    androidClientId: GOOGLE_ANDROID_CLIENT_ID, // For Android
    scopes: ["profile", "email", "https://www.googleapis.com/auth/calendar"],
  });

  useEffect(() => {
    if (response?.type === "success" && response.authentication) {
      const { accessToken } = response.authentication;

      if (accessToken) {
        storeToken(accessToken);
        fetchUserData(accessToken);
      }
    }
  }, [response]);

  const storeToken = async (token: string) => {
    try {
      await SecureStore.setItemAsync("googleAccessToken", token);
    } catch (error) {
      console.error("Error storing access token:", error);
    }
  };

  const fetchUserData = async (accessToken: string) => {
    try {
      const response = await fetch(
        "https://www.googleapis.com/userinfo/v2/me",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  return { user, promptAsync };
};

// import * as Google from "expo-auth-session/providers/google";
// import * as SecureStore from "expo-secure-store";
// import { useEffect, useState } from "react";
// import {
//   GOOGLE_ANDROID_CLIENT_ID,
//   GOOGLE_WEB_CLIENT_ID,
//   REDIRECT_URI,
// } from "../config";

// export const useGoogleAuth = () => {
//   const [user, setUser] = useState(null);
//   const [token, setToken] = useState<string | null>(null);
//   const [calendarAccessToken, setCalendarAccessToken] = useState<string | null>(
//     null
//   );

//   const [request, response, promptAsync] = Google.useAuthRequest({
//     clientId: GOOGLE_WEB_CLIENT_ID,
//     androidClientId: GOOGLE_ANDROID_CLIENT_ID,
//     scopes: ["profile", "email", "https://www.googleapis.com/auth/calendar"],
//     redirectUri: REDIRECT_URI,
//     extraParams: {
//       access_type: "offline",
//       prompt: "consent",
//     },
//   });

//   useEffect(() => {
//     if (response?.type === "success" && response.authentication) {
//       const { accessToken, idToken } = response.authentication;
//       setToken(idToken || null); // Store Firebase ID token if needed
//       setCalendarAccessToken(accessToken); // Store Calendar access token
//       storeToken(accessToken);
//       fetchUserData(accessToken);
//     } else if (response?.type === "error") {
//       console.error("Google Auth Error:", response.error);
//     }
//   }, [response]);

//   const storeToken = async (token: string) => {
//     try {
//       await SecureStore.setItemAsync("googleAccessToken", token);
//     } catch (error) {
//       console.error("Error storing access token:", error);
//     }
//   };

//   const fetchUserData = async (accessToken: string) => {
//     try {
//       const response = await fetch(
//         "https://www.googleapis.com/userinfo/v2/me",
//         {
//           headers: { Authorization: `Bearer ${accessToken}` },
//         }
//       );

//       if (!response.ok) {
//         throw new Error("Failed to fetch user data");
//       }

//       const userData = await response.json();
//       setUser(userData);
//     } catch (error) {
//       console.error("Error fetching user data:", error);
//     }
//   };

//   // Add a function to fetch calendar data
//   const fetchCalendarData = async () => {
//     if (!calendarAccessToken) {
//       console.error("No calendar access token available");
//       return null;
//     }

//     try {
//       const response = await fetch(
//         "https://www.googleapis.com/calendar/v3/calendars/primary/events",
//         {
//           headers: { Authorization: `Bearer ${calendarAccessToken}` },
//         }
//       );

//       if (!response.ok) {
//         throw new Error(`Failed to fetch calendar data: ${response.status}`);
//       }

//       return await response.json();
//     } catch (error) {
//       console.error("Error fetching calendar data:", error);
//       return null;
//     }
//   };

//   return {
//     user,
//     token,
//     promptAsync,
//     calendarAccessToken,
//     fetchCalendarData,
//   };
// };

import * as Google from "expo-auth-session/providers/google";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { useEffect, useState } from "react";
import {
  auth,
  GOOGLE_ANDROID_CLIENT_ID,
  GOOGLE_WEB_CLIENT_ID,
} from "../config";

// Important: This enables the Expo auth proxy
WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Use Expo's Google auth request with the correct properties
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_WEB_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    // Don't specify redirectUri - let Expo handle it automatically
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
      // Get the ID token from the auth response
      const { id_token } = response.params;

      if (!id_token) {
        console.error("No ID token received from Google");
        setLoading(false);
        return;
      }

      // Use the token to sign in with Firebase
      const credential = GoogleAuthProvider.credential(id_token);
      const userCredential = await signInWithCredential(auth, credential);

      setUser(userCredential.user);

      // Store user info if needed
      const userInfo = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
      };

      await SecureStore.setItemAsync("userInfo", JSON.stringify(userInfo));
    } catch (error) {
      console.error("Firebase Google Auth Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    promptAsync,
  };
};

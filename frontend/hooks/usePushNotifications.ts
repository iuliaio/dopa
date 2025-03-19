import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

export const usePushNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<any>(null);

  useEffect(() => {
    const registerForPushNotifications = async () => {
      if (Platform.OS === "ios" && !Device.isDevice) {
        console.warn(
          "⚠️ Running on iOS Simulator - Push notifications disabled."
        );
        return; // Prevent crash by exiting early
      }

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.error("❌ Failed to get push token for notifications!");
        return;
      }

      try {
        const token = (await Notifications.getExpoPushTokenAsync()).data;
        console.log("✅ Expo Push Token:", token);
        setExpoPushToken(token);
      } catch (error) {
        console.error("❌ Error getting push token:", error);
      }
    };

    registerForPushNotifications();

    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        setNotification(notification);
      }
    );

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
    };
  }, []);

  return { expoPushToken, notification };
};

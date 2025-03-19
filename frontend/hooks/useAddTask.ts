import * as Notifications from "expo-notifications";
import { useState } from "react";
import { Task } from "../../backend/src/models/types";
import { API_URL } from "../config";
import { auth } from "../config/firebase";
import { useGoogleAuth } from "./useGoogleAuth";
import { usePushNotifications } from "./usePushNotifications";

export const useAddTask = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, calendarAccessToken } = useGoogleAuth();
  const { expoPushToken } = usePushNotifications();

  const syncWithCalendar = async (taskId: string) => {
    console.log("📡 syncWithCalendar called with taskId:", taskId);
    console.log("🔑 Calendar token available:", !!calendarAccessToken);
    console.log("👤 Current user:", auth.currentUser?.email || "No user");

    try {
      const userEmail = auth.currentUser?.email;

      if (!userEmail || !calendarAccessToken) {
        console.error("❌ No logged-in user or missing access token:", {
          userEmail,
          hasToken: !!calendarAccessToken,
        });
        return;
      }

      const syncUrl = `${API_URL}/api/tasks/${taskId}/sync-calendar`;
      console.log(
        `📢 Attempting to sync Task with Google Calendar: ${syncUrl}`
      );
      console.log(`📦 Request payload: ${JSON.stringify({ userEmail })}`);
      console.log(`🔒 Using token: ${calendarAccessToken.substring(0, 10)}...`);

      const response = await fetch(syncUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${calendarAccessToken}`,
        },
        body: JSON.stringify({ userEmail }),
      });

      console.log("📅 Response Status:", response.status);

      const text = await response.text();
      console.log("📅 Raw Response:", text);

      try {
        const result = JSON.parse(text);
        console.log("✅ Google Calendar Sync Response:", result);
      } catch (e) {
        console.error("❌ Failed to parse response as JSON:", e);
      }
    } catch (error) {
      console.error("❌ Google Calendar Sync Failed:", error);
      if (error instanceof Error) {
        console.error("❌ Error details:", error.message);
      } else {
        console.error("❌ Error details:", error);
      }
      if (error instanceof Error) {
        console.error("❌ Error stack:", error.stack);
      }
    }
  };

  const sendPushNotification = async (taskName: string) => {
    if (!expoPushToken) {
      console.warn("⚠️ No Expo Push Token available - Notification skipped.");
      return;
    }

    console.log(`📢 Sending push notification for task: ${taskName}`);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "New Task Added ✅",
        body: `Your task "${taskName}" has been created.`,
        sound: true,
      },
      trigger: null, // Immediate notification
    });
  };

  const addTask = async (
    name: string,
    scheduleDate?: string,
    scheduleTime?: string
  ): Promise<void> => {
    if (name.trim() === "") return;

    setIsLoading(true);
    setError(null);

    let formattedScheduleDate = scheduleDate
      ? new Date(`${scheduleDate}T${scheduleTime || "00:00"}:00Z`).toISOString()
      : null;

    console.log("📅 Task creation - Schedule date:", formattedScheduleDate);
    console.log(
      "🔑 Task creation - Have calendar token:",
      !!calendarAccessToken
    );

    const taskData: Omit<Task, "id"> = {
      name,
      description: "Enter description",
      subtasks: [],
      status: "PENDING",
      scheduleDate: formattedScheduleDate,
    };

    try {
      console.log("📝 Creating task with data:", JSON.stringify(taskData));
      const response = await fetch(`${API_URL}/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error("Failed to create task");
      }

      const createdTask = await response.json();
      console.log("✅ Task Created:", createdTask);

      await sendPushNotification(name);

      if (formattedScheduleDate && calendarAccessToken) {
        console.log("🔍 Should sync with calendar - Conditions met");
        await syncWithCalendar(createdTask.id);
        console.log("🔄 After calendar sync attempt");
      } else {
        console.log("⚠️ Calendar sync skipped - Missing requirements:", {
          hasScheduleDate: !!formattedScheduleDate,
          hasToken: !!calendarAccessToken,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
      console.error("❌ Error creating task:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return { addTask, isLoading, error };
};

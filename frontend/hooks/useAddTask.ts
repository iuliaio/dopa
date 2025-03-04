import { useState } from "react";
import { Task } from "../../backend/src/models/types";
import { API_URL } from "../config";

export const useAddTask = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addTask = async (
    name: string,
    scheduleDate?: string,
    scheduleTime?: string
  ): Promise<void> => {
    if (name.trim() === "") return;

    setIsLoading(true);
    setError(null);

    let formattedScheduleDate = undefined;
    if (scheduleDate) {
      // Convert to ISO 8601: YYYY-MM-DDTHH:MM:SSZ (UTC)
      const dateTime = new Date(
        `${scheduleDate}T${scheduleTime || "00:00"}:00Z`
      );
      formattedScheduleDate = dateTime.toISOString();
    }

    const taskData: Omit<Task, "id"> = {
      name,
      description: "Enter description",
      subtasks: [],
      status: "PENDING",
      scheduleDate: formattedScheduleDate || null,
    };

    try {
      const response = await fetch(`${API_URL}/api/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error("Failed to create task");
      }

      await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
      console.error("Error creating task:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return { addTask, isLoading, error };
};

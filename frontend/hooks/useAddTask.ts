import { useState } from "react";
import { Task } from "../../backend/src/models/types";
import { API_URL } from "../config";

export const useAddTask = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addTask = async (
    name: string,
    taskListType: "Scheduled" | "Anytime"
  ): Promise<void> => {
    if (name.trim() === "") return;

    setIsLoading(true);
    setError(null);

    const taskData: Omit<Task, "id"> = {
      name,
      description: "Enter description",
      subtasks: [],
      status: "PENDING",
      scheduleDate: taskListType === "Scheduled" ? new Date() : undefined,
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

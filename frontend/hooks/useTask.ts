import { useCallback, useEffect, useState } from "react";
import { Task } from "../../backend/src/models/types";
import { API_URL } from "../config";

export const useTask = (taskId: string | undefined) => {
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTask = useCallback(async () => {
    if (!taskId) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/tasks/${taskId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch task");
      }
      const data: Task = await response.json();
      setTask(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch task");
      console.error("Error fetching task:", err);
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  return { task, isLoading, error, refetchTask: fetchTask };
};

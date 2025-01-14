import { useEffect, useState } from "react";
import { Task } from "../../backend/src/models/types";
import { API_URL } from "../config";

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/tasks`);
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching tasks:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTask = async (updatedTask: Task) => {
    try {
      const response = await fetch(`${API_URL}/api/tasks/${updatedTask.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTask),
      });

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      // Update local state
      setTasks(
        tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task");
      console.error("Error updating task:", err);
    }
  };

  const createTask = async () => {
    try {
      const newTask: Omit<Task, "id"> = {
        name: "New Task",
        description: "Enter description",
        status: "pending",
        subtasks: [],
      };

      const response = await fetch(`${API_URL}/api/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTask),
      });

      if (!response.ok) {
        throw new Error("Failed to create task");
      }

      const createdTask = await response.json();
      setTasks([...tasks, createdTask]);
      return createdTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
      console.error("Error creating task:", err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return {
    tasks,
    isLoading,
    error,
    refetchTasks: fetchTasks,
    updateTask,
    createTask,
  };
};

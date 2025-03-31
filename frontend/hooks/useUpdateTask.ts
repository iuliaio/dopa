import { useState } from "react";
import { Subtask, Task } from "../../backend/src/models/types";
import { API_URL } from "../config";

// Hook for managing task updates with backend synchronization
// Handles task state updates, subtask management, and Google Calendar integration
export const useUpdateTask = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Core function to update task state and sync with backend
  // Handles date normalization and data cleaning before sending to server
  const updateTask = async (updatedTask: Task) => {
    setIsLoading(true);
    setError(null);

    try {
      // Clean and normalize task data before sending to backend
      const cleanTask = {
        ...updatedTask,
        scheduleDate:
          updatedTask.scheduleDate &&
          !isNaN(new Date(updatedTask.scheduleDate).getTime())
            ? new Date(updatedTask.scheduleDate).toISOString()
            : null, // Prevents "Date value out of bounds" error
        subtasks: updatedTask.subtasks.map((subtask) => ({
          id: subtask.id,
          name: subtask.name || "Unnamed Subtask",
          status: subtask.status || "PENDING",
          duration: subtask.duration || "0",
        })),
      };

      const response = await fetch(`${API_URL}/api/tasks/${updatedTask.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanTask),
      });

      if (!response.ok) throw new Error("Failed to update task");

      const updatedTaskResponse = await response.json();

      // Sync with Google Calendar if task has a schedule date
      if (cleanTask.scheduleDate) {
        await fetch(`${API_URL}/api/tasks/${updatedTask.id}/sync-calendar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
      }

      return updatedTaskResponse;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task");
      console.error("Error updating task:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new subtask to an existing task
  // Generates a unique ID using timestamp for new subtasks
  const addSubtask = async (task: Task, newSubtask: Partial<Subtask>) => {
    if (!task.id) {
      console.error("Error: Task ID is missing.");
      return;
    }

    const updatedTask = {
      ...task,
      subtasks: [
        ...task.subtasks,
        {
          id: `${Date.now()}`, // Generate a unique ID
          name: newSubtask.name || "New Subtask",
          status: newSubtask.status || "PENDING",
          duration: newSubtask.duration || "0",
        },
      ],
    };

    return updateTask(updatedTask);
  };

  // Update a specific subtask and handle task status updates
  // Task status is derived from the collective state of its subtasks
  const updateSubtask = async (task: Task, updatedSubtask: Subtask) => {
    if (!task.id) {
      console.error("Error: Task ID is missing.");
      return;
    }

    const updatedTask = {
      ...task,
      subtasks: task.subtasks.map((subtask) =>
        subtask.id === updatedSubtask.id ? updatedSubtask : subtask
      ),
    };

    // Determine task status based on subtask states
    const allSubtasksCompleted =
      updatedTask.subtasks.length > 0 &&
      updatedTask.subtasks.every((subtask) => subtask.status === "COMPLETED");

    // Update parent task status based on subtask completion
    if (allSubtasksCompleted) {
      updatedTask.status = "COMPLETED";
    } else if (
      updatedTask.subtasks.some((subtask) => subtask.status === "IN_PROGRESS")
    ) {
      updatedTask.status = "IN_PROGRESS";
    } else {
      updatedTask.status = "PENDING";
    }

    return updateTask(updatedTask);
  };

  // Remove a subtask from a task
  const deleteSubtask = async (task: Task, subtaskId: string) => {
    if (!task.id) {
      console.error("Error: Task ID is missing.");
      return null;
    }

    const updatedTask = {
      ...task,
      subtasks: task.subtasks.filter((subtask) => subtask.id !== subtaskId),
    };

    return updateTask(updatedTask);
  };

  return {
    updateTask,
    isLoading,
    error,
    addSubtask,
    updateSubtask,
    deleteSubtask,
  };
};

import { useState } from "react";
import { Subtask, Task } from "../../backend/src/models/types";
import { API_URL } from "../config";

export const useUpdateTask = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateTask = async (updatedTask: Task) => {
    setIsLoading(true);
    setError(null);

    try {
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

      // If a scheduleDate exists, sync with Google Calendar
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

    // Check if all subtasks are completed
    const allSubtasksCompleted =
      updatedTask.subtasks.length > 0 &&
      updatedTask.subtasks.every((subtask) => subtask.status === "COMPLETED");

    // Update task status based on subtask completion
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

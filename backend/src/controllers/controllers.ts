import { Request, Response } from "express";
import { db } from "../config/firebase";
import { Task } from "../models/types";

export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const snapshot = await db.collection("tasks").get();
    const tasks = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Task[];
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

export const getTaskById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const taskDoc = await db.collection("tasks").doc(req.params.id).get();

    if (!taskDoc.exists) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    const task = { id: taskDoc.id, ...taskDoc.data() } as Task;
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch task" });
  }
};

export const createTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, description, status, subtasks, scheduleDate, scheduleTime } =
      req.body;

    const taskData = {
      name,
      description,
      status,
      subtasks: subtasks ?? [],
      scheduleDate: scheduleDate ? new Date(scheduleDate) : null,
      scheduleTime: scheduleTime ?? null,
    };

    const newTaskRef = await db.collection("tasks").add(taskData);

    const createdTask = { id: newTaskRef.id, ...taskData };

    await newTaskRef.set(createdTask);

    res.status(201).json({ id: newTaskRef.id, ...taskData });
  } catch (error) {
    res.status(500).json({ error: "Failed to create task" });
  }
};

export const updateTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, status, subtasks, scheduleDate, scheduleTime } =
      req.body;

    const taskData = {
      name,
      description,
      status,
      subtasks: subtasks ?? [],
      scheduleDate:
        scheduleDate && !isNaN(Date.parse(scheduleDate))
          ? new Date(scheduleDate).toISOString() // Only format if it's a valid date
          : null,
      scheduleTime: scheduleTime ?? null,
    };

    await db.collection("tasks").doc(id).update(taskData);
    res.json({ id, ...taskData });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Failed to update task" });
  }
};

export const deleteTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    await db.collection("tasks").doc(id).delete();
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete task" });
  }
};

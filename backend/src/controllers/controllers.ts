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
      subtasks,
      ...(scheduleDate && { scheduleDate: new Date(scheduleDate) }),
      ...(scheduleTime && { scheduleTime }),
    };

    const newTask = await db.collection("tasks").add(taskData);
    res.status(201).json({ id: newTask.id, ...taskData });
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
      subtasks,
      ...(scheduleDate && { scheduleDate: new Date(scheduleDate) }),
      ...(scheduleTime && { scheduleTime }),
    };

    await db.collection("tasks").doc(id).update(taskData);
    res.json({ id, ...taskData });
  } catch (error) {
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

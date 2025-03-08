import { Request, Response } from "express";
import { db } from "../config/firebase";
import { Task } from "../models/types";
///GOOGLE CALENDAR API
import admin from "firebase-admin";
import { google } from "googleapis";
import serviceAccount from "../config/service-account.json";

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

//////////GOOGLE CALENDAR API//////////
const SCOPES = ["https://www.googleapis.com/auth/calendar.events"];
const calendar = google.calendar("v3");

const auth = new google.auth.JWT(
  serviceAccount.client_email,
  undefined,
  (serviceAccount.private_key as string).replace(/\n/g, "\n"),
  SCOPES
);

export const createGoogleCalendarEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { taskId } = req.params;
    const taskDoc = await admin
      .firestore()
      .collection("tasks")
      .doc(taskId)
      .get();

    if (!taskDoc.exists) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    const task = taskDoc.data();

    if (!task?.scheduleDate) {
      res.status(400).json({ error: "Task must have a scheduled date" });
      return;
    }

    const event = {
      summary: task.name,
      description: task.description || "No description provided",
      start: {
        dateTime: new Date(
          `${task.scheduleDate}T${task.scheduleTime || "00:00"}:00Z`
        ).toISOString(),
        timeZone: "UTC",
      },
      end: {
        dateTime: new Date(
          `${task.scheduleDate}T${task.scheduleTime || "00:30"}:00Z`
        ).toISOString(),
        timeZone: "UTC",
      },
    };

    const response = await calendar.events.insert({
      auth,
      calendarId: "primary",
      requestBody: event,
    });

    res.json({
      message: "Event added to Google Calendar",
      event: response.data,
    });
  } catch (error) {
    console.error("Google Calendar API error:", error);
    res.status(500).json({ error: "Failed to add event to Google Calendar" });
  }
};

import { Request, Response } from "express";
import { db } from "../config/firebase";
import { Task } from "../models/types";
///GOOGLE CALENDAR API
import admin from "firebase-admin";
import { google } from "googleapis";

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
export const createGoogleCalendarEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log("📢 API Call Received:", req.body);
    console.log("📢 API Headers:", req.headers);

    const { taskId } = req.params;
    const { userEmail } = req.body;
    const accessToken = req.headers.authorization?.split(" ")[1];

    console.log("🔑 Access Token received:", accessToken ? "Yes" : "No");
    console.log("📧 User Email received:", userEmail ? userEmail : "No");

    if (!userEmail || !accessToken) {
      console.error("❌ Missing user email or access token");
      res
        .status(400)
        .json({ error: "User email and access token are required" });
      return;
    }

    console.log("🆔 Task ID:", taskId);

    const taskDoc = await admin
      .firestore()
      .collection("tasks")
      .doc(taskId)
      .get();

    if (!taskDoc.exists) {
      console.error("❌ Task not found with ID:", taskId);
      res.status(404).json({ error: "Task not found" });
      return;
    }

    const task = taskDoc.data();
    console.log("📋 Task data:", JSON.stringify(task, null, 2));

    if (!task?.scheduleDate) {
      console.error("❌ Task has no scheduled date");
      res.status(400).json({ error: "Task must have a scheduled date" });
      return;
    }

    // Convert Firestore Timestamp or string to ISO format
    let startDateTime: string;

    if (typeof task.scheduleDate === "object" && task.scheduleDate._seconds) {
      startDateTime = new Date(task.scheduleDate._seconds * 1000).toISOString();
    } else if (typeof task.scheduleDate === "string") {
      startDateTime = task.scheduleDate.includes("T")
        ? task.scheduleDate
        : `${task.scheduleDate}T${task.scheduleTime || "09:00"}:00Z`;
    } else {
      console.error("❌ Invalid scheduleDate format:", task.scheduleDate);
      res.status(400).json({ error: "Invalid schedule date format" });
      return;
    }

    console.log("⏰ Start date time:", startDateTime);

    const endDateTime = new Date(
      new Date(startDateTime).getTime() + 30 * 60 * 1000
    ).toISOString();

    const event = {
      summary: task.name,
      description: task.description || "No description provided",
      start: {
        dateTime: startDateTime,
        timeZone: "UTC",
      },
      end: {
        dateTime: endDateTime,
        timeZone: "UTC",
      },
    };

    console.log("📅 Creating Event:", event);

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    console.log("🔑 Setting up Google Calendar API with token");
    const calendar = google.calendar({ version: "v3", auth });

    console.log("📅 Making API call to Google Calendar");
    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
    });

    console.log("✅ Event Created Successfully:", response.data);
    res.json({
      message: "Event added to Google Calendar",
      event: response.data,
    });
  } catch (error) {
    console.error("❌ Google Calendar API Error:", error);
    res.status(500).json({
      error: "Failed to add event to Google Calendar",
      details: (error as Error).message,
      stack:
        process.env.NODE_ENV === "development"
          ? (error as Error).stack
          : undefined,
    });
  }
};

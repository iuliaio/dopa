import { Router } from "express";
import {
  createGoogleCalendarEvent,
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateTask,
} from "../controllers";

export const router = Router();

router.get("/", (req, res) => {
  res.json({
    message: "Tasks API endpoints",
    endpoints: {
      getTasks: "GET /tasks",
      getTask: "GET /tasks/:id",
      createTask: "POST /tasks",
      updateTask: "PUT /tasks/:id",
      deleteTask: "DELETE /tasks/:id",
      createGoogleCalendarEvent: "POST /tasks/:taskId/sync-calendar",
    },
  });
});

router.get("/tasks", getTasks);
router.get("/tasks/:id", getTaskById);
router.post("/tasks", createTask);
router.put("/tasks/:id", updateTask);
router.delete("/tasks/:id", deleteTask);

router.post("/tasks/:taskId/sync-calendar", createGoogleCalendarEvent);

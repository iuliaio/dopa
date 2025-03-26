import { Request, Response } from "express";
import { db } from "../../config/firebase";
import {
  createGoogleCalendarEvent,
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateTask,
} from "../controllers";

jest.mock("../../config/firebase", () => ({
  db: {
    collection: jest.fn(),
  },
}));

jest.mock("googleapis", () => ({
  google: {
    auth: {
      OAuth2: jest.fn().mockImplementation(() => ({
        setCredentials: jest.fn(),
      })),
    },
    calendar: jest.fn().mockReturnValue({
      events: {
        insert: jest.fn(),
      },
    }),
  },
}));

const createMockRequest = (data: Partial<Request> = {}): Request =>
  ({
    params: {},
    body: {},
    headers: {},
    ...data,
  } as Request);

const createMockResponse = (): Response => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe("Controllers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getTasks", () => {
    it("should return empty array when no tasks exist", async () => {
      (db.collection as jest.Mock).mockReturnValue({
        get: jest.fn().mockResolvedValue({ docs: [] }),
      });

      const req = createMockRequest();
      const res = createMockResponse();

      await getTasks(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });
  });

  describe("getTaskById", () => {
    it("should return 404 when task not found", async () => {
      (db.collection as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({ exists: false }),
        }),
      });

      const req = createMockRequest({ params: { id: "123" } });
      const res = createMockResponse();

      await getTaskById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Task not found" });
    });
  });

  describe("createTask", () => {
    it("should create a task with minimal data", async () => {
      const mockNewTaskRef = {
        id: "new-id",
        set: jest.fn().mockResolvedValue({}),
      };
      (db.collection as jest.Mock).mockReturnValue({
        add: jest.fn().mockResolvedValue(mockNewTaskRef),
      });

      const req = createMockRequest({
        body: {
          name: "Test Task",
          status: "pending",
        },
      });
      const res = createMockResponse();

      await createTask(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "new-id",
          name: "Test Task",
          status: "pending",
        })
      );
    });
  });

  describe("updateTask", () => {
    it("should update task with minimal data", async () => {
      const mockDocUpdate = jest.fn().mockResolvedValue({});
      (db.collection as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({
          update: mockDocUpdate,
        }),
      });

      const req = createMockRequest({
        params: { id: "123" },
        body: {
          name: "Updated Task",
        },
      });
      const res = createMockResponse();

      await updateTask(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "123",
          name: "Updated Task",
        })
      );
    });
  });

  describe("deleteTask", () => {
    it("should delete task successfully", async () => {
      const mockDocDelete = jest.fn().mockResolvedValue({});
      (db.collection as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({
          delete: mockDocDelete,
        }),
      });

      const req = createMockRequest({ params: { id: "123" } });
      const res = createMockResponse();

      await deleteTask(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: "Task deleted successfully",
      });
    });
  });

  describe("createGoogleCalendarEvent", () => {
    it("should return error when user email is missing", async () => {
      const req = createMockRequest({
        params: { taskId: "123" },
      });
      const res = createMockResponse();

      await createGoogleCalendarEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "User email and access token are required",
      });
    });
  });
});

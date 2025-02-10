export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export type Subtask = {
  id: string;
  name: string;
  status?: TaskStatus;
  duration?: string;
};

export type Task = {
  id: string;
  name: string;
  description: string | undefined | null;
  status: TaskStatus;
  subtasks: Subtask[];
  scheduleDate?: Date | undefined | null;
  scheduleTime?: string | undefined | null;
};

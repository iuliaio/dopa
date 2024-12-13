export type Subtask = {
  name: string;
  status: string;
  duration: string;
};

export type Task = {
  id: string;
  name: string;
  description: string;
  status: string;
  subtasks: Subtask[];
  scheduleDate?: Date;
  scheduleTime?: string;
};

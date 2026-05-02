export type TaskStatus = "Pending" | "In Progress" | "Done";

export interface Student {
  id: string;
  name: string;
}

export interface Task {
  id: string;
  studentName: string;
  taskDesc: string;
  status: TaskStatus;
  materials?: string[];
  dueDate?: string;
}

export interface Receipt {
  id: string;
  uploaderName: string;
  amount: number;
  description: string;
  date: string;
  imageUrl: string;
}

export const students: Student[] = [];

export const initialTasks: Task[] = [];

export const initialReceipts: Receipt[] = [];

export const budgetData = {
  goal: 0,
  collected: 0,
  expenses: 0,
};

export const eventData = {
  name: "sEEync",
  date: "",
  totalTasks: 0,
  completedTasks: 0,
};

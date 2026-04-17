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

export const students: Student[] = [
  { id: "s1", name: "test1" },
  { id: "s2", name: "test2" },
  { id: "s3", name: "test3" },
  { id: "s4", name: "test4" },
  { id: "s5", name: "test5" },
];

export const initialTasks: Task[] = [
  { id: "t1", studentName: "test1", taskDesc: "Book Venue", status: "Done", materials: ["Contract", "Downpayment Receipt"] },
  { id: "t2", studentName: "test2", taskDesc: "Buy Decorations", status: "In Progress", materials: ["Balloons", "Banners"] },
  { id: "t3", studentName: "test3", taskDesc: "Send Invitations", status: "Pending", materials: ["Envelopes", "Stamps"] },
  { id: "t4", studentName: "test4", taskDesc: "Order Food", status: "Pending", materials: ["Menu List"] },
  { id: "t5", studentName: "test5", taskDesc: "Hire Photographer", status: "In Progress", materials: [] },
];

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

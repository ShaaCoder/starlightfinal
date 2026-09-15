export interface Admission {
  id: string;

  studentName: string;

  phone: string;

  email: string;

  course: string;

  className: string;

  subjects: string[];

  parentName: string;

  status: "pending" | "approved" | "rejected";

  createdAt?: string;
}
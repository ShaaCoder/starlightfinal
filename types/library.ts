export interface LibraryStudent {
  id: string;

  fullName: string;

  phone: string;

  email: string;

  membershipPlan: string;

  joiningDate: string;

  expiryDate: string;

  status:
    | "active"
    | "expired"
    | "pending";

  paymentStatus:
    | "paid"
    | "pending"
    | "overdue";
}

export interface AttendanceRecord {
  id: string;

  studentId: string;

  studentName: string;

  date: string;

  checkIn: string;

  checkOut?: string;

  status:
    | "present"
    | "absent"
    | "late";
}

export interface PaymentRecord {
  id: string;

  studentName: string;

  amount: number;

  paymentDate: string;

  paymentMethod:
    | "cash"
    | "upi"
    | "card";

  status:
    | "paid"
    | "pending"
    | "failed";
}

export interface LibraryAnalytics {
  totalStudents: number;

  activeStudents: number;

  pendingPayments: number;

  expiredMemberships: number;

  monthlyRevenue: number;
}
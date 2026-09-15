import {
  AttendanceRecord,
  LibraryAnalytics,
  LibraryStudent,
  PaymentRecord,
} from "@/types/library";

export const libraryStudents: LibraryStudent[] = [
  {
    id: "1",
    fullName: "Rohit Kumar",
    phone: "9876543210",
    email: "rohit@gmail.com",
    membershipPlan: "Premium",
    joiningDate: "2026-05-01",
    expiryDate: "2026-06-01",
    status: "active",
    paymentStatus: "paid",
  },
];

export const attendanceRecords: AttendanceRecord[] = [
  {
    id: "1",
    studentId: "1",
    studentName: "Rohit Kumar",
    date: "2026-05-24",
    checkIn: "09:00 AM",
    checkOut: "05:00 PM",
    status: "present",
  },
];

export const paymentRecords: PaymentRecord[] = [
  {
    id: "1",
    studentName: "Rohit Kumar",
    amount: 500,
    paymentDate: "2026-05-24",
    paymentMethod: "upi",
    status: "paid",
  },
];

export const libraryAnalytics: LibraryAnalytics = {
  totalStudents: 1,
  activeStudents: 1,
  pendingPayments: 0,
  expiredMemberships: 0,
  monthlyRevenue: 500,
};

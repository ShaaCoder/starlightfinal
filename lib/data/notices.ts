import { Notice } from "@/lib/types";

export const notices: Notice[] = [
  {
    id: "1",
    title: "Summer Vacation Notice",
    content: "Academy will remain closed from June 10 to June 20. We wish all students a happy and safe vacation!",
    priority: "high",
    is_active: true,
    created_at: "2026-05-24T00:00:00Z",
    updated_at: "2026-05-24T00:00:00Z"
  },
  {
    id: "2",
    title: "New Admission Open",
    content: "Admissions are now open for the new academic session. Limited seats available! Contact us today.",
    priority: "high",
    is_active: true,
    created_at: "2026-05-22T00:00:00Z",
    updated_at: "2026-05-22T00:00:00Z"
  },
  {
    id: "3",
    title: "Library Timings Update",
    content: "Library timings have been updated: 9:00 AM to 8:00 PM, Monday to Saturday. Closed on Sundays.",
    priority: "medium",
    is_active: true,
    created_at: "2026-05-20T00:00:00Z",
    updated_at: "2026-05-20T00:00:00Z"
  }
];

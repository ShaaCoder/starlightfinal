"use client";

import { Filter } from "lucide-react";

type Props = {
  courseFilter: string;
  setCourseFilter: (val: string) => void;
  classFilter: string;
  setClassFilter: (val: string) => void;
};

export default function StudentFilters({
  courseFilter,
  setCourseFilter,
  classFilter,
  setClassFilter,
}: Props) {
  return (
    <div className="flex items-center gap-3">
      {/* COURSE */}
      <select
        value={courseFilter}
        onChange={(e) => setCourseFilter(e.target.value)}
        className="
          h-12
          px-4
          rounded-xl
          border
          border-blue-100
          outline-none
          bg-white
          focus:border-blue-500
        "
      >
        <option>All Courses</option>
        <option>BCA</option>
        <option>MCA</option>
        <option>Web Development</option>
      </select>

      {/* CLASS */}
      <select
        value={classFilter}
        onChange={(e) => setClassFilter(e.target.value)}
        className="
          h-12
          px-4
          rounded-xl
          border
          border-blue-100
          outline-none
          bg-white
          focus:border-blue-500
        "
      >
        <option>All Classes</option>
        <option>10th</option>
        <option>12th</option>
        <option>Graduation</option>
      </select>
    </div>
  );
}
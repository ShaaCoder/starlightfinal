"use client";

type Props = {
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  courseFilter: string;
  setCourseFilter: (val: string) => void;
};

export default function AdmissionFilters({
  statusFilter,
  setStatusFilter,
  courseFilter,
  setCourseFilter,
}: Props) {
  return (
    <div className="flex items-center gap-3">
      {/* STATUS */}
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
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
        <option>All Status</option>
        <option>pending</option>
        <option>approved</option>
        <option>rejected</option>
      </select>

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
    </div>
  );
}
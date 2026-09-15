"use client";

type Props = {
  courseFilter: string;
  setCourseFilter: (val: string) => void;
};

export default function ContactFilters({
  courseFilter,
  setCourseFilter,
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
        <option>Web Development</option>
        <option>Graphic Designing</option>
        <option>Digital Marketing</option>
      </select>
    </div>
  );
}
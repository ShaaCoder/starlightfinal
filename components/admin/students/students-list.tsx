import { Student } from "@/types/student";
import StudentFilters from "./student-filters";
import StudentSearch from "./student-search";
import StudentsTable from "./students-table";

type Props = {
  students: Student[];
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  courseFilter: string;
  setCourseFilter: (val: string) => void;
  classFilter: string;
  setClassFilter: (val: string) => void;
  onEdit: (student: Student) => void;
  onDelete: (id: string) => void;
};

export default function StudentsList({
  students,
  searchQuery,
  setSearchQuery,
  courseFilter,
  setCourseFilter,
  classFilter,
  setClassFilter,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="space-y-5">
      {/* TOPBAR */}
      <div
        className="
          flex
          flex-col
          lg:flex-row
          lg:items-center
          lg:justify-between
          gap-4
        "
      >
        {/* SEARCH */}
        <StudentSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        {/* FILTERS */}
        <StudentFilters
          courseFilter={courseFilter}
          setCourseFilter={setCourseFilter}
          classFilter={classFilter}
          setClassFilter={setClassFilter}
        />
      </div>

      {/* TABLE */}
      <StudentsTable students={students} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
}
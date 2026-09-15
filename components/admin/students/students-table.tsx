import { Student } from "@/types/student";
import StudentRow from "./student-row";

type Props = {
  students: Student[];
  onEdit: (student: Student) => void;
  onDelete: (id: string) => void;
};

export default function StudentsTable({ students, onEdit, onDelete }: Props) {
  return (
    <div
      className="
        bg-white
        border
        border-blue-100
        rounded-2xl
        overflow-hidden
      "
    >
      <div className="overflow-x-auto">
        <table className="min-w-[760px] w-full">
          <thead className="bg-blue-50">
            <tr className="text-left">
              <th className="px-6 py-4 text-sm font-semibold text-blue-900">
                Name
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-blue-900">
                Enrollment No.
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-blue-900">
                Email
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-blue-900">
                Class
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-blue-900">
                Course
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-blue-900">
                Subjects
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-blue-900">
                Ref No.
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-blue-900">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {students.map((student) => (
              <StudentRow
                key={student.id}
                student={student}
                onEdit={() => onEdit(student)}
                onDelete={() => onDelete(student.id)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { Student } from "@/types/student";
import { Pencil, Trash2 } from "lucide-react";

type Props = {
  student: Student;
  onEdit: () => void;
  onDelete: () => void;
};

export default function StudentRow({
  student,
  onEdit,
  onDelete,
}: Props) {
  return (
    <tr className="border-t border-blue-50">
      {/* NAME */}
      <td className="px-6 py-5 font-medium whitespace-nowrap">
        {student.fullName}
      </td>

      {/* ENROLLMENT */}
      <td className="px-6 py-5 whitespace-nowrap">
        <span
          className="
            bg-blue-100
            text-blue-700
            px-3
            py-1
            rounded-lg
            text-sm
            font-medium
          "
        >
          {student.enrollmentNumber}
        </span>
      </td>

      {/* EMAIL */}
      <td className="px-6 py-5 text-gray-600 whitespace-nowrap">
        {student.email}
      </td>

      {/* CLASS */}
      <td className="px-6 py-5 whitespace-nowrap">
        {student.classSection}
      </td>

      {/* COURSE */}
      <td className="px-6 py-5 whitespace-nowrap">
        {student.course}
      </td>

      {/* SUBJECTS */}
      <td className="px-6 py-5">
        <div className="flex flex-wrap gap-2">
          {student.subjects.map((subject) => (
            <span
              key={subject}
              className="
                bg-blue-50
                text-blue-700
                px-3
                py-1
                rounded-lg
                text-xs
                font-medium
              "
            >
              {subject}
            </span>
          ))}
        </div>
      </td>

      {/* REF */}
      <td className="px-6 py-5 whitespace-nowrap">
        {student.referenceNumber}
      </td>

      {/* ACTIONS */}
      <td className="px-6 py-5">
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="
              w-10
              h-10
              rounded-xl
              border
              border-yellow-300
              bg-yellow-50
              text-yellow-600
              flex
              items-center
              justify-center
              hover:bg-yellow-100
              transition
            "
          >
            <Pencil size={18} />
          </button>

          <button
            onClick={onDelete}
            className="
              w-10
              h-10
              rounded-xl
              bg-red-500
              text-white
              flex
              items-center
              justify-center
              hover:bg-red-600
              transition
            "
          >
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
}
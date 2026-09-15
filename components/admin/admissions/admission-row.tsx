import { Admission } from "@/types/admission";
import { Check, Eye, X, Trash2 } from "lucide-react";

type Props = {
  admission: Admission;
  onUpdateStatus: (id: string, status: Admission["status"]) => void;
  onDelete: (id: string) => void;
};

export default function AdmissionRow({
  admission,
  onUpdateStatus,
  onDelete,
}: Props) {
  return (
    <tr className="border-t border-blue-50">
      {/* STUDENT */}
      <td className="px-6 py-5 font-medium whitespace-nowrap">
        {admission.studentName}
      </td>

      {/* PHONE */}
      <td className="px-6 py-5 whitespace-nowrap">
        {admission.phone}
      </td>

      {/* EMAIL */}
      <td className="px-6 py-5 whitespace-nowrap text-gray-600">
        {admission.email}
      </td>

      {/* COURSE */}
      <td className="px-6 py-5 whitespace-nowrap">
        {admission.course}
      </td>

      {/* CLASS */}
      <td className="px-6 py-5 whitespace-nowrap">
        {admission.className}
      </td>

      {/* SUBJECTS */}
      <td className="px-6 py-5">
        <div className="flex flex-wrap gap-2">
          {admission.subjects.map((subject) => (
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

      {/* PARENT */}
      <td className="px-6 py-5 whitespace-nowrap">
        {admission.parentName}
      </td>

      {/* STATUS */}
      <td className="px-6 py-5 whitespace-nowrap">
        <span
          className={`
            px-4 py-2 rounded-xl text-xs font-semibold capitalize
            ${
              admission.status === "approved"
                ? "bg-green-100 text-green-700"
                : admission.status === "rejected"
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700"
            }
          `}
        >
          {admission.status}
        </span>
      </td>

      {/* ACTIONS */}
      <td className="px-6 py-5">
        <div className="flex items-center gap-2">
          {/* VIEW */}
          <button
            className="
              w-10
              h-10
              rounded-xl
              border
              border-blue-200
              bg-blue-50
              text-blue-600
              flex
              items-center
              justify-center
              hover:bg-blue-100
              transition
            "
          >
            <Eye size={18} />
          </button>

          {/* APPROVE */}
          {admission.status !== "approved" && (
            <button
              onClick={() => onUpdateStatus(admission.id, "approved")}
              className="
                w-10
                h-10
                rounded-xl
                bg-green-500
                text-white
                flex
                items-center
                justify-center
                hover:bg-green-600
                transition
              "
            >
              <Check size={18} />
            </button>
          )}

          {/* REJECT */}
          {admission.status !== "rejected" && (
            <button
              onClick={() => onUpdateStatus(admission.id, "rejected")}
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
              <X size={18} />
            </button>
          )}

          {/* DELETE */}
          <button
            onClick={() => onDelete(admission.id)}
            className="
              w-10
              h-10
              rounded-xl
              bg-gray-200
              text-gray-700
              flex
              items-center
              justify-center
              hover:bg-gray-300
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
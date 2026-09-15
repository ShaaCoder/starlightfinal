import { ContactSubmission } from "@/types/contact";
import { Eye, Trash2 } from "lucide-react";

type Props = {
  contact: ContactSubmission;
  onDelete: (id: string) => void;
};

export default function ContactRow({ contact, onDelete }: Props) {
  return (
    <tr className="border-t border-blue-50">
      {/* NAME */}
      <td className="px-6 py-5 font-medium whitespace-nowrap">
        {contact.fullName}
      </td>

      {/* PHONE */}
      <td className="px-6 py-5 whitespace-nowrap">
        {contact.phone}
      </td>

      {/* EMAIL */}
      <td className="px-6 py-5 whitespace-nowrap text-gray-600">
        {contact.email}
      </td>

      {/* COURSE */}
      <td className="px-6 py-5 whitespace-nowrap">
        {contact.course}
      </td>

      {/* MESSAGE */}
      <td className="px-6 py-5 max-w-[300px]">
        <p className="line-clamp-2 text-gray-600">
          {contact.message}
        </p>
      </td>

      {/* DATE */}
      <td className="px-6 py-5 whitespace-nowrap">
        {contact.createdAt}
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

          {/* DELETE */}
          <button
            onClick={() => onDelete(contact.id)}
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
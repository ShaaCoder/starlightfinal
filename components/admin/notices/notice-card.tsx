import { Bell, AlertTriangle, Pencil, Trash2 } from "lucide-react";
import { Notice } from "@/types/notice";

type Props = {
  notice: Notice;
  onEdit: () => void;
  onDelete: () => void;
};

export default function NoticeCard({ notice, onEdit, onDelete }: Props) {
  return (
    <div
      className={`
        bg-white
        rounded-2xl
        p-6
        border-2
        ${notice.important ? "border-red-200" : "border-blue-100"}
      `}
    >
      {/* TOP */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            className={`
              w-12
              h-12
              rounded-xl
              flex
              items-center
              justify-center
              ${notice.important ? "bg-red-100" : "bg-blue-100"}
            `}
          >
            {notice.important ? (
              <AlertTriangle className="text-red-600" />
            ) : (
              <Bell className="text-blue-600" />
            )}
          </div>

          <div>
            <h3 className="text-xl font-bold">
              {notice.title}
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              {notice.createdAt}
            </p>
          </div>
        </div>
        {notice.important && (
          <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
            Important
          </span>
        )}
      </div>

      {/* DESCRIPTION */}
      <p className="text-gray-500 leading-7 text-sm">
        {notice.description}
      </p>

      {/* ACTIONS */}
      <div className="flex items-center gap-3 mt-6">
        <button
          onClick={onEdit}
          className="
            h-11
            px-5
            rounded-xl
            bg-blue-600
            hover:bg-blue-700
            text-white
            flex
            items-center
            gap-2
            transition
          "
        >
          <Pencil size={18} />
          Edit
        </button>

        <button
          onClick={onDelete}
          className="
            h-11
            px-5
            rounded-xl
            bg-red-500
            hover:bg-red-600
            text-white
            flex
            items-center
            gap-2
            transition
          "
        >
          <Trash2 size={18} />
          Delete
        </button>
      </div>
    </div>
  );
}
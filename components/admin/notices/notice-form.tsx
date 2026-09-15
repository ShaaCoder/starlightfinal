"use client";

import { useState, useEffect } from "react";
import { Notice } from "@/types/notice";

type Props = {
  onAddNotice: (notice: Omit<Notice, "id" | "createdAt">) => void;
  editingNotice: Notice | null;
  onUpdateNotice: (id: string, notice: Partial<Notice>) => void;
};

export default function NoticeForm({
  onAddNotice,
  editingNotice,
  onUpdateNotice,
}: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [important, setImportant] = useState(false);

  useEffect(() => {
    if (editingNotice) {
      setTitle(editingNotice.title);
      setDescription(editingNotice.description);
      setImportant(editingNotice.important);
    } else {
      setTitle("");
      setDescription("");
      setImportant(false);
    }
  }, [editingNotice]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNotice) {
      onUpdateNotice(editingNotice.id, { title, description, important });
    } else {
      onAddNotice({ title, description, important });
    }
  };

  return (
    <div className="rounded-2xl border border-blue-100 bg-white p-4 sm:p-6">
      <h2 className="mb-6 text-2xl font-bold text-blue-900 sm:mb-8 sm:text-4xl">
        {editingNotice ? "Edit Notice" : "Add New Notice"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* TITLE */}
        <div>
          <label className="block text-sm font-semibold mb-3">
            Notice Title *
          </label>

          <input
            type="text"
            placeholder="e.g., Holiday Notice"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="
              w-full
              h-14
              border
              border-blue-100
              rounded-xl
              px-4
              outline-none
              focus:border-blue-500
            "
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="block text-sm font-semibold mb-3">
            Notice Description *
          </label>

          <textarea
            rows={5}
            placeholder="Write notice description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="
              w-full
              border
              border-blue-100
              rounded-xl
              p-4
              outline-none
              resize-none
              focus:border-blue-500
            "
          />
        </div>

        {/* IMPORTANT */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="important"
            checked={important}
            onChange={(e) => setImportant(e.target.checked)}
            className="w-5 h-5"
          />
          <label htmlFor="important" className="text-sm font-semibold">
            Mark as Important
          </label>
        </div>

        {/* BUTTONS */}
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          {editingNotice && (
            <button
              type="button"
              onClick={() => {
                setTitle("");
                setDescription("");
              }}
              className="
                h-12
                w-full
                px-6
                bg-gray-200
                hover:bg-gray-300
                transition
                rounded-xl
                font-medium
                sm:w-auto
              "
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="
              h-12
              w-full
              px-6
              bg-blue-600
              hover:bg-blue-700
              transition
              rounded-xl
              text-white
              font-medium
              sm:w-auto
            "
          >
            {editingNotice ? "Update Notice" : "Add Notice"}
          </button>
        </div>
      </form>
    </div>
  );
}

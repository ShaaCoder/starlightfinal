"use client";

import { useState, useEffect } from "react";
import { Course } from "@/lib/types";
import { ImageUpload } from "@/components/image-upload";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

type Props = {
  onAddCourse: (course: Omit<Course, "id" | "created_at">) => void;
  editingCourse: Course | null;
  onUpdateCourse: (id: string, course: Partial<Course>) => void;
};

export default function CourseForm({
  onAddCourse,
  editingCourse,
  onUpdateCourse,
}: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [duration, setDuration] = useState("Flexible");
  const [fee, setFee] = useState("");
  const [featured, setFeatured] = useState(false);

  useEffect(() => {
    if (editingCourse) {
      setTitle(editingCourse.title);
      setDescription(editingCourse.description);
      setImage(editingCourse.image_url || editingCourse.image || "");
      setDuration(editingCourse.duration || "Flexible");
      setFee(editingCourse.fee || "");
      setFeatured(editingCourse.featured || false);
    } else {
      setTitle("");
      setDescription("");
      setImage("");
      setDuration("Flexible");
      setFee("");
      setFeatured(false);
    }
  }, [editingCourse]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = generateSlug(title);
    if (editingCourse) {
      onUpdateCourse(editingCourse.id, { 
        title, 
        description, 
        image_url: image,
        slug,
        duration,
        fee,
        featured
      });
    } else {
      onAddCourse({ 
        title, 
        description, 
        image_url: image, 
        slug,
        duration,
        fee,
        featured
      });
    }
  };

  return (
    <div className="rounded-2xl border border-blue-100 bg-white p-4 sm:p-6">
      <h2 className="mb-6 text-2xl font-bold text-blue-900 sm:mb-8 sm:text-4xl">
        {editingCourse ? "Edit Course" : "Add New Course"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* TITLE */}
        <div>
          <label className="block text-sm font-semibold mb-3">
            Course Title *
          </label>

          <input
            type="text"
            placeholder="e.g., Web Development"
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
            Description *
          </label>

          <textarea
            rows={5}
            placeholder="Course description"
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

        {/* Duration & Fee Row */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Duration */}
          <div>
            <label className="block text-sm font-semibold mb-3">
              Duration
            </label>
            <input
              type="text"
              placeholder="e.g., 3 months, 6 months"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
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

          {/* Fee */}
          <div>
            <label className="block text-sm font-semibold mb-3">
              Fee
            </label>
            <input
              type="text"
              placeholder="e.g., ₹5000, Contact Us"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
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
        </div>

        {/* Featured Checkbox */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="featured"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="h-5 w-5 text-blue-600"
          />
          <label htmlFor="featured" className="text-sm font-semibold">
            Featured Course
          </label>
        </div>

        {/* IMAGE */}
        <div>
          <label className="block text-sm font-semibold mb-3">
            Course Image
          </label>
          <ImageUpload value={image} onChange={(url) => setImage(url || '')} bucket="courses" folder="uploads" />
        </div>

        {/* BUTTONS */}
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          {editingCourse && (
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
            {editingCourse ? "Update Course" : "Add Course"}
          </button>
        </div>
      </form>
    </div>
  );
}

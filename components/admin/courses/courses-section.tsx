"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Course } from "@/lib/types";

import CourseForm from "./course-form";
import CoursesList from "./courses-list";

export default function CoursesSection() {
  const supabase = useRef(createClient()).current;
  const [courses, setCourses] = useState<Course[]>([]);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCourses((data || []) as Course[]);
    } catch (error) {
      toast.error("Failed to load courses");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCourse = async (courseData: Omit<Course, "id" | "created_at">) => {
    setIsSubmitting(true);
    try {
      const { error } = await (supabase.from("courses") as any).insert([
        {
          title: courseData.title,
          description: courseData.description,
          image_url: courseData.image_url,
          slug: courseData.slug,
          duration: courseData.duration,
          fee: courseData.fee,
          featured: courseData.featured,
        },
      ]);

      if (error) throw error;
      toast.success("Course added successfully!");
      loadCourses();
    } catch (error) {
      toast.error("Failed to add course");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCourse = async (id: string, courseData: Partial<Course>) => {
    setIsSubmitting(true);
    try {
      const { error } = await (supabase.from("courses") as any)
        .update({
          title: courseData.title,
          description: courseData.description,
          image_url: courseData.image_url,
          slug: courseData.slug,
          duration: courseData.duration,
          fee: courseData.fee,
          featured: courseData.featured,
        })
        .eq("id", id);

      if (error) throw error;
      toast.success("Course updated successfully!");
      setEditingCourse(null);
      loadCourses();
    } catch (error) {
      toast.error("Failed to update course");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    setIsSubmitting(true);
    try {
      const { error } = await (supabase.from("courses") as any).delete().eq("id", id);

      if (error) throw error;
      toast.success("Course deleted successfully!");
      loadCourses();
    } catch (error) {
      toast.error("Failed to delete course");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          placeholder="Search courses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 h-12 px-4 border border-blue-100 rounded-xl focus:outline-none focus:border-blue-500"
        />
      </div>
      <CourseForm
        onAddCourse={handleAddCourse}
        editingCourse={editingCourse}
        onUpdateCourse={handleUpdateCourse}
      />
      <CoursesList
        courses={filteredCourses}
        onEdit={setEditingCourse}
        onDelete={handleDeleteCourse}
        isLoading={isLoading}
      />
    </div>
  );
}

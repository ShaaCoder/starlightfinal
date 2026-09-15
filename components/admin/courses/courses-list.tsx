import { Course } from "@/lib/types";
import CourseCard from "./course-card";

type Props = {
  courses: Course[];
  onEdit: (course: Course) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
};

export default function CoursesList({ courses, onEdit, onDelete }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          onEdit={() => onEdit(course)}
          onDelete={() => onDelete(course.id)}
        />
      ))}
    </div>
  );
}
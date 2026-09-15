"use client";

import { useState, useEffect } from "react";
import { Student } from "@/types/student";

type Props = {
  onAddStudent: (student: Omit<Student, "id" | "createdAt">) => void;
  editingStudent: Student | null;
  onUpdateStudent: (id: string, student: Partial<Student>) => void;
};

export default function StudentForm({
  onAddStudent,
  editingStudent,
  onUpdateStudent,
}: Props) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [enrollmentNumber, setEnrollmentNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [course, setCourse] = useState("");
  const [classSection, setClassSection] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [subjectsString, setSubjectsString] = useState("");

  useEffect(() => {
    if (editingStudent) {
      setFullName(editingStudent.fullName);
      setEmail(editingStudent.email);
      setEnrollmentNumber(editingStudent.enrollmentNumber);
      setPhone(editingStudent.phone);
      setCourse(editingStudent.course);
      setClassSection(editingStudent.classSection);
      setReferenceNumber(editingStudent.referenceNumber);
      setSubjectsString(editingStudent.subjects.join(", "));
    } else {
      setFullName("");
      setEmail("");
      setEnrollmentNumber("");
      setPhone("");
      setCourse("");
      setClassSection("");
      setReferenceNumber("");
      setSubjectsString("");
    }
  }, [editingStudent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subjects = subjectsString
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (editingStudent) {
      onUpdateStudent(editingStudent.id, {
        fullName,
        email,
        enrollmentNumber,
        phone,
        course,
        classSection,
        referenceNumber,
        subjects,
      });
    } else {
      onAddStudent({
        fullName,
        email,
        enrollmentNumber,
        phone,
        course,
        classSection,
        referenceNumber,
        subjects,
      });
    }
  };

  return (
    <div className="rounded-2xl border border-blue-100 bg-white p-4 sm:p-6">
      <h2 className="mb-6 text-2xl font-bold text-blue-900 sm:mb-8 sm:text-4xl">
        {editingStudent ? "Edit Student" : "Add New Student"}
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* FULL NAME */}
        <div>
          <label className="block text-sm font-semibold mb-3">
            Full Name *
          </label>
          <input
            type="text"
            placeholder="Student name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
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

        {/* EMAIL */}
        <div>
          <label className="block text-sm font-semibold mb-3">
            Email *
          </label>
          <input
            type="email"
            placeholder="student@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

        {/* ENROLLMENT */}
        <div>
          <label className="block text-sm font-semibold mb-3">
            Enrollment Number *
          </label>
          <input
            type="text"
            placeholder="e.g., VEA-2024-001"
            value={enrollmentNumber}
            onChange={(e) => setEnrollmentNumber(e.target.value)}
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

        {/* PHONE */}
        <div>
          <label className="block text-sm font-semibold mb-3">
            Phone
          </label>
          <input
            type="text"
            placeholder="Contact number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
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

        {/* COURSE */}
        <div>
          <label className="block text-sm font-semibold mb-3">
            Course
          </label>
          <input
            type="text"
            placeholder="Enrolled course"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
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

        {/* CLASS */}
        <div>
          <label className="block text-sm font-semibold mb-3">
            Class
          </label>
          <input
            type="text"
            placeholder="e.g., 10th, 12th"
            value={classSection}
            onChange={(e) => setClassSection(e.target.value)}
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

        {/* REFERENCE NUMBER */}
        <div>
          <label className="block text-sm font-semibold mb-3">
            Reference Number
          </label>
          <input
            type="text"
            placeholder="Reference number"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
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

        {/* SUBJECTS */}
        <div>
          <label className="block text-sm font-semibold mb-3">
            Subjects (comma-separated)
          </label>
          <input
            type="text"
            placeholder="e.g., Math, Science, English"
            value={subjectsString}
            onChange={(e) => setSubjectsString(e.target.value)}
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

        {/* BUTTONS */}
        <div className="flex flex-col gap-3 md:col-span-2 sm:flex-row sm:gap-4">
          {editingStudent && (
            <button
              type="button"
              onClick={() => {
                setFullName("");
                setEmail("");
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
            {editingStudent ? "Update Student" : "Add Student"}
          </button>
        </div>
      </form>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  GraduationCap,
  BookOpen,
  ArrowRight,
  Clock,
  Star,
  Laptop,
  School,
  FileText,
  Languages,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { createServerClient } from "@/lib/supabase/server";
import { Course } from "@/lib/types";

// ISR: Revalidate every 60 seconds
export const revalidate = 60;

export const metadata: Metadata = {
  title:
    "Courses | Starlight Academy | Competitive Exams, NIOS & Computer Courses",
  description:
    "Explore courses at Starlight Academy including Government Competitive Exam preparation, NIOS, Open Schooling, Computer Courses and School of English programs.",
  keywords: [
    "Starlight Academy courses",
    "competitive exam coaching",
    "government exam preparation",
    "SSC coaching",
    "CGL coaching",
    "CHSL coaching",
    "Delhi Police coaching",
    "Bank exam coaching",
    "CTET coaching",
    "DSSSB coaching",
    "KVS coaching",
    "NVS coaching",
    "NIOS admission",
    "NIOS coaching",
    "Open Schooling",
    "Computer Courses",
    "English Classes",
    "Academic Courses",
    "Admission Guidance",
  ],
  openGraph: {
    title:
      "Courses | Starlight Academy | Competitive Exams, NIOS & Computer Courses",
    description:
      "Explore competitive exam preparation, NIOS, Open Schooling, Computer Courses and School of English programs at Starlight Academy.",
    type: "website",
  },
};

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default async function CoursesPage() {
  const supabase = createServerClient();

  let courses: Course[] = [];

  try {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false });

    // Debug information
    console.log("======================================");
    console.log("SUPABASE COURSES DATA:", data);
    console.log("SUPABASE COURSES ERROR:", error);
    console.log("======================================");

    if (error) {
      console.error(
        "Failed to fetch courses from Supabase:",
        error
      );

      courses = [];
    } else {
      courses = (data || []) as Course[];
    }
  } catch (error) {
    console.error(
      "Unexpected error while fetching courses:",
      error
    );

    courses = [];
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-blue-50/40 to-red-50/40">

      {/* =========================================================
          HERO
      ========================================================== */}

      <section className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-red-600 text-white">

        <div className="absolute inset-0 opacity-10">

          <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-white blur-3xl" />

          <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-white blur-3xl" />

        </div>

        <div className="container relative mx-auto px-4 py-20 text-center md:py-24">

          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-medium backdrop-blur">

            <GraduationCap className="h-4 w-4" />

            Campus of Competitive Studies & School of English

          </span>

          <h1 className="mx-auto mb-6 max-w-4xl text-4xl font-bold leading-tight md:text-6xl">
            Courses & Learning Programs
          </h1>

          <p className="mx-auto max-w-3xl text-lg leading-8 text-blue-100 md:text-xl">
            Build your academic foundation, prepare for competitive
            examinations and develop practical skills with structured
            learning programs at Starlight Academy.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">

            <Link
              href="/admission"
              className="w-full sm:w-auto"
            >
              <Button
                size="lg"
                className="w-full rounded-xl bg-white px-8 font-semibold text-gray-900 shadow-lg hover:bg-gray-100 sm:w-auto"
              >
                Apply for Admission

                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>

            <Link
              href="/contact"
              className="w-full sm:w-auto"
            >
              <Button
                size="lg"
                variant="outline"
                className="w-full rounded-xl border-white bg-transparent px-8 font-semibold text-white hover:bg-white/10 sm:w-auto"
              >
                Contact Us
              </Button>
            </Link>

          </div>

        </div>

      </section>

      {/* =========================================================
          COURSE CATEGORIES
      ========================================================== */}


      {/* =========================================================
          DATABASE COURSES
      ========================================================== */}

      {courses.length > 0 && (

        <section className="bg-white py-16 md:py-20">

          <div className="container mx-auto px-4">

            <div className="mx-auto mb-12 max-w-3xl text-center">

              <span className="text-sm font-semibold uppercase tracking-wider text-red-600">
                Current Programs
              </span>

              <h2 className="mt-3 text-3xl font-bold text-gray-900 md:text-4xl">
                Available Courses
              </h2>

              <p className="mt-4 text-lg leading-8 text-gray-600">
                View the courses currently available through our course
                catalog.
              </p>

            </div>

            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">

              {courses.map((course) => (

                <div
                  key={course.id}
                  className={`group overflow-hidden rounded-3xl bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${
                    course.featured
                      ? "border-2 border-blue-600 shadow-blue-100"
                      : "border border-slate-200"
                  }`}
                >

                  {/* Top Gradient */}

                  <div
                    className={`h-2 ${
                      course.featured
                        ? "bg-gradient-to-r from-red-600 via-blue-600 to-red-600"
                        : "bg-gradient-to-r from-blue-600 via-indigo-600 to-red-600"
                    }`}
                  />

                  {/* Image */}

                  <div className="relative h-56 overflow-hidden">

                    {course.image_url || course.image ? (

                      <Image
                        src={
                          course.image_url ||
                          course.image ||
                          ""
                        }
                        alt={course.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover transition duration-700 group-hover:scale-110"
                      />

                    ) : (

                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-100 to-red-100">

                        <GraduationCap className="h-20 w-20 text-blue-600" />

                      </div>

                    )}

                    <div className="absolute left-4 top-4 flex gap-2">

                      {course.featured && (

                        <span className="flex items-center gap-1 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">

                          <Star className="h-3 w-3" />

                          Featured

                        </span>

                      )}

                    </div>

                  </div>

                  {/* Content */}

                  <div className="p-6">

                    <h3 className="mb-3 text-xl font-bold text-slate-900 transition-colors group-hover:text-blue-600">
                      {course.title}
                    </h3>

                    <p className="mb-5 line-clamp-3 text-sm leading-7 text-slate-600">

                      {course.description ||
                        "A structured learning program designed to support academic growth, examination preparation and skill development."}

                    </p>

                    {/* Duration */}

                    {course.duration && (

                      <div className="mb-5 flex items-center gap-2">

                        <div className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-sm text-slate-600">

                          <Clock className="h-4 w-4 text-blue-600" />

                          {course.duration}

                        </div>

                      </div>

                    )}

                    {/* Buttons */}

                    <div className="flex gap-3">

                      <Link
                        href={`/courses/${
                          course.slug ||
                          generateSlug(course.title)
                        }`}
                        className="flex-1"
                      >

                        <Button
                          variant="outline"
                          className="w-full rounded-xl"
                        >
                          Details
                        </Button>

                      </Link>

                      <Link
                        href="/admission"
                        className="flex-1"
                      >

                        <Button className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700">
                          Enroll
                        </Button>

                      </Link>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          </div>

        </section>

      )}

      {/* =========================================================
          NO COURSES MESSAGE
      ========================================================== */}

      {courses.length === 0 && (

        <section className="bg-white py-16">

          <div className="container mx-auto px-4">

            <div className="mx-auto max-w-xl rounded-3xl border border-red-100 bg-red-50 p-8 text-center">

              <BookOpen className="mx-auto h-12 w-12 text-red-600" />

              <h2 className="mt-4 text-2xl font-bold text-gray-900">
                No Courses Available
              </h2>

              <p className="mt-3 text-gray-600">
                Courses could not be loaded from the database.
                Please check the Supabase connection and permissions.
              </p>

            </div>

          </div>

        </section>

      )}

      {/* =========================================================
          GUIDANCE SECTION
      ========================================================== */}

      <section className="bg-slate-50 py-16 md:py-20">

        <div className="container mx-auto px-4">

          <div className="mx-auto max-w-4xl text-center">

            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
              Not Sure Which Course to Choose?
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-600">
              Speak with our team to understand the available programs,
              admission process and learning options according to your
              educational goals.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">

              <Link href="/contact">

                <Button
                  size="lg"
                  className="w-full rounded-xl bg-blue-600 px-8 hover:bg-blue-700 sm:w-auto"
                >
                  Get Course Guidance

                  <ArrowRight className="ml-2 h-4 w-4" />

                </Button>

              </Link>

              <Link href="/admission">

                <Button
                  size="lg"
                  variant="outline"
                  className="w-full rounded-xl px-8 sm:w-auto"
                >
                  Start Admission
                </Button>

              </Link>

            </div>

          </div>

        </div>

      </section>

      {/* =========================================================
          FINAL CTA
      ========================================================== */}

      <section className="bg-gradient-to-r from-blue-700 via-indigo-700 to-red-600 py-20 text-white">

        <div className="container mx-auto px-4 text-center">

          <h2 className="mb-6 text-3xl font-bold md:text-5xl">
            Your Dream. Our Preparation. Your Success.
          </h2>

          <p className="mx-auto mb-8 max-w-2xl text-lg leading-8 text-blue-100">
            Start your learning journey with Starlight Academy and choose the
            program that fits your academic or career goals.
          </p>

          <Link
            href="/admission"
            className="inline-flex w-full sm:w-auto"
          >

            <Button
              size="lg"
              className="w-full rounded-xl bg-white px-8 font-semibold text-gray-900 shadow-lg hover:bg-gray-100 sm:w-auto"
            >
              Apply for Admission

              <ArrowRight className="ml-2 h-4 w-4" />

            </Button>

          </Link>

        </div>

      </section>

    </main>
  );
}
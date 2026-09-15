import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import {
  ArrowLeft,
  ArrowRight,
  Clock,
  BookOpen,
  GraduationCap,
  BadgeIndianRupee,
  CircleCheck as CheckCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { createServerClient } from "@/lib/supabase/server";
import { Course } from "@/lib/types";

// Revalidate every 60 seconds
export const revalidate = 60;

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

/* =========================================================
   GET COURSE FROM SUPABASE
========================================================= */

async function getCourse(slug: string): Promise<Course | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  console.log("======================================");
  console.log("COURSE DETAILS SLUG:", slug);
  console.log("COURSE DETAILS DATA:", data);
  console.log("COURSE DETAILS ERROR:", error);
  console.log("======================================");

  if (error) {
    console.error(
      "Failed to fetch course from Supabase:",
      error
    );

    return null;
  }

  if (!data) {
    return null;
  }

  return data as Course;
}

/* =========================================================
   METADATA
========================================================= */

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const course = await getCourse(slug);

  if (!course) {
    return {
      title: "Course Not Found | Starlight Academy",
      description:
        "The requested course could not be found.",
    };
  }

  const imageUrl =
    course.image_url ||
    course.image ||
    undefined;

  return {
    title: `${course.title} | Starlight Academy`,

    description:
      course.description ||
      `Learn more about ${course.title} at Starlight Academy.`,

    openGraph: {
      title: `${course.title} | Starlight Academy`,

      description:
        course.description ||
        `Learn more about ${course.title} at Starlight Academy.`,

      images: imageUrl
        ? [imageUrl]
        : [],
    },
  };
}

/* =========================================================
   COURSE DETAILS PAGE
========================================================= */

export default async function CourseDetailsPage({
  params,
}: PageProps) {
  const { slug } = await params;

  const course = await getCourse(slug);

  if (!course) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white">

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden">

        {/* Background */}

        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-red-50" />

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">

          {/* =================================================
              BACK BUTTON
          ================================================== */}

          <Link
            href="/courses"
            className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-4 py-2 text-sm font-medium text-blue-600 shadow-sm backdrop-blur transition-all hover:border-blue-200 hover:bg-white hover:text-blue-700 hover:shadow-md"
          >
            <ArrowLeft className="h-4 w-4" />

            Back to Courses
          </Link>

          {/* =================================================
              MAIN GRID
          ================================================== */}

          <div className="mt-8 grid items-center gap-10 lg:mt-12 lg:grid-cols-[1fr_0.9fr] lg:gap-14 xl:gap-20">

            {/* =================================================
                LEFT - COURSE CONTENT
            ================================================== */}

            <div>

              {/* Featured */}

              {course.featured && (
                <div className="mb-5 inline-flex items-center rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-700">
                  Featured Course
                </div>
              )}

              {/* Title */}

              <h1 className="text-4xl font-black leading-[1.05] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl xl:text-7xl">
                {course.title}
              </h1>

              {/* Description */}

              <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                {course.description ||
                  "Join Starlight Academy and learn with structured guidance, expert support and practical preparation."}
              </p>

              {/* =================================================
                  COURSE INFORMATION
              ================================================== */}

              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">

                {/* Duration */}

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">

                  <Clock className="mb-3 h-6 w-6 text-blue-600" />

                  <p className="text-sm text-slate-500">
                    Duration
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {course.duration || "Flexible"}
                  </p>

                </div>

                {/* Fee */}

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">

                  <BadgeIndianRupee className="mb-3 h-6 w-6 text-red-600" />

                  <p className="text-sm text-slate-500">
                    Fee
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {course.fee || "Contact Us"}
                  </p>

                </div>

                {/* Students */}

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">

                  <GraduationCap className="mb-3 h-6 w-6 text-green-600" />

                  <p className="text-sm text-slate-500">
                    Students
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    100+
                  </p>

                </div>

              </div>

              {/* =================================================
                  ACTION BUTTONS
              ================================================== */}

              <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row">

                <Link
                  href="/admission"
                  className="w-full sm:w-auto"
                >

                  <Button
                    size="lg"
                    className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-red-600 px-7 shadow-lg transition-all hover:from-blue-700 hover:to-red-700 hover:shadow-xl sm:w-auto"
                  >
                    Apply Now

                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>

                </Link>

                <Link
                  href="/contact"
                  className="w-full sm:w-auto"
                >

                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full rounded-xl px-7 sm:w-auto"
                  >
                    Contact Us
                  </Button>

                </Link>

              </div>

            </div>

            {/* =================================================
                RIGHT - COURSE IMAGE
            ================================================== */}

            <div className="w-full">

              {/* Image Card */}

              <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/60 sm:p-3">

                {/* Decorative background */}

                <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-100/50 blur-3xl" />

                <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-red-100/50 blur-3xl" />

                {/* Actual image area */}

                <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-[1.5rem] bg-slate-50">

                  {course.image_url || course.image ? (

                    <Image
                      src={
                        course.image_url ||
                        course.image ||
                        ""
                      }
                      alt={`${course.title} - Starlight Academy`}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-contain p-1 transition-transform duration-500 hover:scale-[1.02] sm:p-2"
                      priority
                    />

                  ) : (

                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-100 via-white to-red-100">

                      <BookOpen className="h-24 w-24 text-blue-600 sm:h-32 sm:w-32" />

                    </div>

                  )}

                </div>

              </div>

              {/* Small image caption */}

              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500">

                <GraduationCap className="h-4 w-4 text-blue-600" />

                <span>
                  Learn with Starlight Academy
                </span>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          WHAT YOU WILL LEARN
      ====================================================== */}

      <section className="bg-slate-50/70 py-16 sm:py-20">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-lg sm:p-8 md:p-10">

            <div className="mb-8">

              <span className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                Course Benefits
              </span>

              <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
                What You'll Learn
              </h2>

            </div>

            <div className="grid gap-4 md:grid-cols-2 md:gap-5">

              {[
                "Expert faculty guidance",
                "Comprehensive study material",
                "Regular mock tests",
                "Exam preparation strategy",
                "Personalized mentoring",
                "Doubt solving sessions",
              ].map((item) => (

                <div
                  key={item}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4 transition-all hover:border-green-100 hover:bg-green-50/40"
                >

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100">

                    <CheckCircle className="h-5 w-5 text-green-600" />

                  </div>

                  <span className="font-medium text-slate-700">
                    {item}
                  </span>

                </div>

              ))}

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          CTA
      ====================================================== */}

      <section className="pb-16 pt-4 sm:pb-20">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-blue-600 via-indigo-600 to-red-600 p-8 text-center text-white shadow-2xl sm:p-10 md:p-14">

            {/* Decorative circles */}

            <div className="absolute -left-16 -top-16 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

            <div className="absolute -bottom-16 -right-16 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

            <div className="relative">

              <h2 className="text-3xl font-bold sm:text-4xl">
                Ready To Start Your Journey?
              </h2>

              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/90 sm:text-lg">
                Join Starlight Academy and achieve
                your academic goals with confidence.
              </p>

              <Link href="/admission">

                <Button
                  size="lg"
                  className="mt-8 rounded-xl bg-white px-8 font-semibold text-slate-900 shadow-lg hover:bg-slate-100"
                >
                  Apply For Admission
                </Button>

              </Link>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}
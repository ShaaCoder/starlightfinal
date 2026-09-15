'use client';

import { ContactForm } from '@/components/contact-form';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  GraduationCap,
  BookOpen,
  Laptop,
  CheckCircle2,
} from 'lucide-react';

function ContactPageContent() {
  const searchParams = useSearchParams();
  const course = searchParams.get('course') || '';

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-red-50">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="bg-gradient-to-r from-blue-600 via-indigo-600 to-red-600 py-20 text-white">
        <div className="container mx-auto px-4 text-center">

          <span className="mb-4 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm backdrop-blur">
            Get In Touch
          </span>

          <h1 className="mb-6 text-4xl font-bold md:text-6xl">
            Contact Starlight Academy
          </h1>

          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-blue-100">
            Have questions about competitive exam preparation,
            NIOS, Open Schooling or computer courses? Contact
            Starlight Academy and our team will help you with
            course selection, admission and academic guidance.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">

            <a href="#contact-form">
              <button
                type="button"
                className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-white px-7 font-semibold text-blue-700 shadow-lg transition hover:bg-gray-100 sm:w-auto"
              >
                Send Enquiry
              </button>
            </a>

            <a href="tel:+918750123355">
              <button
                type="button"
                className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-white/40 bg-white/10 px-7 font-semibold text-white backdrop-blur transition hover:bg-white/20 sm:w-auto"
              >
                <Phone className="mr-2 h-5 w-5" />
                Call Us
              </button>
            </a>

          </div>
        </div>
      </section>

      {/* =====================================================
          CONTACT CARDS
      ===================================================== */}

      <section className="py-10">
        <div className="container mx-auto px-4">

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

            {/* PHONE */}

            <div className="card-hover rounded-2xl border border-gray-100 bg-white p-6 shadow-card">

              <div className="mb-4 inline-block rounded-xl bg-blue-100 p-3 text-blue-700">
                <Phone className="h-8 w-8" />
              </div>

              <h3 className="mb-3 font-bold text-gray-900">
                Call Us
              </h3>

              <div className="space-y-2">

                <a
                  href="tel:+918750123355"
                  className="block text-gray-700 transition hover:text-blue-600 hover:underline"
                >
                  8750123355
                </a>

                <a
                  href="tel:+919899771089"
                  className="block text-gray-700 transition hover:text-blue-600 hover:underline"
                >
                  9899771089
                </a>

              </div>
            </div>

            {/* EMAIL */}

            <div className="card-hover rounded-2xl border border-gray-100 bg-white p-6 shadow-card">

              <div className="mb-4 inline-block rounded-xl bg-red-100 p-3 text-red-700">
                <Mail className="h-8 w-8" />
              </div>

              <h3 className="mb-3 font-bold text-gray-900">
                Email
              </h3>

              <a
                href="mailto:starlightacademy.info@gmail.com"
                className="break-all text-gray-700 transition hover:text-red-600 hover:underline"
              >
                starlightacademy.info@gmail.com
              </a>

            </div>

            {/* OFFICE HOURS */}

            <div className="card-hover rounded-2xl border border-gray-100 bg-white p-6 shadow-card">

              <div className="mb-4 inline-block rounded-xl bg-blue-100 p-3 text-blue-700">
                <Clock className="h-8 w-8" />
              </div>

              <h3 className="mb-2 font-bold text-gray-900">
                Office Hours
              </h3>

              <p className="text-gray-700">
                Contact us for current class and admission
                timings.
              </p>

            </div>

            {/* LOCATION */}

            <div className="card-hover rounded-2xl border border-gray-100 bg-white p-6 shadow-card">

              <div className="mb-4 inline-block rounded-xl bg-green-100 p-3 text-green-700">
                <MapPin className="h-8 w-8" />
              </div>

              <h3 className="mb-2 font-bold text-gray-900">
                Visit Us
              </h3>

              <p className="text-gray-700">
                Starlight Academy
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Campus of Competitive Studies
              </p>

            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          COURSES
      ===================================================== */}

      <section className="py-10">
        <div className="container mx-auto px-4">

          <div className="mb-10 text-center">

            <span className="mb-4 inline-block rounded-full border border-blue-200 bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
              What Can We Help You With?
            </span>

            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
              Courses & Academic Guidance
            </h2>

            <p className="mx-auto mt-4 max-w-3xl text-gray-600">
              Contact our team to learn more about the courses
              and programs available at Starlight Academy.
            </p>

          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

            {/* GOVERNMENT EXAMS */}

            <div className="card-hover rounded-2xl border border-gray-100 bg-white p-6 shadow-card">

              <div className="mb-4 inline-flex rounded-xl bg-blue-100 p-3 text-blue-700">
                <GraduationCap className="h-7 w-7" />
              </div>

              <h3 className="mb-3 text-lg font-bold text-gray-900">
                Government Exams
              </h3>

              <p className="text-sm leading-relaxed text-gray-600">
                Guidance and preparation support for SSC,
                CGL, CHSL, Delhi Police, Banking, CTET,
                DSSSB, KVS, NVS and other competitive exams.
              </p>

            </div>

            {/* NIOS */}

            <div className="card-hover rounded-2xl border border-gray-100 bg-white p-6 shadow-card">

              <div className="mb-4 inline-flex rounded-xl bg-green-100 p-3 text-green-700">
                <BookOpen className="h-7 w-7" />
              </div>

              <h3 className="mb-3 text-lg font-bold text-gray-900">
                NIOS
              </h3>

              <p className="text-sm leading-relaxed text-gray-600">
                Get guidance for NIOS Secondary, Senior
                Secondary, subject selection, admission and
                examination-related requirements.
              </p>

            </div>

            {/* OPEN SCHOOLING */}

            <div className="card-hover rounded-2xl border border-gray-100 bg-white p-6 shadow-card">

              <div className="mb-4 inline-flex rounded-xl bg-purple-100 p-3 text-purple-700">
                <BookOpen className="h-7 w-7" />
              </div>

              <h3 className="mb-3 text-lg font-bold text-gray-900">
                Open Schooling
              </h3>

              <p className="text-sm leading-relaxed text-gray-600">
                Enquire about Class 10th and Class 12th
                Open Schooling, subject selection and
                academic support.
              </p>

            </div>

            {/* COMPUTER */}

            <div className="card-hover rounded-2xl border border-gray-100 bg-white p-6 shadow-card">

              <div className="mb-4 inline-flex rounded-xl bg-orange-100 p-3 text-orange-700">
                <Laptop className="h-7 w-7" />
              </div>

              <h3 className="mb-3 text-lg font-bold text-gray-900">
                Computer Courses
              </h3>

              <p className="text-sm leading-relaxed text-gray-600">
                Enquire about computer fundamentals, MS
                Office, Advanced Excel, Tally, DTP and
                digital skills courses.
              </p>

            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          CONTACT FORM
      ===================================================== */}

      <section
        id="contact-form"
        className="pb-20 pt-10"
      >
        <div className="container mx-auto px-4">

          <div className="grid gap-10 lg:grid-cols-2">

            {/* LEFT CONTENT */}

            <div>

              <span className="mb-4 inline-block rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-700">
                Talk To Our Team
              </span>

              <h2 className="mb-6 text-4xl font-bold text-gray-900">
                How Can We Help You?
              </h2>

              <p className="mb-8 max-w-xl leading-relaxed text-gray-600">
                Whether you are planning to prepare for a
                competitive examination, looking for NIOS or
                Open Schooling guidance, or want to learn
                computer skills, send us your enquiry.
              </p>

              <div className="space-y-4">

                <div className="card-hover flex items-start gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-card">
                  <CheckCircle2 className="mt-0.5 h-6 w-6 flex-shrink-0 text-green-600" />

                  <div>
                    <h3 className="font-bold text-gray-900">
                      Admission Guidance
                    </h3>

                    <p className="mt-1 text-sm text-gray-600">
                      Get help understanding the admission
                      process and required details.
                    </p>
                  </div>
                </div>

                <div className="card-hover flex items-start gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-card">
                  <CheckCircle2 className="mt-0.5 h-6 w-6 flex-shrink-0 text-green-600" />

                  <div>
                    <h3 className="font-bold text-gray-900">
                      Course Selection
                    </h3>

                    <p className="mt-1 text-sm text-gray-600">
                      Discuss your educational goals and
                      choose a suitable course.
                    </p>
                  </div>
                </div>

                <div className="card-hover flex items-start gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-card">
                  <CheckCircle2 className="mt-0.5 h-6 w-6 flex-shrink-0 text-green-600" />

                  <div>
                    <h3 className="font-bold text-gray-900">
                      Competitive Exam Guidance
                    </h3>

                    <p className="mt-1 text-sm text-gray-600">
                      Enquire about preparation for
                      government and competitive examinations.
                    </p>
                  </div>
                </div>

                <div className="card-hover flex items-start gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-card">
                  <CheckCircle2 className="mt-0.5 h-6 w-6 flex-shrink-0 text-green-600" />

                  <div>
                    <h3 className="font-bold text-gray-900">
                      Student Assistance
                    </h3>

                    <p className="mt-1 text-sm text-gray-600">
                      Get personalized assistance for your
                      academic and course-related questions.
                    </p>
                  </div>
                </div>

              </div>

              {/* QUICK CONTACT */}

              <div className="mt-8 rounded-2xl bg-gradient-to-r from-blue-600 to-red-600 p-6 text-white">

                <h3 className="text-xl font-bold">
                  Prefer to Call?
                </h3>

                <p className="mt-2 text-sm text-blue-100">
                  Speak directly with our team for admission
                  and course enquiries.
                </p>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:gap-6">

                  <a
                    href="tel:+918750123355"
                    className="font-semibold hover:underline"
                  >
                    8750123355
                  </a>

                  <a
                    href="tel:+919899771089"
                    className="font-semibold hover:underline"
                  >
                    9899771089
                  </a>

                </div>

              </div>

            </div>

            {/* RIGHT FORM */}

            <div>
              <ContactForm initialCourse={course} />
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
      ===================================================== */}

      <section className="bg-white pb-20">
        <div className="container mx-auto px-4">

          <div className="rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-red-600 p-8 text-center text-white shadow-2xl md:p-12">

            <h2 className="text-3xl font-bold md:text-4xl">
              Start Your Journey With Starlight Academy
            </h2>

            <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-blue-100">
              Have a question about a course or admission?
              Get in touch with Starlight Academy today.
            </p>

            <div className="mt-7 flex flex-col justify-center gap-4 sm:flex-row">

              <a href="tel:+918750123355">
                <button
                  type="button"
                  className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-white px-7 font-semibold text-blue-700 shadow-lg transition hover:bg-gray-100 sm:w-auto"
                >
                  <Phone className="mr-2 h-5 w-5" />
                  Call 8750123355
                </button>
              </a>

              <a href="mailto:starlightacademy.info@gmail.com">
                <button
                  type="button"
                  className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-white/40 bg-white/10 px-7 font-semibold text-white backdrop-blur transition hover:bg-white/20 sm:w-auto"
                >
                  <Mail className="mr-2 h-5 w-5" />
                  Email Us
                </button>
              </a>

            </div>

          </div>

        </div>
      </section>

    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
            <p className="text-gray-600">
              Loading...
            </p>
          </div>
        </div>
      }
    >
      <ContactPageContent />
    </Suspense>
  );
}
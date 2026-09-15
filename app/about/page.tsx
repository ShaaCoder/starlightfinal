import Link from 'next/link';
import Image from 'next/image';

import {
  GraduationCap,
  Users,
  Trophy,
  Target,
  ArrowRight,
  CheckCircle,
  BookOpen,
  Award,
  Clock,
  MapPin,
  Phone,
  Building2,
} from 'lucide-react';
import jkpihalsir from "../../public/jk pihal sir.jpeg"
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const metadata = {
  title:
    'About Starlight Academy | Competitive Exam Coaching in Rohini, Delhi',

  description:
    'Starlight Academy is the Campus of Competitive Studies & School of English in Rohini, Delhi. Prepare for SSC, CGL, CHSL, Delhi Police, Banking, CTET, DSSSB, KVS, NVS and other competitive exams with experienced faculty and focused academic guidance.',

  keywords: [
    'Starlight Academy',
    'Starlight Academy Rohini',
    'Starlight Academy Delhi',
    'Competitive Exam Coaching in Rohini',
    'Competitive Exam Coaching in Delhi',
    'Government Exam Coaching in Delhi',
    'Government Exam Preparation Rohini',
    'SSC Coaching Rohini',
    'SSC Coaching Delhi',
    'CGL Coaching Rohini',
    'CHSL Coaching Rohini',
    'Delhi Police Coaching Rohini',
    'Banking Coaching Delhi',
    'CLAT Coaching Delhi',
    'NDA Coaching Delhi',
    'CUET Coaching Delhi',
    'CTET Coaching Delhi',
    'DSSSB Coaching Delhi',
    'PRT Coaching Delhi',
    'TGT Coaching Delhi',
    'PGT Coaching Delhi',
    'KVS Coaching Delhi',
    'NVS Coaching Delhi',
    'D.El.Ed Coaching Delhi',
    'B.Ed Coaching Delhi',
    'Academic Coaching Rohini',
    'School Coaching Rohini',
    'English Classes Rohini',
    'School of English Delhi',
    'Competitive Studies Rohini',
  ],

  openGraph: {
    title:
      'Starlight Academy | Campus of Competitive Studies & School of English',

    description:
      'Competitive exam preparation, academic education and English learning at Starlight Academy, Rohini, Delhi.',

    siteName: 'Starlight Academy',

    type: 'website',

    images: [
      {
        url: '/og-about.jpg',
        width: 1200,
        height: 630,
        alt:
          'Starlight Academy - Campus of Competitive Studies & School of English',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',

    title:
      'Starlight Academy | Competitive Exam Coaching in Rohini',

    description:
      'Competitive exam preparation and academic guidance at Starlight Academy, Rohini, Delhi.',

    images: ['/og-about.jpg'],
  },
};

export default function AboutPage() {
  const examCategories = [
    'SSC',
    'CGL',
    'CHSL',
    'Delhi Police',
    'Constable',
    'Head Constable',
    'MTS / GD',
    'Banking',
    'CLAT',
    'NDA',
    'CUET',
    'CPO',
    'CTET',
    'DSSSB',
    'PRT',
    'TGT',
    'PGT',
    'KVS',
    'NVS',
    'D.El.Ed',
    'B.Ed',
  ];

  const values = [
    {
      icon: Target,
      title: 'Focused Preparation',
      description:
        'Structured preparation that helps students understand concepts, practise regularly and prepare confidently for their examinations.',
    },
    {
      icon: Users,
      title: 'Experienced Faculty',
      description:
        'Learn under qualified and experienced teachers who bring subject knowledge and classroom experience to student preparation.',
    },
    {
      icon: Trophy,
      title: 'Student Success',
      description:
        'We focus on academic understanding, regular practice, confidence building and proper guidance throughout the learning journey.',
    },
  ];

  const whyChooseUs = [
    'Experienced and Qualified Faculty',
    'Competitive Exam Focused Preparation',
    'Academic Guidance',
    'Regular Practice and Test Preparation',
    'Concept-Based Learning',
    'Structured Study Material',
    'Doubt Support and Student Guidance',
    'Disciplined Learning Environment',
  ];

  const faculty = [
    {
      name: 'Dr. J.K. Pihal Sir',
      role: 'Founder & Director',
      description:
        'Experienced educator with academic expertise across English, Hindi, Mathematics, Science and Education.',
    },
    {
      name: 'Dr. P.K Singh Sir',
      role: 'Faculty',
      description:
        'Experienced educator with academic expertise in Mathematics, Education and related subjects.',
    },
    {
      name: "Ms. Rekha Ma'am",
      role: 'Faculty',
      description:
        'Faculty member with academic experience in Education, Political Science, Computer Science and competitive classes.',
    },
    {
      name: "Dr. Pooja Ma'am",
      role: 'Faculty',
      description:
        'Faculty member with academic expertise in Hindi, Education, Political Science and related subjects.',
    },
    {
      name: 'Mrs. Neha Pant',
      role: 'Faculty',
      description:
        'Faculty member with academic expertise in Commerce, Management, Education, English and Psychology.',
    },
    {
      name: 'Mr. Anant Kumar Sir',
      role: 'Faculty',
      description:
        'Faculty member with academic expertise in Geography and experience in academic and competitive classes.',
    },
    {
      name: 'Mr. Yashvardhana Sir',
      role: 'Faculty',
      description:
        'Faculty member with academic background in Education, History and related academic fields.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-red-50">

      {/* =========================================================
          HERO SECTION
      ========================================================= */}
      <section className="relative overflow-hidden">

        <div className="absolute inset-0 bg-gradient-to-r from-blue-100/30 to-red-100/30" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-14 lg:px-8 lg:py-28">

          {/* LEFT */}
          <div className="flex flex-col justify-center">

            <div className="mb-6 inline-flex w-fit items-center rounded-full border border-blue-200 bg-blue-100 px-5 py-2 text-sm font-semibold text-blue-800 shadow-sm">
              About Starlight Academy
            </div>

            <h1 className="mb-5 text-3xl font-black leading-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Campus of Competitive Studies
              <span className="block bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent">
                &amp; School of English
              </span>
            </h1>

            <p className="mb-6 max-w-2xl text-base leading-relaxed text-gray-600 sm:text-lg">
              Starlight Academy is a learning institution focused on
              competitive examination preparation, academic education and
              English learning. We aim to provide students with quality
              teaching, experienced faculty, structured preparation and a
              focused environment for learning.
            </p>

            <p className="mb-8 max-w-2xl text-base leading-relaxed text-gray-600 sm:text-lg">
              Our approach combines strong academic fundamentals, regular
              practice and proper guidance to help students prepare for
              examinations and work towards their educational and career
              goals.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">

              <Link href="/admission" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="h-12 w-full gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-8 text-white shadow-lg shadow-red-200 transition-all duration-200 hover:from-red-700 hover:to-red-800 sm:w-auto"
                >
                  Apply Now
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>

              <Link href="/contact" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 w-full rounded-xl border-gray-200 px-8 text-gray-900 hover:bg-gray-50 sm:w-auto"
                >
                  Contact Us
                </Button>
              </Link>

            </div>
          </div>

          {/* RIGHT */}
          <div className="relative">

            <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-red-200 blur-3xl" />

            <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-blue-200 blur-3xl" />

            <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-white p-4 shadow-2xl sm:p-6">

              <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-red-600 p-6 text-white sm:p-10">

                <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
                  <GraduationCap className="h-10 w-10" />
                </div>

                <h2 className="mb-4 text-2xl font-bold sm:text-3xl">
                  Learn. Prepare. Succeed.
                </h2>

                <p className="mb-8 text-blue-100">
                  Quality education, focused preparation and experienced
                  faculty to support your learning journey.
                </p>

                <div className="grid gap-4 sm:grid-cols-2">

                  <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                    <BookOpen className="mb-2 h-6 w-6" />
                    <h3 className="font-semibold">
                      Quality Education
                    </h3>
                  </div>

                  <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                    <Award className="mb-2 h-6 w-6" />
                    <h3 className="font-semibold">
                      Experienced Faculty
                    </h3>
                  </div>

                  <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                    <Target className="mb-2 h-6 w-6" />
                    <h3 className="font-semibold">
                      Exam Preparation
                    </h3>
                  </div>

                  <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                    <Users className="mb-2 h-6 w-6" />
                    <h3 className="font-semibold">
                      Student Guidance
                    </h3>
                  </div>

                </div>
              </div>
            </div>
          </div>

        </div>
      </section>


      {/* =========================================================
          ABOUT STarlight
      ========================================================= */}
      <section className="py-14 sm:py-20">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="mx-auto max-w-4xl text-center">

            <h2 className="mb-6 text-3xl font-bold text-gray-900 sm:text-4xl">
              About Starlight Academy
            </h2>

            <p className="text-base leading-relaxed text-gray-600 sm:text-lg">
              Starlight Academy, Campus of Competitive Studies &amp; School of
              English, is committed to providing quality education and focused
              preparation for students. The academy works across competitive
              examinations and academic education, with an emphasis on
              conceptual understanding, practice and guidance.
            </p>

            <p className="mt-5 text-base leading-relaxed text-gray-600 sm:text-lg">
              Our academic areas include Science, Commerce and Humanities,
              while our competitive studies cover a wide range of government,
              entrance and teaching examinations. We also focus on English
              learning and overall academic development.
            </p>

          </div>

        </div>
      </section>


      {/* =========================================================
          COMPETITIVE EXAMS
      ========================================================= */}
      <section className="bg-white py-14 sm:py-20">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="mb-12 text-center">

            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-red-600">
              <Target className="h-8 w-8 text-white" />
            </div>

            <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
              Competitive Exam Preparation
            </h2>

            <p className="mx-auto max-w-3xl text-base leading-relaxed text-gray-600 sm:text-lg">
              Starlight Academy provides focused preparation and guidance for
              government, entrance and teaching examinations.
            </p>

          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">

            {examCategories.map((exam) => (
              <div
                key={exam}
                className="flex min-h-[70px] items-center justify-center rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-3 text-center text-sm font-bold text-blue-900 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-md"
              >
                {exam}
              </div>
            ))}

          </div>

        </div>
      </section>


      {/* =========================================================
          ACADEMIC EDUCATION
      ========================================================= */}
      <section className="py-14 sm:py-20">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="mb-12 text-center">

            <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
              Academic Education
            </h2>

            <p className="mx-auto max-w-3xl text-base leading-relaxed text-gray-600 sm:text-lg">
              Along with competitive studies, Starlight Academy provides
              academic guidance across major school education streams.
            </p>

          </div>

          <div className="grid gap-8 md:grid-cols-3">

            {/* SCIENCE */}
            <Card className="rounded-3xl border-blue-100 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">

              <CardHeader>

                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">
                  <BookOpen className="h-7 w-7 text-blue-700" />
                </div>

                <CardTitle className="text-2xl">
                  Science
                </CardTitle>

              </CardHeader>

              <CardContent>

                <p className="leading-relaxed text-gray-600">
                  Academic support focused on conceptual understanding,
                  regular practice and examination preparation in Science
                  subjects.
                </p>

              </CardContent>

            </Card>


            {/* COMMERCE */}
            <Card className="rounded-3xl border-red-100 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">

              <CardHeader>

                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100">
                  <GraduationCap className="h-7 w-7 text-red-700" />
                </div>

                <CardTitle className="text-2xl">
                  Commerce
                </CardTitle>

              </CardHeader>

              <CardContent>

                <p className="leading-relaxed text-gray-600">
                  Structured academic guidance to help Commerce students
                  strengthen their fundamentals and prepare effectively for
                  examinations.
                </p>

              </CardContent>

            </Card>


            {/* HUMANITIES */}
            <Card className="rounded-3xl border-blue-100 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">

              <CardHeader>

                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">
                  <Users className="h-7 w-7 text-blue-700" />
                </div>

                <CardTitle className="text-2xl">
                  Humanities
                </CardTitle>

              </CardHeader>

              <CardContent>

                <p className="leading-relaxed text-gray-600">
                  Supportive academic learning and guidance for students
                  studying Humanities and related subjects.
                </p>

              </CardContent>

            </Card>

          </div>

        </div>
      </section>


      {/* =========================================================
          MISSION & VISION
      ========================================================= */}
      <section className="bg-white py-14 sm:py-20">

        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">

          {/* MISSION */}
          <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 sm:p-8">

            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600">
              <Target className="h-8 w-8 text-white" />
            </div>

            <h2 className="mb-4 text-2xl font-bold text-gray-900 sm:text-3xl">
              Our Mission
            </h2>

            <p className="text-base leading-relaxed text-gray-600 sm:text-lg">
              Our mission is to provide quality education and focused
              preparation that helps students develop strong concepts,
              confidence and the discipline required for academic and
              competitive examinations.
            </p>

          </div>


          {/* VISION */}
          <div className="rounded-3xl border border-red-100 bg-gradient-to-br from-red-50 to-white p-6 sm:p-8">

            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-orange-600">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>

            <h2 className="mb-4 text-2xl font-bold text-gray-900 sm:text-3xl">
              Our Vision
            </h2>

            <p className="text-base leading-relaxed text-gray-600 sm:text-lg">
              Our vision is to create a trusted learning environment where
              students receive quality teaching, academic guidance and the
              encouragement needed to work towards their educational and
              career goals.
            </p>

          </div>

        </div>
      </section>


      {/* =========================================================
          FOUNDER & DIRECTOR
      ========================================================= */}
      <section className="py-14 sm:py-20">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 p-6 text-white shadow-2xl sm:p-10 lg:p-12">

            <div className="grid items-center gap-12 lg:grid-cols-[320px_1fr] lg:gap-16">

              {/* FOUNDER IMAGE */}
              <div className="flex justify-center">

                <div className="relative">

                  <div className="absolute -inset-4 rounded-full bg-white/20 blur-2xl" />

                  <div className="relative h-64 w-64 overflow-hidden rounded-3xl border-4 border-white/30 bg-white/10 shadow-2xl sm:h-72 sm:w-72">

                    <Image
                      src={jkpihalsir}
                      alt="Dr. J.K. Pihal Sir - Founder and Director of Starlight Academy"
                      width={500}
                      height={500}
                      priority
                      className="h-full w-full object-cover"
                    />

                  </div>

                  {/* NAME BADGE */}
                  <div className="absolute -bottom-6 left-1/2 w-max -translate-x-1/2 rounded-full bg-white px-6 py-3 text-center shadow-xl">

                    <p className="text-lg font-bold text-gray-900">
                      Dr. J.K. Pihal Sir
                    </p>

                    <p className="text-sm font-medium text-gray-600">
                      Founder &amp; Director
                    </p>

                  </div>

                </div>

              </div>


              {/* FOUNDER MESSAGE */}
              <div className="pt-6 lg:pt-0">

                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
                  <Award className="h-8 w-8" />
                </div>

                <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-blue-100">
                  Leadership at Starlight Academy
                </p>

                <h2 className="mb-6 text-3xl font-black sm:text-4xl">
                  Founder &amp; Director
                </h2>

                <div className="space-y-5 text-base leading-relaxed text-blue-100 sm:text-lg">

                  <p>
                    <strong className="text-white">
                      Dr. J.K. Pihal Sir
                    </strong>{' '}
                    is the Founder and Director of Starlight Academy, Campus
                    of Competitive Studies &amp; School of English.
                  </p>

                  <p>
                    With extensive experience in education and teaching,
                    Dr. J.K. Pihal Sir brings academic knowledge and
                    dedicated guidance to the learning environment at
                    Starlight Academy.
                  </p>

                  <p>
                    His academic expertise includes areas such as English,
                    Hindi, Mathematics, Science and Education, supporting the
                    academy's focus on academic and competitive preparation.
                  </p>

                  <p>
                    His vision is to provide students with quality education,
                    proper guidance and a focused learning environment where
                    they can develop knowledge, confidence and discipline.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>
      </section>


      {/* =========================================================
          FACULTY
      ========================================================= */}
      <section className="bg-white py-14 sm:py-20">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="mb-12 text-center">

            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-red-600">
              <Users className="h-8 w-8 text-white" />
            </div>

            <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
              Experienced &amp; Qualified Faculty
            </h2>

            <p className="mx-auto max-w-3xl text-base leading-relaxed text-gray-600 sm:text-lg">
              Our faculty brings academic knowledge, teaching experience and
              subject expertise to support students in academic and
              competitive examination preparation.
            </p>

          </div>


          <div className="grid gap-5 md:grid-cols-2">

            {faculty.map((member) => (
              <div
                key={member.name}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              >

                <div className="flex items-start gap-4">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                    <GraduationCap className="h-6 w-6 text-blue-700" />
                  </div>

                  <div>

                    <h3 className="text-lg font-bold text-gray-900">
                      {member.name}
                    </h3>

                    <p className="mb-2 text-sm font-semibold text-red-600">
                      {member.role}
                    </p>

                    <p className="text-sm leading-relaxed text-gray-600">
                      {member.description}
                    </p>

                  </div>

                </div>

              </div>
            ))}

          </div>

        </div>
      </section>


      {/* =========================================================
          WHY CHOOSE US + CAMPUS
      ========================================================= */}
      <section className="py-14 sm:py-20">

        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">

          {/* WHY CHOOSE US */}
          <div>

            <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
              Why Choose Starlight Academy?
            </h2>

            <p className="mb-8 text-base leading-relaxed text-gray-600 sm:text-lg">
              We focus on quality teaching, structured preparation and
              continuous academic guidance to help students stay focused on
              their goals.
            </p>

            <div className="grid gap-4">

              {whyChooseUs.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md"
                >

                  <CheckCircle className="h-5 w-5 shrink-0 text-blue-600" />

                  <span className="font-medium text-gray-700">
                    {feature}
                  </span>

                </div>
              ))}

            </div>

          </div>


          {/* CAMPUS */}
          <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-xl sm:p-8">

            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100">
              <Building2 className="h-8 w-8 text-blue-700" />
            </div>

            <h2 className="mb-4 text-2xl font-bold text-gray-900 sm:text-3xl">
              Visit Starlight Academy
            </h2>

            <p className="mb-8 leading-relaxed text-gray-600">
              Connect with Starlight Academy to learn more about competitive
              exam preparation, academic courses and admission opportunities.
            </p>

            <div className="space-y-6">

              {/* LOCATION */}
              <div className="flex items-start gap-4">

                <div className="rounded-xl bg-blue-100 p-3">
                  <MapPin className="h-6 w-6 text-blue-700" />
                </div>

                <div>

                  <h3 className="mb-1 font-bold text-gray-900">
                    Location
                  </h3>

                  <p className="text-gray-600">
                    Rohini, Delhi
                  </p>

                </div>

              </div>


              {/* PHONE */}
              <div className="flex items-start gap-4">

                <div className="rounded-xl bg-red-100 p-3">
                  <Phone className="h-6 w-6 text-red-700" />
                </div>

                <div>

                  <h3 className="mb-1 font-bold text-gray-900">
                    Contact
                  </h3>

                  <p className="text-gray-600">
                    Contact Starlight Academy for course and admission
                    information.
                  </p>

                </div>

              </div>


              {/* SUPPORT */}
              <div className="flex items-start gap-4">

                <div className="rounded-xl bg-blue-100 p-3">
                  <Clock className="h-6 w-6 text-blue-700" />
                </div>

                <div>

                  <h3 className="mb-1 font-bold text-gray-900">
                    Student Support
                  </h3>

                  <p className="text-gray-600">
                    Guidance and support for academic and competitive
                    examination preparation.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>
      </section>


      {/* =========================================================
          OUR APPROACH
      ========================================================= */}
      <section className="bg-white py-14 sm:py-20">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="mb-12 text-center">

            <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
              Our Approach to Education
            </h2>

            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              We combine quality teaching, focused preparation and student
              guidance to create a productive learning experience.
            </p>

          </div>


          <div className="grid gap-8 md:grid-cols-3">

            {values.map((value) => {
              const Icon = value.icon;

              return (
                <Card
                  key={value.title}
                  className="rounded-3xl border-gray-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
                >

                  <CardHeader>

                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-red-600">
                      <Icon className="h-8 w-8 text-white" />
                    </div>

                    <CardTitle className="text-2xl">
                      {value.title}
                    </CardTitle>

                  </CardHeader>

                  <CardContent>

                    <p className="leading-relaxed text-gray-600">
                      {value.description}
                    </p>

                  </CardContent>

                </Card>
              );
            })}

          </div>

        </div>
      </section>


      {/* =========================================================
          FINAL CTA
      ========================================================= */}
      <section className="pb-20">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 p-8 text-center text-white shadow-2xl sm:p-12 lg:p-16">

            <h2 className="mb-5 text-3xl font-black sm:text-4xl">
              Start Your Preparation With Starlight Academy
            </h2>

            <p className="mx-auto mb-10 max-w-3xl text-base leading-relaxed text-blue-100 sm:text-lg">
              Prepare for competitive examinations and strengthen your
              academic foundation with experienced faculty, structured
              learning and focused guidance.
            </p>

            <Link href="/admission">

              <Button
                size="lg"
                className="h-14 w-full rounded-2xl bg-white px-8 text-base font-bold text-gray-900 shadow-lg hover:bg-gray-100 sm:w-auto sm:px-10 sm:text-lg"
              >
                Start Your Preparation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

            </Link>

          </div>

        </div>

      </section>

    </div>
  );
}
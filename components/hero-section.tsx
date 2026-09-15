'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CircleCheck as CheckCircle, GraduationCap, Trophy, Users, Star } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const images = [
  '/students.jpeg',
  '/students2.jpeg',
];

export function HeroSection() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden py-12 sm:py-16 lg:py-24">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-blue-50/20 to-red-50/20" />

      <div className="absolute left-0 top-20 h-40 w-40 rounded-full bg-blue-200/20 blur-3xl sm:h-80 sm:w-80" />
      <div className="absolute right-0 bottom-0 h-40 w-40 rounded-full bg-red-200/20 blur-3xl sm:h-80 sm:w-80" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 sm:gap-12 lg:gap-16 lg:grid-cols-[1fr_1fr]">

          {/* LEFT CONTENT */}
          <div className="order-2 lg:order-1">

            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1 shadow-sm sm:px-4 sm:py-2">
              <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 fill-yellow-500" />
              <span className="text-xs sm:text-sm font-semibold text-blue-700">
                Delhi's Trusted Education Academy  Since 2026
              </span>
            </div>

            <h1 className="mt-4 sm:mt-6 text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight sm:leading-[1.1] lg:leading-[0.95] tracking-tight text-slate-900">
              Learn, Study &amp;
              <span className="block bg-gradient-to-r from-blue-600 via-blue-500 to-red-600 bg-clip-text text-transparent">
                Success
              </span>
              At Starlight Academy 
            </h1>

            <p className="mt-4 sm:mt-8 max-w-2xl text-base sm:text-lg leading-relaxed sm:leading-8 text-slate-600">
              Starlight Academy provides quality education, expert coaching, personalized mentorship, and a modern study environment for students. Whether you are preparing for school exams, competitive exams, or looking for a peaceful environment to focus on your goals, we help you succeed with the right guidance and resources.
            </p>

            {/* CTA Buttons */}
            <div className="mt-6 sm:mt-10 flex flex-col gap-3 sm:gap-4 sm:flex-row">

              <Link href="/admission" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto h-12 sm:h-14 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-red-600 px-6 sm:px-8 text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                >
                  Apply Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              <Link href="/courses" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto h-12 sm:h-14 rounded-2xl border-2 border-blue-100 px-6 sm:px-8 hover:bg-blue-50"
                >
                  Explore Courses
                </Button>
              </Link>

            </div>

            {/* Stats */}
            <div className="mt-8 sm:mt-14 grid grid-cols-3 gap-4 sm:gap-8 max-w-xl">

              <div className="text-center">
                <h3 className="text-2xl sm:text-4xl font-black text-blue-600">
                  500+
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-slate-500">
                  Students
                </p>
              </div>

              <div className="text-center">
                <h3 className="text-2xl sm:text-4xl font-black text-blue-600">
                  50+
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-slate-500">
                  Courses
                </p>
              </div>

              <div className="text-center">
                <h3 className="text-2xl sm:text-4xl font-black text-blue-600">
                  95%
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-slate-500">
                  Success Rate
                </p>
              </div>

            </div>
          </div>

          {/* RIGHT SIDE IMAGE */}
          <div className="relative order-1 lg:order-2">

            {/* Glow */}
            <div className="absolute -inset-2 sm:-inset-4 rounded-full bg-gradient-to-r from-blue-300/20 to-red-300/20 blur-3xl" />

            {/* Main Image */}
            <div className="relative overflow-hidden rounded-2xl sm:rounded-[32px] border border-slate-100 bg-white shadow-xl sm:shadow-2xl">

              <div className="relative h-72 sm:h-96 md:h-[500px] lg:h-[650px]">

                <Image
                  key={current}
                  src={images[current]}
                  alt="Students studying at Starlight Academy in Delhi"
                  fill
                  priority
                  sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 50vw"
                  className="object-cover transition-all duration-1000"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

                {/* Content Overlay */}
                <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 right-4 sm:right-8 text-white">

                  <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 sm:px-4 sm:py-2 backdrop-blur-lg text-xs sm:text-sm">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
                    Admissions Open
                  </div>

                  <h3 className="mt-2 sm:mt-4 text-xl sm:text-3xl lg:text-4xl font-bold">
                    Your Learning Journey Starts Here
                  </h3>

                  <p className="mt-2 sm:mt-3 text-xs sm:text-base text-white/90">
                    Expert Coaching • Academic Excellence
                  </p>
                </div>
              </div>
            </div>

            {/* Floating Card 1 */}
            <Card className="absolute left-4 top-4 hidden lg:block border border-white/30 bg-white/80 backdrop-blur-xl shadow-2xl">
              <CardContent className="flex items-center gap-3 p-4">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-xl font-bold text-slate-900">
                    500+
                  </p>
                  <p className="text-xs text-slate-500">
                    Active Students
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Floating Card 2 */}
            <Card className="absolute right-4 top-20 hidden lg:block border border-white/30 bg-white/80 backdrop-blur-xl shadow-2xl">
              <CardContent className="flex items-center gap-3 p-4">
                <Trophy className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-xl font-bold text-slate-900">
                    95%
                  </p>
                  <p className="text-xs text-slate-500">
                    Success Rate
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Floating Card 3 */}
            <Card className="absolute bottom-8 left-4 hidden lg:block border border-white/30 bg-white/80 backdrop-blur-xl shadow-2xl">
              <CardContent className="flex items-center gap-3 p-4">
                <GraduationCap className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-xl font-bold text-slate-900">
                    Modern
                  </p>
                  <p className="text-xs text-slate-500">
                    Study Environment
                  </p>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </section>
  );
}

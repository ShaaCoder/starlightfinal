import { createServerClient } from '@/lib/supabase/server';
import { CourseCard } from '@/components/course-card';
import { Course, Blog, Notice } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';
import { BookOpen, GraduationCap, Users, Trophy, Clock, ArrowRight, Calendar, CircleCheck as CheckCircle, Star, Quote } from 'lucide-react';
import Image from 'next/image';
import { getPublishedBlogs } from '@/lib/blog/queries';
import { courses as fallbackCourses } from '@/lib/data/courses';
import { notices as fallbackNotices } from '@/lib/data/notices';
import { HeroSection } from '@/components/hero-section';
import { CoursesSection } from '@/components/home/courses-section';

// ISR: Revalidate every 60 seconds
export const revalidate = 60;

const testimonials = [
  {
    name: "Rahul Sharma",
    course: "NIOS Class 10",
    content: "Starlight Academy helped me clear my NIOS exams with excellent marks. The teachers are very supportive.",
    rating: 5,
  },
  {
    name: "Priya Singh",
    course: "Foundation Course",
    content: "Amazing  facilities and great teaching. The study environment is perfect for learning.",
    rating: 5,
  },
  {
    name: "Amit Kumar",
    course: "NIOS Class 12",
    content: "Thank you Starlight Academy for guiding me throughout my Class 12 journey. Highly recommended!",
    rating: 5,
  },
];

const features = [
  {
    icon: <GraduationCap className="h-6 w-6" />,
    title: "Expert Faculty",
    description: "Learn from experienced teachers with proven track record",
  },
  {
    icon: <BookOpen className="h-6 w-6" />,
    title: "Modern Study Environment",
    description: "Modern study environment with all study materials and books",
  },
  {
    icon: <Trophy className="h-6 w-6" />,
    title: "Excellent Results",
    description: "95% success rate with top scores in board exams",
  },
  {
    icon: <Clock className="h-6 w-6" />,
    title: "Flexible Timings",
    description: "Classes available at convenient times for students",
  },
];

export default async function Home() {
  const supabase = createServerClient();

  let courses: Course[] = [];
  let notices: Notice[] = [];

  try {
    const [coursesResult, noticesResult] = await Promise.all([
      supabase.from('courses').select('*').order('created_at', { ascending: false }).limit(6),
      supabase.from('notices').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(5),
    ]);

    courses = (coursesResult.data || []) as Course[];
    notices = (noticesResult.data || []) as Notice[];
  } catch (e) {
    // Use fallback data
  }

  // Apply fallbacks
  if (!courses || courses.length === 0) {
    courses = fallbackCourses;
  }
  if (!notices || notices.length === 0) {
    notices = fallbackNotices;
  }

  const blogs = await getPublishedBlogs(3, 0);

  const faqs = [
    {
      id: '1',
      question: 'What are the admission requirements?',
      answer: 'We welcome students of all backgrounds. You need to fill out our admission form with basic information. Our team will review your application and contact you within 24 hours.',
    },
    {
      id: '2',
      question: 'What courses do you offer?',
      answer: 'We offer a variety of courses ranging from basic academics to specialized technical training. Check our Courses section to explore all available programs.',
    },
    {
      id: '3',
      question: 'How can I contact the academy?',
      answer: 'You can contact us through our website contact form, call us directly, send a WhatsApp message, or visit our office location. Use the contact options in the header.',
    },
    {
      id: '4',
      question: 'What is your fee structure?',
      answer: 'Our fees vary by course and level. Please contact our admissions team directly for detailed fee information. We offer flexible payment options.',
    },
    {
      id: '5',
      question: 'Do you provide online classes?',
      answer: 'Yes, we offer both in-person and online classes. Please discuss your preferences with our admissions team during registration.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <HeroSection />

        {/* Notices Section */}
        {notices.length > 0 && (
          <section className="py-16 sm:py-20">
            <div className="mb-10 text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 border border-red-100">
                <Clock className="h-4 w-4" />
                <span>Latest Updates</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Important <span className="text-red-600">Notices</span>
              </h2>
            </div>
            <div className="space-y-4">
              {notices.map((notice) => (
                <Card
                  key={notice.id}
                  className={`border-2 transition-all card-hover hover:shadow-lg ${
                    notice.priority === 'high'
                      ? 'border-red-100 bg-gradient-to-r from-red-50 to-white'
                      : notice.priority === 'medium'
                      ? 'border-blue-100 bg-gradient-to-r from-blue-50 to-white'
                      : 'border-gray-100 bg-gradient-to-r from-gray-50 to-white'
                  }`}
                >
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex items-start gap-4">
                      <div
                        className={`shrink-0 flex h-12 w-12 items-center justify-center rounded-xl shadow-sm ${
                          notice.priority === 'high'
                            ? 'bg-red-100 text-red-600'
                            : notice.priority === 'medium'
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="min-w-0 font-semibold text-gray-900 text-base sm:text-lg">
                            {notice.title}
                          </h3>
                          <span
                            className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                              notice.priority === 'high'
                                ? 'bg-red-100 text-red-700'
                                : notice.priority === 'medium'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {notice.priority}
                          </span>
                        </div>
                        <p className="line-clamp-3 text-sm sm:text-base text-gray-600">
                          {notice.content}
                        </p>
                        <p className="mt-3 text-xs sm:text-sm text-gray-400">
                          {new Date(notice.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

     <CoursesSection courses={courses} />

        {/* Features Section */}
        <section className="py-16 sm:py-20">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Why Choose <span className="text-blue-600">Us?</span>
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-gray-100 bg-gradient-to-br from-white to-gray-50 hover:shadow-lg transition-all card-hover"
              >
                <CardHeader className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-red-600 text-white">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-base sm:text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 sm:py-20">
          <div className="mb-10 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 border border-blue-100">
              <Quote className="h-4 w-4" />
              <span>Student Testimonials</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              What Our <span className="text-blue-600">Students Say</span>
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-gray-100 bg-white shadow-card card-hover">
                <CardHeader className="p-6">
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <CardDescription className="text-sm text-gray-600 leading-relaxed">
                    "{testimonial.content}"
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-red-100 flex items-center justify-center">
                      <span className="text-blue-700 font-bold text-sm">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-xs text-gray-500">{testimonial.course}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Blogs Section */}
        {blogs.length > 0 && (
          <section className="py-16 sm:py-20">
            <div className="mb-10 text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 border border-blue-100">
                <BookOpen className="h-4 w-4" />
                <span>Insights & Stories</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Latest <span className="text-blue-600">Blogs</span>
              </h2>
              <p className="mt-3 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
                Tips, stories, and insights from our community
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {blogs.map((blog) => (
                <Link key={blog.id} href={`/blogs/${blog.slug}`} className="group block">
                  <Card className="flex flex-col overflow-hidden border-gray-100 shadow-card transition-all card-hover h-full">
                    <div className="relative h-48 sm:h-56 w-full overflow-hidden">
                      {blog.featured_image ? (
                        <Image
                          src={blog.featured_image}
                          alt={blog.image_alt || blog.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-50 to-red-50">
                          <BookOpen className="h-16 w-16 text-blue-300" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-blue-700 backdrop-blur-sm">
                          <Calendar className="h-3 w-3" />
                          {new Date(blog.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                    <CardHeader className="flex-1 p-5 sm:p-6">
                      <CardTitle className="line-clamp-2 text-base sm:text-lg group-hover:text-blue-600 transition-colors">
                        {blog.title}
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">By {blog.author}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 p-5 sm:p-6 pt-0">
                      <p className="line-clamp-3 text-xs sm:text-sm text-gray-600">
                        {blog.excerpt || blog.content?.replace(/<[^>]*>/g, '').slice(0, 150)}
                      </p>
                    </CardContent>
                    <div className="border-t border-gray-100 p-5 sm:p-6">
                      <span className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 group-hover:gap-2 transition-all">
                        Read More
                        <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* FAQ Section */}
        <section className="py-16 sm:py-20">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Frequently Asked <span className="text-blue-600">Questions</span>
            </h2>
            <p className="mt-3 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Find answers to common questions about our academy
            </p>
          </div>
          <div className="mx-auto max-w-3xl">
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.map((faq) => (
                <AccordionItem
                  key={faq.id}
                  value={faq.id}
                  className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all"
                >
                  <AccordionTrigger className="px-6 py-4 text-left text-sm font-semibold text-gray-900 hover:no-underline hover:text-blue-600 sm:text-base">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6 pt-0 text-sm leading-relaxed text-gray-600">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-20">
          <div className="rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-red-600 p-8 sm:p-12 lg:p-16 text-center text-white shadow-2xl">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
              Ready to Transform Your Future?
            </h2>
            <p className="mx-auto max-w-2xl text-sm sm:text-base lg:text-lg opacity-90 mb-8 sm:mb-10">
              Join thousands of successful students who have achieved their dreams with Starlight Academy.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
              <Link href="/admission" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-white text-gray-900 hover:bg-gray-100 font-semibold gap-2 shadow-lg text-sm sm:text-base"
                >
                  Apply Now
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-white text-white hover:bg-white/10 font-semibold gap-2 text-sm sm:text-base"
                >
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

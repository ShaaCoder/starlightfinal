import { Course } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Card className="overflow-hidden border-blue-100 transition-all hover:shadow-lg hover:shadow-blue-100/50">
      <div className="relative h-48 w-full bg-gradient-to-br from-yellow-50 to-blue-50">
        {course.image_url || course.image ? (
          <Image
            src={course.image_url || course.image!}
            alt={course.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-6xl font-bold text-blue-200">{course.title.charAt(0)}</span>
          </div>
        )}
      </div>
      <CardHeader>
        <CardTitle className="text-xl">{course.title}</CardTitle>
        <CardDescription className="line-clamp-3">{course.description}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Link href={`/contact?course=${encodeURIComponent(course.title)}`} className="w-full">
          <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">
            Enquire Now
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

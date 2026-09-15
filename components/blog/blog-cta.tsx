import Link from 'next/link';
import { GraduationCap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function BlogCTA() {
  return (
    <section className="mt-16 rounded-2xl bg-gradient-to-r from-blue-50 via-white to-red-50 border border-blue-100 p-8 sm:p-10">
      <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-100 to-red-100">
          <GraduationCap className="h-7 w-7 text-blue-600" />
        </div>
        <div className="text-center sm:text-left flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Ready to Start Your Learning Journey?
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Explore our courses and take the first step towards academic excellence with
            Starlight Academy. Admissions are open for the new session.
          </p>
        </div>
        <div className="flex flex-col sm:items-end gap-2 shrink-0">
          <Link href="/admission">
            <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white gap-2 h-11 px-6 shadow-lg shadow-red-200">
              Apply for Admission <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline" className="border-gray-200 text-gray-600 gap-2 h-9 px-4 text-xs hover:bg-gray-50">
              Talk to Counselor
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

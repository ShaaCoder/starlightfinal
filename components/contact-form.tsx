'use client';

import { useState } from 'react';
import { User, Phone, Mail, BookOpen, MessageSquare, Send, Loader2, CheckCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

import { createClient } from '@/lib/supabase/client';
import { LeadFormData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface ContactFormProps {
  initialCourse?: string;
}

export function ContactForm({ initialCourse = '' }: ContactFormProps) {
  const [formData, setFormData] = useState<LeadFormData>({
    name: '',
    phone: '',
    email: '',
    course: initialCourse,
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await (supabase.from('leads') as any).insert([
        {
          name: formData.name,
          phone: formData.phone,
          email: formData.email || null,
          course: formData.course,
          message: formData.message || null,
        },
      ]);

      if (error) throw error;

      toast({
        title: 'Success!',
        description: 'Thank you for your enquiry. Our team will contact you soon.',
      });

      setFormData({
        name: '',
        phone: '',
        email: '',
        course: initialCourse,
        message: '',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit form. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="overflow-hidden border-0 bg-white shadow-2xl">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-red-600 p-8 text-white">
        <h2 className="text-3xl font-bold">Admission Enquiry</h2>
        <p className="mt-2 text-blue-100">
          Fill out the form and our counselors will contact you shortly.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <span className="rounded-full bg-white/10 px-3 py-1 text-sm border border-white/20">
            Career Guidance
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-sm border border-white/20">
            Admission Support
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-sm border border-white/20">
            Expert Counseling
          </span>
        </div>
      </div>

      <CardContent className="p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-700">
              Full Name *
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              <Input
                id="name"
                required
                value={formData.name}
                placeholder="Enter your full name"
                className="h-12 rounded-xl border-gray-200 pl-10 focus:border-blue-500 focus:ring-blue-500"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value,
                  })
                }
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-gray-700">
              Phone Number *
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              <Input
                id="phone"
                type="tel"
                required
                value={formData.phone}
                placeholder="Enter your phone number"
                className="h-12 rounded-xl border-gray-200 pl-10 focus:border-blue-500 focus:ring-blue-500"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    phone: e.target.value,
                  })
                }
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                placeholder="your@email.com"
                className="h-12 rounded-xl border-gray-200 pl-10 focus:border-blue-500 focus:ring-blue-500"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    email: e.target.value,
                  })
                }
              />
            </div>
          </div>

          {/* Course */}
          <div className="space-y-2">
            <Label htmlFor="course" className="text-gray-700">
              Course Interested In *
            </Label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              <Input
                id="course"
                required
                value={formData.course}
                placeholder="B.Tech, MBA, B.Ed, MLT..."
                className="h-12 rounded-xl border-gray-200 pl-10 focus:border-blue-500 focus:ring-blue-500"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    course: e.target.value,
                  })
                }
              />
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-gray-700">
              Message
            </Label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Textarea
                id="message"
                rows={5}
                value={formData.message}
                placeholder="Tell us about your admission requirements..."
                className="rounded-xl border-gray-200 pl-10 focus:border-blue-500 focus:ring-blue-500"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    message: e.target.value,
                  })
                }
              />
            </div>
          </div>

          {/* Trust */}
          <div className="rounded-2xl bg-blue-50 p-4 border border-blue-100">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <CheckCircle className="h-4 w-4" />
              100% Secure. Your information will only be used for admission assistance.
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-12 w-full rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-200 hover:from-red-700 hover:to-red-800 transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                Submit Enquiry
                <Send className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

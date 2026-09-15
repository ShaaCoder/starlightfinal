'use client';

import { MessageCircle, Phone, MapPin, Clock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export function ContactPopover() {
  const phoneNumber = '+919876543210';
  const whatsappMessage = 'Hi, I am interested in learning more about your courses.';
  const email = 'info@vihaanacademy.com';
  const location = 'Vihaan Education Academy, New Delhi';

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl sm:h-12 sm:w-12"
        >
          <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[calc(100vw-1.5rem)] max-w-80 overflow-hidden rounded-xl border-0 p-0 shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700 text-white p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Get in Touch</h3>
              <p className="text-xs opacity-90">We&apos;d love to hear from you</p>
            </div>
          </div>
        </div>

        {/* Contact Options */}
        <div className="p-4 space-y-2">
          {/* Call */}
          <a
            href={`tel:${phoneNumber}`}
            className="flex items-center gap-4 p-4 rounded-lg border border-transparent hover:border-blue-200 hover:bg-blue-50/50 transition-all duration-300 group active:scale-95"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-50 group-hover:from-blue-200 group-hover:to-blue-100 transition-all">
              <Phone className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">Call Us</p>
              <p className="text-xs text-gray-600">{phoneNumber}</p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 opacity-0 group-hover:opacity-100 transition-opacity">
              <Phone className="h-4 w-4 text-blue-600" />
            </div>
          </a>

          {/* WhatsApp */}
          <a
            href={`https://wa.me/${phoneNumber.replace('+', '')}?text=${encodeURIComponent(whatsappMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 rounded-lg border border-transparent hover:border-green-200 hover:bg-green-50/50 transition-all duration-300 group active:scale-95"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-green-50 group-hover:from-green-200 group-hover:to-green-100 transition-all">
              <MessageCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">WhatsApp</p>
              <p className="text-xs text-gray-600">Quick chat with us</p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 opacity-0 group-hover:opacity-100 transition-opacity">
              <MessageCircle className="h-4 w-4 text-green-600" />
            </div>
          </a>

          {/* Email */}
          <a
            href={`mailto:${email}`}
            className="flex items-center gap-4 p-4 rounded-lg border border-transparent hover:border-purple-200 hover:bg-purple-50/50 transition-all duration-300 group active:scale-95"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-purple-50 group-hover:from-purple-200 group-hover:to-purple-100 transition-all">
              <Mail className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">Email</p>
              <p className="text-xs text-gray-600">{email}</p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 opacity-0 group-hover:opacity-100 transition-opacity">
              <Mail className="h-4 w-4 text-purple-600" />
            </div>
          </a>

          {/* Location */}
          <a
            href="https://maps.google.com/maps?q=Vihaan+Education+Academy"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 rounded-lg border border-transparent hover:border-red-200 hover:bg-red-50/50 transition-all duration-300 group active:scale-95"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-red-50 group-hover:from-red-200 group-hover:to-red-100 transition-all">
              <MapPin className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">Location</p>
              <p className="text-xs text-gray-600 line-clamp-1">{location}</p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 opacity-0 group-hover:opacity-100 transition-opacity">
              <MapPin className="h-4 w-4 text-red-600" />
            </div>
          </a>
        </div>

        {/* Footer */}
        <div className="bg-gray-50/50 border-t border-gray-100 px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Clock className="h-3.5 w-3.5 text-gray-400" />
            <span>Available Mon-Sat, 9AM-6PM</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

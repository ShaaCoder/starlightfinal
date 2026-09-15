
// components/Footer.tsx

import Image from "next/image";
import Link from "next/link";
import {
  Facebook,
  Instagram,
  Linkedin,
  MapPin,
  Phone,
  MessageCircle,
  Clock,
  Mail,
} from "lucide-react";

// Justdial icon as SVG component
function JustdialIcon(props: any) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <>
      {/* CTA Section */}
      <section className="relative z-10 mx-auto -mb-12 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 via-red-500 to-blue-600 p-8 shadow-2xl">
          <div className="flex flex-col items-center justify-between gap-6 text-center lg:flex-row lg:text-left">
            <div>
              <h2 className="text-3xl font-bold text-white">
                Ready to Start Your Educational Journey?
              </h2>

              <p className="mt-2 text-white/90">
                Get expert guidance for NIOS admissions, academic support, and
                career success.
              </p>
            </div>

            <Link
              href="/admission"
              className="rounded-xl bg-white px-6 py-3 font-semibold text-red-600 transition-all duration-300 hover:scale-105"
            >
              Apply Now
            </Link>
          </div>
        </div>
      </section>

      <footer className="relative mt-16 overflow-hidden bg-slate-950 text-white">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-red-600/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-24 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Left Content */}
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
              {/* Brand */}
              <div>
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-2xl bg-white p-2 shadow-lg">
                    <Image
                      src="/starlight logo.jpeg"
                      alt="Starlight Academy"
                      width={50}
                      height={50}
                      className="h-12 w-12 object-contain"
                    />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Starlight
                    </h3>

                    <p className="text-sm text-slate-400">Academy</p>
                  </div>
                </div>

                <p className="max-w-sm text-sm leading-7 text-slate-300">
                  Empowering students through quality education, expert
                  mentorship, NIOS admissions, coaching programs, computer
                  courses, and academic excellence.
                </p>

                {/* Social Icons */}
                <div className="mt-6 flex gap-3">
                  <a
                    href="#"
                    aria-label="Facebook"
                    className="rounded-xl border border-slate-800 bg-slate-900 p-3 transition-all duration-300 hover:border-red-500 hover:bg-red-600"
                  >
                    <Facebook size={18} />
                  </a>

                  <a
                    href="#"
                    aria-label="Instagram"
                    className="rounded-xl border border-slate-800 bg-slate-900 p-3 transition-all duration-300 hover:border-pink-500 hover:bg-pink-600"
                  >
                    <Instagram size={18} />
                  </a>

                  {/* LinkedIn */}
                  {/* 
                  <a
                    href="#"
                    aria-label="LinkedIn"
                    className="rounded-xl border border-slate-800 bg-slate-900 p-3 transition-all duration-300 hover:border-blue-500 hover:bg-blue-600"
                  >
                    <Linkedin size={18} />
                  </a>
                  */}

                  {/* Justdial */}
                  {/*
                  <a
                    href="#"
                    aria-label="Justdial"
                    className="rounded-xl border border-slate-800 bg-slate-900 p-3 transition-all duration-300 hover:border-green-500 hover:bg-green-600"
                  >
                    <JustdialIcon size={18} />
                  </a>
                  */}
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="mb-2 text-lg font-semibold text-white">
                  Quick Links
                </h4>

                <div className="mb-6 h-1 w-12 rounded-full bg-gradient-to-r from-red-500 to-blue-500" />

                <ul className="space-y-4 text-sm">
                  {[
                    { href: "/", label: "Home" },
                    { href: "/about", label: "About Us" },
                    { href: "/blogs", label: "Blogs" },
                    { href: "/admission", label: "Admission" },
                    { href: "/contact", label: "Contact" },
                  ].map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="text-slate-300 transition hover:text-red-400"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="mb-2 text-lg font-semibold text-white">
                  Contact Info
                </h4>

                <div className="mb-6 h-1 w-12 rounded-full bg-gradient-to-r from-red-500 to-blue-500" />

                <ul className="space-y-4">
                  {/* Address */}
                  <li className="flex gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
                    <MapPin className="mt-1 h-5 w-5 shrink-0 text-red-500" />

                    <span className="text-sm leading-6 text-slate-300">
                      Starlight Academy
                      <br />
                      VPO, Opposite McD Dispensary
                      <br />
                      Near Main Bus Stand
                      <br />
                      Karala Village, Karala
                      <br />
                      New Delhi, Delhi - 110081
                    </span>
                  </li>

                  {/* Phone 1 */}
                  <li className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
                    <Phone className="h-5 w-5 shrink-0 text-blue-400" />

                    <a
                      href="tel:+918750123355"
                      className="text-sm text-slate-300 transition hover:text-blue-400"
                    >
                      +91 87501 23355
                    </a>
                  </li>

                  {/* Phone 2 */}
                  <li className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
                    <Phone className="h-5 w-5 shrink-0 text-blue-400" />

                    <a
                      href="tel:+919899777089"
                      className="text-sm text-slate-300 transition hover:text-blue-400"
                    >
                      +91 98997 77089
                    </a>
                  </li>

                  {/* WhatsApp */}
                  <li className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
                    <MessageCircle className="h-5 w-5 shrink-0 text-green-400" />

                    <a
                      href="https://wa.me/918750123355"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-slate-300 transition hover:text-green-400"
                    >
                      WhatsApp Support Available
                    </a>
                  </li>

                  {/* Email */}
                  <li className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
                    <Mail className="h-5 w-5 shrink-0 text-red-400" />

                    <a
                      href="mailto:starlightacademy.info@gmail.com"
                      className="break-all text-sm text-slate-300 transition hover:text-red-400"
                    >
                      starlightacademy.info@gmail.com
                    </a>
                  </li>
                </ul>
              </div>

              {/* Operating Hours */}
              <div>
                <h4 className="mb-2 text-lg font-semibold text-white">
                  Operating Hours
                </h4>

                <div className="mb-6 h-1 w-12 rounded-full bg-gradient-to-r from-red-500 to-blue-500" />

                <ul className="space-y-4">
                  <li className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
                    <Clock className="h-5 w-5 text-blue-400" />

                    <span className="text-sm text-slate-300">
                      Mon - Fri : 9:00 AM - 8:00 PM
                    </span>
                  </li>

                  <li className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
                    <Clock className="h-5 w-5 text-blue-400" />

                    <span className="text-sm text-slate-300">
                      Saturday : 10:00 AM - 6:00 PM
                    </span>
                  </li>

                  <li className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
                    <Clock className="h-5 w-5 text-red-400" />

                    <span className="text-sm text-slate-300">
                      Sunday : Closed
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Map Section */}
            <div>
              <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">
                <div className="border-b border-slate-800 p-6">
                  <h4 className="text-xl font-semibold text-white">
                    Visit Our Campus
                  </h4>

                  <p className="mt-2 text-sm text-slate-400">
                    Karala, New Delhi
                  </p>
                </div>

                <div className="h-[320px] w-full">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d447820.62371742196!2d76.47651672363281!3d28.73153893866631!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d07e72b8f8351%3A0x101e14edd5d95289!2sStarlight%20Academy!5e0!3m2!1sen!2sin!4v1789370700865!5m2!1sen!2sin"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Starlight Academy Location"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="mt-12 border-t border-slate-800 pt-8">
            <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
              <p className="text-sm text-slate-400">
                © 2026 Starlight Academy. All rights reserved.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-5 text-sm sm:justify-end">
                <Link
                  href="/privacy-policy"
                  className="text-slate-400 transition hover:text-red-400"
                >
                  Privacy Policy
                </Link>

                <Link
                  href="/terms"
                  className="text-slate-400 transition hover:text-red-400"
                >
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

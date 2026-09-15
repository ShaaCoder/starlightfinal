'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  Menu,
  X,
  Home,
  Info,
  Phone,
  BookOpen,
  UserPlus,
  LayoutDashboard,
  FileText,
  ChevronRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

const navItems = [
  {
    name: 'Home',
    href: '/',
    icon: Home,
  },
  {
    name: 'About',
    href: '/about',
    icon: Info,
  },
  {
    name: 'Blogs',
    href: '/blogs',
    icon: FileText,
  },
  {
    name: 'Library',
    href: '/library',
    icon: BookOpen,
  },
  {
    name: 'Contact',
    href: '/contact',
    icon: Phone,
  },
  {
    name: 'Admission',
    href: '/admission',
    icon: UserPlus,
  },
  {
    name: 'Admin',
    href: '/admin',
    icon: LayoutDashboard,
  },
];

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="relative z-50 lg:hidden">
      {/* MENU BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-11 h-11 rounded-xl border border-blue-100 bg-white shadow-sm hover:bg-blue-50 transition-all duration-300"
        aria-label="Toggle Menu"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-blue-700" />
        ) : (
          <Menu className="h-6 w-6 text-blue-700" />
        )}
      </button>

      {/* OVERLAY */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* MOBILE DRAWER */}
      <div
        className={`fixed top-0 right-0 h-screen w-[300px] max-w-[85vw] bg-white shadow-2xl z-50 transition-all duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}
      >
        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                Vihaan Education
              </h2>

              <p className="text-sm text-blue-100 mt-1">
                Academy and Library
              </p>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg hover:bg-white/10 transition"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;

            const isActive =
              pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
              >
                <div
                  className={`group flex items-center justify-between rounded-2xl px-4 py-4 transition-all duration-300 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'hover:bg-blue-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-xl ${
                        isActive
                          ? 'bg-white/20'
                          : 'bg-blue-100'
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 ${
                          isActive
                            ? 'text-white'
                            : 'text-blue-700'
                        }`}
                      />
                    </div>

                    <span className="font-medium">
                      {item.name}
                    </span>
                  </div>

                  <ChevronRight
                    className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${
                      isActive
                        ? 'text-white'
                        : 'text-gray-400'
                    }`}
                  />
                </div>
              </Link>
            );
          })}
        </nav>

        {/* FOOTER */}
        <div className="p-4 border-t border-gray-100 space-y-3">
          <Link
            href="/admission"
            onClick={() => setIsOpen(false)}
          >
            <Button className="w-full h-12 rounded-2xl bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold hover:from-yellow-500 hover:to-yellow-600 shadow-lg">
              Apply For Admission
            </Button>
          </Link>

          <div className="text-center text-xs text-gray-400">
            © 2026 Starlight Academy
          </div>
        </div>
      </div>
    </div>
  );
}

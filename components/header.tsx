'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  X,
  ChevronRight,
  LogOut,
  LayoutDashboard,
  User as UserIcon,
  LogIn,
  UserPlus,
  Loader as Loader2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ContactPopover } from '@/components/contact-popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Courses', href: '/courses' },
  { name: 'Blogs', href: '/blogs' },
  { name: 'Gallery', href: '/gallery' },
  { name: 'Contact', href: '/contact' },
  { name: 'Admission', href: '/admission' },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, profile, isLoading: authLoading, signOut } = useAuth();
  const { toast } = useToast();

  const [mobileOpen, setMobileOpen] = useState(false);

  if (pathname.startsWith('/admin') || pathname.startsWith('/student')) return null;

  const dashboardHref =
    role === 'admin' ? '/admin' : role === 'student' ? '/student/dashboard' : null;

  const dashboardLabel = role === 'admin' ? 'Admin Dashboard' : 'Student Dashboard';

  const displayName = profile?.full_name || user?.email || 'User';
  const initials = (() => {
    const name = profile?.full_name || user?.email || 'U';
    if (name.includes('@')) {
      return name.split('@')[0].slice(0, 2).toUpperCase();
    }
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2)
      return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  })();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({ title: 'Logged out', description: 'See you soon!' });
      router.push('/');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to log out',
        variant: 'destructive',
      });
    }
  };

  const AuthControlsDesktop = () => {
    if (authLoading) {
      return (
        <Button variant="outline" size="sm" className="border-blue-200 h-11 px-4">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
        </Button>
      );
    }

    if (user && dashboardHref) {
      return (
        <div className="flex items-center gap-3">
          <Link href={dashboardHref}>
            <Button
              variant="outline"
              className="h-11 border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-11 px-2 flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/40 hover:bg-blue-50"
              >
                <Avatar className="h-8 w-8 border-2 border-blue-200 bg-gradient-to-br from-blue-600 to-red-500">
                  <AvatarFallback className="text-white font-bold text-xs bg-transparent">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start leading-tight">
                  <span className="text-sm font-semibold text-gray-900 truncate max-w-[120px]">
                    {displayName}
                  </span>
                  <span className="text-[10px] font-semibold text-blue-600 capitalize">
                    {role}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 border-blue-100 mr-2" align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-gray-900 truncate">
                    {displayName}
                  </span>
                  <span className="text-xs text-gray-500 truncate">
                    {user.email}
                  </span>
                  <Badge
                    className="mt-1 capitalize w-fit"
                    variant={
                      role === 'admin' ? 'default' : 'secondary'
                    }
                  >
                    {role}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => router.push(dashboardHref)}
                  className="cursor-pointer"
                >
                  <LayoutDashboard className="mr-2 h-4 w-4 text-blue-600" />
                  <span>{dashboardLabel}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push('/profile')}
                  className="cursor-pointer"
                >
                  <UserIcon className="mr-2 h-4 w-4 text-blue-600" />
                  <span>My Profile</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    }

    // Logged out
    return (
      <div className="flex items-center gap-2">
        <Link href="/auth/login">
          <Button
            variant="outline"
            className="h-11 border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            <LogIn className="h-4 w-4 mr-2" />
            Login
          </Button>
        </Link>
        <Link href="/auth/signup">
          <Button className="h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md shadow-blue-200">
            <UserPlus className="h-4 w-4 mr-2" />
            Sign Up
          </Button>
        </Link>
      </div>
    );
  };

return (
  <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
    <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 xl:px-8">
      <div className="flex h-[76px] items-center justify-between gap-4">

        {/* ================= LOGO ================= */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5"
        >
          <div className="relative h-14 w-14 shrink-0">
            <Image
              src="/starlight logo.jpeg"
              alt="Starlight Academy"
              fill
              priority
              sizes="56px"
              className="object-contain"
            />
          </div>

          <div className="leading-none">
            <h1 className="whitespace-nowrap text-[24px] font-extrabold tracking-tight">
              <span className="text-blue-600">Starlight</span>{' '}
              <span className="text-red-600">Academy</span>
            </h1>

         
          </div>
        </Link>

        {/* ================= DESKTOP NAV ================= */}
        <nav className="hidden xl:flex flex-1 items-center justify-center">
          <div className="flex items-center gap-0.5">
            {navItems.map((item) => {
              const active = pathname === item.href;

              return (
                <Link key={item.name} href={item.href}>
                  <div
                    className={`
                      whitespace-nowrap rounded-lg px-3 py-2.5
                      text-[15px] font-medium
                      transition-all duration-200
                      ${
                        active
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-blue-600'
                      }
                    `}
                  >
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* ================= DESKTOP ACTIONS ================= */}
        <div className="hidden xl:flex shrink-0 items-center gap-2">

          {/* Dashboard */}
          {authLoading ? (
            <Button
              variant="outline"
              className="h-11 w-11 rounded-xl border-blue-200 p-0"
            >
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            </Button>
          ) : user && dashboardHref ? (
            <>
              <Link href={dashboardHref}>
                <Button
                  variant="outline"
                  className="
                    h-11 rounded-xl
                    border-blue-200
                    bg-white
                    px-4
                    text-blue-700
                    shadow-sm
                    hover:bg-blue-50
                  "
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>

              {/* User Profile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="
                      flex h-11 items-center gap-2
                      rounded-xl
                      border border-slate-200
                      bg-white
                      px-2.5
                      shadow-sm
                      outline-none
                      transition
                      hover:border-blue-200
                      hover:bg-slate-50
                    "
                  >
                    <Avatar className="h-8 w-8 border-2 border-blue-200">
                      <AvatarFallback
                        className="
                          bg-gradient-to-br
                          from-blue-600 to-red-500
                          text-xs font-bold text-white
                        "
                      >
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex min-w-0 flex-col items-start leading-tight">
                      <span className="max-w-[80px] truncate text-xs font-semibold text-slate-900">
                        {displayName}
                      </span>

                      <span className="text-[10px] font-medium capitalize text-blue-600">
                        {role}
                      </span>
                    </div>
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="mr-2 w-64 border-slate-200"
                >
                  <DropdownMenuLabel>
                    <div className="flex flex-col gap-1">
                      <span className="truncate text-sm font-semibold text-slate-900">
                        {displayName}
                      </span>

                      <span className="truncate text-xs text-slate-500">
                        {user.email}
                      </span>

                      <Badge
                        className="mt-1 w-fit capitalize"
                        variant={
                          role === 'admin'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {role}
                      </Badge>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(dashboardHref)
                      }
                      className="cursor-pointer"
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4 text-blue-600" />
                      {dashboardLabel}
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => router.push('/profile')}
                      className="cursor-pointer"
                    >
                      <UserIcon className="mr-2 h-4 w-4 text-blue-600" />
                      My Profile
                    </DropdownMenuItem>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button
                  variant="outline"
                  className="
                    h-11 rounded-xl
                    border-blue-200
                    px-4
                    text-blue-700
                    hover:bg-blue-50
                  "
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Button>
              </Link>

              <Link href="/auth/signup">
                <Button
                  className="
                    h-11 rounded-xl
                    bg-blue-600
                    px-4
                    text-white
                    shadow-md
                    hover:bg-blue-700
                  "
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign Up
                </Button>
              </Link>
            </>
          )}

          {/* Contact */}
          <div className="shrink-0">
            <ContactPopover />
          </div>

          {/* Apply Now */}
          <Link href="/admission" className="shrink-0">
            <Button
              className="
                h-11 rounded-xl
                bg-gradient-to-r
                from-blue-600
                to-red-600
                px-5
                font-semibold
                text-white
                shadow-md
                transition-all
                hover:from-blue-700
                hover:to-red-700
                hover:shadow-lg
              "
            >
              Apply Now
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* ================= MOBILE ================= */}
        <div className="flex items-center gap-2 xl:hidden">
          <ContactPopover />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="
              h-11 w-11
              rounded-xl
              border border-slate-200
              bg-white
            "
          >
            {mobileOpen ? (
              <X className="h-5 w-5 text-red-600" />
            ) : (
              <Menu className="h-5 w-5 text-blue-600" />
            )}
          </Button>
        </div>
      </div>

      {/* ================= MOBILE MENU ================= */}
      <div
        className={`
          xl:hidden overflow-hidden
          transition-all duration-300
          ${mobileOpen ? 'max-h-[900px]' : 'max-h-0'}
        `}
      >
        <div className="border-t border-slate-200 bg-white py-4">
          <nav className="flex flex-col gap-1.5">

            {navItems.map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                >
                  <div
                    className={`
                      flex h-12 items-center
                      rounded-xl px-4
                      text-sm font-medium
                      ${
                        active
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-slate-700 hover:bg-slate-50'
                      }
                    `}
                  >
                    {item.name}
                  </div>
                </Link>
              );
            })}

            <div className="mt-3 space-y-3 border-t border-slate-200 pt-4">

              {authLoading ? (
                <Button
                  variant="outline"
                  className="h-12 w-full"
                  disabled
                >
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </Button>
              ) : user && dashboardHref ? (
                <>
                  {/* Mobile User */}
                  <div
                    className="
                      flex items-center gap-3
                      rounded-xl
                      border border-blue-100
                      bg-blue-50/50
                      p-3
                    "
                  >
                    <Avatar className="h-10 w-10 border-2 border-blue-200">
                      <AvatarFallback
                        className="
                          bg-gradient-to-br
                          from-blue-600 to-red-500
                          font-bold text-white
                        "
                      >
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {displayName}
                      </p>

                      <Badge
                        className="mt-1 capitalize"
                        variant={
                          role === 'admin'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {role}
                      </Badge>
                    </div>
                  </div>

                  <Link
                    href={dashboardHref}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Button
                      className="
                        h-12 w-full gap-2
                        bg-blue-600
                        text-white
                        hover:bg-blue-700
                      "
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      {dashboardLabel}
                    </Button>
                  </Link>

                  <Button
                    variant="destructive"
                    onClick={() => {
                      setMobileOpen(false);
                      handleLogout();
                    }}
                    className="h-12 w-full gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileOpen(false)}
                  >
                    <Button
                      variant="outline"
                      className="
                        h-12 w-full gap-2
                        border-blue-200
                        text-blue-700
                      "
                    >
                      <LogIn className="h-4 w-4" />
                      Login
                    </Button>
                  </Link>

                  <Link
                    href="/auth/signup"
                    onClick={() => setMobileOpen(false)}
                  >
                    <Button
                      className="
                        h-12 w-full gap-2
                        bg-blue-600
                        text-white
                        hover:bg-blue-700
                      "
                    >
                      <UserPlus className="h-4 w-4" />
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}

              <Link
                href="/admission"
                onClick={() => setMobileOpen(false)}
              >
                <Button
                  className="
                    h-12 w-full
                    bg-gradient-to-r
                    from-blue-600
                    to-red-600
                    text-white
                  "
                >
                  Apply Now
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>

            </div>
          </nav>
        </div>
      </div>
    </div>
  </header>
);
}

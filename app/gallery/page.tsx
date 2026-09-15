import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getActiveGalleryItems } from '@/lib/gallery/queries';

export const metadata: Metadata = {
  title: 'Gallery - Starlight Academy | Campus Life & Events',
  description:
    'Explore our campus gallery showcasing vibrant student life, learning facilities, events, and memorable moments at Starlight Academy.',
  keywords: [
    'gallery',
    'campus',
    'events',
    'student life',
    'Vihaan Education Academy',
    'photos',
  ],
  openGraph: {
    title: 'Gallery - Starlight Academy',
    description: 'Explore our campus gallery and memorable moments',
    type: 'website',
  },
};

export const revalidate = 60;

export default async function GalleryPage() {
  const galleryItems = await getActiveGalleryItems();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="relative overflow-hidden py-12 sm:py-16 lg:py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-transparent to-transparent" />
        <div className="absolute left-0 top-0 h-64 w-64 rounded-full bg-blue-200/20 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-64 w-64 rounded-full bg-red-200/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back Home
            </Button>
          </Link>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900">
            Gallery
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Explore our campus life, events, and memorable moments at Starlight Academy.
          </p>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        {galleryItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-slate-600">
              No gallery images yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {galleryItems.map((item) => (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                {/* Image Container */}
                <div className="relative overflow-hidden h-72 sm:h-80">
                  <Image
                    src={item.image_url}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-300">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  <p className="mt-3 text-xs text-slate-500">
                    {new Date(item.created_at).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

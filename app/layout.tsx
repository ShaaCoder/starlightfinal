import './globals.css';

import type { Metadata } from 'next';
import Script from 'next/script';

import { Inter } from 'next/font/google';

import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from 'sonner';

import { AuthProvider } from '@/lib/auth-context';

import { Header } from '@/components/header';
import Footer from '@/components/Footer';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Starlight Academy - Excellence in Education',
  description:
    'Starlight Academy provides world-class education with expert instructors, modern facilities, and personalized learning paths. Join us for NIOS, CBSE, and foundation courses.',
  keywords: ['Vihaan Education Academy', 'Education', 'NIOS', 'CBSE', 'Library', 'Coaching', 'Admission'],
  openGraph: {
    title: 'Starlight Academy - Excellence in Education',
    description:
      'Starlight Academy provides world-class education with expert instructors, modern facilities, and personalized learning paths.',
    url: 'https://vihaaneducation.com',
    type: 'website',
    siteName: 'Starlight Academy',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Starlight Academy',
    description: 'Excellence in Education Since 2001',
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SEARCH_CONSOLE_TOKEN ? {
    google: process.env.NEXT_PUBLIC_GOOGLE_SEARCH_CONSOLE_TOKEN,
  } : undefined,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <head />
      <body className="bg-white text-gray-900 antialiased">
        <AuthProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Toaster />
          <SonnerToaster />
        </AuthProvider>

        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}');
                `,
              }}
            />
          </>
        )}

        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Starlight Academy',
              url: 'https://vihaaneducation.com',
              logo: 'https://vihaaneducation.com/vihaanlogo.png',
              description: 'Quality education courses and library for your success since 2001',
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'A-309, 2nd Floor, Landmark Vijay Vihar Petrol Pump & Mount Abu Junior School, Sector-4, Rohini',
                addressLocality: 'Delhi',
                postalCode: '110085',
                addressCountry: 'IN',
              },
              telephone: '+919212644428',
              sameAs: [],
            }),
          }}
        />

        {/* LocalBusiness Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'LocalBusiness',
              '@id': 'https://vihaaneducation.com',
              name: 'Starlight Academy',
              image: 'https://vihaaneducation.com/vihaanlogo.png',
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'A-309, 2nd Floor, Landmark Vijay Vihar Petrol Pump & Mount Abu Junior School, Sector-4, Rohini',
                addressLocality: 'Delhi',
                postalCode: '110085',
                addressCountry: 'IN',
              },
              geo: {
                '@type': 'GeoCoordinates',
                latitude: 28.7328,
                longitude: 77.1129,
              },
              telephone: '+919212644428',
              openingHoursSpecification: [
                { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '20:00' },
                { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '10:00', closes: '18:00' },
              ],
              priceRange: '$$',
            }),
          }}
        />

        <Footer />
      </body>
    </html>
  );
}

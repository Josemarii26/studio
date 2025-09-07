
import type {Metadata} from 'next';
import '../globals.css';
import { Toaster } from "@/components/ui/toaster"
import { getStaticParams } from '@/locales/server';
import { Providers } from '@/components/providers';


export function generateStaticParams() {
  return getStaticParams()
}

export const metadata: Metadata = {
    title: 'NutriTrackAI',
    description: 'Track your nutrition with the power of AI.',
    manifest: '/manifest.json',
    icons: {
      icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M50 90 A40 40 0 0 1 10 50 H0 A50 50 0 0 0 50 100 Z' fill='%234CAF50'/%3E%3Cpath d='M50 90 A40 40 0 0 0 90 50 H100 A50 50 0 0 1 50 100 Z' fill='%234CAF50'/%3E%3Cpath d='M50 10 A45 45 0 0 1 72.5 18.2 A20 20 0 0 1 87.5 40 C93 51 81 65 50 65 S7 51 12.5 40 A20 20 0 0 1 27.5 18.2 A45 45 0 0 1 50 10 Z' fill='%234CAF50'/%3E%3C/svg%3E",
      apple: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M50 90 A40 40 0 0 1 10 50 H0 A50 50 0 0 0 50 100 Z' fill='%234CAF50'/%3E%3Cpath d='M50 90 A40 40 0 0 0 90 50 H100 A50 50 0 0 1 50 100 Z' fill='%234CAF50'/%3E%3Cpath d='M50 10 A45 45 0 0 1 72.5 18.2 A20 20 0 0 1 87.5 40 C93 51 81 65 50 65 S7 51 12.5 40 A20 20 0 0 1 27.5 18.2 A45 45 0 0 1 50 10 Z' fill='%234CAF50'/%3E%3C/svg%3E"
    },
    themeColor: '#f1f8e9',
}


export default function LocaleLayout({
  children,
  params: { locale }
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {

  return (
    <html lang={locale} suppressHydrationWarning>
       <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
        </head>
      <body className="font-body antialiased">
         <Providers locale={locale}>
            {children}
            <Toaster />
        </Providers>
      </body>
    </html>
  );
}

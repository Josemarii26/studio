
import type {Metadata} from 'next';
import './globals.css';
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
      icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%234CAF50' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='lucide lucide-leaf'%3E%3Cpath d='M11 20A7 7 0 0 1 4 13H2a10 10 0 0 0 10 10z'/%3E%3Cpath d='M12 21a10 10 0 0 0 10-10h-2a7 7 0 0 1-7 7z'/%3E%3Cpath d='M12 4a9.91 9.91 0 0 1 3.5 1.63A4 4 0 0 1 19.5 8C20.6 10.2 18 13 12 13s-8.6-2.8-7.5-5A4 4 0 0 1 8.5 4.37 9.91 9.91 0 0 1 12 4z'/%3E%3C/svg%3E",
      apple: [
        { url: '/leaf.png' },
        { url: '/leaf.png', sizes: '120x120' },
      ]
    },
    themeColor: '#f1f8e9',
}


export default function RootLayout({
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

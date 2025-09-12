
import type {Metadata, Viewport} from 'next';
import '../globals.css';
import { Toaster } from "@/components/ui/toaster"
import { getStaticParams } from '@/locales/server';
import { Providers } from '@/components/providers';


export function generateStaticParams() {
  return getStaticParams()
}

export const metadata: Metadata = {
    title: 'DietLogAI',
    description: 'Track your nutrition with the power of AI.',
    manifest: '/manifest.json',
    icons: {
      icon: "/icon-192x192.png",
      apple: "/icon-192x192.png"
    },
}

export const viewport: Viewport = {
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
          <link rel="manifest" href="/manifest.json" />
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

import type { Metadata } from 'next';
import MetaPixel from './_components/MetaPixel';
import './globals.css';

export const metadata: Metadata = {
  title: 'DynLander',
  description: 'Dynamic landing pages and AI Google Ads intelligence for lead generation campaigns.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <MetaPixel />
        {children}
      </body>
    </html>
  );
}

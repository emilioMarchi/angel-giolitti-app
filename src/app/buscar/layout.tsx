import type { Metadata } from 'next';
import { siteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Búsqueda',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: `${siteUrl}/buscar`,
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

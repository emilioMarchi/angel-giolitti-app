import type { Metadata } from 'next';
import { getPageMetadata } from '@/lib/seo';

export const metadata: Metadata = getPageMetadata({
  title: 'Proyectos',
  description:
    'Explorá todos los proyectos de Ángel Giolitti: bandas, colaboraciones y trabajos como productor y compositor, con música, galerías y videos.',
  path: '/proyectos',
});

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

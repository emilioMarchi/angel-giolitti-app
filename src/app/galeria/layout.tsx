import type { Metadata } from 'next';
import { getPageMetadata } from '@/lib/seo';

export const metadata: Metadata = getPageMetadata({
  title: 'Galería',
  description:
    'Galería de fotos y videos de Ángel Giolitti: recitales, sesiones, backstage y material audiovisual de todos sus proyectos.',
  path: '/galeria',
});

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

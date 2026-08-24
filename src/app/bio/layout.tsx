import type { Metadata } from 'next';
import { getPageMetadata } from '@/lib/seo';

export const metadata: Metadata = getPageMetadata({
  title: 'Bio',
  description:
    'Conocé la trayectoria de Ángel Giolitti: músico, productor y compositor. Su historia, proyectos e integraciones por género y rol.',
  path: '/bio',
});

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

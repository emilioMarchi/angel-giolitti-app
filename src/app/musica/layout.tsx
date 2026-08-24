import type { Metadata } from 'next';
import { getPageMetadata } from '@/lib/seo';

export const metadata: Metadata = getPageMetadata({
  title: 'Música',
  description:
    'Discografía completa de Ángel Giolitti: álbumes, EPs y singles con reproductor continuo. Escuchá toda su música en la plataforma oficial.',
  path: '/musica',
});

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

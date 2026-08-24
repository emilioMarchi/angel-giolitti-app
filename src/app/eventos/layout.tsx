import type { Metadata } from 'next';
import { getPageMetadata } from '@/lib/seo';

export const metadata: Metadata = getPageMetadata({
  title: 'Eventos',
  description:
    'Agenda de eventos y shows de Ángel Giolitti: próximas fechas, venues y toda la info para no perderte ningún recital.',
  path: '/eventos',
});

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import EventosClient from '../EventosClient';
import { getEventMeta, getPageMetadata } from '@/lib/seo';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const meta = await getEventMeta(slug);

  if (!meta.found) {
    return getPageMetadata({
      title: 'Evento no encontrado',
      description: 'El evento que buscás no existe o fue removido.',
      path: `/eventos/${slug}`,
    });
  }

  return getPageMetadata({
    title: meta.title,
    description: meta.description,
    path: `/eventos/${slug}`,
    image: meta.image,
    type: 'article',
  });
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const meta = await getEventMeta(slug);

  if (!meta.found) {
    notFound();
  }

  return <EventosClient initialSlug={slug} />;
}

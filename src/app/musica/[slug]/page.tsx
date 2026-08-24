import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import AlbumDetailClient from './AlbumDetailClient';
import { getAlbumMeta, getPageMetadata } from '@/lib/seo';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const meta = await getAlbumMeta(slug);

  if (!meta.found) {
    return getPageMetadata({
      title: 'Álbum no encontrado',
      description: 'El álbum que buscás no existe o fue removido.',
      path: `/musica/${slug}`,
    });
  }

  return getPageMetadata({
    title: meta.title,
    description: meta.description,
    path: `/musica/${slug}`,
    image: meta.image,
    type: 'music.album',
  });
}

export default async function AlbumDetailPage({ params }: Props) {
  const { slug } = await params;
  const meta = await getAlbumMeta(slug);

  if (!meta.found) {
    notFound();
  }

  return <AlbumDetailClient />;
}

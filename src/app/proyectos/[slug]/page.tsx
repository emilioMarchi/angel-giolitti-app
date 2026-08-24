import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProjectDetailClient from './ProjectDetailClient';
import { getProjectMeta, getPageMetadata } from '@/lib/seo';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const meta = await getProjectMeta(slug);

  if (!meta.found) {
    return getPageMetadata({
      title: 'Proyecto no encontrado',
      description: 'El proyecto que buscás no existe o fue removido.',
      path: `/proyectos/${slug}`,
    });
  }

  return getPageMetadata({
    title: meta.title,
    description: meta.description,
    path: `/proyectos/${slug}`,
    image: meta.image,
  });
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const meta = await getProjectMeta(slug);

  if (!meta.found) {
    notFound();
  }

  return <ProjectDetailClient />;
}

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Panel de Administración | Ángel Giolitti',
  description: 'Panel de administración privado para gestionar el contenido del sitio web.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-zoom-root fixed inset-0 z-[99] flex bg-background text-foreground overflow-hidden">
      {children}
    </div>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Search,
  Music2,
  FolderOpen,
  CalendarDays,
  Images,
  User,
  Library,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const mainNav = [
  { label: 'Inicio', href: '/', icon: Home },
  { label: 'Buscar', href: '/buscar', icon: Search },
];

const libraryNav = [
  { label: 'Música', href: '/musica', icon: Music2 },
  { label: 'Proyectos', href: '/proyectos', icon: FolderOpen },
  { label: 'Eventos', href: '/eventos', icon: CalendarDays },
  { label: 'Galería', href: '/galeria', icon: Images },
  { label: 'Biografía', href: '/bio', icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <aside className="sidebar">
      {/* ── Bloque superior: navegación principal ── */}
      <div className="sidebar-block">
        <Link href="/" className="sidebar-logo">
          <span className="sidebar-logo-text">
            <span className="text-primary">Á</span>ngel{' '}
            <span className="text-primary">G</span>iolitti
          </span>
        </Link>

        <nav className="sidebar-nav">
          {mainNav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${isActive(item.href) ? 'active' : ''}`}
              >
                <Icon className="sidebar-link-icon" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ── Bloque inferior: biblioteca / secciones ── */}
      <div className="sidebar-block sidebar-library">
        <div className="sidebar-library-header">
          <div className="sidebar-library-title">
            <Library className="h-5 w-5" />
            <span>Tu Biblioteca</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {libraryNav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${isActive(item.href) ? 'active' : ''}`}
              >
                <Icon className="sidebar-link-icon" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

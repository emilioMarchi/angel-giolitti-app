'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, Home, Search, Music2, FolderOpen, CalendarDays, Images, User, Library } from 'lucide-react';

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

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-border/30 bg-background/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo / Nombre del artista */}
        <Link href="/" className="group flex items-center gap-1">
          <span className="text-xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading), var(--font-sans), sans-serif' }}>
            <span className="text-primary">Á</span>ngel{' '}
            <span className="text-primary">G</span>iolitti
          </span>
        </Link>

        {/* Links de navegación - Desktop */}
        <ul className="hidden items-center gap-1 md:flex">
          {mainNav.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                    isActive(item.href)
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                  {isActive(item.href) && (
                    <span className="absolute bottom-0 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_6px_var(--primary)]" />
                  )}
                </Link>
              </li>
            );
          })}
          {libraryNav.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                    isActive(item.href)
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                  {isActive(item.href) && (
                    <span className="absolute bottom-0 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_6px_var(--primary)]" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Botón hamburguesa - Mobile */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:hidden"
          aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Menú móvil tipo Sidebar */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Overlay backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />

        {/* Sidebar panel */}
        <aside className={`absolute left-0 top-0 bottom-0 w-full max-w-sm bg-background border-r border-border/30 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col overflow-hidden
          ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          {/* ── Bloque superior: navegación principal ── */}
          <div className="p-4 space-y-2 border-b border-border/30">
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-base font-semibold text-white hover:bg-primary/10 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="text-xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading), var(--font-sans), sans-serif' }}>
                <span className="text-primary">Á</span>ngel{' '}
                <span className="text-primary">G</span>iolitti
              </span>
            </Link>

            <nav className="space-y-1 pt-2">
              {mainNav.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* ── Bloque inferior: biblioteca / secciones ── */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div className="flex items-center gap-3 px-3 pb-2 border-b border-border/30">
              <Library className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-white uppercase tracking-wider">Tu Biblioteca</span>
            </div>

            <nav className="space-y-1">
              {libraryNav.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Footer del sidebar móvil */}
          <div className="p-4 border-t border-border/30">
            <p className="text-xs text-muted-foreground text-center">
              Ángel Giolitti — Plataforma Oficial
            </p>
          </div>
        </aside>
      </div>
    </header>
  );
}
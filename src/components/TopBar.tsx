'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, ChevronLeft, ChevronRight, Music, LayoutGrid, Calendar, Image, FileText, User } from 'lucide-react';

const navLinks = [
  { label: 'Inicio', href: '/', icon: User },
  { label: 'Música', href: '/musica', icon: Music },
  { label: 'Proyectos', href: '/proyectos', icon: LayoutGrid },
  { label: 'Eventos', href: '/eventos', icon: Calendar },
  { label: 'Galería', href: '/galeria', icon: Image },
  { label: 'Bio', href: '/bio', icon: FileText },
];

export default function TopBar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      <header className="topbar">
        {/* Logo - Lado izquierdo */}
        <Link
          href="/"
          className="flex items-center gap-1"
        >
          <span className="text-xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading), var(--font-sans), sans-serif' }}>
            <span className="text-primary">Á</span>ngel{' '}
            <span className="text-primary">G</span>iolitti
          </span>
        </Link>

        {/* Botones de navegación historial */}
        <div className="topbar-nav-buttons">
          <button
            onClick={() => window.history.back()}
            className="topbar-nav-btn"
            aria-label="Atrás"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => window.history.forward()}
            className="topbar-nav-btn"
            aria-label="Adelante"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {pathname === '/' && (
            <h1 className="topbar-greeting hidden sm:block">Bienvenido</h1>
          )}
        </div>

        {/* Acciones (perfil/admin) */}
        <div className="topbar-actions">
          <a
            href="https://angelgiolitti.com.ar"
            target="_blank"
            rel="noopener noreferrer"
            className="topbar-profile-btn hidden sm:flex"
          >
            AG
          </a>
        </div>

        {/* Botón menú hamburguesa - Mobile (lado derecho) */}
        <button
          onClick={() => setIsMenuOpen(true)}
          className="topbar-nav-btn md:hidden ml-2"
          aria-label="Abrir menú de navegación"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Menú lateral móvil (Sidebar style) - LADO DERECHO */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${
          isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMenuOpen(false)}
        aria-hidden={!isMenuOpen}
      >
        {/* Overlay fondo */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          aria-hidden="true"
        />

        {/* Panel lateral */}
        <div
          className="absolute top-0 right-0 h-full w-72 max-w-[85vw] bg-background border-l border-border shadow-2xl transform transition-transform duration-300 ease-out z-10"
          style={{ transform: isMenuOpen ? 'translateX(0)' : 'translateX(100%)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header del panel */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-border">
            <span className="text-lg font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading), var(--font-sans), sans-serif' }}>
              <span className="text-primary">Á</span>ngel{' '}
              <span className="text-primary">G</span>iolitti
            </span>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground hover:bg-accent"
              aria-label="Cerrar menú"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navegación */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer del panel */}
          <div className="p-4 border-t border-border">
            <a
              href="https://angelgiolitti.com.ar"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <span className="h-5 w-5" />
              Web oficial
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
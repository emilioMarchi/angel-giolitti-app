'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function TopBar() {
  const router = useRouter();
  const pathname = usePathname();

  // Generar saludo según hora del día
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <header className="topbar">
      {/* Botones de navegación historial */}
      <div className="topbar-nav-buttons">
        <button
          onClick={() => router.back()}
          className="topbar-nav-btn"
          aria-label="Atrás"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => router.forward()}
          className="topbar-nav-btn"
          aria-label="Adelante"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {pathname === '/' && (
          <h1 className="topbar-greeting">{getGreeting()}</h1>
        )}
      </div>

      {/* Espacio para perfil/admin en el futuro */}
      <div className="topbar-actions">
        <a
          href="https://angelgiolitti.com.ar"
          target="_blank"
          rel="noopener noreferrer"
          className="topbar-profile-btn"
        >
          AG
        </a>
      </div>
    </header>
  );
}

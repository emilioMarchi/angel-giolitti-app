'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { incrementListener, incrementPageView } from '@/lib/metrics';

export default function ScrollRestorer() {
  const pathname = usePathname();

  useEffect(() => {
    const el = document.querySelector('.main-view-content');
    if (el) el.scrollTop = 0;

    // Registrar visita a la página (excluyendo el panel de administración)
    if (!pathname.startsWith('/admin')) {
      incrementPageView(pathname).catch((err) => {
        console.error('Error al registrar vista de página:', err);
      });
    }
  }, [pathname]);

  useEffect(() => {
    const key = 'angel-giolitti-visitor';
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, '1');
      incrementListener().catch((err) => {
        console.error('Error al registrar nuevo oyente:', err);
      });
    }
  }, []);

  return null;
}


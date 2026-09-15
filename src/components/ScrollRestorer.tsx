'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { incrementListener, incrementPageView } from '@/lib/metrics';

export default function ScrollRestorer() {
  const pathname = usePathname();
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    const el = document.querySelector('.main-view-content');
    if (el) el.scrollTop = 0;

    if (!pathname.startsWith('/admin') && pathname !== lastPathRef.current) {
      lastPathRef.current = pathname;
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

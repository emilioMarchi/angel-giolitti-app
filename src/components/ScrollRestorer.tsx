'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { incrementListener } from '@/lib/metrics';

export default function ScrollRestorer() {
  const pathname = usePathname();

  useEffect(() => {
    const el = document.querySelector('.main-view-content');
    if (el) el.scrollTop = 0;
  }, [pathname]);

  useEffect(() => {
    const key = 'angel-giolitti-visitor';
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, '1');
      incrementListener();
    }
  }, []);

  return null;
}

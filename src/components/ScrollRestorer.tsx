'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollRestorer() {
  const pathname = usePathname();

  useEffect(() => {
    const el = document.querySelector('.main-view-content');
    if (el) el.scrollTop = 0;
  }, [pathname]);

  return null;
}

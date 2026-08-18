'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import MobileHero from '@/components/MobileHero';
import GlobalAudioPlayer from '@/components/GlobalAudioPlayer';
import ScrollRestorer from '@/components/ScrollRestorer';

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  if (pathname?.startsWith('/admin')) {
    return <div className="h-full w-full">{children}</div>;
  }

  return (
    <>
      <Sidebar />
      <main className="main-view">
        <TopBar />
        <MobileHero />
        <div className="main-view-content">
          <ScrollRestorer />
          {children}
        </div>
      </main>
      <GlobalAudioPlayer />
    </>
  );
}

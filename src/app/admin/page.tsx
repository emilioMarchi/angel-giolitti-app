'use client';

import { useRouter } from 'next/navigation';
import AdminDashboard from '@/components/admin/AdminDashboard';

export default function AdminPage() {
  const router = useRouter();

  const handleNavigate = (tab: string) => {
    if (tab === 'dashboard') {
      router.push('/admin');
    } else {
      router.push(`/admin/${tab}`);
    }
  };

  return <AdminDashboard onNavigate={handleNavigate} />;
}

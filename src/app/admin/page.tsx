'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminMusica from '@/components/admin/AdminMusica';
import AdminEventos from '@/components/admin/AdminEventos';
import AdminProyectos from '@/components/admin/AdminProyectos';
import AdminGaleria from '@/components/admin/AdminGaleria';
import AdminBio from '@/components/admin/AdminBio';
import {
  LayoutDashboard,
  Music,
  CalendarDays,
  Video,
  Image as ImageIcon,
  FileText,
  LogOut,
  Loader2,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type TabType = 'dashboard' | 'musica' | 'eventos' | 'proyectos' | 'galeria' | 'bio';

export default function AdminSPA() {
  const [session, setSession] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!active) return;
      if (user) {
        const { data: { session } } = await supabase.auth.getSession();
        if (active) setSession(session);
      } else {
        setSession(null);
      }
      setCheckingAuth(false);
    }

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setCheckingAuth(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoginError('Credenciales incorrectas. Intenta de nuevo.');
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setActiveTab('dashboard');
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  if (checkingAuth) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0a0a0a]" suppressHydrationWarning>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 text-white/40 animate-spin" suppressHydrationWarning />
          <span className="text-xs text-white/30 font-medium">Cargando panel...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0a0a0a] text-white p-4">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center space-y-1">
            <div className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center mx-auto mb-4">
              <span className="text-white/60 font-semibold text-sm">AG</span>
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-white/90">Panel de Control</h1>
            <p className="text-white/40 text-xs">Inicia sesión para continuar</p>
          </div>

          {loginError && (
            <div className="px-3 py-2.5 text-xs text-red-400 bg-red-500/8 rounded-lg border border-red-500/15 text-center">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-medium text-white/50">Correo</label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@admin.com"
                required
                className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 h-9 text-sm focus:border-white/20"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-medium text-white/50">Contraseña</label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 h-9 text-sm focus:border-white/20"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-white text-black hover:bg-white/90 font-medium h-9 text-sm cursor-pointer"
              disabled={loginLoading}
            >
              {loginLoading ? 'Ingresando...' : 'Entrar'}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: 'dashboard', label: 'Resumen', icon: LayoutDashboard },
    { id: 'musica', label: 'Música', icon: Music },
    { id: 'eventos', label: 'Eventos', icon: CalendarDays },
    { id: 'proyectos', label: 'Proyectos', icon: Video },
    { id: 'galeria', label: 'Galería', icon: ImageIcon },
    { id: 'bio', label: 'Bio & Docs', icon: FileText },
  ] as const;

  return (
    <div className="flex w-full h-full bg-[#0a0a0a] text-white overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={cn(
        "fixed lg:relative z-50 lg:z-auto w-56 h-full border-r border-white/[0.06] bg-[#0a0a0a] flex flex-col shrink-0 transition-transform duration-200 lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center">
                <span className="text-white/60 font-semibold text-[10px]">AG</span>
              </div>
              <span className="font-semibold text-sm text-white/80">Admin</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 text-white/40 hover:text-white/60 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <nav className="flex-1 px-3 py-3 space-y-0.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all cursor-pointer text-left",
                  isActive
                    ? "bg-white/[0.08] text-white"
                    : "text-white/40 hover:bg-white/[0.04] hover:text-white/60"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="px-3 pt-3 pb-6 border-t border-white/[0.06] space-y-1">
          <a
            href="/"
            target="_blank"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-white/30 hover:bg-white/[0.04] hover:text-white/50 transition-all cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            Ver sitio público
          </a>
          <button
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-white/30 hover:bg-red-500/10 hover:text-red-400 transition-all cursor-pointer text-left"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-30 lg:hidden flex items-center gap-3 px-4 py-3 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-white/[0.06]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 text-white/50 hover:text-white/80 cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-white/60 capitalize">
            {menuItems.find(m => m.id === activeTab)?.label}
          </span>
        </div>

        <div className="p-5 lg:p-8 max-w-6xl">
          {activeTab === 'dashboard' && <AdminDashboard onNavigate={handleTabChange} />}
          {activeTab === 'musica' && <AdminMusica />}
          {activeTab === 'eventos' && <AdminEventos />}
          {activeTab === 'proyectos' && <AdminProyectos />}
          {activeTab === 'galeria' && <AdminGaleria />}
          {activeTab === 'bio' && <AdminBio />}
        </div>
      </main>
    </div>
  );
}

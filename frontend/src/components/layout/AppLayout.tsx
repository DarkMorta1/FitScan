import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Search, ScanLine, UtensilsCrossed, Dumbbell,
  TrendingUp, Settings, LogOut, Moon, Sun, Menu, X, ClipboardList, Sparkles, Shield,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

const userLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/foods', icon: Search, label: 'Food Search' },
  { to: '/scanner', icon: ScanLine, label: 'Food Scanner' },
  { to: '/menu-scanner', icon: ClipboardList, label: 'Menu Scanner' },
  { to: '/recommendations', icon: Sparkles, label: 'AI Recommendations' },
  { to: '/meals', icon: UtensilsCrossed, label: 'Meal History' },
  { to: '/workouts', icon: Dumbbell, label: 'Workouts' },
  { to: '/progress', icon: TrendingUp, label: 'Progress' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const adminLinks = [{ to: '/admin', icon: Shield, label: 'Admin Panel' }];

export function AppLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = user?.role === 'admin' ? [...userLinks, ...adminLinks] : userLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside className={cn('flex h-full flex-col', mobile ? 'p-4' : 'p-6')}>
      <div className="mb-8 flex items-center gap-3 rounded-[28px] border border-white/10 bg-white/5 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
        <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-lg font-bold text-white shadow-lg shadow-violet-500/20">
          F
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white">FITSCAN AI</h1>
          <p className="text-xs uppercase tracking-[0.2em] text-violet-300">Elite Performance</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => mobile && setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-violet-500/20 text-violet-300'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-3 border-t border-white/10 pt-4">
        <p className="truncate px-4 text-sm font-medium">{user?.name}</p>
        <p className="truncate px-4 text-xs text-muted-foreground">{user?.email}</p>
        <div className="flex gap-2 px-2">
          <button onClick={toggleTheme} className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-sm hover:bg-accent">
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button onClick={handleLogout} className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-sm text-red-400 hover:bg-red-500/10">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-72 shrink-0 border-r border-white/10 bg-[#080d24]/80 lg:block">
        <Sidebar />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 glass">
            <button className="absolute right-4 top-4" onClick={() => setMobileOpen(false)}>
              <X className="h-5 w-5" />
            </button>
            <Sidebar mobile />
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col bg-[radial-gradient(circle_at_top_right,_rgba(147,51,234,0.16),transparent_25%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.1),transparent_30%)]">
        <header className="flex items-center justify-between border-b border-border px-4 py-3 lg:hidden">
          <button onClick={() => setMobileOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>
          <span className="font-bold gradient-text">FITSCAN</span>
          <button onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto min-h-full max-w-[1600px] page-shell">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

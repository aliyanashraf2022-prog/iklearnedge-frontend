import React from 'react';
import { LogOut } from 'lucide-react';
import NotificationBell from '@/components/NotificationBell';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface DashboardLayoutProps {
  title: string;
  subtitle?: string;
  userName: string;
  roleLabel: string;
  avatarUrl?: string;
  navItems: NavItem[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  title,
  subtitle,
  userName,
  roleLabel,
  avatarUrl,
  navItems,
  activeTab,
  onTabChange,
  onLogout,
  children,
}) => (
  <div className="min-h-screen bg-slate-100">
    <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col lg:flex-row">
      <aside className="w-full bg-slate-950 text-white lg:min-h-screen lg:w-72">
        <div className="flex items-center gap-3 border-b border-white/10 px-6 py-6">
          <img
            src={avatarUrl || '/default-avatar.png'}
            alt={userName}
            className="h-12 w-12 rounded-2xl object-cover ring-2 ring-[#f5a623]/40"
          />
          <div className="min-w-0">
            <p className="truncate font-semibold">{userName}</p>
            <p className="text-sm text-slate-400">{roleLabel}</p>
          </div>
        </div>

        <nav className="flex gap-2 overflow-x-auto px-4 py-4 lg:block lg:space-y-2 lg:overflow-visible">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.id === activeTab;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`flex min-w-max items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                  active
                    ? 'bg-[#f5a623] text-slate-950 shadow-lg'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="px-4 pb-4 lg:absolute lg:bottom-0 lg:w-72">
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-red-400/40 hover:bg-red-500/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-4 sm:px-6 lg:px-8 lg:py-8">
        <header className="mb-6 flex flex-col gap-4 rounded-3xl bg-white px-6 py-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-950">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          </div>
          <div className="flex items-center justify-end gap-3">
            <NotificationBell />
          </div>
        </header>

        <div className="space-y-6">{children}</div>
      </main>
    </div>
  </div>
);

export default DashboardLayout;

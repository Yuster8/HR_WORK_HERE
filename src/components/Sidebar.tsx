import React from 'react';
import { Bell, BarChart3, History, Users, Menu, X } from 'lucide-react';
import { ActiveView } from '../types/hr';

interface SidebarProps {
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
  alertCount: number;
  historyCount: number;
  mobileOpen: boolean;
  onToggleMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  alertCount,
  historyCount,
  mobileOpen,
  onToggleMobile,
}) => {
  const navItems: Array<{
    id: ActiveView;
    label: string;
    icon: React.ReactNode;
    badge?: number;
    badgeVariant?: 'danger' | 'neutral';
  }> = [
    {
      id: 'records',
      label: 'Employee Records',
      icon: <Users className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'alerts',
      label: 'Probation & Contract Alerts',
      icon: <Bell className="w-4 h-4 shrink-0" />,
      badge: alertCount,
      badgeVariant: 'danger',
    },
    {
      id: 'analytics',
      label: 'Workforce Analytics',
      icon: <BarChart3 className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'history',
      label: 'Change History',
      icon: <History className="w-4 h-4 shrink-0" />,
      badge: historyCount > 0 ? historyCount : undefined,
      badgeVariant: 'neutral',
    },
  ];

  const content = (
    <div className="flex flex-col h-full bg-[#132032] text-slate-100 select-none">
      {/* Brand Header */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-800/80 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white">HR Workbench</h1>
          <p className="text-xs text-slate-400 mt-0.5">Human Resources Management</p>
        </div>
        <button
          type="button"
          onClick={onToggleMobile}
          className="lg:hidden p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
          aria-label="Close navigation menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-5 space-y-1.5" aria-label="Primary Sidebar">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelectView(item.id);
                if (mobileOpen) onToggleMobile();
              }}
              className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg text-left text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/75 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-3 min-w-0">
                {item.icon}
                <span className="leading-snug">{item.label}</span>
              </span>
              {typeof item.badge === 'number' && item.badge > 0 && (
                <span
                  className={`shrink-0 px-2 py-0.5 text-xs font-semibold tabular-nums rounded ${
                    item.badgeVariant === 'danger'
                      ? 'bg-red-600 text-white'
                      : isActive
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Shortcuts & Local Storage Info */}
      <div className="px-5 py-4 border-t border-slate-800/80 space-y-3 text-xs text-slate-400">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span>Undo / Redo</span>
            <span className="font-mono text-[11px] text-slate-300">Ctrl+Z / Ctrl+Y</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Range Select</span>
            <span className="font-mono text-[11px] text-slate-300">Shift + Click</span>
          </div>
        </div>
        <div className="pt-2 border-t border-slate-800/60 leading-relaxed text-[11px] text-slate-400">
          <p>Data stored locally in your browser.</p>
          <p>Use Export / Import CSV for backup.</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-[250px] shrink-0 h-screen sticky top-0 border-r border-slate-800">
        {content}
      </aside>

      {/* Mobile Header Bar Trigger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 h-14 bg-[#132032] text-white px-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleMobile}
            className="p-2 -ml-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-800"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-base tracking-tight">HR Workbench</span>
        </div>
        {alertCount > 0 && (
          <button
            type="button"
            onClick={() => onSelectView('alerts')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-600 text-white text-xs font-semibold tabular-nums"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>{alertCount}</span>
          </button>
        )}
      </div>

      {/* Mobile Slide-Over Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-[1px]"
            onClick={onToggleMobile}
          />
          <div className="relative z-10 w-[260px] max-w-[85vw] h-full shadow-xl">{content}</div>
        </div>
      )}
    </>
  );
};

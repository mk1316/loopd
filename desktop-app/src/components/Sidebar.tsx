'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Calendar, PanelLeft, Settings as SettingsIcon } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Persist collapsed state in localStorage
  useEffect(() => {
    const stored = localStorage.getItem('sidebar-collapsed');
    if (stored) setCollapsed(stored === 'true');
  }, []);
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(collapsed));
  }, [collapsed]);

  const navItems = [
    {
      href: '/',
      label: 'Dashboard',
      icon: LayoutGrid,
    },
    {
      href: '/timeline',
      label: 'Timeline',
      icon: Calendar,
    },
    {
      href: '/settings',
      label: 'Settings',
      icon: SettingsIcon,
    },
  ];

  return (
    <aside
      className={`h-screen transition-all duration-200 bg-slate-900 border-r border-slate-800 flex flex-col py-8 px-2 ${collapsed ? 'w-16' : 'w-56'}`}
    >
      <div className={`flex items-center ${collapsed ? 'justify-center' : ''} mb-8`}> 
        <button
          className={`flex items-center justify-center h-10 w-10 rounded-md hover:bg-slate-800 transition-colors duration-200 text-slate-400 mr-2`}
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <PanelLeft className={`h-6 w-6 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`} />
        </button>
        {!collapsed && (
          <>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 mr-2">
              <LayoutGrid className="h-5 w-5 text-white" />
            </span>
            <span className="text-xl font-bold text-white">Loopd</span>
          </>
        )}
      </div>
      <nav className="flex flex-col gap-2 flex-1">
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200
                ${isActive ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
                ${collapsed ? 'justify-center px-0' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-5 w-5" />
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar; 
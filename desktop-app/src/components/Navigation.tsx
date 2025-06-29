'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/',
      label: 'Dashboard',
      description: 'Overview of current usage'
    },
    {
      href: '/timeline',
      label: 'Timeline',
      description: 'Chronological view of usage'
    }
  ];

  return (
    <nav className="mb-8">
      <div className="flex space-x-1 bg-slate-800 p-1 rounded-lg">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
                ${isActive 
                  ? 'bg-slate-600 text-white shadow-sm' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }
              `}
            >
              <div className="text-center">
                <div className="font-medium">{item.label}</div>
                <div className={`text-xs mt-1 ${isActive ? 'text-slate-200' : 'text-slate-400'}`}>
                  {item.description}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
} 
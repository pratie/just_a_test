// src/components/Sidebar.tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, MessageSquare, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Sidebar() {
  const pathname = usePathname();

  const navigation = [
    {
      name: 'My Projects',
      href: '/',
      icon: LayoutGrid,
    },
    {
      name: 'Mentions',
      href: '/mentions',
      icon: MessageSquare,
    },
  ];

  const settings = [
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
    },
  ];

  return (
    <div className="flex flex-col w-64 border-r bg-white">
      {/* Logo */}
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold text-orange-500">sneakyguy</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
              pathname === item.href 
                ? "bg-orange-50 text-orange-600" 
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.name}
          </Link>
        ))}
      </nav>

      {/* Settings */}
      <div className="p-4 border-t">
        {settings.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center px-3 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-100"
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.name}
          </Link>
        ))}
      </div>

      {/* Credits */}
      <div className="p-4 border-t bg-orange-50">
        <div className="space-y-2">
          <div className="text-sm text-gray-600">Credits:</div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>KEYWORDS</span>
              <span>25/25</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>PROJECTS</span>
              <span>5/5</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>MENTIONS</span>
              <span>1000/1000</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
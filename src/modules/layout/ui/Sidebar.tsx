"use client";

import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Image from "next/image";
import { cn } from "@/shared/lib/cn";
import { useSession } from "./AuthContext";
import { useCompanyInfo } from "./CompanyContext";
import { useSidebarNav } from "./useSidebarNav";
import { SidebarItem } from "./SidebarItem";
import { Avatar } from "@/shared/components/Avatar";
import { getRoleLabel } from "@/shared/lib/permissions";
import { useRolesConfig } from "@/shared/context/RolesConfigContext";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { fullName, role } = useSession();
  const { config } = useRolesConfig();
  const { name: companyName, logoUrl } = useCompanyInfo();
  const pathname = usePathname();
  const navItems = useSidebarNav(role, config);

  function isActive(href: string): boolean {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className='fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden'
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
          "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Company header */}
        <div className='flex items-center gap-3 border-b border-gray-200 dark:border-gray-800 px-5 py-5'>
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={companyName}
              width={55}
              height={55}
              className=' '
              style={{ width: 55, height: 55 }}
              priority
            />
          ) : (
            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-blue-600/25'>
              {companyName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className='min-w-0 flex-1'>
            <p className='truncate text-sm font-bold text-gray-900 dark:text-white'>
              {companyName}
            </p>
            <p className='text-xs text-gray-500 dark:text-gray-400'>
              Panel Administrativo
            </p>
          </div>
          <button
            onClick={onClose}
            className='rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-200 transition-colors lg:hidden'
          >
            <ChevronLeft className='h-5 w-5' />
          </button>
        </div>

        {/* Navigation */}
        <nav className='flex-1 space-y-1 overflow-y-auto px-3 py-4'>
          <p className='px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500'>
            Menu
          </p>
          {navItems.map((item) => (
            <SidebarItem
              key={item.area}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={isActive(item.href)}
              onClick={onClose}
            />
          ))}
        </nav>

        {/* User section */}
        <div className='border-t border-gray-200 dark:border-gray-800 px-4 py-4'>
          <div className='flex items-center gap-3'>
            <Avatar name={fullName} size='sm' />
            <div className='min-w-0 flex-1'>
              <p className='truncate text-sm font-medium text-gray-900 dark:text-white'>
                {fullName}
              </p>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                {getRoleLabel(role, config)}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

"use client";

import { usePathname } from "next/navigation";
import { LogOut, Moon, Sun, Menu } from "lucide-react";
import { useSession } from "./AuthContext";
import { useCompanyInfo } from "./CompanyContext";
import { useTheme } from "@/shared/lib/ThemeContext";
import { Avatar } from "@/shared/components/Avatar";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/empresa": "Empresa",
  "/dashboard/productos": "Productos",
  "/dashboard/facturacion": "Facturacion",
  "/dashboard/usuarios": "Usuarios",
  "/dashboard/sucursales": "Sucursales",
  "/dashboard/metricas": "Metricas",
  "/dashboard/configuracion": "Roles",
  "/dashboard/tienda": "Mi Tienda",
};

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  const base = Object.keys(PAGE_TITLES)
    .filter((k) => k !== "/dashboard")
    .find((k) => pathname.startsWith(k));
  return base ? PAGE_TITLES[base] : "Dashboard";
}

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { fullName, logout } = useSession();
  const { name: companyName } = useCompanyInfo();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className='sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl px-4 sm:px-6 py-3'>
      <div className='flex items-center gap-3'>
        <button
          onClick={onMenuClick}
          className='rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors lg:hidden'
        >
          <Menu className='h-5 w-5' />
        </button>
        <div>
          <h1 className='text-lg font-bold text-gray-900 dark:text-white'>
            {title}
          </h1>
          <p className='text-xs text-gray-500 dark:text-gray-400 hidden sm:block'>
            {companyName}
          </p>
        </div>
      </div>

      <div className='flex items-center gap-2'>
        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          className='rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors'
          title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
        >
          {theme === "dark" ? (
            <Sun className='h-5 w-5' />
          ) : (
            <Moon className='h-5 w-5' />
          )}
        </button>

        {/* Separator */}
        <div className='h-6 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block' />

        {/* User info */}
        <div className='flex items-center gap-2'>
          <Avatar name={fullName} size='sm' />
          <span className='hidden text-sm font-medium text-gray-700 dark:text-gray-200 sm:block'>
            {fullName}
          </span>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className='rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors'
          title='Cerrar sesion'
        >
          <LogOut className='h-4 w-4' />
        </button>
      </div>
    </header>
  );
}

"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/shared/lib/ThemeContext";
import { AuthPage } from "@/modules/auth/ui/AuthPage";
import { getRolesConfigAction } from "@/modules/roles/infrastructure/roles.actions";
import { getHomePath } from "@/shared/lib/permissions";
import type { SessionUser } from "@/modules/auth/domain/auth.types";

function getHasSession() {
  return !!(sessionStorage.getItem("factus_token") && sessionStorage.getItem("factus_user"));
}

function subscribeToStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export default function Home() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const hasSession = useSyncExternalStore(subscribeToStorage, getHasSession, () => false);

  useEffect(() => {
    if (hasSession) {
      const raw = sessionStorage.getItem("factus_user");
      const user = raw ? (JSON.parse(raw) as SessionUser) : null;
      if (user) {
        getRolesConfigAction().then((config) => {
          router.replace(getHomePath(user.role, config));
        });
      } else {
        router.replace("/dashboard");
      }
    }
  }, [hasSession, router]);

  if (hasSession) return null;

  return (
    <main className="relative min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-950">
      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 rounded-lg p-2 text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
        title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
      >
        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">RETO FACTUS</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Facturacion Electronica Colombia
          </p>
        </div>

        <AuthPage />
      </div>
    </main>
  );
}

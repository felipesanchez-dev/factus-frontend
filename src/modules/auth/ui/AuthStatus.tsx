"use client";

import { CheckCircle, Clock, Key, Shield, User, LogOut } from "lucide-react";
import { Card } from "@/shared/components/Card";
import { Button } from "@/shared/components/Button";
import type { TokenInfo, SessionUser } from "../domain/auth.types";

interface AuthStatusProps {
  tokenData: TokenInfo;
  user: SessionUser;
  onLogout: () => void;
}

export function AuthStatus({ tokenData, user, onLogout }: AuthStatusProps) {
  const truncatedToken =
    tokenData.accessToken.substring(0, 25) + "..." +
    tokenData.accessToken.substring(tokenData.accessToken.length - 8);

  const truncatedRefresh =
    tokenData.refreshToken.substring(0, 15) + "...";

  const expiresInMs = tokenData.expiresAt - Date.now();
  const expiresInMinutes = Math.max(0, Math.round(expiresInMs / 60_000));

  return (
    <div className="space-y-4">
      <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-300">
              Sesion Activa
            </h3>
          </div>
          <Button variant="ghost" onClick={onLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
            <LogOut className="h-4 w-4" />
            Cerrar Sesion
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3 rounded-lg bg-white dark:bg-gray-800 p-3 border border-green-100 dark:border-gray-700">
            <User className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Usuario
              </p>
              <p className="text-sm text-gray-900 dark:text-gray-100">
                {user.username} <span className="text-xs text-gray-500">({user.role})</span>
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg bg-white dark:bg-gray-800 p-3 border border-green-100 dark:border-gray-700">
            <Shield className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Token Type
              </p>
              <p className="text-sm text-gray-900 dark:text-gray-100 font-mono">
                {tokenData.tokenType}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg bg-white dark:bg-gray-800 p-3 border border-green-100 dark:border-gray-700">
            <Key className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Access Token
              </p>
              <p className="text-sm text-gray-900 dark:text-gray-100 font-mono break-all">
                {truncatedToken}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg bg-white dark:bg-gray-800 p-3 border border-green-100 dark:border-gray-700">
            <Key className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Refresh Token
              </p>
              <p className="text-sm text-gray-900 dark:text-gray-100 font-mono break-all">
                {truncatedRefresh}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg bg-white dark:bg-gray-800 p-3 border border-green-100 dark:border-gray-700">
            <Clock className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Expira en
              </p>
              <p className="text-sm text-gray-900 dark:text-gray-100">
                ~{expiresInMinutes} minutos
                <span className="text-xs text-gray-500 ml-2">(auto-refresh cada 45 min)</span>
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

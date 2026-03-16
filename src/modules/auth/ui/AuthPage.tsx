"use client";

import { useAuth } from "./useAuth";
import { LoginForm } from "./LoginForm";
import { AuthStatus } from "./AuthStatus";

export function AuthPage() {
  const { tokenData, user, loading, error, isAuthenticated, login, logout } =
    useAuth();

  async function handleLogin(username: string, password: string) {
    await login({ username, password });
  }

  if (isAuthenticated && tokenData && user) {
    return <AuthStatus tokenData={tokenData} user={user} onLogout={logout} />;
  }

  return (
    <LoginForm onLogin={handleLogin} loading={loading} error={error} />
  );
}

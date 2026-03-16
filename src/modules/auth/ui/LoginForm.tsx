"use client";

import { FormEvent, useState } from "react";
import { LogIn, AlertCircle } from "lucide-react";
import { Card } from "@/shared/components/Card";
import { Input } from "@/shared/components/Input";
import { Button } from "@/shared/components/Button";

interface LoginFormProps {
  onLogin: (username: string, password: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function LoginForm({ onLogin, loading, error }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await onLogin(username, password);
  }

  return (
    <Card>
      <div className='mb-6'>
        <h2 className='text-xl font-bold text-gray-900 dark:text-white'>
          Iniciar Sesion
        </h2>
        <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
          Ingresa tus credenciales para acceder al sistema.
        </p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-4'>
        <Input
          label='Usuario'
          placeholder='Tu nombre de usuario'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoComplete='username'
        />

        <Input
          label='Contraseña'
          type='password'
          placeholder='Tu Contraseña'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete='current-password'
        />

        {error && (
          <div className='flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3'>
            <AlertCircle className='h-4 w-4 text-red-500 shrink-0' />
            <p className='text-sm text-red-700 dark:text-red-400'>{error}</p>
          </div>
        )}

        <Button type='submit' loading={loading} className='w-full'>
          <LogIn className='h-4 w-4' />
          Iniciar Sesion
        </Button>
      </form>
    </Card>
  );
}


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '../lib/supabase';
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowRight, Egg, UserPlus } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

import { AppSettings } from '../types';

interface LoginFormProps {
  onLogin: () => void;
  settings: AppSettings;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, settings }) => {
  console.log('LoginForm Branding settings:', { appName: settings.appName, hasLogo: !!settings.appLogo });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegister) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        alert('Cadastro realizado! Verifique seu e-mail ou faça login (se o e-mail estiver confirmado).');
        setIsRegister(false);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        onLogin();
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-screen px-4 items-center justify-center relative overflow-hidden">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-[400px] z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="h-20 w-20 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 mb-4 overflow-hidden border-4 border-card">
            {settings.appLogo ? (
              <img src={settings.appLogo} alt="Logo" className="h-full w-full object-cover" />
            ) : (
              <Egg className="text-primary-foreground h-12 w-12 fill-current" />
            )}
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-foreground uppercase">
            {settings.appName}
          </h1>
          <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
            Gestão inteligente de vendas
          </p>
        </div>

        <Card className="border shadow-xl bg-card">
          <CardHeader>
            <CardTitle className="text-xl">{isRegister ? 'Criar Conta' : 'Login'}</CardTitle>
            <CardDescription>
              {isRegister ? 'Cadastre-se para começar' : 'Entre para gerenciar suas vendas'}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-xs font-bold">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    className="pl-10"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  {!isRegister && (
                    <button type="button" className="text-xs font-medium text-primary hover:underline">
                      Esqueceu a senha?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="pl-10 pr-10"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full group" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {isRegister ? 'Cadastrar' : 'Entrar'}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full text-xs font-bold uppercase tracking-widest text-muted-foreground"
                onClick={() => setIsRegister(!isRegister)}
              >
                {isRegister ? (
                  <>Já tem uma conta? <span className="text-primary ml-1">Entrar</span></>
                ) : (
                  <>Ainda não tem conta? <span className="text-primary ml-1">Cadastrar</span></>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground opacity-60">
            v1.2.0 • 2025 {settings.appName}
          </p>
        </div>
      </div>

      {/* Decorative blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[60%] aspect-square rounded-full bg-primary/10 blur-[100px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[60%] aspect-square rounded-full bg-primary/10 blur-[100px] pointer-events-none -z-10"></div>
    </div>
  );
};

export default LoginForm;


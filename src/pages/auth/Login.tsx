import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "./AuthLayout";
import { Button, Input } from "@/components/ui";
import { useAuthStore } from "@/store/authStore";
import { useBrandStore } from "@/store/brandStore";
import { Mail, Lock, Sparkles } from "lucide-react";

export function Login() {
  const login = useAuthStore((s) => s.login);
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const onboardingComplete = useBrandStore((s) => s.profile.onboardingComplete);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors: typeof errors = {};
    if (!email.trim()) nextErrors.email = "Informe seu e-mail para continuar.";
    else if (!/\S+@\S+\.\S+/.test(email)) nextErrors.email = "Informe um e-mail válido.";
    if (!password) nextErrors.password = "Informe sua senha para continuar.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      await login(email, password);
      navigate(onboardingComplete ? "/" : "/onboarding");
    } catch {
      setErrors({ form: "Não foi possível entrar. Tente novamente." });
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      navigate(onboardingComplete ? "/" : "/onboarding");
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <AuthLayout>
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-balance mb-3">
        Transforme ideias em conteúdos que geram resultados
      </h1>
      <p className="text-sm text-ink-300 mb-8 flex items-center gap-2">
        <Sparkles className="size-4 shrink-0" />
        Crie conteúdos profissionais para o Instagram com Inteligência Artificial.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm">
        <Input
          label="E-mail"
          type="email"
          placeholder="voce@email.com"
          icon={<Mail className="size-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          autoComplete="email"
        />
        <Input
          label="Senha"
          type="password"
          placeholder="••••••••"
          icon={<Lock className="size-4" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          autoComplete="current-password"
        />
        {errors.form && <p className="text-sm text-danger">{errors.form}</p>}

        <div className="flex justify-end -mt-1">
          <Link to="/forgot-password" className="text-xs text-ink-300 hover:text-white transition-colors">
            Esqueci minha senha
          </Link>
        </div>

        <Button type="submit" size="lg" loading={loading} className="mt-2">
          Entrar
        </Button>

        <div className="flex items-center gap-3 my-1">
          <div className="h-px flex-1 bg-ink-700" />
          <span className="text-xs text-ink-400">ou</span>
          <div className="h-px flex-1 bg-ink-700" />
        </div>

        <Button type="button" variant="outline" size="lg" loading={googleLoading} onClick={handleGoogle} icon={<GoogleIcon />}>
          Continuar com Google
        </Button>
      </form>

      <p className="text-sm text-ink-300 mt-8">
        Ainda não tem conta?{" "}
        <Link to="/register" className="text-white font-medium hover:underline">
          Criar conta
        </Link>
      </p>
    </AuthLayout>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor">
      <path d="M12 10.2v3.9h5.5c-.24 1.3-1.7 3.8-5.5 3.8-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.9 1.5l2.7-2.6C16.9 3 14.7 2 12 2 6.9 2 2.7 6.2 2.7 11.3S6.9 20.6 12 20.6c6.9 0 9.6-4.8 9.6-7.3 0-.5 0-.9-.1-1.2H12z"/>
    </svg>
  );
}

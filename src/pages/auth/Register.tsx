import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "./AuthLayout";
import { Button, Input } from "@/components/ui";
import { useAuthStore } from "@/store/authStore";
import { User, Mail, Lock } from "lucide-react";

export function Register() {
  const register = useAuthStore((s) => s.register);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors: typeof errors = {};
    if (!name.trim()) nextErrors.name = "Informe seu nome para continuar.";
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) nextErrors.email = "Informe um e-mail válido.";
    if (password.length < 6) nextErrors.password = "A senha precisa ter pelo menos 6 caracteres.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      await register(name, email, password);
      navigate("/onboarding");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-balance mb-3">Crie sua conta</h1>
      <p className="text-sm text-ink-300 mb-8">
        Leva menos de um minuto. Depois é só personalizar sua marca e começar a criar.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm">
        <Input
          label="Nome"
          placeholder="Seu nome"
          icon={<User className="size-4" />}
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          autoComplete="name"
        />
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
          placeholder="Mínimo de 6 caracteres"
          icon={<Lock className="size-4" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          autoComplete="new-password"
        />

        <Button type="submit" size="lg" loading={loading} className="mt-2">
          Criar conta
        </Button>
      </form>

      <p className="text-sm text-ink-300 mt-8">
        Já tem uma conta?{" "}
        <Link to="/login" className="text-white font-medium hover:underline">
          Entrar
        </Link>
      </p>
    </AuthLayout>
  );
}

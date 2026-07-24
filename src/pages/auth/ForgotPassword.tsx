import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { AuthLayout } from "./AuthLayout";
import { Button, Input } from "@/components/ui";
import { Mail, CheckCircle2 } from "lucide-react";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError("Informe um e-mail válido.");
      return;
    }
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);
    setSent(true);
  }

  return (
    <AuthLayout>
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-balance mb-3">Recuperar senha</h1>
      <p className="text-sm text-ink-300 mb-8">Informe o e-mail da sua conta para receber o link de redefinição.</p>

      {sent ? (
        <div className="flex items-start gap-3 max-w-sm rounded-xl border border-success/30 bg-success/10 p-4">
          <CheckCircle2 className="size-5 text-success shrink-0 mt-0.5" />
          <p className="text-sm text-ink-100">
            Se existir uma conta com o e-mail <span className="text-white font-medium">{email}</span>, enviamos as instruções de recuperação.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm">
          <Input
            label="E-mail"
            type="email"
            placeholder="voce@email.com"
            icon={<Mail className="size-4" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
          />
          <Button type="submit" size="lg" loading={loading} className="mt-2">
            Enviar link de recuperação
          </Button>
        </form>
      )}

      <p className="text-sm text-ink-300 mt-8">
        Lembrou sua senha?{" "}
        <Link to="/login" className="text-white font-medium hover:underline">
          Voltar para o login
        </Link>
      </p>
    </AuthLayout>
  );
}

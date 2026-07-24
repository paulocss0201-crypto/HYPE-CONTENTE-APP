import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, Input, Select, Switch, Card, Modal, ProgressBar } from "@/components/ui";
import { useAuthStore } from "@/store/authStore";
import { useContentStore, projectsThisMonth } from "@/store/contentStore";
import { useBrandStore } from "@/store/brandStore";
import { useUiStore } from "@/store/uiStore";
import { PLAN_LABEL } from "@/lib/plans";
import { Save, LogOut, Trash2, User, Bell, Globe, CreditCard } from "lucide-react";

const PLAN_LIMITS: Record<string, number> = { gratuito: 5, pro: 100, premium: 999999 };

export function Settings() {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const logout = useAuthStore((s) => s.logout);
  const projects = useContentStore((s) => s.projects);
  const resetBrand = useBrandStore((s) => s.reset);
  const pushToast = useUiStore((s) => s.pushToast);
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [language, setLanguage] = useState("pt-BR");
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const used = projectsThisMonth(projects);
  const limit = PLAN_LIMITS[user?.plan ?? "gratuito"];
  const usagePercent = limit > 10000 ? 4 : Math.min(100, (used / limit) * 100);

  function handleSaveProfile() {
    updateUser({ name, email });
    pushToast("Perfil atualizado", "success");
  }

  function handleChangePassword() {
    if (!currentPassword || !newPassword) {
      pushToast("Preencha a senha atual e a nova senha.", "error");
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    pushToast("Senha alterada com sucesso", "success");
  }

  function handleDeleteAccount() {
    resetBrand();
    logout();
    navigate("/login");
  }

  return (
    <div className="px-4 sm:px-8 py-6 sm:py-8 max-w-3xl mx-auto">
      <PageHeader title="Configurações" description="Gerencie sua conta, preferências e assinatura." />

      <div className="flex flex-col gap-6">
        <Card className="p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <User className="size-4 text-ink-300" />
            <p className="text-sm font-semibold">Perfil</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-full bg-ink-700 border border-ink-600 flex items-center justify-center text-xl font-semibold shrink-0">
              {name.charAt(0).toUpperCase() || "U"}
            </div>
            <Button variant="outline" size="sm" onClick={() => pushToast("Selecione uma imagem para continuar (simulado)", "default")}>
              Alterar foto
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Nome" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Button icon={<Save className="size-4" />} onClick={handleSaveProfile} className="self-start">
            Salvar perfil
          </Button>
        </Card>

        <Card className="p-5 flex flex-col gap-4">
          <p className="text-sm font-semibold">Senha</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Senha atual" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            <Input label="Nova senha" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
          <Button variant="secondary" onClick={handleChangePassword} className="self-start">
            Alterar senha
          </Button>
        </Card>

        <Card className="p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Globe className="size-4 text-ink-300" />
            <p className="text-sm font-semibold">Idioma e notificações</p>
          </div>
          <Select label="Idioma" value={language} onChange={(e) => setLanguage(e.target.value)} className="max-w-xs">
            <option value="pt-BR">Português (Brasil)</option>
            <option value="en-US">English (US)</option>
            <option value="es-ES">Español</option>
          </Select>
          <div className="flex items-center gap-2 mt-1">
            <Bell className="size-4 text-ink-300" />
            <p className="text-sm font-medium">Notificações</p>
          </div>
          <Switch checked={notifEmail} onChange={setNotifEmail} label="Notificações por e-mail" description="Novidades, lembretes e resumo semanal" />
          <Switch checked={notifPush} onChange={setNotifPush} label="Notificações push" description="Alertas de publicações agendadas" />
        </Card>

        <Card className="p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <CreditCard className="size-4 text-ink-300" />
            <p className="text-sm font-semibold">Assinatura e uso</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-ink-100">
              Plano atual: <span className="font-medium text-white">{PLAN_LABEL[user?.plan ?? "gratuito"]}</span>
            </p>
            <Button size="sm" variant="outline" onClick={() => navigate("/plans")}>
              Gerenciar assinatura
            </Button>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs text-ink-300">Uso mensal de conteúdos</p>
              <p className="text-xs text-ink-300">
                {used} / {limit > 10000 ? "ilimitado" : limit}
              </p>
            </div>
            <ProgressBar value={usagePercent} />
          </div>
        </Card>

        <Card className="p-5 flex flex-col gap-4 border-danger/30">
          <p className="text-sm font-semibold text-danger">Zona de risco</p>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-sm font-medium">Excluir conta</p>
              <p className="text-xs text-ink-300">Essa ação remove permanentemente seus dados e conteúdos.</p>
            </div>
            <Button variant="danger" icon={<Trash2 className="size-4" />} onClick={() => setDeleteOpen(true)}>
              Excluir conta
            </Button>
          </div>
          <div className="h-px bg-ink-700" />
          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm font-medium">Sair do aplicativo</p>
            <Button
              variant="outline"
              icon={<LogOut className="size-4" />}
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              Sair
            </Button>
          </div>
        </Card>
      </div>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Excluir conta">
        <p className="text-sm text-ink-100 mb-5">
          Tem certeza de que deseja excluir sua conta? Todos os seus projetos, favoritos e configurações serão removidos permanentemente. Essa ação não pode ser desfeita.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeleteAccount}>
            Excluir permanentemente
          </Button>
        </div>
      </Modal>
    </div>
  );
}

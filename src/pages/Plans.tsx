import { PageHeader } from "@/components/layout/PageHeader";
import { Button, Card } from "@/components/ui";
import { PLANS } from "@/lib/plans";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import { Check, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Plans() {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const pushToast = useUiStore((s) => s.pushToast);

  function handleSubscribe(plan: (typeof PLANS)[number]) {
    updateUser({ plan: plan.key });
    pushToast(`Plano ${plan.name} ativado`, "success");
  }

  return (
    <div className="px-4 sm:px-8 py-6 sm:py-8 max-w-6xl mx-auto">
      <PageHeader title="Planos e assinatura" description="Escolha o plano ideal para o seu momento de criação de conteúdo." />

      <div className="grid md:grid-cols-3 gap-5">
        {PLANS.map((plan) => {
          const isCurrent = user?.plan === plan.key;
          return (
            <Card
              key={plan.key}
              className={cn("p-6 flex flex-col gap-5 relative", plan.highlight && "border-white/50 shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_24px_60px_-20px_rgba(255,255,255,0.15)]")}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white text-ink-950 text-xs font-semibold px-3 py-1 rounded-full">
                  <Star className="size-3 fill-ink-950" /> Mais escolhido
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-ink-300 mb-1">{plan.name}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-semibold">{plan.price}</span>
                  <span className="text-sm text-ink-300">{plan.period}</span>
                </div>
                <p className="text-xs text-ink-300 mt-2">{plan.description}</p>
              </div>

              <ul className="flex flex-col gap-2.5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-ink-100">
                    <Check className="size-4 text-white shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button variant={isCurrent ? "secondary" : plan.highlight ? "primary" : "outline"} disabled={isCurrent} onClick={() => handleSubscribe(plan)}>
                {isCurrent ? "Plano atual" : plan.cta}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

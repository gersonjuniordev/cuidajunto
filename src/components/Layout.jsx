import React, { useEffect, useMemo, useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, Calendar, CheckSquare, Pill, FileText, 
  Baby, Menu, X, LogOut, MessageCircle, User, ShieldCheck
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import NotificationBell from "./notifications/NotificationBell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/api/client";

const navItems = [
  { path: "/Dashboard", icon: LayoutDashboard, label: "Início" },
  { path: "/Agenda", icon: Calendar, label: "Agenda" },
  { path: "/Tarefas", icon: CheckSquare, label: "Tarefas" },
  { path: "/Medicamentos", icon: Pill, label: "Medicamentos" },
  { path: "/Documentos", icon: FileText, label: "Documentos" },
  { path: "/Criancas", icon: Baby, label: "Crianças" },
  { path: "/Chat", icon: MessageCircle, label: "Chat" },
  { path: "/Perfil", icon: User, label: "Perfil" },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [plansOpen, setPlansOpen] = useState(false);
  const { logout, user, refresh } = useAuth();

  const billing = user?.billing;
  const accessBlocked = !!billing && !billing.access_active;

  useEffect(() => {
    const trialEndsAt = billing?.trial_ends_at;
    if (!trialEndsAt) return;
    if (!billing?.trial_active) return;

    const endMs = new Date(trialEndsAt).getTime();
    const msUntil = endMs - Date.now();
    if (!Number.isFinite(msUntil) || msUntil <= 0) {
      refresh().catch(() => {});
      return;
    }

    // Evita timeouts gigantescos; agenda um refresh próximo do fim.
    const timeoutMs = Math.min(msUntil, 60 * 60 * 1000);
    const t = setTimeout(() => refresh().catch(() => {}), timeoutMs);
    return () => clearTimeout(t);
  }, [billing?.trial_ends_at, billing?.trial_active, refresh, user?.id]);

  const trialBadge = (() => {
    if (!billing) return null;
    if (billing.trial_active) {
      return `Teste grátis: ${billing.trial_days_left} dia(s)`;
    }
    if (billing.access_active) return `Plano ativo: ${billing.plan}`;
    return `Assinatura necessária`;
  })();

  const trialSubtitle = (() => {
    if (!billing) return null;
    if (billing.trial_active && billing.trial_ends_at) {
      try {
        const d = new Date(billing.trial_ends_at);
        return `Termina em ${d.toLocaleDateString("pt-BR")}`;
      } catch {
        return null;
      }
    }
    if (billing.access_active && billing.subscription_ends_at) {
      try {
        const d = new Date(billing.subscription_ends_at);
        return `Renova em ${d.toLocaleDateString("pt-BR")}`;
      } catch {
        return null;
      }
    }
    return null;
  })();

  const { data: billingPlans } = useQuery({
    queryKey: ["billing_plans"],
    queryFn: () => api.billing.plans(),
    enabled: plansOpen,
  });

  const { data: billingStatus } = useQuery({
    queryKey: ["billing_status"],
    queryFn: () => api.billing.status(),
    enabled: plansOpen,
  });

  const subscribeMutation = useMutation({
    mutationFn: (planId) => api.billing.createSubscription(planId),
    onSuccess: (res) => {
      const checkoutUrl = res?.checkout_url || res?.sandbox_checkout_url;
      if (checkoutUrl) window.location.href = checkoutUrl;
    },
  });

  const currentPlanLabel = useMemo(() => {
    if (!billingStatus && billing) return billing.plan || null;
    if (!billingStatus) return null;
    if (billingStatus.trial_active) return "trial";
    if (billingStatus.access_active) return billingStatus.plan;
    return null;
  }, [billingStatus, billing]);

  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`
        :root {
          --color-teal: #0d9488;
          --color-teal-light: #ccfbf1;
          --color-lavender: #8b5cf6;
          --color-coral: #f97316;
        }
      `}</style>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 px-4 h-14 flex items-center justify-between">
        <button onClick={() => setMobileOpen(true)} className="p-2 -ml-2">
          <Menu className="w-5 h-5 text-slate-700" />
        </button>
        <div className="flex items-center gap-2">
          <img src="/logonova.jpeg" alt="CuidaJunto" className="w-7 h-7 rounded-lg object-cover" />
          <span className="text-base font-semibold text-teal-700 tracking-tight">CuidaJunto</span>
        </div>
        <NotificationBell />
      </header>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/30" onClick={() => setMobileOpen(false)}>
          <nav 
            className="w-64 h-full bg-white shadow-xl p-6 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <img src="/logonova.jpeg" alt="CuidaJunto" className="w-7 h-7 rounded-lg object-cover" />
                <span className="text-lg font-bold text-teal-700">CuidaJunto</span>
              </div>
              <button onClick={() => setMobileOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="flex-1 space-y-1">
              {navItems.map(({ path, icon: Icon, label }) => {
                const active = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? "bg-teal-50 text-teal-700"
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className={`w-[18px] h-[18px] ${active ? "text-teal-600" : ""}`} />
                    {label}
                  </Link>
                );
              })}
            </div>
            <Button
              variant="ghost"
              className="justify-start text-slate-400 hover:text-red-500 mt-4"
              onClick={() => logout()}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </nav>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 bottom-0 w-60 bg-white border-r border-slate-200 flex-col z-40">
        <div className="p-6 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <img src="/logonova.jpeg" alt="CuidaJunto" className="w-10 h-10 rounded-xl object-cover" />
                <div>
                  <h1 className="text-xl font-bold text-teal-700 tracking-tight">CuidaJunto</h1>
                  <p className="text-xs text-slate-400 mt-0.5">Agenda Familiar Compartilhada</p>
                </div>
              </div>
            </div>
            <NotificationBell />
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ path, icon: Icon, label }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-teal-50 text-teal-700"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Icon className={`w-[18px] h-[18px] ${active ? "text-teal-600" : ""}`} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-slate-100">
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-400 hover:text-red-500"
            onClick={() => logout()}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-60 pt-14 lg:pt-0 min-h-screen">
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          {billing ? (
            <div className="mb-6">
              <Card className="border-teal-200/60 bg-teal-50">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-teal-100 text-teal-800 border border-teal-200">
                        {trialBadge}
                      </Badge>
                    </div>
                    {trialSubtitle ? (
                      <p className="text-sm text-teal-800/90 mt-1">{trialSubtitle}</p>
                    ) : null}
                  </div>
                  <Button
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                    variant="default"
                    onClick={() => setPlansOpen(true)}
                  >
                    Ver planos
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : null}
          {accessBlocked ? (
            <Card className="border-slate-100 bg-white shadow-sm">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-teal-700" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-base font-semibold text-slate-900">
                      {billing?.plan === "trial" ? "Seu teste grátis expirou" : "Assinatura necessária"}
                    </div>
                    <div className="text-sm text-slate-500 mt-1">
                      {billing?.plan === "trial"
                        ? "Para continuar usando o CuidaJunto, contrate um dos planos abaixo."
                        : "Ative um plano para liberar o acesso ao sistema."}
                    </div>
                    {billing?.trial_ends_at ? (
                      <div className="text-xs text-slate-400 mt-2">
                        Expirou em{" "}
                        {new Date(billing.trial_ends_at).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-end">
                  <Button
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                    onClick={() => setPlansOpen(true)}
                  >
                    Contratar plano
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Outlet />
          )}
        </div>
      </main>

      {/* Plans modal */}
      <Dialog open={plansOpen} onOpenChange={setPlansOpen}>
        <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Planos e assinatura</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Card className="border-slate-100 bg-slate-50">
              <CardContent className="p-4">
                <div className="text-sm text-slate-600">
                  {billingStatus?.trial_active
                    ? `Você está em teste grátis. Termina em ${billingStatus.trial_days_left} dia(s).`
                    : billingStatus?.access_active
                      ? `Plano ativo: ${billingStatus.plan}`
                      : "Você não possui acesso ativo. Assine para liberar recursos."}
                </div>
                {billingStatus?.trial_ends_at ? (
                  <div className="text-xs text-slate-500 mt-1">
                    Termina em{" "}
                    {new Date(billingStatus.trial_ends_at).toLocaleDateString("pt-BR")}
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <div className="grid gap-3 sm:grid-cols-3">
              {(billingPlans?.plans || []).map((p) => {
                const isTrial = currentPlanLabel === "trial";
                const isActive =
                  billingStatus?.access_active &&
                  billingStatus?.plan &&
                  billingStatus.plan === p.id;

                const label =
                  p.id === "monthly"
                    ? "Mensal"
                    : p.id === "quarterly"
                      ? "Trimestral"
                      : p.id === "yearly"
                        ? "Anual"
                        : p.id;

                const amountBRL = (Number(p.amount) || 0).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                });

                const btnDisabled = subscribeMutation.isPending || isActive;
                const ctaText = isActive ? "Plano ativo" : `Assinar ${label}`;

                return (
                  <Card
                    key={p.id}
                    className={`border-slate-100 shadow-sm ${p.id === "monthly" ? "bg-white" : ""} ${
                      p.id === "quarterly" ? "border-teal-100" : ""
                    }`}
                  >
                    <CardContent className="p-5 space-y-2">
                      <div className="font-semibold text-slate-900">{label}</div>
                      <div className="text-3xl font-extrabold text-slate-900">{amountBRL}</div>
                      <div className="text-xs text-slate-500">
                        {p.id === "monthly" ? "por mês" : p.id === "quarterly" ? "a cada 3 meses" : "por ano"}
                      </div>
                      <Button
                        className={`w-full ${
                          p.id === "monthly"
                            ? "bg-teal-600 hover:bg-teal-700"
                            : p.id === "quarterly"
                              ? "bg-teal-600 hover:bg-teal-700"
                              : "bg-slate-900 hover:bg-slate-800"
                        } text-white`}
                        onClick={() => subscribeMutation.mutate(p.id)}
                        disabled={btnDisabled}
                      >
                        {subscribeMutation.isPending ? "Processando..." : ctaText}
                      </Button>
                      {isTrial && p.id === billingStatus?.plan ? (
                        <div className="text-[11px] text-slate-500">Atualiza após o trial.</div>
                      ) : null}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                className="border-slate-200"
                onClick={async () => {
                  await api.billing.refresh();
                  await refresh();
                }}
              >
                Atualizar status
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Calendar,
  Check,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Users,
  Bot,
  Heart,
  ArrowRight,
} from "lucide-react";

function SectionTitle({ icon: Icon, title, subtitle }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center">
          <Icon className="w-5 h-5 text-teal-700" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      </div>
      {subtitle ? <p className="text-sm text-slate-500">{subtitle}</p> : null}
    </div>
  );
}

function PainCard({ title, subtitle }) {
  return (
    <Card className="p-4 rounded-3xl border border-slate-100 shadow-sm bg-white">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center">
          <Heart className="w-5 h-5 text-teal-700" />
        </div>
        <div>
          <div className="font-semibold text-slate-900">{title}</div>
          {subtitle ? <div className="text-xs text-slate-500 mt-0.5">{subtitle}</div> : null}
        </div>
      </div>
    </Card>
  );
}

function PricingCard() {
  const navigate = useNavigate();
  return (
    <Card className="rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-5 bg-gradient-to-r from-teal-700 to-amber-500 text-white">
        <div className="text-xs font-semibold bg-white/15 inline-flex px-3 py-1 rounded-full">
          Experimente grátis por 3 dias
        </div>
        <div className="mt-3 flex items-end gap-2">
          <div className="text-sm font-semibold">Plano Mensal</div>
          <div className="text-3xl font-extrabold leading-none">R$ 19,90</div>
        </div>
        <div className="text-xs text-white/90 mt-1">Cancelamento quando quiser</div>
      </div>

      <div className="p-5 space-y-3 bg-white">
        <Button
          type="button"
          className="w-full bg-teal-600 hover:bg-teal-700 text-white shadow"
          onClick={() => navigate("/register")}
        >
          Comece Agora!
          <ArrowRight className="w-4 h-4" />
        </Button>
        <div className="text-center text-xs text-slate-500">Cancele quando quiser</div>
      </div>
    </Card>
  );
}

export default function LandingV3() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logonova.jpeg" alt="CuidaJunto" className="w-9 h-9 rounded-xl object-cover" />
            <div className="leading-tight">
              <div className="font-bold text-slate-900">CuidaJunto</div>
              <div className="text-xs text-slate-500">Agenda familiar compartilhada</div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              asChild
              type="button"
              variant="outline"
              className="border-teal-200 text-teal-700 hover:bg-teal-50 hidden sm:inline-flex"
            >
              <Link to="/login">Login</Link>
            </Button>
            <Button
              asChild
              type="button"
              className="bg-teal-600 hover:bg-teal-700 text-white shadow hidden sm:inline-flex"
            >
              <Link to="/register">Criar conta</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-700 via-purple-600 to-orange-500" />
        <div className="absolute -top-28 -left-28 w-72 h-72 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-28 -right-28 w-72 h-72 rounded-full bg-black/10 blur-2xl" />

        <div className="relative max-w-6xl mx-auto px-4 pt-10 pb-6">
          <div className="grid gap-5 lg:grid-cols-2 lg:items-center">
            <div className="text-white space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold">
                <Sparkles className="w-4 h-4" />
                Sem estresse, rotina alinhada e comunicação clara
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight">
                Organize a rotina do seu filho sem estresse
              </h1>
              <p className="text-sm sm:text-base text-white/90 max-w-md">
                Melhor a comunicação entre os responsáveis e evite esquecimentos.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  asChild
                  type="button"
                  className="bg-teal-400 hover:bg-teal-300 text-teal-950 font-semibold"
                >
                  <Link to="/register">Testar Grátis por 3 Dias</Link>
                </Button>
                <Button
                  asChild
                  type="button"
                  variant="outline"
                  className="border-white/40 text-white hover:bg-white/15 bg-transparent"
                >
                  <Link to="#como-funciona">Ver como funciona</Link>
                </Button>
              </div>

              {/* Mock ilustrativo */}
              <div className="mt-3 sm:mt-6">
                <Card className="bg-white/10 border border-white/15 text-white rounded-3xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold">Assistente Inteligente</div>
                      <div className="text-xs text-white/80 mt-0.5">
                        Sugestões de atividades e alertas do dia a dia.
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Price */}
            <div className="lg:justify-self-end">
              <div className="translate-y-0 sm:translate-y-2">
                <PricingCard />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain list */}
      <section className="max-w-6xl mx-auto px-4 pt-8 pb-5">
        <div className="text-center space-y-2 mb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold">
            <Heart className="w-4 h-4" />
            Você já passou por isso?
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Mais organização, menos conflitos</h2>
          <p className="text-sm text-slate-500">A rotina melhora quando cada responsável vê a mesma história.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <PainCard title="Esquecendo coisas" subtitle="Tarefas e eventos somem no dia a dia" />
          <PainCard title="Falta de comunicação" subtitle="Informações não ficam registradas" />
          <PainCard title="Rotina bagunçada" subtitle="A criança não tem previsibilidade" />
          <PainCard title="Mudança constante" subtitle="Pais e cuidadores desalinhados" />
        </div>
      </section>

      {/* Conheça */}
      <section className="max-w-6xl mx-auto px-4 pt-6 pb-8">
        <div className="grid gap-4 lg:grid-cols-2 lg:items-center">
          <div className="space-y-3">
            <SectionTitle
              icon={Users}
              title="Conheça o CuidaJunto"
              subtitle="Rotina automática e organizada para reduzir ruídos entre cuidadores."
            />

            <div className="space-y-3 mt-4">
              {[
                "Rotina automática e organizada",
                "Tudo em um só lugar",
                "Alinhe todos os cuidadores",
              ].map((t) => (
                <div key={t} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-teal-700" />
                  </div>
                  <div className="text-sm font-semibold text-slate-900">{t}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Phone mock */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-sm">
              <Card className="rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="h-20 bg-gradient-to-r from-violet-700 via-purple-600 to-orange-500" />
                <div className="p-5 -mt-10 bg-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-teal-700" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">CuidaJunto</div>
                      <div className="text-xs text-slate-500 mt-0.5">Agenda + Relatório do dia</div>
                    </div>
                  </div>

                  <div className="mt-5 space-y-2">
                    {[
                      "Agenda do mês",
                      "Relatório do dia",
                      "Dias de convivência",
                      "Mensagens por criança",
                    ].map((r, idx) => (
                      <div key={r} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                        <div className="text-xs font-semibold text-slate-700">{r}</div>
                        <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-teal-700" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="max-w-6xl mx-auto px-4 pb-10" id="como-funciona">
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-slate-900">Como funciona</h2>
          <p className="text-sm text-slate-500 mt-1">3 passos para colocar a rotina em ordem.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {
              n: "1",
              title: "Crie sua conta",
              desc: "Cadastre a família e convide cuidadores.",
            },
            {
              n: "2",
              title: "Organize a agenda",
              desc: "Eventos, tarefas e medicamentos por criança.",
            },
            {
              n: "3",
              title: "Registre o dia",
              desc: "Relatório do dia e convivência para pais separados.",
            },
          ].map((s) => (
            <Card key={s.n} className="p-5 bg-white border border-slate-100 shadow-sm">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm">
                {s.n}
              </div>
              <div className="mt-3 font-semibold text-slate-900">{s.title}</div>
              <div className="text-sm text-slate-500 mt-1">{s.desc}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* Plans */}
      <section className="bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="mb-6 space-y-1">
            <h2 className="text-2xl font-bold text-slate-900">Planos</h2>
            <p className="text-sm text-slate-500">
              Comece grátis e avance para o Premium se fizer sentido.
            </p>
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            <Card className="p-6 bg-white border border-slate-100 shadow-sm">
              <div className="font-semibold text-slate-900">Grátis</div>
              <div className="text-3xl font-extrabold text-slate-900 mt-3">R$ 0</div>
              <div className="text-sm text-slate-500 mt-1">Para testar</div>
              <div className="mt-4 space-y-2">
                {["Até 1 criança", "Agenda e eventos", "Relatório do dia básico"].map((b) => (
                  <div key={b} className="flex items-center gap-2 text-sm text-slate-700">
                    <Check className="w-4 h-4 text-teal-700" />
                    {b}
                  </div>
                ))}
              </div>
              <Button
                type="button"
                className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white shadow"
                onClick={() => (window.location.href = "/register")}
              >
                Começar grátis
              </Button>
            </Card>

            <Card className="p-6 bg-white border border-teal-200 ring-2 ring-teal-100 shadow-sm">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold">
                Mais escolhido
              </div>
              <div className="font-semibold text-slate-900 mt-3">Premium Mensal</div>
              <div className="text-3xl font-extrabold text-slate-900 mt-3">R$ 19,90</div>
              <div className="text-sm text-slate-500 mt-1">Por mês</div>
              <div className="mt-4 space-y-2">
                {[
                  "Crianças ilimitadas",
                  "Relatório completo do dia",
                  "Dias de convivência detalhados",
                ].map((b) => (
                  <div key={b} className="flex items-center gap-2 text-sm text-slate-700">
                    <Check className="w-4 h-4 text-teal-700" />
                    {b}
                  </div>
                ))}
              </div>
              <Button
                type="button"
                className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white shadow"
                onClick={() => (window.location.href = "/register")}
              >
                Ativar Premium
              </Button>
            </Card>

            <Card className="p-6 bg-white border border-slate-100 shadow-sm">
              <div className="font-semibold text-slate-900">Premium Anual</div>
              <div className="text-3xl font-extrabold text-slate-900 mt-3">R$ 199,90</div>
              <div className="text-sm text-slate-500 mt-1">Economize no ano</div>
              <div className="mt-4 space-y-2">
                {[
                  "Tudo do Premium Mensal",
                  "Renovação anual com desconto",
                  "Histórico completo",
                ].map((b) => (
                  <div key={b} className="flex items-center gap-2 text-sm text-slate-700">
                    <Check className="w-4 h-4 text-teal-700" />
                    {b}
                  </div>
                ))}
              </div>
              <Button
                type="button"
                className="w-full mt-6 bg-slate-900 hover:bg-slate-800 text-white shadow"
                onClick={() => (window.location.href = "/register")}
              >
                Assinar Anual
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-start justify-between gap-6 flex-col sm:flex-row">
            <div className="flex items-center gap-3">
              <img src="/logonova.jpeg" alt="CuidaJunto" className="w-10 h-10 rounded-2xl object-cover" />
              <div>
                <div className="font-bold">CuidaJunto</div>
                <div className="text-xs text-white/70 mt-1">Agenda familiar compartilhada</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                asChild
                type="button"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Link to="/login">Login</Link>
              </Button>
              <Button
                asChild
                type="button"
                className="bg-teal-600 hover:bg-teal-700 text-white shadow"
              >
                <Link to="/register">Criar conta</Link>
              </Button>
            </div>
          </div>

          <div className="mt-6 text-xs text-white/60">
            © {new Date().getFullYear()} CuidaJunto. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}


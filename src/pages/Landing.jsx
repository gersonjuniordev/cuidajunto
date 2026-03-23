import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Calendar,
  Heart,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Users,
  Check,
} from "lucide-react";

function Feature({ icon: Icon, title, description }) {
  return (
    <Card className="border-0 shadow-sm p-5 bg-white/80">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-teal-700" />
        </div>
        <div>
          <div className="font-semibold text-slate-900">{title}</div>
          <div className="text-sm text-slate-500 mt-1">{description}</div>
        </div>
      </div>
    </Card>
  );
}

function PlanCard({ highlight, title, price, subtitle, bullets, ctaLabel, onCta }) {
  return (
    <Card
      className={`border-0 shadow-sm p-6 bg-white ${
        highlight ? "ring-2 ring-teal-200" : "ring-1 ring-slate-100"
      }`}
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {highlight ? (
            <div className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700">
              Mais escolhido
            </div>
          ) : (
            <div className="h-7" />
          )}
          <div className="font-semibold text-slate-900">{title}</div>
        </div>

        <div className="text-3xl font-bold text-slate-900">{price}</div>
        <div className="text-sm text-slate-500">{subtitle}</div>
      </div>

      <div className="mt-5 space-y-2">
        {bullets.map((b) => (
          <div key={b} className="flex items-center gap-2 text-sm text-slate-700">
            <div className="w-5 h-5 rounded-full bg-teal-50 flex items-center justify-center">
              <Check className="w-3.5 h-3.5 text-teal-700" />
            </div>
            {b}
          </div>
        ))}
      </div>

      <Button
        className={`w-full mt-6 ${
          highlight ? "bg-teal-600 hover:bg-teal-700" : "bg-slate-900 hover:bg-slate-800"
        }`}
        onClick={onCta}
      >
        {ctaLabel}
      </Button>
    </Card>
  );
}

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/60 to-slate-50">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.jpeg" alt="CuidaJunto" className="w-9 h-9 rounded-xl object-cover" />
            <div className="leading-tight">
              <div className="font-bold text-slate-900">CuidaJunto</div>
              <div className="text-xs text-slate-500">Agenda familiar compartilhada</div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <Button asChild variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50">
              <Link to="/login">Entrar</Link>
            </Button>
            <Button asChild className="bg-teal-600 hover:bg-teal-700">
              <Link to="/register">Criar conta</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-8 pb-6">
        <div className="rounded-3xl bg-gradient-to-r from-teal-700 to-amber-500 p-6 sm:p-10 text-white shadow-sm">
          <div className="flex items-start justify-between gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold">
                <Sparkles className="w-4 h-4" />
                Convivência, rotina e comunicação em um só lugar
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
                Cuidar dos filhos juntos ficou mais simples.
              </h1>
              <p className="text-white/90 text-sm sm:text-base">
                O <strong>CuidaJunto</strong> organiza agenda, tarefas, eventos, relatórios do dia e facilita a
                convivência para pais separados.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  asChild
                  className="bg-teal-400 text-teal-900 hover:bg-teal-300 font-semibold"
                >
                  <Link to="/register">Testar agora</Link>
                </Button>
                <Button asChild variant="outline" className="border-white/35 text-white hover:bg-white/10">
                  <Link to="/login">Login</Link>
                </Button>
              </div>
            </div>

            <div className="hidden md:block">
              <div className="w-36 h-36 rounded-3xl bg-white/15 flex items-center justify-center">
                <img src="/logo.jpeg" alt="CuidaJunto" className="w-24 h-24 rounded-2xl object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile quick actions */}
      <div className="sm:hidden px-4 -mt-2 pb-4">
        <div className="flex gap-2">
          <Button asChild variant="outline" className="w-1/2 border-teal-200 text-teal-700 hover:bg-teal-50">
            <Link to="/login">Entrar</Link>
          </Button>
          <Button asChild className="w-1/2 bg-teal-600 hover:bg-teal-700">
            <Link to="/register">Criar conta</Link>
          </Button>
        </div>
      </div>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-2xl bg-teal-50 flex items-center justify-center">
            <Heart className="w-5 h-5 text-teal-700" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Tudo que a família precisa</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Feature
            icon={Calendar}
            title="Agenda organizada"
            description="Eventos e compromissos por criança, com visual do mês."
          />
          <Feature
            icon={MessageCircle}
            title="Comunicação clara"
            description="Converse com cuidadores e personalize o histórico por criança."
          />
          <Feature
            icon={ShieldCheck}
            title="Rotina com segurança"
            description="Tarefas e medicamentos com registro e histórico."
          />
          <Feature
            icon={Users}
            title="Pais separados"
            description="Dias de convivência por pai para reduzir conflitos."
          />
          <Feature
            icon={Heart}
            title="Relatório do dia"
            description="Um resumo prático para acompanhar sono, alimentação e humor."
          />
          <Feature
            icon={Sparkles}
            title="Experiência simples"
            description="Mobile-first e fluxos rápidos, igual ao que você já usa no app."
          />
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 pb-10">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">Como funciona</h2>
          <p className="text-sm text-slate-500 mt-1">
            Em poucos passos você começa a organizar a rotina da família.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="p-5 bg-white/80 border-0 shadow-sm">
            <div className="text-xs font-semibold text-teal-700 bg-teal-50 inline-flex px-3 py-1 rounded-full">
              1
            </div>
            <div className="font-semibold text-slate-900 mt-3">Crie sua conta</div>
            <div className="text-sm text-slate-500 mt-1">Cadastre a família e convide cuidadores.</div>
          </Card>
          <Card className="p-5 bg-white/80 border-0 shadow-sm">
            <div className="text-xs font-semibold text-teal-700 bg-teal-50 inline-flex px-3 py-1 rounded-full">
              2
            </div>
            <div className="font-semibold text-slate-900 mt-3">Organize a agenda</div>
            <div className="text-sm text-slate-500 mt-1">Eventos, tarefas e medicamentos por criança.</div>
          </Card>
          <Card className="p-5 bg-white/80 border-0 shadow-sm">
            <div className="text-xs font-semibold text-teal-700 bg-teal-50 inline-flex px-3 py-1 rounded-full">
              3
            </div>
            <div className="font-semibold text-slate-900 mt-3">Registre e acompanhe</div>
            <div className="text-sm text-slate-500 mt-1">
              Relatórios do dia e dias de convivência para pais separados.
            </div>
          </Card>
        </div>
      </section>

      {/* Plans */}
      <section className="bg-white/60 border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900">Planos e preços</h2>
            <p className="text-sm text-slate-500 mt-1">
              Comece grátis e, se fizer sentido, avance para o Premium.
            </p>
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            <PlanCard
              title="Grátis"
              price="R$ 0"
              subtitle="Para testar e organizar o básico"
              bullets={["Até 1 criança", "Agenda e eventos", "Relatório do dia básico"]}
              ctaLabel="Começar grátis"
              onCta={() => navigate("/register")}
            />
            <PlanCard
              highlight
              title="Premium Mensal"
              price="R$ 19,90"
              subtitle="Por mês"
              bullets={[
                "Crianças ilimitadas",
                "Relatório do dia completo",
                "Dias de convivência detalhados",
              ]}
              ctaLabel="Ativar Premium"
              onCta={() => navigate("/register")}
            />
            <PlanCard
              title="Premium Anual"
              price="R$ 199,90"
              subtitle="Economize no ano"
              bullets={[
                "Tudo do Premium Mensal",
                "Renovação anual com desconto",
                "Acompanhamento e histórico completo",
              ]}
              ctaLabel="Assinar Anual"
              onCta={() => navigate("/register")}
            />
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            * Valores e detalhes de cobrança podem ser ajustados conforme a implementação de pagamentos do app.
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">Dúvidas frequentes</h2>
          <p className="text-sm text-slate-500 mt-1">Respostas rápidas para você começar.</p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: "O relatório do dia substitui mensagens?",
              a: "Ele não substitui. É um resumo prático do dia, para que toda a família acompanhe a rotina rapidamente.",
            },
            {
              q: "Funciona para pais separados?",
              a: "Sim. Você pode registrar dias de convivência por pai e manter tudo organizado sem depender de conversas aleatórias.",
            },
            {
              q: "Tem app mobile?",
              a: "A interface já é mobile-first. Depois você pode empacotar para iOS/Android conforme sua estratégia de monetização.",
            },
            {
              q: "Como faço para convidar cuidadores?",
              a: "No fluxo do onboarding, você cria códigos para convidar cuidadores e gerenciar acesso por criança.",
            },
          ].map((item) => (
            <details
              key={item.q}
              className="bg-white/80 border border-slate-100 rounded-2xl p-4"
            >
              <summary className="cursor-pointer font-semibold text-slate-900">
                {item.q}
              </summary>
              <div className="text-sm text-slate-500 mt-2">{item.a}</div>
            </details>
          ))}
        </div>
      </section>

      <footer className="bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-start justify-between gap-6 flex-col sm:flex-row">
            <div className="flex items-center gap-3">
              <img src="/logo.jpeg" alt="CuidaJunto" className="w-10 h-10 rounded-2xl object-cover" />
              <div>
                <div className="font-bold">CuidaJunto</div>
                <div className="text-xs text-white/70 mt-1">Agenda familiar compartilhada</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild className="bg-teal-600 hover:bg-teal-700 text-white">
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


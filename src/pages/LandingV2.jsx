import React, { useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Heart, MessageCircle, ShieldCheck, Users, Check, Sparkles } from "lucide-react";

function Feature({ icon: Icon, title, description }) {
  return (
    <Card className="border border-slate-100 shadow-sm bg-white p-4">
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

function PriceCard({ variant = "default", title, price, subtitle, bullets, ctaLabel, onCta }) {
  const highlight =
    variant === "highlight"
      ? "ring-2 ring-teal-200"
      : variant === "dark"
        ? "ring-1 ring-slate-200"
        : "ring-1 ring-slate-100";

  const btnClass =
    variant === "highlight"
      ? "bg-teal-600 hover:bg-teal-700 text-white shadow"
      : variant === "dark"
        ? "bg-slate-900 hover:bg-slate-800 text-white shadow"
        : "bg-white hover:bg-slate-50 text-teal-700 border border-teal-200 shadow-none";

  return (
    <Card className={`p-5 bg-white ${highlight}`}>
      <div className="space-y-2">
        <div className="font-semibold text-slate-900">{title}</div>
        <div className="text-3xl font-bold text-slate-900">{price}</div>
        <div className="text-sm text-slate-500">{subtitle}</div>
      </div>

      <div className="mt-4 space-y-2">
        {bullets.map((b) => (
          <div key={b} className="flex items-center gap-2 text-sm text-slate-700">
            <div className="w-5 h-5 rounded-full bg-teal-50 flex items-center justify-center">
              <Check className="w-3.5 h-3.5 text-teal-700" />
            </div>
            {b}
          </div>
        ))}
      </div>

      <Button type="button" className={`w-full mt-5 ${btnClass}`} onClick={onCta}>
        {ctaLabel}
      </Button>
    </Card>
  );
}

export default function LandingV2() {
  const navigate = useNavigate();
  const howRef = useRef(null);

  const quickActions = useMemo(
    () => [
      { label: "Testar grátis por 3 dias", to: "/register", primary: true },
      { label: "Ver como funciona", to: "#como-funciona", primary: false },
    ],
    []
  );

  const onHow = () => {
    if (howRef.current) {
      howRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      document.getElementById("como-funciona")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <img src="/logo.jpeg" alt="CuidaJunto" className="w-9 h-9 rounded-xl object-cover" />
            <div>
              <div className="font-bold text-slate-900 leading-tight">CuidaJunto</div>
              <div className="text-xs text-slate-500">Agenda familiar compartilhada</div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="border-teal-200 text-teal-700 hover:bg-teal-50"
              onClick={() => navigate("/login")}
            >
              Entrar
            </Button>
            <Button
              type="button"
              className="bg-teal-600 hover:bg-teal-700 text-white shadow"
              onClick={() => navigate("/register")}
            >
              Criar conta
            </Button>
          </div>
        </div>
      </header>

      {/* Hero (imagem pronta para ficar igual ao pedido) */}
      <main>
        <section className="max-w-6xl mx-auto px-4 pt-4">
          <div className="relative overflow-hidden rounded-3xl">
            <img
              src="/landing.jpeg"
              alt="Landing CuidaJunto"
              className="w-full h-auto block"
              draggable={false}
            />

            {/* CTA mobile sobre a imagem */}
            <div className="sm:hidden absolute left-0 right-0 bottom-4 px-4 flex gap-3 justify-center">
              <Button
                type="button"
                className="bg-teal-600 hover:bg-teal-700 text-white shadow flex-1"
                onClick={() => navigate("/register")}
              >
                Testar grátis
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-white/40 bg-white/10 text-white hover:bg-white/15 flex-1"
                onClick={onHow}
              >
                Como funciona
              </Button>
            </div>
          </div>
        </section>

        {/* Features (fica bonito mesmo com a imagem; é mobile-first) */}
        <section className="max-w-6xl mx-auto px-4 pt-7 pb-10" ref={howRef} id="como-funciona">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-2xl bg-teal-50 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-teal-700" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Por que o CuidaJunto ajuda?</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Feature
              icon={Calendar}
              title="Agenda organizada"
              description="Eventos e compromissos por criança, com visual claro."
            />
            <Feature
              icon={MessageCircle}
              title="Comunicação"
              description="Histórico por criança para reduzir ruídos e confusões."
            />
            <Feature
              icon={ShieldCheck}
              title="Rotina segura"
              description="Tarefas, medicamentos e registros com histórico."
            />
            <Feature
              icon={Users}
              title="Pais separados"
              description="Dias de convivência por pai para manter tudo em ordem."
            />
          </div>
        </section>

        {/* Planos */}
        <section className="bg-white border-t border-slate-100">
          <div className="max-w-6xl mx-auto px-4 py-10">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">Planos</h2>
              <p className="text-sm text-slate-500 mt-1">
                Comece com um período de teste e avance para o Premium se fizer sentido.
              </p>
            </div>

            <div className="grid gap-3 lg:grid-cols-3">
              <PriceCard
                variant="default"
                title="Grátis"
                price="R$ 0"
                subtitle="3 dias para testar"
                bullets={["Até 1 criança", "Agenda e eventos", "Relatório do dia básico"]}
                ctaLabel="Testar grátis"
                onCta={() => navigate("/register")}
              />

              <PriceCard
                variant="highlight"
                title="Premium Mensal"
                price="R$ 19,90"
                subtitle="Por mês"
                bullets={[
                  "Crianças ilimitadas",
                  "Relatório completo do dia",
                  "Dias de convivência detalhados",
                ]}
                ctaLabel="Comece agora"
                onCta={() => navigate("/register")}
              />

              <PriceCard
                variant="dark"
                title="Premium Anual"
                price="R$ 199,90"
                subtitle="Economize no ano"
                bullets={["Tudo do Mensal", "Renovação anual com desconto", "Acompanhamento completo"]}
                ctaLabel="Assinar anual"
                onCta={() => navigate("/register")}
              />
            </div>

            <div className="mt-6 text-center text-xs text-slate-500">
              * Planos sujeitos a ajustes conforme pagamento/in-app purchase do mobile.
            </div>
          </div>
        </section>

        {/* FAQ simples */}
        <section className="max-w-6xl mx-auto px-4 py-10">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">Dúvidas frequentes</h2>
            <p className="text-sm text-slate-500 mt-1">Respostas rápidas.</p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "O relatório do dia substitui mensagens?",
                a: "Não. É um resumo prático para acompanhar rapidamente, enquanto o chat mantém os detalhes.",
              },
              {
                q: "Funciona para pais separados?",
                a: "Sim. Você registra os dias de convivência por pai e mantém a rotina alinhada.",
              },
              {
                q: "A interface é mobile-first?",
                a: "Sim. O layout já foi pensado para celular, e depois você pode empacotar para iOS/Android.",
              },
            ].map((item) => (
              <details
                key={item.q}
                className="bg-white border border-slate-100 rounded-2xl p-4"
              >
                <summary className="cursor-pointer font-semibold text-slate-900">{item.q}</summary>
                <div className="text-sm text-slate-500 mt-2">{item.a}</div>
              </details>
            ))}
          </div>
        </section>
      </main>

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
              <Button
                type="button"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
                onClick={() => navigate("/login")}
              >
                Login
              </Button>
              <Button
                type="button"
                className="bg-teal-600 hover:bg-teal-700 text-white shadow"
                onClick={() => navigate("/register")}
              >
                Criar conta
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


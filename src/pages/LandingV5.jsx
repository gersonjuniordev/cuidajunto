import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Sparkles, CalendarDays, ShieldCheck, MessageCircle, HeartHandshake } from "lucide-react";

function publicImage(name) {
  return encodeURI(`/${name}`);
}

function Reveal({ children, className = "" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setVisible(true);
      },
      { threshold: 0.12 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={[
        "transition-all duration-700 ease-out",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function ImageCard({ src, alt, title, desc, onClick }) {
  return (
    <Card className="overflow-hidden border border-slate-100 shadow-sm bg-white">
      <button type="button" onClick={onClick} className="w-full text-left">
        <img src={src} alt={alt} className="w-full h-auto block" draggable={false} />
      </button>
      {(title || desc) && (
        <div className="p-4">
          {title ? <h3 className="font-semibold text-slate-900">{title}</h3> : null}
          {desc ? <p className="text-sm text-slate-500 mt-1">{desc}</p> : null}
        </div>
      )}
    </Card>
  );
}

export default function LandingV5() {
  const navigate = useNavigate();

  const heroMain = publicImage("WhatsApp Image 2026-03-23 at 12.07.00.jpeg");
  const dorEsquecimento = publicImage("WhatsApp Image 2026-03-23 at 11.57.13.jpeg");
  const dorComunicacao = publicImage("WhatsApp Image 2026-03-23 at 11.57.14 (3).jpeg");
  const dorRotina = publicImage("WhatsApp Image 2026-03-23 at 11.57.13 (2).jpeg");

  const solucaoTudo = publicImage("WhatsApp Image 2026-03-23 at 11.57.13 (3).jpeg");
  const rotinaChecklist = publicImage("WhatsApp Image 2026-03-23 at 11.57.14 (2).jpeg");
  const eviteEsquecimentos = publicImage("WhatsApp Image 2026-03-23 at 11.57.14.jpeg");

  const paisSeparados = publicImage("WhatsApp Image 2026-03-23 at 11.57.13 (1).jpeg");
  const tranquilidade = publicImage("WhatsApp Image 2026-03-23 at 11.57.14 (1).jpeg");
  const paisConectados = publicImage("WhatsApp Image 2026-03-23 at 11.57.15 (2).jpeg");

  const ctaTeste = publicImage("WhatsApp Image 2026-03-23 at 11.57.15 (1).jpeg");
  const apoioFinal = publicImage("WhatsApp Image 2026-03-23 at 11.57.15.jpeg");
  const apoioFinal2 = publicImage("WhatsApp Image 2026-03-23 at 11.57.13 (2).jpeg");

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.jpeg" alt="CuidaJunto" className="w-9 h-9 rounded-xl object-cover" />
            <div className="leading-tight">
              <div className="font-bold text-slate-900">CuidaJunto</div>
              <div className="text-xs text-slate-500">Agenda familiar compartilhada</div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50 hidden sm:inline-flex">
              <Link to="/login">Entrar</Link>
            </Button>
            <Button asChild className="bg-teal-600 hover:bg-teal-700 text-white shadow hidden sm:inline-flex">
              <Link to="/register">Criar conta</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* HERO */}
        <Reveal className="max-w-6xl mx-auto px-4 pt-5">
          <div className="rounded-3xl overflow-hidden shadow-sm border border-slate-100 bg-white">
            <img src={heroMain} alt="CuidaJunto - Hero" className="w-full h-auto block" draggable={false} />
          </div>
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <Button className="bg-teal-600 hover:bg-teal-700 text-white shadow w-full sm:w-auto" onClick={() => navigate("/register")}>
              Testar grátis por 3 dias
            </Button>
            <Button variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50 w-full sm:w-auto" onClick={() => navigate("/login")}>
              Já tenho conta
            </Button>
          </div>
        </Reveal>

        {/* Dores */}
        <Reveal className="max-w-6xl mx-auto px-4 pt-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-2xl bg-teal-50 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-teal-700" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Você se identifica com isso?</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <ImageCard
              src={dorEsquecimento}
              alt="Esquecimento"
              title="Esquecimentos importantes"
              desc="Tudo solto no WhatsApp gera atraso e estresse."
              onClick={() => navigate("/register")}
            />
            <ImageCard
              src={dorComunicacao}
              alt="Falha de comunicação"
              title="Falhas de comunicação"
              desc="Cada cuidador com uma informação diferente."
              onClick={() => navigate("/register")}
            />
            <ImageCard
              src={dorRotina}
              alt="Rotina bagunçada"
              title="Rotina bagunçada"
              desc="Sem previsibilidade para a criança e para a família."
              onClick={() => navigate("/register")}
            />
          </div>
        </Reveal>

        {/* Solução principal */}
        <Reveal className="max-w-6xl mx-auto px-4 pt-10">
          <div className="grid gap-4 lg:grid-cols-2">
            <ImageCard
              src={solucaoTudo}
              alt="Tudo em um só lugar"
              title="Tudo em um só lugar"
              desc="Agenda, tarefas, mensagens e relatório diário centralizados."
              onClick={() => navigate("/register")}
            />

            <Card className="border border-slate-100 shadow-sm p-5 bg-white">
              <h3 className="text-xl font-bold text-slate-900">Condizente com o app, na prática</h3>
              <p className="text-sm text-slate-500 mt-1">
                O que você vê aqui na landing é o que a família usa no sistema: rotina, comunicação e
                acompanhamento diário.
              </p>

              <div className="mt-5 space-y-3">
                {[
                  ["Agenda compartilhada", CalendarDays],
                  ["Relatório do dia da criança", ShieldCheck],
                  ["Chat e histórico por criança", MessageCircle],
                  ["Menos conflitos, mais tranquilidade", HeartHandshake],
                ].map(([text, Icon]) => (
                  <div key={text} className="flex items-center gap-2 text-sm text-slate-700">
                    <div className="w-6 h-6 rounded-full bg-teal-50 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-teal-700" />
                    </div>
                    {text}
                  </div>
                ))}
              </div>

              <Button
                className="mt-6 w-full bg-teal-600 hover:bg-teal-700 text-white shadow"
                onClick={() => navigate("/register")}
              >
                Começar agora
              </Button>
            </Card>
          </div>
        </Reveal>

        {/* Pais separados / confiança */}
        <Reveal className="max-w-6xl mx-auto px-4 pt-10">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <ImageCard
              src={paisSeparados}
              alt="Pais separados"
              title="Pais separados, mais paz"
              desc="Menos conflito com acordos claros e rotina definida."
              onClick={() => navigate("/register")}
            />
            <ImageCard
              src={tranquilidade}
              alt="Tranquilidade para família"
              title="Tranquilidade para toda a família"
              desc="Mais previsibilidade para pais e crianças."
              onClick={() => navigate("/register")}
            />
            <ImageCard
              src={paisConectados}
              alt="Pais conectados"
              title="Pais conectados"
              desc="Todos alinhados sobre o que importa."
              onClick={() => navigate("/register")}
            />
          </div>
        </Reveal>

        {/* Organização + alerta */}
        <Reveal className="max-w-6xl mx-auto px-4 pt-10">
          <div className="grid gap-4 lg:grid-cols-2">
            <ImageCard
              src={rotinaChecklist}
              alt="Organize a rotina"
              title="Organize a rotina do seu filho"
              desc="Checklists e tarefas em um fluxo simples."
              onClick={() => navigate("/register")}
            />
            <ImageCard
              src={eviteEsquecimentos}
              alt="Evite esquecimentos"
              title="Evite esquecimentos"
              desc="Alertas e lembretes para não perder o que é importante."
              onClick={() => navigate("/register")}
            />
          </div>
        </Reveal>

        {/* CTA visual clicável */}
        <Reveal className="max-w-6xl mx-auto px-4 pt-10">
          <Card className="overflow-hidden border border-slate-100 shadow-sm bg-white">
            <button type="button" className="w-full text-left" onClick={() => navigate("/register")}>
              <img src={ctaTeste} alt="Teste agora grátis" className="w-full h-auto block" draggable={false} />
            </button>
          </Card>
        </Reveal>

        {/* Planos */}
        <Reveal className="max-w-6xl mx-auto px-4 pt-10">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-slate-900">Planos</h2>
            <p className="text-sm text-slate-500 mt-1">Comece grátis e evolua conforme a sua família precisa.</p>
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            <Card className="p-6 bg-white border border-slate-100 shadow-sm">
              <div className="font-semibold text-slate-900">Grátis</div>
              <div className="text-3xl font-extrabold text-slate-900 mt-3">R$ 0</div>
              <div className="text-sm text-slate-500 mt-1">Teste inicial</div>
              <div className="mt-4 space-y-2">
                {["Até 1 criança", "Agenda e tarefas", "Relatório básico"].map((b) => (
                  <div key={b} className="flex items-center gap-2 text-sm text-slate-700">
                    <Check className="w-4 h-4 text-teal-700" />
                    {b}
                  </div>
                ))}
              </div>
              <Button className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white shadow" onClick={() => navigate("/register")}>
                Testar grátis
              </Button>
            </Card>

            <Card className="p-6 bg-white border border-teal-200 ring-2 ring-teal-100 shadow-sm">
              <div className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700">
                Mais escolhido
              </div>
              <div className="font-semibold text-slate-900 mt-3">Premium Mensal</div>
              <div className="text-3xl font-extrabold text-slate-900 mt-3">R$ 19,90</div>
              <div className="text-sm text-slate-500 mt-1">Por mês</div>
              <div className="mt-4 space-y-2">
                {[
                  "Crianças ilimitadas",
                  "Relatório completo do dia",
                  "Convivência por pai",
                  "Chat completo",
                ].map((b) => (
                  <div key={b} className="flex items-center gap-2 text-sm text-slate-700">
                    <Check className="w-4 h-4 text-teal-700" />
                    {b}
                  </div>
                ))}
              </div>
              <Button className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white shadow" onClick={() => navigate("/register")}>
                Assinar mensal
              </Button>
            </Card>

            <Card className="p-6 bg-white border border-slate-100 shadow-sm">
              <div className="font-semibold text-slate-900">Premium Anual</div>
              <div className="text-3xl font-extrabold text-slate-900 mt-3">R$ 199,90</div>
              <div className="text-sm text-slate-500 mt-1">Economia no ano</div>
              <div className="mt-4 space-y-2">
                {["Tudo do mensal", "Desconto anual", "Histórico completo"].map((b) => (
                  <div key={b} className="flex items-center gap-2 text-sm text-slate-700">
                    <Check className="w-4 h-4 text-teal-700" />
                    {b}
                  </div>
                ))}
              </div>
              <Button className="w-full mt-6 bg-slate-900 hover:bg-slate-800 text-white shadow" onClick={() => navigate("/register")}>
                Assinar anual
              </Button>
            </Card>
          </div>
        </Reveal>

        {/* Encerramento visual */}
        <Reveal className="max-w-6xl mx-auto px-4 pt-10 pb-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="overflow-hidden border border-slate-100 shadow-sm bg-white">
              <img src={apoioFinal} alt="Mais organização menos stress" className="w-full h-auto block" draggable={false} />
            </Card>
            <Card className="overflow-hidden border border-slate-100 shadow-sm bg-white">
              <img src={apoioFinal2} alt="Rotina organizada" className="w-full h-auto block" draggable={false} />
            </Card>
          </div>
        </Reveal>
      </main>

      <Reveal className="px-4 pb-10 pt-6">
        <footer className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between gap-4 flex-col sm:flex-row">
            <div className="flex items-center gap-3">
              <img src="/logo.jpeg" alt="CuidaJunto" className="w-10 h-10 rounded-2xl object-cover" />
              <div>
                <div className="font-bold text-slate-900">CuidaJunto</div>
                <div className="text-xs text-slate-500 mt-0.5">Mais organização para sua família</div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button asChild variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild className="bg-teal-600 hover:bg-teal-700 text-white shadow">
                <Link to="/register">Criar conta</Link>
              </Button>
            </div>
          </div>

          <div className="mt-6 text-xs text-slate-500">
            © {new Date().getFullYear()} CuidaJunto. Todos os direitos reservados.
          </div>
        </footer>
      </Reveal>
    </div>
  );
}


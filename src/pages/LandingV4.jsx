import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

function Reveal({ children, className = "" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) setVisible(true);
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={[
        "transition-all duration-700 ease-out will-change-transform",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function TransparentOverlayButton({ label, onClick, className, style }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={[
        "bg-transparent cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 rounded-lg",
        className,
      ].join(" ")}
      style={style}
    />
  );
}

export default function LandingV4() {
  const navigate = useNavigate();

  const targetHowId = "como-funciona";

  const howScroll = () => {
    const el = document.getElementById(targetHowId);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const headerButtons = useMemo(() => {
    // Coordenadas aproximadas (percentuais) para respeitar diferentes tamanhos de tela.
    // Ajuste fino depois se você quiser 100% pixel-perfect no seu celular.
    return {
      primary: {
        style: {
          position: "absolute",
          left: "6%",
          right: "52%",
          bottom: "9%",
          height: "16%",
        },
      },
      secondary: {
        style: {
          position: "absolute",
          left: "52%",
          right: "6%",
          bottom: "9%",
          height: "16%",
        },
      },
    };
  }, []);

  const pricingButtons = useMemo(() => {
    // Sobreposição dos botões dentro do `3.jpeg`
    return {
      trial: {
        style: {
          position: "absolute",
          left: "25%",
          right: "25%",
          bottom: "24%",
          height: "9%",
        },
      },
      start: {
        style: {
          position: "absolute",
          left: "19%",
          right: "19%",
          bottom: "14%",
          height: "9%",
        },
      },
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Reveal className="sticky top-0 z-30">
        <div className="relative">
          <img
            src="/header.jpeg"
            alt="CuidaJunto - Header"
            className="w-full h-auto block"
            draggable={false}
          />

          <TransparentOverlayButton
            label="Testar grátis por 3 dias"
            onClick={() => navigate("/register")}
            {...headerButtons.primary}
          />
          <TransparentOverlayButton
            label="Ver como funciona"
            onClick={howScroll}
            {...headerButtons.secondary}
          />
        </div>
      </Reveal>

      <Reveal className="px-0">
        <img
          src="/1.jpeg"
          alt="Você já passou por isso?"
          className="w-full h-auto block"
          draggable={false}
        />
      </Reveal>

      <Reveal>
        <img
          src="/2.jpeg"
          alt="Conheça o CuidaJunto"
          className="w-full h-auto block"
          draggable={false}
        />
      </Reveal>

      <Reveal id="como-funciona">
        <div className="relative">
          <img
            src="/3.jpeg"
            alt="Planos e Assistente Inteligente"
            className="w-full h-auto block"
            draggable={false}
          />

          <TransparentOverlayButton
            label="Experimente grátis por 3 dias"
            onClick={() => navigate("/register")}
            {...pricingButtons.trial}
          />
          <TransparentOverlayButton
            label="Comece agora"
            onClick={() => navigate("/register")}
            {...pricingButtons.start}
          />
        </div>
      </Reveal>

      {/* Rodapé simples (fica abaixo das imagens) */}
      <Reveal className="px-4 pb-10 pt-6">
        <footer className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src="/logo.jpeg"
                alt="CuidaJunto"
                className="w-10 h-10 rounded-2xl object-cover"
              />
              <div>
                <div className="font-bold text-slate-900">CuidaJunto</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Agenda familiar compartilhada
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                asChild
                variant="outline"
                className="border-teal-200 text-teal-700 hover:bg-teal-50"
              >
                <Link to="/login">Login</Link>
              </Button>
              <Button
                asChild
                className="bg-teal-600 hover:bg-teal-700 text-white shadow"
              >
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


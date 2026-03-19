import React, { useState, useEffect } from "react";
import { api } from "@/api/client";
import { Baby, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

export default function EntrarPorCodigo() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [found, setFound] = useState(null);
  const [me, setMe] = useState(null);

  useEffect(() => { api.auth.me().then(setMe).catch(() => {}); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setStatus("loading");

    const all = await api.children.list();
    const results = all.filter(c => c.invite_code === code.trim().toUpperCase());

    if (!results || results.length === 0) {
      setStatus("error");
      return;
    }

    const child = results[0];
    setFound(child);

    // Adiciona o email do usuário como cuidador, se ainda não estiver
    if (me?.email) {
      const emails = child.caregiver_emails || [];
      if (!emails.includes(me.email)) {
        await api.children.update(child.id, {
          caregiver_emails: [...emails, me.email],
        });
      }
    }

    setStatus("success");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto">
            <Baby className="w-7 h-7 text-teal-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Entrar como Cuidador</h1>
          <p className="text-sm text-slate-500">
            Digite o código compartilhado para acessar o perfil de uma criança
          </p>
        </div>

        {status === "success" && found ? (
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">Acesso concedido!</p>
              <p className="text-sm text-slate-500 mt-1">
                Agora você é cuidador(a) de <strong>{found.name}</strong>.
              </p>
            </div>
            <Link to="/Dashboard">
              <Button className="w-full bg-teal-600 hover:bg-teal-700">
                Ir para o Dashboard <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                value={code}
                onChange={e => { setCode(e.target.value.toUpperCase()); setStatus("idle"); }}
                placeholder="Ex: ABC-123"
                className="text-center font-mono text-lg tracking-widest h-12 uppercase"
                maxLength={10}
                required
              />
            </div>

            {status === "error" && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                Código não encontrado. Verifique e tente novamente.
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700"
              disabled={status === "loading" || !code.trim()}
            >
              {status === "loading" ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verificando...</>
              ) : (
                <>Entrar <ArrowRight className="w-4 h-4 ml-2" /></>
              )}
            </Button>

            <p className="text-center text-xs text-slate-400">
              <Link to="/Dashboard" className="text-teal-600 hover:underline">Voltar ao início</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
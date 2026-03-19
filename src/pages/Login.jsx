import React, { useState } from "react";
import { Baby, Lock, Mail, Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, setAuthToken } from "@/api/client";
import { useAuth } from "@/lib/AuthContext";

export default function Login({ onDone }) {
  const { refresh } = useAuth();
  const [mode, setMode] = useState("login"); // login | register
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res =
        mode === "register"
          ? await api.auth.register({ email, password, name })
          : await api.auth.login({ email, password });
      setAuthToken(res.token);
      await refresh();
      onDone?.();
    } catch (err) {
      setError(err?.message || "Falha ao autenticar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto">
            <Baby className="w-7 h-7 text-teal-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">CuidaJunto</h1>
          <p className="text-sm text-slate-500">
            {mode === "register" ? "Crie sua conta" : "Entre para continuar"}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === "register" && (
            <div>
              <Label>Nome</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
            </div>
          )}

          <div>
            <Label>Email</Label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@exemplo.com"
                type="email"
                className="pl-9"
                required
              />
            </div>
          </div>

          <div>
            <Label>Senha</Label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                type="password"
                className="pl-9"
                required
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Aguarde...
              </>
            ) : mode === "register" ? (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Criar conta
              </>
            ) : (
              "Entrar"
            )}
          </Button>
        </form>

        <button
          className="w-full text-xs text-slate-500 hover:text-teal-700"
          onClick={() => {
            setError(null);
            setMode((m) => (m === "login" ? "register" : "login"));
          }}
          type="button"
        >
          {mode === "register"
            ? "Já tem conta? Entrar"
            : "Ainda não tem conta? Criar conta"}
        </button>
      </div>
    </div>
  );
}


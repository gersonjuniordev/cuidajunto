import React, { useState, useEffect } from "react";
import { api } from "@/api/client";
import {
  Baby, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle,
  Loader2, Plus, Trash2, Mail, Heart, Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 3; i++) code += chars[Math.floor(Math.random() * chars.length)];
  code += "-";
  for (let i = 0; i < 3; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// ── Passo 1: Escolha do tipo de acesso ──────────────────────────────────────
function StepChoose({ onTitular, onCodigo }) {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-2 mb-6">
        <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto">
          <Baby className="w-8 h-8 text-teal-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Bem-vindo ao CuidaJunto</h1>
        <p className="text-sm text-slate-500">Como você deseja entrar?</p>
      </div>

      <button
        onClick={onTitular}
        className="w-full flex items-center gap-4 p-4 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-2xl transition-colors text-left group"
      >
        <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <Heart className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-slate-900">Sou responsável titular</p>
          <p className="text-xs text-slate-500 mt-0.5">Cadastrar minha família e minhas crianças</p>
        </div>
        <ArrowRight className="w-4 h-4 text-teal-400 group-hover:translate-x-1 transition-transform" />
      </button>

      <button
        onClick={onCodigo}
        className="w-full flex items-center gap-4 p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl transition-colors text-left group"
      >
        <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center flex-shrink-0">
          <Users className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-slate-900">Sou cuidador convidado</p>
          <p className="text-xs text-slate-500 mt-0.5">Tenho um código para acessar a família de alguém</p>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}

// ── Passo 2: Dados do responsável ────────────────────────────────────────────
function StepResponsavel({ me, onNext, onBack }) {
  const [name, setName] = useState(me?.full_name || "");
  const [phone, setPhone] = useState("");

  return (
    <div className="space-y-5">
      <div>
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-4">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <h2 className="text-xl font-bold text-slate-900">Seus dados</h2>
        <p className="text-sm text-slate-500 mt-1">Você será o responsável titular desta família</p>
      </div>

      <div className="bg-teal-50 border border-teal-100 rounded-xl p-3 flex items-center gap-3">
        <Mail className="w-4 h-4 text-teal-600 flex-shrink-0" />
        <div>
          <p className="text-xs text-slate-500">E-mail cadastrado</p>
          <p className="text-sm font-medium text-slate-800">{me?.email}</p>
        </div>
      </div>

      <div>
        <Label>Nome completo *</Label>
        <Input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Seu nome completo"
          className="mt-1"
        />
      </div>

      <div>
        <Label>Telefone / WhatsApp</Label>
        <Input
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="(11) 99999-9999"
          type="tel"
          className="mt-1"
        />
      </div>

      <Button
        onClick={() => onNext({ name, phone })}
        disabled={!name.trim()}
        className="w-full bg-teal-600 hover:bg-teal-700"
      >
        Continuar <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}

// ── Passo 3: Cadastrar crianças ──────────────────────────────────────────────
function StepCriancas({ onNext, onBack }) {
  const [children, setChildren] = useState([{ name: "", birth_date: "" }]);

  const update = (i, field, value) => {
    setChildren(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: value } : c));
  };

  const add = () => setChildren(prev => [...prev, { name: "", birth_date: "" }]);
  const remove = (i) => setChildren(prev => prev.filter((_, idx) => idx !== i));

  const valid = children.every(c => c.name.trim());

  return (
    <div className="space-y-5">
      <div>
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-4">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <h2 className="text-xl font-bold text-slate-900">Cadastrar crianças</h2>
        <p className="text-sm text-slate-500 mt-1">Adicione as crianças da sua família</p>
      </div>

      <div className="space-y-3">
        {children.map((child, i) => (
          <div key={i} className="p-4 border border-slate-200 rounded-xl space-y-3 bg-slate-50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Criança {i + 1}</span>
              {children.length > 1 && (
                <button onClick={() => remove(i)} className="p-1 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
              )}
            </div>
            <div>
              <Label className="text-xs">Nome *</Label>
              <Input
                value={child.name}
                onChange={e => update(i, "name", e.target.value)}
                placeholder="Nome da criança"
                className="mt-1 h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Data de nascimento</Label>
              <Input
                type="date"
                value={child.birth_date}
                onChange={e => update(i, "birth_date", e.target.value)}
                className="mt-1 h-8 text-sm"
              />
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={add}
        className="w-full border-2 border-dashed border-slate-200 rounded-xl py-3 text-sm text-slate-500 hover:border-teal-300 hover:text-teal-600 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" /> Adicionar outra criança
      </button>

      <Button
        onClick={() => onNext(children)}
        disabled={!valid}
        className="w-full bg-teal-600 hover:bg-teal-700"
      >
        Finalizar cadastro <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}

// ── Passo 4: Sucesso com código ──────────────────────────────────────────────
function StepSucesso({ createdChildren, responsavelEmail, onContinue }) {
  const [copied, setCopied] = useState(null);

  const copy = (code, idx) => {
    navigator.clipboard.writeText(code);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-5">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-7 h-7 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Família cadastrada!</h2>
        <p className="text-sm text-slate-500">
          Os códigos também foram enviados para <strong>{responsavelEmail}</strong>
        </p>
      </div>

      <div className="space-y-3">
        {createdChildren.map((child, i) => (
          <div key={child.id} className="p-4 bg-teal-50 border border-teal-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2">
              <Baby className="w-4 h-4 text-teal-600" />
              <span className="text-sm font-semibold text-slate-800">{child.name}</span>
            </div>
            <p className="text-xs text-slate-500">Compartilhe este código com os cuidadores:</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white border border-teal-200 rounded-lg px-3 py-2 font-mono font-bold text-teal-700 tracking-widest text-center text-base">
                {child.invite_code}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="border-teal-200 text-teal-700 hover:bg-teal-100"
                onClick={() => copy(child.invite_code, i)}
              >
                {copied === i ? "✓ Copiado" : "Copiar"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Button onClick={onContinue} className="w-full bg-teal-600 hover:bg-teal-700">
        Ir para o app <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}

// ── Passo: Entrar por código ─────────────────────────────────────────────────
function StepEntrarCodigo({ me, onBack, onSuccess }) {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("idle");
  const [found, setFound] = useState(null);

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

  if (status === "success" && found) {
    return (
      <div className="space-y-5 text-center">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-7 h-7 text-green-600" />
        </div>
        <div>
          <p className="font-bold text-slate-900 text-lg">Acesso concedido!</p>
          <p className="text-sm text-slate-500 mt-1">
            Você agora é cuidador(a) de <strong>{found.name}</strong>.
          </p>
        </div>
        <Button onClick={onSuccess} className="w-full bg-teal-600 hover:bg-teal-700">
          Entrar no app <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-4">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <h2 className="text-xl font-bold text-slate-900">Entrar com código</h2>
        <p className="text-sm text-slate-500 mt-1">
          Digite o código de convite que o responsável titular compartilhou com você
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          value={code}
          onChange={e => { setCode(e.target.value.toUpperCase()); setStatus("idle"); }}
          placeholder="Ex: ABC-123"
          className="text-center font-mono text-xl tracking-widest h-14 uppercase"
          maxLength={7}
          required
        />

        {status === "error" && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 rounded-xl p-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            Código não encontrado. Verifique e tente novamente.
          </div>
        )}

        <Button
          type="submit"
          disabled={status === "loading" || code.length < 7}
          className="w-full bg-teal-600 hover:bg-teal-700"
        >
          {status === "loading"
            ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verificando...</>
            : <>Verificar código <ArrowRight className="w-4 h-4 ml-2" /></>}
        </Button>
      </form>
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────
export default function Onboarding({ me, onComplete }) {
  const [step, setStep] = useState("choose"); // choose | responsavel | criancas | sucesso | codigo
  const [responsavelData, setResponsavelData] = useState(null);
  const [createdChildren, setCreatedChildren] = useState([]);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleCriancas = async (childrenData) => {
    setSaving(true);
    const created = [];

    for (const child of childrenData) {
      const code = generateCode();
      const c = await api.children.create({
        ...child,
        invite_code: code,
        owner_email: me?.email,
        caregiver_emails: [],
      });
      created.push(c);

        await api.emails.send({
        to: me?.email,
        subject: `CuidaJunto — Código de convite de ${child.name}`,
        body: `Olá ${responsavelData?.name || me?.full_name}!\n\nO código de convite para ${child.name} é:\n\n🔑 ${code}\n\nCompartilhe este código com os cuidadores de ${child.name} para que eles possam acessar o perfil.\n\nEquipe CuidaJunto`,
      });
    }

    setCreatedChildren(created);
    setSaving(false);
    setStep("sucesso");
  };

  if (saving) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-slate-100 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-teal-600 animate-spin mx-auto" />
          <p className="text-slate-600 font-medium">Cadastrando e enviando códigos por e-mail...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-7">
        {step === "choose" && (
          <StepChoose
            onTitular={() => setStep("responsavel")}
            onCodigo={() => setStep("codigo")}
          />
        )}

        {step === "responsavel" && (
          <StepResponsavel
            me={me}
            onBack={() => setStep("choose")}
            onNext={(data) => { setResponsavelData(data); setStep("criancas"); }}
          />
        )}

        {step === "criancas" && (
          <StepCriancas
            onBack={() => setStep("responsavel")}
            onNext={handleCriancas}
          />
        )}

        {step === "sucesso" && (
          <StepSucesso
            createdChildren={createdChildren}
            responsavelEmail={me?.email}
            onContinue={onComplete}
          />
        )}

        {step === "codigo" && (
          <StepEntrarCodigo
            me={me}
            onBack={() => setStep("choose")}
            onSuccess={onComplete}
          />
        )}
      </div>
    </div>
  );
}
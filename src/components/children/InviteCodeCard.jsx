import React, { useState } from "react";
import { Copy, Check, Share2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function InviteCodeCard({ child, onRegen }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(child.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const caregivers = child.caregiver_emails || [];

  return (
    <div className="mt-4 p-4 bg-teal-50 rounded-xl border border-teal-100 space-y-3">
      <div className="flex items-center gap-2">
        <Share2 className="w-4 h-4 text-teal-600" />
        <span className="text-sm font-semibold text-teal-700">Código de Convite</span>
      </div>

      <p className="text-xs text-slate-500">
        Compartilhe este código com outros cuidadores para que eles acessem o perfil de <strong>{child.name}</strong>.
      </p>

      <div className="flex items-center gap-2">
        <div className="flex-1 bg-white border border-teal-200 rounded-lg px-3 py-2 font-mono text-base font-bold text-teal-700 tracking-widest text-center">
          {child.invite_code}
        </div>
        <Button
          size="icon"
          variant="outline"
          className="border-teal-200 text-teal-600 hover:bg-teal-100"
          onClick={handleCopy}
          title="Copiar código"
        >
          {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
        </Button>
      </div>

      {caregivers.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-400">Cuidadores:</span>
          {caregivers.map(email => (
            <Badge key={email} variant="secondary" className="text-[10px] bg-white border border-teal-200 text-teal-700">
              {email}
            </Badge>
          ))}
        </div>
      )}

      <button
        onClick={onRegen}
        className="text-[11px] text-slate-400 hover:text-slate-600 underline underline-offset-2"
      >
        Gerar novo código
      </button>
    </div>
  );
}
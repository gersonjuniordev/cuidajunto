import React, { useEffect, useMemo, useState } from "react";
import { api } from "@/api/client";
import { useAuth } from "@/lib/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import PageHeader from "../components/shared/PageHeader";
import { Camera, RefreshCcw } from "lucide-react";

function getInitials(value) {
  const v = String(value || "").trim();
  if (!v) return "U";
  const parts = v.split(/\s+/).filter(Boolean);
  const initials = parts.map((p) => p[0]).slice(0, 2).join("");
  return initials.toUpperCase() || "U";
}

function planLabel(planId) {
  const id = String(planId || "").toLowerCase();
  if (id === "monthly") return "Mensal";
  if (id === "quarterly") return "Trimestral";
  if (id === "yearly") return "Anual";
  if (id === "trial") return "Teste grátis";
  return id || "trial";
}

export default function Perfil() {
  const { user, refresh } = useAuth();

  const [name, setName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setName(user?.name || "");
    setSelectedFile(null);
    setAvatarPreviewUrl(user?.avatar_url || null);
    setError(null);
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const billing = user?.billing;
  const planText = useMemo(() => {
    if (!billing) return null;
    if (billing.trial_active) return `Teste grátis (${billing.trial_days_left} dia(s))`;
    if (billing.access_active) return `Plano ${planLabel(billing.plan)}`;
    return "Sem acesso ativo";
  }, [billing]);

  const trialEnds = billing?.trial_ends_at ? new Date(billing.trial_ends_at) : null;
  const subscriptionEnds = billing?.subscription_ends_at ? new Date(billing.subscription_ends_at) : null;

  const hasChanges = useMemo(() => {
    const currentName = String(user?.name || "").trim();
    const nextName = String(name || "").trim();
    return currentName !== nextName || !!selectedFile;
  }, [name, selectedFile, user?.name]);

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      setError(null);

      let avatar_url;
      if (selectedFile) {
        const uploadRes = await api.files.upload(selectedFile);
        avatar_url = uploadRes?.file_url;
      }

      const payload = {
        name: String(name || "").trim(),
        ...(avatar_url !== undefined ? { avatar_url } : {}),
      };

      return api.auth.updateProfile(payload);
    },
    onSuccess: async () => {
      setSelectedFile(null);
      await refresh();
    },
    onError: (e) => {
      setError(e?.message || "Falha ao atualizar perfil.");
    },
  });

  const onPickAvatar = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setAvatarPreviewUrl(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Perfil" description="Veja suas informações e atualize seu avatar." />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20">
                {avatarPreviewUrl ? <AvatarImage src={avatarPreviewUrl} alt="Avatar do usuário" /> : null}
                <AvatarFallback className="bg-teal-100 text-teal-700 text-lg font-semibold">
                  {getInitials(name || user?.email)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <div className="text-sm text-slate-500">Seu perfil</div>
                <div className="text-base font-semibold text-slate-900 truncate">{user?.full_name || name || "—"}</div>
                <div className="text-xs text-slate-400 truncate">{user?.email || ""}</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-teal-50 text-teal-700 border border-teal-200">
                  {planText || "—"}
                </Badge>
              </div>

              {billing?.trial_active && trialEnds ? (
                <div className="text-xs text-slate-500">
                  Termina em {trialEnds.toLocaleDateString("pt-BR")}
                </div>
              ) : null}

              {billing?.access_active && subscriptionEnds ? (
                <div className="text-xs text-slate-500">
                  Renova em {subscriptionEnds.toLocaleDateString("pt-BR")}
                </div>
              ) : null}
            </div>

            <div className="pt-1">
              <label className="block">
                <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer text-sm font-medium text-slate-700 w-full justify-center">
                  <Camera className="w-4 h-4 text-teal-700" />
                  Escolher avatar
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={onPickAvatar} />
              </label>
              {selectedFile ? (
                <div className="mt-2 text-xs text-slate-500">
                  Pré-visualização pronta. Clique em “Salvar alterações”.
                </div>
              ) : (
                <div className="mt-2 text-xs text-slate-400">PNG/JPG. Recomendado até 2MB.</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardContent className="p-5 space-y-4">
            <div>
              <div className="text-sm font-semibold text-slate-900">Dados do perfil</div>
              <div className="text-xs text-slate-500 mt-1">Atualizações são salvas imediatamente após o envio.</div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!hasChanges || updateProfileMutation.isPending) return;
                updateProfileMutation.mutate();
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-sm text-slate-700 font-medium">Nome</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                />
              </div>

              <div>
                <label className="text-sm text-slate-700 font-medium">Email</label>
                <Input value={user?.email || ""} disabled className="bg-slate-50 text-slate-600" />
              </div>

              {error ? (
                <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl p-3">
                  {error}
                </div>
              ) : null}

              <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between pt-2">
                <Button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 text-white w-full sm:w-auto"
                  disabled={!hasChanges || updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? "Salvando..." : "Salvar alterações"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="border-slate-200 w-full sm:w-auto"
                  onClick={async () => {
                    setError(null);
                    await refresh();
                  }}
                  disabled={updateProfileMutation.isPending}
                >
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Atualizar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


import React, { useState } from "react";
import { api } from "@/api/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parseISO, differenceInYears } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Baby, Plus, Pencil, Trash2, Droplet, AlertCircle, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PageHeader from "../components/shared/PageHeader";
import EmptyState from "../components/shared/EmptyState";
import InviteCodeCard from "../components/children/InviteCodeCard";
import { Link } from "react-router-dom";
import { useAccessibleChildren } from "../hooks/useAccessibleChildren";

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 3; i++) code += chars[Math.floor(Math.random() * chars.length)];
  code += "-";
  for (let i = 0; i < 3; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export default function Criancas() {
  const [showForm, setShowForm] = useState(false);
  const [editingChild, setEditingChild] = useState(null);
  const [formData, setFormData] = useState({});
  const queryClient = useQueryClient();

  const { children, me } = useAccessibleChildren();

  const createChild = useMutation({
    mutationFn: (d) => api.children.create(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["children"] }); closeForm(); },
  });
  const updateChild = useMutation({
    mutationFn: ({ id, data }) => api.children.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["children"] }); closeForm(); },
  });
  const deleteChild = useMutation({
    mutationFn: (id) => api.children.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["children"] }),
  });

  const closeForm = () => { setShowForm(false); setEditingChild(null); setFormData({}); };
  const openEdit = (child) => { setEditingChild(child); setFormData(child); setShowForm(true); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingChild) {
      updateChild.mutate({ id: editingChild.id, data: formData });
    } else {
      // Gera código único ao criar criança
      createChild.mutate({ ...formData, invite_code: generateCode(), owner_email: me?.email, caregiver_emails: [] });
    }
  };

  const regenCode = (child) => {
    updateChild.mutate({ id: child.id, data: { invite_code: generateCode() } });
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { file_url } = await api.files.upload(file);
    setFormData(prev => ({ ...prev, photo_url: file_url }));
  };

  const getAge = (birthDate) => {
    if (!birthDate) return null;
    const years = differenceInYears(new Date(), parseISO(birthDate));
    return years;
  };

  const getInitials = (name) => {
    return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
  };

  const avatarColors = ["bg-teal-100 text-teal-700", "bg-violet-100 text-violet-700", "bg-rose-100 text-rose-700", "bg-amber-100 text-amber-700"];

  const custodyDays = [
    { key: "seg", label: "Seg" },
    { key: "ter", label: "Ter" },
    { key: "qua", label: "Qua" },
    { key: "qui", label: "Qui" },
    { key: "sex", label: "Sex" },
    { key: "sab", label: "Sáb" },
    { key: "dom", label: "Dom" },
  ];

  const toggleCustodyDay = (fieldKey, dayKey) => {
    setFormData((prev) => {
      const list = Array.isArray(prev?.[fieldKey]) ? prev[fieldKey] : [];
      const has = list.includes(dayKey);
      return {
        ...prev,
        [fieldKey]: has ? list.filter((d) => d !== dayKey) : [...list, dayKey],
      };
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Crianças"
        description="Perfis das crianças"
        action={
          <div className="flex gap-2">
            <Link to="/EntrarPorCodigo">
              <Button variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50">
                <Link2 className="w-4 h-4 mr-2" /> Entrar por Código
              </Button>
            </Link>
            <Button onClick={() => { setFormData({ parent_a_days: [], parent_b_days: [] }); setEditingChild(null); setShowForm(true); }} className="bg-teal-600 hover:bg-teal-700">
              <Plus className="w-4 h-4 mr-2" /> Adicionar Criança
            </Button>
          </div>
        }
      />

      {children.length === 0 ? (
        <EmptyState
          icon={Baby}
          title="Nenhuma criança cadastrada"
          description="Cadastre as crianças para começar a organizar a agenda familiar"
          action={
            <Button onClick={() => { setFormData({ parent_a_days: [], parent_b_days: [] }); setShowForm(true); }} className="bg-teal-600 hover:bg-teal-700">
              <Plus className="w-4 h-4 mr-2" /> Adicionar Criança
            </Button>
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {children.map((child, i) => {
            const age = getAge(child.birth_date);
            return (
              <Card key={child.id} className="border-0 shadow-sm group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={child.photo_url} />
                        <AvatarFallback className={avatarColors[i % avatarColors.length]}>
                          {getInitials(child.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-base font-semibold text-slate-900">{child.name}</h3>
                        {age !== null && (
                          <p className="text-xs text-slate-400">{age} {age === 1 ? "ano" : "anos"}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(child)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                        <Pencil className="w-4 h-4 text-slate-400" />
                      </button>
                      <button onClick={() => deleteChild.mutate(child.id)} className="p-1.5 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {child.birth_date && (
                      <p className="text-xs text-slate-500">
                        🎂 {format(parseISO(child.birth_date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </p>
                    )}
                    {child.blood_type && (
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Droplet className="w-3 h-3 text-red-400" /> Tipo sanguíneo: {child.blood_type}
                      </p>
                    )}
                    {child.allergies && (
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-amber-400" /> {child.allergies}
                      </p>
                    )}
                    {child.notes && (
                      <p className="text-xs text-slate-400 mt-2">{child.notes}</p>
                    )}
                  </div>

                  {child.invite_code ? (
                    <InviteCodeCard child={child} onRegen={() => regenCode(child)} />
                  ) : (
                    <button
                      onClick={() => updateChild.mutate({ id: child.id, data: { invite_code: generateCode(), caregiver_emails: child.caregiver_emails || [] } })}
                      className="mt-4 w-full text-xs text-teal-600 hover:text-teal-800 border border-dashed border-teal-200 rounded-xl py-2 transition-colors"
                    >
                      + Gerar código de convite
                    </button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={closeForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingChild ? "Editar Criança" : "Nova Criança"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-center">
              <label className="cursor-pointer">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={formData.photo_url} />
                  <AvatarFallback className="bg-slate-100 text-slate-400 text-lg">
                    {formData.name ? getInitials(formData.name) : "📷"}
                  </AvatarFallback>
                </Avatar>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </label>
            </div>
            <div>
              <Label>Nome completo *</Label>
              <Input value={formData.name || ""} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Data de nascimento</Label>
                <Input type="date" value={formData.birth_date || ""} onChange={e => setFormData({...formData, birth_date: e.target.value})} />
              </div>
              <div>
                <Label>Tipo sanguíneo</Label>
                <Select value={formData.blood_type || ""} onValueChange={v => setFormData({...formData, blood_type: v})}>
                  <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                  <SelectContent>
                    {bloodTypes.map(bt => <SelectItem key={bt} value={bt}>{bt}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Alergias</Label>
              <Input value={formData.allergies || ""} onChange={e => setFormData({...formData, allergies: e.target.value})} placeholder="Ex: Amendoim, Penicilina" />
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea value={formData.notes || ""} onChange={e => setFormData({...formData, notes: e.target.value})} />
            </div>

            <div className="pt-2 border-t border-slate-100">
              <div className="text-sm font-semibold text-slate-900 mb-2">Convivência (pais separados)</div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome do responsável 1</Label>
                  <Input
                    value={formData.parent_a_name || ""}
                    onChange={(e) => setFormData({ ...formData, parent_a_name: e.target.value })}
                    placeholder="Ex: João da Silva"
                  />
                  <div className="flex flex-wrap gap-2">
                    {custodyDays.map((d) => (
                      <label
                        key={d.key}
                        className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-xl border border-slate-200 bg-white cursor-pointer hover:bg-slate-50"
                      >
                        <input
                          type="checkbox"
                          className="rounded border-teal-200 text-teal-600"
                          checked={(formData.parent_a_days || []).includes(d.key)}
                          onChange={() => toggleCustodyDay("parent_a_days", d.key)}
                        />
                        {d.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Nome do responsável 2</Label>
                  <Input
                    value={formData.parent_b_name || ""}
                    onChange={(e) => setFormData({ ...formData, parent_b_name: e.target.value })}
                    placeholder="Ex: Maria Souza"
                  />
                  <div className="flex flex-wrap gap-2">
                    {custodyDays.map((d) => (
                      <label
                        key={d.key}
                        className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-xl border border-slate-200 bg-white cursor-pointer hover:bg-slate-50"
                      >
                        <input
                          type="checkbox"
                          className="rounded border-teal-200 text-teal-600"
                          checked={(formData.parent_b_days || []).includes(d.key)}
                          onChange={() => toggleCustodyDay("parent_b_days", d.key)}
                        />
                        {d.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Observações da convivência</Label>
                  <Textarea
                    value={formData.custody_notes || ""}
                    onChange={(e) => setFormData({ ...formData, custody_notes: e.target.value })}
                    placeholder="Ex: horários, trocas, orientações"
                  />
                </div>
              </div>
            </div>
            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={createChild.isPending || updateChild.isPending}>
              {(createChild.isPending || updateChild.isPending) ? "Salvando..." : editingChild ? "Salvar Alterações" : "Adicionar Criança"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
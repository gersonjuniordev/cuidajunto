import React, { useState } from "react";
import { api } from "@/api/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileText, Plus, Download, Trash2, Upload, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import PageHeader from "../components/shared/PageHeader";
import ChildSelector from "../components/shared/ChildSelector";
import EmptyState from "../components/shared/EmptyState";
import { useAccessibleChildren } from "../hooks/useAccessibleChildren";

const categoryLabels = {
  identidade: "Identidade",
  certidao_nascimento: "Certidão de Nascimento",
  plano_saude: "Plano de Saúde",
  carteira_vacinacao: "Carteira de Vacinação",
  escolar: "Escolar",
  judicial: "Judicial",
  outro: "Outros",
};

const categoryIcons = {
  identidade: "🪪",
  certidao_nascimento: "📄",
  plano_saude: "🏥",
  carteira_vacinacao: "💉",
  escolar: "🎒",
  judicial: "⚖️",
  outro: "📁",
};

export default function Documentos() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [childFilter, setChildFilter] = useState("all");
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const { children, me } = useAccessibleChildren();
  const childIds = children.map(c => c.id);

  const { data: allDocuments = [] } = useQuery({
    queryKey: ["documents"],
    queryFn: () => api.documents.list(500),
  });

  const documents = allDocuments.filter(d => childIds.includes(d.child_id));

  const createDoc = useMutation({
    mutationFn: (d) => api.documents.create(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["documents"] }); setShowForm(false); setFormData({}); },
  });
  const deleteDoc = useMutation({
    mutationFn: (id) => api.documents.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["documents"] }),
  });

  const childMap = Object.fromEntries(children.map(c => [c.id, c.name]));
  const filtered = childFilter === "all" ? documents : documents.filter(d => d.child_id === childFilter);
  const today = format(new Date(), "yyyy-MM-dd");

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await api.files.upload(file);
    setFormData(prev => ({ ...prev, file_url }));
    setUploading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createDoc.mutate(formData);
  };

  // Group by category
  const grouped = {};
  filtered.forEach(doc => {
    const cat = doc.category || "outro";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(doc);
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documentos"
        description="Documentos pessoais das crianças"
        action={
          <div className="flex items-center gap-3">
            <ChildSelector children={children} value={childFilter} onChange={setChildFilter} />
            <Button onClick={() => { setFormData({}); setShowForm(true); }} className="bg-teal-600 hover:bg-teal-700">
              <Plus className="w-4 h-4 mr-2" /> Novo Documento
            </Button>
          </div>
        }
      />

      {filtered.length === 0 ? (
        <EmptyState icon={FileText} title="Nenhum documento" description="Adicione documentos importantes como identidade, plano de saúde e certidões" />
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, docs]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <span>{categoryIcons[category]}</span>
                {categoryLabels[category] || category}
                <Badge variant="secondary" className="text-[10px]">{docs.length}</Badge>
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {docs.map(doc => {
                  const expired = doc.expiry_date && doc.expiry_date < today;
                  return (
                    <Card key={doc.id} className="border-0 shadow-sm group">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">{doc.title}</p>
                            {doc.child_id && childMap[doc.child_id] && (
                              <Badge variant="secondary" className="mt-1 text-[10px]">{childMap[doc.child_id]}</Badge>
                            )}
                            {doc.expiry_date && (
                              <p className={`text-xs mt-1.5 flex items-center gap-1 ${expired ? "text-red-500" : "text-slate-400"}`}>
                                {expired && <AlertTriangle className="w-3 h-3" />}
                                {expired ? "Vencido: " : "Validade: "}
                                {format(parseISO(doc.expiry_date), "d MMM yyyy", { locale: ptBR })}
                              </p>
                            )}
                            {doc.notes && <p className="text-xs text-slate-400 mt-1 truncate">{doc.notes}</p>}
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-slate-100 rounded-lg">
                              <Download className="w-4 h-4 text-slate-500" />
                            </a>
                            <button onClick={() => deleteDoc.mutate(doc.id)} className="p-1.5 hover:bg-red-50 rounded-lg">
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Novo Documento</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Título *</Label>
              <Input value={formData.title || ""} onChange={e => setFormData({...formData, title: e.target.value})} required />
            </div>
            <div>
              <Label>Criança *</Label>
              <Select value={formData.child_id || ""} onValueChange={v => setFormData({...formData, child_id: v})}>
                <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>
                  {children.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Categoria</Label>
              <Select value={formData.category || ""} onValueChange={v => setFormData({...formData, category: v})}>
                <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Arquivo *</Label>
              <div className="mt-1">
                {formData.file_url ? (
                  <div className="flex items-center gap-2 p-3 bg-teal-50 rounded-xl">
                    <FileText className="w-4 h-4 text-teal-600" />
                    <span className="text-sm text-teal-700">Arquivo carregado</span>
                  </div>
                ) : (
                  <label className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-teal-300 transition-colors">
                    <Upload className="w-6 h-6 text-slate-400" />
                    <span className="text-sm text-slate-500">{uploading ? "Enviando..." : "Clique para enviar"}</span>
                    <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                  </label>
                )}
              </div>
            </div>
            <div>
              <Label>Data de validade</Label>
              <Input type="date" value={formData.expiry_date || ""} onChange={e => setFormData({...formData, expiry_date: e.target.value})} />
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea value={formData.notes || ""} onChange={e => setFormData({...formData, notes: e.target.value})} />
            </div>
            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={createDoc.isPending || !formData.file_url}>
              {createDoc.isPending ? "Salvando..." : "Salvar Documento"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
import React, { useState } from "react";
import { api } from "@/api/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Pill, Plus, Clock, CheckCircle2, Trash2, History } from "lucide-react";
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

export default function Medicamentos() {
  const [showForm, setShowForm] = useState(false);
  const [showLog, setShowLog] = useState(null);
  const [formData, setFormData] = useState({});
  const [childFilter, setChildFilter] = useState("all");
  const queryClient = useQueryClient();

  const { children, me } = useAccessibleChildren();
  const childIds = children.map(c => c.id);

  const { data: allMedications = [] } = useQuery({
    queryKey: ["medications"],
    queryFn: () => api.medications.list(300),
  });
  const { data: logs = [] } = useQuery({
    queryKey: ["medication_logs"],
    queryFn: () => api.medicationLogs.list(300),
  });

  const medications = allMedications.filter(m => childIds.includes(m.child_id));

  const createMed = useMutation({
    mutationFn: (d) => api.medications.create(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["medications"] }); setShowForm(false); setFormData({}); },
  });
  const deleteMed = useMutation({
    mutationFn: (id) => api.medications.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["medications"] }),
  });
  const createLog = useMutation({
    mutationFn: (d) => api.medicationLogs.create(d),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["medication_logs"] }),
  });

  const childMap = Object.fromEntries(children.map(c => [c.id, c.name]));
  const filtered = childFilter === "all" ? medications : medications.filter(m => m.child_id === childFilter);

  const handleAdminister = (med) => {
    createLog.mutate({
      medication_id: med.id,
      child_id: med.child_id,
      administered_at: new Date().toISOString(),
      administered_by: "Eu",
    });
  };

  const getMedLogs = (medId) => logs.filter(l => l.medication_id === medId).sort((a,b) => (b.administered_at || b.created_date).localeCompare(a.administered_at || a.created_date));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Medicamentos"
        description="Controle de medicamentos e administração"
        action={
          <div className="flex items-center gap-3">
            <ChildSelector children={children} value={childFilter} onChange={setChildFilter} />
            <Button onClick={() => { setFormData({ active: true }); setShowForm(true); }} className="bg-teal-600 hover:bg-teal-700">
              <Plus className="w-4 h-4 mr-2" /> Novo Medicamento
            </Button>
          </div>
        }
      />

      {filtered.length === 0 ? (
        <EmptyState icon={Pill} title="Nenhum medicamento" description="Adicione medicamentos para controlar a administração" />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map(med => {
            const recentLog = getMedLogs(med.id)[0];
            return (
              <Card key={med.id} className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800">{med.name}</h3>
                      {med.child_id && childMap[med.child_id] && (
                        <Badge variant="secondary" className="mt-1 text-[10px]">{childMap[med.child_id]}</Badge>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => setShowLog(med.id)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                        <History className="w-4 h-4 text-slate-400" />
                      </button>
                      <button onClick={() => deleteMed.mutate(med.id)} className="p-1.5 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 mb-4">
                    <p className="text-xs text-slate-500"><span className="font-medium">Dosagem:</span> {med.dosage}</p>
                    {med.frequency && <p className="text-xs text-slate-500"><span className="font-medium">Frequência:</span> {med.frequency}</p>}
                    {med.instructions && <p className="text-xs text-slate-500"><span className="font-medium">Instruções:</span> {med.instructions}</p>}
                    {med.start_date && (
                      <p className="text-xs text-slate-400">
                        {format(parseISO(med.start_date), "d MMM", { locale: ptBR })}
                        {med.end_date && ` — ${format(parseISO(med.end_date), "d MMM", { locale: ptBR })}`}
                      </p>
                    )}
                  </div>

                  {recentLog && (
                    <p className="text-[11px] text-slate-400 mb-3 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-teal-500" />
                      Última dose: {format(new Date(recentLog.administered_at || recentLog.created_date), "d MMM 'às' HH:mm", { locale: ptBR })}
                    </p>
                  )}

                  <Button
                    onClick={() => handleAdminister(med)}
                    variant="outline"
                    className="w-full text-teal-700 border-teal-200 hover:bg-teal-50"
                    disabled={createLog.isPending}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Registrar Administração
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Log History Dialog */}
      <Dialog open={!!showLog} onOpenChange={() => setShowLog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Histórico de Administração</DialogTitle></DialogHeader>
          <div className="max-h-80 overflow-y-auto space-y-2">
            {showLog && getMedLogs(showLog).length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">Nenhum registro</p>
            ) : (
              showLog && getMedLogs(showLog).map(log => (
                <div key={log.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-700">
                      {format(new Date(log.administered_at || log.created_date), "d MMM yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                    {log.administered_by && <p className="text-xs text-slate-400">Por: {log.administered_by}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* New Medication Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Novo Medicamento</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); createMed.mutate(formData); }} className="space-y-4">
            <div>
              <Label>Nome do Medicamento *</Label>
              <Input value={formData.name || ""} onChange={e => setFormData({...formData, name: e.target.value})} required />
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
              <Label>Dosagem *</Label>
              <Input value={formData.dosage || ""} onChange={e => setFormData({...formData, dosage: e.target.value})} placeholder="Ex: 5ml, 1 comprimido" required />
            </div>
            <div>
              <Label>Frequência</Label>
              <Input value={formData.frequency || ""} onChange={e => setFormData({...formData, frequency: e.target.value})} placeholder="Ex: 8 em 8 horas" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Início</Label>
                <Input type="date" value={formData.start_date || ""} onChange={e => setFormData({...formData, start_date: e.target.value})} />
              </div>
              <div>
                <Label>Término</Label>
                <Input type="date" value={formData.end_date || ""} onChange={e => setFormData({...formData, end_date: e.target.value})} />
              </div>
            </div>
            <div>
              <Label>Instruções</Label>
              <Textarea value={formData.instructions || ""} onChange={e => setFormData({...formData, instructions: e.target.value})} />
            </div>
            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={createMed.isPending}>
              {createMed.isPending ? "Salvando..." : "Salvar Medicamento"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
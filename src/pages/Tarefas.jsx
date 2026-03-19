import React, { useState } from "react";
import { api } from "@/api/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckSquare, Plus, Circle, CheckCircle2, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeader from "../components/shared/PageHeader";
import ChildSelector from "../components/shared/ChildSelector";
import EmptyState from "../components/shared/EmptyState";
import { useAccessibleChildren } from "../hooks/useAccessibleChildren";

const priorityLabels = { baixa: "Baixa", media: "Média", alta: "Alta" };
const priorityColors = { baixa: "bg-green-100 text-green-700", media: "bg-amber-100 text-amber-700", alta: "bg-red-100 text-red-700" };

export default function Tarefas() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [childFilter, setChildFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("pendentes");
  const queryClient = useQueryClient();

  const { children, me } = useAccessibleChildren();
  const childIds = children.map(c => c.id);

  const { data: allTasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => api.tasks.list(500),
  });

  // Mostra tarefas das crianças acessíveis + tarefas sem criança criadas pelo próprio usuário
  const tasks = allTasks.filter(t =>
    (t.child_id && childIds.includes(t.child_id)) ||
    (!t.child_id && t.created_by === me?.email)
  );

  const createTask = useMutation({
    mutationFn: (d) => api.tasks.create(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["tasks"] }); setShowForm(false); setFormData({}); },
  });
  const updateTask = useMutation({
    mutationFn: ({ id, data }) => api.tasks.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });
  const deleteTask = useMutation({
    mutationFn: (id) => api.tasks.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const filtered = tasks
    .filter(t => childFilter === "all" || t.child_id === childFilter)
    .filter(t => {
      if (statusFilter === "pendentes") return t.status !== "concluida";
      if (statusFilter === "concluidas") return t.status === "concluida";
      return true;
    });

  const today = format(new Date(), "yyyy-MM-dd");
  const childMap = Object.fromEntries(children.map(c => [c.id, c.name]));

  const toggleStatus = (task) => {
    const newStatus = task.status === "concluida" ? "pendente" : "concluida";
    updateTask.mutate({ id: task.id, data: { status: newStatus } });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tarefas"
        description="Organize as tarefas dos cuidadores"
        action={
          <Button onClick={() => { setFormData({}); setShowForm(true); }} className="bg-teal-600 hover:bg-teal-700">
            <Plus className="w-4 h-4 mr-2" /> Nova Tarefa
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList>
            <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
            <TabsTrigger value="concluidas">Concluídas</TabsTrigger>
            <TabsTrigger value="todas">Todas</TabsTrigger>
          </TabsList>
        </Tabs>
        <ChildSelector children={children} value={childFilter} onChange={setChildFilter} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={CheckSquare} title="Nenhuma tarefa" description="Adicione tarefas para organizar o dia a dia" />
      ) : (
        <div className="space-y-2">
          {filtered.map(task => {
            const overdue = task.due_date && task.due_date < today && task.status !== "concluida";
            const done = task.status === "concluida";
            return (
              <Card key={task.id} className="border-0 shadow-sm">
                <CardContent className="p-4 flex items-center gap-3">
                  <button onClick={() => toggleStatus(task)} className="flex-shrink-0">
                    {done 
                      ? <CheckCircle2 className="w-5 h-5 text-teal-500" />
                      : <Circle className="w-5 h-5 text-slate-300 hover:text-teal-400 transition-colors" />
                    }
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${done ? "line-through text-slate-400" : "text-slate-800"}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {task.due_date && (
                        <span className={`text-xs flex items-center gap-1 ${overdue ? "text-red-500" : "text-slate-400"}`}>
                          <Clock className="w-3 h-3" />
                          {format(parseISO(task.due_date), "d MMM", { locale: ptBR })}
                        </span>
                      )}
                      {task.child_id && childMap[task.child_id] && (
                        <Badge variant="secondary" className="text-[10px]">{childMap[task.child_id]}</Badge>
                      )}
                      {task.priority && (
                        <Badge variant="secondary" className={`text-[10px] ${priorityColors[task.priority]}`}>
                          {priorityLabels[task.priority]}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteTask.mutate(task.id)}
                    className="p-1.5 hover:bg-red-50 rounded-lg transition-all opacity-50 hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Nova Tarefa</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); createTask.mutate(formData); }} className="space-y-4">
            <div>
              <Label>Título *</Label>
              <Input value={formData.title || ""} onChange={e => setFormData({...formData, title: e.target.value})} required />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea value={formData.description || ""} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Data limite</Label>
                <Input type="date" value={formData.due_date || ""} onChange={e => setFormData({...formData, due_date: e.target.value})} />
              </div>
              <div>
                <Label>Prioridade</Label>
                <Select value={formData.priority || "media"} onValueChange={v => setFormData({...formData, priority: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(priorityLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Criança</Label>
              <Select value={formData.child_id || ""} onValueChange={v => setFormData({...formData, child_id: v})}>
                <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>
                  {children.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={createTask.isPending}>
              {createTask.isPending ? "Salvando..." : "Salvar Tarefa"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
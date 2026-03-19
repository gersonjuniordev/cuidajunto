import React, { useEffect, useState } from "react";
import { api } from "@/api/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, parseISO, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Plus, ChevronLeft, ChevronRight, MapPin, Clock, Trash2 } from "lucide-react";
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
  consulta: "Consulta",
  escola: "Escola",
  atividade: "Atividade",
  viagem: "Viagem",
  aniversario: "Aniversário",
  outro: "Outro",
};

const categoryColors = {
  consulta: "bg-red-100 text-red-700",
  escola: "bg-blue-100 text-blue-700",
  atividade: "bg-green-100 text-green-700",
  viagem: "bg-purple-100 text-purple-700",
  aniversario: "bg-pink-100 text-pink-700",
  outro: "bg-slate-100 text-slate-700",
};

export default function Agenda() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [childFilter, setChildFilter] = useState("all");
  const [formData, setFormData] = useState({});
  const [reportText, setReportText] = useState("");
  const queryClient = useQueryClient();

  const { children, me } = useAccessibleChildren();
  const childIds = children.map(c => c.id);

  const { data: allEvents = [] } = useQuery({
    queryKey: ["events"],
    queryFn: () => api.events.list(500),
  });

  const events = allEvents.filter(e =>
    (e.child_id && childIds.includes(e.child_id)) ||
    (!e.child_id && e.created_by === me?.email)
  );

  const createEvent = useMutation({
    mutationFn: (data) => api.events.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["events"] }); setShowForm(false); setFormData({}); },
  });
  const deleteEvent = useMutation({
    mutationFn: (id) => api.events.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["events"] }),
  });

  const filteredEvents = childFilter === "all" ? events : events.filter(e => e.child_id === childFilter);

  const selectedChildId = childFilter === "all" ? null : childFilter;
  const selectedDateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null;

  const {
    data: dailyReport,
    refetch: refetchDailyReport,
  } = useQuery({
    queryKey: ["daily_report", selectedChildId, selectedDateStr],
    queryFn: () => {
      if (!selectedChildId || !selectedDateStr) return Promise.resolve(null);
      return api.dailyReports.get(selectedChildId, selectedDateStr);
    },
    enabled: !!selectedChildId && !!selectedDateStr,
  });

  useEffect(() => {
    setReportText(dailyReport?.report_text || "");
  }, [dailyReport, selectedChildId, selectedDateStr]);

  const upsertDailyReport = useMutation({
    mutationFn: (payload) => api.dailyReports.upsert(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily_report", selectedChildId, selectedDateStr] });
      refetchDailyReport();
    },
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);

  const getEventsForDay = (day) => filteredEvents.filter(e => e.date && isSameDay(parseISO(e.date), day));

  const selectedDayEvents = selectedDate 
    ? filteredEvents.filter(e => e.date && isSameDay(parseISO(e.date), selectedDate)).sort((a,b) => (a.time || "").localeCompare(b.time || ""))
    : [];

  const openNewEvent = () => {
    setFormData({ date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd") });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createEvent.mutate(formData);
  };

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agenda"
        description="Compromissos e eventos da família"
        action={
          <div className="flex items-center gap-3">
            <ChildSelector children={children} value={childFilter} onChange={setChildFilter} />
            <Button onClick={openNewEvent} className="bg-teal-600 hover:bg-teal-700">
              <Plus className="w-4 h-4 mr-2" /> Novo Evento
            </Button>
          </div>
        }
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-5">
              <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-slate-100 rounded-lg">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h2 className="text-base font-semibold text-slate-900 capitalize">
                {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
              </h2>
              <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-slate-100 rounded-lg">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {weekDays.map(d => (
                <div key={d} className="text-center text-[11px] font-medium text-slate-400 py-2">{d}</div>
              ))}
              {Array.from({ length: startDayOfWeek }).map((_, i) => <div key={`empty-${i}`} />)}
              {days.map(day => {
                const dayEvents = getEventsForDay(day);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={`relative p-2 rounded-xl text-sm transition-all min-h-[52px] flex flex-col items-center ${
                      isSelected ? "bg-teal-600 text-white" :
                      isToday ? "bg-teal-50 text-teal-700 font-semibold" :
                      "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    {format(day, "d")}
                    {dayEvents.length > 0 && (
                      <div className="flex gap-0.5 mt-1">
                        {dayEvents.slice(0, 3).map((ev, i) => (
                          <div key={i} className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white/70" : categoryColors[ev.category] || "bg-slate-400"}`} />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Day Detail */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <h3 className="text-base font-semibold text-slate-900 mb-4">
              {selectedDate ? format(selectedDate, "d 'de' MMMM", { locale: ptBR }) : "Selecione um dia"}
            </h3>
            {!selectedDate ? (
              <p className="text-sm text-slate-400 text-center py-8">Clique em um dia no calendário</p>
            ) : (
              <div className="space-y-5">
                {selectedDayEvents.length === 0 ? (
                  <EmptyState icon={Calendar} title="Sem eventos" description="Nenhum evento neste dia" />
                ) : (
                  <div className="space-y-3">
                    {selectedDayEvents.map(event => (
                      <div key={event.id} className="p-3 rounded-xl bg-slate-50 group">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium text-slate-800">{event.title}</p>
                            {event.time && (
                              <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                                <Clock className="w-3 h-3" /> {event.time}
                              </p>
                            )}
                            {event.location && (
                              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3" /> {event.location}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => deleteEvent.mutate(event.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        </div>
                        {event.category && (
                          <Badge variant="secondary" className="mt-2 text-[10px]">{categoryLabels[event.category]}</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">Relatório do dia</h4>

                  {!selectedChildId ? (
                    <p className="text-sm text-slate-400">
                      Selecione uma criança acima para preencher o relatório.
                    </p>
                  ) : (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        upsertDailyReport.mutate({
                          child_id: selectedChildId,
                          date: selectedDateStr,
                          report_text: reportText,
                        });
                      }}
                      className="space-y-3"
                    >
                      <Textarea
                        value={reportText}
                        onChange={(e) => setReportText(e.target.value)}
                        placeholder="Descreva o dia da criança (ex.: alimentação, sono, humor, atividades, observações)..."
                        className="min-h-[120px]"
                      />
                      <Button
                        type="submit"
                        className="w-full bg-teal-600 hover:bg-teal-700"
                        disabled={upsertDailyReport.isPending}
                      >
                        {upsertDailyReport.isPending ? "Salvando..." : "Salvar relatório"}
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* New Event Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Evento</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Título *</Label>
              <Input value={formData.title || ""} onChange={e => setFormData({...formData, title: e.target.value})} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Data *</Label>
                <Input type="date" value={formData.date || ""} onChange={e => setFormData({...formData, date: e.target.value})} required />
              </div>
              <div>
                <Label>Horário</Label>
                <Input type="time" value={formData.time || ""} onChange={e => setFormData({...formData, time: e.target.value})} />
              </div>
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
              <Label>Criança</Label>
              <Select value={formData.child_id || ""} onValueChange={v => setFormData({...formData, child_id: v})}>
                <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>
                  {children.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Local</Label>
              <Input value={formData.location || ""} onChange={e => setFormData({...formData, location: e.target.value})} />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea value={formData.description || ""} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={createEvent.isPending}>
              {createEvent.isPending ? "Salvando..." : "Salvar Evento"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
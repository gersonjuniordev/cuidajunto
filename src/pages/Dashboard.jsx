import React from "react";
import { api } from "@/api/client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { format, isToday, isTomorrow, isPast, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Calendar, CheckSquare, Pill, Baby, 
  Clock, ChevronRight 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "../components/shared/PageHeader";
import { useNotifications } from "@/hooks/useNotifications";
import AlertsSummary from "@/components/notifications/AlertsSummary";
import { useAccessibleChildren } from "@/hooks/useAccessibleChildren";

const StatCard = ({ icon: Icon, label, value, color, to }) => (
  <Link to={to}>
    <Card className="hover:shadow-md transition-shadow cursor-pointer border-0 shadow-sm">
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-xs text-slate-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  </Link>
);

export default function Dashboard() {
  const { children, isLoading: loadingChildren } = useAccessibleChildren();
  const childIds = children.map(c => c.id);

  const { data: allEvents = [], isLoading: loadingEvents } = useQuery({
    queryKey: ["events"],
    queryFn: () => api.events.list(200),
  });
  const { data: allTasks = [], isLoading: loadingTasks } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => api.tasks.list(200),
  });
  const { data: allMedications = [], isLoading: loadingMeds } = useQuery({
    queryKey: ["medications"],
    queryFn: () => api.medications.list(200),
  });
  const { data: medicationLogs = [] } = useQuery({
    queryKey: ["medication_logs"],
    queryFn: () => api.medicationLogs.list(300),
  });

  const events = allEvents.filter(e => !e.child_id || childIds.includes(e.child_id));
  const tasks = allTasks.filter(t => !t.child_id || childIds.includes(t.child_id));
  const medications = allMedications.filter(m => childIds.includes(m.child_id));

  const { notifications } = useNotifications({
    tasks, events, medications, children, medicationLogs,
  });

  const isLoading = loadingChildren || loadingEvents || loadingTasks || loadingMeds;

  const today = format(new Date(), "yyyy-MM-dd");
  const upcomingEvents = events
    .filter(e => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  const pendingTasks = tasks.filter(t => t.status !== "concluida").slice(0, 5);
  const overdueTasks = tasks.filter(t => t.status !== "concluida" && t.due_date && t.due_date < today);

  const formatEventDate = (dateStr) => {
    const d = parseISO(dateStr);
    if (isToday(d)) return "Hoje";
    if (isTomorrow(d)) return "Amanhã";
    return format(d, "d MMM", { locale: ptBR });
  };

  const categoryColors = {
    consulta: "bg-red-100 text-red-700",
    escola: "bg-blue-100 text-blue-700",
    atividade: "bg-green-100 text-green-700",
    viagem: "bg-purple-100 text-purple-700",
    aniversario: "bg-pink-100 text-pink-700",
    outro: "bg-slate-100 text-slate-700",
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Olá! 👋" 
        description="Confira o resumo da agenda familiar"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Baby} label="Crianças" value={children.length} color="bg-teal-500" to="/Criancas" />
        <StatCard icon={Calendar} label="Próximos eventos" value={upcomingEvents.length} color="bg-violet-500" to="/Agenda" />
        <StatCard icon={CheckSquare} label="Tarefas pendentes" value={pendingTasks.length} color="bg-orange-500" to="/Tarefas" />
        <StatCard icon={Pill} label="Medicamentos ativos" value={medications.length} color="bg-rose-500" to="/Medicamentos" />
      </div>

      {/* Alertas Ativos */}
      <AlertsSummary notifications={notifications} />

      <div className="grid md:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-slate-900">Próximos Eventos</h2>
              <Link to="/Agenda" className="text-xs text-teal-600 hover:text-teal-700 flex items-center gap-1">
                Ver tudo <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-slate-400 py-8 text-center">Nenhum evento próximo</p>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                    <div className="text-center min-w-[44px]">
                      <p className="text-xs font-medium text-teal-600">{formatEventDate(event.date)}</p>
                      {event.time && <p className="text-[11px] text-slate-400">{event.time}</p>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{event.title}</p>
                      {event.location && <p className="text-xs text-slate-400 truncate">{event.location}</p>}
                    </div>
                    {event.category && (
                      <Badge variant="secondary" className={`text-[10px] ${categoryColors[event.category] || categoryColors.outro}`}>
                        {event.category}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-slate-900">Tarefas Pendentes</h2>
              <Link to="/Tarefas" className="text-xs text-teal-600 hover:text-teal-700 flex items-center gap-1">
                Ver tudo <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            {pendingTasks.length === 0 ? (
              <p className="text-sm text-slate-400 py-8 text-center">Nenhuma tarefa pendente</p>
            ) : (
              <div className="space-y-3">
                {pendingTasks.map((task) => {
                  const overdue = task.due_date && task.due_date < today;
                  return (
                    <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        task.priority === "alta" ? "bg-red-400" : 
                        task.priority === "media" ? "bg-amber-400" : "bg-green-400"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{task.title}</p>
                        {task.due_date && (
                          <p className={`text-xs ${overdue ? "text-red-500" : "text-slate-400"}`}>
                            {overdue ? "Atrasada — " : ""}{formatEventDate(task.due_date)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
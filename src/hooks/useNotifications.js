import { useMemo } from "react";
import { differenceInDays, differenceInHours, parseISO, format, isToday, isTomorrow } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Gera notificações a partir das entidades carregadas.
 * Retorna um array de objetos de notificação ordenados por urgência.
 */
export function useNotifications({ tasks = [], events = [], medications = [], children = [], medicationLogs = [] }) {
  const notifications = useMemo(() => {
    const now = new Date();
    const todayStr = format(now, "yyyy-MM-dd");
    const items = [];

    const childMap = Object.fromEntries(children.map(c => [c.id, c.name]));

    // ─── TAREFAS ───────────────────────────────────────────────────────────────
    tasks.forEach(task => {
      if (task.status === "concluida") return;

      if (!task.due_date) return;
      const daysLeft = differenceInDays(parseISO(task.due_date), now);

      if (daysLeft < 0) {
        items.push({
          id: `task-overdue-${task.id}`,
          type: "task",
          urgency: "critical",
          title: "Tarefa atrasada",
          message: task.title,
          detail: `Venceu ${Math.abs(daysLeft)} dia${Math.abs(daysLeft) !== 1 ? "s" : ""} atrás`,
          child: childMap[task.child_id],
          link: "/Tarefas",
          icon: "⚠️",
        });
      } else if (daysLeft === 0) {
        items.push({
          id: `task-today-${task.id}`,
          type: "task",
          urgency: "high",
          title: "Tarefa vence hoje",
          message: task.title,
          detail: "Prazo: hoje",
          child: childMap[task.child_id],
          link: "/Tarefas",
          icon: "📋",
        });
      } else if (daysLeft <= 2) {
        items.push({
          id: `task-soon-${task.id}`,
          type: "task",
          urgency: "medium",
          title: "Tarefa próxima do prazo",
          message: task.title,
          detail: `Vence em ${daysLeft} dia${daysLeft !== 1 ? "s" : ""}`,
          child: childMap[task.child_id],
          link: "/Tarefas",
          icon: "📋",
        });
      }
    });

    // ─── EVENTOS ───────────────────────────────────────────────────────────────
    events.forEach(event => {
      if (!event.date) return;
      const daysLeft = differenceInDays(parseISO(event.date), now);

      if (daysLeft === 0) {
        items.push({
          id: `event-today-${event.id}`,
          type: "event",
          urgency: "high",
          title: "Evento hoje",
          message: event.title,
          detail: event.time ? `Às ${event.time}${event.location ? ` • ${event.location}` : ""}` : event.location || "Hoje",
          child: childMap[event.child_id],
          link: "/Agenda",
          icon: "📅",
        });
      } else if (daysLeft === 1) {
        items.push({
          id: `event-tomorrow-${event.id}`,
          type: "event",
          urgency: "medium",
          title: "Evento amanhã",
          message: event.title,
          detail: event.time ? `Às ${event.time}${event.location ? ` • ${event.location}` : ""}` : event.location || "Amanhã",
          child: childMap[event.child_id],
          link: "/Agenda",
          icon: "📅",
        });
      } else if (daysLeft <= 7 && daysLeft > 0) {
        items.push({
          id: `event-week-${event.id}`,
          type: "event",
          urgency: "low",
          title: `Evento em ${daysLeft} dias`,
          message: event.title,
          detail: format(parseISO(event.date), "EEEE, d 'de' MMMM", { locale: ptBR }),
          child: childMap[event.child_id],
          link: "/Agenda",
          icon: "📅",
        });
      }
    });

    // ─── MEDICAMENTOS ──────────────────────────────────────────────────────────
    medications.forEach(med => {
      if (!med.active) return;

      // Verificar se há log de hoje
      const todayLogs = medicationLogs.filter(log => {
        if (log.medication_id !== med.id) return false;
        const logDate = log.administered_at || log.created_date;
        if (!logDate) return false;
        return format(new Date(logDate), "yyyy-MM-dd") === todayStr;
      });

      // Alerta de medicamento não administrado hoje
      if (todayLogs.length === 0) {
        items.push({
          id: `med-today-${med.id}`,
          type: "medication",
          urgency: "high",
          title: "Medicamento pendente hoje",
          message: med.name,
          detail: `${med.dosage}${med.frequency ? ` • ${med.frequency}` : ""}`,
          child: childMap[med.child_id],
          link: "/Medicamentos",
          icon: "💊",
        });
      }

      // Alerta de fim de tratamento próximo
      if (med.end_date) {
        const daysLeft = differenceInDays(parseISO(med.end_date), now);
        if (daysLeft >= 0 && daysLeft <= 3) {
          items.push({
            id: `med-ending-${med.id}`,
            type: "medication",
            urgency: daysLeft === 0 ? "high" : "medium",
            title: daysLeft === 0 ? "Tratamento termina hoje" : `Tratamento termina em ${daysLeft} dia${daysLeft !== 1 ? "s" : ""}`,
            message: med.name,
            detail: `Verifique com o médico se precisa renovar`,
            child: childMap[med.child_id],
            link: "/Medicamentos",
            icon: "💊",
          });
        }
      }
    });

    // ─── ORDENAÇÃO POR URGÊNCIA ────────────────────────────────────────────────
    const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return items.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);
  }, [tasks, events, medications, children, medicationLogs]);

  const counts = useMemo(() => ({
    total: notifications.length,
    critical: notifications.filter(n => n.urgency === "critical").length,
    high: notifications.filter(n => n.urgency === "high").length,
  }), [notifications]);

  return { notifications, counts };
}
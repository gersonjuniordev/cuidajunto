import React, { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationPanel from "./NotificationPanel";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Fechar ao clicar fora
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => api.tasks.list(200),
    refetchInterval: 5 * 60 * 1000, // revalida a cada 5 min
  });
  const { data: events = [] } = useQuery({
    queryKey: ["events"],
    queryFn: () => api.events.list(200),
    refetchInterval: 5 * 60 * 1000,
  });
  const { data: medications = [] } = useQuery({
    queryKey: ["medications"],
    queryFn: () => api.medications.list(undefined, true),
    refetchInterval: 5 * 60 * 1000,
  });
  const { data: children = [] } = useQuery({
    queryKey: ["children"],
    queryFn: () => api.children.list(),
  });
  const { data: medicationLogs = [] } = useQuery({
    queryKey: ["medication_logs"],
    queryFn: () => api.medicationLogs.list(300),
    refetchInterval: 5 * 60 * 1000,
  });

  const { notifications, counts } = useNotifications({
    tasks, events, medications, children, medicationLogs,
  });

  const hasCritical = counts.critical > 0;
  const hasHigh = counts.high > 0;
  const badgeColor = hasCritical ? "bg-red-500" : hasHigh ? "bg-orange-400" : "bg-teal-500";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(prev => !prev)}
        className={`relative p-2 rounded-xl transition-all ${
          open ? "bg-teal-50 text-teal-700" : "hover:bg-slate-100 text-slate-500 hover:text-slate-700"
        }`}
      >
        <Bell className="w-5 h-5" />
        <AnimatePresence>
          {counts.total > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className={`absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] ${badgeColor} text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow`}
            >
              {counts.total > 9 ? "9+" : counts.total}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <NotificationPanel
            notifications={notifications}
            onClose={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
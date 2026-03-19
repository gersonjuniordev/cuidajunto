import React from "react";
import { Link } from "react-router-dom";
import { X, Bell, CheckCheck, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const urgencyConfig = {
  critical: { bar: "bg-red-500",   badge: "bg-red-100 text-red-700 border-red-200",   dot: "bg-red-500"    },
  high:     { bar: "bg-orange-400", badge: "bg-orange-100 text-orange-700 border-orange-200", dot: "bg-orange-400" },
  medium:   { bar: "bg-amber-400",  badge: "bg-amber-100 text-amber-700 border-amber-200",   dot: "bg-amber-400"  },
  low:      { bar: "bg-blue-400",   badge: "bg-blue-100 text-blue-700 border-blue-200",   dot: "bg-blue-400"   },
};

const urgencyLabel = {
  critical: "Urgente",
  high:     "Hoje",
  medium:   "Em breve",
  low:      "Esta semana",
};

function NotificationItem({ notification, onClose }) {
  const cfg = urgencyConfig[notification.urgency];

  return (
    <Link to={notification.link} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 16 }}
        className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer"
      >
        {/* Barra de urgência */}
        <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${cfg.bar}`} />

        {/* Ícone */}
        <div className="text-xl leading-none mt-0.5 flex-shrink-0">{notification.icon}</div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {notification.title}
            </span>
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${cfg.badge}`}>
              {urgencyLabel[notification.urgency]}
            </span>
          </div>
          <p className="text-sm font-medium text-slate-800 mt-0.5 truncate">{notification.message}</p>
          <p className="text-xs text-slate-400 mt-0.5 truncate">{notification.detail}</p>
          {notification.child && (
            <p className="text-[11px] text-teal-600 font-medium mt-1">👶 {notification.child}</p>
          )}
        </div>

        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0 mt-1" />
      </motion.div>
    </Link>
  );
}

export default function NotificationPanel({ notifications, onClose }) {
  const grouped = {
    critical: notifications.filter(n => n.urgency === "critical"),
    high:     notifications.filter(n => n.urgency === "high"),
    medium:   notifications.filter(n => n.urgency === "medium"),
    low:      notifications.filter(n => n.urgency === "low"),
  };

  const groupLabels = {
    critical: "🚨 Urgente",
    high:     "🔴 Hoje",
    medium:   "🟡 Em breve",
    low:      "🔵 Esta semana",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-teal-600" />
          <span className="text-sm font-semibold text-slate-900">Notificações</span>
          {notifications.length > 0 && (
            <Badge variant="secondary" className="bg-teal-100 text-teal-700 text-[10px] px-1.5">
              {notifications.length}
            </Badge>
          )}
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Body */}
      <div className="max-h-[70vh] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center">
              <CheckCheck className="w-6 h-6 text-teal-500" />
            </div>
            <p className="text-sm font-medium text-slate-700">Tudo em dia!</p>
            <p className="text-xs text-slate-400">Nenhum alerta pendente</p>
          </div>
        ) : (
          <div className="p-2">
            <AnimatePresence>
              {Object.entries(grouped).map(([urgency, items]) => {
                if (items.length === 0) return null;
                return (
                  <div key={urgency} className="mb-4">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-1.5">
                      {groupLabels[urgency]}
                    </p>
                    <div className="space-y-1">
                      {items.map(n => (
                        <NotificationItem key={n.id} notification={n} onClose={onClose} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
          <p className="text-xs text-slate-400 text-center">
            {notifications.length} alerta{notifications.length !== 1 ? "s" : ""} · Clique para navegar
          </p>
        </div>
      )}
    </motion.div>
  );
}
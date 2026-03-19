import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const urgencyConfig = {
  critical: { bg: "bg-red-50",    border: "border-red-200",    text: "text-red-700",    bar: "bg-red-500"    },
  high:     { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", bar: "bg-orange-400" },
  medium:   { bg: "bg-amber-50",  border: "border-amber-200",  text: "text-amber-700",  bar: "bg-amber-400"  },
  low:      { bg: "bg-blue-50",   border: "border-blue-200",   text: "text-blue-700",   bar: "bg-blue-400"   },
};

export default function AlertsSummary({ notifications }) {
  // Mostrar só os 4 mais urgentes no Dashboard
  const top = notifications.slice(0, 4);

  if (top.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-slate-500" />
        <h2 className="text-sm font-semibold text-slate-700">Alertas Ativos</h2>
        <span className="text-xs text-slate-400">({notifications.length} no total)</span>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {top.map((n, i) => {
          const cfg = urgencyConfig[n.urgency];
          return (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={n.link}>
                <div className={`flex items-start gap-3 p-3 rounded-xl border ${cfg.bg} ${cfg.border} hover:opacity-80 transition-opacity group`}>
                  <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${cfg.bar}`} />
                  <div className="text-lg leading-none flex-shrink-0">{n.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold uppercase tracking-wide ${cfg.text}`}>{n.title}</p>
                    <p className="text-sm font-medium text-slate-800 truncate mt-0.5">{n.message}</p>
                    <p className="text-xs text-slate-500 truncate">{n.detail}</p>
                    {n.child && <p className="text-[11px] text-teal-600 font-medium mt-1">👶 {n.child}</p>}
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0 mt-0.5" />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
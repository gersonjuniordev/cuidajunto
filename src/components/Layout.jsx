import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, Calendar, CheckSquare, Pill, FileText, 
  Baby, Menu, X, LogOut, MessageCircle
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import NotificationBell from "./notifications/NotificationBell";

const navItems = [
  { path: "/Dashboard", icon: LayoutDashboard, label: "Início" },
  { path: "/Agenda", icon: Calendar, label: "Agenda" },
  { path: "/Tarefas", icon: CheckSquare, label: "Tarefas" },
  { path: "/Medicamentos", icon: Pill, label: "Medicamentos" },
  { path: "/Documentos", icon: FileText, label: "Documentos" },
  { path: "/Criancas", icon: Baby, label: "Crianças" },
  { path: "/Chat", icon: MessageCircle, label: "Chat" },
];

export default function Layout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`
        :root {
          --color-teal: #0d9488;
          --color-teal-light: #ccfbf1;
          --color-lavender: #8b5cf6;
          --color-coral: #f97316;
        }
      `}</style>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 px-4 h-14 flex items-center justify-between">
        <button onClick={() => setMobileOpen(true)} className="p-2 -ml-2">
          <Menu className="w-5 h-5 text-slate-700" />
        </button>
        <div className="flex items-center gap-2">
          <img src="/logo.jpeg" alt="CuidaJunto" className="w-7 h-7 rounded-lg object-cover" />
          <span className="text-base font-semibold text-teal-700 tracking-tight">CuidaJunto</span>
        </div>
        <NotificationBell />
      </header>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/30" onClick={() => setMobileOpen(false)}>
          <nav 
            className="w-64 h-full bg-white shadow-xl p-6 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <img src="/logo.jpeg" alt="CuidaJunto" className="w-7 h-7 rounded-lg object-cover" />
                <span className="text-lg font-bold text-teal-700">CuidaJunto</span>
              </div>
              <button onClick={() => setMobileOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="flex-1 space-y-1">
              {navItems.map(({ path, icon: Icon, label }) => {
                const active = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? "bg-teal-50 text-teal-700"
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className={`w-[18px] h-[18px] ${active ? "text-teal-600" : ""}`} />
                    {label}
                  </Link>
                );
              })}
            </div>
            <Button
              variant="ghost"
              className="justify-start text-slate-400 hover:text-red-500 mt-4"
              onClick={() => logout()}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </nav>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 bottom-0 w-60 bg-white border-r border-slate-200 flex-col z-40">
        <div className="p-6 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <img src="/logo.jpeg" alt="CuidaJunto" className="w-10 h-10 rounded-xl object-cover" />
                <div>
                  <h1 className="text-xl font-bold text-teal-700 tracking-tight">CuidaJunto</h1>
                  <p className="text-xs text-slate-400 mt-0.5">Agenda Familiar Compartilhada</p>
                </div>
              </div>
            </div>
            <NotificationBell />
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ path, icon: Icon, label }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-teal-50 text-teal-700"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Icon className={`w-[18px] h-[18px] ${active ? "text-teal-600" : ""}`} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-slate-100">
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-400 hover:text-red-500"
            onClick={() => logout()}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-60 pt-14 lg:pt-0 min-h-screen">
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
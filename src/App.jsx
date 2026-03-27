import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider, useQuery } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Agenda from './pages/Agenda';
import Tarefas from './pages/Tarefas';
import Medicamentos from './pages/Medicamentos';
import Documentos from './pages/Documentos';
import Criancas from './pages/Criancas';
import Chat from './pages/Chat';
import Perfil from './pages/Perfil';
import EntrarPorCodigo from './pages/EntrarPorCodigo';
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import LandingV5 from './pages/LandingV5';
import { api } from '@/api/client';
import { useState, useEffect } from 'react';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isAuthenticated, user, refresh } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [onboardingDone, setOnboardingDone] = useState(null);

  useEffect(() => {
    const trialEndsAt = user?.billing?.trial_ends_at;
    const trialActive = user?.billing?.trial_active;
    if (!trialEndsAt || !trialActive) return;

    const endMs = new Date(trialEndsAt).getTime();
    const msUntil = endMs - Date.now();
    if (!Number.isFinite(msUntil) || msUntil <= 0) {
      refresh().catch(() => {});
      return;
    }

    const timeoutMs = Math.min(msUntil, 60 * 60 * 1000);
    const t = setTimeout(() => refresh().catch(() => {}), timeoutMs);
    return () => clearTimeout(t);
  }, [user?.id, user?.billing?.trial_ends_at, user?.billing?.trial_active, refresh]);

  const { data: children, isLoading: loadingChildren } = useQuery({
    queryKey: ["children_onboarding"],
    queryFn: () => api.children.list(),
    enabled: !!user,
  });

  if (isLoadingAuth || (user && loadingChildren)) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<LandingV5 />} />
        <Route path="/login" element={<Login initialMode="login" />} />
        <Route path="/register" element={<Login initialMode="register" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Bloqueia qualquer função quando o trial/plano expira.
  // Permite apenas a página de perfil.
  const pathname = location.pathname;
  const allowWhenExpired = pathname === "/planos";
  if (user?.billing && !user.billing.access_active && !allowWhenExpired) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <div className="text-xl font-bold text-slate-900">
            {user.billing.plan === "trial" ? "Teste grátis expirou" : "Assinatura necessária"}
          </div>
          <div className="text-sm text-slate-500">
            Para continuar usando o CuidaJunto, contrate um dos planos disponíveis.
          </div>
          {user.billing?.trial_ends_at ? (
            <div className="text-xs text-slate-400">
              Expirou em{" "}
              {new Date(user.billing.trial_ends_at).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </div>
          ) : null}
          <button
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl px-4 py-3"
            onClick={() => navigate("/planos")}
            type="button"
          >
            Ver planos
          </button>
        </div>
      </div>
    );
  }

  // Se não tem crianças cadastradas e onboarding não foi concluído nesta sessão, mostra onboarding
  const needsOnboarding = user && children && children.length === 0 && onboardingDone !== true;

  if (needsOnboarding) {
    return <Onboarding me={user} onComplete={() => setOnboardingDone(true)} />;
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/planos" element={<LandingV5 />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/Dashboard" replace />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Agenda" element={<Agenda />} />
        <Route path="/Tarefas" element={<Tarefas />} />
        <Route path="/Medicamentos" element={<Medicamentos />} />
        <Route path="/Documentos" element={<Documentos />} />
        <Route path="/Criancas" element={<Criancas />} />
        <Route path="/Chat" element={<Chat />} />
        <Route path="/Perfil" element={<Perfil />} />
        <Route path="/EntrarPorCodigo" element={<EntrarPorCodigo />} />
        <Route path="/login" element={<Navigate to="/Dashboard" replace />} />
        <Route path="/register" element={<Navigate to="/Dashboard" replace />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
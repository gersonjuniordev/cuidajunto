import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider, useQuery } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
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
import EntrarPorCodigo from './pages/EntrarPorCodigo';
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import { api } from '@/api/client';
import { useState, useEffect } from 'react';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isAuthenticated, user } = useAuth();
  const [onboardingDone, setOnboardingDone] = useState(null);

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
    return <Login />;
  }

  // Se não tem crianças cadastradas e onboarding não foi concluído nesta sessão, mostra onboarding
  const needsOnboarding = user && children && children.length === 0 && onboardingDone !== true;

  if (needsOnboarding) {
    return <Onboarding me={user} onComplete={() => setOnboardingDone(true)} />;
  }

  // Render the main app
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/Dashboard" replace />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Agenda" element={<Agenda />} />
        <Route path="/Tarefas" element={<Tarefas />} />
        <Route path="/Medicamentos" element={<Medicamentos />} />
        <Route path="/Documentos" element={<Documentos />} />
        <Route path="/Criancas" element={<Criancas />} />
        <Route path="/Chat" element={<Chat />} />
        <Route path="/EntrarPorCodigo" element={<EntrarPorCodigo />} />
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
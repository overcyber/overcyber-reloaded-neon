import React, { Component, ErrorInfo, ReactNode } from "react";
import Layout from "./Layout";
import { ShieldCheck, RefreshCw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  autoRecovering: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  private timeoutId: any = null;

  public state: State = {
    hasError: false,
    autoRecovering: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, autoRecovering: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught UI error caught by ErrorBoundary:", error, errorInfo);

    // Limpa caches corrompidos que possam ter causado o erro
    try {
      localStorage.removeItem("admin-about-data");
      localStorage.removeItem("admin-projects-data");
      localStorage.removeItem("admin-education-data");
      localStorage.removeItem("admin-experience-data");
      localStorage.removeItem("admin-publications-data");
      localStorage.removeItem("admin-skills-data");
    } catch {}

    // Verifica se já tentou auto-recuperar recentemente (evita loop infinito de recargas)
    try {
      const lastRecovered = Number(sessionStorage.getItem("ovc_auto_recovered") || 0);
      const now = Date.now();
      if (!lastRecovered || now - lastRecovered > 15000) {
        sessionStorage.setItem("ovc_auto_recovered", String(now));
        // Auto-carrega suavemente sem exigir ação do usuário
        this.timeoutId = setTimeout(() => {
          window.location.reload();
        }, 300);
        return;
      }
    } catch {}

    // Se já tentou auto-recuperar, redireciona suavemente para a página inicial
    this.timeoutId = setTimeout(() => {
      window.location.href = "/";
    }, 2500);
  }

  public componentWillUnmount() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Layout title="SYSTEM STATUS // AUTO-RECOVERY">
          <div className="text-center py-16 font-mono space-y-6">
            <div className="inline-flex p-4 rounded-full bg-cyber-neon/10 text-cyber-neon border border-cyber-neon/30 mb-2 animate-pulse">
              <ShieldCheck size={48} />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-cyber-neon tracking-wider">
              AUTO-RECUPERAÇÃO DE SUBSISTEMA
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto text-xs sm:text-sm leading-relaxed">
              O subsistema identificou uma variação nos dados de cache e aplicou o procedimento de autocura automática.
              <span className="block mt-2 text-cyber-blue/80 text-xs">
                Sincronizando ambiente e restabelecendo conexão segura...
              </span>
            </p>
            <div className="flex justify-center items-center gap-2 pt-2 text-xs text-cyber-neon/70 font-mono">
              <RefreshCw size={14} className="animate-spin" />
              <span>CARREGANDO CANAL PRINCIPAL...</span>
            </div>
          </div>
        </Layout>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;


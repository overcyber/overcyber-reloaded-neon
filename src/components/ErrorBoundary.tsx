import React, { Component, ErrorInfo, ReactNode } from "react";
import Layout from "./Layout";
import { Button } from "./ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Layout title="SYSTEM ERROR // RECOVERY">
          <div className="text-center py-16 font-mono space-y-6">
            <div className="inline-flex p-4 rounded-full bg-red-500/10 text-red-500 border border-red-500/30 mb-4">
              <AlertTriangle size={48} />
            </div>
            <h2 className="text-2xl font-bold text-red-400">CRITICAL EXECUTION FAULT</h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm">
              Um erro inesperado ocorreu durante a execução deste subsistema.
              {this.state.error?.message && (
                <span className="block mt-2 text-xs text-red-400/80 bg-black/60 p-2 rounded border border-red-500/20">
                  {this.state.error.message}
                </span>
              )}
            </p>
            <div className="flex justify-center gap-4 pt-4">
              <Button
                variant="outline"
                className="cyber-button"
                onClick={() => {
                  try {
                    localStorage.removeItem("admin-about-data");
                    localStorage.removeItem("admin-projects-data");
                    localStorage.removeItem("admin-education-data");
                    localStorage.removeItem("admin-experience-data");
                    localStorage.removeItem("admin-publications-data");
                    localStorage.removeItem("admin-skills-data");
                  } catch {}
                  window.location.reload();
                }}
              >
                <RefreshCw size={16} className="mr-2" />
                REINICIAR SUBSISTEMA
              </Button>
            </div>
          </div>
        </Layout>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;

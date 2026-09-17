import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error caught by ErrorBoundary:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background text-foreground">
          <div className="max-w-md w-full rounded-2xl border border-border bg-card p-6 shadow-xl flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight">Ops! Ocorreu um problema</h2>
              <p className="text-sm text-muted-foreground">
                Não se preocupe, seus dados estão seguros. Você pode tentar recarregar a tela.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="w-full text-xs font-mono bg-muted/60 p-2.5 rounded-lg text-left overflow-x-auto max-h-24 text-muted-foreground">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 w-full pt-2">
              <Button
                variant="outline"
                onClick={this.handleGoHome}
                className="w-full sm:w-1/2 flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Início
              </Button>
              <Button
                onClick={this.handleReload}
                className="w-full sm:w-1/2 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Recarregar
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

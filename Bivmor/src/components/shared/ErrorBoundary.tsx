'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, ArrowRight } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center p-8">
          <Card className="max-w-md w-full border-2 border-red-100 dark:border-red-900/30">
            <CardContent className="p-6 text-center space-y-4">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-7 w-7" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">حدث خطأ غير متوقع</h3>
                <p className="text-sm text-muted-foreground">
                  نعتذر عن هذا الخطأ. يرجى المحاولة مرة أخرى.
                </p>
              </div>
              {this.state.error && (
                <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground text-left" dir="ltr">
                  {this.state.error.message}
                </div>
              )}
              <div className="flex items-center justify-center gap-3">
                <Button
                  onClick={this.handleRetry}
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  إعادة المحاولة
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  size="sm"
                  className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                  تحديث الصفحة
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, Button, Text } from '@mantine/core';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-6 max-w-2xl mx-auto">
          <Alert
            color="red"
            title="Something went wrong"
            radius="md"
            className="mb-4"
          >
            <Text size="sm" className="mb-2">
              {this.state.error?.message || 'An unexpected error occurred'}
            </Text>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-2">
                <summary className="cursor-pointer text-xs font-mono">
                  Error Details (Development)
                </summary>
                <pre className="text-xs mt-2 p-2 bg-gray-100 rounded overflow-x-auto">
                  {this.state.error.stack}
                </pre>
                {this.state.errorInfo && (
                  <pre className="text-xs mt-2 p-2 bg-gray-100 rounded overflow-x-auto">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </details>
            )}
          </Alert>
          <Button 
            onClick={this.handleRetry}
            color="red"
            variant="outline"
            size="sm"
          >
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

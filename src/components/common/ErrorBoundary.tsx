import { Component, ErrorInfo, ReactNode } from "react";
import { Alert, Button, Stack, Text } from "@mantine/core";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center min-h-[400px] p-6">
          <div className="max-w-md w-full">
            <Alert
              color="red"
              radius="md"
              title="Something went wrong"
              className="mb-4"
            >
              <Text size="sm" className="mb-4">
                We encountered an unexpected error. This usually happens due to
                a temporary issue with the data or your connection.
              </Text>

              <Stack gap="sm">
                <Button
                  variant="light"
                  color="red"
                  size="sm"
                  onClick={this.handleReset}
                  className="w-full"
                >
                  Try Again
                </Button>

                <Button
                  variant="outline"
                  color="gray"
                  size="sm"
                  onClick={this.handleReload}
                  className="w-full"
                >
                  Reload Page
                </Button>
              </Stack>

              {this.props.showDetails && this.state.error && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800">
                    Technical Details
                  </summary>
                  <div className="mt-2 p-3 bg-gray-50 rounded text-xs font-mono overflow-auto max-h-32">
                    <div className="text-red-600 font-semibold">
                      {this.state.error.name}: {this.state.error.message}
                    </div>
                    {this.state.error.stack && (
                      <pre className="mt-2 text-gray-600 whitespace-pre-wrap">
                        {this.state.error.stack}
                      </pre>
                    )}
                  </div>
                </details>
              )}
            </Alert>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

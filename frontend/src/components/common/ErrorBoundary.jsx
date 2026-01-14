import React from 'react';
import { Button } from './Button';

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree and displays a fallback UI
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console or error reporting service
    console.error('Error Boundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo
    });

    // You can also log the error to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
          <div className="max-w-2xl w-full bg-dark-800 border-4 border-red-500 rounded-lg p-8 shadow-comic">
            <div className="text-center mb-6">
              <h1 className="text-6xl font-bangers text-red-500 mb-2 uppercase">
                💥 Oops!
              </h1>
              <h2 className="text-3xl font-bangers text-yellow-400 uppercase">
                Something went wrong!
              </h2>
              <p className="text-gray-400 mt-4 text-lg">
                Don't worry, our heroes are on it! Try refreshing the page.
              </p>
            </div>

            {/* Error Details (Development Mode) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-dark-900 border-2 border-red-600 rounded-lg p-4 mb-6 overflow-auto max-h-96">
                <h3 className="text-red-400 font-bold mb-2">Error Details:</h3>
                <pre className="text-sm text-gray-300 whitespace-pre-wrap break-words">
                  {this.state.error.toString()}
                </pre>
                {this.state.errorInfo && (
                  <>
                    <h3 className="text-red-400 font-bold mt-4 mb-2">Stack Trace:</h3>
                    <pre className="text-xs text-gray-400 whitespace-pre-wrap break-words">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <Button
                onClick={this.handleReset}
                variant="primary"
                className="px-6 py-3"
              >
                Try Again
              </Button>
              <Button
                onClick={() => window.location.href = '/'}
                variant="secondary"
                className="px-6 py-3"
              >
                Go Home
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="px-6 py-3"
              >
                Refresh Page
              </Button>
            </div>

            {/* Help Text */}
            <div className="mt-8 text-center text-sm text-gray-500">
              <p>
                If this problem persists, please{' '}
                <a
                  href="https://github.com/comicpad/issues"
                  className="text-blue-400 hover:text-blue-300 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  report the issue
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      );
    }

    // If no error, render children normally
    return this.props.children;
  }
}

/**
 * Higher-Order Component to wrap any component with error boundary
 */
export const withErrorBoundary = (Component, fallback) => {
  return function WithErrorBoundary(props) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};

export default ErrorBoundary;

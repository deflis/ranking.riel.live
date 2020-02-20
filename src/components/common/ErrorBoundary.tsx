import React, { ErrorInfo } from "react";

type ErrorState = {
  error?: Error;
  info?: ErrorInfo;
};

class ErrorBoundary extends React.Component<{}, ErrorState> {
  state: ErrorState = {}

  public componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info);
    this.setState({
      error,
      info
    });
  }

  public render() {
    if (this.state.error) {
      return (
        <div className="message is-denger">
          {this.state.error.name}: {this.state.error.message}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

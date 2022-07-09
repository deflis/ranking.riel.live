import React, { ErrorInfo } from "react";
import Alert from '@mui/material/Alert';
import AdSense from "./AdSense";

type ErrorState = {
  error?: Error;
  info?: ErrorInfo;
};

class ErrorBoundary extends React.Component<{}, ErrorState> {
  state: ErrorState = {};

  public componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info);
    this.setState({
      error,
      info,
    });
  }

  public render() {
    if (this.state.error) {
      return (
        <>
          <Alert severity="error">
            {this.state.error.name}: {this.state.error.message}
          </Alert>
          <AdSense />
        </>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

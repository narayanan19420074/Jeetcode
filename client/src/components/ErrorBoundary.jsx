import { Component } from 'react';
import ErrorFallback from './ErrorFallback';
import { reloadOnceForChunkError } from './chunkReload';

// Catches render crashes anywhere below it and shows a friendly screen instead of a blank page.
// `resetKey` (e.g. the route path) clears the error when it changes, so navigating away recovers.
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('UI crashed:', error, info?.componentStack);
    reloadOnceForChunkError(error);
  }

  componentDidUpdate(prevProps) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  render() {
    const { error } = this.state;
    return error ? <ErrorFallback error={error} /> : this.props.children;
  }
}

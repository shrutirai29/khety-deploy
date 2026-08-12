import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Khety UI error:", error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <div className="max-w-lg rounded-[32px] border border-[#dbe3d9] bg-white p-10 text-center shadow-[0_20px_60px_rgba(16,34,23,0.06)]">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#8a5b21]">
            Khety
          </p>
          <h1 className="mt-4 text-3xl font-extrabold text-[#102217]">
            Something went wrong on this page.
          </h1>
          <p className="mt-4 text-sm leading-7 text-[#5e6b62]">
            Your account and data are safe. Try reloading the page, and if the
            issue continues, sign out and back in.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-2xl bg-[#215732] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#173d24]"
            >
              Reload page
            </button>
            <button
              type="button"
              onClick={this.handleReload}
              className="rounded-2xl border border-[#d7dfd5] px-6 py-3 text-sm font-semibold text-[#102217] transition hover:border-[#215732]"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;

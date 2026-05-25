import { Component, type ReactNode } from "react";
import { ErrorMessage } from "./error-message";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };
  static getDerivedStateFromError(error: Error): State { return { error }; }
  componentDidCatch(error: Error) { console.error("[AppErrorBoundary]", error); }
  reset = () => this.setState({ error: null });
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
          <div className="max-w-sm w-full">
            <ErrorMessage
              title="কিছু একটা সমস্যা হয়েছে"
              description="আবার চেষ্টা করুন বা পরে ফিরে আসুন।"
              onRetry={() => { this.reset(); location.reload(); }}
            />
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
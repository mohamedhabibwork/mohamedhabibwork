import { Component, type ErrorInfo, type ReactNode } from "react";
import type { ErrorProps as ErrorViewProps } from "./error";

interface ErrorBoundaryProps {
	children: ReactNode;
	fallback?: (error: Error, reset: () => void) => ReactNode;
	fallbackProps?: Omit<ErrorViewProps, "error">;
	onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
	error: Error | null;
	hasError: boolean;
}

export class ErrorBoundary extends Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
		this.props.onError?.(error, errorInfo);
	}

	reset = (): void => {
		this.setState({ hasError: false, error: null });
	};

	render(): ReactNode {
		if (this.state.hasError && this.state.error) {
			if (this.props.fallback) {
				return this.props.fallback(this.state.error, this.reset);
			}

			const { ErrorView } = require("./error");
			return (
				<ErrorView
					error={this.state.error}
					onRetry={this.reset}
					{...this.props.fallbackProps}
				/>
			);
		}

		return this.props.children;
	}
}

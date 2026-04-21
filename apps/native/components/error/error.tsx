import { Link, router } from "expo-router";
import { Button, Surface } from "heroui-native";
import type { ReactNode } from "react";
import { Text, View } from "react-native";

export interface ErrorProps {
	children?: ReactNode;
	className?: string;
	description?: string;
	error?: Error | null;
	onBack?: () => void;
	onRetry?: () => void;
	showHome?: boolean;
	title?: string;
}

export function ErrorView({
	title = "Something went wrong",
	description = "An unexpected error occurred. Please try again.",
	error,
	onRetry,
	onBack,
	showHome = true,
	className,
	children,
}: ErrorProps) {
	const handleBack = onBack ?? (() => router.back());
	const errorMessage = error?.message;

	return (
		<View className={className}>
			<Surface
				className="max-w-sm items-center rounded-lg p-6"
				variant="secondary"
			>
				<Text className="mb-3 text-4xl">😕</Text>
				<Text className="mb-1 font-medium text-foreground text-lg">
					{title}
				</Text>
				<Text className="mb-2 text-center text-muted text-sm">
					{description}
				</Text>
				{errorMessage && (
					<Text className="mb-4 max-w-xs rounded bg-danger/10 px-3 py-2 text-center text-danger text-xs">
						{errorMessage}
					</Text>
				)}
				{children}
				<View className="mt-4 flex flex-row gap-2">
					{onRetry && (
						<Button onPress={onRetry} size="sm" variant="danger">
							Retry
						</Button>
					)}
					{onBack && (
						<Button onPress={handleBack} size="sm" variant="ghost">
							Go Back
						</Button>
					)}
					{showHome && (
						<Link asChild href="/">
							<Button size="sm" variant="tertiary">
								Home
							</Button>
						</Link>
					)}
				</View>
			</Surface>
		</View>
	);
}

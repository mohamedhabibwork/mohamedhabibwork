import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import {
	Chip,
	Separator,
	Spinner,
	Surface,
	useThemeColor,
} from "heroui-native";
import { Text, View } from "react-native";

import { Container } from "@/components/container";
import { orpc } from "@/utils/orpc";

export default function Home() {
	const healthCheck = useQuery(orpc.healthCheck.queryOptions());
	const successColor = useThemeColor("success");
	const dangerColor = useThemeColor("danger");

	const isConnected = healthCheck?.data === "OK";
	const isLoading = healthCheck?.isLoading;

	return (
		<Container className="px-4 pb-4">
			<View className="mb-5 py-6">
				<Text className="font-semibold text-3xl text-foreground tracking-tight">
					Better T Stack
				</Text>
				<Text className="mt-1 text-muted text-sm">
					Full-stack TypeScript starter
				</Text>
			</View>

			<Surface className="rounded-xl p-4" variant="secondary">
				<View className="mb-3 flex-row items-center justify-between">
					<Text className="font-medium text-foreground">System Status</Text>
					<Chip
						color={isConnected ? "success" : "danger"}
						size="sm"
						variant="secondary"
					>
						<Chip.Label>{isConnected ? "LIVE" : "OFFLINE"}</Chip.Label>
					</Chip>
				</View>

				<Separator className="mb-3" />

				<Surface className="rounded-lg p-3" variant="tertiary">
					<View className="flex-row items-center">
						<View
							className={`mr-3 h-2 w-2 rounded-full ${isConnected ? "bg-success" : "bg-muted"}`}
						/>
						<View className="flex-1">
							<Text className="font-medium text-foreground text-sm">
								ORPC Backend
							</Text>
							<Text className="mt-0.5 text-muted text-xs">
								{(() => {
									if (isLoading) {
										return "Checking connection...";
									}
									if (isConnected) {
										return "Connected to API";
									}
									return "API Disconnected";
								})()}
							</Text>
						</View>
						{isLoading && <Spinner size="sm" />}
						{!isLoading && isConnected && (
							<Ionicons
								color={successColor}
								name="checkmark-circle"
								size={18}
							/>
						)}
						{!(isLoading || isConnected) && (
							<Ionicons color={dangerColor} name="close-circle" size={18} />
						)}
					</View>
				</Surface>
			</Surface>
		</Container>
	);
}

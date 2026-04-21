import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "heroui-native";
import { useEffect, useRef } from "react";

interface QueryErrorEvent {
	error: Error;
	queryKey: unknown[];
}

export function QueryErrorHandler() {
	const queryClient = useQueryClient();
	const { toast } = useToast();
	const pendingErrors = useRef<QueryErrorEvent[]>([]);
	const isProcessingRef = useRef(false);

	useEffect(() => {
		const processErrors = () => {
			if (isProcessingRef.current) {
				return;
			}

			const errorInfo = pendingErrors.current.shift();
			if (!errorInfo) {
				isProcessingRef.current = false;
				return;
			}

			isProcessingRef.current = true;
			toast.show({
				variant: "danger",
				placement: "bottom",
				duration: 5000,
				label: "Server Error",
				description: errorInfo.error.message || "An unexpected error occurred",
				actionLabel: "Dismiss",
				onActionPress: ({ hide }) => {
					hide();
					isProcessingRef.current = false;
					processErrors();
				},
				onHide: () => {
					isProcessingRef.current = false;
					processErrors();
				},
			});
		};

		const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
			if (event.type === "updated" && event.query?.state.status === "error") {
				const error = event.query.state.error as Error | null;
				if (error) {
					pendingErrors.current.push({
						error,
						queryKey: event.query.queryKey,
					});
					processErrors();
				}
			}
		});

		return unsubscribe;
	}, [queryClient, toast]);

	return null;
}

import { useToast } from "heroui-native";

interface ErrorToastOptions {
	description?: string;
	duration?: number;
	error?: Error | null;
	retry?: () => void;
	title?: string;
}

export function useErrorToast() {
	const { toast } = useToast();

	const showError = (options: ErrorToastOptions) => {
		const {
			title = "Error",
			description,
			error,
			retry,
			duration = 5000,
		} = options;

		const errorMessage = error?.message ?? description;

		toast.show({
			variant: "danger",
			placement: "bottom",
			duration,
			label: title,
			description: errorMessage,
			actionLabel: retry ? "Retry" : undefined,
			onActionPress: ({ hide }) => {
				if (retry) {
					retry();
				}
				hide();
			},
		});
	};

	return { showError };
}

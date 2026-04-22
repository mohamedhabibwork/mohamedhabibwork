<script lang="ts">
	interface Props {
		class?: string;
		disabled?: boolean;
		id?: string;
		name?: string;
		onchange?: (event: Event) => void;
		oninput?: (event: Event) => void;
		placeholder?: string;
		required?: boolean;
		rows?: number;
		value?: string;
	}

	let {
		class: className = "",
		disabled = false,
		id,
		name,
		placeholder = "",
		required = false,
		rows = 4,
		value = $bindable(""),
		oninput,
		onchange,
	}: Props = $props();

	const classes = $derived(
		[
			"w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none bg-card text-foreground border border-border transition-colors",
			disabled && "opacity-50 cursor-not-allowed",
			className,
		]
			.filter(Boolean)
			.join(" ")
	);
</script>

<textarea
	{id}
	{name}
	{placeholder}
	{required}
	{rows}
	{disabled}
	class={classes}
	bind:value
	{oninput}
	{onchange}
></textarea>

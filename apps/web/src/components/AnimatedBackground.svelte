<script lang="ts">
	interface Props {
		class?: string;
	}

	const { class: className = "" }: Props = $props();
</script>

<div class="absolute inset-0 -z-10 overflow-hidden {className}">
	<div class="floating-orb orb-1"></div>
	<div class="floating-orb orb-2"></div>
	<div class="floating-orb orb-3"></div>
</div>

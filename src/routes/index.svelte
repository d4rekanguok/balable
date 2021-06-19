<script>
	import { writable } from 'svelte/store';
	import Cell from '$lib/Cell.svelte';
	import Palette from '$lib/Palette.svelte';

	let size = 12;

	const colorId = writable(0);
	const data = Array.from({ length: size }, () => writable({ value: 0, colorId: 0 }));
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

<main>
	<div class="palette-wrapper">
		<Palette {colorId} />
	</div>
	<div class="container">
		{#each data as item}
			<div class="cell-wrapper">
				<Cell colorId={$colorId} data={item} />
			</div>
		{/each}
	</div>
</main>

<style>
	main {
		width: 100vw;
		height: 100vh;
		background-color: snow;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.container {
		width: 40vw;
		height: 30vw;
		margin: 0 auto;
		max-width: 64rem;
		min-width: 20rem;

		display: grid;
		grid: auto-flow / repeat(4, 1fr);
		grid-gap: 0.5rem;
	}

	.cell-wrapper {
		aspect-ratio: 1 / 1;
	}

	.palette-wrapper {
		position: absolute;
		left: 1rem;
	}
</style>

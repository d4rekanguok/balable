<script context="module">
	export const ssr = false;
</script>

<script>
	import { writable, derived } from 'svelte/store';
	import { setContext } from 'svelte';
	import * as Tone from 'tone';

	import { getNote } from '$lib/get-note';
	import Cell from '$lib/Cell.svelte';
	import Palette from '$lib/Palette.svelte';
	import { getInstruments } from '$lib/instruments';

	const instruments = getInstruments();

	let size = 12;
	const colorId = writable(0);
	const data = Array.from({ length: size }, () => writable({ value: 0, colorId: 0 }));

	setContext('app', { instruments });

	const noteSeries = derived([...data], (items) => {
		return items.map((item) => {
			const note = getNote(item.value);
			const effectId = item.colorId;
			return {
				effectId,
				note: note ? `${note}4` : 'C0'
			};
		});
	});

	$: notes = $noteSeries;
	let isPlaying = false;

	const handlePlay = () => {
		const loop = new Tone.Loop((time) => {
			notes.forEach(({ note, effectId }, i) => {
				instruments[effectId].triggerAttackRelease(note, 0.25, time + i * 0.25);
			});
		}, 0.25 * notes.length).start(0);
		Tone.Transport.start();
		isPlaying = true;

		const stop = () => {
			if (isPlaying) {
				loop.dispose();
				Tone.Transport.stop();
				isPlaying = false;
			}

			window.removeEventListener('mousedown', stop, true);
		};

		window.addEventListener('mousedown', stop, true);
	};
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

<main>
	<div class="palette-wrapper">
		<Palette {colorId} />
	</div>
	<div class="play-wrapper">
		<button class="play" on:click={handlePlay} disabled={isPlaying}>⟳</button>
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
		left: 2rem;
	}

	.play-wrapper {
		position: absolute;
		right: 2rem;
	}

	.play {
		position: relative;
		width: 4rem;
		height: 4rem;
		color: white;
		background-color: tomato;
		font-size: 2rem;
		border: none;
		border-radius: 100%;
	}

	.play[disabled] {
		background-color: gray;
	}
</style>

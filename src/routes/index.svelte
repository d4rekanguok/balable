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
	let ref;
	let isFullscreen = false;
	let isPlaying = false;
	let currentlyPlaying = -1;

	const colorId = writable(0);
	const data = Array.from({ length: size }, () => writable({ value: 0, colorId: 0 }));

	setContext('app', { instruments });

	const noteSeries = derived([...data], (items) => {
		return items.map((item) => {
			const note = getNote(item.value);
			const effectId = item.colorId;
			return {
				effectId,
				note: note ? `${note}4` : 'C1'
			};
		});
	});

	// little 'hack' to extract the derived value
	// out of noteSeries without having to subscribe
	$: notes = $noteSeries;

	const handlePlay = () => {
		const now = Tone.Transport.now();
		const loopAnimate = new Tone.Loop((time) => {
			const id = Math.round(((time - now) / 0.25) % data.length);
			currentlyPlaying = id;
		}, 0.25).start(0);

		const loop = new Tone.Loop((time) => {
			notes.forEach(({ note, effectId }, i) => {
				instruments[effectId].play(note, 0.25, time + i * 0.25);
			});
		}, 0.25 * notes.length).start(0);
		Tone.Transport.start();
		isPlaying = true;

		const stop = () => {
			if (isPlaying) {
				Tone.Transport.stop();
				loop.dispose();
				loopAnimate.dispose();
				isPlaying = false;
				currentlyPlaying = -1;
			}

			window.removeEventListener('mousedown', stop, true);
		};

		window.addEventListener('mousedown', stop, true);
	};

	const handleFullscreen = () => {
		if (isFullscreen) {
			document.exitFullscreen();
			isFullscreen = false;
		} else {
			ref.requestFullscreen();
			isFullscreen = true;
		}
	};
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

<main bind:this={ref}>
	<div class="palette-wrapper">
		<Palette {colorId} />
	</div>
	<div class="play-wrapper">
		<button class="play" on:click={handlePlay} disabled={isPlaying}>⟳</button>
	</div>
	<div class="fullscreen-wrapper">
		<button class="fullscreen" data-fullscreen={isFullscreen} on:click={handleFullscreen}>FS</button
		>
	</div>
	<div class="container">
		{#each data as item, i}
			<div class="cell-wrapper">
				<Cell colorId={$colorId} data={item} currentlyPlaying={currentlyPlaying === i} />
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

	.fullscreen-wrapper {
		position: absolute;
		right: 2rem;
		bottom: 2rem;
	}

	.fullscreen {
		width: 3rem;
		height: 3rem;
		border: none;
		background-color: transparent;
		border-radius: 4px;
		border: 2px solid mediumpurple;
		color: mediumpurple;
		font-family: sans-serif;
		font-weight: bold;
	}

	.fullscreen[data-fullscreen='true'] {
		background-color: mediumpurple;
		border-radius: 4px;
		border-color: transparent;
		color: white;
	}
</style>

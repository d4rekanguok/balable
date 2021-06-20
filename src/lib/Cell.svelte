<script>
	import { getContext } from 'svelte';
	import { spring } from 'svelte/motion';
	import { colors } from './colors';
	import { getNote } from './get-note';
	export let maxValue = 7;
	export let colorId = 0;
	export let currentlyPlaying = false;
	export let data;

	/** @type {'playing' | 'idle'} */
	let state = 'idle';

	const scale = spring(1);
	const pressed = (nextState) => {
		if (state === nextState) {
			return;
		}

		if (nextState === 'playing') {
			scale.set(0.9);
			state = 'playing';
			setTimeout(() => {
				pressed('idle');
			}, 300);
		}

		if (nextState === 'idle') {
			scale.set(1);
			state = 'idle';
		}
	};

	$: if (currentlyPlaying) {
		pressed('playing');
	}

	const { instruments } = getContext('app');

	const handleClick = () => {
		pressed('playing');
		data.update((store) => {
			const value = (store.value + 1) % (maxValue + 1);

			if (value > 0) {
				instruments[colorId].play(`${getNote(value)}4`, '8n');
			}

			store.value = value;
			store.colorId = colorId;

			return store;
		});
	};

	const brMap = [
		[0, 0, 0, 0],
		[1, 0, 0, 0],
		[0, 1, 0, 0],
		[0, 0, 1, 0],
		[0, 0, 0, 1],
		[1, 0, 1, 0],
		[0, 1, 0, 1],
		[1, 1, 1, 1]
	];

	$: br = brMap[$data.value].map((v) => v * 50 + '%').join(' ');
	$: color = colors[$data.colorId];
</script>

<button
	data-value={$data.value}
	class="cell"
	on:click={handleClick}
	style="
		--color: {color};
		border-radius: {br};
		transform: scale({$scale});
">{$data.value}</button
>

<style>
	.cell {
		text-indent: -9999px;
		border: none;
		width: 100%;
		height: 100%;
		background-color: var(--color, white);
		box-shadow: 0 16px 24px -8px rgba(0, 0, 0, 0.1);
		font-size: 3rem;
		font-weight: bold;
		font-family: sans-serif;
		border-radius: 4px;
	}

	.cell[data-value='0'] {
		background-color: white;
	}
</style>

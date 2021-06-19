<script>
	import { getContext } from 'svelte';
	import { colors } from './colors';
	export let maxValue = 7;
	export let colorId = 0;
	export let data;

	const { synth } = getContext('app');

	const getNote = (value = 0) => {
		return ['C', 'D', 'E', 'F', 'G', 'A', 'B'][value - 1];
	};

	const handleClick = () => {
		data.update((store) => {
			const value = (store.value + 1) % (maxValue + 1);

			if (value > 0) {
				synth.triggerAttackRelease(`${getNote(value)}4`, '8n');
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

<script>
	import { colors } from './colors';

	export let colorId;

	const selectColor = (i) => {
		colorId.set(i);
	};
</script>

<nav>
	<ul class="list">
		{#each colors as color, i (color)}
			<li>
				<button
					class="color-btn"
					data-selected={i === $colorId}
					style="--color: {color}"
					on:click={() => selectColor(i)}
				>
					{color}
				</button>
			</li>
		{/each}
	</ul>
</nav>

<style>
	.list {
		list-style-type: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-flow: column;
		gap: 0.75rem;
	}

	.color-btn {
		text-indent: -9999px;
		width: 2rem;
		height: 2rem;
		border: none;
		border-radius: 1rem;
		background-color: var(--color);
		transition: transform 0.3s ease;
	}

	.color-btn[data-selected='true'] {
		transform: translateX(1rem);
	}
</style>

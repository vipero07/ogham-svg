<script lang="ts">
	import { splitLetters, WordToOghamSVG } from '$lib/ogham.js';
	import { draw } from 'svelte/transition';

	let text = $state('kelsey wolf');
	const oghamSVG = $derived(WordToOghamSVG(text));
	const strokes = $derived(splitLetters(text, true));
</script>

<input bind:value={text} />
<div>
	{strokes}
</div>
<svg
	viewBox="0 0 4 {oghamSVG[2]}"
    preserveAspectRatio="none"
>
    {#key oghamSVG}
	    <path in:draw d={oghamSVG[0]}></path>
    {/key}
</svg>

<style>
	input {
		border: solid black 2px;
	}
	svg {
        position: absolute;
		height: 50vh;
		overflow: visible;
	}
    path{
        stroke: black;
        stroke-linejoin: round;
        stroke-linecap: round;
        stroke-width: 2px;
        fill: none;
    }
	svg * {
		vector-effect: non-scaling-stroke;
	}
</style>

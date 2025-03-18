<script lang="ts">
	import { splitLetters, WordToOghamSVG } from '$lib/ogham.js';
	import { scaledDraw } from '$lib/scaledDraw.js';
	import { linear } from 'svelte/easing';

	let text = $state('mgngzr');
	let singlePath = $state(true);
	let phoneticSubstitute = $state(true);
	let letterStemFirst = $state(false);
	let wordStemFirst = $state(false);
	const oghamSVG = $derived(WordToOghamSVG(text, { singlePath, phoneticSubstitute, letterStemFirst, wordStemFirst }));
    const path = $derived(oghamSVG[0]);
	const strokes = $derived(splitLetters(text, phoneticSubstitute));
</script>

<input bind:value={text} />

<label>
	One Letter at a time:
	<input type="checkbox" bind:checked={singlePath} />
</label>

{#if singlePath}
	<label>
		Letter Stem First:
		<input type="checkbox" bind:checked={letterStemFirst} />
	</label>
	<label>
		Word Stem First:
		<input type="checkbox" bind:checked={wordStemFirst} />
	</label>
{/if}

<label>
	Phonetic Substitute:
	<input type="checkbox" bind:checked={phoneticSubstitute} />
</label>

<div>
	{strokes}
</div>
<svg viewBox="0 0 4 {oghamSVG[2]}" preserveAspectRatio="none">
	{#key path}
		<path
			d={path}
			in:scaledDraw={{ duration: text.length * (singlePath ? 400 : 1000), easing: linear }}
		></path>
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
	path {
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

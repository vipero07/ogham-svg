<script lang="ts">
	import { splitLetters, WordToOghamSVG } from '$lib/ogham.js';
	import { scaledDraw } from '$lib/scaledDraw.js';
	import { linear } from 'svelte/easing';

	let text = $state('kelsey wolf');
    let singlePath = $state(true);
    let phoneticSubstitute = $state(true);
    let stemFirst = $state(false);
	const oghamSVG = $derived(WordToOghamSVG(text, {singlePath, phoneticSubstitute, stemFirst}));
	const strokes = $derived(splitLetters(text, phoneticSubstitute));
</script>

<input bind:value={text} />

<label>
    One Letter at a time:
    <input type="checkbox" bind:checked={singlePath}>
</label>

{#if singlePath}
<label>
    Stem First:
    <input type="checkbox" bind:checked={stemFirst}>
</label>
{/if}

<label>
    Phonetic Substitute:
    <input type="checkbox" bind:checked={phoneticSubstitute}>
</label>

<div>
	{strokes}
</div>
<svg viewBox="0 0 4 {oghamSVG[2]}" preserveAspectRatio="none">
	{#key oghamSVG}
		<path d={oghamSVG[0]} in:scaledDraw={{duration: text.length * (singlePath ? 800 : 1000), easing: linear}}></path>
		<!-- <path d={oghamSVG[0]} stroke-dasharray={oghamSVG[1]} stroke-dashoffset={oghamSVG[1]}></path> -->
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
		animation: dash 5s linear forwards;
	}
	svg * {
		vector-effect: non-scaling-stroke;
	}
	@keyframes dash {
		to {
			stroke-dashoffset: 0;
		}
	}
</style>

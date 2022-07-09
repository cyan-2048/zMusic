<script>
	import { onMount } from "svelte";
	import { delay, last } from "../lib/helper";

	const tabs = [...$$props.tabs];
	let main;

	export async function next() {
		tabs.push(tabs.shift());
		const firstEl = main.children[0];
		const { style } = firstEl;
		const { width } = style;
		style.transform = `translateX(-${width})`;
		style.width = 0;
		style.removeProperty("color");
		await delay(300);
		style.display = "none";
		main.appendChild(firstEl);
		firstEl.removeAttribute("style");
		style.width = firstEl.offsetWidth + "px";
		main.children[0].style.color = "white";
	}

	export async function previous() {
		tabs.unshift(tabs.pop());
		main.firstElementChild.style.removeProperty("color");
		const lastEl = main.lastElementChild;
		const { style, dataset } = lastEl;
		const { width } = lastEl.style;
		style.width = 0;
		main.insertBefore(lastEl, main.firstChild);
		style.transform = `translateX(-${width})`;
		await delay(50);
		style.width = width;
		style.transform = "none";
		await delay(300);
		lastEl.removeAttribute("style");
		style.width = lastEl.offsetWidth + "px";
		main.firstElementChild.style.color = "white";
	}

	function currentHTML(_tabs = tabs) {
		main.innerHTML = _tabs.map((a, i) => `<div${i === 0 ? ` style="color: white;"` : ""}>${a}\xa0</div>`).join("");
		[...main.children].forEach((a) => (a.style.width = a.offsetWidth + "px"));
	}

	export function replaceIndex(index) {
		if (index === 0) return currentHTML();
		currentHTML(tabs.slice(index).concat(tabs.slice(0, index)));
	}

	onMount(currentHTML);
</script>

<main bind:this={main} />

<style>
	main {
		height: 41px;
		overflow: hidden;
		white-space: nowrap;
		padding-left: 6px;
		letter-spacing: -1px;
		display: block;
		transition: transform 0.4s linear;
	}
	main > :global(div) {
		display: inline-block;
		font-size: 29px;
		--a: cubic-bezier(1, 0, 0, 1);
		transition: width 0.3s var(--a), transform 0.3s var(--a), color 0.2s ease;
		color: rgba(255, 255, 255, 0.4);
		overflow: hidden;
		white-space: pre;
	}
</style>

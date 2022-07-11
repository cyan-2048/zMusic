import { writable } from "svelte/store";

export const music = writable(0);
const last_obj = { index: 0, scrollTop: 0 };
export const music_lastFocused = writable({
	0: { ...last_obj },
	1: { ...last_obj },
	2: { ...last_obj },
	3: { ...last_obj },
	4: { ...last_obj },
});

export const mountDirection = writable(1);

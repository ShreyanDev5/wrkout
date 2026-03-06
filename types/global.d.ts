declare global {
	interface Window {
		webkitAudioContext?: typeof AudioContext
		playTickSound?: () => void
	}
}

export {}

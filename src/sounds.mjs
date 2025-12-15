// @ts-check

const SOUNDS_DIR = './sounds'

/** @typedef {{ volume?: number, playFrom?: number }} SoundProps */

export const audioContext = new AudioContext()

class SoundEffect {
	/** @type {HTMLAudioElement} */
	#audio
	#loaded = false

	/**
	 * @param {string} src
	 * @param {SoundProps} [props]
	 */
	constructor(src, props) {
		this.#audio = new Audio(src)
		this.playFrom = props?.playFrom ?? 0
		this.#audio.preload = /** @type {const} */ ('auto')

		this.#audio.addEventListener('canplaythrough', () => {
			if (this.#loaded) return
			this.#loaded = true
			const source = audioContext.createMediaElementSource(this.#audio)
			const gainNode = audioContext.createGain()
			gainNode.connect(audioContext.destination)
			source.connect(gainNode)
			gainNode.gain.value = props?.volume ?? 1
		})
	}

	async play() {
		await audioContext.resume()
		this.#audio.currentTime = this.playFrom
		return await this.#audio.play()
	}
}

export const sounds = {
	start: new SoundEffect(`${SOUNDS_DIR}/start.wav`),
	boost: new SoundEffect(`${SOUNDS_DIR}/boost.wav`, { volume: 2 }),
	score: new SoundEffect(`${SOUNDS_DIR}/score.wav`),
	hit: new SoundEffect(`${SOUNDS_DIR}/crash.wav`, { playFrom: 0.3, volume: 1 }),
	die: new SoundEffect(`${SOUNDS_DIR}/thwack.wav`),
}

// @ts-check

const SOUNDS_DIR = '/sounds'

/** @typedef {{ volume?: number, playFrom?: number }} SoundProps */

class SoundEffect extends Audio {
	/**
	 * @param {string} src
	 * @param {SoundProps} [props]
	 */
	constructor(src, props) {
		super(src)
		this.volume = props?.volume ?? 1
		this.playFrom = props?.playFrom ?? 0
	}

	/** @override */
	play() {
		this.currentTime = this.playFrom
		return super.play()
	}
}

export const sounds = {
	start: new SoundEffect(`${SOUNDS_DIR}/start.wav`),
	boost: new SoundEffect(`${SOUNDS_DIR}/boost.wav`),
	score: new SoundEffect(`${SOUNDS_DIR}/score.wav`),
	hit: new SoundEffect(`${SOUNDS_DIR}/crash.wav`, { playFrom: 0.3 }),
	die: new SoundEffect(`${SOUNDS_DIR}/thwack.wav`),
}

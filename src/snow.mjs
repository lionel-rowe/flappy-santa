// @ts-check
import './vendor/confetti.browser.min.js'

import { GameObject } from './gameObject.mjs'
import { canvas, ctx } from './canvas.mjs'

// @ts-ignore TODO types
const confetti = globalThis.confetti

/**
 * @typedef {{ speed: number, opacity: number, spawnFrequency: number, size: number }} SnowParams
 * `speed` - Speed of the snowflakes (1 = "normal speed" = 15-second lifetime for each snowflake)
 * `opacity` - Opacity of the snowflakes (0 to 1)
 * `spawnFrequency` - Likelihood of spawning a snowflake each frame (0 to 1)
 * `size` - Size of the snowflakes
 */

export class Snow extends GameObject {
	/** @param {SnowParams} params */
	constructor({ speed, opacity, spawnFrequency, size }) {
		super()
		this.speed = speed
		this.opacity = opacity
		this.spawnFrequency = spawnFrequency
		this.size = size
	}

	canvas = Object.assign(document.createElement('canvas'), { width: canvas.width, height: canvas.height })
	confetti = confetti.create(this.canvas, {/* useWorker: true */})

	skew = 1

	/** @override */
	update() {
		const ticks = 500
		this.skew = Math.max(0.8, this.skew - 0.001)

		const particleCount = Number(this.spawnFrequency > Math.random())
		const colors = ['#ffffff']

		this.confetti({
			particleCount,
			startVelocity: 0,
			ticks,
			origin: {
				x: Math.random(),
				y: (Math.random() * this.skew) - 0.2,
			},
			colors,
			shapes: ['circle'],
			gravity: this.#randomInRange(0.2, 0.3) * this.speed,
			scalar: this.#randomInRange(0.2, 0.4) * this.size,
			drift: this.#randomInRange(-0.4, 0.4) * this.speed,
			flat: true,
		})
	}
	/** @override */
	draw() {
		const { globalAlpha } = ctx
		ctx.globalAlpha = this.opacity
		ctx.drawImage(this.canvas, 0, 0)
		ctx.globalAlpha = globalAlpha
	}

	/**
	 * @param {number} min
	 * @param {number} max
	 */
	#randomInRange(min, max) {
		return Math.random() * (max - min) + min
	}
}

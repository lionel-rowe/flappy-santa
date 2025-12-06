// @ts-check

export class Sprite {
	spriteWidth = -1
	spriteHeight = -1

	#image
	#loaded

	/**
	 * @private
	 * @param {string} src Image source URL
	 * @param {number} numFrames Number of sprites in the sheet
	 */
	constructor(src, numFrames) {
		this.#image = Object.assign(new Image(), { src })
		this.numFrames = numFrames

		/** @type {PromiseWithResolvers<void>} */
		const loaded = Promise.withResolvers()

		this.#loaded = loaded.promise

		this.#image.addEventListener('load', () => {
			loaded.resolve()
			this.spriteHeight = this.#image.naturalHeight
			this.spriteWidth = Math.floor(this.#image.naturalWidth / numFrames)
		})
	}

	/**
	 * @param {string} src
	 * @param {number} spriteWidth
	 */
	static async load(src, spriteWidth) {
		const sheet = new Sprite(src, spriteWidth)
		await sheet.#loaded
		return sheet
	}

	/**
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {[x: number, y: number]} origin
	 * @param {number} frame
	 */
	render(ctx, origin, frame) {
		const [x, y] = origin
		const [width, height] = [this.spriteWidth, this.spriteHeight]
		ctx.drawImage(this.#image, frame * width, 0, width, height, x, y, width, height)
	}
}

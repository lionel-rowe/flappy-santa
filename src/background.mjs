// @ts-check
import { canvas, ctx } from './canvas.mjs'
import { GameObject } from './gameObject.mjs'
import { images } from './images.mjs'

export class Background extends GameObject {
	img = images.background
	/** @override */
	draw() {
		ctx.fillStyle = '#30c0df'
		ctx.fillRect(0, 0, canvas.width, canvas.height)
		const y = canvas.height - this.img.height
		ctx.drawImage(this.img, 0, y)
	}
	/** @override */
	update() {
		// no-op for background (it is static)
	}
}

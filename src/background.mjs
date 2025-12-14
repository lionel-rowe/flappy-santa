// @ts-check
import { canvas, ctx } from './canvas.mjs'
import { GameObject } from './gameObject.mjs'
import { images } from './images.mjs'

export class Background extends GameObject {
	img = images.background
	/** @override */
	draw() {
		// white
		ctx.fillStyle = '#ffffff'
		ctx.fillRect(0, 0, canvas.width, canvas.height)

		// draw at half opacity
		const { globalAlpha } = ctx
		ctx.globalAlpha = 0.5
		ctx.drawImage(this.img, 0, 0, canvas.width, canvas.height)
		ctx.globalAlpha = globalAlpha
	}
	/** @override */
	update() {
		// no-op for background (it is static)
	}
}

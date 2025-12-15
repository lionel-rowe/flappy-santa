// @ts-check
import { canvas, ctx } from './canvas.mjs'
import { DELTA_X, GROUND_HEIGHT } from './constants.mjs'
import { GameObject } from './gameObject.mjs'
import { game } from './game.mjs'
import { images } from './images.mjs'

export class Ground extends GameObject {
	img = images.ground
	x = 0
	y = canvas.height - GROUND_HEIGHT
	/** @override */
	draw() {
		let x = this.x
		while (x < canvas.width) {
			ctx.drawImage(
				this.img,
				0,
				0,
				this.img.width,
				this.img.height,
				x,
				this.y,
				// paint at double size to better match the other background assets
				this.img.width * 2,
				this.img.height * 2,
			)
			x += this.img.width
		}
	}
	/** @override */
	update() {
		if (game.status !== 'playing') return
		this.x -= DELTA_X
		this.x = this.x % (this.img.width)
	}
}

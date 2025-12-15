// @ts-check
import { canvas, ctx } from './canvas.mjs'
import { DELTA_X } from './constants.mjs'
import { GameObject } from './gameObject.mjs'
import { game } from './game.mjs'
import { images } from './images.mjs'

export class Ground extends GameObject {
	img = images.ground
	x = 0
	y = 0
	/** @override */
	draw() {
		this.y = canvas.height - 100

		let x = this.x
		while (x < canvas.width) {
			ctx.drawImage(this.img, x, this.y)
			x += this.img.width / 2
		}
	}
	/** @override */
	update() {
		if (game.status !== 'playing') return
		this.x -= DELTA_X
		this.x = this.x % (this.img.width / 2)
	}
}

// @ts-check
import { canvas, ctx } from './canvas.mjs'
import { DELTA_X } from './constants.mjs'
import { game } from './game.mjs'
import { images } from './images.mjs'

export class Ground {
	img = images.ground
	x = 0
	y = 0
	draw() {
		this.y = canvas.height - this.img.height
		ctx.drawImage(this.img, this.x, this.y)
	}
	update() {
		if (game.status !== 'playing') return
		this.x -= DELTA_X
		this.x = this.x % (this.img.width / 2)
	}
}

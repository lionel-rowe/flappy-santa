// @ts-check
import { canvas, ctx } from './canvas.mjs'
import { DELTA_X } from './constants.mjs'
import { game } from './game.mjs'
import { images } from './images.mjs'

class Obstacle {
	/**
	 * @param {number} x
	 * @param {number} y
	 */
	constructor(x, y) {
		this.x = x
		this.y = y
	}
}

export class Scenery {
	top = { img: images.pipeTop }
	bottom = { img: images.pipeBottom }
	gap = 85
	moved = true
	obstacles = /** @type {Obstacle[]} */ ([])
	draw() {
		for (let i = 0; i < this.obstacles.length; ++i) {
			const p = this.obstacles[i]
			ctx.drawImage(this.top.img, p.x, p.y)
			ctx.drawImage(
				this.bottom.img,
				p.x,
				p.y + this.top.img.height + this.gap,
			)
		}
	}
	update() {
		if (game.status !== 'playing') return
		if (game.frames % 100 === 0) {
			this.obstacles.push(
				new Obstacle(
					canvas.width,
					-210 * Math.min(Math.random() + 1, 1.8),
				),
			)
		}

		for (const obstacle of this.obstacles) {
			obstacle.x -= DELTA_X
		}

		if (this.obstacles.length && this.obstacles[0].x < -this.top.img.width) {
			this.obstacles.shift()
			this.moved = true
		}
	}
}

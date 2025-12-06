// @ts-check
import { ctx } from './canvas.mjs'
import { game } from './game.mjs'
import { sounds } from './sounds.mjs'
/** @typedef {import('./sprite.mjs').Sprite} Sprite */

export class Player {
	/** @param {Sprite} sprites */
	constructor(sprites) {
		this.sprites = sprites
	}

	dead = false
	rotatation = 0
	x = 50
	y = 100
	speed = 0
	gravity = 0.125
	thrust = 3.6
	#frame = 0

	set frame(value) {
		this.#frame = value % this.sprites.numFrames
	}
	get frame() {
		return this.#frame
	}

	draw() {
		ctx.save()
		ctx.translate(this.x, this.y)
		ctx.rotate(this.rotatation * Math.PI / 180)
		const h = this.sprites.spriteHeight
		const w = this.sprites.spriteWidth
		this.sprites.render(ctx, [-w / 2, -h / 2], this.frame)
		ctx.restore()
	}

	update() {
		const r = this.sprites.spriteWidth / 2

		switch (game.status) {
			case 'initial': {
				this.rotatation = 0
				this.y += game.frames % 10 === 0 ? Math.sin(game.frames * Math.PI / 180) : 0
				this.frame += game.frames % 10 === 0 ? 1 : 0
				break
			}
			case 'playing': {
				this.frame += game.frames % 5 === 0 ? 1 : 0
				this.y += this.speed
				this.updateRotation()
				this.speed += this.gravity
				if (this.y + r >= game.ground.y || this.checkCollision()) {
					game.status = 'gameOver'
				}

				break
			}
			case 'gameOver': {
				this.frame = 1
				if (this.y + r < game.ground.y) {
					this.y += this.speed
					this.updateRotation()
					this.speed += this.gravity * 2
				} else {
					this.speed = 0
					this.y = game.ground.y - r
					this.rotatation = 90
					if (!this.dead) {
						sounds.die.play()
						this.dead = true
					}
				}

				break
			}
		}
	}
	boost() {
		if (this.y > 0) {
			sounds.boost.play()
			this.speed = -this.thrust
		}
	}
	updateRotation() {
		if (this.speed > 0) {
			this.rotatation = Math.min(90, (90 * this.speed) / (this.thrust * 2))
		} else {
			this.rotatation = Math.max(-25, (-25 * this.speed) / (-1 * this.thrust))
		}
	}
	checkCollision() {
		const { scenery } = game
		if (!scenery.obstacles.length) return

		const x = scenery.obstacles[0].x
		const y = scenery.obstacles[0].y
		const r = (this.sprites.spriteHeight + this.sprites.spriteWidth) / 4

		const roof = y + scenery.top.img.height
		const floor = roof + scenery.gap
		const w = scenery.top.img.width
		if (this.x + r >= x) {
			if (this.x + r < x + w) {
				if (this.y - r <= roof || this.y + r >= floor) {
					sounds.hit.play()
					return true
				}
			} else if (scenery.moved) {
				++game.score
				sounds.score.play()
				scenery.moved = false
			}
		}
	}
}

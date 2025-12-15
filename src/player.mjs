// @ts-check
import { canvas, ctx } from './canvas.mjs'
import { GameObject } from './gameObject.mjs'
import { game } from './game.mjs'
import { sounds } from './sounds.mjs'
import { images } from './images.mjs'
import { TowTrailer, VerletEngine } from './verlet.mjs'
import { DELTA_X, GROUND_HEIGHT } from './constants.mjs'
/** @typedef {import('./sprite.mjs').Sprite} Sprite */

export class Player extends GameObject {
	playerSprite = images.player
	sleighImage = images.sleigh

	dead = false
	rotatation = 0
	x = 100
	y = 100
	speed = 0
	gravity = 0.125
	thrust = 3.6
	#frame = 0

	constructor() {
		super()
		// Physics engine for towing
		// Scale gravity to match Verlet engine's time units (pixels/s^2)
		// 0.125 pixels/frame @ 60fps -> 0.125 * (60^2) = 450
		this.engine = new VerletEngine(canvas.width, canvas.height - GROUND_HEIGHT, 450)
		// Tow trailer with tow point at player position, trail point offset behind (left)
		this.trailer = new TowTrailer(this.x, this.y, this.x - 60, this.y)
		this.trailer.trailPoint.damping = 0.95
		this.engine.addBody(this.trailer)
	}

	set frame(value) {
		this.#frame = value % this.playerSprite.numFrames
	}
	get frame() {
		return this.#frame
	}

	/** @override */
	draw() {
		// Draw towed block and rope
		const trailPoint = this.trailer.trailPoint
		const towPoint = this.trailer.towPoint

		// Draw rope (line from tow point to trail point)
		ctx.strokeStyle = '#2c354d77'
		ctx.lineWidth = 1.5
		ctx.beginPath()
		ctx.moveTo(towPoint.x, towPoint.y)

		let endX = trailPoint.x
		let endY = trailPoint.y

		// modify endX and endY so they end partway behind the sleigh sprite (avoid visible gap)
		const angle = Math.atan2(towPoint.y - trailPoint.y, towPoint.x - trailPoint.x)
		endX -= 10 * Math.cos(angle)
		endY -= 10 * Math.sin(angle)

		// Calculate slack
		const midX = (towPoint.x + endX) / 2
		const midY = (towPoint.y + endY) / 2

		// Simulate rope physics for drawing:
		// Gravity pulls down (+), Drag pulls opposite to velocity (-velocity)
		// We use player speed as approximation for system vertical velocity
		const slack = 3 - (this.speed * 2)

		ctx.quadraticCurveTo(midX, midY + slack, endX, endY)

		ctx.stroke()

		// Draw sleigh
		ctx.commit(() => {
			const w = this.sleighImage.naturalWidth
			const h = this.sleighImage.naturalHeight

			const angle = Math.atan2(towPoint.y - trailPoint.y, towPoint.x - trailPoint.x)
			ctx.translate(trailPoint.x, trailPoint.y)
			ctx.rotate(angle)

			// ctx.fillRect(trailPoint.x - (w / 2), trailPoint.y - (h / 2), w, h)
			ctx.drawImage(this.sleighImage, -w / 2, -h / 2, w, h)
		})

		// Draw player
		ctx.commit(() => {
			const h = this.playerSprite.spriteHeight
			const w = this.playerSprite.spriteWidth

			ctx.translate(this.x, this.y)
			ctx.rotate(this.rotatation * Math.PI / 180)

			this.playerSprite.render(ctx, [-w / 2, -h / 2], this.frame)
		})
	}

	/** @override */
	update() {
		// Sync tow point to player position
		const towPoint = this.trailer.towPoint
		towPoint.x = this.x
		towPoint.y = this.y
		towPoint.lastX = this.x
		towPoint.lastY = this.y
		// Pin the tow point so the physics solver doesn't move it
		towPoint.pinX = this.x
		towPoint.pinY = this.y

		// Apply wind force (drag) to the trailer to simulate forward movement
		// The world moves left at DELTA_X, so we apply a leftward force
		// Scale force to match Verlet engine units: force * (1/dt^2)
		// DELTA_X is 2. We want a strong drag.
		const forceScale = 3900 // ~ 1 / 0.016^2
		this.trailer.trailPoint.addForce(-DELTA_X * 0.5 * forceScale, -0.06 * forceScale)

		// Update physics engine - this applies gravity and solves constraints
		if (!this.dead) this.engine.update(0.016)

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
				if (this.checkCollision()) {
					game.status = 'gameOver'
				}

				break
			}
			case 'gameOver': {
				const r = this.playerSprite.spriteWidth / 2

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
	/** @returns {boolean} */
	checkCollision() {
		return this.#checkPlayerCollision() || this.#checkTrailerCollision()
	}
	/** @returns {boolean} */
	#checkPlayerCollision() {
		// check ground collision
		if (this.y + (this.playerSprite.spriteWidth / 2) >= game.ground.y) return true

		// check obstacle collision
		const { scenery } = game
		if (!scenery.obstacles.length) return false

		const { x, y } = scenery.obstacles[0]
		const r = (this.playerSprite.spriteHeight + this.playerSprite.spriteWidth) / 4
		const w = scenery.top.img.width

		const roof = y + scenery.top.img.height
		const floor = roof + scenery.gap
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

		return false
	}
	/** @returns {boolean} */
	#checkTrailerCollision() {
		const trailPoint = this.trailer.trailPoint
		const r = (this.sleighImage.naturalWidth + this.sleighImage.naturalHeight) / 4

		// check ground collision
		if (trailPoint.y + (r * 4 / 3) >= game.ground.y) {
			sounds.hit.play()
			this.dead = true
			return true
		}

		// check obstacle collision
		const { scenery } = game
		if (!scenery.obstacles.length) return false

		const { x, y } = scenery.obstacles[0]
		const w = scenery.top.img.width

		const roof = y + scenery.top.img.height
		const floor = roof + scenery.gap

		if (trailPoint.x + r >= x && trailPoint.x - r <= x + w) {
			if (trailPoint.y - r <= roof || trailPoint.y + r >= floor) {
				sounds.hit.play()
				return true
			}
		}

		return false
	}
}

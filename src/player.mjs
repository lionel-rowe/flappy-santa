// @ts-check
import { ctx } from './canvas.mjs'
import { GameObject } from './gameObject.mjs'
import { game } from './game.mjs'
import { sounds } from './sounds.mjs'
import { images } from './images.mjs'
import { TowTrailer, VerletEngine } from './verlet.mjs'
import { DELTA_X } from './constants.mjs'
/** @typedef {import('./sprite.mjs').Sprite} Sprite */

export class Player extends GameObject {
	playerSprite = images.player
	sleighSprite = images.sleigh

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
		const canvasWidth = ctx.canvas.width
		const canvasHeight = ctx.canvas.height
		// Scale gravity to match Verlet engine's time units (pixels/s^2)
		// 0.125 pixels/frame @ 60fps -> 0.125 * (60^2) = 450
		this.engine = new VerletEngine(canvasWidth, canvasHeight - images.ground.naturalHeight, 450)
		// Tow trailer with tow point at player position, trail point offset behind (left)
		this.trailer = new TowTrailer(this.x, this.y, this.x - 50, this.y)
		this.trailer.getTrailPoint().damping = 0.95
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
		const trailPoint = this.trailer.getTrailPoint()
		const towPoint = this.trailer.getTowPoint()

		// Draw rope (line from tow point to trail point)
		ctx.strokeStyle = '#2c354d77'
		ctx.lineWidth = 1.5
		ctx.beginPath()
		ctx.moveTo(towPoint.x, towPoint.y)

		let endX = trailPoint.x
		let endY = trailPoint.y

		// modify endX and endY so they end in the center of the sleigh sprite
		const angle = Math.atan2(towPoint.y - trailPoint.y, towPoint.x - trailPoint.x)
		const sleighWidth = this.sleighSprite.naturalWidth
		// const sleighHeight = this.sleighSprite.naturalHeight
		endX -= (sleighWidth / 2) * Math.cos(angle)
		endY -= (sleighWidth / 2) * Math.sin(angle)

		// Calculate slack
		const midX = (towPoint.x + endX) / 2
		const midY = (towPoint.y + endY) / 2

		// Simulate rope physics for drawing:
		// Gravity pulls down (+), Drag pulls opposite to velocity (-velocity)
		// We use player speed as approximation for system vertical velocity
		const sag = 12 - (this.speed * 2)

		ctx.quadraticCurveTo(midX, midY + sag, endX, endY)

		ctx.stroke()

		{
			ctx.save()
			// Draw towed block (green square)
			const w = this.sleighSprite.naturalWidth
			const h = this.sleighSprite.naturalHeight

			const angle = Math.atan2(towPoint.y - trailPoint.y, towPoint.x - trailPoint.x)
			ctx.translate(trailPoint.x, trailPoint.y)
			ctx.rotate(angle)

			// ctx.fillRect(trailPoint.x - (w / 2), trailPoint.y - (h / 2), w, h)
			ctx.drawImage(this.sleighSprite, -w / 2, -h / 2, w, h)
			ctx.restore()
		}

		// Draw player
		ctx.save()
		ctx.translate(this.x, this.y)
		ctx.rotate(this.rotatation * Math.PI / 180)
		const h = this.playerSprite.spriteHeight
		const w = this.playerSprite.spriteWidth
		this.playerSprite.render(ctx, [-w / 2, -h / 2], this.frame)
		ctx.restore()
	}

	/** @override */
	update() {
		const r = this.playerSprite.spriteWidth / 2

		// Sync tow point to player position
		const towPoint = this.trailer.getTowPoint()
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
		this.trailer.getTrailPoint().addForce(-DELTA_X * 0.5 * forceScale, -0.06 * forceScale)

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
		const r = (this.playerSprite.spriteHeight + this.playerSprite.spriteWidth) / 4

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

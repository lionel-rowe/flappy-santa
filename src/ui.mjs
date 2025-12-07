// @ts-check
import { canvas, ctx } from './canvas.mjs'
import { GameObject } from './gameObject.mjs'
import { game } from './game.mjs'
import { images } from './images.mjs'
/** @typedef {import('./sprite.mjs').Sprite} Sprite */

export class Ui extends GameObject {
	tapToStart = images.tapToStart

	getReady = { img: images.getReady }
	gameOver = { img: images.gameOver }
	frame = 0
	/** @override */
	draw() {
		switch (game.status) {
			case 'initial': {
				const y = (canvas.height - this.getReady.img.height) / 2
				const x = (canvas.width - this.getReady.img.width) / 2
				const tx = (canvas.width - this.tapToStart.spriteWidth) / 2
				const ty = y + this.getReady.img.height - this.tapToStart.spriteHeight
				ctx.drawImage(this.getReady.img, x, y)
				this.tapToStart.render(ctx, [tx, ty], this.frame)
				break
			}
			case 'gameOver': {
				const y = (canvas.height - this.gameOver.img.height) / 2
				const x = (canvas.width - this.gameOver.img.width) / 2
				const tx = (canvas.width - this.tapToStart.spriteWidth) / 2
				const ty = y + this.gameOver.img.height - this.tapToStart.spriteHeight
				ctx.drawImage(this.gameOver.img, x, y)
				this.tapToStart.render(ctx, [tx, ty], this.frame)
				break
			}
		}
		this.drawScore()
	}

	drawScore() {
		ctx.fillStyle = '#FFFFFF'
		ctx.strokeStyle = '#000000'
		switch (game.status) {
			case 'playing': {
				ctx.lineWidth = 3
				ctx.font = this.font(35)
				this.drawText(String(game.score), 50)
				break
			}
			case 'gameOver': {
				ctx.lineWidth = 3
				ctx.font = this.font(30)
				const scoreMessage = this.scoreMessage('SCORE', game.score)
				this.drawText(scoreMessage, canvas.height / 2)
				try {
					const best = Math.max(
						game.score,
						parseInt(localStorage.getItem('best') ?? '0'),
					)
					localStorage.setItem('best', String(best))
					const bestScoreMessage = this.scoreMessage('BEST', best)
					this.drawText(bestScoreMessage, canvas.height / 2 + 30)
				} catch (e) {
					console.error(e)
				}

				break
			}
		}
	}

	/** @param {number} px */
	font(px) {
		return `bold ${px}px monospace`
	}

	/**
	 * @param {string} caption
	 * @param {number} score
	 */
	scoreMessage(caption, score) {
		return `${caption.padEnd(6)}:${String(score).padStart(6)}`
	}

	/**
	 * @param {string} text
	 * @param {number} originY
	 */
	drawText(text, originY) {
		const metrics = ctx.measureText(text)
		const originX = (canvas.width - metrics.width) / 2
		const params = /** @type {const} */ ([text, originX, originY])
		ctx.strokeText(...params)
		ctx.fillText(...params)
	}

	/** @override */
	update() {
		if (game.status === 'playing') return
		this.frame += game.frames % 10 === 0 ? 1 : 0
		this.frame = this.frame % this.tapToStart.numFrames
	}
}

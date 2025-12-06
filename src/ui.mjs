// @ts-check
import { canvas, ctx } from './canvas.mjs'
import { game } from './game.mjs'
import { images } from './images.mjs'
/** @typedef {import('./sprite.mjs').Sprite} Sprite */

export class Ui {
	/**
	 * @param {Sprite} tapToStart
	 */
	constructor(tapToStart) {
		this.tapToStart = tapToStart
	}

	getReady = { img: images.getReady }
	gameOver = { img: images.gameOver }
	frame = 0
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
	/**
	 * @param {string} text
	 * @param {[number, number]} origin
	 */
	drawText(text, origin) {
		ctx.strokeText(text, ...origin)
		ctx.fillText(text, ...origin)
	}
	drawScore() {
		ctx.fillStyle = '#FFFFFF'
		ctx.strokeStyle = '#000000'
		switch (game.status) {
			case 'playing': {
				ctx.lineWidth = 3
				ctx.font = '35px Impact, sans-serif'
				this.drawText(String(game.score), [canvas.width / 2 - 5, 50])
				break
			}
			case 'gameOver': {
				ctx.lineWidth = 3
				ctx.font = '30px Impact, sans-serif'
				const scoreMessage = `SCORE :     ${game.score}`
				try {
					const best = Math.max(
						game.score,
						parseInt(localStorage.getItem('best') ?? '0'),
					)
					localStorage.setItem('best', String(best))
					const bestScoreMessage = `BEST  :     ${best}`
					this.drawText(scoreMessage, [canvas.width / 2 - 80, canvas.height / 2 + 0])
					this.drawText(bestScoreMessage, [canvas.width / 2 - 80, canvas.height / 2 + 30])
				} catch (e) {
					console.error(e)
					this.drawText(scoreMessage, [canvas.width / 2 - 85, canvas.height / 2 + 15])
				}

				break
			}
		}
	}
	update() {
		if (game.status === 'playing') return
		this.frame += game.frames % 10 === 0 ? 1 : 0
		this.frame = this.frame % this.tapToStart.numFrames
	}
}

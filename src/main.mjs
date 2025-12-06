// @ts-check
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import { canvas, ctx } from './canvas.mjs'
import { game } from './game.mjs'
import { sounds } from './sounds.mjs'
import { FRAME_INTERVAL } from './constants.mjs'
import { images } from './images.mjs'
/** @typedef {import('./sprite.mjs').Sprite} Sprite */

canvas.width = 276
canvas.height = 414
canvas.tabIndex = 0 // make canvas focusable to receive keyboard events

const player = game.player

function doAction() {
	switch (game.status) {
		case 'initial': {
			game.status = 'playing'
			sounds.start.play()
			break
		}
		case 'playing': {
			player.boost()
			break
		}
		case 'gameOver': {
			game.status = 'initial'
			player.speed = 0
			player.y = 100
			game.scenery.obstacles = []
			game.score = 0
			player.dead = false
			break
		}
	}
}

canvas.addEventListener('mousedown', doAction)
canvas.addEventListener('keydown', (e) => {
	if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return
	if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w') {
		e.preventDefault()
		doAction()
	}
})

const background = {
	img: images.background,
	draw() {
		const y = canvas.height - this.img.height
		ctx.drawImage(this.img, 0, y)
	},
}

function gameLoop() {
	update()
	draw()
	++game.frames
}

function update() {
	player.update()
	game.ground.update()
	game.scenery.update()
	game.ui.update()
}

function draw() {
	ctx.fillStyle = '#30c0df'
	ctx.fillRect(0, 0, canvas.width, canvas.height)
	background.draw()
	game.scenery.draw()

	player.draw()
	game.ground.draw()
	game.ui.draw()
}

setInterval(gameLoop, FRAME_INTERVAL)

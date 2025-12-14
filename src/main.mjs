// @ts-check
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import { canvas } from './canvas.mjs'
import { game } from './game.mjs'
import { sounds } from './sounds.mjs'
import { CANVAS_HEIGHT, CANVAS_WIDTH, FRAME_INTERVAL } from './constants.mjs'
import { Player } from './player.mjs'
import { Scenery } from './scenery.mjs'
import './music.mjs'

/** @typedef {import('./sprite.mjs').Sprite} Sprite */

canvas.width = CANVAS_WIDTH
canvas.height = CANVAS_HEIGHT
canvas.tabIndex = 0 // make canvas focusable to receive keyboard events

function doAction() {
	switch (game.status) {
		case 'initial': {
			game.status = 'playing'
			sounds.start.play()
			break
		}
		case 'playing': {
			game.player.boost()
			break
		}
		case 'gameOver': {
			game.status = 'initial'
			game.score = 0
			game.scenery = new Scenery()
			game.player = new Player()
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

function gameLoop() {
	for (
		const obj of [
			game.background,
			game.snowBackground,
			game.scenery,
			game.snowForeground,
			game.ground,
			game.player,
			game.ui,
		]
	) {
		obj.update()
		obj.draw()
	}
	++game.frames
}

setInterval(gameLoop, FRAME_INTERVAL)

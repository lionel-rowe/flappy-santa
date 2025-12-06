// @ts-check
import { Player } from './player.mjs'
import { Ground } from './ground.mjs'
import { Scenery } from './scenery.mjs'
import { Ui } from './ui.mjs'
import { images } from './images.mjs'

/** @typedef {'initial' | 'playing' | 'gameOver'} Status */

export const game = {
	frames: 0,
	score: 0,
	status: /** @type {Status} */ ('initial'),
	player: new Player(images.player),
	ground: new Ground(),
	scenery: new Scenery(),
	ui: new Ui(images.tapToStart),
}

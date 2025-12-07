// @ts-check
import { Player } from './player.mjs'
import { Ground } from './ground.mjs'
import { Scenery } from './scenery.mjs'
import { Ui } from './ui.mjs'
import { Background } from './background.mjs'

/** @typedef {'initial' | 'playing' | 'gameOver'} Status */

export const game = {
	frames: 0,
	score: 0,
	status: /** @type {Status} */ ('initial'),
	player: new Player(),
	ground: new Ground(),
	scenery: new Scenery(),
	ui: new Ui(),
	background: new Background(),
}

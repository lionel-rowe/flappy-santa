// @ts-check
import { Player } from './player.mjs'
import { Ground } from './ground.mjs'
import { Scenery } from './scenery.mjs'
import { Ui } from './ui.mjs'
import { Background } from './background.mjs'
import { Snow } from './snow.mjs'

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
	snowForeground: new Snow({ speed: 1, opacity: 1, spawnFrequency: 0.3, size: 1 }),
	snowBackground: new Snow({ speed: 0.3, opacity: 0.7, spawnFrequency: 0.8, size: 0.6 }),
}

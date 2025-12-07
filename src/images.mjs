// @ts-check
import { Sprite } from './sprite.mjs'
import { promiseAllKeyed } from './utils.mjs'

const IMG_DIR = '/img'

export const images = await promiseAllKeyed({
	player: Sprite.load(`${IMG_DIR}/player.png`, 3),
	tapToStart: Sprite.load(`${IMG_DIR}/tap-to-start.png`, 2),

	ground: loadImage(`${IMG_DIR}/ground.png`),
	background: loadImage(`${IMG_DIR}/background.png`),
	obstacleTop: loadImage(`${IMG_DIR}/obstacle-top.png`),
	obstacleBottom: loadImage(`${IMG_DIR}/obstacle-bottom.png`),
	getReady: loadImage(`${IMG_DIR}/get-ready.png`),
	gameOver: loadImage(`${IMG_DIR}/game-over.png`),
})

/**
 * @param {string} src
 * @returns {Promise<HTMLImageElement>}
 */
export async function loadImage(src) {
	const img = Object.assign(new Image(), { src })
	await new Promise((res, rej) => {
		img.addEventListener('load', res)
		img.addEventListener('error', (e) => {
			alert(`Failed to load image from source ${src}`)
			rej(e)
		})
	})
	return img
}

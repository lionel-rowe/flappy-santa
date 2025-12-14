// @ts-check
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './constants.mjs'
import { assert } from './utils.mjs'

const { canvas, ctx } = (() => {
	const canvas = document.querySelector('canvas#target')
	assert(canvas instanceof HTMLCanvasElement)
	Object.assign(canvas, { width: CANVAS_WIDTH, height: CANVAS_HEIGHT })
	const ctx = canvas.getContext('2d')
	assert(ctx != null)
	return { canvas, ctx }
})()

export { canvas, ctx }

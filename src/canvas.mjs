// @ts-check
import { assert } from './utils.mjs'

const { canvas, ctx } = (() => {
	const canvas = document.querySelector('canvas#target')
	assert(canvas instanceof HTMLCanvasElement)
	const ctx = canvas.getContext('2d')
	assert(ctx != null)
	return { canvas, ctx }
})()

export { canvas, ctx }

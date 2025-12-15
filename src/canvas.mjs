// @ts-check
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './constants.mjs'
import { assert } from './utils.mjs'

const { canvas, ctx } = (() => {
	const canvas = document.querySelector('canvas#target')
	assert(canvas instanceof HTMLCanvasElement)
	Object.assign(canvas, { width: CANVAS_WIDTH, height: CANVAS_HEIGHT })
	const c = canvas.getContext('2d')
	assert(c instanceof CanvasRenderingContext2D)
	const ctx = Object.assign(c, {
		/**
		 * @this {CanvasRenderingContext2D}
		 * @param {() => void} fn
		 *
		 * Captures the initial canvas state, executes the callback, then restores the initial state.
		 */
		commit(fn) {
			this.save()
			try {
				fn()
			} catch (e) {
				throw e
			} finally {
				this.restore()
			}
		},
	})

	return { canvas, ctx }
})()

export { canvas, ctx }

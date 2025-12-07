// @ts-check

/** @abstract */
export class GameObject {
	/**
	 * @abstract
	 * @returns {void}
	 */
	draw() {
		throw new Error(`Abstract method not implemented by ${this.constructor.name}.`)
	}

	/**
	 * @abstract
	 * @returns {void}
	 */
	update() {
		throw new Error(`Abstract method not implemented by ${this.constructor.name}.`)
	}
}

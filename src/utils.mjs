// @ts-check

/**
 * @template T
 * @param {T} condition
 * @param {string} [message]
 * @returns {asserts condition}
 */
export function assert(condition, message) {
	if (!condition) {
		throw new Error(message ?? 'Assertion failed')
	}
}

/**
 * @template {Record<string, unknown>} T
 * @param {T} obj
 * @returns {Promise<{ [K in keyof T]: Awaited<T[K]> }>}
 */
export async function promiseAllKeyed(obj) {
	const keys = Object.keys(obj)
	const values = await Promise.all(Object.values(obj))
	/** @type {any} */
	const resObj = Object.create(null)
	for (let i = 0; i < keys.length; ++i) {
		resObj[keys[i]] = values[i]
	}
	return resObj
}

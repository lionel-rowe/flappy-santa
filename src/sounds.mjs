// @ts-check

const SOUNDS_DIR = '/sounds'

export const sounds = {
	start: new Audio(`${SOUNDS_DIR}/start.wav`),
	boost: new Audio(`${SOUNDS_DIR}/boost.wav`),
	score: new Audio(`${SOUNDS_DIR}/score.wav`),
	hit: new Audio(`${SOUNDS_DIR}/hit.wav`),
	die: new Audio(`${SOUNDS_DIR}/die.wav`),
}

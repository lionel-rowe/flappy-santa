// @ts-check
import { assert } from './utils.mjs'

const $audioControls = document.getElementById('audio-controls')
assert($audioControls instanceof HTMLElement)

const $button = $audioControls.querySelector('button')
const $audio = $audioControls.querySelector('audio')

assert($button instanceof HTMLButtonElement)
assert($audio instanceof HTMLAudioElement)

/**
 * @param {string} src
 * @param {string} alt
 * @returns {HTMLImageElement}
 */
function icon(src, alt) {
	const img = new Image()
	img.src = src
	img.alt = alt
	img.title = alt
	img.className = 'icon audio-icon'

	const preload = document.createElement('link')
	preload.rel = 'preload'
	preload.as = 'image'
	preload.href = src
	document.head.appendChild(preload)

	return img
}

const $playingIcon = icon(
	'./img/audio-play-icon.svg',
	'Playing (click to mute)',
)
const $mutedIcon = icon(
	'./img/audio-mute-icon.svg',
	'Muted (click to play)',
)

$button.addEventListener('click', () => {
	$button.innerHTML = ''
	if ($audio.paused) {
		$audio.play()
		$button.append($playingIcon)
		localStorage.removeItem('music-muted')
	} else {
		$audio.pause()
		$button.append($mutedIcon)
		localStorage.setItem('music-muted', '1')
	}
})

if (localStorage.getItem('music-muted')) {
	$button.append($mutedIcon)
} else {
	$button.append($playingIcon)

	// liable to be blocked by browser autoplay policy, in which case
	// the promise rejects, and we wait for a user interaction to start the audio
	$audio.play().catch(() => {
		const ac = new AbortController()
		const { signal } = ac
		for (const event of ['click', 'keyup']) {
			document.body.addEventListener(event, (e) => {
				if (e.target !== $button) {
					$audio.play()
					ac.abort()
				}
			}, { signal })
		}
	})
}

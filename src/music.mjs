const $audioControls = document.getElementById('audio-controls')
const $button = $audioControls.querySelector('button')
const $audio = $audioControls.querySelector('audio')

const muteIcon = '<img src="img2/audio-mute-icon.svg" alt="Mute">'
const playIcon = '<img src="img2/audio-play-icon.svg" alt="Play">'

$button.innerHTML = muteIcon

$button.addEventListener('click', function () {
	if ($audio.paused) {
		$audio.play()
		this.innerHTML = playIcon
	} else {
		$audio.pause()
		this.innerHTML = muteIcon
	}
})

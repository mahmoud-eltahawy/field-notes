const box = document.getElementById("BOX")
const tools = init_tools(box)


tools.X_SCALE = 1.2
tools.Y_SCALE = 1.2
tools.INIT_WIDTH = 720
tools.INIT_HEIGHT = 720

tools.resize()
tools.bg_clear()


const INIT_RED_LEN = 1.0
let RED = v_new(INIT_RED_LEN,0.0)
const ZERO = v_new(0.0,0.0)
const BLUE = v_new(INIT_RED_LEN,0.0)
const INIT_D_ANGLE = 0.5

let angle = 0
let d_angle = INIT_D_ANGLE

const pause_milis = 1800

const pause_angles = [
	45,
	60,
	30,
]

let is_paused = false

function should_pause() {
	for (const x of pause_angles) {
		if (angle % x === 0) {
			return true
		}
	}
	return false
}


function regular_pause() {
	if (is_paused) {
		setTimeout(regular_pause,1000)
		return
	}
	if (should_pause()) {
		d_angle = 0
		setTimeout(() => {
			d_angle = INIT_D_ANGLE
		},pause_milis)
	}
}

function draw() {
	tools.bg_clear()

	if (!is_paused) {
		angle += d_angle
		RED = v_rotate_z(RED,d_angle)
	}
	BLUE[X] = RED[X]

	ANGLE.innerText = (angle % 360).toString().slice(0,3)
	RED_LENGTH.innerText = INIT_RED_LEN
	BLUE_LENGTH.innerText = RED[X].toString().slice(0,4)
	GREEN_LENGTH.innerText = RED[Y].toString().slice(0,4)
	TAN.innerText = RED[Y] / RED[X]


	tools.draw_line(ZERO,RED,3,"red")
	tools.draw_line(ZERO,BLUE,3,"blue")
	tools.draw_line(BLUE,RED,3,"green")

	regular_pause()
	requestAnimationFrame(draw)
}
draw()
STOP_BUTTON.addEventListener("click",() => {
	is_paused = !is_paused
	if (is_paused) {
		STOP_BUTTON.innerText = "resume"
	} else {
		STOP_BUTTON.innerText = "stop it here"
	}
})

const box = document.getElementById("BOX")
const ctx = BOX.getContext("2d")
const SIZE = 255 
const RANGE = 255

const CENTER = v2_splat(0.5)
const IMAGE = ctx.getImageData(0,0,SIZE,SIZE)

function resize() {
	BOX.width = SIZE
	BOX.height = SIZE
}
resize()

function fill_pixel(r,g,b,a,i) {
	IMAGE.data[i] = r
	IMAGE.data[i+1] = g
	IMAGE.data[i+2] = b
	IMAGE.data[i+3] = a
}


let blackhole_center = v2_splat(0.15) 
const blackhole_displacement = v_new(0.4,0.4)
const init_shifted_center = v_add(blackhole_center,blackhole_displacement)
const max_displacement = v_len(v_sub(V2_ZERO,init_shifted_center))
function blackhole(u,v,i) {
	const uv = v_new(u,v)
	const shifted_center = v_add(blackhole_center,blackhole_displacement)
	const c = (v_len(v_sub(uv,shifted_center)) / max_displacement) * RANGE
	fill_pixel(c/4,c/2,c,255,i)
}

function fill_buffer(frag) {
	let i = 0;
	for (let w = 0; w < SIZE; w++) {
		for (let h = 0;h < SIZE; h++) {
			const u = w / SIZE;
			const v = h / SIZE;
			frag(u,v,i)
			i += 4
		}
	}
}

let selected_shader = blackhole

function draw() {
	fill_buffer(selected_shader)
	ctx.putImageData(IMAGE,0,0)
	blackhole_center = v_rotate_z(blackhole_center,2)
	requestAnimationFrame(draw)
}
draw()


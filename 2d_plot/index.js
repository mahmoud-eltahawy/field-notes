const RESOLOUTION = 400;

const box = document.getElementById("box")
const config = {
	x_axes_width : 3.0,
	y_axes_width : 3.0,
	xx_axes_width : 1,
	yy_axes_width : 1,
	xxx_axes_width : 0.3,
	yyy_axes_width : 0.3,
}
function random_color() {
	const r = Math.random() * 255;
	const g = Math.random() * 255
	const b = Math.random() * 255
	return `rgb(${r},${g},${b}`
}

const tools = init_tools(box)
tools.X_SCALE = 10
tools.Y_SCALE = 10

function resize() {
	const mwh = Math.min(window.innerWidth,window.innerHeight) - 100
	tools.INIT_WIDTH = tools.INIT_HEIGHT = mwh
	tools.resize()
}
resize()

addEventListener('resize',resize)

let virtual_center = v_new(0,0)
let move_begin = v_new(0,0)
let mouse_down = false

box.addEventListener("mousedown",ev => {
	mouse_down = ev.buttons === 1
	move_begin[X] = Math.round(((ev.clientX / tools.INIT_WIDTH) * 2 -1) * tools.X_SCALE);
	move_begin[Y] = -Math.round(((ev.clientY / tools.INIT_HEIGHT) * 2 -1) * tools.Y_SCALE);
})

box.addEventListener("mouseup",ev => {
	mouse_down = ev.buttons === 1
	move_begin = virtual_center 
})

box.addEventListener("mousemove",ev => {
	if (!mouse_down) {
		return
	}
	const x = Math.round(((ev.clientX / tools.INIT_WIDTH) * 2 -1) * tools.X_SCALE);
	const y = -Math.round(((ev.clientY / tools.INIT_HEIGHT) * 2 -1) * tools.Y_SCALE);
	const p = v_new(x,y)
	virtual_center = v_sub(p,move_begin)
})

function draw_gradient() {
	const {
		x_axes_width,
		y_axes_width,
		xx_axes_width,
		yy_axes_width,
		xxx_axes_width,
		yyy_axes_width,
	} = config;

	const helper = ([x1,y1],[x2,y2],w) => {
		const p1 = v_add(v_new(x1,y1),virtual_center)
		const p2 = v_add(v_new(x2,y2),virtual_center)
		tools.draw_line(p1,p2,w)
	}
	const NTX = -tools.X_SCALE - virtual_center[X]
	const PTX = tools.X_SCALE - virtual_center[X]
	const NTY = -tools.Y_SCALE - virtual_center[Y]
	const PTY = tools.Y_SCALE - virtual_center[Y]
	if (x_axes_width) {
		helper([NTX,0],[PTX,0],x_axes_width)
	}
	if (y_axes_width) {
		helper([0,NTY],[0,PTY],y_axes_width)
	}
	for (let i = NTY; i <= PTY; i++) {
		if (xx_axes_width) {
			helper([NTX,i], [PTX,i], xx_axes_width)
		}
		if (xxx_axes_width) {
			helper(
				[NTX,i + 0.5],
				[PTX,i + 0.5],
				xxx_axes_width)
		}
	}
	for (let i = NTX; i <= PTX; i++) {
		if (yy_axes_width) {
			helper([i,NTY], [i,PTY], yy_axes_width)
		}
		if (yyy_axes_width) {
			helper(
				[i + 0.5,NTY],
				[i + 0.5,PTY],
				yyy_axes_width)
		}
	}
}
function clear() {
    tools.bg_clear()
    draw_gradient()
}
clear()
const shapes = []
let visiable_shapes = []

function draw_shapes() {
	for (const shape of shapes) {
		const vertices = shape.vertices.slice(0,shape.draw_progress) 
		tools.linestrip(vertices.map(p => v_add(p,virtual_center)),2,shape.color)
		if (shape.draw_progress < shape.vertices.length) {
			const target = shape.forward ? shape.vertices.length : 0; 
			shape.draw_progress = lerp(shape.draw_progress,target,0.05)
		}
	}
}

function main_loop() {
	clear()
	draw_shapes()
	requestAnimationFrame(main_loop)
}
main_loop()

function undraw(index) {
	shapes[index].forward = false
	return index
}
function redraw(index) {
	shapes[index].forward = true
	return index
}

function fx(fun,begin,end) {
	if (!begin) {
		begin = -tools.X_SCALE
	}
	if (!end) {
		end = tools.X_SCALE
	}
	const ddx = Math.abs(end - begin) / RESOLOUTION
	let vertices = []
	for (let x = begin; x < end;x += ddx ) {
		const y = fun(x)
		vertices.push(v_new(x,y))
	}
	return register_shape(vertices)
}

function fy(fun,begin,end) {
	if (!begin) {
		begin = -tools.Y_SCALE
	}
	if (!end) {
		end = tools.Y_SCALE
	}
	const ddx = Math.abs(end - begin) / RESOLOUTION
	let vertices = []
	for (let y = begin; y < end;y += ddx ) {
		const x = fun(y)
		vertices.push(v_new(x,y))
	}
	return register_shape(vertices)
}
function register_shape(vertices) {
	const index = shapes.length
	shapes.push({
		vertices,
		draw_progress : 0,
		color: random_color(),
		forward : true,
	})
	return index
}

const DDT = 0.01
const ctx = BOX.getContext("2d")
const config = {
	scale : 10,
}
const dis = 8
const controll_point_size = 0.4

const state = {
	points : [],
	ctrl_down : false,
	alt_down : false,
	mouse_down : false,
	mouse : new Vec2({x :  0,y : 0}),
	dt : 0,
	controll_points : [
		new Vec2({x : -dis,y : dis}),
		new Vec2({x : -dis,y : -dis}),
		new Vec2({x : dis,y : -dis}),
		new Vec2({x : dis,y : dis}),
	],
	hovered_point_index : -1,	
}

function box_size() {
	return Math.min(window.innerWidth,window.innerHeight) - 50
}

function resize() {
	const size = box_size()
	BOX.width = size
	BOX.height = size
	clear_background()
}
resize()
addEventListener("resize",resize)

addEventListener("keydown",(ev) => {
	if (ev.key === "Control") {
		state.ctrl_down = true
	} else if (ev.key === "Alt") {
		state.alt_down = true
	}
})

addEventListener("keyup",(ev) => {
	if (ev.key === "Control") {
		state.ctrl_down = false
	} else if (ev.key === "Alt") {
		state.alt_down = false
		state.hovered_point_index = -1
	}

})

BOX.addEventListener("mousedown",ev => {
	if (state.ctrl_down) {
		const p = get_mouse_pos(ev)
		state.controll_points.push(p)
		redraw()
	} else if (state.alt_down) {
		state.mouse_down = true
	}
})

BOX.addEventListener("mouseup",ev => {
	state.mouse_down = false
})

function clear_background() {
	const size = box_size()
	ctx.fillStyle = "#000000"
	ctx.fillRect(0,0,size,size)
}
clear_background()

function linestrip(points,width = 2,color = "#FFFFFF") {
	for (let i=0; i< points.length -1; i++) {
		let first = points[i]
		let second = points[i+1]
		first.draw_line_to(second,width,color)
	}
}

function next_curve_point(points,t) {
	if (points.length === 1) {
		return points[0]
	}
	const res = []
	for (let i = 0; i<points.length -1; i++) {
		const a = points[i]
		const b = points[i + 1]
		const p = a.lerp(b,t) 
		const done_color = "#00FF00"
		a.draw_line_to(p,4,done_color)
		p.draw_line_to(b,2,"#0000FF")
		if (points.length === 2) {
			draw_lead(p)
			return p
		}
		draw_factors(a,b,p,done_color)
		res.push(p)
	}

	return next_curve_point(res,t)
}

function draw_controll_points() {
	const level = state.controll_points 
	for (let j = 0;j<level.length;j++) {
		const color = j === state.hovered_point_index ? "#FF0000" : "#FFFFFF"
		level[j].draw_circle(controll_point_size/2,color)
	}
}

function draw_factors(begin,end,lead,color = "#FF0000") {
	const ref1 = begin
	const ref2 = end
	if (!ref1 || !ref2) {
		return
	}
	let direction = ref2.sub(ref1)
	direction = direction.scale(1/direction.determint())
	direction.x *= -1
	lead.draw_right_arrow(controll_point_size,direction,color)
}

function draw_lead(lead) {
	const ref1 = state.points.at(-2)
	const ref2 = state.points.at(-1)
	draw_factors(ref1,ref2,lead)
}


function main_loop() {
	clear_background()

	if (state.ctrl_down) {
		state.mouse.draw_rect(controll_point_size)
	}

	const lead = next_curve_point(state.controll_points,state.dt)

	draw_controll_points()

	if (state.dt < 1) {
		state.dt += DDT
		state.points.push(lead)
	}
	linestrip(state.points,2,"red")

	requestAnimationFrame(main_loop)
}
main_loop()

function redraw() {
	state.dt = 0
	state.points = []
}

REPLAY.addEventListener("click",() => {
	redraw()
})

POP.addEventListener("click",() => {
	if (state.controll_points.length > 1) {
		state.controll_points.pop()
		redraw()
	}
})

function get_mouse_pos(ev) {
	const x = (ev.clientX / box_size() * 2 - 1) * config.scale
	const y = -(ev.clientY / box_size() * 2 -1) * config.scale
	return new Vec2({x,y})
}

function move_controll_point(ev) {
	if (state.hovered_point_index !== -1 && state.mouse_down) {
		const p  = get_mouse_pos(ev)
		state.controll_points[state.hovered_point_index] = p
		redraw()
	}
}

BOX.addEventListener("mousemove",ev => {
	const p = get_mouse_pos(ev)
	state.mouse = p
	if (state.alt_down) {
		const p = get_mouse_pos(ev)
		let chosed = -1
		for (let i = 0; i<state.controll_points.length; i++) {
			const xp = state.controll_points[i]
			if (p.distance(xp) < controll_point_size) {
				chosed = i
				break
			}
		}
		state.hovered_point_index = chosed
		move_controll_point(ev)
	}
})

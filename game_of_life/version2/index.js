"use strict"

const tools = init_tools(box)

const state = {
	generation_age : 400,
	virtual_center : v(0,0),
	hovered_cell : v(0,0),
	config_index : 2,
	add_config_mode : false,
	config_sets : new Array(),
	cursor_config_index : 0,
	cursor_config_sets : new Array(),
	gen_age_instance : performance.now(),
	title_reset_instance : null,
	reset_title_after : null,
	controll : {
		ctrl_pressed : false,
		ref_point : null,
		ref_center : null,
	},
	show_help_msg : false,
	pause_game : false,
}

function new_config(...set) {
	state.config_sets.push({
		gen : 1,
		set : new Array(...set), 
		backup : new Array(...set), 
	})
}
function new_cursor_config(name,...set) {
	state.cursor_config_sets.push({
		name,
		set : new Array(...set),
	})
}

function elapsed_millis() {
	return performance.now() - state.gen_age_instance
}


new_cursor_config(
	"single cell"
)
new_cursor_config(
	"square of 4 cells",
	v(1,0),v(0,1),v(1,1)
)
new_cursor_config(
	"horizontal 5 cells",
	v(1,0),v(2,0),v(3,0),v(4,0)
)
new_cursor_config(
	"vertical 5 cells",
	v(0,1),v(0,2),v(0,3),v(0,4)
)
new_cursor_config(
	"diagonal 5 cells",
	v(1,1),v(2,2),v(3,3),v(4,4),
)
new_cursor_config(
	"top right walker",
	v(1,1),v(1,2),v(0,2),v(-1,2),
)
new_cursor_config(
	"top left walker",
	v(-1,1),v(-1,2),v(0,2),v(1,2),
)
new_cursor_config(
	"bottom right walker",
	v(1,-1),v(1,-2),v(0,-2),v(-1,-2),
)
new_cursor_config(
	"bottom left walker",
	v(-1,-1),v(-1,-2),v(0,-2),v(1,-2),
)


new_config(
	v(1,1),
	v(1,2),
	v(2,2),
	v(3,2),
)
new_config(
	v(-2,1),
	v(-2,2),
	v(-1,2),
	v(0,2),
)
new_config(
	...state.config_sets[0].set,
	...state.config_sets[1].set,
)


tools.draw_cell = function (
	start,
	color,
) {
	const half = v.div(start,v(2,2))
	const half_unit_left = v.sub(half,v(0.5,0))
	const virtual_centered = v.add(half_unit_left,state.virtual_center)
	const s = this.v_denormal(virtual_centered)
	const widthn = denormal_abs(1,this.INIT_WIDTH,this.X_SCALE)
	const heightn = denormal_abs(1,this.INIT_HEIGHT,this.Y_SCALE)
	this.ctx.fillStyle = color 
	this.ctx.fillRect(s[X],s[Y],widthn,heightn)
}

function box_size() {
	return Math.min(innerWidth,innerHeight) - 10
}
function resize() {
	tools.INIT_WIDTH = tools.INIT_HEIGHT = box_size()
	tools.resize()
}
resize()

addEventListener("resize",resize)
const original_title = document.title
function reset_title(dur = 800) {
	state.reset_title_after = dur
	state.title_reset_instance = performance.now()
}
function reset_title_system() {
	if (!state.title_reset_instance || !state.reset_title_after) {
		return
	}
	const elapsed = performance.now() - state.title_reset_instance
	if (elapsed > state.reset_title_after) {
		document.title = original_title
		state.title_reset_instance = null
		state.reset_title_after = null
	}
}

addEventListener("keydown",(ev) => {
	switch (ev.keyCode) {
		// (p) key
		case 80 : 
			if (state.add_config_mode) {
				return
			}
			if (state.pause_game) {
				document.title = original_title +  " (resumed)"
				reset_title()
			} else {
				document.title = original_title +  " (paused)"
			}
			state.pause_game = !state.pause_game
			break;
		// (h) key
		case 72 : 
			state.show_help_msg = true
			state.pause_game = true
			break;
		// Ctrl key
		case 17 : 
			state.controll.ctrl_pressed = true
			break;
		// right key
		case 39 :
			if (state.add_config_mode) {
				state.cursor_config_index = (state.cursor_config_index + 1) % state.cursor_config_sets.length
				document.title = state.cursor_config_sets[state.cursor_config_index].name+"..."
				reset_title()
			} else {
				state.generation_age += 50
			}
			break;
		// left key
		case 37 :
			if (state.add_config_mode) {
				state.cursor_config_index = (
					state.cursor_config_sets.length + state.cursor_config_index - 1
				) % state.cursor_config_sets.length
				document.title = state.cursor_config_sets[state.cursor_config_index].name+"..."
				reset_title()
			} else {
				state.generation_age -= 50
			}
			break;
		// up key
		case 38 :
			tools.X_SCALE++
			tools.Y_SCALE++
			break;
		// down key
		case 40 :
			tools.X_SCALE--
			tools.Y_SCALE--
			break;
		// (r) key
		case 82 :
			state.config_sets[state.config_index].set = state.config_sets[state.config_index].backup
			state.config_sets[state.config_index].gen = 1
			break;
		// (a) key
		case 65 :
			if (state.add_config_mode) {
				return
			}
			state.add_config_mode = true
			new_config()
			state.config_index = state.config_sets.length -1
			document.title = "add config mode..."
			reset_title()
			break;
		// (g) key
		case 71 :
			if (!state.add_config_mode) {
				return
			}
			state.add_config_mode = false
			state.pause_game = false
			document.title = "play custom config start..."
			reset_title()
			break;
		default:
			break;
	}
})
addEventListener("keyup",ev => {
	switch (ev.keyCode) {
		// (h) key
		case 72 : 
			state.show_help_msg = false
			state.pause_game = false
		//Ctrl key
		case 17 :
			state.controll.ctrl_pressed = false
			break;
		default:
			break;
	}
})

addEventListener("mousedown",ev => {
	if (ev.buttons === 1) {
		if (state.controll.ctrl_pressed) {
			state.controll.ref_point = map_canvas_axis_to_standard(ev.clientX,ev.clientY)
			state.controll.ref_center = state.virtual_center
		}
	}
})
addEventListener("mouseup",ev => {
	state.controll.ref_point = null
	state.controll.ref_center = null
})


function draw_gradient() {
	const default_width = 100 / (Math.min(tools.X_SCALE,tools.Y_SCALE) * box_size());
	const helper = ([x1,y1],[x2,y2],width = default_width,color = "#FFFFFF") => {
		const p1 = v.add(v(x1,y1),state.virtual_center)
		const p2 = v.add(v(x2,y2),state.virtual_center)
		tools.draw_line(p1,p2,width,color)
	}
	const x_scale = tools.X_SCALE + Math.abs(state.virtual_center[X])
	const y_scale = tools.Y_SCALE + Math.abs(state.virtual_center[Y])
	helper([-x_scale,0],[x_scale,0],default_width * 3,"red")
	helper([0,-y_scale],[0,y_scale],default_width * 3,"red")
	for (let i = -y_scale; i <= y_scale; i++) {
		helper([-x_scale,i], [x_scale,i])
		helper(
			[-x_scale,i + 0.5],
			[x_scale,i + 0.5])
	}
	for (let i = -x_scale; i <= x_scale; i++) {
		helper([i,-y_scale], [i,y_scale])
		helper(
			[i + 0.5,-y_scale],
			[i + 0.5,y_scale])
	}
}


function living_cells() {
	return state.config_sets[state.config_index].set
}


function draw_living_cells() {
	for (const cell of living_cells()) {
		tools.draw_cell(
			cell,
			"green",
		)
	}
}

function list_contains_vec(list,vec) {
	return list.some(vx => vx[X] === vec[X] && vx[Y] === vec[Y])
}

function is_living(vec) {
	return list_contains_vec(living_cells(),vec)
}

function left(vec) {
	return v(vec[X] -1,vec[Y])
}
function right(vec) {
	return v(vec[X] +1,vec[Y])
}
function up(vec) {
	return v(vec[X],vec[Y]+1)
}
function down(vec) {
	return v(vec[X],vec[Y]-1)
}

function neighbours(vec) {
	return [left(vec),right(vec),up(vec),down(vec),up(right(vec)),up(left(vec)),down(right(vec)),down(left(vec))]
}

function count_living_neighbours(vec) {
	let count = 0;
	for (const x of neighbours(vec)) {
		if (is_living(x)) {
			count++
		}
	}
	return count
}

function add_config_draw() {
	if (!state.add_config_mode) {
		return
	}
	const config = state.cursor_config_sets[state.cursor_config_index]
	tools.draw_cell(
		state.hovered_cell,
		"blue",
	)
	for (const cell of config.set) {
		tools.draw_cell(
			v.add(state.hovered_cell,cell),
			"blue",
		)
	}
}

const help_text = [
	"help : h",
	"speed up generations : left",
	"slow down generations : right",
]
function draw_help_msg() {
	if (state.show_help_msg) {
		tools.bg_clear("#152027")
		const offset = (tools.Y_SCALE * 2) / help_text.length
		for (let i = 0 ; i < help_text.length; i++) {
			tools.draw_text(v(-tools.X_SCALE /2,i * offset - tools.Y_SCALE * 0.8),help_text[i],44,"#000000")
		}

	}
}

function draw() {
	tools.bg_clear()
	tools.draw_text(v(0,tools.Y_SCALE -1),`generation : ${state.config_sets[state.config_index].gen}`,22,"#FFFFFF")
	draw_gradient()
	draw_living_cells()

	//config extinct
	if(!state.config_sets[state.config_index].set.length && !state.add_config_mode) {
		tools.draw_text(v(0,0),"EXTINCT",44,"#FFFFFF")
	}

	add_config_draw()
	draw_help_msg()
}

function map_canvas_axis_to_standard(cx,cy) {
	const x = (cx / tools.INIT_WIDTH) * tools.X_SCALE * 2 - tools.X_SCALE 
	const y = -((cy / tools.INIT_HEIGHT) * tools.Y_SCALE * 2 - tools.Y_SCALE)
	return v(x,y)
}

box.addEventListener("mousemove",ev => {
	const client_v = map_canvas_axis_to_standard(ev.clientX,ev.clientY)
	if (state.controll.ref_point) {
		const vv = v.sub(
			state.controll.ref_point,
			client_v)
		state.virtual_center = v.sub(state.controll.ref_center,vv).map(x => Math.ceil(x)) 
		
	}
	if (state.add_config_mode) {
		state.hovered_cell = client_v.map(c => Math.ceil(c * 2)) 
	}
})
box.addEventListener("click",ev => {
	if (!state.add_config_mode) {
		return
	}

	const config = state.cursor_config_sets[state.cursor_config_index]
	const selected_config = state.config_sets[state.config_sets.length -1]
	if (list_contains_vec(selected_config.set,state.hovered_cell)) {
		return
	}
	selected_config.set.push(state.hovered_cell)
	selected_config.backup.push(state.hovered_cell)
	for (const cell of config.set) {
		const new_cell = v.add(cell,state.hovered_cell)
		if (list_contains_vec(selected_config.set,new_cell)) {
			continue
		}
		selected_config.set.push(new_cell)
		selected_config.backup.push(state.hovered_cell)
	}

})

function next_generation() {
	const survived = living_cells().filter(x => {
		const living_count = count_living_neighbours(x)
		return living_count === 2 || living_count === 3
	})

	const dead_neighbours = []
	for (const vec of living_cells()) {
		const vec_neighbours = neighbours(vec) 
	}

	for (const xs of living_cells().map(x => neighbours(x).filter(x => !is_living(x)))) {
		for (const x of xs) {
			if (list_contains_vec(survived,x)) {
				continue
			}
			if (count_living_neighbours(x) === 3) {
				survived.push(x)
			}
		}
	}
	state.config_sets[state.config_index].set = survived
	if (state.config_sets[state.config_index].set.length) {
		state.config_sets[state.config_index].gen++
	}
}

function main_loop() {
	draw()
	if (!state.add_config_mode && elapsed_millis() >= state.generation_age && !state.pause_game) {
		next_generation()
		state.gen_age_instance = performance.now()
	}
	reset_title_system()
	requestAnimationFrame(main_loop)
}

ui()
main_loop()

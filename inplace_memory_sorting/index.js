const box = document.getElementById("box")
const tools = init_tools(box)

const BUF_LEN = 100 

tools.X_SCALE = BUF_LEN
tools.Y_SCALE = BUF_LEN

function resize() {
	const mwh = Math.min(window.innerWidth,window.innerHeight) - 10
	tools.INIT_WIDTH = tools.INIT_HEIGHT = mwh
	tools.resize()
}
resize()
addEventListener('resize',resize)

function sorted_buffer() {
	const arr = new Uint8Array(BUF_LEN)
	for (let i = 1 ; i <= BUF_LEN; i++) {
		arr[i] = i * 2
	}
	return arr
}

const algorithms = {
	bubble : () => "bubble",
	selection : () => "selection",
	insertion : () => "insertion",
	quick : () => "quick",
}

const state = {
	buffers : {
		heights : new Uint8Array(BUF_LEN),
		widths : new Uint8Array(BUF_LEN),
		xs : new Int16Array(BUF_LEN),
		red :  new Uint8Array(BUF_LEN),
		green : new Uint8Array(BUF_LEN),
		blue : new Uint8Array(BUF_LEN),
	},
	running : {
		algorithm : algorithms.bubble(),
		stoped : true,
	}, 
}

async function swap_height(i,j) {
	const target_i = get_height(j)
	const target_j = get_height(i)
	let ix = state.buffers.xs[i]
	let jx = state.buffers.xs[j]
	for (let k = -1; k<=11; k++) {
		await wait_millis(8)
		state.buffers.xs[i] = lerp(ix,jx,k/10)
		state.buffers.xs[j] = lerp(jx,ix,k/10)
	}
	state.buffers.heights[i] = target_i
	state.buffers.heights[j] = target_j
	state.buffers.xs[i] = ix
	state.buffers.xs[j] = jx
}

function clear_widths() {
	const width = (tools.X_SCALE / BUF_LEN)* 4
	state.buffers.widths.fill(width)
}

function set_width(index,width) {
	state.buffers.widths[index] = width
}

function get_width(index) {
	return state.buffers.widths[index]
}
function get_height(index) {
	return state.buffers.heights[index]
}
function set_height(index,height) {
	state.buffers.heights[index] = height
}

function clear_colors() {
	state.buffers.red.fill(255)
	state.buffers.green.fill(255)
	state.buffers.blue.fill(255)
}


function clear_xs() {
	for (let index = 0; index < BUF_LEN; index++) {
		const width = get_width(index)
		state.buffers.xs[index] = (index + 1)*2-100 - width/2
	}
}

function clear_all() {
	clear_xs()
	clear_colors()
	clear_widths()
}
clear_all()

function get_color(index) {
	const red = state.buffers.red[index]
	const green = state.buffers.green[index]
	const blue = state.buffers.blue[index]
	return `rgb(${red},${green},${blue})`
}

function set_color(index,r,g,b) {
	state.buffers.red[index] = r 
	state.buffers.green[index] = g
	state.buffers.blue[index] = b
}

function set_colors_from_to(begin,end,r,g,b) {
	for (let i = begin ; i < end; i++) {
		state.buffers.red[i] = r 
		state.buffers.green[i] = g
		state.buffers.blue[i] = b
	}
}


function unsort_heights_buffer(source_buffer = sorted_buffer(),index = 0) {
	let rand_i = rand_index(source_buffer.length)
	state.buffers.heights[index] = source_buffer[rand_i] 
	source_buffer[rand_i] = 0
	if (index < BUF_LEN) {
		unsort_heights_buffer(source_buffer.filter(x => x),index + 1)
	}
}

function rand_index(end = 100,start = 0) {
	let len = end - start
	return start + Math.floor(Math.random() * len)
}

const BAR_Y_BEGIN = -100
function draw_vbar(index) {
	const height = get_height(index)
	const width = get_width(index)
	const x = state.buffers.xs[index] 
	const start = v_new(x,BAR_Y_BEGIN)
	const end = v_new(x,BAR_Y_BEGIN + height)
	const color = get_color(index)
	tools.draw_line(
		start,
		end,
		width,
		color,
	)

}

function draw_bars() {
	for (let i = 0; i < BUF_LEN; i++) {
		draw_vbar(i)
	}
}

unsort_heights_buffer()
function main_loop() {
	tools.bg_clear()
	draw_bars()

	requestAnimationFrame(main_loop)
}
main_loop()

async function bubble_sort() {
	let swapped = false
	for (let i = 0; i < BUF_LEN ; i ++) {
		swapped = false
		for (let j = 0 ; j < BUF_LEN - 1 - i; j ++) {
			clear_colors()
			set_colors_from_to(BUF_LEN - i,BUF_LEN,0,0,255)
			set_color(j,255,0,0)
			set_color(j + 1,0,255,0)
			clear_widths()
			set_width(j,get_width(j) + 4)
			set_width(j + 1,get_width(j + 1) + 4)
			if (get_height(j) > get_height(j + 1)) {
				await swap_height(j,j + 1)
				swapped = true
			}

			await wait_millis(5)
			if (state.running.stoped) {
				break
			}
		}
		if (!swapped || state.running.stoped) {
			break
		}
	}

}

async function selection_sort() {
	for (let i = 0; i< BUF_LEN; i++) {
		let min_idx = i;
		for (let j = i + 1; j < BUF_LEN; j++) {
			clear_colors()
			set_colors_from_to(0,i,0,0,255)
			set_color(j,255,0,0)
			set_color(min_idx,0,255,0)
			set_color(i,255,255,0)
			if (get_height(j) < get_height(min_idx)) {
				min_idx = j
			}
			await wait_millis(5)
			if (state.running.stoped) {
				break
			}
		}
		if (min_idx !== i) {
			await swap_height(min_idx,i)
		}
		if (state.running.stoped) {
			break
		}
	}
}

async function insertion_sort() {
	for (let i = 1; i< BUF_LEN; i++) {
		let key = get_height(i)
		let j = i -1
		while (j >=0 && get_height(j) > key) {
			clear_colors()
			set_color(i+1,255,0,0)
			set_color(j,0,255,0)
			set_height(j+1,get_height(j))
			j--
			await wait_millis(5)
			if (state.running.stoped) {
				break
			}
		}
		set_height(j+1,key)
		const w = get_width(j+1)
		for (let i = 1; i < 10 ; i++) {
			await wait_millis(5)
			set_width(j+1,lerp(w,w * 5,i/10))
		}
		for (let i = 1; i < 10 ; i++) {
			await wait_millis(5)
			set_width(j+1,lerp(w * 5,w,i/10))
		}
		set_width(j+1,w)
		if (state.running.stoped) {
			break
		}
	}
}

async function quick_sort(low = 0,high = BUF_LEN -1) {
	if (low < high && !state.running.stoped) {
		const pivot_index = await partition(low,high)
		await wait_millis(10)
		await quick_sort(low,pivot_index -1);
		await quick_sort(pivot_index +1,high);
	}
	clear_colors()
}

async function partition(low,high) {
	const pivot = get_height(high)
	let i = low - 1

	for (let j = low; j < high; j++) {
		clear_colors()
		set_colors_from_to(i,high,150,150,150)
		set_color(i,0,255,255)
		set_color(j,0,255,0)
		set_color(high,0,0,255)
		if(get_height(j) < pivot) {
			i++;
			await swap_height(i,j)
		}
		if (state.running.stoped) {
			break
		}
		await wait_millis(10)
	}
	await swap_height(i + 1,high)
	const pivot_index = i + 1
	set_color(pivot_index,255,0,0)
	return pivot_index
}

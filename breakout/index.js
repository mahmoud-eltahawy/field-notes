"use strict"

const tools = init_tools(box)
tools.X_SCALE = 10
tools.Y_SCALE = 10

let bg = "#228888"

function new_ball(velocity,position,radius = 0.3) {
	return {
		velocity,
		initial_position : position,
		current_position : position,
		radius,
		instant : performance.now()
	}
}

function ball_position(ball) {
	const elapsed_millis = performance.now() - ball.instant
	const displacement = v_scale(ball.velocity,elapsed_millis/1000)
	const position = v.add(ball.initial_position,displacement)
	ball.current_position = position
	return position 
}

function ball_position_undo(ball) {
	const displacement = v_scale(ball.velocity,0.03) 
	const position = v.sub(ball.current_position,displacement)
	ball.current_position = position
	return position 
}

const DEFAULT_BALL_VELOCITY = () => v(6,-9)

const balls = [
	new_ball(DEFAULT_BALL_VELOCITY(),v(-4,2))
]

function ball_flip_y_axis(index) {
	ball_position_undo(balls[index])
	balls[index].initial_position = balls[index].current_position
	balls[index].velocity[Y] *= -1
	balls[index].instant = performance.now()
}

function ball_flip_x_axis(index) {
	ball_position_undo(balls[index])
	balls[index].initial_position = balls[index].current_position
	balls[index].velocity[X] *= -1
	balls[index].instant = performance.now()
}

function ball_draw() {
	for (const ball of balls) {
		const position = ball_position(ball)
		tools.draw_circle(position,ball.radius)
	}
}

const boxes = {
	width : 2,
	height : 0.6,
	row_width : 7,
	column_height : 4,
	first_row_y : 8,
	gap : 0.2,
}

let boxes_vertices = boxes_generate()

function box_new(x,y,gift = 0) {
	const position = v(x,y)
	return {
		position,
		gift,
		broken : false,
		live : true,
	}
}
function boxes_generate() {
	const result = []
	for (let k = 0; k < boxes.column_height; k++) {
		let i = boxes.row_width
		const height = boxes.first_row_y - k * (boxes.height + boxes.gap)
		result.push(box_new(0,height,1))
		i--
		for (let j = 1 ; j <= i /2; j++) {
			const x = j * (boxes.width + boxes.gap)
			if (k%2 ===0 && j %2 === 0) {
				result.push(box_new(x,height,2))
				result.push(box_new(-x,height,3))
			} else {
				result.push(box_new(x,height,4))
				result.push(box_new(-x,height,4))
			}
		}
	}
	return result
}

const gift_config = {
	size : 0.25,
	velocity : v(0,-0.1),
}

const gifts = []

function gift_draw() {
	const x_pad = 0.2
	const y_pad = 0.4
	for (const gift of gifts) {
		gift.position = v.add(gift.position,gift_config.velocity)
		tools.draw_rect(gift.position,"#FFFFFF",gift_config.size,gift_config.size)
		switch (gift.kind) {
			case 1:
				tools.draw_circle(
					v(gift.position[X],gift.position[Y] + 0.19),
					gift_config.size)
				break
			case 2:
				const pad = 0.1
				tools.draw_circle(
					v(gift.position[X]+pad,gift.position[Y] + 0.19),
					gift_config.size)
				tools.draw_circle(
					v(gift.position[X]-pad,gift.position[Y] + 0.19),
					gift_config.size)
				break
			case 3:
				tools.draw_circle(
					v(gift.position[X]+x_pad,gift.position[Y] + y_pad + x_pad),
					gift_config.size)
				tools.draw_circle(
					v(gift.position[X]+x_pad,gift.position[Y] + y_pad),
					gift_config.size)
				tools.draw_circle(
					v(gift.position[X]-x_pad,gift.position[Y] + y_pad),
					gift_config.size)
				break
			case 4:
				tools.draw_line(
					v(gift.position[X] - x_pad,gift.position[Y]),
					v(gift.position[X] + x_pad,gift.position[Y] + 1),
					0.09)
				break
		}
	}
}

function handle_gift(kind) {
	const position = () => v(bar.position[X],bar.position[Y] + 0.2)
	switch (kind) {
		case 1:
			balls.push(new_ball(DEFAULT_BALL_VELOCITY(),position()))
			break;
		case 2: 
			balls.push(new_ball(DEFAULT_BALL_VELOCITY(),position()))
			balls.push(new_ball(v.mul(DEFAULT_BALL_VELOCITY(),v(-1,1)),position()))
			break;
		case 3: 
			balls.push(new_ball(DEFAULT_BALL_VELOCITY(),position()))
			balls.push(new_ball(v.mul(DEFAULT_BALL_VELOCITY(),v(-1,1)),position()))
			balls.push(new_ball(v.mul(DEFAULT_BALL_VELOCITY(),v(-0.75,0.75)),position()))
			break;
		case 4: 
			const width_plus = 3
			bar.width += width_plus
			setTimeout(() => {
				bar.width -= width_plus
			},4000)
			break
		default:
			console.warn(`gift ${kind} is not recognized by the handler`)

	}
}

function gift_detect() {
	for (let i = 0 ; i< gifts.length; i++) {
		if (gifts[i].position[Y] < -tools.Y_SCALE) {
			gifts.splice(i,1)
		} else {
			const startx = bar.position[X] - bar.width/2
			const endx = bar.position[X] + bar.width/2
			const gift_x = gifts[i].position[X]
			if (gift_x > startx && gift_x < endx) {
				const dis = gifts[i].position[Y] - bar.position[Y]
				if (dis < gift_config.size / 2 + bar.height) {
					handle_gift(gifts[i].kind)
					gifts.splice(i,1)
				}
			}
		}
	}
}

function box_gift(index) {
	const {position,gift} = boxes_vertices[index]
	if (gift) {
		gifts.push({
			position : position,
			kind : gift,
		})
	}
}

let total_killed_boxes = 0
function kill_box(index) {
	if (boxes_vertices[index].broken) {
		boxes_vertices[index].live = false
		box_gift(index)
		total_killed_boxes++
	} else {
		boxes_vertices[index].broken = true
	}
}

function box_detect(index) {
	if (!boxes_vertices[index].live) {
		return
	}
	const box = boxes_vertices[index].position

	const startx = box[X] - boxes.width/2
	const endx = box[X] + boxes.width/2
	for (let i = 0 ; i < balls.length; i++) {
		const ball = balls[i]
		if (ball.current_position[X] > startx && ball.current_position[X] < endx) {
			const h_len = Math.abs(box[Y] - ball.current_position[Y])
			const min_len = balls[i].radius + boxes.height /2
			if(h_len < min_len) {
				ball_flip_y_axis(i)
				kill_box(index)
			}
		}

		const starty = box[Y] - boxes.height/2 
		const endy = box[Y] + boxes.height/2 
		if (ball.current_position[Y] > starty && ball.current_position[Y] < endy) {
			const w_len = box[X] - ball.current_position[X]
			const min_len = balls[i].radius + boxes.width/2 
			if(Math.abs(w_len) < min_len) {
				ball_flip_x_axis(i)
				kill_box(index)
			}
		}
	}
}

function boxes_detect() {
	for (let i = 0; i< boxes_vertices.length; i++) {
		box_detect(i)
	}
}

function boxes_draw() {
	for (const box of boxes_vertices) {
		if (box.live) {
			if (box.broken) {
				tools.draw_img(BROKEN_ROCK_IMG,box.position,boxes.width,boxes.height)
			} else {
				tools.draw_img(ROCK_IMG,box.position,boxes.width,boxes.height)
			}
		}
	}
}

function resize() {
	const mwh = Math.min(window.innerWidth,window.innerHeight) - 10
	tools.INIT_WIDTH = tools.INIT_HEIGHT = mwh
	tools.resize()
}
resize()

box.addEventListener('resize',resize)

const bar = {
	width : 4,
	height : 0.25,
	position : v(0,-8),
}

addEventListener("mousemove",(ev) => {
	const x = ((ev.clientX / tools.INIT_WIDTH) * 2 - 1) * tools.X_SCALE
	if (x < 0) {
		bar.position[X] = Math.max(x,-tools.X_SCALE + bar.width/2)
	} else {
		bar.position[X] = Math.min(x,tools.X_SCALE - bar.width/2)
	}
})


function bar_draw() {
	tools.draw_img(BAR_IMG,bar.position,bar.width,bar.height)
}

function detect_walls() {
	for (let i = 0; i< balls.length; i++) {
		const ball = balls[i]
		const xv = Math.abs(Math.abs(ball.current_position[X]) - tools.X_SCALE)
		const min_dis = balls[i].radius
		if (xv < min_dis) {
			ball_flip_x_axis(i)
		}

		const yv = Math.abs(Math.abs(ball.current_position[Y]) - tools.Y_SCALE)
		const close_to_y = yv < min_dis
		const out_of_y = Math.abs(ball.current_position[Y]) > tools.Y_SCALE
		const out_of_x = Math.abs(ball.current_position[X]) > tools.X_SCALE
		if ((close_to_y && ball.current_position[Y] < 0) || out_of_x || out_of_y) {
			balls.splice(i,1)
		} else if (close_to_y) {
			ball_flip_y_axis(i)
		}
	}
}

function bar_detect() {
	const startx = bar.position[X] - bar.width/2
	const endx = bar.position[X] + bar.width/2

	for (let i=0; i< balls.length; i++) {
		const ball = balls[i]
		if (ball.current_position[X] > startx && ball.current_position[X] < endx) {
			const h_len = Math.abs(bar.position[Y] - ball.current_position[Y])
			const min_len = balls[i].radius + bar.height / 2
			if(h_len < min_len) {
				ball_flip_y_axis(i)
			}
		}
	}
}

function messages() {
	tools.draw_text(v(5,9),`count : ${total_killed_boxes}`,16,"#FFFFFF")
	const empty_boxes = boxes_vertices.every(x => !x.live)
	const empty_balls = !balls.length
	if (empty_balls && !empty_boxes) {
		tools.draw_text(v(-5,0),"game over",28,"#FF0000")
	} else if (empty_boxes) {
		tools.draw_text(v(-5,0),"you win",28,"#00FF00")
	}
}


function draw() {
	tools.bg_clear(bg)
	bar_draw()
	boxes_draw()
	boxes_detect()
	ball_draw()
	detect_walls()
	bar_detect()
	gift_draw()
	gift_detect()
	messages()
	if (balls.length) {
		requestAnimationFrame(draw)
	}
}
draw()

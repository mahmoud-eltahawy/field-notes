const RESOLOUTION = 70;

const box = document.getElementById("box")
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
	const mwh = Math.min(window.innerWidth,window.innerHeight) - 10
	tools.INIT_WIDTH = tools.INIT_HEIGHT = mwh
	tools.resize()
}
resize()

addEventListener('resize',resize)

tools.bg_clear()

const shapes = []
let visiable_shapes = []

function draw_shapes() {
	for (const shape of shapes) {
		const vertices = shape.vertices.slice(0,shape.draw_progress) 
		tools.linestrip(vertices,2,shape.color)
		if (shape.draw_progress < shape.vertices.length) {
			const target = shape.forward ? shape.vertices.length : 0; 
			shape.draw_progress = lerp(shape.draw_progress,target,0.05)
		}
	}
}

function main_loop() {
	tools.bg_clear()
	draw_shapes()
	requestAnimationFrame(main_loop)
	for (let i = 0; i< shapes.length; i++) {
		const p = shapes.length - i
		const n = -p
		const a = i % 2 === 0? p : n
		rotate_shape_y(i,a)
		rotate_shape_x(i,a)
		rotate_shape_z(i,-a)
	}
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

function rotate_shape(fun,index,angle) {
	const vertices = shapes[index].vertices
	for (let i = 0; i < vertices.length; i++) {
		vertices[i] = fun(vertices[i],angle)
	}
}

function rotate_shape_y(index,angle) {
	rotate_shape(v_rotate_y,index,angle)
}
function rotate_shape_x(index,angle) {
	rotate_shape(v_rotate_x,index,angle)
}
function rotate_shape_z(index,angle) {
	rotate_shape(v_rotate_z,index,angle)
}

function cube(size) {
	const vertices = [
		// front face
		v_new(1,1,-1),
		v_new(-1,1,-1),
		v_new(-1,-1,-1),
		v_new(1,-1,-1),
		v_new(1,1,-1),


		// backface
		v_new(1,1,1),
		v_new(-1,1,1),
		v_new(-1,-1,1),
		v_new(1,-1,1),
		v_new(1,1,1),
		v_new(1,1,-1),
		//bridges
		v_new(-1,1,-1),
		v_new(-1,1,1),
		v_new(-1,-1,1),
		v_new(-1,-1,-1),
		v_new(1,-1,-1),
		v_new(1,-1,1),
		v_new(1,-1,1),
	].map(x => v_scale(x,size))
	return register_shape(vertices)
}
function sphere(radius) {
	const vertices = []
	const full_angle = Math.PI * 2
	const da = full_angle / 40
	for (let angle = 0; angle <= full_angle; angle += da) {
		const x = Math.cos(angle) * radius
		const y = Math.sin(angle) * radius 
		vertices.push(v_new(x,y,0))
	}
	[45,90,135].forEach(angle => {
		const other = [...vertices].map(x => v_rotate_y(x,angle))
		vertices.push(...other)
	});
	[45,90,135].forEach(angle => {
		const other = [...vertices].map(x => v_rotate_x(x,angle))
		vertices.push(...other)
	})

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

const intro_shapes_number = 5
function intro() {
	sphere(2)
	for (let i = 1; i< intro_shapes_number; i++) {
		cube(i + 2)
	}
}
intro()
function outro() {
	for (let i = 0; i< intro_shapes_number; i++) {
		undraw(i)
	}
}
setTimeout(outro,2000)


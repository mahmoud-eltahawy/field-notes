
function init_tools(box) {
	const ctx = box.getContext("2d")

	const TOOLS_CONFIG = {
		X_SCALE : 1,
		Y_SCALE : 1,
		INIT_WIDTH : 512,
		INIT_HEIGHT : 512,
	}

	TOOLS_CONFIG.resize = function () {
		box.width = TOOLS_CONFIG.INIT_WIDTH
		box.height = TOOLS_CONFIG.INIT_HEIGHT
	}

	TOOLS_CONFIG.v_denormal = function(vec) {
		return v_denormal(
			vec,
			TOOLS_CONFIG.INIT_WIDTH,
			TOOLS_CONFIG.INIT_HEIGHT,
			TOOLS_CONFIG.X_SCALE,
			TOOLS_CONFIG.Y_SCALE
		)
	}

	TOOLS_CONFIG.draw_rect = function (
		start,
		color,
		width,
		height,
	) {
		const s = TOOLS_CONFIG.v_denormal(start)
		ctx.fillStyle = color 
		const x = s[X] - width/2
		const y = s[Y] - height/2
		ctx.fillRect(x,y,width,height)
	}

	TOOLS_CONFIG.draw_line = function (begin,end,width = 4, color = '#FFFFFF') {
		const b = TOOLS_CONFIG.v_denormal(begin)
		const e = TOOLS_CONFIG.v_denormal(end)
		ctx.strokeStyle = color
		ctx.fillStyle = color
		ctx.lineWidth = width
		ctx.beginPath()
		ctx.moveTo(b[X], b[Y])
		ctx.lineTo(e[X], e[Y])
		ctx.stroke()
	}

	TOOLS_CONFIG.bg_clear = function (
		color = "#000000",
	) {
		const width = TOOLS_CONFIG.INIT_WIDTH
		const height = TOOLS_CONFIG.INIT_HEIGHT
		TOOLS_CONFIG.draw_rect(v_new(0,0),color,width,height)
	}

	return TOOLS_CONFIG
}

function wait_millis(n) {
	return new Promise((resolve,_) => {
		setTimeout(() => {
			resolve(null)
		},n)
	})
}

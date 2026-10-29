"use strict"

const TOOLS_CONFIG = {
	X_SCALE : 1,
	Y_SCALE : 1,
	INIT_WIDTH : 512,
	INIT_HEIGHT : 512,
}

function init_tools(box) {
	const ctx = box.getContext("2d")
	TOOLS_CONFIG.ctx = ctx
	return TOOLS_CONFIG
}


TOOLS_CONFIG.resize = function () {
	box.width = this.INIT_WIDTH
	box.height = this.INIT_HEIGHT
}

TOOLS_CONFIG.v_denormal = function(vec) {
	return v_denormal(
		vec,
		this.INIT_WIDTH,
		this.INIT_HEIGHT,
		this.X_SCALE,
		this.Y_SCALE
	)
}

TOOLS_CONFIG.draw_img = function(image,position,width,height) {
	const start = this.v_denormal(position)
	const widthn = denormal_abs(width,this.INIT_WIDTH,this.X_SCALE)/2
	const heightn = denormal_abs(height,this.INIT_WIDTH,this.X_SCALE)/2
	const x = start[X] - widthn /2
	const y = start[Y] - heightn / 2
	tools.ctx.drawImage(image,x,y,widthn,heightn)
}


TOOLS_CONFIG.draw_rect = function (
	start,
	color,
	width,
	height,
) {
	const s = this.v_denormal(start)
	this.ctx.fillStyle = color 
	const widthn = denormal_abs(width,this.INIT_WIDTH,this.X_SCALE)
	const heightn = denormal_abs(height,this.INIT_HEIGHT,this.Y_SCALE)
	const x = s[X] - widthn/2
	const y = s[Y] - heightn/2
	this.ctx.fillRect(x,y,widthn,heightn)
}

TOOLS_CONFIG.draw_line = function (begin,end,width = 4, color = '#FFFFFF') {
	const b = this.v_denormal(begin)
	const e = this.v_denormal(end)
	this.ctx.strokeStyle = color
	this.ctx.fillStyle = color
	this.ctx.lineWidth = denormal_abs(width,this.INIT_WIDTH,this.X_SCALE)
	this.ctx.beginPath()
	this.ctx.moveTo(b[X], b[Y])
	this.ctx.lineTo(e[X], e[Y])
	this.ctx.stroke()
}
TOOLS_CONFIG.draw_circle = function (center,radius, color = '#FFFFFF') {
	const c = this.v_denormal(center)
	const r = (radius/2) / this.X_SCALE  * this.INIT_WIDTH
	this.ctx.fillStyle = color
	this.ctx.beginPath()
	this.ctx.arc(c[X],c[Y],r,0,2*Math.PI)
	this.ctx.fill()
}
TOOLS_CONFIG.draw_text = function (place,text,font_size = 18,color = "#00FF00") {
	const p = this.v_denormal(place)
	const font = `${font_size}px sans-serif`
	this.ctx.font = font
	this.ctx.fillStyle = color
	this.ctx.textBaseline = "middle"
	this.ctx.fillText(text,p[X],p[Y])
}

TOOLS_CONFIG.bg_clear = function (
	color = "#000000",
) {
	this.draw_rect(V2_ZERO,color,this.X_SCALE * 2,this.Y_SCALE * 2)
}

TOOLS_CONFIG.linestrip = function (points,width = 2,color = "#FFFFFF") {
	for (let i=0; i< points.length -1; i++) {
		let first = points[i]
		let second = points[i+1]
		tools.draw_line(first,second,width,color)
	}
}


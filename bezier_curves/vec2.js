
function descale(x) {
	return (x / (config.scale * 2)) * box_size()
}

class Vec2 {
	constructor({x,y}) {
		this.x = x
		this.y = y
	}

	sub(other) {
		return new Vec2({x : this.x - other.x,y : this.y - other.y})
	}

	transition({x,y}) {
		return new Vec2({
			x : this.x + x,
			y : this.y + y
		})
	}

	scale(scaler) {
		return new Vec2({
			x : this.x * scaler,
			y : this.y * scaler,
		})
	}

	distance(other) {
		return Math.sqrt((this.x - other.x)**2 + (this.y - other.y)**2)
	}

	determint(other) {
		return Math.sqrt(this.x**2 + this.y**2)
	}

	rotate_z(angle) {
		const cos = Math.cos(angle)
		const sin = Math.sin(angle)
		const x = this.x
		const y = this.y
		return new Vec2({
			x : x * cos - y * sin,
			y : x * sin + y * cos,
		})
	}
	rotate_xy(cos,sin) {
		const x = this.x
		const y = this.y
		return new Vec2({
			x : x * cos - y * sin,
			y : x * sin + y * cos,
		})
	}

	normalized() {
		const half_size = box_size() / 2
		return new Vec2({
			x : half_size * (1 + this.x / config.scale),
			y : half_size * (1 - this.y / config.scale),
		})
	}

	draw_line_to(other,width = 2, color = '#FFFFFF') {
		const t = this.normalized()
		const o = other.normalized()
		ctx.strokeStyle = color
		ctx.fillStyle = color
		ctx.lineWidth = width
		ctx.beginPath()
		ctx.moveTo(t.x, t.y)
		ctx.lineTo(o.x, o.y)
		ctx.stroke()
	}

	draw_rect(s = 0.1,color = "#00FF00") {
		const size = descale(s)
		const {x,y} = this.normalized()
		ctx.fillStyle = color 
		ctx.fillRect(x - size/2,y - size/2,size,size)
	}

	draw_right_arrow(s = 0.1,direction,color = "#00FF00") {
		const size = descale(s)
		const pos = this.normalized()

		let p1 = new Vec2({x : -size * 2,y : 0})
		let p2 = new Vec2({x : 0,y : size / 2})
		let p3 = new Vec2({x : 0,y : -size / 2})

		p1 = p1.rotate_xy(direction.x,direction.y)
		p2 = p2.rotate_xy(direction.x,direction.y)
		p3 = p3.rotate_xy(direction.x,direction.y)

		p1 = p1.transition(pos)	
		p2 = p2.transition(pos)	
		p3 = p3.transition(pos)	
		const region = new Path2D()
		region.moveTo(p1.x,p1.y)
		region.lineTo(p2.x,p2.y)
		region.lineTo(p3.x,p3.y)
		region.closePath()
		ctx.fillStyle = color
		ctx.fill(region,"evenodd")
	}

	draw_circle(radius = 0.1, color = '#FFFFFF') {
		const c = this.normalized()
		const r = descale(radius)
		ctx.fillStyle = color
		ctx.beginPath()
		ctx.arc(c.x,c.y,r,0,2*Math.PI)
		ctx.fill()
	}

	lerp({x,y},t) {
		return new Vec2({
			x : lerp(this.x,x,t),
			y : lerp(this.y,y,t),
		})
	}
}



function lerp(a,b,t) {
	return a + (b - a) * t
}

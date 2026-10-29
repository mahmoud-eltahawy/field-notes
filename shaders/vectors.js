const AXES = [0,1,2]
const [X,Y,Z] = AXES
const [U,V,W] = AXES
const V2_ZERO = v2_splat(0)
const V3_ZERO = v3_splat(0)

function v_new(...components) {
	return new Float32Array(components)
}

function v_splat(size,n) {
	return new Float32Array(size).fill(n)
}

function v2_splat(n) {
	return v_splat(2,n)
}

function v3_splat(n) {
	return v_splat(3,n)
}

function v_zipmap(v1,v2,operation) {
	const result = v_splat(v1.length,0)
	for (let i = 0; i < v1.length; i++) {
		result[i] = operation(v1[i],v2[i])
	}
	return result
}
function v_add(v1,v2) {
	return v_zipmap(v1,v2,(x,y) => x + y) 
}
function v_sub(v1,v2) {
	return v_zipmap(v1,v2,(x,y) => x - y) 
}
function v_mul(v1,v2) {
	return v_zipmap(v1,v2,(x,y) => x * y) 
}
function v_div(v1,v2) {
	return v_zipmap(v1,v2,(x,y) => x / y) 
}
function v_lerp(a,b,t) {
	return v_zipmap(a,b,(s,e) => lerp(s,e,t)) 
}
function lerp(a,b,t) {
	return a + (b - a) * t
}
function v_scale(vector,scaler) {
	return vector.map(x => x * scaler)
}
function v_len(vec) {
	return Math.sqrt(v_mul(vec,vec).reduce((acc,x) => acc + x)) 
}

function v_rotate(vector,angle,axe) {
	const [C1,C2] = AXES.filter(v => v!== axe)
	const a = angle * Math.PI / 180
	const cos = Math.cos(a)
	const sin = Math.sin(a)
	const c1 = vector[C1]
	const c2 = vector[C2]
	let result = [...vector]
	result[C1] = c1 * cos - c2 * sin
	result[C2] = c1 * sin + c2 * cos
	return result
}

function v_rotate_x(vector,angle) {
	return v_rotate(vector,angle,X)
}

function v_rotate_y(vector,angle) {
	return v_rotate(vector,angle,Y)
}

function v_rotate_z(vector,angle) {
	return v_rotate(vector,angle,Z)
}

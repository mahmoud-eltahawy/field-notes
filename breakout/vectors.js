"use strict"

const AXES = [0,1,2]
const [X,Y,Z] = AXES
const [U,V,W] = AXES

function v(...components) {
	return new Float32Array(components)
}

function v3_to_v2(v3) {
	const x = v3[X]/v3[Z]
	const y = v3[Y]/v3[Z]
	return v(x,y)
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

const V2_ZERO = v2_splat(0)
const V3_ZERO = v3_splat(0)

function v_zipmap(v1,v2,operation) {
	const result = v_splat(v1.length,0)
	for (let i = 0; i < v1.length; i++) {
		result[i] = operation(v1[i],v2[i])
	}
	return result
}
v.add = function(v1,v2) {
	return v_zipmap(v1,v2,(x,y) => x + y) 
}
v.sub = function(v1,v2) {
	return v_zipmap(v1,v2,(x,y) => x - y) 
}
v.mul = function(v1,v2) {
	return v_zipmap(v1,v2,(x,y) => x * y) 
}
v.div = function(v1,v2) {
	return v_zipmap(v1,v2,(x,y) => x / y) 
}
v.lerp = function(a,b,t) {
	return v_zipmap(a,b,(s,e) => lerp(s,e,t)) 
}
function v_scale(vector,scaler) {
	return vector.map(x => x * scaler)
}
function v_len(vec) {
	return Math.sqrt(v.mul(vec,vec).reduce((acc,x) => acc + x)) 
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

function v_denormal(vec,target_width,target_height = target_width,scale_x,scale_y) {
	const x = denormal_x(vec[X],target_width,scale_x)
	const y = denormal_y(vec[Y],target_height,scale_y)
	return v(x,y)
}

/// UTILS

///convert range [-scale_x,scale_x] to [0,WIDTH]
function denormal_x(x,target_width,scale_x) {
	return (target_width / 2) * (1 + x / scale_x)
}

///convert range [-scale_y,scale_y] to [0,HEIGHT]
function denormal_y(y,target_height,scale_y) {
	return (target_height / 2) * (1 - y / scale_y)
}

///convert range [0,2 * scale_x] to [0,target_width]
function denormal_abs(x,target_width,scale_x) {
	return x / scale_x * target_width
}

function lerp(a,b,t) {
	return a + (b - a) * t
}

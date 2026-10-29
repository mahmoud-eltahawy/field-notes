
CODE.addEventListener("input",(ev) => {
	const value = ev.target.value.trim()
	if (value) {
		GO.disabled = false
	} else {
		GO.disabled = true
	}
})

function button(text,on_click) {
	const button = document.createElement("button")
	button.innerText = text
	button.addEventListener("click",on_click)
	return button	
}

function draw_function_button(id) {
	const result = button("<-",(ev) => {
		if (shapes[id].forward) {
			undraw(id)
			ev.target.innerText = "->"
		} else {
			redraw(id)
			ev.target.innerText = "<-"
		}
	});
	result.style.border = "4px solid"
	result.style.borderColor = shapes[id].color
	result.style.color = shapes[id].color
	result.style.fontSize = "18px"
	return result
}
function change_color_button(id,draw_button) {
	return button("change color",(ev) => {
		shapes[id].color = random_color()
		ev.target.style.border = "4px solid"
		ev.target.style.borderColor = shapes[id].color
		ev.target.style.color = shapes[id].color
		ev.target.style.fontSize = "18px"
		draw_button.style.color = shapes[id].color
		draw_button.style.borderColor = shapes[id].color
	});
}

function function_buttons(id) {
	const li = document.createElement("li")
	const button = draw_function_button(id)
	li.appendChild(button)
	li.appendChild(change_color_button(id,button))
	SHAPES.appendChild(li)
}

GO.addEventListener("click",() => {
	try {
		const f = new Function("x" ,CODE.value)
		const id = fx(f)
		MESSAGE.innerText = ""
		function_buttons(id)
		CODE.value = ""
	} catch(e) {
		MESSAGE.innerText = e
	}
})

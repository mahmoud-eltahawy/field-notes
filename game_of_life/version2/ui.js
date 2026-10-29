

function add_option(target,text,click) {
	const option = document.createElement("option")
	option.innerText = text
	if (click) {
		option.addEventListener("click",click)
	}
	target.appendChild(option)
	return option
}

function ui() {
	//start
	const container = document.createElement("div")
	//select config
	const select_config = document.createElement("select")
	const header = add_option(select_config,"select configuration")
	for (let i = 0; i < state.config_sets.length; i++) {
		add_option(select_config,`config ${(i+1)}`,ev => {
			state.config_index = i
			header.setAttribute("disabled","disabled")
		})
	}
	container.appendChild(select_config)
	// select cursor config
	const select_cursor_config = document.createElement("select")
	const cursor_header = add_option(select_cursor_config,"select cursor configuration")
	for (let i = 0; i < state.cursor_config_sets.length; i++) {
		add_option(select_cursor_config,state.cursor_config_sets[i].name,ev => {
			state.cursor_config_index = i 
			header.setAttribute("disabled","disabled")
		})
	}
	// finish
	MAIN.appendChild(container)
}

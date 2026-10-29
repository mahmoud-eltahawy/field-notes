

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
	// add config
	const button = document.createElement("button")
	button.innerText = "add config"
	button.addEventListener("click",() => {
		state.add_config_mode = !state.add_config_mode
		if (state.add_config_mode) {
			button.innerText = "commit config"
			new_config()
			state.config_index = state.config_sets.length -1
			container.appendChild(select_cursor_config)
		} else {
			button.innerText = "add config"
			add_option(select_config,`config ${state.config_sets.length}`,ev => {
				state.config_index = state.config_sets.length -1
			})
			select_cursor_config.remove()
		}
	})
	container.appendChild(button)
	// finish
	MAIN.appendChild(container)
}


UNSORT.addEventListener("click",() => {
	state.running.stoped = true;
	KICK.innerText = "Kick"
	unsort_heights_buffer()
	clear_all()
})
KICK.addEventListener("click",() => {
	if (state.running.stoped) {
		state.running.stoped = false;
		KICK.innerText = "Stop"
		switch (state.running.algorithm) {
			case algorithms.bubble():
				bubble_sort()
				break;
			case algorithms.selection():
				selection_sort()
				break;
			case algorithms.insertion():
				insertion_sort()
				break;
			case algorithms.quick():
				quick_sort()
				break;
			default:
				throw `algorithm ${state.running.algorithm} is NOT IMPLMENTED`
				break;
		}
	} else {
		state.running.stoped = true;
		KICK.innerText = "Kick"
	}

})

SELECT_ALGORITHM.addEventListener("change",(ev) => {
	const value =ev.target.value 
	if ([algorithms.bubble(),algorithms.selection(),algorithms.insertion(),algorithms.quick()].includes(value)) {
		state.running.algorithm = value
	} else {
		throw `algorithm ${value} does not exist`
	}
})

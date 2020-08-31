function showResults(e) {
	e.innerHTML = (e.innerHTML == 'Show results') ? 'Hide results' : 'Show results';
	if (e.innerHTML == 'Show results') {
		document.getElementById("pastEvent").classList.add("hideResults");
	} else {
		document.getElementById("pastEvent").classList.remove("hideResults");
	}
}
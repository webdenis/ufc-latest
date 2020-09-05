const COOKIE_VAR = 'pastEventHidden_';

function loaded() {
	let id = document.getElementsByClassName("pastEventDiv")[0].id;
	if (Cookies.get(COOKIE_VAR + id)) {
		document.getElementsByClassName("hidePast")[0].click();
	}
}

function showResults(e) {
	e.innerHTML = (e.innerHTML == '[Show results]') ? '[Hide results]' : '[Show results]';
	if (e.innerHTML == '[Show results]') {
		document.getElementById("pastEvent").classList.add("hideResults");
		let overridden = document.getElementsByClassName("whiteOverride");
		for (let i = 0; i < overridden.length; i++) {
			overridden[i].classList.remove('whiteOverride');
		}
	} else {
		document.getElementById("pastEvent").classList.remove("hideResults");
		let overridden = document.getElementsByClassName("blackOverride");
		for (let i = 0; i < overridden.length; i++) {
			overridden[i].classList.remove('blackOverride');
		}
	}
}

async function getRecord(url, e) {
	let response = await fetch('/getRecord/' + url);
	let data = await response.json()
	
	e.innerHTML = data.fighterRecord;
	e.removeAttribute("onclick");
	e.classList.remove("getRecord");
	e.setAttribute("title", data.recordDetails);
	return false;
}

function loadRecords(e, cont) {
	let container = document.getElementById(cont);
	let records = container.getElementsByClassName('getRecord');
	for (var i = 0; i < records.length; i++) {
	   records[i].click();
	}
	e.remove();
}

function hidePast(e, cont) {
	
	e.innerHTML = (e.innerHTML == '[Hide]') ? '[Show]' : '[Hide]';
	
	let container = document.getElementById(cont);
	if (container.classList.contains('hidden')) {
		container.classList.remove('hidden');
		Cookies.remove(COOKIE_VAR + cont);
	} else {
		container.classList.add('hidden');
		Cookies.set(COOKIE_VAR + cont, '1', { expires: 8, sameSite: 'None', Secure: true });
	}
}
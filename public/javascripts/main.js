const PAST_COOKIE_VAR = 'pastEventHidden_';

function loaded() {
	let id = document.getElementsByClassName("pastEventDiv")[0].id;
	if (Cookies.get(PAST_COOKIE_VAR + id)) {
		document.getElementsByClassName("hidePast")[0].click();
	}
	
	if (Cookies.get('autoloadNextEventRecordsAll')) {
		document.getElementById('autoloadNextEventRecordsAll').checked = true;
		
		let divs = document.getElementsByClassName('newEventDiv');
		for (let i = 0; i < divs.length; i++) {
			divs[i].querySelector('.showAll').click();
		}
		
		document.getElementById('autoloadNextEventRecords').disabled = true;
		document.getElementById('autoloadNextEventRecords').previousSibling.classList.add('linet');
	}
	
	if (Cookies.get('autoloadNextEventRecords') && !Cookies.get('autoloadNextEventRecordsAll')) {
		document.getElementById('autoloadNextEventRecords').checked = true;
		
		document.getElementsByClassName('newEventDiv')[0].querySelector('.showAll').click();
	}

	document.getElementById('nextEventsNumber').value = Cookies.get('nextEventsNumber') ? parseInt(Cookies.get('nextEventsNumber')) : 4;

}

function showResults(e) {
	e.innerHTML = (e.innerHTML == '[Show results]') ? '[Hide results]' : '[Show results]';
	document.getElementById("pastEvent").classList.toggle("hideResults");
}

async function getRecord(url, e) {
	let response = await fetch('/getRecord/' + url);
	let data = await response.json()
	
	e.innerHTML = data.fighterRecord;
	e.removeAttribute("onclick");
	e.classList.remove("getRecord");
	e.setAttribute("title", data.recordDetails);
	
	//ranking
	let a = e.parentNode.parentNode.querySelector('a');
	if (data.ranking) {
		if (!a.innerHTML.includes('(c)') && !a.innerHTML.includes('(ic)')) {
			a.innerHTML = '<sup>#'+data.ranking+'</sup> ' + a.innerHTML;
		} else if (a.innerHTML.includes('(ic)')) {
			a.innerHTML = '<sup>#IC</sup> ' + a.innerHTML.replace(' (ic)','');
		} else {
			a.innerHTML = '<sup>#C</sup> ' + a.innerHTML.replace(' (c)','');
		}
	}
	
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
		Cookies.remove(PAST_COOKIE_VAR + cont);
	} else {
		container.classList.add('hidden');
		Cookies.set(PAST_COOKIE_VAR + cont, '1', { expires: 8, sameSite: 'None', Secure: true });
	}
}


function toggleSettings() {
	let sDiv = document.getElementsByClassName('settings')[0];
	sDiv.classList.toggle('hide');
}

function toggleSetting(setting) {
	Cookies.get(setting) ? Cookies.remove(setting) : Cookies.set(setting, '1', { expires: 365, sameSite: 'None', Secure: true });
	
	if (Cookies.get('autoloadNextEventRecordsAll')) {
		document.getElementById('autoloadNextEventRecords').disabled = true;
		document.getElementById('autoloadNextEventRecords').previousSibling.classList.add('linet');
	} else {
		document.getElementById('autoloadNextEventRecords').disabled = false;
		document.getElementById('autoloadNextEventRecords').previousSibling.classList.remove('linet');
	}
}

function changeSetting(setting, val) {
	switch(setting) {
		case 'nextEventsNumber':
			val = parseInt(val);
			if (val >= 1 && val <= 10) {
				Cookies.set(setting, val, { expires: 365, sameSite: 'None', Secure: true });
			} else {
				alert('This value should be between 0 and 10.');
				document.getElementById('nextEventsNumber').value = (Cookies.get(setting) ? Cookies.get(setting) : 4);
			}
			break;
		default:
			return;
	}
}

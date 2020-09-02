var HttpClient = function() {
    this.get = function(aUrl, aCallback) {
        var anHttpRequest = new XMLHttpRequest();
        anHttpRequest.onreadystatechange = function() { 
            if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
                aCallback(anHttpRequest.responseText);
        }

        anHttpRequest.open( "GET", aUrl, true );            
        anHttpRequest.send( null );
    }
}

function showResults(e) {
	e.innerHTML = (e.innerHTML == '[Show results]') ? '[Hide results]' : '[Show results]';
	if (e.innerHTML == '[Show results]') {
		document.getElementById("pastEvent").classList.add("hideResults");
	} else {
		document.getElementById("pastEvent").classList.remove("hideResults");
	}
}

async function getRecord(url, e) {
	let response = await fetch('/getRecord/' + url);
	let data = await response.text()
	
	console.log(e);
	e.innerHTML = data;
	e.removeAttribute("onclick");
	e.classList.remove('getRecord');
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
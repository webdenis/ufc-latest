var express = require('express');
var router = express.Router({ mergeParams : true });

const pkg = require('node-html-parser');
const { parse } = pkg;

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const WIKI_URL = 'https://en.wikipedia.org/wiki/';

/* GET fighters record & rank */
router.get('/', function(req, res, next) {
  
  console.log('Fetching record for: ' + req.params.id);
  
  JSDOM.fromURL(WIKI_URL + req.params.id).then(dom => {
	
	var root = parse(dom.serialize());
	
	let re = /#.*(in the)/g;
	
	let paragraphs = root.querySelectorAll('p');

	let together = paragraphs[0].text + paragraphs[1].text + paragraphs[2].text + paragraphs[3].text + paragraphs[4].text;
	
	let rank = null;
	let rankSearch = re.exec(together);
	
	if (together && rankSearch) {
		rank = together.split('is #')[1];
		if (rank) {
			rank = rank.split(' in')[0];
		}
	}
		
	var infobox = root.querySelector('.collapsible');
	
	var breakdown = infobox.querySelectorAll('td');
	
	let record = '[' + breakdown[2].text.split(' ')[0] + ' - ' + breakdown[3].text.split(' ')[0] + ']';
	
	let detailsArray = [];
	let comaOrDash = true;
	
	for (let i = 4; i < 20; i++) {
		if (breakdown[i]) {
			detailsArray.push(breakdown[i].text);
			if (breakdown[i].text.length > 3) {
				detailsArray.push(': ');
			} else {
				detailsArray.push(comaOrDash ? ' - ' : ', ');
				comaOrDash = !comaOrDash;
			}
		}
	}
	
	details = detailsArray.join('');
	
	details = details.replace(/\n/g, '').slice(0, -2);
	
	res.json({fighterRecord: record, recordDetails: details, ranking: rank});
	
	console.log('Record fetched: ' + record + ' ' + details + ', rank: #'+rank);
	
  });
  
});

module.exports = router;

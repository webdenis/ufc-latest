var express = require('express');
var router = express.Router({ mergeParams : true });

const pkg = require('node-html-parser');
const { parse } = pkg;

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const WIKI_URL = 'https://en.wikipedia.org/wiki/';

/* GET fighters record */
router.get('/', function(req, res, next) {
  
  console.log('Fetching record for: ' + req.params.id);
  
  JSDOM.fromURL(WIKI_URL + req.params.id).then(dom => {
	
	var root = parse(dom.serialize());
	
	var infobox = root.querySelector('.collapsible');
	
	var breakdown = infobox.querySelectorAll('td');
	
	let record = '[' + breakdown[2].text.split(' ')[0] + ' - ' + breakdown[3].text.split(' ')[0] + ']';
	
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
	
	res.json({fighterRecord: record, recordDetails: details});
	
	console.log('Record fetched: ' + record + ' ' + details);
	
  });
  
});

module.exports = router;

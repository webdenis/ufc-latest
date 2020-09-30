var express = require('express');
var router = express.Router({ mergeParams : true });

const pkg = require('node-html-parser');
const { parse } = pkg;

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const weightDivisions = [
							"Heavyweight",
							"Light heavyweight",
							"Middleweight",
							"Welterweight",
							"Lightweight",
							"Featherweight",
							"Bantamweight",
							"Flyweight",
							//"Women's featherweight", // Just Nunes lel
							"Women's bantamweight",
							"Women's flyweight",
							"Women's strawweight"
						];

const WIKI_URL = 'https://en.wikipedia.org/wiki/Ultimate_Fighting_Championship_rankings';

/* GET fighters record & rank */
router.get('/', function(req, res, next) {
  
  console.log('Fetching rankings.');
  
  JSDOM.fromURL(WIKI_URL).then(dom => {
	
	var root = parse(dom.serialize());
	
	var tables = root.querySelectorAll('.wikitable');
	
	var test = '<style>body { padding: 20px 45px; background-color: black; color: white; font-family: Calibri; } a { text-decoration: none; color: white; } caption { font-weight: bold; text-align: left; } .rankTable { display: inline-block; margin: 30px; } </style>';
	
	for (let i = 3; i < tables.length; i++) {
		test += '<div class="rankTable"><h2>' + weightDivisions[i-3] + '</h2>';
		test += tables[i].outerHTML + '</div>';
	}
	
	test = test.split('/wiki/').join('https://en.wikipedia.org/wiki/');
	
	let rankingsInfo = [];
	
	res.send(test);

  });
  
});

module.exports = router;

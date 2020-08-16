import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const http = require('http');

const hostname = 'localhost';
const PORT = process.env.PORT || 3000;


import pkg from 'node-html-parser';
const { parse } = pkg;

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

// Settings
const nextFightsNum = 5; // Number of next fights to generate

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  
  JSDOM.fromURL("https://en.wikipedia.org/wiki/List_of_UFC_events").then(dom => {
	
	var root = parse(dom.serialize());
	
	var tables = root.querySelectorAll('.wikitable');
	
	// Get latest past fight
	var latestFight = tables[1].querySelectorAll('tbody')[0].querySelectorAll('tr')[1].toString();
	
	// Get next fights
	let children = tables[0].querySelectorAll('tbody')[0].childNodes;
	
	var nextFights = '';

	for (let i = children.length; i >= children.length - nextFightsNum * 2; i--) {
		if (children[i] && children[i].toString().length > 10) {
			nextFights += children[i].toString();
		}
	}
	
	var output = '<h4>Latest event:</h4><table>' + latestFight + '</table><h4>Upcoming events:</h4><table>' + nextFights + '</table>';
	
	res.end(output);
  });

  //res.end('Hello World');

});

server.listen(PORT, hostname, () => {
  console.log(`Server running at http://${hostname}:${PORT}/`);
});
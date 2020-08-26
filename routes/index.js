var express = require('express');
var router = express.Router();

//import pkg from 'node-html-parser';
const pkg = require('node-html-parser');
const { parse } = pkg;

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const async = require("async");

const nextFightsNum = 4; // Number of next fights to generate
const WIKI_BASE_URL = 'https://en.wikipedia.org';

/* GET home page. */
router.get('/', function(req, res, next) {
	
  console.log('Starting..');

  JSDOM.fromURL(WIKI_BASE_URL + "/wiki/List_of_UFC_events").then(dom => {
	
	var root = parse(dom.serialize());
	
	var tables = root.querySelectorAll('.wikitable');
	
	let latestDetails = {}
	let nextDetails = {}
	
	// Get latest past fight
	var latestFight = tables[1].querySelectorAll('tbody')[0].querySelectorAll('tr')[1];
	
	latestDetails.link = WIKI_BASE_URL + latestFight.querySelectorAll('a')[0].getAttribute('href');
	latestDetails.name = latestFight.querySelectorAll('a')[0].text;
	latestDetails.date = latestFight.querySelectorAll('span')[0].text;
	latestDetails.fights = [];
	
	console.log('Loaded latest fight.');
	
	// -> Get latest past fight details

	JSDOM.fromURL(latestDetails.link).then(domA => {
		var rootA = parse(domA.serialize());
		
		var tableA = rootA.querySelector('.toccolours');
		
		let trChildren = tableA.querySelectorAll('tr');
		
		for (let i = 0; i < trChildren.length; i++) {

			let th = trChildren[i].querySelector('th');
			if (th && th.getAttribute('colspan') == 8) {
				latestDetails.fights.push(th.text);
			} else {
				let td = trChildren[i].querySelectorAll('td');
				if (td && td.length == 8) {
					let rand = (Math.random() >= 0.5);
					// columns: weight, name, result, name, method of win, round, round time
					//            0      1      2      3          4          5        6
					let newFight = {weight: td[0].text, first: rand ? td[1].text : td[3].text, second: rand ? td[3].text : td[1].text, method: td[4].text, round: td[5].text, roundtime: td[6].text, winner: 'win. '+td[1].text};
					latestDetails.fights.push(newFight);
				}
			}
		}
		
		console.log('Loaded latest fight info.');
		
		// Get next fights list
		let children = tables[0].querySelectorAll('tbody')[0].childNodes;
		
		var nextFightsList = [];

		for (let i = children.length; i >= children.length - nextFightsNum * 2; i--) {
			if (children[i] && children[i].toString().length > 10) {
				//nextFights += children[i].toString();
				nextFightsList.push({
					link: WIKI_BASE_URL + children[i].querySelectorAll('a')[0].getAttribute('href'),
					name: children[i].querySelectorAll('a')[0].text,
					date: children[i].querySelectorAll('span')[0].text,
					fights: [],
					announced: []
				});
			}
		}
		
		console.log('Loaded next fights.');
		
		var theEnd = 0;

		async.each(nextFightsList, function(event, callback) {

			JSDOM.fromURL(event.link).then(domB => {
				var rootB = parse(domB.serialize());
				
				var tableB = rootB.querySelector('.toccolours');
				
				let trChildren = tableB.querySelectorAll('tr');
				
				for (let i = 0; i < trChildren.length; i++) {
					let th = trChildren[i].querySelector('th');
					if (th && th.getAttribute('colspan') == 8) {
						event.fights.push(th.text);
					} else {
						let td = trChildren[i].querySelectorAll('td');
						
						if (td && td.length == 8) {
							let rand = (Math.random() >= 0.5);
							// columns: weight, name, result, name, method of win, round, round time
							//            0      1      2      3          4          5        6
							let newFight = {weight: td[0].text, first: rand ? td[1].text : td[3].text, second: rand ? td[3].text : td[1].text};
							event.fights.push(newFight);
						}
					}
				}
				
				let bouts = rootB.querySelectorAll('ul')[1];
				let eachBout = bouts.querySelectorAll('li');
				for (let m = 0; m < eachBout.length; m++) {
					event.announced.push(eachBout[m].text.replace(' bout','').split('[')[0]);
				}
				
				//}
				
				theEnd++;
				if (theEnd >= nextFightsNum) {
					console.log(nextFightsList);
					res.render('index', { title: 'UFC Latest', latestFightContent: latestDetails, nextFightContent: nextFightsList });	
				}
				
			});
			
		});

	});

  });
	
});

module.exports = router;

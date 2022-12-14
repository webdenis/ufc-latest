var express = require('express');
var router = express.Router();

const pkg = require('node-html-parser');
const { parse } = pkg;

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

var fs = require('fs');
const { readdirSync, rmSync } = require('fs');
const async = require("async");

/*
	consts / defaults
*/

var nextFightsNum = 4; // Number of next fights to generate (default)
const WIKI_BASE_URL = 'https://en.wikipedia.org';
const CACHE_TIME = 15 * 60 * 100; // in ms; 15 minute

/*
	Parse main DOM
*/

function parseMainDOM(res, dom) {
	var root = parse(dom.serialize());
	
	var tables = root.querySelectorAll('.wikitable');
 	
	// Get latest past fight
	var latestFight = tables[1].querySelectorAll('tbody')[0].querySelectorAll('tr')[1];
	
	latestDetails.link = WIKI_BASE_URL + latestFight.querySelectorAll('a')[0].getAttribute('href');
	latestDetails.name = latestFight.querySelectorAll('a')[0].text;
	latestDetails.date = latestFight.querySelectorAll('span')[0].text.split(',')[0];
	latestDetails.fights = [];
	
	console.log('Loaded latest fight.');
	
	// -> Get latest past fight details
	let url = latestDetails.link;
	if (cached(url)) {
		console.log('File cached, reading from FILE.');
		JSDOM.fromFile(cacheFileURL(url)).then(dom => {
			parsePrepare(res, dom, tables);
		});
	} else {
		console.log('File not cached or old, reading from URL.');
		JSDOM.fromURL(url).then(dom => {
			parsePrepare(res, dom, tables);
			fs.writeFileSync(cacheFileURL(url), dom.serialize());
		});
	}
}

/* 
	Preparations
*/
function parsePrepare(res, domA, tables) {
	parseLatestDOM(domA);	
		
	// Get next fights list
	let children = tables[0].querySelectorAll('tbody')[0].childNodes;

	for (let i = children.length; i >= children.length - nextFightsNum * 2; i--) {
		if (children[i] && children[i].toString().length > 10) {
			nextFightsList.push({
				link: WIKI_BASE_URL + children[i].querySelectorAll('a')[0].getAttribute('href'),
				name: children[i].querySelectorAll('a')[0].text,
				date: children[i].querySelectorAll('span')[0].text.split(',')[0],
				fights: [],
				announced: []
			});
		}
	}
	
	console.log('Loaded next fights.');

	async.each(nextFightsList, function(event, callback) {

		let url = event.link;
		if (cached(url)) {
			console.log('File cached, reading from FILE.');
			JSDOM.fromFile(cacheFileURL(url)).then(dom => {
				parseNextDOM(res, dom, event);
			});
		} else {
			console.log('File not cached or old, reading from URL.');
			JSDOM.fromURL(url).then(dom => {
				parseNextDOM(res, dom, event);
				fs.writeFileSync(cacheFileURL(url), dom.serialize());
			});
		}
		
	});
}

/*
	Parse latest event
*/
function parseLatestDOM(domA) {

	var rootA = parse(domA.serialize());
		
	var tableA = rootA.querySelector('.toccolours');
	var fotnExists = false;
	var bonusAwards = rootA.querySelectorAll('b');
	
	// find FOTN
	for (let j = 0; j < bonusAwards.length; j++) {
		if (bonusAwards[j].text.includes('Fight of the Night')) {
			fotnExists = bonusAwards[j].text;
		}
	}
	
	let trChildren = tableA.querySelectorAll('tr');
	
	for (let i = 0; i < trChildren.length; i++) {

		let th = trChildren[i].querySelector('th');
		if (th && th.getAttribute('colspan') == 8) {
			latestDetails.fights.push(th.text);
		} else {
			let td = trChildren[i].querySelectorAll('td');

			if (td && td.length == 8) {
				let rand = (Math.random() >= 0.5);

				let firstLink = td[1].querySelector('a') ? WIKI_BASE_URL + td[1].querySelector('a').getAttribute('href') : null;
				let secondLink = td[3].querySelector('a') ? WIKI_BASE_URL + td[3].querySelector('a').getAttribute('href') : null;
				let fightResult = td[4].text.split(' (')[0];
				//let fightSpoiler = fightResult == 'KO' || fightResult == 'TKO' ? 'KO/TKO' : fightResult.substring(0,3).toUpperCase();
				let fightSpoiler = ['DEC','DRA'].includes(fightResult.substring(0,3).toUpperCase()) ? 'Decision' : 'Finish';
				let fotnFight = (fotnExists && (fotnExists.includes(td[1].text.trim()) || fotnExists.includes(td[3].text.trim()))) ? true : false;
				let fightSpoilerDesc = td[4].text + (['DEC','DRA'].includes(fightResult.substring(0,3).toUpperCase()) ? '' : ' at ' + 'r. ' + td[5].text + ', ' + td[6].text);
				let newFight = {weight: td[0].text, first: rand ? [td[1].text, firstLink] : [td[3].text, secondLink], second: rand ? [td[3].text, secondLink] : [td[1].text, firstLink], method: fightSpoiler, methodDesc: fightSpoilerDesc, winner: td[1].text, fotn: fotnFight };
				
				latestDetails.fights.push(newFight);

			}
		}
	}
	//console.log(latestDetails);
	console.log('Loaded latest fight info.');
}

/*

	let url = latestDetails.link;
	if (cached(url)) {
		console.log('File cached, reading from FILE.');
		JSDOM.fromFile(cacheFileURL(url)).then(dom => {
			parseMainDOM(res, dom);
		});
	} else {
		console.log('File not cached or old, reading from URL.');
		JSDOM.fromURL(url).then(dom => {
			parseMainDOM(res, dom);
			fs.writeFileSync(cacheFileURL(url), dom.serialize());
		});
	}

*/

/*
	Parse next events
*/

function parseNextDOM(res, domB, event) {
	var rootB = parse(domB.serialize());
				
	var tableB = rootB.querySelector('.toccolours');
	
	if (tableB) {
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
					let firstLink = td[1].querySelector('a') ? WIKI_BASE_URL + td[1].querySelector('a').getAttribute('href') : null;
					let secondLink = td[3].querySelector('a') ? WIKI_BASE_URL + td[3].querySelector('a').getAttribute('href') : null;
					let newFight = {weight: td[0].text, first: rand ? [td[1].text, firstLink] : [td[3].text, secondLink], second: rand ? [td[3].text, secondLink] : [td[1].text, firstLink]};
					event.fights.push(newFight);
				}
			}
		}
	}
	
	let bouts = rootB.querySelectorAll('ul')[1];
	
	if (bouts.toString().includes('bout:')) {
		let eachBout = bouts.querySelectorAll('li');
		for (let m = 0; m < eachBout.length; m++) {

			let bout = eachBout[m].text.replace(' bout','').split('[')[0];
			let weightclass = bout.split(':')[0];
			
			let fighters = bout.split(':')[1];
			fighters = fighters.split('vs.')[1] ? fighters.split('vs.') : fighters.split('vs');
			
			let fighter1 = fighters[0].trim();
			let fighter2 = fighters[1].trim();
			
			let eachLink = eachBout[m].querySelectorAll('a');
			let oneLink = null;
			let twoLink = null;
			
			for (let l = 0; l < eachLink.length; l++) {

				let title = eachLink[l].getAttribute('title');
				/*if (title) {
					console.log('1 TITLE = ' , title , ' includes figher 1 ' , fighter1 , ' = ' , title.includes(fighter1) , ' or TITLE = ' , fighter1 , ' = ' , title === fighter1);
					console.log('2 TITLE = ' , title , ' includes figher 2 ' , fighter2 , ' = ' , title.includes(fighter2) , ' or TITLE = ' , fighter2 , ' = ' , title === fighter2);
				}*/
				if (title && (title.includes(fighter1) || title === fighter1)) {
					oneLink = WIKI_BASE_URL + eachLink[l].getAttribute('href');
				}
				if (title && (title.includes(fighter2) || title === fighter2)) {
					twoLink = WIKI_BASE_URL + eachLink[l].getAttribute('href');
				}
			}

			/*console.log(fighter1 + ' link - ' + oneLink);
			console.log(fighter2 + ' link - ' + twoLink);*/
			event.announced.push([weightclass, [fighter1, oneLink], [fighter2, twoLink]]);
		}
	}
	
	theEnd++;
	if (theEnd >= nextFightsNum) {
		res.render('index', { title: 'UFC Latest', latestFightContent: latestDetails, nextFightContent: nextFightsList, cached: isCached });	
	}
}

/* CACHING */

function cacheFileURL(url) {
	let explosion = url.split('/');
	url = explosion[explosion.length - 1];

	return 'data/'+url.replace(/[^a-zA-Z0-9]/g, '')+".txt";
}

function cached(file) {

	let fileURL = cacheFileURL(file);
	console.log("Reading file: "+fileURL);

	try {
		if (fs.readFileSync(fileURL, {enconding: 'utf-8', flag: 'r'})) {
			let date = fs.statSync(fileURL).mtime;
			let dateDate = Date.parse(date);
			let num = Date.now() - Date.parse(date);
	
			console.log('Dif: ', (num));
			console.log(dateDate);
			console.log(Date.now());
			
			if (num < CACHE_TIME) {
				return true;
			}
		}
	} catch (err) {
		console.log('File not found.');
	}

	return false;
}

/* 
	MAIN LOGIC 
*/

var nextFightsList = [];
var latestDetails = {}
var theEnd = 0;
var isCached = false;

/* GET home page */
router.get('/', function(req, res, next) {

	nextFightsList = [];
	latestDetails = {}
	theEnd = 0;
		
	console.log('Starting..');

	console.log('Cookies: ', req.cookies);

	if (req.cookies.nextEventsNumber) {
		let nen = parseInt(req.cookies.nextEventsNumber);
		if (nen >= 1 && nen <= 10) {
			nextFightsNum = nen;
		}
	}

	let url = WIKI_BASE_URL + "/wiki/List_of_UFC_events";
	if (cached(url)) {
		isCached = true;
		console.log('File cached, reading from FILE.');
		JSDOM.fromFile(cacheFileURL(url)).then(dom => {
			parseMainDOM(res, dom);
		});
	} else {
		console.log('File not cached or old, reading from URL.');
		JSDOM.fromURL(url).then(dom => {
			parseMainDOM(res, dom);

			// delete old files before creating new
			let dir = 'data/';
			readdirSync(dir).forEach(f => rmSync(`${dir}/${f}`));

			fs.writeFileSync(cacheFileURL(url), dom.serialize());
		});
	}

});

module.exports = router;

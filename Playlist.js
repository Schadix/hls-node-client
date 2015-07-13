var m3u8 = require('m3u8');
var http = require('http');
var events = require("events");
var request = require('request');
var MyQueue = require('./MyQueue');
var util = require('util');
var moment = require('moment');
var nconf = require('nconf');

nconf.argv()
	.env()
	.file({
		file: './config.json'
	});
nconf.load();

nconf.defaults({
	'subtractlatency': 'true'
});
var subtractlatency = nconf.get('subtractlatency');

var myqueue = new MyQueue();

function Playlist() {
	events.EventEmitter.call(this);

}
util.inherits(Playlist, events.EventEmitter);

function getPlaylist(url) {
	this.url = url;
	loadPlaylist();
}

function loadPlaylist() {
	var parser = m3u8.createStream();
	request(url).pipe(parser);
	parser.on('m3u', function(m3u) {
		var items = m3u.items.PlaylistItem
			// console.log(util.inspect(items))
		for (item in items) {
			myqueue.push(items[item]);
		}
		reloadPlaylist(1000 * parseFloat(items[items.length - 1].get('duration')));
	});
}

this.lastGetNewItems = moment();

function getNewItems() {
	var parser = m3u8.createStream();
	var requestLatency = 0;
	console.log("real timeout: " + moment().diff(this.lastGetNewItems))
	this.lastGetNewItems = moment();
	var starttime = moment();
	request(url).pipe(parser);
	// console.log(moment.utc(new Date).format("YYYY-MM-DD HH:mm:ss.SSS"));
	parser.on('m3u', function(m3u) {
		requestLatency = moment().diff(starttime);
		var newItem = false;
		var items = m3u.items.PlaylistItem
		for (item in items) {
			// console.log("item: "+item+" items[item]: "+items[item]);
			if (!myqueue.has(items[item], function(one, two) {
				return one.get('uri') === two.get('uri');
			})) {
				newItem = true;
				myqueue.push(items[item]);
			}
		}
		if (!newItem) {
			console.log('no change in manifest');
			// this.emit('nochange', 'nochange');
		}
		console.log("requestLatency:" + requestLatency);
		var last_item = items[items.length - 1];
		var delay = (1000 * parseFloat(last_item.get('duration')));
		if (subtractlatency) delay = delay - requestLatency
		reloadPlaylist(delay);
	});
}

function reloadPlaylist(timersetting) {
	console.log("reloadPlaylist - timersetting param: " + timersetting);
	setTimeout(function() {
		getNewItems();
		console.log(timersetting);
	}, timersetting);
}

myqueue.on('change', function(data) {
	// console.log("got change in myqueue: "+util.inspect(data));
	console.log("got change in myqueue: ");
})

// this.on('nochange'), function(data){
// 	console.log("got no change from playlist request");
// }

var URL = 'http://hls.video.schadix.com/hls/index.m3u8';
if (process.argv.length > 2) {
	URL = process.argv[2];
	console.log("setting URL to: " + URL);
}

getPlaylist(URL);
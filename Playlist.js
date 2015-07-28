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

function Playlist() {
	console.log("NEW PLAYLIST!!");
	events.EventEmitter.call(this);
}
util.inherits(Playlist, events.EventEmitter);

Playlist.prototype.getPlaylist = function(url, bandwidth, callback) {
	console.log("getPlaylist - entry");
	console.log("getPlaylist: "+url);
	this.url = url;
	var m=url.match('(http:\/\/.*\/)(.*)$')
	if (m.length<3) callback('Pattern match for url failed\nurl: '+url);
	this.url_path = m[1];
	this.bandwidth = bandwidth;
	this.loadPlaylist();
	this.myqueue = new MyQueue();
	this.stop = false;
	console.log("getPlaylist - exit");
}

Playlist.prototype.loadPlaylist = function() {
	console.log("loadPlaylist: ");
	var parser = m3u8.createStream();
	var obj = this;
	console.log(this.url);
	request(this.url).pipe(parser);
	parser.on('m3u', function(m3u) {
		var items = m3u.items.PlaylistItem
			// console.log(util.inspect(items))
		var last3 = items.slice(Math.max(items.length - 3, 1))
		for (item in last3) {
			obj.myqueue.push(last3[item]);
		}
		obj.reloadPlaylist(1000 * parseFloat(last3[last3.length - 1].get('duration')));
	});
}

this.lastGetNewItems = moment();

Playlist.prototype.getNewItems = function(delay) {
	console.log("getNewItems - entry");
	var obj = this;
	var parser = m3u8.createStream();
	var requestLatency = 0;
	// console.log("real timeout: " + moment().diff(this.lastGetNewItems))
	this.lastGetNewItems = moment();
	var starttime = moment();
	// console.log(this.url);
	request(this.url).pipe(parser);
	// console.log(moment.utc(new Date).format("YYYY-MM-DD HH:mm:ss.SSS"));
	parser.on('m3u', function(m3u) {
		requestLatency = moment().diff(starttime);
		var newItem = false;
		var mediaSequence = m3u.get('mediaSequence');
		var items = m3u.items.PlaylistItem
		var last3 = items.slice(Math.max(items.length - 3, 1))
		for (item in last3) {
			// console.log("item: "+item+" items[item]: "+items[item]);
			var newts = {
				"duration": items[item].get('duration'),
				"uri": items[item].get('uri'),
				"urlPath": obj.url_path,
				"bitrate": obj.bandwidth,
				"mediaSequence": mediaSequence
			};
			if (!obj.myqueue.has(newts, function(one, two) {
				return one.uri === two.uri;
			})) {
				newItem = true;
				obj.myqueue.push(newts);
				obj.emit('newts', newts);
				console.log('emitted: uri: ' + newts.uri+', bitrate: '+newts.bitrate+', sequence: '+newts.mediaSequence);
			}
		}
		if (!newItem) {
			console.log('no change in manifest');
			// this.emit('nochange', 'nochange');
		}
		// console.log("requestLatency:" + requestLatency);
		var last_item = last3[last3.length - 1];
		var delay = (1000 * parseFloat(last_item.get('duration')));
		if (subtractlatency) delay = delay - requestLatency;
		if (!obj.stop) obj.reloadPlaylist(delay);
	});
	console.log("getNewItems - exit");
}

Playlist.prototype.reloadPlaylist = function(timersetting) {
	// console.log("reloadPlaylist - timersetting param: " + timersetting);
	var obj = this;
	setTimeout(function() {
		obj.getNewItems();
		// console.log(timersetting);
	}, timersetting);
}

Playlist.prototype.terminate = function(){
	this.stop=true;
}

// myqueue.on('change', function(data) {
// 	// console.log("got change in myqueue: "+util.inspect(data));
// 	console.log("got change in myqueue: ");
// })

// this.on('nochange'), function(data){
// 	console.log("got no change from playlist request");
// }

// var BASEURL = 'http://hls.video.schadix.com/hls/'
// var URL = BASEURL + 'index.m3u8';
// if (process.argv.length > 2) {
// 	URL = process.argv[2];
// 	console.log("setting URL to: " + URL);
// }
// var pl = new Playlist();
// pl.getPlaylist(URL);

module.exports = Playlist
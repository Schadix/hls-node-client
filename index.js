// var m3u8 = require('m3u8');
// var http = require('http');
// var request = require('request');
// var parser = m3u8.createStream();
// var MyQueue = require('./MyQueue');
// var util = require('util');
// var machina = require('machina');
// var async = require('async');
// var Playlist = require('./Playlist');
var VariantPlaylist = require('./VariantPlaylist');
var TestClass = require('./tmp/TestClass');
var Playlist = require('./Playlist');
var VideoBuffer = require('./VideoBuffer');
var util = require('util');

var BASEURL = 'http://vevoplaylist-live.hls.adaptive.level3.net/vevo/ch1/';
// var URL = 'http://hls.video.schadix.com/hls/index.m3u8';
var URL = BASEURL + 'appleman.m3u8';

if (process.argv.length > 2) {
	console.log("setting URL to: " + URL);
	URL = process.argv[2];
}

var BUFFER_MIN_CHUNKS = 3;
var BUFFER_MAX_CHUNKS = 100;

var buffer_nr_items = 0;

// STATE is current_bitrate
var current_bitrate;

var vpl = new VariantPlaylist();
vpl.loadVariantPlaylist(URL, function(err, data) {
	if (err) console.log(err);
	else {
		current_bandwidth = data[0].bandwidth
		var pl = new Playlist();
		var vb = new VideoBuffer();

		pl.getPlaylist(BASEURL + data[0].uri, data[0].bandwidth);
		console.log('uri: "' + BASEURL + data[0].uri + '", bandwidth: ' + data[0].bandwidth);
		pl.on('newts', function(newts) {
			console.log(newts);
			vb.loadVideoChunk(newts, function(err, chunk) {
				var best_playlist = vpl.findBestMatchPlaylist(chunk.bpsTransfer)
				console.log("best_playlist: "+util.inspect(best_playlist));
				if (current_bitrate != best_playlist.bandwidth) {
					pl.terminate();
					pl = new Playlist();
					pl.getPlaylist(BASEURL+ best_playlist.uri, best_playlist.bandwidth);
				}
			});
		})

		// console.log(BASEURL+data[0].uri, data[0].bandwidth);
	}
});
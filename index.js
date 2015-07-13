var m3u8 = require('m3u8');
var http = require('http');
var request = require('request');
var parser = m3u8.createStream();
var MyQueue = require('./MyQueue');
var util = require('util');
var machina = require('machina');
var async = require('async');
var Playlist = require('./Playlist')

// var myqueue = new MyQueue();
// var video_buffer = new MyQueue();

var URL = 'http://hls.video.schadix.com/hls/index.m3u8';
if (process.argv.length > 2) {
	console.log("setting URL to: "+URL);
	URL = process.argv[2];
}

var BUFFER_MIN_CHUNKS = 3;
var BUFFER_MAX_CHUNKS = 100;

var buffer_nr_items = 0;

var pl = new Playlist(URL);
pl.loadPlaylist();

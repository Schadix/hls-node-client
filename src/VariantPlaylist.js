var m3u8 = require('m3u8');
var http = require('http');
var request = require('request');
var util = require('util');

var parser = m3u8.createStream();

function VariantPlaylist() {
	this.variant_playlist = [];
	console.log(this.variant_playlist);
}

VariantPlaylist.prototype.loadVariantPlaylist = function(url, callback) {
	request(url).pipe(parser);
	var obj = this;
	parser.on('m3u', function(m3u) {
		console.log('m3u' + m3u);
		if (!m3u) return callback("empty m3u");
		var streamItems = m3u.items.StreamItem
		for (var i = 0; i < streamItems.length; i++) {
			obj.variant_playlist[i] = {
				'uri': streamItems[i].get('uri'),
				'bandwidth': streamItems[i].attributes.attributes.bandwidth
			};
		}
		return callback(null, obj.variant_playlist);
	});
}

VariantPlaylist.prototype.getVariantPlaylist = function() {
	return this.variant_playlist;
}

VariantPlaylist.prototype.getVariant = function(bandwidth) {

}

VariantPlaylist.prototype.findBestMatchPlaylist = function(bps) {
	var optimal_bandwidth=0.0;
	var playlistIndex=0;
	for (var i = 0; i < this.variant_playlist.length; i++) {
		if (bps >= this.variant_playlist[i].bandwidth) {
			// console.log("bps >= this.variant_playlist[i].bandwidth: | "+bps+" - "+this.variant_playlist[i].bandwidth);
			optimal_bandwidth = this.variant_playlist[i].bandwidth;
			playlistIndex=i;
		} else{
			break
		}
	}
	console.log("findBestMatchPlaylist: "+util.inspect(this.variant_playlist[playlistIndex]));
	return this.variant_playlist[playlistIndex];
}

module.exports = VariantPlaylist
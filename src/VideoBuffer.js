var request = require('request');
var moment = require('moment');
var util = require('util');

function VideoBuffer() {
	this.vb = []
}

// var newts = {
// 	"duration": items[item].get('duration'),
// 	"uri": items[item].get('uri'),
// 	"urlPath": obj.url_path,
// 	"bitrate": obj.bandwidth,
// 	"mediaSequence": mediaSequence
// };
VideoBuffer.prototype.loadVideoChunk = function(newts, callback) {
	var starttime = moment();
	var obj = this;
	uri = newts.urlPath+newts.uri;
	console.log("uri: "+uri+", newts: "+util.inspect(newts));

	request(uri, function(error, response, body) {
		// console.log("==========\n"+error+'\n'+response+'\n'+body+"\n=============");
		if (!error && response.statusCode == 200) {
			console.log('in');
			var tsSize = parseInt(response.headers['content-length']);
			var duration = moment().diff(starttime) / 1000;
			var bpsTransfer = tsSize * 8 / duration
			var chunk = {
				'duration': duration,
				'uri': uri,
				'size': tsSize,
				'bpsTransfer': bpsTransfer
			};
			obj.vb.push(chunk);
			console.log("pushed chunk to buffer: " + util.inspect(chunk));
			callback(null, chunk);
		} else {
			console.error('went wrong: ' + error);
			callback(error, null);
		}
	})
}

// var vb = new VideoBuffer();
// vb.loadVideoChunk("http://vevoplaylist-live.hls.adaptive.level3.net/vevo/ch1/01/segm150518140104572-834022.ts")

module.exports = VideoBuffer
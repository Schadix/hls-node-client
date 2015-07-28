var util = require('util');


// stores the video files (ts)
function VideoBufferList() {
	this.vbl = {}
}

// Actually s
// addMediaSegment
// addBitrate(mediasegment, bitrate)
// mediasegment, bitrate, segment[]
// segment is duration+segmentname [{uri:'uri',duration:'duration'}]
VideoBufferList.prototype.addSegment = function(mediasegment, br, s) {
	console.log('addSegment'+mediasegment + '-' + br + '-' + s);
	var ms = mediasegment.toString();
	var brString = br.toString();
	var newSeg = {};
	newSeg[brString] = s;
	if (this.vbl[ms]) {
		this.vbl[ms].push(newSeg);
	} else {
		this.vbl[ms] = [newSeg]
	}
	// console.log(util.inspect(this.vbl,{depth:null}));
}

// in the stream the player is at mediasegment+index
VideoBufferList.prototype.getSegmentWithHighestBitrate = function(mediasegment) {
	console.log('getSegmentWithHighestBitrate');
	var ms = mediasegment.toString();
	var highestBitrate = 0;
	var bitrateArr = this.vbl[ms];
	console.log(bitrateArr);
	var hbrIndex=0;
	for (var i=0;i<bitrateArr.length;i++){
		bitrate=parseInt(Object.keys(bitrateArr[i])[0])
		console.log("compare"+bitrate+">"+highestBitrate);
		if (bitrate>highestBitrate){
			highestBitrate=bitrate;
			hbrIndex=i;
		}
	}
	var value = this.vbl[ms][hbrIndex][bitrate.toString()][0];
	return value;
}

module.exports = VideoBufferList;
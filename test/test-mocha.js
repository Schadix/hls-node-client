var assert = require("assert");
var VideoBufferList = require('../VideoBufferList');


// describe('hooks', function() {
// 	beforeEach(function() {
//   });
// }
describe('VideoBufferList', function() {
  describe('addSegment', function () {
    it('should add a mediasequence with one bitrate', function () {
    	var vbl = new VideoBufferList();
    	vbl.addSegment(1234,100,[{uri:'uri',duration:'duration'}]);
      assert.equal('duration', vbl.getSegmentWithHighestBitrate(1234,100).duration);
    });
  });
  describe('addSegment2bitrates', function () {
    it('should add a mediasequence with 2 bitrates', function () {
    	var vbl = new VideoBufferList();
    	vbl.addSegment(1234,100,[{uri:'uri100',duration:'duration100'}]);
    	vbl.addSegment(1234,200,[{uri:'uri200',duration:'duration200'}]);
      assert.equal('duration200', vbl.getSegmentWithHighestBitrate(1234,100).duration);
    });
  });
});


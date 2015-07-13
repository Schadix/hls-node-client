var util = require("util");
var events = require("events");

// emits 'data' with length and value
function MyQueue() {
	console.log("MyQueue");
	events.EventEmitter.call(this);
	this.node = null
	this.length = 0
	this.emit('change', {"length":this.length, "value": null});
}

util.inherits(MyQueue, events.EventEmitter);

var Node = function(list, val) {
	this.prev = this.next = this
	this.value = val
	this.list = list
}

Node.prototype.link = function(next) {
	this.next = next
	next.prev = this
	return next
}

MyQueue.prototype.remove = function(node) {
	console.log('remove')
	if (!node || node.list !== this) return null
	this.length--
	node.list = null
	node.prev.link(node.next)
	if (node === this.node) this.node = node.next === node ? null : node.next
	this.emit('change', {"length":this.length, "value": null});
	return node.link(node).value
}

MyQueue.prototype.push = function(value) {
	// console.log('push')
	var node = new Node(this, value)
	this.length++
	this.emit('change', {"length":this.length, "value": value});
	if (!this.node) return this.node = node
	this.node.prev.link(node)
	node.link(this.node)
	return node
}

MyQueue.prototype.has = function(value, compare_function) {
	var first = this.node
	if (compare_function(first.value, value)) {
		return true
	};
	var node = first.next
	while (node != first) {
		if (compare_function(node.value, value)) {
			return true
		};
		node = node.next
	}
	return false;
}

MyQueue.prototype.shift = function() {
	return this.node && this.remove(this.node)
}

module.exports = MyQueue;
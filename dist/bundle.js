(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/* @preserve
 * Leaflet 1.3.4, a JS library for interactive maps. http://leafletjs.com
 * (c) 2010-2018 Vladimir Agafonkin, (c) 2010-2011 CloudMade
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.L = {})));
}(this, (function (exports) { 'use strict';

var version = "1.3.4";

/*
 * @namespace Util
 *
 * Various utility functions, used by Leaflet internally.
 */

var freeze = Object.freeze;
Object.freeze = function (obj) { return obj; };

// @function extend(dest: Object, src?: Object): Object
// Merges the properties of the `src` object (or multiple objects) into `dest` object and returns the latter. Has an `L.extend` shortcut.
function extend(dest) {
	var i, j, len, src;

	for (j = 1, len = arguments.length; j < len; j++) {
		src = arguments[j];
		for (i in src) {
			dest[i] = src[i];
		}
	}
	return dest;
}

// @function create(proto: Object, properties?: Object): Object
// Compatibility polyfill for [Object.create](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/create)
var create = Object.create || (function () {
	function F() {}
	return function (proto) {
		F.prototype = proto;
		return new F();
	};
})();

// @function bind(fn: Function, …): Function
// Returns a new function bound to the arguments passed, like [Function.prototype.bind](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function/bind).
// Has a `L.bind()` shortcut.
function bind(fn, obj) {
	var slice = Array.prototype.slice;

	if (fn.bind) {
		return fn.bind.apply(fn, slice.call(arguments, 1));
	}

	var args = slice.call(arguments, 2);

	return function () {
		return fn.apply(obj, args.length ? args.concat(slice.call(arguments)) : arguments);
	};
}

// @property lastId: Number
// Last unique ID used by [`stamp()`](#util-stamp)
var lastId = 0;

// @function stamp(obj: Object): Number
// Returns the unique ID of an object, assigning it one if it doesn't have it.
function stamp(obj) {
	/*eslint-disable */
	obj._leaflet_id = obj._leaflet_id || ++lastId;
	return obj._leaflet_id;
	/* eslint-enable */
}

// @function throttle(fn: Function, time: Number, context: Object): Function
// Returns a function which executes function `fn` with the given scope `context`
// (so that the `this` keyword refers to `context` inside `fn`'s code). The function
// `fn` will be called no more than one time per given amount of `time`. The arguments
// received by the bound function will be any arguments passed when binding the
// function, followed by any arguments passed when invoking the bound function.
// Has an `L.throttle` shortcut.
function throttle(fn, time, context) {
	var lock, args, wrapperFn, later;

	later = function () {
		// reset lock and call if queued
		lock = false;
		if (args) {
			wrapperFn.apply(context, args);
			args = false;
		}
	};

	wrapperFn = function () {
		if (lock) {
			// called too soon, queue to call later
			args = arguments;

		} else {
			// call and lock until later
			fn.apply(context, arguments);
			setTimeout(later, time);
			lock = true;
		}
	};

	return wrapperFn;
}

// @function wrapNum(num: Number, range: Number[], includeMax?: Boolean): Number
// Returns the number `num` modulo `range` in such a way so it lies within
// `range[0]` and `range[1]`. The returned value will be always smaller than
// `range[1]` unless `includeMax` is set to `true`.
function wrapNum(x, range, includeMax) {
	var max = range[1],
	    min = range[0],
	    d = max - min;
	return x === max && includeMax ? x : ((x - min) % d + d) % d + min;
}

// @function falseFn(): Function
// Returns a function which always returns `false`.
function falseFn() { return false; }

// @function formatNum(num: Number, digits?: Number): Number
// Returns the number `num` rounded to `digits` decimals, or to 6 decimals by default.
function formatNum(num, digits) {
	var pow = Math.pow(10, (digits === undefined ? 6 : digits));
	return Math.round(num * pow) / pow;
}

// @function trim(str: String): String
// Compatibility polyfill for [String.prototype.trim](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String/Trim)
function trim(str) {
	return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
}

// @function splitWords(str: String): String[]
// Trims and splits the string on whitespace and returns the array of parts.
function splitWords(str) {
	return trim(str).split(/\s+/);
}

// @function setOptions(obj: Object, options: Object): Object
// Merges the given properties to the `options` of the `obj` object, returning the resulting options. See `Class options`. Has an `L.setOptions` shortcut.
function setOptions(obj, options) {
	if (!obj.hasOwnProperty('options')) {
		obj.options = obj.options ? create(obj.options) : {};
	}
	for (var i in options) {
		obj.options[i] = options[i];
	}
	return obj.options;
}

// @function getParamString(obj: Object, existingUrl?: String, uppercase?: Boolean): String
// Converts an object into a parameter URL string, e.g. `{a: "foo", b: "bar"}`
// translates to `'?a=foo&b=bar'`. If `existingUrl` is set, the parameters will
// be appended at the end. If `uppercase` is `true`, the parameter names will
// be uppercased (e.g. `'?A=foo&B=bar'`)
function getParamString(obj, existingUrl, uppercase) {
	var params = [];
	for (var i in obj) {
		params.push(encodeURIComponent(uppercase ? i.toUpperCase() : i) + '=' + encodeURIComponent(obj[i]));
	}
	return ((!existingUrl || existingUrl.indexOf('?') === -1) ? '?' : '&') + params.join('&');
}

var templateRe = /\{ *([\w_-]+) *\}/g;

// @function template(str: String, data: Object): String
// Simple templating facility, accepts a template string of the form `'Hello {a}, {b}'`
// and a data object like `{a: 'foo', b: 'bar'}`, returns evaluated string
// `('Hello foo, bar')`. You can also specify functions instead of strings for
// data values — they will be evaluated passing `data` as an argument.
function template(str, data) {
	return str.replace(templateRe, function (str, key) {
		var value = data[key];

		if (value === undefined) {
			throw new Error('No value provided for variable ' + str);

		} else if (typeof value === 'function') {
			value = value(data);
		}
		return value;
	});
}

// @function isArray(obj): Boolean
// Compatibility polyfill for [Array.isArray](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray)
var isArray = Array.isArray || function (obj) {
	return (Object.prototype.toString.call(obj) === '[object Array]');
};

// @function indexOf(array: Array, el: Object): Number
// Compatibility polyfill for [Array.prototype.indexOf](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf)
function indexOf(array, el) {
	for (var i = 0; i < array.length; i++) {
		if (array[i] === el) { return i; }
	}
	return -1;
}

// @property emptyImageUrl: String
// Data URI string containing a base64-encoded empty GIF image.
// Used as a hack to free memory from unused images on WebKit-powered
// mobile devices (by setting image `src` to this string).
var emptyImageUrl = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

// inspired by http://paulirish.com/2011/requestanimationframe-for-smart-animating/

function getPrefixed(name) {
	return window['webkit' + name] || window['moz' + name] || window['ms' + name];
}

var lastTime = 0;

// fallback for IE 7-8
function timeoutDefer(fn) {
	var time = +new Date(),
	    timeToCall = Math.max(0, 16 - (time - lastTime));

	lastTime = time + timeToCall;
	return window.setTimeout(fn, timeToCall);
}

var requestFn = window.requestAnimationFrame || getPrefixed('RequestAnimationFrame') || timeoutDefer;
var cancelFn = window.cancelAnimationFrame || getPrefixed('CancelAnimationFrame') ||
		getPrefixed('CancelRequestAnimationFrame') || function (id) { window.clearTimeout(id); };

// @function requestAnimFrame(fn: Function, context?: Object, immediate?: Boolean): Number
// Schedules `fn` to be executed when the browser repaints. `fn` is bound to
// `context` if given. When `immediate` is set, `fn` is called immediately if
// the browser doesn't have native support for
// [`window.requestAnimationFrame`](https://developer.mozilla.org/docs/Web/API/window/requestAnimationFrame),
// otherwise it's delayed. Returns a request ID that can be used to cancel the request.
function requestAnimFrame(fn, context, immediate) {
	if (immediate && requestFn === timeoutDefer) {
		fn.call(context);
	} else {
		return requestFn.call(window, bind(fn, context));
	}
}

// @function cancelAnimFrame(id: Number): undefined
// Cancels a previous `requestAnimFrame`. See also [window.cancelAnimationFrame](https://developer.mozilla.org/docs/Web/API/window/cancelAnimationFrame).
function cancelAnimFrame(id) {
	if (id) {
		cancelFn.call(window, id);
	}
}


var Util = (Object.freeze || Object)({
	freeze: freeze,
	extend: extend,
	create: create,
	bind: bind,
	lastId: lastId,
	stamp: stamp,
	throttle: throttle,
	wrapNum: wrapNum,
	falseFn: falseFn,
	formatNum: formatNum,
	trim: trim,
	splitWords: splitWords,
	setOptions: setOptions,
	getParamString: getParamString,
	template: template,
	isArray: isArray,
	indexOf: indexOf,
	emptyImageUrl: emptyImageUrl,
	requestFn: requestFn,
	cancelFn: cancelFn,
	requestAnimFrame: requestAnimFrame,
	cancelAnimFrame: cancelAnimFrame
});

// @class Class
// @aka L.Class

// @section
// @uninheritable

// Thanks to John Resig and Dean Edwards for inspiration!

function Class() {}

Class.extend = function (props) {

	// @function extend(props: Object): Function
	// [Extends the current class](#class-inheritance) given the properties to be included.
	// Returns a Javascript function that is a class constructor (to be called with `new`).
	var NewClass = function () {

		// call the constructor
		if (this.initialize) {
			this.initialize.apply(this, arguments);
		}

		// call all constructor hooks
		this.callInitHooks();
	};

	var parentProto = NewClass.__super__ = this.prototype;

	var proto = create(parentProto);
	proto.constructor = NewClass;

	NewClass.prototype = proto;

	// inherit parent's statics
	for (var i in this) {
		if (this.hasOwnProperty(i) && i !== 'prototype' && i !== '__super__') {
			NewClass[i] = this[i];
		}
	}

	// mix static properties into the class
	if (props.statics) {
		extend(NewClass, props.statics);
		delete props.statics;
	}

	// mix includes into the prototype
	if (props.includes) {
		checkDeprecatedMixinEvents(props.includes);
		extend.apply(null, [proto].concat(props.includes));
		delete props.includes;
	}

	// merge options
	if (proto.options) {
		props.options = extend(create(proto.options), props.options);
	}

	// mix given properties into the prototype
	extend(proto, props);

	proto._initHooks = [];

	// add method for calling all hooks
	proto.callInitHooks = function () {

		if (this._initHooksCalled) { return; }

		if (parentProto.callInitHooks) {
			parentProto.callInitHooks.call(this);
		}

		this._initHooksCalled = true;

		for (var i = 0, len = proto._initHooks.length; i < len; i++) {
			proto._initHooks[i].call(this);
		}
	};

	return NewClass;
};


// @function include(properties: Object): this
// [Includes a mixin](#class-includes) into the current class.
Class.include = function (props) {
	extend(this.prototype, props);
	return this;
};

// @function mergeOptions(options: Object): this
// [Merges `options`](#class-options) into the defaults of the class.
Class.mergeOptions = function (options) {
	extend(this.prototype.options, options);
	return this;
};

// @function addInitHook(fn: Function): this
// Adds a [constructor hook](#class-constructor-hooks) to the class.
Class.addInitHook = function (fn) { // (Function) || (String, args...)
	var args = Array.prototype.slice.call(arguments, 1);

	var init = typeof fn === 'function' ? fn : function () {
		this[fn].apply(this, args);
	};

	this.prototype._initHooks = this.prototype._initHooks || [];
	this.prototype._initHooks.push(init);
	return this;
};

function checkDeprecatedMixinEvents(includes) {
	if (typeof L === 'undefined' || !L || !L.Mixin) { return; }

	includes = isArray(includes) ? includes : [includes];

	for (var i = 0; i < includes.length; i++) {
		if (includes[i] === L.Mixin.Events) {
			console.warn('Deprecated include of L.Mixin.Events: ' +
				'this property will be removed in future releases, ' +
				'please inherit from L.Evented instead.', new Error().stack);
		}
	}
}

/*
 * @class Evented
 * @aka L.Evented
 * @inherits Class
 *
 * A set of methods shared between event-powered classes (like `Map` and `Marker`). Generally, events allow you to execute some function when something happens with an object (e.g. the user clicks on the map, causing the map to fire `'click'` event).
 *
 * @example
 *
 * ```js
 * map.on('click', function(e) {
 * 	alert(e.latlng);
 * } );
 * ```
 *
 * Leaflet deals with event listeners by reference, so if you want to add a listener and then remove it, define it as a function:
 *
 * ```js
 * function onClick(e) { ... }
 *
 * map.on('click', onClick);
 * map.off('click', onClick);
 * ```
 */

var Events = {
	/* @method on(type: String, fn: Function, context?: Object): this
	 * Adds a listener function (`fn`) to a particular event type of the object. You can optionally specify the context of the listener (object the this keyword will point to). You can also pass several space-separated types (e.g. `'click dblclick'`).
	 *
	 * @alternative
	 * @method on(eventMap: Object): this
	 * Adds a set of type/listener pairs, e.g. `{click: onClick, mousemove: onMouseMove}`
	 */
	on: function (types, fn, context) {

		// types can be a map of types/handlers
		if (typeof types === 'object') {
			for (var type in types) {
				// we don't process space-separated events here for performance;
				// it's a hot path since Layer uses the on(obj) syntax
				this._on(type, types[type], fn);
			}

		} else {
			// types can be a string of space-separated words
			types = splitWords(types);

			for (var i = 0, len = types.length; i < len; i++) {
				this._on(types[i], fn, context);
			}
		}

		return this;
	},

	/* @method off(type: String, fn?: Function, context?: Object): this
	 * Removes a previously added listener function. If no function is specified, it will remove all the listeners of that particular event from the object. Note that if you passed a custom context to `on`, you must pass the same context to `off` in order to remove the listener.
	 *
	 * @alternative
	 * @method off(eventMap: Object): this
	 * Removes a set of type/listener pairs.
	 *
	 * @alternative
	 * @method off: this
	 * Removes all listeners to all events on the object.
	 */
	off: function (types, fn, context) {

		if (!types) {
			// clear all listeners if called without arguments
			delete this._events;

		} else if (typeof types === 'object') {
			for (var type in types) {
				this._off(type, types[type], fn);
			}

		} else {
			types = splitWords(types);

			for (var i = 0, len = types.length; i < len; i++) {
				this._off(types[i], fn, context);
			}
		}

		return this;
	},

	// attach listener (without syntactic sugar now)
	_on: function (type, fn, context) {
		this._events = this._events || {};

		/* get/init listeners for type */
		var typeListeners = this._events[type];
		if (!typeListeners) {
			typeListeners = [];
			this._events[type] = typeListeners;
		}

		if (context === this) {
			// Less memory footprint.
			context = undefined;
		}
		var newListener = {fn: fn, ctx: context},
		    listeners = typeListeners;

		// check if fn already there
		for (var i = 0, len = listeners.length; i < len; i++) {
			if (listeners[i].fn === fn && listeners[i].ctx === context) {
				return;
			}
		}

		listeners.push(newListener);
	},

	_off: function (type, fn, context) {
		var listeners,
		    i,
		    len;

		if (!this._events) { return; }

		listeners = this._events[type];

		if (!listeners) {
			return;
		}

		if (!fn) {
			// Set all removed listeners to noop so they are not called if remove happens in fire
			for (i = 0, len = listeners.length; i < len; i++) {
				listeners[i].fn = falseFn;
			}
			// clear all listeners for a type if function isn't specified
			delete this._events[type];
			return;
		}

		if (context === this) {
			context = undefined;
		}

		if (listeners) {

			// find fn and remove it
			for (i = 0, len = listeners.length; i < len; i++) {
				var l = listeners[i];
				if (l.ctx !== context) { continue; }
				if (l.fn === fn) {

					// set the removed listener to noop so that's not called if remove happens in fire
					l.fn = falseFn;

					if (this._firingCount) {
						/* copy array in case events are being fired */
						this._events[type] = listeners = listeners.slice();
					}
					listeners.splice(i, 1);

					return;
				}
			}
		}
	},

	// @method fire(type: String, data?: Object, propagate?: Boolean): this
	// Fires an event of the specified type. You can optionally provide an data
	// object — the first argument of the listener function will contain its
	// properties. The event can optionally be propagated to event parents.
	fire: function (type, data, propagate) {
		if (!this.listens(type, propagate)) { return this; }

		var event = extend({}, data, {
			type: type,
			target: this,
			sourceTarget: data && data.sourceTarget || this
		});

		if (this._events) {
			var listeners = this._events[type];

			if (listeners) {
				this._firingCount = (this._firingCount + 1) || 1;
				for (var i = 0, len = listeners.length; i < len; i++) {
					var l = listeners[i];
					l.fn.call(l.ctx || this, event);
				}

				this._firingCount--;
			}
		}

		if (propagate) {
			// propagate the event to parents (set with addEventParent)
			this._propagateEvent(event);
		}

		return this;
	},

	// @method listens(type: String): Boolean
	// Returns `true` if a particular event type has any listeners attached to it.
	listens: function (type, propagate) {
		var listeners = this._events && this._events[type];
		if (listeners && listeners.length) { return true; }

		if (propagate) {
			// also check parents for listeners if event propagates
			for (var id in this._eventParents) {
				if (this._eventParents[id].listens(type, propagate)) { return true; }
			}
		}
		return false;
	},

	// @method once(…): this
	// Behaves as [`on(…)`](#evented-on), except the listener will only get fired once and then removed.
	once: function (types, fn, context) {

		if (typeof types === 'object') {
			for (var type in types) {
				this.once(type, types[type], fn);
			}
			return this;
		}

		var handler = bind(function () {
			this
			    .off(types, fn, context)
			    .off(types, handler, context);
		}, this);

		// add a listener that's executed once and removed after that
		return this
		    .on(types, fn, context)
		    .on(types, handler, context);
	},

	// @method addEventParent(obj: Evented): this
	// Adds an event parent - an `Evented` that will receive propagated events
	addEventParent: function (obj) {
		this._eventParents = this._eventParents || {};
		this._eventParents[stamp(obj)] = obj;
		return this;
	},

	// @method removeEventParent(obj: Evented): this
	// Removes an event parent, so it will stop receiving propagated events
	removeEventParent: function (obj) {
		if (this._eventParents) {
			delete this._eventParents[stamp(obj)];
		}
		return this;
	},

	_propagateEvent: function (e) {
		for (var id in this._eventParents) {
			this._eventParents[id].fire(e.type, extend({
				layer: e.target,
				propagatedFrom: e.target
			}, e), true);
		}
	}
};

// aliases; we should ditch those eventually

// @method addEventListener(…): this
// Alias to [`on(…)`](#evented-on)
Events.addEventListener = Events.on;

// @method removeEventListener(…): this
// Alias to [`off(…)`](#evented-off)

// @method clearAllEventListeners(…): this
// Alias to [`off()`](#evented-off)
Events.removeEventListener = Events.clearAllEventListeners = Events.off;

// @method addOneTimeEventListener(…): this
// Alias to [`once(…)`](#evented-once)
Events.addOneTimeEventListener = Events.once;

// @method fireEvent(…): this
// Alias to [`fire(…)`](#evented-fire)
Events.fireEvent = Events.fire;

// @method hasEventListeners(…): Boolean
// Alias to [`listens(…)`](#evented-listens)
Events.hasEventListeners = Events.listens;

var Evented = Class.extend(Events);

/*
 * @class Point
 * @aka L.Point
 *
 * Represents a point with `x` and `y` coordinates in pixels.
 *
 * @example
 *
 * ```js
 * var point = L.point(200, 300);
 * ```
 *
 * All Leaflet methods and options that accept `Point` objects also accept them in a simple Array form (unless noted otherwise), so these lines are equivalent:
 *
 * ```js
 * map.panBy([200, 300]);
 * map.panBy(L.point(200, 300));
 * ```
 *
 * Note that `Point` does not inherit from Leafet's `Class` object,
 * which means new classes can't inherit from it, and new methods
 * can't be added to it with the `include` function.
 */

function Point(x, y, round) {
	// @property x: Number; The `x` coordinate of the point
	this.x = (round ? Math.round(x) : x);
	// @property y: Number; The `y` coordinate of the point
	this.y = (round ? Math.round(y) : y);
}

var trunc = Math.trunc || function (v) {
	return v > 0 ? Math.floor(v) : Math.ceil(v);
};

Point.prototype = {

	// @method clone(): Point
	// Returns a copy of the current point.
	clone: function () {
		return new Point(this.x, this.y);
	},

	// @method add(otherPoint: Point): Point
	// Returns the result of addition of the current and the given points.
	add: function (point) {
		// non-destructive, returns a new point
		return this.clone()._add(toPoint(point));
	},

	_add: function (point) {
		// destructive, used directly for performance in situations where it's safe to modify existing point
		this.x += point.x;
		this.y += point.y;
		return this;
	},

	// @method subtract(otherPoint: Point): Point
	// Returns the result of subtraction of the given point from the current.
	subtract: function (point) {
		return this.clone()._subtract(toPoint(point));
	},

	_subtract: function (point) {
		this.x -= point.x;
		this.y -= point.y;
		return this;
	},

	// @method divideBy(num: Number): Point
	// Returns the result of division of the current point by the given number.
	divideBy: function (num) {
		return this.clone()._divideBy(num);
	},

	_divideBy: function (num) {
		this.x /= num;
		this.y /= num;
		return this;
	},

	// @method multiplyBy(num: Number): Point
	// Returns the result of multiplication of the current point by the given number.
	multiplyBy: function (num) {
		return this.clone()._multiplyBy(num);
	},

	_multiplyBy: function (num) {
		this.x *= num;
		this.y *= num;
		return this;
	},

	// @method scaleBy(scale: Point): Point
	// Multiply each coordinate of the current point by each coordinate of
	// `scale`. In linear algebra terms, multiply the point by the
	// [scaling matrix](https://en.wikipedia.org/wiki/Scaling_%28geometry%29#Matrix_representation)
	// defined by `scale`.
	scaleBy: function (point) {
		return new Point(this.x * point.x, this.y * point.y);
	},

	// @method unscaleBy(scale: Point): Point
	// Inverse of `scaleBy`. Divide each coordinate of the current point by
	// each coordinate of `scale`.
	unscaleBy: function (point) {
		return new Point(this.x / point.x, this.y / point.y);
	},

	// @method round(): Point
	// Returns a copy of the current point with rounded coordinates.
	round: function () {
		return this.clone()._round();
	},

	_round: function () {
		this.x = Math.round(this.x);
		this.y = Math.round(this.y);
		return this;
	},

	// @method floor(): Point
	// Returns a copy of the current point with floored coordinates (rounded down).
	floor: function () {
		return this.clone()._floor();
	},

	_floor: function () {
		this.x = Math.floor(this.x);
		this.y = Math.floor(this.y);
		return this;
	},

	// @method ceil(): Point
	// Returns a copy of the current point with ceiled coordinates (rounded up).
	ceil: function () {
		return this.clone()._ceil();
	},

	_ceil: function () {
		this.x = Math.ceil(this.x);
		this.y = Math.ceil(this.y);
		return this;
	},

	// @method trunc(): Point
	// Returns a copy of the current point with truncated coordinates (rounded towards zero).
	trunc: function () {
		return this.clone()._trunc();
	},

	_trunc: function () {
		this.x = trunc(this.x);
		this.y = trunc(this.y);
		return this;
	},

	// @method distanceTo(otherPoint: Point): Number
	// Returns the cartesian distance between the current and the given points.
	distanceTo: function (point) {
		point = toPoint(point);

		var x = point.x - this.x,
		    y = point.y - this.y;

		return Math.sqrt(x * x + y * y);
	},

	// @method equals(otherPoint: Point): Boolean
	// Returns `true` if the given point has the same coordinates.
	equals: function (point) {
		point = toPoint(point);

		return point.x === this.x &&
		       point.y === this.y;
	},

	// @method contains(otherPoint: Point): Boolean
	// Returns `true` if both coordinates of the given point are less than the corresponding current point coordinates (in absolute values).
	contains: function (point) {
		point = toPoint(point);

		return Math.abs(point.x) <= Math.abs(this.x) &&
		       Math.abs(point.y) <= Math.abs(this.y);
	},

	// @method toString(): String
	// Returns a string representation of the point for debugging purposes.
	toString: function () {
		return 'Point(' +
		        formatNum(this.x) + ', ' +
		        formatNum(this.y) + ')';
	}
};

// @factory L.point(x: Number, y: Number, round?: Boolean)
// Creates a Point object with the given `x` and `y` coordinates. If optional `round` is set to true, rounds the `x` and `y` values.

// @alternative
// @factory L.point(coords: Number[])
// Expects an array of the form `[x, y]` instead.

// @alternative
// @factory L.point(coords: Object)
// Expects a plain object of the form `{x: Number, y: Number}` instead.
function toPoint(x, y, round) {
	if (x instanceof Point) {
		return x;
	}
	if (isArray(x)) {
		return new Point(x[0], x[1]);
	}
	if (x === undefined || x === null) {
		return x;
	}
	if (typeof x === 'object' && 'x' in x && 'y' in x) {
		return new Point(x.x, x.y);
	}
	return new Point(x, y, round);
}

/*
 * @class Bounds
 * @aka L.Bounds
 *
 * Represents a rectangular area in pixel coordinates.
 *
 * @example
 *
 * ```js
 * var p1 = L.point(10, 10),
 * p2 = L.point(40, 60),
 * bounds = L.bounds(p1, p2);
 * ```
 *
 * All Leaflet methods that accept `Bounds` objects also accept them in a simple Array form (unless noted otherwise), so the bounds example above can be passed like this:
 *
 * ```js
 * otherBounds.intersects([[10, 10], [40, 60]]);
 * ```
 *
 * Note that `Bounds` does not inherit from Leafet's `Class` object,
 * which means new classes can't inherit from it, and new methods
 * can't be added to it with the `include` function.
 */

function Bounds(a, b) {
	if (!a) { return; }

	var points = b ? [a, b] : a;

	for (var i = 0, len = points.length; i < len; i++) {
		this.extend(points[i]);
	}
}

Bounds.prototype = {
	// @method extend(point: Point): this
	// Extends the bounds to contain the given point.
	extend: function (point) { // (Point)
		point = toPoint(point);

		// @property min: Point
		// The top left corner of the rectangle.
		// @property max: Point
		// The bottom right corner of the rectangle.
		if (!this.min && !this.max) {
			this.min = point.clone();
			this.max = point.clone();
		} else {
			this.min.x = Math.min(point.x, this.min.x);
			this.max.x = Math.max(point.x, this.max.x);
			this.min.y = Math.min(point.y, this.min.y);
			this.max.y = Math.max(point.y, this.max.y);
		}
		return this;
	},

	// @method getCenter(round?: Boolean): Point
	// Returns the center point of the bounds.
	getCenter: function (round) {
		return new Point(
		        (this.min.x + this.max.x) / 2,
		        (this.min.y + this.max.y) / 2, round);
	},

	// @method getBottomLeft(): Point
	// Returns the bottom-left point of the bounds.
	getBottomLeft: function () {
		return new Point(this.min.x, this.max.y);
	},

	// @method getTopRight(): Point
	// Returns the top-right point of the bounds.
	getTopRight: function () { // -> Point
		return new Point(this.max.x, this.min.y);
	},

	// @method getTopLeft(): Point
	// Returns the top-left point of the bounds (i.e. [`this.min`](#bounds-min)).
	getTopLeft: function () {
		return this.min; // left, top
	},

	// @method getBottomRight(): Point
	// Returns the bottom-right point of the bounds (i.e. [`this.max`](#bounds-max)).
	getBottomRight: function () {
		return this.max; // right, bottom
	},

	// @method getSize(): Point
	// Returns the size of the given bounds
	getSize: function () {
		return this.max.subtract(this.min);
	},

	// @method contains(otherBounds: Bounds): Boolean
	// Returns `true` if the rectangle contains the given one.
	// @alternative
	// @method contains(point: Point): Boolean
	// Returns `true` if the rectangle contains the given point.
	contains: function (obj) {
		var min, max;

		if (typeof obj[0] === 'number' || obj instanceof Point) {
			obj = toPoint(obj);
		} else {
			obj = toBounds(obj);
		}

		if (obj instanceof Bounds) {
			min = obj.min;
			max = obj.max;
		} else {
			min = max = obj;
		}

		return (min.x >= this.min.x) &&
		       (max.x <= this.max.x) &&
		       (min.y >= this.min.y) &&
		       (max.y <= this.max.y);
	},

	// @method intersects(otherBounds: Bounds): Boolean
	// Returns `true` if the rectangle intersects the given bounds. Two bounds
	// intersect if they have at least one point in common.
	intersects: function (bounds) { // (Bounds) -> Boolean
		bounds = toBounds(bounds);

		var min = this.min,
		    max = this.max,
		    min2 = bounds.min,
		    max2 = bounds.max,
		    xIntersects = (max2.x >= min.x) && (min2.x <= max.x),
		    yIntersects = (max2.y >= min.y) && (min2.y <= max.y);

		return xIntersects && yIntersects;
	},

	// @method overlaps(otherBounds: Bounds): Boolean
	// Returns `true` if the rectangle overlaps the given bounds. Two bounds
	// overlap if their intersection is an area.
	overlaps: function (bounds) { // (Bounds) -> Boolean
		bounds = toBounds(bounds);

		var min = this.min,
		    max = this.max,
		    min2 = bounds.min,
		    max2 = bounds.max,
		    xOverlaps = (max2.x > min.x) && (min2.x < max.x),
		    yOverlaps = (max2.y > min.y) && (min2.y < max.y);

		return xOverlaps && yOverlaps;
	},

	isValid: function () {
		return !!(this.min && this.max);
	}
};


// @factory L.bounds(corner1: Point, corner2: Point)
// Creates a Bounds object from two corners coordinate pairs.
// @alternative
// @factory L.bounds(points: Point[])
// Creates a Bounds object from the given array of points.
function toBounds(a, b) {
	if (!a || a instanceof Bounds) {
		return a;
	}
	return new Bounds(a, b);
}

/*
 * @class LatLngBounds
 * @aka L.LatLngBounds
 *
 * Represents a rectangular geographical area on a map.
 *
 * @example
 *
 * ```js
 * var corner1 = L.latLng(40.712, -74.227),
 * corner2 = L.latLng(40.774, -74.125),
 * bounds = L.latLngBounds(corner1, corner2);
 * ```
 *
 * All Leaflet methods that accept LatLngBounds objects also accept them in a simple Array form (unless noted otherwise), so the bounds example above can be passed like this:
 *
 * ```js
 * map.fitBounds([
 * 	[40.712, -74.227],
 * 	[40.774, -74.125]
 * ]);
 * ```
 *
 * Caution: if the area crosses the antimeridian (often confused with the International Date Line), you must specify corners _outside_ the [-180, 180] degrees longitude range.
 *
 * Note that `LatLngBounds` does not inherit from Leafet's `Class` object,
 * which means new classes can't inherit from it, and new methods
 * can't be added to it with the `include` function.
 */

function LatLngBounds(corner1, corner2) { // (LatLng, LatLng) or (LatLng[])
	if (!corner1) { return; }

	var latlngs = corner2 ? [corner1, corner2] : corner1;

	for (var i = 0, len = latlngs.length; i < len; i++) {
		this.extend(latlngs[i]);
	}
}

LatLngBounds.prototype = {

	// @method extend(latlng: LatLng): this
	// Extend the bounds to contain the given point

	// @alternative
	// @method extend(otherBounds: LatLngBounds): this
	// Extend the bounds to contain the given bounds
	extend: function (obj) {
		var sw = this._southWest,
		    ne = this._northEast,
		    sw2, ne2;

		if (obj instanceof LatLng) {
			sw2 = obj;
			ne2 = obj;

		} else if (obj instanceof LatLngBounds) {
			sw2 = obj._southWest;
			ne2 = obj._northEast;

			if (!sw2 || !ne2) { return this; }

		} else {
			return obj ? this.extend(toLatLng(obj) || toLatLngBounds(obj)) : this;
		}

		if (!sw && !ne) {
			this._southWest = new LatLng(sw2.lat, sw2.lng);
			this._northEast = new LatLng(ne2.lat, ne2.lng);
		} else {
			sw.lat = Math.min(sw2.lat, sw.lat);
			sw.lng = Math.min(sw2.lng, sw.lng);
			ne.lat = Math.max(ne2.lat, ne.lat);
			ne.lng = Math.max(ne2.lng, ne.lng);
		}

		return this;
	},

	// @method pad(bufferRatio: Number): LatLngBounds
	// Returns bounds created by extending or retracting the current bounds by a given ratio in each direction.
	// For example, a ratio of 0.5 extends the bounds by 50% in each direction.
	// Negative values will retract the bounds.
	pad: function (bufferRatio) {
		var sw = this._southWest,
		    ne = this._northEast,
		    heightBuffer = Math.abs(sw.lat - ne.lat) * bufferRatio,
		    widthBuffer = Math.abs(sw.lng - ne.lng) * bufferRatio;

		return new LatLngBounds(
		        new LatLng(sw.lat - heightBuffer, sw.lng - widthBuffer),
		        new LatLng(ne.lat + heightBuffer, ne.lng + widthBuffer));
	},

	// @method getCenter(): LatLng
	// Returns the center point of the bounds.
	getCenter: function () {
		return new LatLng(
		        (this._southWest.lat + this._northEast.lat) / 2,
		        (this._southWest.lng + this._northEast.lng) / 2);
	},

	// @method getSouthWest(): LatLng
	// Returns the south-west point of the bounds.
	getSouthWest: function () {
		return this._southWest;
	},

	// @method getNorthEast(): LatLng
	// Returns the north-east point of the bounds.
	getNorthEast: function () {
		return this._northEast;
	},

	// @method getNorthWest(): LatLng
	// Returns the north-west point of the bounds.
	getNorthWest: function () {
		return new LatLng(this.getNorth(), this.getWest());
	},

	// @method getSouthEast(): LatLng
	// Returns the south-east point of the bounds.
	getSouthEast: function () {
		return new LatLng(this.getSouth(), this.getEast());
	},

	// @method getWest(): Number
	// Returns the west longitude of the bounds
	getWest: function () {
		return this._southWest.lng;
	},

	// @method getSouth(): Number
	// Returns the south latitude of the bounds
	getSouth: function () {
		return this._southWest.lat;
	},

	// @method getEast(): Number
	// Returns the east longitude of the bounds
	getEast: function () {
		return this._northEast.lng;
	},

	// @method getNorth(): Number
	// Returns the north latitude of the bounds
	getNorth: function () {
		return this._northEast.lat;
	},

	// @method contains(otherBounds: LatLngBounds): Boolean
	// Returns `true` if the rectangle contains the given one.

	// @alternative
	// @method contains (latlng: LatLng): Boolean
	// Returns `true` if the rectangle contains the given point.
	contains: function (obj) { // (LatLngBounds) or (LatLng) -> Boolean
		if (typeof obj[0] === 'number' || obj instanceof LatLng || 'lat' in obj) {
			obj = toLatLng(obj);
		} else {
			obj = toLatLngBounds(obj);
		}

		var sw = this._southWest,
		    ne = this._northEast,
		    sw2, ne2;

		if (obj instanceof LatLngBounds) {
			sw2 = obj.getSouthWest();
			ne2 = obj.getNorthEast();
		} else {
			sw2 = ne2 = obj;
		}

		return (sw2.lat >= sw.lat) && (ne2.lat <= ne.lat) &&
		       (sw2.lng >= sw.lng) && (ne2.lng <= ne.lng);
	},

	// @method intersects(otherBounds: LatLngBounds): Boolean
	// Returns `true` if the rectangle intersects the given bounds. Two bounds intersect if they have at least one point in common.
	intersects: function (bounds) {
		bounds = toLatLngBounds(bounds);

		var sw = this._southWest,
		    ne = this._northEast,
		    sw2 = bounds.getSouthWest(),
		    ne2 = bounds.getNorthEast(),

		    latIntersects = (ne2.lat >= sw.lat) && (sw2.lat <= ne.lat),
		    lngIntersects = (ne2.lng >= sw.lng) && (sw2.lng <= ne.lng);

		return latIntersects && lngIntersects;
	},

	// @method overlaps(otherBounds: Bounds): Boolean
	// Returns `true` if the rectangle overlaps the given bounds. Two bounds overlap if their intersection is an area.
	overlaps: function (bounds) {
		bounds = toLatLngBounds(bounds);

		var sw = this._southWest,
		    ne = this._northEast,
		    sw2 = bounds.getSouthWest(),
		    ne2 = bounds.getNorthEast(),

		    latOverlaps = (ne2.lat > sw.lat) && (sw2.lat < ne.lat),
		    lngOverlaps = (ne2.lng > sw.lng) && (sw2.lng < ne.lng);

		return latOverlaps && lngOverlaps;
	},

	// @method toBBoxString(): String
	// Returns a string with bounding box coordinates in a 'southwest_lng,southwest_lat,northeast_lng,northeast_lat' format. Useful for sending requests to web services that return geo data.
	toBBoxString: function () {
		return [this.getWest(), this.getSouth(), this.getEast(), this.getNorth()].join(',');
	},

	// @method equals(otherBounds: LatLngBounds, maxMargin?: Number): Boolean
	// Returns `true` if the rectangle is equivalent (within a small margin of error) to the given bounds. The margin of error can be overridden by setting `maxMargin` to a small number.
	equals: function (bounds, maxMargin) {
		if (!bounds) { return false; }

		bounds = toLatLngBounds(bounds);

		return this._southWest.equals(bounds.getSouthWest(), maxMargin) &&
		       this._northEast.equals(bounds.getNorthEast(), maxMargin);
	},

	// @method isValid(): Boolean
	// Returns `true` if the bounds are properly initialized.
	isValid: function () {
		return !!(this._southWest && this._northEast);
	}
};

// TODO International date line?

// @factory L.latLngBounds(corner1: LatLng, corner2: LatLng)
// Creates a `LatLngBounds` object by defining two diagonally opposite corners of the rectangle.

// @alternative
// @factory L.latLngBounds(latlngs: LatLng[])
// Creates a `LatLngBounds` object defined by the geographical points it contains. Very useful for zooming the map to fit a particular set of locations with [`fitBounds`](#map-fitbounds).
function toLatLngBounds(a, b) {
	if (a instanceof LatLngBounds) {
		return a;
	}
	return new LatLngBounds(a, b);
}

/* @class LatLng
 * @aka L.LatLng
 *
 * Represents a geographical point with a certain latitude and longitude.
 *
 * @example
 *
 * ```
 * var latlng = L.latLng(50.5, 30.5);
 * ```
 *
 * All Leaflet methods that accept LatLng objects also accept them in a simple Array form and simple object form (unless noted otherwise), so these lines are equivalent:
 *
 * ```
 * map.panTo([50, 30]);
 * map.panTo({lon: 30, lat: 50});
 * map.panTo({lat: 50, lng: 30});
 * map.panTo(L.latLng(50, 30));
 * ```
 *
 * Note that `LatLng` does not inherit from Leaflet's `Class` object,
 * which means new classes can't inherit from it, and new methods
 * can't be added to it with the `include` function.
 */

function LatLng(lat, lng, alt) {
	if (isNaN(lat) || isNaN(lng)) {
		throw new Error('Invalid LatLng object: (' + lat + ', ' + lng + ')');
	}

	// @property lat: Number
	// Latitude in degrees
	this.lat = +lat;

	// @property lng: Number
	// Longitude in degrees
	this.lng = +lng;

	// @property alt: Number
	// Altitude in meters (optional)
	if (alt !== undefined) {
		this.alt = +alt;
	}
}

LatLng.prototype = {
	// @method equals(otherLatLng: LatLng, maxMargin?: Number): Boolean
	// Returns `true` if the given `LatLng` point is at the same position (within a small margin of error). The margin of error can be overridden by setting `maxMargin` to a small number.
	equals: function (obj, maxMargin) {
		if (!obj) { return false; }

		obj = toLatLng(obj);

		var margin = Math.max(
		        Math.abs(this.lat - obj.lat),
		        Math.abs(this.lng - obj.lng));

		return margin <= (maxMargin === undefined ? 1.0E-9 : maxMargin);
	},

	// @method toString(): String
	// Returns a string representation of the point (for debugging purposes).
	toString: function (precision) {
		return 'LatLng(' +
		        formatNum(this.lat, precision) + ', ' +
		        formatNum(this.lng, precision) + ')';
	},

	// @method distanceTo(otherLatLng: LatLng): Number
	// Returns the distance (in meters) to the given `LatLng` calculated using the [Spherical Law of Cosines](https://en.wikipedia.org/wiki/Spherical_law_of_cosines).
	distanceTo: function (other) {
		return Earth.distance(this, toLatLng(other));
	},

	// @method wrap(): LatLng
	// Returns a new `LatLng` object with the longitude wrapped so it's always between -180 and +180 degrees.
	wrap: function () {
		return Earth.wrapLatLng(this);
	},

	// @method toBounds(sizeInMeters: Number): LatLngBounds
	// Returns a new `LatLngBounds` object in which each boundary is `sizeInMeters/2` meters apart from the `LatLng`.
	toBounds: function (sizeInMeters) {
		var latAccuracy = 180 * sizeInMeters / 40075017,
		    lngAccuracy = latAccuracy / Math.cos((Math.PI / 180) * this.lat);

		return toLatLngBounds(
		        [this.lat - latAccuracy, this.lng - lngAccuracy],
		        [this.lat + latAccuracy, this.lng + lngAccuracy]);
	},

	clone: function () {
		return new LatLng(this.lat, this.lng, this.alt);
	}
};



// @factory L.latLng(latitude: Number, longitude: Number, altitude?: Number): LatLng
// Creates an object representing a geographical point with the given latitude and longitude (and optionally altitude).

// @alternative
// @factory L.latLng(coords: Array): LatLng
// Expects an array of the form `[Number, Number]` or `[Number, Number, Number]` instead.

// @alternative
// @factory L.latLng(coords: Object): LatLng
// Expects an plain object of the form `{lat: Number, lng: Number}` or `{lat: Number, lng: Number, alt: Number}` instead.

function toLatLng(a, b, c) {
	if (a instanceof LatLng) {
		return a;
	}
	if (isArray(a) && typeof a[0] !== 'object') {
		if (a.length === 3) {
			return new LatLng(a[0], a[1], a[2]);
		}
		if (a.length === 2) {
			return new LatLng(a[0], a[1]);
		}
		return null;
	}
	if (a === undefined || a === null) {
		return a;
	}
	if (typeof a === 'object' && 'lat' in a) {
		return new LatLng(a.lat, 'lng' in a ? a.lng : a.lon, a.alt);
	}
	if (b === undefined) {
		return null;
	}
	return new LatLng(a, b, c);
}

/*
 * @namespace CRS
 * @crs L.CRS.Base
 * Object that defines coordinate reference systems for projecting
 * geographical points into pixel (screen) coordinates and back (and to
 * coordinates in other units for [WMS](https://en.wikipedia.org/wiki/Web_Map_Service) services). See
 * [spatial reference system](http://en.wikipedia.org/wiki/Coordinate_reference_system).
 *
 * Leaflet defines the most usual CRSs by default. If you want to use a
 * CRS not defined by default, take a look at the
 * [Proj4Leaflet](https://github.com/kartena/Proj4Leaflet) plugin.
 *
 * Note that the CRS instances do not inherit from Leafet's `Class` object,
 * and can't be instantiated. Also, new classes can't inherit from them,
 * and methods can't be added to them with the `include` function.
 */

var CRS = {
	// @method latLngToPoint(latlng: LatLng, zoom: Number): Point
	// Projects geographical coordinates into pixel coordinates for a given zoom.
	latLngToPoint: function (latlng, zoom) {
		var projectedPoint = this.projection.project(latlng),
		    scale = this.scale(zoom);

		return this.transformation._transform(projectedPoint, scale);
	},

	// @method pointToLatLng(point: Point, zoom: Number): LatLng
	// The inverse of `latLngToPoint`. Projects pixel coordinates on a given
	// zoom into geographical coordinates.
	pointToLatLng: function (point, zoom) {
		var scale = this.scale(zoom),
		    untransformedPoint = this.transformation.untransform(point, scale);

		return this.projection.unproject(untransformedPoint);
	},

	// @method project(latlng: LatLng): Point
	// Projects geographical coordinates into coordinates in units accepted for
	// this CRS (e.g. meters for EPSG:3857, for passing it to WMS services).
	project: function (latlng) {
		return this.projection.project(latlng);
	},

	// @method unproject(point: Point): LatLng
	// Given a projected coordinate returns the corresponding LatLng.
	// The inverse of `project`.
	unproject: function (point) {
		return this.projection.unproject(point);
	},

	// @method scale(zoom: Number): Number
	// Returns the scale used when transforming projected coordinates into
	// pixel coordinates for a particular zoom. For example, it returns
	// `256 * 2^zoom` for Mercator-based CRS.
	scale: function (zoom) {
		return 256 * Math.pow(2, zoom);
	},

	// @method zoom(scale: Number): Number
	// Inverse of `scale()`, returns the zoom level corresponding to a scale
	// factor of `scale`.
	zoom: function (scale) {
		return Math.log(scale / 256) / Math.LN2;
	},

	// @method getProjectedBounds(zoom: Number): Bounds
	// Returns the projection's bounds scaled and transformed for the provided `zoom`.
	getProjectedBounds: function (zoom) {
		if (this.infinite) { return null; }

		var b = this.projection.bounds,
		    s = this.scale(zoom),
		    min = this.transformation.transform(b.min, s),
		    max = this.transformation.transform(b.max, s);

		return new Bounds(min, max);
	},

	// @method distance(latlng1: LatLng, latlng2: LatLng): Number
	// Returns the distance between two geographical coordinates.

	// @property code: String
	// Standard code name of the CRS passed into WMS services (e.g. `'EPSG:3857'`)
	//
	// @property wrapLng: Number[]
	// An array of two numbers defining whether the longitude (horizontal) coordinate
	// axis wraps around a given range and how. Defaults to `[-180, 180]` in most
	// geographical CRSs. If `undefined`, the longitude axis does not wrap around.
	//
	// @property wrapLat: Number[]
	// Like `wrapLng`, but for the latitude (vertical) axis.

	// wrapLng: [min, max],
	// wrapLat: [min, max],

	// @property infinite: Boolean
	// If true, the coordinate space will be unbounded (infinite in both axes)
	infinite: false,

	// @method wrapLatLng(latlng: LatLng): LatLng
	// Returns a `LatLng` where lat and lng has been wrapped according to the
	// CRS's `wrapLat` and `wrapLng` properties, if they are outside the CRS's bounds.
	wrapLatLng: function (latlng) {
		var lng = this.wrapLng ? wrapNum(latlng.lng, this.wrapLng, true) : latlng.lng,
		    lat = this.wrapLat ? wrapNum(latlng.lat, this.wrapLat, true) : latlng.lat,
		    alt = latlng.alt;

		return new LatLng(lat, lng, alt);
	},

	// @method wrapLatLngBounds(bounds: LatLngBounds): LatLngBounds
	// Returns a `LatLngBounds` with the same size as the given one, ensuring
	// that its center is within the CRS's bounds.
	// Only accepts actual `L.LatLngBounds` instances, not arrays.
	wrapLatLngBounds: function (bounds) {
		var center = bounds.getCenter(),
		    newCenter = this.wrapLatLng(center),
		    latShift = center.lat - newCenter.lat,
		    lngShift = center.lng - newCenter.lng;

		if (latShift === 0 && lngShift === 0) {
			return bounds;
		}

		var sw = bounds.getSouthWest(),
		    ne = bounds.getNorthEast(),
		    newSw = new LatLng(sw.lat - latShift, sw.lng - lngShift),
		    newNe = new LatLng(ne.lat - latShift, ne.lng - lngShift);

		return new LatLngBounds(newSw, newNe);
	}
};

/*
 * @namespace CRS
 * @crs L.CRS.Earth
 *
 * Serves as the base for CRS that are global such that they cover the earth.
 * Can only be used as the base for other CRS and cannot be used directly,
 * since it does not have a `code`, `projection` or `transformation`. `distance()` returns
 * meters.
 */

var Earth = extend({}, CRS, {
	wrapLng: [-180, 180],

	// Mean Earth Radius, as recommended for use by
	// the International Union of Geodesy and Geophysics,
	// see http://rosettacode.org/wiki/Haversine_formula
	R: 6371000,

	// distance between two geographical points using spherical law of cosines approximation
	distance: function (latlng1, latlng2) {
		var rad = Math.PI / 180,
		    lat1 = latlng1.lat * rad,
		    lat2 = latlng2.lat * rad,
		    sinDLat = Math.sin((latlng2.lat - latlng1.lat) * rad / 2),
		    sinDLon = Math.sin((latlng2.lng - latlng1.lng) * rad / 2),
		    a = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon,
		    c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		return this.R * c;
	}
});

/*
 * @namespace Projection
 * @projection L.Projection.SphericalMercator
 *
 * Spherical Mercator projection — the most common projection for online maps,
 * used by almost all free and commercial tile providers. Assumes that Earth is
 * a sphere. Used by the `EPSG:3857` CRS.
 */

var SphericalMercator = {

	R: 6378137,
	MAX_LATITUDE: 85.0511287798,

	project: function (latlng) {
		var d = Math.PI / 180,
		    max = this.MAX_LATITUDE,
		    lat = Math.max(Math.min(max, latlng.lat), -max),
		    sin = Math.sin(lat * d);

		return new Point(
			this.R * latlng.lng * d,
			this.R * Math.log((1 + sin) / (1 - sin)) / 2);
	},

	unproject: function (point) {
		var d = 180 / Math.PI;

		return new LatLng(
			(2 * Math.atan(Math.exp(point.y / this.R)) - (Math.PI / 2)) * d,
			point.x * d / this.R);
	},

	bounds: (function () {
		var d = 6378137 * Math.PI;
		return new Bounds([-d, -d], [d, d]);
	})()
};

/*
 * @class Transformation
 * @aka L.Transformation
 *
 * Represents an affine transformation: a set of coefficients `a`, `b`, `c`, `d`
 * for transforming a point of a form `(x, y)` into `(a*x + b, c*y + d)` and doing
 * the reverse. Used by Leaflet in its projections code.
 *
 * @example
 *
 * ```js
 * var transformation = L.transformation(2, 5, -1, 10),
 * 	p = L.point(1, 2),
 * 	p2 = transformation.transform(p), //  L.point(7, 8)
 * 	p3 = transformation.untransform(p2); //  L.point(1, 2)
 * ```
 */


// factory new L.Transformation(a: Number, b: Number, c: Number, d: Number)
// Creates a `Transformation` object with the given coefficients.
function Transformation(a, b, c, d) {
	if (isArray(a)) {
		// use array properties
		this._a = a[0];
		this._b = a[1];
		this._c = a[2];
		this._d = a[3];
		return;
	}
	this._a = a;
	this._b = b;
	this._c = c;
	this._d = d;
}

Transformation.prototype = {
	// @method transform(point: Point, scale?: Number): Point
	// Returns a transformed point, optionally multiplied by the given scale.
	// Only accepts actual `L.Point` instances, not arrays.
	transform: function (point, scale) { // (Point, Number) -> Point
		return this._transform(point.clone(), scale);
	},

	// destructive transform (faster)
	_transform: function (point, scale) {
		scale = scale || 1;
		point.x = scale * (this._a * point.x + this._b);
		point.y = scale * (this._c * point.y + this._d);
		return point;
	},

	// @method untransform(point: Point, scale?: Number): Point
	// Returns the reverse transformation of the given point, optionally divided
	// by the given scale. Only accepts actual `L.Point` instances, not arrays.
	untransform: function (point, scale) {
		scale = scale || 1;
		return new Point(
		        (point.x / scale - this._b) / this._a,
		        (point.y / scale - this._d) / this._c);
	}
};

// factory L.transformation(a: Number, b: Number, c: Number, d: Number)

// @factory L.transformation(a: Number, b: Number, c: Number, d: Number)
// Instantiates a Transformation object with the given coefficients.

// @alternative
// @factory L.transformation(coefficients: Array): Transformation
// Expects an coefficients array of the form
// `[a: Number, b: Number, c: Number, d: Number]`.

function toTransformation(a, b, c, d) {
	return new Transformation(a, b, c, d);
}

/*
 * @namespace CRS
 * @crs L.CRS.EPSG3857
 *
 * The most common CRS for online maps, used by almost all free and commercial
 * tile providers. Uses Spherical Mercator projection. Set in by default in
 * Map's `crs` option.
 */

var EPSG3857 = extend({}, Earth, {
	code: 'EPSG:3857',
	projection: SphericalMercator,

	transformation: (function () {
		var scale = 0.5 / (Math.PI * SphericalMercator.R);
		return toTransformation(scale, 0.5, -scale, 0.5);
	}())
});

var EPSG900913 = extend({}, EPSG3857, {
	code: 'EPSG:900913'
});

// @namespace SVG; @section
// There are several static functions which can be called without instantiating L.SVG:

// @function create(name: String): SVGElement
// Returns a instance of [SVGElement](https://developer.mozilla.org/docs/Web/API/SVGElement),
// corresponding to the class name passed. For example, using 'line' will return
// an instance of [SVGLineElement](https://developer.mozilla.org/docs/Web/API/SVGLineElement).
function svgCreate(name) {
	return document.createElementNS('http://www.w3.org/2000/svg', name);
}

// @function pointsToPath(rings: Point[], closed: Boolean): String
// Generates a SVG path string for multiple rings, with each ring turning
// into "M..L..L.." instructions
function pointsToPath(rings, closed) {
	var str = '',
	i, j, len, len2, points, p;

	for (i = 0, len = rings.length; i < len; i++) {
		points = rings[i];

		for (j = 0, len2 = points.length; j < len2; j++) {
			p = points[j];
			str += (j ? 'L' : 'M') + p.x + ' ' + p.y;
		}

		// closes the ring for polygons; "x" is VML syntax
		str += closed ? (svg ? 'z' : 'x') : '';
	}

	// SVG complains about empty path strings
	return str || 'M0 0';
}

/*
 * @namespace Browser
 * @aka L.Browser
 *
 * A namespace with static properties for browser/feature detection used by Leaflet internally.
 *
 * @example
 *
 * ```js
 * if (L.Browser.ielt9) {
 *   alert('Upgrade your browser, dude!');
 * }
 * ```
 */

var style$1 = document.documentElement.style;

// @property ie: Boolean; `true` for all Internet Explorer versions (not Edge).
var ie = 'ActiveXObject' in window;

// @property ielt9: Boolean; `true` for Internet Explorer versions less than 9.
var ielt9 = ie && !document.addEventListener;

// @property edge: Boolean; `true` for the Edge web browser.
var edge = 'msLaunchUri' in navigator && !('documentMode' in document);

// @property webkit: Boolean;
// `true` for webkit-based browsers like Chrome and Safari (including mobile versions).
var webkit = userAgentContains('webkit');

// @property android: Boolean
// `true` for any browser running on an Android platform.
var android = userAgentContains('android');

// @property android23: Boolean; `true` for browsers running on Android 2 or Android 3.
var android23 = userAgentContains('android 2') || userAgentContains('android 3');

/* See https://stackoverflow.com/a/17961266 for details on detecting stock Android */
var webkitVer = parseInt(/WebKit\/([0-9]+)|$/.exec(navigator.userAgent)[1], 10); // also matches AppleWebKit
// @property androidStock: Boolean; `true` for the Android stock browser (i.e. not Chrome)
var androidStock = android && userAgentContains('Google') && webkitVer < 537 && !('AudioNode' in window);

// @property opera: Boolean; `true` for the Opera browser
var opera = !!window.opera;

// @property chrome: Boolean; `true` for the Chrome browser.
var chrome = userAgentContains('chrome');

// @property gecko: Boolean; `true` for gecko-based browsers like Firefox.
var gecko = userAgentContains('gecko') && !webkit && !opera && !ie;

// @property safari: Boolean; `true` for the Safari browser.
var safari = !chrome && userAgentContains('safari');

var phantom = userAgentContains('phantom');

// @property opera12: Boolean
// `true` for the Opera browser supporting CSS transforms (version 12 or later).
var opera12 = 'OTransition' in style$1;

// @property win: Boolean; `true` when the browser is running in a Windows platform
var win = navigator.platform.indexOf('Win') === 0;

// @property ie3d: Boolean; `true` for all Internet Explorer versions supporting CSS transforms.
var ie3d = ie && ('transition' in style$1);

// @property webkit3d: Boolean; `true` for webkit-based browsers supporting CSS transforms.
var webkit3d = ('WebKitCSSMatrix' in window) && ('m11' in new window.WebKitCSSMatrix()) && !android23;

// @property gecko3d: Boolean; `true` for gecko-based browsers supporting CSS transforms.
var gecko3d = 'MozPerspective' in style$1;

// @property any3d: Boolean
// `true` for all browsers supporting CSS transforms.
var any3d = !window.L_DISABLE_3D && (ie3d || webkit3d || gecko3d) && !opera12 && !phantom;

// @property mobile: Boolean; `true` for all browsers running in a mobile device.
var mobile = typeof orientation !== 'undefined' || userAgentContains('mobile');

// @property mobileWebkit: Boolean; `true` for all webkit-based browsers in a mobile device.
var mobileWebkit = mobile && webkit;

// @property mobileWebkit3d: Boolean
// `true` for all webkit-based browsers in a mobile device supporting CSS transforms.
var mobileWebkit3d = mobile && webkit3d;

// @property msPointer: Boolean
// `true` for browsers implementing the Microsoft touch events model (notably IE10).
var msPointer = !window.PointerEvent && window.MSPointerEvent;

// @property pointer: Boolean
// `true` for all browsers supporting [pointer events](https://msdn.microsoft.com/en-us/library/dn433244%28v=vs.85%29.aspx).
var pointer = !!(window.PointerEvent || msPointer);

// @property touch: Boolean
// `true` for all browsers supporting [touch events](https://developer.mozilla.org/docs/Web/API/Touch_events).
// This does not necessarily mean that the browser is running in a computer with
// a touchscreen, it only means that the browser is capable of understanding
// touch events.
var touch = !window.L_NO_TOUCH && (pointer || 'ontouchstart' in window ||
		(window.DocumentTouch && document instanceof window.DocumentTouch));

// @property mobileOpera: Boolean; `true` for the Opera browser in a mobile device.
var mobileOpera = mobile && opera;

// @property mobileGecko: Boolean
// `true` for gecko-based browsers running in a mobile device.
var mobileGecko = mobile && gecko;

// @property retina: Boolean
// `true` for browsers on a high-resolution "retina" screen or on any screen when browser's display zoom is more than 100%.
var retina = (window.devicePixelRatio || (window.screen.deviceXDPI / window.screen.logicalXDPI)) > 1;


// @property canvas: Boolean
// `true` when the browser supports [`<canvas>`](https://developer.mozilla.org/docs/Web/API/Canvas_API).
var canvas = (function () {
	return !!document.createElement('canvas').getContext;
}());

// @property svg: Boolean
// `true` when the browser supports [SVG](https://developer.mozilla.org/docs/Web/SVG).
var svg = !!(document.createElementNS && svgCreate('svg').createSVGRect);

// @property vml: Boolean
// `true` if the browser supports [VML](https://en.wikipedia.org/wiki/Vector_Markup_Language).
var vml = !svg && (function () {
	try {
		var div = document.createElement('div');
		div.innerHTML = '<v:shape adj="1"/>';

		var shape = div.firstChild;
		shape.style.behavior = 'url(#default#VML)';

		return shape && (typeof shape.adj === 'object');

	} catch (e) {
		return false;
	}
}());


function userAgentContains(str) {
	return navigator.userAgent.toLowerCase().indexOf(str) >= 0;
}


var Browser = (Object.freeze || Object)({
	ie: ie,
	ielt9: ielt9,
	edge: edge,
	webkit: webkit,
	android: android,
	android23: android23,
	androidStock: androidStock,
	opera: opera,
	chrome: chrome,
	gecko: gecko,
	safari: safari,
	phantom: phantom,
	opera12: opera12,
	win: win,
	ie3d: ie3d,
	webkit3d: webkit3d,
	gecko3d: gecko3d,
	any3d: any3d,
	mobile: mobile,
	mobileWebkit: mobileWebkit,
	mobileWebkit3d: mobileWebkit3d,
	msPointer: msPointer,
	pointer: pointer,
	touch: touch,
	mobileOpera: mobileOpera,
	mobileGecko: mobileGecko,
	retina: retina,
	canvas: canvas,
	svg: svg,
	vml: vml
});

/*
 * Extends L.DomEvent to provide touch support for Internet Explorer and Windows-based devices.
 */


var POINTER_DOWN =   msPointer ? 'MSPointerDown'   : 'pointerdown';
var POINTER_MOVE =   msPointer ? 'MSPointerMove'   : 'pointermove';
var POINTER_UP =     msPointer ? 'MSPointerUp'     : 'pointerup';
var POINTER_CANCEL = msPointer ? 'MSPointerCancel' : 'pointercancel';
var TAG_WHITE_LIST = ['INPUT', 'SELECT', 'OPTION'];

var _pointers = {};
var _pointerDocListener = false;

// DomEvent.DoubleTap needs to know about this
var _pointersCount = 0;

// Provides a touch events wrapper for (ms)pointer events.
// ref http://www.w3.org/TR/pointerevents/ https://www.w3.org/Bugs/Public/show_bug.cgi?id=22890

function addPointerListener(obj, type, handler, id) {
	if (type === 'touchstart') {
		_addPointerStart(obj, handler, id);

	} else if (type === 'touchmove') {
		_addPointerMove(obj, handler, id);

	} else if (type === 'touchend') {
		_addPointerEnd(obj, handler, id);
	}

	return this;
}

function removePointerListener(obj, type, id) {
	var handler = obj['_leaflet_' + type + id];

	if (type === 'touchstart') {
		obj.removeEventListener(POINTER_DOWN, handler, false);

	} else if (type === 'touchmove') {
		obj.removeEventListener(POINTER_MOVE, handler, false);

	} else if (type === 'touchend') {
		obj.removeEventListener(POINTER_UP, handler, false);
		obj.removeEventListener(POINTER_CANCEL, handler, false);
	}

	return this;
}

function _addPointerStart(obj, handler, id) {
	var onDown = bind(function (e) {
		if (e.pointerType !== 'mouse' && e.MSPOINTER_TYPE_MOUSE && e.pointerType !== e.MSPOINTER_TYPE_MOUSE) {
			// In IE11, some touch events needs to fire for form controls, or
			// the controls will stop working. We keep a whitelist of tag names that
			// need these events. For other target tags, we prevent default on the event.
			if (TAG_WHITE_LIST.indexOf(e.target.tagName) < 0) {
				preventDefault(e);
			} else {
				return;
			}
		}

		_handlePointer(e, handler);
	});

	obj['_leaflet_touchstart' + id] = onDown;
	obj.addEventListener(POINTER_DOWN, onDown, false);

	// need to keep track of what pointers and how many are active to provide e.touches emulation
	if (!_pointerDocListener) {
		// we listen documentElement as any drags that end by moving the touch off the screen get fired there
		document.documentElement.addEventListener(POINTER_DOWN, _globalPointerDown, true);
		document.documentElement.addEventListener(POINTER_MOVE, _globalPointerMove, true);
		document.documentElement.addEventListener(POINTER_UP, _globalPointerUp, true);
		document.documentElement.addEventListener(POINTER_CANCEL, _globalPointerUp, true);

		_pointerDocListener = true;
	}
}

function _globalPointerDown(e) {
	_pointers[e.pointerId] = e;
	_pointersCount++;
}

function _globalPointerMove(e) {
	if (_pointers[e.pointerId]) {
		_pointers[e.pointerId] = e;
	}
}

function _globalPointerUp(e) {
	delete _pointers[e.pointerId];
	_pointersCount--;
}

function _handlePointer(e, handler) {
	e.touches = [];
	for (var i in _pointers) {
		e.touches.push(_pointers[i]);
	}
	e.changedTouches = [e];

	handler(e);
}

function _addPointerMove(obj, handler, id) {
	var onMove = function (e) {
		// don't fire touch moves when mouse isn't down
		if ((e.pointerType === e.MSPOINTER_TYPE_MOUSE || e.pointerType === 'mouse') && e.buttons === 0) { return; }

		_handlePointer(e, handler);
	};

	obj['_leaflet_touchmove' + id] = onMove;
	obj.addEventListener(POINTER_MOVE, onMove, false);
}

function _addPointerEnd(obj, handler, id) {
	var onUp = function (e) {
		_handlePointer(e, handler);
	};

	obj['_leaflet_touchend' + id] = onUp;
	obj.addEventListener(POINTER_UP, onUp, false);
	obj.addEventListener(POINTER_CANCEL, onUp, false);
}

/*
 * Extends the event handling code with double tap support for mobile browsers.
 */

var _touchstart = msPointer ? 'MSPointerDown' : pointer ? 'pointerdown' : 'touchstart';
var _touchend = msPointer ? 'MSPointerUp' : pointer ? 'pointerup' : 'touchend';
var _pre = '_leaflet_';

// inspired by Zepto touch code by Thomas Fuchs
function addDoubleTapListener(obj, handler, id) {
	var last, touch$$1,
	    doubleTap = false,
	    delay = 250;

	function onTouchStart(e) {
		var count;

		if (pointer) {
			if ((!edge) || e.pointerType === 'mouse') { return; }
			count = _pointersCount;
		} else {
			count = e.touches.length;
		}

		if (count > 1) { return; }

		var now = Date.now(),
		    delta = now - (last || now);

		touch$$1 = e.touches ? e.touches[0] : e;
		doubleTap = (delta > 0 && delta <= delay);
		last = now;
	}

	function onTouchEnd(e) {
		if (doubleTap && !touch$$1.cancelBubble) {
			if (pointer) {
				if ((!edge) || e.pointerType === 'mouse') { return; }
				// work around .type being readonly with MSPointer* events
				var newTouch = {},
				    prop, i;

				for (i in touch$$1) {
					prop = touch$$1[i];
					newTouch[i] = prop && prop.bind ? prop.bind(touch$$1) : prop;
				}
				touch$$1 = newTouch;
			}
			touch$$1.type = 'dblclick';
			handler(touch$$1);
			last = null;
		}
	}

	obj[_pre + _touchstart + id] = onTouchStart;
	obj[_pre + _touchend + id] = onTouchEnd;
	obj[_pre + 'dblclick' + id] = handler;

	obj.addEventListener(_touchstart, onTouchStart, false);
	obj.addEventListener(_touchend, onTouchEnd, false);

	// On some platforms (notably, chrome<55 on win10 + touchscreen + mouse),
	// the browser doesn't fire touchend/pointerup events but does fire
	// native dblclicks. See #4127.
	// Edge 14 also fires native dblclicks, but only for pointerType mouse, see #5180.
	obj.addEventListener('dblclick', handler, false);

	return this;
}

function removeDoubleTapListener(obj, id) {
	var touchstart = obj[_pre + _touchstart + id],
	    touchend = obj[_pre + _touchend + id],
	    dblclick = obj[_pre + 'dblclick' + id];

	obj.removeEventListener(_touchstart, touchstart, false);
	obj.removeEventListener(_touchend, touchend, false);
	if (!edge) {
		obj.removeEventListener('dblclick', dblclick, false);
	}

	return this;
}

/*
 * @namespace DomUtil
 *
 * Utility functions to work with the [DOM](https://developer.mozilla.org/docs/Web/API/Document_Object_Model)
 * tree, used by Leaflet internally.
 *
 * Most functions expecting or returning a `HTMLElement` also work for
 * SVG elements. The only difference is that classes refer to CSS classes
 * in HTML and SVG classes in SVG.
 */


// @property TRANSFORM: String
// Vendor-prefixed transform style name (e.g. `'webkitTransform'` for WebKit).
var TRANSFORM = testProp(
	['transform', 'webkitTransform', 'OTransform', 'MozTransform', 'msTransform']);

// webkitTransition comes first because some browser versions that drop vendor prefix don't do
// the same for the transitionend event, in particular the Android 4.1 stock browser

// @property TRANSITION: String
// Vendor-prefixed transition style name.
var TRANSITION = testProp(
	['webkitTransition', 'transition', 'OTransition', 'MozTransition', 'msTransition']);

// @property TRANSITION_END: String
// Vendor-prefixed transitionend event name.
var TRANSITION_END =
	TRANSITION === 'webkitTransition' || TRANSITION === 'OTransition' ? TRANSITION + 'End' : 'transitionend';


// @function get(id: String|HTMLElement): HTMLElement
// Returns an element given its DOM id, or returns the element itself
// if it was passed directly.
function get(id) {
	return typeof id === 'string' ? document.getElementById(id) : id;
}

// @function getStyle(el: HTMLElement, styleAttrib: String): String
// Returns the value for a certain style attribute on an element,
// including computed values or values set through CSS.
function getStyle(el, style) {
	var value = el.style[style] || (el.currentStyle && el.currentStyle[style]);

	if ((!value || value === 'auto') && document.defaultView) {
		var css = document.defaultView.getComputedStyle(el, null);
		value = css ? css[style] : null;
	}
	return value === 'auto' ? null : value;
}

// @function create(tagName: String, className?: String, container?: HTMLElement): HTMLElement
// Creates an HTML element with `tagName`, sets its class to `className`, and optionally appends it to `container` element.
function create$1(tagName, className, container) {
	var el = document.createElement(tagName);
	el.className = className || '';

	if (container) {
		container.appendChild(el);
	}
	return el;
}

// @function remove(el: HTMLElement)
// Removes `el` from its parent element
function remove(el) {
	var parent = el.parentNode;
	if (parent) {
		parent.removeChild(el);
	}
}

// @function empty(el: HTMLElement)
// Removes all of `el`'s children elements from `el`
function empty(el) {
	while (el.firstChild) {
		el.removeChild(el.firstChild);
	}
}

// @function toFront(el: HTMLElement)
// Makes `el` the last child of its parent, so it renders in front of the other children.
function toFront(el) {
	var parent = el.parentNode;
	if (parent.lastChild !== el) {
		parent.appendChild(el);
	}
}

// @function toBack(el: HTMLElement)
// Makes `el` the first child of its parent, so it renders behind the other children.
function toBack(el) {
	var parent = el.parentNode;
	if (parent.firstChild !== el) {
		parent.insertBefore(el, parent.firstChild);
	}
}

// @function hasClass(el: HTMLElement, name: String): Boolean
// Returns `true` if the element's class attribute contains `name`.
function hasClass(el, name) {
	if (el.classList !== undefined) {
		return el.classList.contains(name);
	}
	var className = getClass(el);
	return className.length > 0 && new RegExp('(^|\\s)' + name + '(\\s|$)').test(className);
}

// @function addClass(el: HTMLElement, name: String)
// Adds `name` to the element's class attribute.
function addClass(el, name) {
	if (el.classList !== undefined) {
		var classes = splitWords(name);
		for (var i = 0, len = classes.length; i < len; i++) {
			el.classList.add(classes[i]);
		}
	} else if (!hasClass(el, name)) {
		var className = getClass(el);
		setClass(el, (className ? className + ' ' : '') + name);
	}
}

// @function removeClass(el: HTMLElement, name: String)
// Removes `name` from the element's class attribute.
function removeClass(el, name) {
	if (el.classList !== undefined) {
		el.classList.remove(name);
	} else {
		setClass(el, trim((' ' + getClass(el) + ' ').replace(' ' + name + ' ', ' ')));
	}
}

// @function setClass(el: HTMLElement, name: String)
// Sets the element's class.
function setClass(el, name) {
	if (el.className.baseVal === undefined) {
		el.className = name;
	} else {
		// in case of SVG element
		el.className.baseVal = name;
	}
}

// @function getClass(el: HTMLElement): String
// Returns the element's class.
function getClass(el) {
	return el.className.baseVal === undefined ? el.className : el.className.baseVal;
}

// @function setOpacity(el: HTMLElement, opacity: Number)
// Set the opacity of an element (including old IE support).
// `opacity` must be a number from `0` to `1`.
function setOpacity(el, value) {
	if ('opacity' in el.style) {
		el.style.opacity = value;
	} else if ('filter' in el.style) {
		_setOpacityIE(el, value);
	}
}

function _setOpacityIE(el, value) {
	var filter = false,
	    filterName = 'DXImageTransform.Microsoft.Alpha';

	// filters collection throws an error if we try to retrieve a filter that doesn't exist
	try {
		filter = el.filters.item(filterName);
	} catch (e) {
		// don't set opacity to 1 if we haven't already set an opacity,
		// it isn't needed and breaks transparent pngs.
		if (value === 1) { return; }
	}

	value = Math.round(value * 100);

	if (filter) {
		filter.Enabled = (value !== 100);
		filter.Opacity = value;
	} else {
		el.style.filter += ' progid:' + filterName + '(opacity=' + value + ')';
	}
}

// @function testProp(props: String[]): String|false
// Goes through the array of style names and returns the first name
// that is a valid style name for an element. If no such name is found,
// it returns false. Useful for vendor-prefixed styles like `transform`.
function testProp(props) {
	var style = document.documentElement.style;

	for (var i = 0; i < props.length; i++) {
		if (props[i] in style) {
			return props[i];
		}
	}
	return false;
}

// @function setTransform(el: HTMLElement, offset: Point, scale?: Number)
// Resets the 3D CSS transform of `el` so it is translated by `offset` pixels
// and optionally scaled by `scale`. Does not have an effect if the
// browser doesn't support 3D CSS transforms.
function setTransform(el, offset, scale) {
	var pos = offset || new Point(0, 0);

	el.style[TRANSFORM] =
		(ie3d ?
			'translate(' + pos.x + 'px,' + pos.y + 'px)' :
			'translate3d(' + pos.x + 'px,' + pos.y + 'px,0)') +
		(scale ? ' scale(' + scale + ')' : '');
}

// @function setPosition(el: HTMLElement, position: Point)
// Sets the position of `el` to coordinates specified by `position`,
// using CSS translate or top/left positioning depending on the browser
// (used by Leaflet internally to position its layers).
function setPosition(el, point) {

	/*eslint-disable */
	el._leaflet_pos = point;
	/* eslint-enable */

	if (any3d) {
		setTransform(el, point);
	} else {
		el.style.left = point.x + 'px';
		el.style.top = point.y + 'px';
	}
}

// @function getPosition(el: HTMLElement): Point
// Returns the coordinates of an element previously positioned with setPosition.
function getPosition(el) {
	// this method is only used for elements previously positioned using setPosition,
	// so it's safe to cache the position for performance

	return el._leaflet_pos || new Point(0, 0);
}

// @function disableTextSelection()
// Prevents the user from generating `selectstart` DOM events, usually generated
// when the user drags the mouse through a page with text. Used internally
// by Leaflet to override the behaviour of any click-and-drag interaction on
// the map. Affects drag interactions on the whole document.

// @function enableTextSelection()
// Cancels the effects of a previous [`L.DomUtil.disableTextSelection`](#domutil-disabletextselection).
var disableTextSelection;
var enableTextSelection;
var _userSelect;
if ('onselectstart' in document) {
	disableTextSelection = function () {
		on(window, 'selectstart', preventDefault);
	};
	enableTextSelection = function () {
		off(window, 'selectstart', preventDefault);
	};
} else {
	var userSelectProperty = testProp(
		['userSelect', 'WebkitUserSelect', 'OUserSelect', 'MozUserSelect', 'msUserSelect']);

	disableTextSelection = function () {
		if (userSelectProperty) {
			var style = document.documentElement.style;
			_userSelect = style[userSelectProperty];
			style[userSelectProperty] = 'none';
		}
	};
	enableTextSelection = function () {
		if (userSelectProperty) {
			document.documentElement.style[userSelectProperty] = _userSelect;
			_userSelect = undefined;
		}
	};
}

// @function disableImageDrag()
// As [`L.DomUtil.disableTextSelection`](#domutil-disabletextselection), but
// for `dragstart` DOM events, usually generated when the user drags an image.
function disableImageDrag() {
	on(window, 'dragstart', preventDefault);
}

// @function enableImageDrag()
// Cancels the effects of a previous [`L.DomUtil.disableImageDrag`](#domutil-disabletextselection).
function enableImageDrag() {
	off(window, 'dragstart', preventDefault);
}

var _outlineElement;
var _outlineStyle;
// @function preventOutline(el: HTMLElement)
// Makes the [outline](https://developer.mozilla.org/docs/Web/CSS/outline)
// of the element `el` invisible. Used internally by Leaflet to prevent
// focusable elements from displaying an outline when the user performs a
// drag interaction on them.
function preventOutline(element) {
	while (element.tabIndex === -1) {
		element = element.parentNode;
	}
	if (!element.style) { return; }
	restoreOutline();
	_outlineElement = element;
	_outlineStyle = element.style.outline;
	element.style.outline = 'none';
	on(window, 'keydown', restoreOutline);
}

// @function restoreOutline()
// Cancels the effects of a previous [`L.DomUtil.preventOutline`]().
function restoreOutline() {
	if (!_outlineElement) { return; }
	_outlineElement.style.outline = _outlineStyle;
	_outlineElement = undefined;
	_outlineStyle = undefined;
	off(window, 'keydown', restoreOutline);
}

// @function getSizedParentNode(el: HTMLElement): HTMLElement
// Finds the closest parent node which size (width and height) is not null.
function getSizedParentNode(element) {
	do {
		element = element.parentNode;
	} while ((!element.offsetWidth || !element.offsetHeight) && element !== document.body);
	return element;
}

// @function getScale(el: HTMLElement): Object
// Computes the CSS scale currently applied on the element.
// Returns an object with `x` and `y` members as horizontal and vertical scales respectively,
// and `boundingClientRect` as the result of [`getBoundingClientRect()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect).
function getScale(element) {
	var rect = element.getBoundingClientRect(); // Read-only in old browsers.

	return {
		x: rect.width / element.offsetWidth || 1,
		y: rect.height / element.offsetHeight || 1,
		boundingClientRect: rect
	};
}


var DomUtil = (Object.freeze || Object)({
	TRANSFORM: TRANSFORM,
	TRANSITION: TRANSITION,
	TRANSITION_END: TRANSITION_END,
	get: get,
	getStyle: getStyle,
	create: create$1,
	remove: remove,
	empty: empty,
	toFront: toFront,
	toBack: toBack,
	hasClass: hasClass,
	addClass: addClass,
	removeClass: removeClass,
	setClass: setClass,
	getClass: getClass,
	setOpacity: setOpacity,
	testProp: testProp,
	setTransform: setTransform,
	setPosition: setPosition,
	getPosition: getPosition,
	disableTextSelection: disableTextSelection,
	enableTextSelection: enableTextSelection,
	disableImageDrag: disableImageDrag,
	enableImageDrag: enableImageDrag,
	preventOutline: preventOutline,
	restoreOutline: restoreOutline,
	getSizedParentNode: getSizedParentNode,
	getScale: getScale
});

/*
 * @namespace DomEvent
 * Utility functions to work with the [DOM events](https://developer.mozilla.org/docs/Web/API/Event), used by Leaflet internally.
 */

// Inspired by John Resig, Dean Edwards and YUI addEvent implementations.

// @function on(el: HTMLElement, types: String, fn: Function, context?: Object): this
// Adds a listener function (`fn`) to a particular DOM event type of the
// element `el`. You can optionally specify the context of the listener
// (object the `this` keyword will point to). You can also pass several
// space-separated types (e.g. `'click dblclick'`).

// @alternative
// @function on(el: HTMLElement, eventMap: Object, context?: Object): this
// Adds a set of type/listener pairs, e.g. `{click: onClick, mousemove: onMouseMove}`
function on(obj, types, fn, context) {

	if (typeof types === 'object') {
		for (var type in types) {
			addOne(obj, type, types[type], fn);
		}
	} else {
		types = splitWords(types);

		for (var i = 0, len = types.length; i < len; i++) {
			addOne(obj, types[i], fn, context);
		}
	}

	return this;
}

var eventsKey = '_leaflet_events';

// @function off(el: HTMLElement, types: String, fn: Function, context?: Object): this
// Removes a previously added listener function.
// Note that if you passed a custom context to on, you must pass the same
// context to `off` in order to remove the listener.

// @alternative
// @function off(el: HTMLElement, eventMap: Object, context?: Object): this
// Removes a set of type/listener pairs, e.g. `{click: onClick, mousemove: onMouseMove}`
function off(obj, types, fn, context) {

	if (typeof types === 'object') {
		for (var type in types) {
			removeOne(obj, type, types[type], fn);
		}
	} else if (types) {
		types = splitWords(types);

		for (var i = 0, len = types.length; i < len; i++) {
			removeOne(obj, types[i], fn, context);
		}
	} else {
		for (var j in obj[eventsKey]) {
			removeOne(obj, j, obj[eventsKey][j]);
		}
		delete obj[eventsKey];
	}

	return this;
}

function addOne(obj, type, fn, context) {
	var id = type + stamp(fn) + (context ? '_' + stamp(context) : '');

	if (obj[eventsKey] && obj[eventsKey][id]) { return this; }

	var handler = function (e) {
		return fn.call(context || obj, e || window.event);
	};

	var originalHandler = handler;

	if (pointer && type.indexOf('touch') === 0) {
		// Needs DomEvent.Pointer.js
		addPointerListener(obj, type, handler, id);

	} else if (touch && (type === 'dblclick') && addDoubleTapListener &&
	           !(pointer && chrome)) {
		// Chrome >55 does not need the synthetic dblclicks from addDoubleTapListener
		// See #5180
		addDoubleTapListener(obj, handler, id);

	} else if ('addEventListener' in obj) {

		if (type === 'mousewheel') {
			obj.addEventListener('onwheel' in obj ? 'wheel' : 'mousewheel', handler, false);

		} else if ((type === 'mouseenter') || (type === 'mouseleave')) {
			handler = function (e) {
				e = e || window.event;
				if (isExternalTarget(obj, e)) {
					originalHandler(e);
				}
			};
			obj.addEventListener(type === 'mouseenter' ? 'mouseover' : 'mouseout', handler, false);

		} else {
			if (type === 'click' && android) {
				handler = function (e) {
					filterClick(e, originalHandler);
				};
			}
			obj.addEventListener(type, handler, false);
		}

	} else if ('attachEvent' in obj) {
		obj.attachEvent('on' + type, handler);
	}

	obj[eventsKey] = obj[eventsKey] || {};
	obj[eventsKey][id] = handler;
}

function removeOne(obj, type, fn, context) {

	var id = type + stamp(fn) + (context ? '_' + stamp(context) : ''),
	    handler = obj[eventsKey] && obj[eventsKey][id];

	if (!handler) { return this; }

	if (pointer && type.indexOf('touch') === 0) {
		removePointerListener(obj, type, id);

	} else if (touch && (type === 'dblclick') && removeDoubleTapListener &&
	           !(pointer && chrome)) {
		removeDoubleTapListener(obj, id);

	} else if ('removeEventListener' in obj) {

		if (type === 'mousewheel') {
			obj.removeEventListener('onwheel' in obj ? 'wheel' : 'mousewheel', handler, false);

		} else {
			obj.removeEventListener(
				type === 'mouseenter' ? 'mouseover' :
				type === 'mouseleave' ? 'mouseout' : type, handler, false);
		}

	} else if ('detachEvent' in obj) {
		obj.detachEvent('on' + type, handler);
	}

	obj[eventsKey][id] = null;
}

// @function stopPropagation(ev: DOMEvent): this
// Stop the given event from propagation to parent elements. Used inside the listener functions:
// ```js
// L.DomEvent.on(div, 'click', function (ev) {
// 	L.DomEvent.stopPropagation(ev);
// });
// ```
function stopPropagation(e) {

	if (e.stopPropagation) {
		e.stopPropagation();
	} else if (e.originalEvent) {  // In case of Leaflet event.
		e.originalEvent._stopped = true;
	} else {
		e.cancelBubble = true;
	}
	skipped(e);

	return this;
}

// @function disableScrollPropagation(el: HTMLElement): this
// Adds `stopPropagation` to the element's `'mousewheel'` events (plus browser variants).
function disableScrollPropagation(el) {
	addOne(el, 'mousewheel', stopPropagation);
	return this;
}

// @function disableClickPropagation(el: HTMLElement): this
// Adds `stopPropagation` to the element's `'click'`, `'doubleclick'`,
// `'mousedown'` and `'touchstart'` events (plus browser variants).
function disableClickPropagation(el) {
	on(el, 'mousedown touchstart dblclick', stopPropagation);
	addOne(el, 'click', fakeStop);
	return this;
}

// @function preventDefault(ev: DOMEvent): this
// Prevents the default action of the DOM Event `ev` from happening (such as
// following a link in the href of the a element, or doing a POST request
// with page reload when a `<form>` is submitted).
// Use it inside listener functions.
function preventDefault(e) {
	if (e.preventDefault) {
		e.preventDefault();
	} else {
		e.returnValue = false;
	}
	return this;
}

// @function stop(ev: DOMEvent): this
// Does `stopPropagation` and `preventDefault` at the same time.
function stop(e) {
	preventDefault(e);
	stopPropagation(e);
	return this;
}

// @function getMousePosition(ev: DOMEvent, container?: HTMLElement): Point
// Gets normalized mouse position from a DOM event relative to the
// `container` (border excluded) or to the whole page if not specified.
function getMousePosition(e, container) {
	if (!container) {
		return new Point(e.clientX, e.clientY);
	}

	var scale = getScale(container),
	    offset = scale.boundingClientRect; // left and top  values are in page scale (like the event clientX/Y)

	return new Point(
		// offset.left/top values are in page scale (like clientX/Y),
		// whereas clientLeft/Top (border width) values are the original values (before CSS scale applies).
		(e.clientX - offset.left) / scale.x - container.clientLeft,
		(e.clientY - offset.top) / scale.y - container.clientTop
	);
}

// Chrome on Win scrolls double the pixels as in other platforms (see #4538),
// and Firefox scrolls device pixels, not CSS pixels
var wheelPxFactor =
	(win && chrome) ? 2 * window.devicePixelRatio :
	gecko ? window.devicePixelRatio : 1;

// @function getWheelDelta(ev: DOMEvent): Number
// Gets normalized wheel delta from a mousewheel DOM event, in vertical
// pixels scrolled (negative if scrolling down).
// Events from pointing devices without precise scrolling are mapped to
// a best guess of 60 pixels.
function getWheelDelta(e) {
	return (edge) ? e.wheelDeltaY / 2 : // Don't trust window-geometry-based delta
	       (e.deltaY && e.deltaMode === 0) ? -e.deltaY / wheelPxFactor : // Pixels
	       (e.deltaY && e.deltaMode === 1) ? -e.deltaY * 20 : // Lines
	       (e.deltaY && e.deltaMode === 2) ? -e.deltaY * 60 : // Pages
	       (e.deltaX || e.deltaZ) ? 0 :	// Skip horizontal/depth wheel events
	       e.wheelDelta ? (e.wheelDeltaY || e.wheelDelta) / 2 : // Legacy IE pixels
	       (e.detail && Math.abs(e.detail) < 32765) ? -e.detail * 20 : // Legacy Moz lines
	       e.detail ? e.detail / -32765 * 60 : // Legacy Moz pages
	       0;
}

var skipEvents = {};

function fakeStop(e) {
	// fakes stopPropagation by setting a special event flag, checked/reset with skipped(e)
	skipEvents[e.type] = true;
}

function skipped(e) {
	var events = skipEvents[e.type];
	// reset when checking, as it's only used in map container and propagates outside of the map
	skipEvents[e.type] = false;
	return events;
}

// check if element really left/entered the event target (for mouseenter/mouseleave)
function isExternalTarget(el, e) {

	var related = e.relatedTarget;

	if (!related) { return true; }

	try {
		while (related && (related !== el)) {
			related = related.parentNode;
		}
	} catch (err) {
		return false;
	}
	return (related !== el);
}

var lastClick;

// this is a horrible workaround for a bug in Android where a single touch triggers two click events
function filterClick(e, handler) {
	var timeStamp = (e.timeStamp || (e.originalEvent && e.originalEvent.timeStamp)),
	    elapsed = lastClick && (timeStamp - lastClick);

	// are they closer together than 500ms yet more than 100ms?
	// Android typically triggers them ~300ms apart while multiple listeners
	// on the same event should be triggered far faster;
	// or check if click is simulated on the element, and if it is, reject any non-simulated events

	if ((elapsed && elapsed > 100 && elapsed < 500) || (e.target._simulatedClick && !e._simulated)) {
		stop(e);
		return;
	}
	lastClick = timeStamp;

	handler(e);
}




var DomEvent = (Object.freeze || Object)({
	on: on,
	off: off,
	stopPropagation: stopPropagation,
	disableScrollPropagation: disableScrollPropagation,
	disableClickPropagation: disableClickPropagation,
	preventDefault: preventDefault,
	stop: stop,
	getMousePosition: getMousePosition,
	getWheelDelta: getWheelDelta,
	fakeStop: fakeStop,
	skipped: skipped,
	isExternalTarget: isExternalTarget,
	addListener: on,
	removeListener: off
});

/*
 * @class PosAnimation
 * @aka L.PosAnimation
 * @inherits Evented
 * Used internally for panning animations, utilizing CSS3 Transitions for modern browsers and a timer fallback for IE6-9.
 *
 * @example
 * ```js
 * var fx = new L.PosAnimation();
 * fx.run(el, [300, 500], 0.5);
 * ```
 *
 * @constructor L.PosAnimation()
 * Creates a `PosAnimation` object.
 *
 */

var PosAnimation = Evented.extend({

	// @method run(el: HTMLElement, newPos: Point, duration?: Number, easeLinearity?: Number)
	// Run an animation of a given element to a new position, optionally setting
	// duration in seconds (`0.25` by default) and easing linearity factor (3rd
	// argument of the [cubic bezier curve](http://cubic-bezier.com/#0,0,.5,1),
	// `0.5` by default).
	run: function (el, newPos, duration, easeLinearity) {
		this.stop();

		this._el = el;
		this._inProgress = true;
		this._duration = duration || 0.25;
		this._easeOutPower = 1 / Math.max(easeLinearity || 0.5, 0.2);

		this._startPos = getPosition(el);
		this._offset = newPos.subtract(this._startPos);
		this._startTime = +new Date();

		// @event start: Event
		// Fired when the animation starts
		this.fire('start');

		this._animate();
	},

	// @method stop()
	// Stops the animation (if currently running).
	stop: function () {
		if (!this._inProgress) { return; }

		this._step(true);
		this._complete();
	},

	_animate: function () {
		// animation loop
		this._animId = requestAnimFrame(this._animate, this);
		this._step();
	},

	_step: function (round) {
		var elapsed = (+new Date()) - this._startTime,
		    duration = this._duration * 1000;

		if (elapsed < duration) {
			this._runFrame(this._easeOut(elapsed / duration), round);
		} else {
			this._runFrame(1);
			this._complete();
		}
	},

	_runFrame: function (progress, round) {
		var pos = this._startPos.add(this._offset.multiplyBy(progress));
		if (round) {
			pos._round();
		}
		setPosition(this._el, pos);

		// @event step: Event
		// Fired continuously during the animation.
		this.fire('step');
	},

	_complete: function () {
		cancelAnimFrame(this._animId);

		this._inProgress = false;
		// @event end: Event
		// Fired when the animation ends.
		this.fire('end');
	},

	_easeOut: function (t) {
		return 1 - Math.pow(1 - t, this._easeOutPower);
	}
});

/*
 * @class Map
 * @aka L.Map
 * @inherits Evented
 *
 * The central class of the API — it is used to create a map on a page and manipulate it.
 *
 * @example
 *
 * ```js
 * // initialize the map on the "map" div with a given center and zoom
 * var map = L.map('map', {
 * 	center: [51.505, -0.09],
 * 	zoom: 13
 * });
 * ```
 *
 */

var Map = Evented.extend({

	options: {
		// @section Map State Options
		// @option crs: CRS = L.CRS.EPSG3857
		// The [Coordinate Reference System](#crs) to use. Don't change this if you're not
		// sure what it means.
		crs: EPSG3857,

		// @option center: LatLng = undefined
		// Initial geographic center of the map
		center: undefined,

		// @option zoom: Number = undefined
		// Initial map zoom level
		zoom: undefined,

		// @option minZoom: Number = *
		// Minimum zoom level of the map.
		// If not specified and at least one `GridLayer` or `TileLayer` is in the map,
		// the lowest of their `minZoom` options will be used instead.
		minZoom: undefined,

		// @option maxZoom: Number = *
		// Maximum zoom level of the map.
		// If not specified and at least one `GridLayer` or `TileLayer` is in the map,
		// the highest of their `maxZoom` options will be used instead.
		maxZoom: undefined,

		// @option layers: Layer[] = []
		// Array of layers that will be added to the map initially
		layers: [],

		// @option maxBounds: LatLngBounds = null
		// When this option is set, the map restricts the view to the given
		// geographical bounds, bouncing the user back if the user tries to pan
		// outside the view. To set the restriction dynamically, use
		// [`setMaxBounds`](#map-setmaxbounds) method.
		maxBounds: undefined,

		// @option renderer: Renderer = *
		// The default method for drawing vector layers on the map. `L.SVG`
		// or `L.Canvas` by default depending on browser support.
		renderer: undefined,


		// @section Animation Options
		// @option zoomAnimation: Boolean = true
		// Whether the map zoom animation is enabled. By default it's enabled
		// in all browsers that support CSS3 Transitions except Android.
		zoomAnimation: true,

		// @option zoomAnimationThreshold: Number = 4
		// Won't animate zoom if the zoom difference exceeds this value.
		zoomAnimationThreshold: 4,

		// @option fadeAnimation: Boolean = true
		// Whether the tile fade animation is enabled. By default it's enabled
		// in all browsers that support CSS3 Transitions except Android.
		fadeAnimation: true,

		// @option markerZoomAnimation: Boolean = true
		// Whether markers animate their zoom with the zoom animation, if disabled
		// they will disappear for the length of the animation. By default it's
		// enabled in all browsers that support CSS3 Transitions except Android.
		markerZoomAnimation: true,

		// @option transform3DLimit: Number = 2^23
		// Defines the maximum size of a CSS translation transform. The default
		// value should not be changed unless a web browser positions layers in
		// the wrong place after doing a large `panBy`.
		transform3DLimit: 8388608, // Precision limit of a 32-bit float

		// @section Interaction Options
		// @option zoomSnap: Number = 1
		// Forces the map's zoom level to always be a multiple of this, particularly
		// right after a [`fitBounds()`](#map-fitbounds) or a pinch-zoom.
		// By default, the zoom level snaps to the nearest integer; lower values
		// (e.g. `0.5` or `0.1`) allow for greater granularity. A value of `0`
		// means the zoom level will not be snapped after `fitBounds` or a pinch-zoom.
		zoomSnap: 1,

		// @option zoomDelta: Number = 1
		// Controls how much the map's zoom level will change after a
		// [`zoomIn()`](#map-zoomin), [`zoomOut()`](#map-zoomout), pressing `+`
		// or `-` on the keyboard, or using the [zoom controls](#control-zoom).
		// Values smaller than `1` (e.g. `0.5`) allow for greater granularity.
		zoomDelta: 1,

		// @option trackResize: Boolean = true
		// Whether the map automatically handles browser window resize to update itself.
		trackResize: true
	},

	initialize: function (id, options) { // (HTMLElement or String, Object)
		options = setOptions(this, options);

		this._initContainer(id);
		this._initLayout();

		// hack for https://github.com/Leaflet/Leaflet/issues/1980
		this._onResize = bind(this._onResize, this);

		this._initEvents();

		if (options.maxBounds) {
			this.setMaxBounds(options.maxBounds);
		}

		if (options.zoom !== undefined) {
			this._zoom = this._limitZoom(options.zoom);
		}

		if (options.center && options.zoom !== undefined) {
			this.setView(toLatLng(options.center), options.zoom, {reset: true});
		}

		this._handlers = [];
		this._layers = {};
		this._zoomBoundLayers = {};
		this._sizeChanged = true;

		this.callInitHooks();

		// don't animate on browsers without hardware-accelerated transitions or old Android/Opera
		this._zoomAnimated = TRANSITION && any3d && !mobileOpera &&
				this.options.zoomAnimation;

		// zoom transitions run with the same duration for all layers, so if one of transitionend events
		// happens after starting zoom animation (propagating to the map pane), we know that it ended globally
		if (this._zoomAnimated) {
			this._createAnimProxy();
			on(this._proxy, TRANSITION_END, this._catchTransitionEnd, this);
		}

		this._addLayers(this.options.layers);
	},


	// @section Methods for modifying map state

	// @method setView(center: LatLng, zoom: Number, options?: Zoom/pan options): this
	// Sets the view of the map (geographical center and zoom) with the given
	// animation options.
	setView: function (center, zoom, options) {

		zoom = zoom === undefined ? this._zoom : this._limitZoom(zoom);
		center = this._limitCenter(toLatLng(center), zoom, this.options.maxBounds);
		options = options || {};

		this._stop();

		if (this._loaded && !options.reset && options !== true) {

			if (options.animate !== undefined) {
				options.zoom = extend({animate: options.animate}, options.zoom);
				options.pan = extend({animate: options.animate, duration: options.duration}, options.pan);
			}

			// try animating pan or zoom
			var moved = (this._zoom !== zoom) ?
				this._tryAnimatedZoom && this._tryAnimatedZoom(center, zoom, options.zoom) :
				this._tryAnimatedPan(center, options.pan);

			if (moved) {
				// prevent resize handler call, the view will refresh after animation anyway
				clearTimeout(this._sizeTimer);
				return this;
			}
		}

		// animation didn't start, just reset the map view
		this._resetView(center, zoom);

		return this;
	},

	// @method setZoom(zoom: Number, options?: Zoom/pan options): this
	// Sets the zoom of the map.
	setZoom: function (zoom, options) {
		if (!this._loaded) {
			this._zoom = zoom;
			return this;
		}
		return this.setView(this.getCenter(), zoom, {zoom: options});
	},

	// @method zoomIn(delta?: Number, options?: Zoom options): this
	// Increases the zoom of the map by `delta` ([`zoomDelta`](#map-zoomdelta) by default).
	zoomIn: function (delta, options) {
		delta = delta || (any3d ? this.options.zoomDelta : 1);
		return this.setZoom(this._zoom + delta, options);
	},

	// @method zoomOut(delta?: Number, options?: Zoom options): this
	// Decreases the zoom of the map by `delta` ([`zoomDelta`](#map-zoomdelta) by default).
	zoomOut: function (delta, options) {
		delta = delta || (any3d ? this.options.zoomDelta : 1);
		return this.setZoom(this._zoom - delta, options);
	},

	// @method setZoomAround(latlng: LatLng, zoom: Number, options: Zoom options): this
	// Zooms the map while keeping a specified geographical point on the map
	// stationary (e.g. used internally for scroll zoom and double-click zoom).
	// @alternative
	// @method setZoomAround(offset: Point, zoom: Number, options: Zoom options): this
	// Zooms the map while keeping a specified pixel on the map (relative to the top-left corner) stationary.
	setZoomAround: function (latlng, zoom, options) {
		var scale = this.getZoomScale(zoom),
		    viewHalf = this.getSize().divideBy(2),
		    containerPoint = latlng instanceof Point ? latlng : this.latLngToContainerPoint(latlng),

		    centerOffset = containerPoint.subtract(viewHalf).multiplyBy(1 - 1 / scale),
		    newCenter = this.containerPointToLatLng(viewHalf.add(centerOffset));

		return this.setView(newCenter, zoom, {zoom: options});
	},

	_getBoundsCenterZoom: function (bounds, options) {

		options = options || {};
		bounds = bounds.getBounds ? bounds.getBounds() : toLatLngBounds(bounds);

		var paddingTL = toPoint(options.paddingTopLeft || options.padding || [0, 0]),
		    paddingBR = toPoint(options.paddingBottomRight || options.padding || [0, 0]),

		    zoom = this.getBoundsZoom(bounds, false, paddingTL.add(paddingBR));

		zoom = (typeof options.maxZoom === 'number') ? Math.min(options.maxZoom, zoom) : zoom;

		if (zoom === Infinity) {
			return {
				center: bounds.getCenter(),
				zoom: zoom
			};
		}

		var paddingOffset = paddingBR.subtract(paddingTL).divideBy(2),

		    swPoint = this.project(bounds.getSouthWest(), zoom),
		    nePoint = this.project(bounds.getNorthEast(), zoom),
		    center = this.unproject(swPoint.add(nePoint).divideBy(2).add(paddingOffset), zoom);

		return {
			center: center,
			zoom: zoom
		};
	},

	// @method fitBounds(bounds: LatLngBounds, options?: fitBounds options): this
	// Sets a map view that contains the given geographical bounds with the
	// maximum zoom level possible.
	fitBounds: function (bounds, options) {

		bounds = toLatLngBounds(bounds);

		if (!bounds.isValid()) {
			throw new Error('Bounds are not valid.');
		}

		var target = this._getBoundsCenterZoom(bounds, options);
		return this.setView(target.center, target.zoom, options);
	},

	// @method fitWorld(options?: fitBounds options): this
	// Sets a map view that mostly contains the whole world with the maximum
	// zoom level possible.
	fitWorld: function (options) {
		return this.fitBounds([[-90, -180], [90, 180]], options);
	},

	// @method panTo(latlng: LatLng, options?: Pan options): this
	// Pans the map to a given center.
	panTo: function (center, options) { // (LatLng)
		return this.setView(center, this._zoom, {pan: options});
	},

	// @method panBy(offset: Point, options?: Pan options): this
	// Pans the map by a given number of pixels (animated).
	panBy: function (offset, options) {
		offset = toPoint(offset).round();
		options = options || {};

		if (!offset.x && !offset.y) {
			return this.fire('moveend');
		}
		// If we pan too far, Chrome gets issues with tiles
		// and makes them disappear or appear in the wrong place (slightly offset) #2602
		if (options.animate !== true && !this.getSize().contains(offset)) {
			this._resetView(this.unproject(this.project(this.getCenter()).add(offset)), this.getZoom());
			return this;
		}

		if (!this._panAnim) {
			this._panAnim = new PosAnimation();

			this._panAnim.on({
				'step': this._onPanTransitionStep,
				'end': this._onPanTransitionEnd
			}, this);
		}

		// don't fire movestart if animating inertia
		if (!options.noMoveStart) {
			this.fire('movestart');
		}

		// animate pan unless animate: false specified
		if (options.animate !== false) {
			addClass(this._mapPane, 'leaflet-pan-anim');

			var newPos = this._getMapPanePos().subtract(offset).round();
			this._panAnim.run(this._mapPane, newPos, options.duration || 0.25, options.easeLinearity);
		} else {
			this._rawPanBy(offset);
			this.fire('move').fire('moveend');
		}

		return this;
	},

	// @method flyTo(latlng: LatLng, zoom?: Number, options?: Zoom/pan options): this
	// Sets the view of the map (geographical center and zoom) performing a smooth
	// pan-zoom animation.
	flyTo: function (targetCenter, targetZoom, options) {

		options = options || {};
		if (options.animate === false || !any3d) {
			return this.setView(targetCenter, targetZoom, options);
		}

		this._stop();

		var from = this.project(this.getCenter()),
		    to = this.project(targetCenter),
		    size = this.getSize(),
		    startZoom = this._zoom;

		targetCenter = toLatLng(targetCenter);
		targetZoom = targetZoom === undefined ? startZoom : targetZoom;

		var w0 = Math.max(size.x, size.y),
		    w1 = w0 * this.getZoomScale(startZoom, targetZoom),
		    u1 = (to.distanceTo(from)) || 1,
		    rho = 1.42,
		    rho2 = rho * rho;

		function r(i) {
			var s1 = i ? -1 : 1,
			    s2 = i ? w1 : w0,
			    t1 = w1 * w1 - w0 * w0 + s1 * rho2 * rho2 * u1 * u1,
			    b1 = 2 * s2 * rho2 * u1,
			    b = t1 / b1,
			    sq = Math.sqrt(b * b + 1) - b;

			    // workaround for floating point precision bug when sq = 0, log = -Infinite,
			    // thus triggering an infinite loop in flyTo
			    var log = sq < 0.000000001 ? -18 : Math.log(sq);

			return log;
		}

		function sinh(n) { return (Math.exp(n) - Math.exp(-n)) / 2; }
		function cosh(n) { return (Math.exp(n) + Math.exp(-n)) / 2; }
		function tanh(n) { return sinh(n) / cosh(n); }

		var r0 = r(0);

		function w(s) { return w0 * (cosh(r0) / cosh(r0 + rho * s)); }
		function u(s) { return w0 * (cosh(r0) * tanh(r0 + rho * s) - sinh(r0)) / rho2; }

		function easeOut(t) { return 1 - Math.pow(1 - t, 1.5); }

		var start = Date.now(),
		    S = (r(1) - r0) / rho,
		    duration = options.duration ? 1000 * options.duration : 1000 * S * 0.8;

		function frame() {
			var t = (Date.now() - start) / duration,
			    s = easeOut(t) * S;

			if (t <= 1) {
				this._flyToFrame = requestAnimFrame(frame, this);

				this._move(
					this.unproject(from.add(to.subtract(from).multiplyBy(u(s) / u1)), startZoom),
					this.getScaleZoom(w0 / w(s), startZoom),
					{flyTo: true});

			} else {
				this
					._move(targetCenter, targetZoom)
					._moveEnd(true);
			}
		}

		this._moveStart(true, options.noMoveStart);

		frame.call(this);
		return this;
	},

	// @method flyToBounds(bounds: LatLngBounds, options?: fitBounds options): this
	// Sets the view of the map with a smooth animation like [`flyTo`](#map-flyto),
	// but takes a bounds parameter like [`fitBounds`](#map-fitbounds).
	flyToBounds: function (bounds, options) {
		var target = this._getBoundsCenterZoom(bounds, options);
		return this.flyTo(target.center, target.zoom, options);
	},

	// @method setMaxBounds(bounds: Bounds): this
	// Restricts the map view to the given bounds (see the [maxBounds](#map-maxbounds) option).
	setMaxBounds: function (bounds) {
		bounds = toLatLngBounds(bounds);

		if (!bounds.isValid()) {
			this.options.maxBounds = null;
			return this.off('moveend', this._panInsideMaxBounds);
		} else if (this.options.maxBounds) {
			this.off('moveend', this._panInsideMaxBounds);
		}

		this.options.maxBounds = bounds;

		if (this._loaded) {
			this._panInsideMaxBounds();
		}

		return this.on('moveend', this._panInsideMaxBounds);
	},

	// @method setMinZoom(zoom: Number): this
	// Sets the lower limit for the available zoom levels (see the [minZoom](#map-minzoom) option).
	setMinZoom: function (zoom) {
		var oldZoom = this.options.minZoom;
		this.options.minZoom = zoom;

		if (this._loaded && oldZoom !== zoom) {
			this.fire('zoomlevelschange');

			if (this.getZoom() < this.options.minZoom) {
				return this.setZoom(zoom);
			}
		}

		return this;
	},

	// @method setMaxZoom(zoom: Number): this
	// Sets the upper limit for the available zoom levels (see the [maxZoom](#map-maxzoom) option).
	setMaxZoom: function (zoom) {
		var oldZoom = this.options.maxZoom;
		this.options.maxZoom = zoom;

		if (this._loaded && oldZoom !== zoom) {
			this.fire('zoomlevelschange');

			if (this.getZoom() > this.options.maxZoom) {
				return this.setZoom(zoom);
			}
		}

		return this;
	},

	// @method panInsideBounds(bounds: LatLngBounds, options?: Pan options): this
	// Pans the map to the closest view that would lie inside the given bounds (if it's not already), controlling the animation using the options specific, if any.
	panInsideBounds: function (bounds, options) {
		this._enforcingBounds = true;
		var center = this.getCenter(),
		    newCenter = this._limitCenter(center, this._zoom, toLatLngBounds(bounds));

		if (!center.equals(newCenter)) {
			this.panTo(newCenter, options);
		}

		this._enforcingBounds = false;
		return this;
	},

	// @method invalidateSize(options: Zoom/pan options): this
	// Checks if the map container size changed and updates the map if so —
	// call it after you've changed the map size dynamically, also animating
	// pan by default. If `options.pan` is `false`, panning will not occur.
	// If `options.debounceMoveend` is `true`, it will delay `moveend` event so
	// that it doesn't happen often even if the method is called many
	// times in a row.

	// @alternative
	// @method invalidateSize(animate: Boolean): this
	// Checks if the map container size changed and updates the map if so —
	// call it after you've changed the map size dynamically, also animating
	// pan by default.
	invalidateSize: function (options) {
		if (!this._loaded) { return this; }

		options = extend({
			animate: false,
			pan: true
		}, options === true ? {animate: true} : options);

		var oldSize = this.getSize();
		this._sizeChanged = true;
		this._lastCenter = null;

		var newSize = this.getSize(),
		    oldCenter = oldSize.divideBy(2).round(),
		    newCenter = newSize.divideBy(2).round(),
		    offset = oldCenter.subtract(newCenter);

		if (!offset.x && !offset.y) { return this; }

		if (options.animate && options.pan) {
			this.panBy(offset);

		} else {
			if (options.pan) {
				this._rawPanBy(offset);
			}

			this.fire('move');

			if (options.debounceMoveend) {
				clearTimeout(this._sizeTimer);
				this._sizeTimer = setTimeout(bind(this.fire, this, 'moveend'), 200);
			} else {
				this.fire('moveend');
			}
		}

		// @section Map state change events
		// @event resize: ResizeEvent
		// Fired when the map is resized.
		return this.fire('resize', {
			oldSize: oldSize,
			newSize: newSize
		});
	},

	// @section Methods for modifying map state
	// @method stop(): this
	// Stops the currently running `panTo` or `flyTo` animation, if any.
	stop: function () {
		this.setZoom(this._limitZoom(this._zoom));
		if (!this.options.zoomSnap) {
			this.fire('viewreset');
		}
		return this._stop();
	},

	// @section Geolocation methods
	// @method locate(options?: Locate options): this
	// Tries to locate the user using the Geolocation API, firing a [`locationfound`](#map-locationfound)
	// event with location data on success or a [`locationerror`](#map-locationerror) event on failure,
	// and optionally sets the map view to the user's location with respect to
	// detection accuracy (or to the world view if geolocation failed).
	// Note that, if your page doesn't use HTTPS, this method will fail in
	// modern browsers ([Chrome 50 and newer](https://sites.google.com/a/chromium.org/dev/Home/chromium-security/deprecating-powerful-features-on-insecure-origins))
	// See `Locate options` for more details.
	locate: function (options) {

		options = this._locateOptions = extend({
			timeout: 10000,
			watch: false
			// setView: false
			// maxZoom: <Number>
			// maximumAge: 0
			// enableHighAccuracy: false
		}, options);

		if (!('geolocation' in navigator)) {
			this._handleGeolocationError({
				code: 0,
				message: 'Geolocation not supported.'
			});
			return this;
		}

		var onResponse = bind(this._handleGeolocationResponse, this),
		    onError = bind(this._handleGeolocationError, this);

		if (options.watch) {
			this._locationWatchId =
			        navigator.geolocation.watchPosition(onResponse, onError, options);
		} else {
			navigator.geolocation.getCurrentPosition(onResponse, onError, options);
		}
		return this;
	},

	// @method stopLocate(): this
	// Stops watching location previously initiated by `map.locate({watch: true})`
	// and aborts resetting the map view if map.locate was called with
	// `{setView: true}`.
	stopLocate: function () {
		if (navigator.geolocation && navigator.geolocation.clearWatch) {
			navigator.geolocation.clearWatch(this._locationWatchId);
		}
		if (this._locateOptions) {
			this._locateOptions.setView = false;
		}
		return this;
	},

	_handleGeolocationError: function (error) {
		var c = error.code,
		    message = error.message ||
		            (c === 1 ? 'permission denied' :
		            (c === 2 ? 'position unavailable' : 'timeout'));

		if (this._locateOptions.setView && !this._loaded) {
			this.fitWorld();
		}

		// @section Location events
		// @event locationerror: ErrorEvent
		// Fired when geolocation (using the [`locate`](#map-locate) method) failed.
		this.fire('locationerror', {
			code: c,
			message: 'Geolocation error: ' + message + '.'
		});
	},

	_handleGeolocationResponse: function (pos) {
		var lat = pos.coords.latitude,
		    lng = pos.coords.longitude,
		    latlng = new LatLng(lat, lng),
		    bounds = latlng.toBounds(pos.coords.accuracy * 2),
		    options = this._locateOptions;

		if (options.setView) {
			var zoom = this.getBoundsZoom(bounds);
			this.setView(latlng, options.maxZoom ? Math.min(zoom, options.maxZoom) : zoom);
		}

		var data = {
			latlng: latlng,
			bounds: bounds,
			timestamp: pos.timestamp
		};

		for (var i in pos.coords) {
			if (typeof pos.coords[i] === 'number') {
				data[i] = pos.coords[i];
			}
		}

		// @event locationfound: LocationEvent
		// Fired when geolocation (using the [`locate`](#map-locate) method)
		// went successfully.
		this.fire('locationfound', data);
	},

	// TODO Appropriate docs section?
	// @section Other Methods
	// @method addHandler(name: String, HandlerClass: Function): this
	// Adds a new `Handler` to the map, given its name and constructor function.
	addHandler: function (name, HandlerClass) {
		if (!HandlerClass) { return this; }

		var handler = this[name] = new HandlerClass(this);

		this._handlers.push(handler);

		if (this.options[name]) {
			handler.enable();
		}

		return this;
	},

	// @method remove(): this
	// Destroys the map and clears all related event listeners.
	remove: function () {

		this._initEvents(true);

		if (this._containerId !== this._container._leaflet_id) {
			throw new Error('Map container is being reused by another instance');
		}

		try {
			// throws error in IE6-8
			delete this._container._leaflet_id;
			delete this._containerId;
		} catch (e) {
			/*eslint-disable */
			this._container._leaflet_id = undefined;
			/* eslint-enable */
			this._containerId = undefined;
		}

		if (this._locationWatchId !== undefined) {
			this.stopLocate();
		}

		this._stop();

		remove(this._mapPane);

		if (this._clearControlPos) {
			this._clearControlPos();
		}
		if (this._resizeRequest) {
			cancelAnimFrame(this._resizeRequest);
			this._resizeRequest = null;
		}

		this._clearHandlers();

		if (this._loaded) {
			// @section Map state change events
			// @event unload: Event
			// Fired when the map is destroyed with [remove](#map-remove) method.
			this.fire('unload');
		}

		var i;
		for (i in this._layers) {
			this._layers[i].remove();
		}
		for (i in this._panes) {
			remove(this._panes[i]);
		}

		this._layers = [];
		this._panes = [];
		delete this._mapPane;
		delete this._renderer;

		return this;
	},

	// @section Other Methods
	// @method createPane(name: String, container?: HTMLElement): HTMLElement
	// Creates a new [map pane](#map-pane) with the given name if it doesn't exist already,
	// then returns it. The pane is created as a child of `container`, or
	// as a child of the main map pane if not set.
	createPane: function (name, container) {
		var className = 'leaflet-pane' + (name ? ' leaflet-' + name.replace('Pane', '') + '-pane' : ''),
		    pane = create$1('div', className, container || this._mapPane);

		if (name) {
			this._panes[name] = pane;
		}
		return pane;
	},

	// @section Methods for Getting Map State

	// @method getCenter(): LatLng
	// Returns the geographical center of the map view
	getCenter: function () {
		this._checkIfLoaded();

		if (this._lastCenter && !this._moved()) {
			return this._lastCenter;
		}
		return this.layerPointToLatLng(this._getCenterLayerPoint());
	},

	// @method getZoom(): Number
	// Returns the current zoom level of the map view
	getZoom: function () {
		return this._zoom;
	},

	// @method getBounds(): LatLngBounds
	// Returns the geographical bounds visible in the current map view
	getBounds: function () {
		var bounds = this.getPixelBounds(),
		    sw = this.unproject(bounds.getBottomLeft()),
		    ne = this.unproject(bounds.getTopRight());

		return new LatLngBounds(sw, ne);
	},

	// @method getMinZoom(): Number
	// Returns the minimum zoom level of the map (if set in the `minZoom` option of the map or of any layers), or `0` by default.
	getMinZoom: function () {
		return this.options.minZoom === undefined ? this._layersMinZoom || 0 : this.options.minZoom;
	},

	// @method getMaxZoom(): Number
	// Returns the maximum zoom level of the map (if set in the `maxZoom` option of the map or of any layers).
	getMaxZoom: function () {
		return this.options.maxZoom === undefined ?
			(this._layersMaxZoom === undefined ? Infinity : this._layersMaxZoom) :
			this.options.maxZoom;
	},

	// @method getBoundsZoom(bounds: LatLngBounds, inside?: Boolean, padding?: Point): Number
	// Returns the maximum zoom level on which the given bounds fit to the map
	// view in its entirety. If `inside` (optional) is set to `true`, the method
	// instead returns the minimum zoom level on which the map view fits into
	// the given bounds in its entirety.
	getBoundsZoom: function (bounds, inside, padding) { // (LatLngBounds[, Boolean, Point]) -> Number
		bounds = toLatLngBounds(bounds);
		padding = toPoint(padding || [0, 0]);

		var zoom = this.getZoom() || 0,
		    min = this.getMinZoom(),
		    max = this.getMaxZoom(),
		    nw = bounds.getNorthWest(),
		    se = bounds.getSouthEast(),
		    size = this.getSize().subtract(padding),
		    boundsSize = toBounds(this.project(se, zoom), this.project(nw, zoom)).getSize(),
		    snap = any3d ? this.options.zoomSnap : 1,
		    scalex = size.x / boundsSize.x,
		    scaley = size.y / boundsSize.y,
		    scale = inside ? Math.max(scalex, scaley) : Math.min(scalex, scaley);

		zoom = this.getScaleZoom(scale, zoom);

		if (snap) {
			zoom = Math.round(zoom / (snap / 100)) * (snap / 100); // don't jump if within 1% of a snap level
			zoom = inside ? Math.ceil(zoom / snap) * snap : Math.floor(zoom / snap) * snap;
		}

		return Math.max(min, Math.min(max, zoom));
	},

	// @method getSize(): Point
	// Returns the current size of the map container (in pixels).
	getSize: function () {
		if (!this._size || this._sizeChanged) {
			this._size = new Point(
				this._container.clientWidth || 0,
				this._container.clientHeight || 0);

			this._sizeChanged = false;
		}
		return this._size.clone();
	},

	// @method getPixelBounds(): Bounds
	// Returns the bounds of the current map view in projected pixel
	// coordinates (sometimes useful in layer and overlay implementations).
	getPixelBounds: function (center, zoom) {
		var topLeftPoint = this._getTopLeftPoint(center, zoom);
		return new Bounds(topLeftPoint, topLeftPoint.add(this.getSize()));
	},

	// TODO: Check semantics - isn't the pixel origin the 0,0 coord relative to
	// the map pane? "left point of the map layer" can be confusing, specially
	// since there can be negative offsets.
	// @method getPixelOrigin(): Point
	// Returns the projected pixel coordinates of the top left point of
	// the map layer (useful in custom layer and overlay implementations).
	getPixelOrigin: function () {
		this._checkIfLoaded();
		return this._pixelOrigin;
	},

	// @method getPixelWorldBounds(zoom?: Number): Bounds
	// Returns the world's bounds in pixel coordinates for zoom level `zoom`.
	// If `zoom` is omitted, the map's current zoom level is used.
	getPixelWorldBounds: function (zoom) {
		return this.options.crs.getProjectedBounds(zoom === undefined ? this.getZoom() : zoom);
	},

	// @section Other Methods

	// @method getPane(pane: String|HTMLElement): HTMLElement
	// Returns a [map pane](#map-pane), given its name or its HTML element (its identity).
	getPane: function (pane) {
		return typeof pane === 'string' ? this._panes[pane] : pane;
	},

	// @method getPanes(): Object
	// Returns a plain object containing the names of all [panes](#map-pane) as keys and
	// the panes as values.
	getPanes: function () {
		return this._panes;
	},

	// @method getContainer: HTMLElement
	// Returns the HTML element that contains the map.
	getContainer: function () {
		return this._container;
	},


	// @section Conversion Methods

	// @method getZoomScale(toZoom: Number, fromZoom: Number): Number
	// Returns the scale factor to be applied to a map transition from zoom level
	// `fromZoom` to `toZoom`. Used internally to help with zoom animations.
	getZoomScale: function (toZoom, fromZoom) {
		// TODO replace with universal implementation after refactoring projections
		var crs = this.options.crs;
		fromZoom = fromZoom === undefined ? this._zoom : fromZoom;
		return crs.scale(toZoom) / crs.scale(fromZoom);
	},

	// @method getScaleZoom(scale: Number, fromZoom: Number): Number
	// Returns the zoom level that the map would end up at, if it is at `fromZoom`
	// level and everything is scaled by a factor of `scale`. Inverse of
	// [`getZoomScale`](#map-getZoomScale).
	getScaleZoom: function (scale, fromZoom) {
		var crs = this.options.crs;
		fromZoom = fromZoom === undefined ? this._zoom : fromZoom;
		var zoom = crs.zoom(scale * crs.scale(fromZoom));
		return isNaN(zoom) ? Infinity : zoom;
	},

	// @method project(latlng: LatLng, zoom: Number): Point
	// Projects a geographical coordinate `LatLng` according to the projection
	// of the map's CRS, then scales it according to `zoom` and the CRS's
	// `Transformation`. The result is pixel coordinate relative to
	// the CRS origin.
	project: function (latlng, zoom) {
		zoom = zoom === undefined ? this._zoom : zoom;
		return this.options.crs.latLngToPoint(toLatLng(latlng), zoom);
	},

	// @method unproject(point: Point, zoom: Number): LatLng
	// Inverse of [`project`](#map-project).
	unproject: function (point, zoom) {
		zoom = zoom === undefined ? this._zoom : zoom;
		return this.options.crs.pointToLatLng(toPoint(point), zoom);
	},

	// @method layerPointToLatLng(point: Point): LatLng
	// Given a pixel coordinate relative to the [origin pixel](#map-getpixelorigin),
	// returns the corresponding geographical coordinate (for the current zoom level).
	layerPointToLatLng: function (point) {
		var projectedPoint = toPoint(point).add(this.getPixelOrigin());
		return this.unproject(projectedPoint);
	},

	// @method latLngToLayerPoint(latlng: LatLng): Point
	// Given a geographical coordinate, returns the corresponding pixel coordinate
	// relative to the [origin pixel](#map-getpixelorigin).
	latLngToLayerPoint: function (latlng) {
		var projectedPoint = this.project(toLatLng(latlng))._round();
		return projectedPoint._subtract(this.getPixelOrigin());
	},

	// @method wrapLatLng(latlng: LatLng): LatLng
	// Returns a `LatLng` where `lat` and `lng` has been wrapped according to the
	// map's CRS's `wrapLat` and `wrapLng` properties, if they are outside the
	// CRS's bounds.
	// By default this means longitude is wrapped around the dateline so its
	// value is between -180 and +180 degrees.
	wrapLatLng: function (latlng) {
		return this.options.crs.wrapLatLng(toLatLng(latlng));
	},

	// @method wrapLatLngBounds(bounds: LatLngBounds): LatLngBounds
	// Returns a `LatLngBounds` with the same size as the given one, ensuring that
	// its center is within the CRS's bounds.
	// By default this means the center longitude is wrapped around the dateline so its
	// value is between -180 and +180 degrees, and the majority of the bounds
	// overlaps the CRS's bounds.
	wrapLatLngBounds: function (latlng) {
		return this.options.crs.wrapLatLngBounds(toLatLngBounds(latlng));
	},

	// @method distance(latlng1: LatLng, latlng2: LatLng): Number
	// Returns the distance between two geographical coordinates according to
	// the map's CRS. By default this measures distance in meters.
	distance: function (latlng1, latlng2) {
		return this.options.crs.distance(toLatLng(latlng1), toLatLng(latlng2));
	},

	// @method containerPointToLayerPoint(point: Point): Point
	// Given a pixel coordinate relative to the map container, returns the corresponding
	// pixel coordinate relative to the [origin pixel](#map-getpixelorigin).
	containerPointToLayerPoint: function (point) { // (Point)
		return toPoint(point).subtract(this._getMapPanePos());
	},

	// @method layerPointToContainerPoint(point: Point): Point
	// Given a pixel coordinate relative to the [origin pixel](#map-getpixelorigin),
	// returns the corresponding pixel coordinate relative to the map container.
	layerPointToContainerPoint: function (point) { // (Point)
		return toPoint(point).add(this._getMapPanePos());
	},

	// @method containerPointToLatLng(point: Point): LatLng
	// Given a pixel coordinate relative to the map container, returns
	// the corresponding geographical coordinate (for the current zoom level).
	containerPointToLatLng: function (point) {
		var layerPoint = this.containerPointToLayerPoint(toPoint(point));
		return this.layerPointToLatLng(layerPoint);
	},

	// @method latLngToContainerPoint(latlng: LatLng): Point
	// Given a geographical coordinate, returns the corresponding pixel coordinate
	// relative to the map container.
	latLngToContainerPoint: function (latlng) {
		return this.layerPointToContainerPoint(this.latLngToLayerPoint(toLatLng(latlng)));
	},

	// @method mouseEventToContainerPoint(ev: MouseEvent): Point
	// Given a MouseEvent object, returns the pixel coordinate relative to the
	// map container where the event took place.
	mouseEventToContainerPoint: function (e) {
		return getMousePosition(e, this._container);
	},

	// @method mouseEventToLayerPoint(ev: MouseEvent): Point
	// Given a MouseEvent object, returns the pixel coordinate relative to
	// the [origin pixel](#map-getpixelorigin) where the event took place.
	mouseEventToLayerPoint: function (e) {
		return this.containerPointToLayerPoint(this.mouseEventToContainerPoint(e));
	},

	// @method mouseEventToLatLng(ev: MouseEvent): LatLng
	// Given a MouseEvent object, returns geographical coordinate where the
	// event took place.
	mouseEventToLatLng: function (e) { // (MouseEvent)
		return this.layerPointToLatLng(this.mouseEventToLayerPoint(e));
	},


	// map initialization methods

	_initContainer: function (id) {
		var container = this._container = get(id);

		if (!container) {
			throw new Error('Map container not found.');
		} else if (container._leaflet_id) {
			throw new Error('Map container is already initialized.');
		}

		on(container, 'scroll', this._onScroll, this);
		this._containerId = stamp(container);
	},

	_initLayout: function () {
		var container = this._container;

		this._fadeAnimated = this.options.fadeAnimation && any3d;

		addClass(container, 'leaflet-container' +
			(touch ? ' leaflet-touch' : '') +
			(retina ? ' leaflet-retina' : '') +
			(ielt9 ? ' leaflet-oldie' : '') +
			(safari ? ' leaflet-safari' : '') +
			(this._fadeAnimated ? ' leaflet-fade-anim' : ''));

		var position = getStyle(container, 'position');

		if (position !== 'absolute' && position !== 'relative' && position !== 'fixed') {
			container.style.position = 'relative';
		}

		this._initPanes();

		if (this._initControlPos) {
			this._initControlPos();
		}
	},

	_initPanes: function () {
		var panes = this._panes = {};
		this._paneRenderers = {};

		// @section
		//
		// Panes are DOM elements used to control the ordering of layers on the map. You
		// can access panes with [`map.getPane`](#map-getpane) or
		// [`map.getPanes`](#map-getpanes) methods. New panes can be created with the
		// [`map.createPane`](#map-createpane) method.
		//
		// Every map has the following default panes that differ only in zIndex.
		//
		// @pane mapPane: HTMLElement = 'auto'
		// Pane that contains all other map panes

		this._mapPane = this.createPane('mapPane', this._container);
		setPosition(this._mapPane, new Point(0, 0));

		// @pane tilePane: HTMLElement = 200
		// Pane for `GridLayer`s and `TileLayer`s
		this.createPane('tilePane');
		// @pane overlayPane: HTMLElement = 400
		// Pane for vectors (`Path`s, like `Polyline`s and `Polygon`s), `ImageOverlay`s and `VideoOverlay`s
		this.createPane('shadowPane');
		// @pane shadowPane: HTMLElement = 500
		// Pane for overlay shadows (e.g. `Marker` shadows)
		this.createPane('overlayPane');
		// @pane markerPane: HTMLElement = 600
		// Pane for `Icon`s of `Marker`s
		this.createPane('markerPane');
		// @pane tooltipPane: HTMLElement = 650
		// Pane for `Tooltip`s.
		this.createPane('tooltipPane');
		// @pane popupPane: HTMLElement = 700
		// Pane for `Popup`s.
		this.createPane('popupPane');

		if (!this.options.markerZoomAnimation) {
			addClass(panes.markerPane, 'leaflet-zoom-hide');
			addClass(panes.shadowPane, 'leaflet-zoom-hide');
		}
	},


	// private methods that modify map state

	// @section Map state change events
	_resetView: function (center, zoom) {
		setPosition(this._mapPane, new Point(0, 0));

		var loading = !this._loaded;
		this._loaded = true;
		zoom = this._limitZoom(zoom);

		this.fire('viewprereset');

		var zoomChanged = this._zoom !== zoom;
		this
			._moveStart(zoomChanged, false)
			._move(center, zoom)
			._moveEnd(zoomChanged);

		// @event viewreset: Event
		// Fired when the map needs to redraw its content (this usually happens
		// on map zoom or load). Very useful for creating custom overlays.
		this.fire('viewreset');

		// @event load: Event
		// Fired when the map is initialized (when its center and zoom are set
		// for the first time).
		if (loading) {
			this.fire('load');
		}
	},

	_moveStart: function (zoomChanged, noMoveStart) {
		// @event zoomstart: Event
		// Fired when the map zoom is about to change (e.g. before zoom animation).
		// @event movestart: Event
		// Fired when the view of the map starts changing (e.g. user starts dragging the map).
		if (zoomChanged) {
			this.fire('zoomstart');
		}
		if (!noMoveStart) {
			this.fire('movestart');
		}
		return this;
	},

	_move: function (center, zoom, data) {
		if (zoom === undefined) {
			zoom = this._zoom;
		}
		var zoomChanged = this._zoom !== zoom;

		this._zoom = zoom;
		this._lastCenter = center;
		this._pixelOrigin = this._getNewPixelOrigin(center);

		// @event zoom: Event
		// Fired repeatedly during any change in zoom level, including zoom
		// and fly animations.
		if (zoomChanged || (data && data.pinch)) {	// Always fire 'zoom' if pinching because #3530
			this.fire('zoom', data);
		}

		// @event move: Event
		// Fired repeatedly during any movement of the map, including pan and
		// fly animations.
		return this.fire('move', data);
	},

	_moveEnd: function (zoomChanged) {
		// @event zoomend: Event
		// Fired when the map has changed, after any animations.
		if (zoomChanged) {
			this.fire('zoomend');
		}

		// @event moveend: Event
		// Fired when the center of the map stops changing (e.g. user stopped
		// dragging the map).
		return this.fire('moveend');
	},

	_stop: function () {
		cancelAnimFrame(this._flyToFrame);
		if (this._panAnim) {
			this._panAnim.stop();
		}
		return this;
	},

	_rawPanBy: function (offset) {
		setPosition(this._mapPane, this._getMapPanePos().subtract(offset));
	},

	_getZoomSpan: function () {
		return this.getMaxZoom() - this.getMinZoom();
	},

	_panInsideMaxBounds: function () {
		if (!this._enforcingBounds) {
			this.panInsideBounds(this.options.maxBounds);
		}
	},

	_checkIfLoaded: function () {
		if (!this._loaded) {
			throw new Error('Set map center and zoom first.');
		}
	},

	// DOM event handling

	// @section Interaction events
	_initEvents: function (remove$$1) {
		this._targets = {};
		this._targets[stamp(this._container)] = this;

		var onOff = remove$$1 ? off : on;

		// @event click: MouseEvent
		// Fired when the user clicks (or taps) the map.
		// @event dblclick: MouseEvent
		// Fired when the user double-clicks (or double-taps) the map.
		// @event mousedown: MouseEvent
		// Fired when the user pushes the mouse button on the map.
		// @event mouseup: MouseEvent
		// Fired when the user releases the mouse button on the map.
		// @event mouseover: MouseEvent
		// Fired when the mouse enters the map.
		// @event mouseout: MouseEvent
		// Fired when the mouse leaves the map.
		// @event mousemove: MouseEvent
		// Fired while the mouse moves over the map.
		// @event contextmenu: MouseEvent
		// Fired when the user pushes the right mouse button on the map, prevents
		// default browser context menu from showing if there are listeners on
		// this event. Also fired on mobile when the user holds a single touch
		// for a second (also called long press).
		// @event keypress: KeyboardEvent
		// Fired when the user presses a key from the keyboard while the map is focused.
		onOff(this._container, 'click dblclick mousedown mouseup ' +
			'mouseover mouseout mousemove contextmenu keypress', this._handleDOMEvent, this);

		if (this.options.trackResize) {
			onOff(window, 'resize', this._onResize, this);
		}

		if (any3d && this.options.transform3DLimit) {
			(remove$$1 ? this.off : this.on).call(this, 'moveend', this._onMoveEnd);
		}
	},

	_onResize: function () {
		cancelAnimFrame(this._resizeRequest);
		this._resizeRequest = requestAnimFrame(
		        function () { this.invalidateSize({debounceMoveend: true}); }, this);
	},

	_onScroll: function () {
		this._container.scrollTop  = 0;
		this._container.scrollLeft = 0;
	},

	_onMoveEnd: function () {
		var pos = this._getMapPanePos();
		if (Math.max(Math.abs(pos.x), Math.abs(pos.y)) >= this.options.transform3DLimit) {
			// https://bugzilla.mozilla.org/show_bug.cgi?id=1203873 but Webkit also have
			// a pixel offset on very high values, see: http://jsfiddle.net/dg6r5hhb/
			this._resetView(this.getCenter(), this.getZoom());
		}
	},

	_findEventTargets: function (e, type) {
		var targets = [],
		    target,
		    isHover = type === 'mouseout' || type === 'mouseover',
		    src = e.target || e.srcElement,
		    dragging = false;

		while (src) {
			target = this._targets[stamp(src)];
			if (target && (type === 'click' || type === 'preclick') && !e._simulated && this._draggableMoved(target)) {
				// Prevent firing click after you just dragged an object.
				dragging = true;
				break;
			}
			if (target && target.listens(type, true)) {
				if (isHover && !isExternalTarget(src, e)) { break; }
				targets.push(target);
				if (isHover) { break; }
			}
			if (src === this._container) { break; }
			src = src.parentNode;
		}
		if (!targets.length && !dragging && !isHover && isExternalTarget(src, e)) {
			targets = [this];
		}
		return targets;
	},

	_handleDOMEvent: function (e) {
		if (!this._loaded || skipped(e)) { return; }

		var type = e.type;

		if (type === 'mousedown' || type === 'keypress') {
			// prevents outline when clicking on keyboard-focusable element
			preventOutline(e.target || e.srcElement);
		}

		this._fireDOMEvent(e, type);
	},

	_mouseEvents: ['click', 'dblclick', 'mouseover', 'mouseout', 'contextmenu'],

	_fireDOMEvent: function (e, type, targets) {

		if (e.type === 'click') {
			// Fire a synthetic 'preclick' event which propagates up (mainly for closing popups).
			// @event preclick: MouseEvent
			// Fired before mouse click on the map (sometimes useful when you
			// want something to happen on click before any existing click
			// handlers start running).
			var synth = extend({}, e);
			synth.type = 'preclick';
			this._fireDOMEvent(synth, synth.type, targets);
		}

		if (e._stopped) { return; }

		// Find the layer the event is propagating from and its parents.
		targets = (targets || []).concat(this._findEventTargets(e, type));

		if (!targets.length) { return; }

		var target = targets[0];
		if (type === 'contextmenu' && target.listens(type, true)) {
			preventDefault(e);
		}

		var data = {
			originalEvent: e
		};

		if (e.type !== 'keypress') {
			var isMarker = target.getLatLng && (!target._radius || target._radius <= 10);
			data.containerPoint = isMarker ?
				this.latLngToContainerPoint(target.getLatLng()) : this.mouseEventToContainerPoint(e);
			data.layerPoint = this.containerPointToLayerPoint(data.containerPoint);
			data.latlng = isMarker ? target.getLatLng() : this.layerPointToLatLng(data.layerPoint);
		}

		for (var i = 0; i < targets.length; i++) {
			targets[i].fire(type, data, true);
			if (data.originalEvent._stopped ||
				(targets[i].options.bubblingMouseEvents === false && indexOf(this._mouseEvents, type) !== -1)) { return; }
		}
	},

	_draggableMoved: function (obj) {
		obj = obj.dragging && obj.dragging.enabled() ? obj : this;
		return (obj.dragging && obj.dragging.moved()) || (this.boxZoom && this.boxZoom.moved());
	},

	_clearHandlers: function () {
		for (var i = 0, len = this._handlers.length; i < len; i++) {
			this._handlers[i].disable();
		}
	},

	// @section Other Methods

	// @method whenReady(fn: Function, context?: Object): this
	// Runs the given function `fn` when the map gets initialized with
	// a view (center and zoom) and at least one layer, or immediately
	// if it's already initialized, optionally passing a function context.
	whenReady: function (callback, context) {
		if (this._loaded) {
			callback.call(context || this, {target: this});
		} else {
			this.on('load', callback, context);
		}
		return this;
	},


	// private methods for getting map state

	_getMapPanePos: function () {
		return getPosition(this._mapPane) || new Point(0, 0);
	},

	_moved: function () {
		var pos = this._getMapPanePos();
		return pos && !pos.equals([0, 0]);
	},

	_getTopLeftPoint: function (center, zoom) {
		var pixelOrigin = center && zoom !== undefined ?
			this._getNewPixelOrigin(center, zoom) :
			this.getPixelOrigin();
		return pixelOrigin.subtract(this._getMapPanePos());
	},

	_getNewPixelOrigin: function (center, zoom) {
		var viewHalf = this.getSize()._divideBy(2);
		return this.project(center, zoom)._subtract(viewHalf)._add(this._getMapPanePos())._round();
	},

	_latLngToNewLayerPoint: function (latlng, zoom, center) {
		var topLeft = this._getNewPixelOrigin(center, zoom);
		return this.project(latlng, zoom)._subtract(topLeft);
	},

	_latLngBoundsToNewLayerBounds: function (latLngBounds, zoom, center) {
		var topLeft = this._getNewPixelOrigin(center, zoom);
		return toBounds([
			this.project(latLngBounds.getSouthWest(), zoom)._subtract(topLeft),
			this.project(latLngBounds.getNorthWest(), zoom)._subtract(topLeft),
			this.project(latLngBounds.getSouthEast(), zoom)._subtract(topLeft),
			this.project(latLngBounds.getNorthEast(), zoom)._subtract(topLeft)
		]);
	},

	// layer point of the current center
	_getCenterLayerPoint: function () {
		return this.containerPointToLayerPoint(this.getSize()._divideBy(2));
	},

	// offset of the specified place to the current center in pixels
	_getCenterOffset: function (latlng) {
		return this.latLngToLayerPoint(latlng).subtract(this._getCenterLayerPoint());
	},

	// adjust center for view to get inside bounds
	_limitCenter: function (center, zoom, bounds) {

		if (!bounds) { return center; }

		var centerPoint = this.project(center, zoom),
		    viewHalf = this.getSize().divideBy(2),
		    viewBounds = new Bounds(centerPoint.subtract(viewHalf), centerPoint.add(viewHalf)),
		    offset = this._getBoundsOffset(viewBounds, bounds, zoom);

		// If offset is less than a pixel, ignore.
		// This prevents unstable projections from getting into
		// an infinite loop of tiny offsets.
		if (offset.round().equals([0, 0])) {
			return center;
		}

		return this.unproject(centerPoint.add(offset), zoom);
	},

	// adjust offset for view to get inside bounds
	_limitOffset: function (offset, bounds) {
		if (!bounds) { return offset; }

		var viewBounds = this.getPixelBounds(),
		    newBounds = new Bounds(viewBounds.min.add(offset), viewBounds.max.add(offset));

		return offset.add(this._getBoundsOffset(newBounds, bounds));
	},

	// returns offset needed for pxBounds to get inside maxBounds at a specified zoom
	_getBoundsOffset: function (pxBounds, maxBounds, zoom) {
		var projectedMaxBounds = toBounds(
		        this.project(maxBounds.getNorthEast(), zoom),
		        this.project(maxBounds.getSouthWest(), zoom)
		    ),
		    minOffset = projectedMaxBounds.min.subtract(pxBounds.min),
		    maxOffset = projectedMaxBounds.max.subtract(pxBounds.max),

		    dx = this._rebound(minOffset.x, -maxOffset.x),
		    dy = this._rebound(minOffset.y, -maxOffset.y);

		return new Point(dx, dy);
	},

	_rebound: function (left, right) {
		return left + right > 0 ?
			Math.round(left - right) / 2 :
			Math.max(0, Math.ceil(left)) - Math.max(0, Math.floor(right));
	},

	_limitZoom: function (zoom) {
		var min = this.getMinZoom(),
		    max = this.getMaxZoom(),
		    snap = any3d ? this.options.zoomSnap : 1;
		if (snap) {
			zoom = Math.round(zoom / snap) * snap;
		}
		return Math.max(min, Math.min(max, zoom));
	},

	_onPanTransitionStep: function () {
		this.fire('move');
	},

	_onPanTransitionEnd: function () {
		removeClass(this._mapPane, 'leaflet-pan-anim');
		this.fire('moveend');
	},

	_tryAnimatedPan: function (center, options) {
		// difference between the new and current centers in pixels
		var offset = this._getCenterOffset(center)._trunc();

		// don't animate too far unless animate: true specified in options
		if ((options && options.animate) !== true && !this.getSize().contains(offset)) { return false; }

		this.panBy(offset, options);

		return true;
	},

	_createAnimProxy: function () {

		var proxy = this._proxy = create$1('div', 'leaflet-proxy leaflet-zoom-animated');
		this._panes.mapPane.appendChild(proxy);

		this.on('zoomanim', function (e) {
			var prop = TRANSFORM,
			    transform = this._proxy.style[prop];

			setTransform(this._proxy, this.project(e.center, e.zoom), this.getZoomScale(e.zoom, 1));

			// workaround for case when transform is the same and so transitionend event is not fired
			if (transform === this._proxy.style[prop] && this._animatingZoom) {
				this._onZoomTransitionEnd();
			}
		}, this);

		this.on('load moveend', function () {
			var c = this.getCenter(),
			    z = this.getZoom();
			setTransform(this._proxy, this.project(c, z), this.getZoomScale(z, 1));
		}, this);

		this._on('unload', this._destroyAnimProxy, this);
	},

	_destroyAnimProxy: function () {
		remove(this._proxy);
		delete this._proxy;
	},

	_catchTransitionEnd: function (e) {
		if (this._animatingZoom && e.propertyName.indexOf('transform') >= 0) {
			this._onZoomTransitionEnd();
		}
	},

	_nothingToAnimate: function () {
		return !this._container.getElementsByClassName('leaflet-zoom-animated').length;
	},

	_tryAnimatedZoom: function (center, zoom, options) {

		if (this._animatingZoom) { return true; }

		options = options || {};

		// don't animate if disabled, not supported or zoom difference is too large
		if (!this._zoomAnimated || options.animate === false || this._nothingToAnimate() ||
		        Math.abs(zoom - this._zoom) > this.options.zoomAnimationThreshold) { return false; }

		// offset is the pixel coords of the zoom origin relative to the current center
		var scale = this.getZoomScale(zoom),
		    offset = this._getCenterOffset(center)._divideBy(1 - 1 / scale);

		// don't animate if the zoom origin isn't within one screen from the current center, unless forced
		if (options.animate !== true && !this.getSize().contains(offset)) { return false; }

		requestAnimFrame(function () {
			this
			    ._moveStart(true, false)
			    ._animateZoom(center, zoom, true);
		}, this);

		return true;
	},

	_animateZoom: function (center, zoom, startAnim, noUpdate) {
		if (!this._mapPane) { return; }

		if (startAnim) {
			this._animatingZoom = true;

			// remember what center/zoom to set after animation
			this._animateToCenter = center;
			this._animateToZoom = zoom;

			addClass(this._mapPane, 'leaflet-zoom-anim');
		}

		// @event zoomanim: ZoomAnimEvent
		// Fired on every frame of a zoom animation
		this.fire('zoomanim', {
			center: center,
			zoom: zoom,
			noUpdate: noUpdate
		});

		// Work around webkit not firing 'transitionend', see https://github.com/Leaflet/Leaflet/issues/3689, 2693
		setTimeout(bind(this._onZoomTransitionEnd, this), 250);
	},

	_onZoomTransitionEnd: function () {
		if (!this._animatingZoom) { return; }

		if (this._mapPane) {
			removeClass(this._mapPane, 'leaflet-zoom-anim');
		}

		this._animatingZoom = false;

		this._move(this._animateToCenter, this._animateToZoom);

		// This anim frame should prevent an obscure iOS webkit tile loading race condition.
		requestAnimFrame(function () {
			this._moveEnd(true);
		}, this);
	}
});

// @section

// @factory L.map(id: String, options?: Map options)
// Instantiates a map object given the DOM ID of a `<div>` element
// and optionally an object literal with `Map options`.
//
// @alternative
// @factory L.map(el: HTMLElement, options?: Map options)
// Instantiates a map object given an instance of a `<div>` HTML element
// and optionally an object literal with `Map options`.
function createMap(id, options) {
	return new Map(id, options);
}

/*
 * @class Control
 * @aka L.Control
 * @inherits Class
 *
 * L.Control is a base class for implementing map controls. Handles positioning.
 * All other controls extend from this class.
 */

var Control = Class.extend({
	// @section
	// @aka Control options
	options: {
		// @option position: String = 'topright'
		// The position of the control (one of the map corners). Possible values are `'topleft'`,
		// `'topright'`, `'bottomleft'` or `'bottomright'`
		position: 'topright'
	},

	initialize: function (options) {
		setOptions(this, options);
	},

	/* @section
	 * Classes extending L.Control will inherit the following methods:
	 *
	 * @method getPosition: string
	 * Returns the position of the control.
	 */
	getPosition: function () {
		return this.options.position;
	},

	// @method setPosition(position: string): this
	// Sets the position of the control.
	setPosition: function (position) {
		var map = this._map;

		if (map) {
			map.removeControl(this);
		}

		this.options.position = position;

		if (map) {
			map.addControl(this);
		}

		return this;
	},

	// @method getContainer: HTMLElement
	// Returns the HTMLElement that contains the control.
	getContainer: function () {
		return this._container;
	},

	// @method addTo(map: Map): this
	// Adds the control to the given map.
	addTo: function (map) {
		this.remove();
		this._map = map;

		var container = this._container = this.onAdd(map),
		    pos = this.getPosition(),
		    corner = map._controlCorners[pos];

		addClass(container, 'leaflet-control');

		if (pos.indexOf('bottom') !== -1) {
			corner.insertBefore(container, corner.firstChild);
		} else {
			corner.appendChild(container);
		}

		return this;
	},

	// @method remove: this
	// Removes the control from the map it is currently active on.
	remove: function () {
		if (!this._map) {
			return this;
		}

		remove(this._container);

		if (this.onRemove) {
			this.onRemove(this._map);
		}

		this._map = null;

		return this;
	},

	_refocusOnMap: function (e) {
		// if map exists and event is not a keyboard event
		if (this._map && e && e.screenX > 0 && e.screenY > 0) {
			this._map.getContainer().focus();
		}
	}
});

var control = function (options) {
	return new Control(options);
};

/* @section Extension methods
 * @uninheritable
 *
 * Every control should extend from `L.Control` and (re-)implement the following methods.
 *
 * @method onAdd(map: Map): HTMLElement
 * Should return the container DOM element for the control and add listeners on relevant map events. Called on [`control.addTo(map)`](#control-addTo).
 *
 * @method onRemove(map: Map)
 * Optional method. Should contain all clean up code that removes the listeners previously added in [`onAdd`](#control-onadd). Called on [`control.remove()`](#control-remove).
 */

/* @namespace Map
 * @section Methods for Layers and Controls
 */
Map.include({
	// @method addControl(control: Control): this
	// Adds the given control to the map
	addControl: function (control) {
		control.addTo(this);
		return this;
	},

	// @method removeControl(control: Control): this
	// Removes the given control from the map
	removeControl: function (control) {
		control.remove();
		return this;
	},

	_initControlPos: function () {
		var corners = this._controlCorners = {},
		    l = 'leaflet-',
		    container = this._controlContainer =
		            create$1('div', l + 'control-container', this._container);

		function createCorner(vSide, hSide) {
			var className = l + vSide + ' ' + l + hSide;

			corners[vSide + hSide] = create$1('div', className, container);
		}

		createCorner('top', 'left');
		createCorner('top', 'right');
		createCorner('bottom', 'left');
		createCorner('bottom', 'right');
	},

	_clearControlPos: function () {
		for (var i in this._controlCorners) {
			remove(this._controlCorners[i]);
		}
		remove(this._controlContainer);
		delete this._controlCorners;
		delete this._controlContainer;
	}
});

/*
 * @class Control.Layers
 * @aka L.Control.Layers
 * @inherits Control
 *
 * The layers control gives users the ability to switch between different base layers and switch overlays on/off (check out the [detailed example](http://leafletjs.com/examples/layers-control/)). Extends `Control`.
 *
 * @example
 *
 * ```js
 * var baseLayers = {
 * 	"Mapbox": mapbox,
 * 	"OpenStreetMap": osm
 * };
 *
 * var overlays = {
 * 	"Marker": marker,
 * 	"Roads": roadsLayer
 * };
 *
 * L.control.layers(baseLayers, overlays).addTo(map);
 * ```
 *
 * The `baseLayers` and `overlays` parameters are object literals with layer names as keys and `Layer` objects as values:
 *
 * ```js
 * {
 *     "<someName1>": layer1,
 *     "<someName2>": layer2
 * }
 * ```
 *
 * The layer names can contain HTML, which allows you to add additional styling to the items:
 *
 * ```js
 * {"<img src='my-layer-icon' /> <span class='my-layer-item'>My Layer</span>": myLayer}
 * ```
 */

var Layers = Control.extend({
	// @section
	// @aka Control.Layers options
	options: {
		// @option collapsed: Boolean = true
		// If `true`, the control will be collapsed into an icon and expanded on mouse hover or touch.
		collapsed: true,
		position: 'topright',

		// @option autoZIndex: Boolean = true
		// If `true`, the control will assign zIndexes in increasing order to all of its layers so that the order is preserved when switching them on/off.
		autoZIndex: true,

		// @option hideSingleBase: Boolean = false
		// If `true`, the base layers in the control will be hidden when there is only one.
		hideSingleBase: false,

		// @option sortLayers: Boolean = false
		// Whether to sort the layers. When `false`, layers will keep the order
		// in which they were added to the control.
		sortLayers: false,

		// @option sortFunction: Function = *
		// A [compare function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
		// that will be used for sorting the layers, when `sortLayers` is `true`.
		// The function receives both the `L.Layer` instances and their names, as in
		// `sortFunction(layerA, layerB, nameA, nameB)`.
		// By default, it sorts layers alphabetically by their name.
		sortFunction: function (layerA, layerB, nameA, nameB) {
			return nameA < nameB ? -1 : (nameB < nameA ? 1 : 0);
		}
	},

	initialize: function (baseLayers, overlays, options) {
		setOptions(this, options);

		this._layerControlInputs = [];
		this._layers = [];
		this._lastZIndex = 0;
		this._handlingClick = false;

		for (var i in baseLayers) {
			this._addLayer(baseLayers[i], i);
		}

		for (i in overlays) {
			this._addLayer(overlays[i], i, true);
		}
	},

	onAdd: function (map) {
		this._initLayout();
		this._update();

		this._map = map;
		map.on('zoomend', this._checkDisabledLayers, this);

		for (var i = 0; i < this._layers.length; i++) {
			this._layers[i].layer.on('add remove', this._onLayerChange, this);
		}

		return this._container;
	},

	addTo: function (map) {
		Control.prototype.addTo.call(this, map);
		// Trigger expand after Layers Control has been inserted into DOM so that is now has an actual height.
		return this._expandIfNotCollapsed();
	},

	onRemove: function () {
		this._map.off('zoomend', this._checkDisabledLayers, this);

		for (var i = 0; i < this._layers.length; i++) {
			this._layers[i].layer.off('add remove', this._onLayerChange, this);
		}
	},

	// @method addBaseLayer(layer: Layer, name: String): this
	// Adds a base layer (radio button entry) with the given name to the control.
	addBaseLayer: function (layer, name) {
		this._addLayer(layer, name);
		return (this._map) ? this._update() : this;
	},

	// @method addOverlay(layer: Layer, name: String): this
	// Adds an overlay (checkbox entry) with the given name to the control.
	addOverlay: function (layer, name) {
		this._addLayer(layer, name, true);
		return (this._map) ? this._update() : this;
	},

	// @method removeLayer(layer: Layer): this
	// Remove the given layer from the control.
	removeLayer: function (layer) {
		layer.off('add remove', this._onLayerChange, this);

		var obj = this._getLayer(stamp(layer));
		if (obj) {
			this._layers.splice(this._layers.indexOf(obj), 1);
		}
		return (this._map) ? this._update() : this;
	},

	// @method expand(): this
	// Expand the control container if collapsed.
	expand: function () {
		addClass(this._container, 'leaflet-control-layers-expanded');
		this._form.style.height = null;
		var acceptableHeight = this._map.getSize().y - (this._container.offsetTop + 50);
		if (acceptableHeight < this._form.clientHeight) {
			addClass(this._form, 'leaflet-control-layers-scrollbar');
			this._form.style.height = acceptableHeight + 'px';
		} else {
			removeClass(this._form, 'leaflet-control-layers-scrollbar');
		}
		this._checkDisabledLayers();
		return this;
	},

	// @method collapse(): this
	// Collapse the control container if expanded.
	collapse: function () {
		removeClass(this._container, 'leaflet-control-layers-expanded');
		return this;
	},

	_initLayout: function () {
		var className = 'leaflet-control-layers',
		    container = this._container = create$1('div', className),
		    collapsed = this.options.collapsed;

		// makes this work on IE touch devices by stopping it from firing a mouseout event when the touch is released
		container.setAttribute('aria-haspopup', true);

		disableClickPropagation(container);
		disableScrollPropagation(container);

		var form = this._form = create$1('form', className + '-list');

		if (collapsed) {
			this._map.on('click', this.collapse, this);

			if (!android) {
				on(container, {
					mouseenter: this.expand,
					mouseleave: this.collapse
				}, this);
			}
		}

		var link = this._layersLink = create$1('a', className + '-toggle', container);
		link.href = '#';
		link.title = 'Layers';

		if (touch) {
			on(link, 'click', stop);
			on(link, 'click', this.expand, this);
		} else {
			on(link, 'focus', this.expand, this);
		}

		if (!collapsed) {
			this.expand();
		}

		this._baseLayersList = create$1('div', className + '-base', form);
		this._separator = create$1('div', className + '-separator', form);
		this._overlaysList = create$1('div', className + '-overlays', form);

		container.appendChild(form);
	},

	_getLayer: function (id) {
		for (var i = 0; i < this._layers.length; i++) {

			if (this._layers[i] && stamp(this._layers[i].layer) === id) {
				return this._layers[i];
			}
		}
	},

	_addLayer: function (layer, name, overlay) {
		if (this._map) {
			layer.on('add remove', this._onLayerChange, this);
		}

		this._layers.push({
			layer: layer,
			name: name,
			overlay: overlay
		});

		if (this.options.sortLayers) {
			this._layers.sort(bind(function (a, b) {
				return this.options.sortFunction(a.layer, b.layer, a.name, b.name);
			}, this));
		}

		if (this.options.autoZIndex && layer.setZIndex) {
			this._lastZIndex++;
			layer.setZIndex(this._lastZIndex);
		}

		this._expandIfNotCollapsed();
	},

	_update: function () {
		if (!this._container) { return this; }

		empty(this._baseLayersList);
		empty(this._overlaysList);

		this._layerControlInputs = [];
		var baseLayersPresent, overlaysPresent, i, obj, baseLayersCount = 0;

		for (i = 0; i < this._layers.length; i++) {
			obj = this._layers[i];
			this._addItem(obj);
			overlaysPresent = overlaysPresent || obj.overlay;
			baseLayersPresent = baseLayersPresent || !obj.overlay;
			baseLayersCount += !obj.overlay ? 1 : 0;
		}

		// Hide base layers section if there's only one layer.
		if (this.options.hideSingleBase) {
			baseLayersPresent = baseLayersPresent && baseLayersCount > 1;
			this._baseLayersList.style.display = baseLayersPresent ? '' : 'none';
		}

		this._separator.style.display = overlaysPresent && baseLayersPresent ? '' : 'none';

		return this;
	},

	_onLayerChange: function (e) {
		if (!this._handlingClick) {
			this._update();
		}

		var obj = this._getLayer(stamp(e.target));

		// @namespace Map
		// @section Layer events
		// @event baselayerchange: LayersControlEvent
		// Fired when the base layer is changed through the [layer control](#control-layers).
		// @event overlayadd: LayersControlEvent
		// Fired when an overlay is selected through the [layer control](#control-layers).
		// @event overlayremove: LayersControlEvent
		// Fired when an overlay is deselected through the [layer control](#control-layers).
		// @namespace Control.Layers
		var type = obj.overlay ?
			(e.type === 'add' ? 'overlayadd' : 'overlayremove') :
			(e.type === 'add' ? 'baselayerchange' : null);

		if (type) {
			this._map.fire(type, obj);
		}
	},

	// IE7 bugs out if you create a radio dynamically, so you have to do it this hacky way (see http://bit.ly/PqYLBe)
	_createRadioElement: function (name, checked) {

		var radioHtml = '<input type="radio" class="leaflet-control-layers-selector" name="' +
				name + '"' + (checked ? ' checked="checked"' : '') + '/>';

		var radioFragment = document.createElement('div');
		radioFragment.innerHTML = radioHtml;

		return radioFragment.firstChild;
	},

	_addItem: function (obj) {
		var label = document.createElement('label'),
		    checked = this._map.hasLayer(obj.layer),
		    input;

		if (obj.overlay) {
			input = document.createElement('input');
			input.type = 'checkbox';
			input.className = 'leaflet-control-layers-selector';
			input.defaultChecked = checked;
		} else {
			input = this._createRadioElement('leaflet-base-layers', checked);
		}

		this._layerControlInputs.push(input);
		input.layerId = stamp(obj.layer);

		on(input, 'click', this._onInputClick, this);

		var name = document.createElement('span');
		name.innerHTML = ' ' + obj.name;

		// Helps from preventing layer control flicker when checkboxes are disabled
		// https://github.com/Leaflet/Leaflet/issues/2771
		var holder = document.createElement('div');

		label.appendChild(holder);
		holder.appendChild(input);
		holder.appendChild(name);

		var container = obj.overlay ? this._overlaysList : this._baseLayersList;
		container.appendChild(label);

		this._checkDisabledLayers();
		return label;
	},

	_onInputClick: function () {
		var inputs = this._layerControlInputs,
		    input, layer;
		var addedLayers = [],
		    removedLayers = [];

		this._handlingClick = true;

		for (var i = inputs.length - 1; i >= 0; i--) {
			input = inputs[i];
			layer = this._getLayer(input.layerId).layer;

			if (input.checked) {
				addedLayers.push(layer);
			} else if (!input.checked) {
				removedLayers.push(layer);
			}
		}

		// Bugfix issue 2318: Should remove all old layers before readding new ones
		for (i = 0; i < removedLayers.length; i++) {
			if (this._map.hasLayer(removedLayers[i])) {
				this._map.removeLayer(removedLayers[i]);
			}
		}
		for (i = 0; i < addedLayers.length; i++) {
			if (!this._map.hasLayer(addedLayers[i])) {
				this._map.addLayer(addedLayers[i]);
			}
		}

		this._handlingClick = false;

		this._refocusOnMap();
	},

	_checkDisabledLayers: function () {
		var inputs = this._layerControlInputs,
		    input,
		    layer,
		    zoom = this._map.getZoom();

		for (var i = inputs.length - 1; i >= 0; i--) {
			input = inputs[i];
			layer = this._getLayer(input.layerId).layer;
			input.disabled = (layer.options.minZoom !== undefined && zoom < layer.options.minZoom) ||
			                 (layer.options.maxZoom !== undefined && zoom > layer.options.maxZoom);

		}
	},

	_expandIfNotCollapsed: function () {
		if (this._map && !this.options.collapsed) {
			this.expand();
		}
		return this;
	},

	_expand: function () {
		// Backward compatibility, remove me in 1.1.
		return this.expand();
	},

	_collapse: function () {
		// Backward compatibility, remove me in 1.1.
		return this.collapse();
	}

});


// @factory L.control.layers(baselayers?: Object, overlays?: Object, options?: Control.Layers options)
// Creates an attribution control with the given layers. Base layers will be switched with radio buttons, while overlays will be switched with checkboxes. Note that all base layers should be passed in the base layers object, but only one should be added to the map during map instantiation.
var layers = function (baseLayers, overlays, options) {
	return new Layers(baseLayers, overlays, options);
};

/*
 * @class Control.Zoom
 * @aka L.Control.Zoom
 * @inherits Control
 *
 * A basic zoom control with two buttons (zoom in and zoom out). It is put on the map by default unless you set its [`zoomControl` option](#map-zoomcontrol) to `false`. Extends `Control`.
 */

var Zoom = Control.extend({
	// @section
	// @aka Control.Zoom options
	options: {
		position: 'topleft',

		// @option zoomInText: String = '+'
		// The text set on the 'zoom in' button.
		zoomInText: '+',

		// @option zoomInTitle: String = 'Zoom in'
		// The title set on the 'zoom in' button.
		zoomInTitle: 'Zoom in',

		// @option zoomOutText: String = '&#x2212;'
		// The text set on the 'zoom out' button.
		zoomOutText: '&#x2212;',

		// @option zoomOutTitle: String = 'Zoom out'
		// The title set on the 'zoom out' button.
		zoomOutTitle: 'Zoom out'
	},

	onAdd: function (map) {
		var zoomName = 'leaflet-control-zoom',
		    container = create$1('div', zoomName + ' leaflet-bar'),
		    options = this.options;

		this._zoomInButton  = this._createButton(options.zoomInText, options.zoomInTitle,
		        zoomName + '-in',  container, this._zoomIn);
		this._zoomOutButton = this._createButton(options.zoomOutText, options.zoomOutTitle,
		        zoomName + '-out', container, this._zoomOut);

		this._updateDisabled();
		map.on('zoomend zoomlevelschange', this._updateDisabled, this);

		return container;
	},

	onRemove: function (map) {
		map.off('zoomend zoomlevelschange', this._updateDisabled, this);
	},

	disable: function () {
		this._disabled = true;
		this._updateDisabled();
		return this;
	},

	enable: function () {
		this._disabled = false;
		this._updateDisabled();
		return this;
	},

	_zoomIn: function (e) {
		if (!this._disabled && this._map._zoom < this._map.getMaxZoom()) {
			this._map.zoomIn(this._map.options.zoomDelta * (e.shiftKey ? 3 : 1));
		}
	},

	_zoomOut: function (e) {
		if (!this._disabled && this._map._zoom > this._map.getMinZoom()) {
			this._map.zoomOut(this._map.options.zoomDelta * (e.shiftKey ? 3 : 1));
		}
	},

	_createButton: function (html, title, className, container, fn) {
		var link = create$1('a', className, container);
		link.innerHTML = html;
		link.href = '#';
		link.title = title;

		/*
		 * Will force screen readers like VoiceOver to read this as "Zoom in - button"
		 */
		link.setAttribute('role', 'button');
		link.setAttribute('aria-label', title);

		disableClickPropagation(link);
		on(link, 'click', stop);
		on(link, 'click', fn, this);
		on(link, 'click', this._refocusOnMap, this);

		return link;
	},

	_updateDisabled: function () {
		var map = this._map,
		    className = 'leaflet-disabled';

		removeClass(this._zoomInButton, className);
		removeClass(this._zoomOutButton, className);

		if (this._disabled || map._zoom === map.getMinZoom()) {
			addClass(this._zoomOutButton, className);
		}
		if (this._disabled || map._zoom === map.getMaxZoom()) {
			addClass(this._zoomInButton, className);
		}
	}
});

// @namespace Map
// @section Control options
// @option zoomControl: Boolean = true
// Whether a [zoom control](#control-zoom) is added to the map by default.
Map.mergeOptions({
	zoomControl: true
});

Map.addInitHook(function () {
	if (this.options.zoomControl) {
		// @section Controls
		// @property zoomControl: Control.Zoom
		// The default zoom control (only available if the
		// [`zoomControl` option](#map-zoomcontrol) was `true` when creating the map).
		this.zoomControl = new Zoom();
		this.addControl(this.zoomControl);
	}
});

// @namespace Control.Zoom
// @factory L.control.zoom(options: Control.Zoom options)
// Creates a zoom control
var zoom = function (options) {
	return new Zoom(options);
};

/*
 * @class Control.Scale
 * @aka L.Control.Scale
 * @inherits Control
 *
 * A simple scale control that shows the scale of the current center of screen in metric (m/km) and imperial (mi/ft) systems. Extends `Control`.
 *
 * @example
 *
 * ```js
 * L.control.scale().addTo(map);
 * ```
 */

var Scale = Control.extend({
	// @section
	// @aka Control.Scale options
	options: {
		position: 'bottomleft',

		// @option maxWidth: Number = 100
		// Maximum width of the control in pixels. The width is set dynamically to show round values (e.g. 100, 200, 500).
		maxWidth: 100,

		// @option metric: Boolean = True
		// Whether to show the metric scale line (m/km).
		metric: true,

		// @option imperial: Boolean = True
		// Whether to show the imperial scale line (mi/ft).
		imperial: true

		// @option updateWhenIdle: Boolean = false
		// If `true`, the control is updated on [`moveend`](#map-moveend), otherwise it's always up-to-date (updated on [`move`](#map-move)).
	},

	onAdd: function (map) {
		var className = 'leaflet-control-scale',
		    container = create$1('div', className),
		    options = this.options;

		this._addScales(options, className + '-line', container);

		map.on(options.updateWhenIdle ? 'moveend' : 'move', this._update, this);
		map.whenReady(this._update, this);

		return container;
	},

	onRemove: function (map) {
		map.off(this.options.updateWhenIdle ? 'moveend' : 'move', this._update, this);
	},

	_addScales: function (options, className, container) {
		if (options.metric) {
			this._mScale = create$1('div', className, container);
		}
		if (options.imperial) {
			this._iScale = create$1('div', className, container);
		}
	},

	_update: function () {
		var map = this._map,
		    y = map.getSize().y / 2;

		var maxMeters = map.distance(
			map.containerPointToLatLng([0, y]),
			map.containerPointToLatLng([this.options.maxWidth, y]));

		this._updateScales(maxMeters);
	},

	_updateScales: function (maxMeters) {
		if (this.options.metric && maxMeters) {
			this._updateMetric(maxMeters);
		}
		if (this.options.imperial && maxMeters) {
			this._updateImperial(maxMeters);
		}
	},

	_updateMetric: function (maxMeters) {
		var meters = this._getRoundNum(maxMeters),
		    label = meters < 1000 ? meters + ' m' : (meters / 1000) + ' km';

		this._updateScale(this._mScale, label, meters / maxMeters);
	},

	_updateImperial: function (maxMeters) {
		var maxFeet = maxMeters * 3.2808399,
		    maxMiles, miles, feet;

		if (maxFeet > 5280) {
			maxMiles = maxFeet / 5280;
			miles = this._getRoundNum(maxMiles);
			this._updateScale(this._iScale, miles + ' mi', miles / maxMiles);

		} else {
			feet = this._getRoundNum(maxFeet);
			this._updateScale(this._iScale, feet + ' ft', feet / maxFeet);
		}
	},

	_updateScale: function (scale, text, ratio) {
		scale.style.width = Math.round(this.options.maxWidth * ratio) + 'px';
		scale.innerHTML = text;
	},

	_getRoundNum: function (num) {
		var pow10 = Math.pow(10, (Math.floor(num) + '').length - 1),
		    d = num / pow10;

		d = d >= 10 ? 10 :
		    d >= 5 ? 5 :
		    d >= 3 ? 3 :
		    d >= 2 ? 2 : 1;

		return pow10 * d;
	}
});


// @factory L.control.scale(options?: Control.Scale options)
// Creates an scale control with the given options.
var scale = function (options) {
	return new Scale(options);
};

/*
 * @class Control.Attribution
 * @aka L.Control.Attribution
 * @inherits Control
 *
 * The attribution control allows you to display attribution data in a small text box on a map. It is put on the map by default unless you set its [`attributionControl` option](#map-attributioncontrol) to `false`, and it fetches attribution texts from layers with the [`getAttribution` method](#layer-getattribution) automatically. Extends Control.
 */

var Attribution = Control.extend({
	// @section
	// @aka Control.Attribution options
	options: {
		position: 'bottomright',

		// @option prefix: String = 'Leaflet'
		// The HTML text shown before the attributions. Pass `false` to disable.
		prefix: '<a href="http://leafletjs.com" title="A JS library for interactive maps">Leaflet</a>'
	},

	initialize: function (options) {
		setOptions(this, options);

		this._attributions = {};
	},

	onAdd: function (map) {
		map.attributionControl = this;
		this._container = create$1('div', 'leaflet-control-attribution');
		disableClickPropagation(this._container);

		// TODO ugly, refactor
		for (var i in map._layers) {
			if (map._layers[i].getAttribution) {
				this.addAttribution(map._layers[i].getAttribution());
			}
		}

		this._update();

		return this._container;
	},

	// @method setPrefix(prefix: String): this
	// Sets the text before the attributions.
	setPrefix: function (prefix) {
		this.options.prefix = prefix;
		this._update();
		return this;
	},

	// @method addAttribution(text: String): this
	// Adds an attribution text (e.g. `'Vector data &copy; Mapbox'`).
	addAttribution: function (text) {
		if (!text) { return this; }

		if (!this._attributions[text]) {
			this._attributions[text] = 0;
		}
		this._attributions[text]++;

		this._update();

		return this;
	},

	// @method removeAttribution(text: String): this
	// Removes an attribution text.
	removeAttribution: function (text) {
		if (!text) { return this; }

		if (this._attributions[text]) {
			this._attributions[text]--;
			this._update();
		}

		return this;
	},

	_update: function () {
		if (!this._map) { return; }

		var attribs = [];

		for (var i in this._attributions) {
			if (this._attributions[i]) {
				attribs.push(i);
			}
		}

		var prefixAndAttribs = [];

		if (this.options.prefix) {
			prefixAndAttribs.push(this.options.prefix);
		}
		if (attribs.length) {
			prefixAndAttribs.push(attribs.join(', '));
		}

		this._container.innerHTML = prefixAndAttribs.join(' | ');
	}
});

// @namespace Map
// @section Control options
// @option attributionControl: Boolean = true
// Whether a [attribution control](#control-attribution) is added to the map by default.
Map.mergeOptions({
	attributionControl: true
});

Map.addInitHook(function () {
	if (this.options.attributionControl) {
		new Attribution().addTo(this);
	}
});

// @namespace Control.Attribution
// @factory L.control.attribution(options: Control.Attribution options)
// Creates an attribution control.
var attribution = function (options) {
	return new Attribution(options);
};

Control.Layers = Layers;
Control.Zoom = Zoom;
Control.Scale = Scale;
Control.Attribution = Attribution;

control.layers = layers;
control.zoom = zoom;
control.scale = scale;
control.attribution = attribution;

/*
	L.Handler is a base class for handler classes that are used internally to inject
	interaction features like dragging to classes like Map and Marker.
*/

// @class Handler
// @aka L.Handler
// Abstract class for map interaction handlers

var Handler = Class.extend({
	initialize: function (map) {
		this._map = map;
	},

	// @method enable(): this
	// Enables the handler
	enable: function () {
		if (this._enabled) { return this; }

		this._enabled = true;
		this.addHooks();
		return this;
	},

	// @method disable(): this
	// Disables the handler
	disable: function () {
		if (!this._enabled) { return this; }

		this._enabled = false;
		this.removeHooks();
		return this;
	},

	// @method enabled(): Boolean
	// Returns `true` if the handler is enabled
	enabled: function () {
		return !!this._enabled;
	}

	// @section Extension methods
	// Classes inheriting from `Handler` must implement the two following methods:
	// @method addHooks()
	// Called when the handler is enabled, should add event hooks.
	// @method removeHooks()
	// Called when the handler is disabled, should remove the event hooks added previously.
});

// @section There is static function which can be called without instantiating L.Handler:
// @function addTo(map: Map, name: String): this
// Adds a new Handler to the given map with the given name.
Handler.addTo = function (map, name) {
	map.addHandler(name, this);
	return this;
};

var Mixin = {Events: Events};

/*
 * @class Draggable
 * @aka L.Draggable
 * @inherits Evented
 *
 * A class for making DOM elements draggable (including touch support).
 * Used internally for map and marker dragging. Only works for elements
 * that were positioned with [`L.DomUtil.setPosition`](#domutil-setposition).
 *
 * @example
 * ```js
 * var draggable = new L.Draggable(elementToDrag);
 * draggable.enable();
 * ```
 */

var START = touch ? 'touchstart mousedown' : 'mousedown';
var END = {
	mousedown: 'mouseup',
	touchstart: 'touchend',
	pointerdown: 'touchend',
	MSPointerDown: 'touchend'
};
var MOVE = {
	mousedown: 'mousemove',
	touchstart: 'touchmove',
	pointerdown: 'touchmove',
	MSPointerDown: 'touchmove'
};


var Draggable = Evented.extend({

	options: {
		// @section
		// @aka Draggable options
		// @option clickTolerance: Number = 3
		// The max number of pixels a user can shift the mouse pointer during a click
		// for it to be considered a valid click (as opposed to a mouse drag).
		clickTolerance: 3
	},

	// @constructor L.Draggable(el: HTMLElement, dragHandle?: HTMLElement, preventOutline?: Boolean, options?: Draggable options)
	// Creates a `Draggable` object for moving `el` when you start dragging the `dragHandle` element (equals `el` itself by default).
	initialize: function (element, dragStartTarget, preventOutline$$1, options) {
		setOptions(this, options);

		this._element = element;
		this._dragStartTarget = dragStartTarget || element;
		this._preventOutline = preventOutline$$1;
	},

	// @method enable()
	// Enables the dragging ability
	enable: function () {
		if (this._enabled) { return; }

		on(this._dragStartTarget, START, this._onDown, this);

		this._enabled = true;
	},

	// @method disable()
	// Disables the dragging ability
	disable: function () {
		if (!this._enabled) { return; }

		// If we're currently dragging this draggable,
		// disabling it counts as first ending the drag.
		if (Draggable._dragging === this) {
			this.finishDrag();
		}

		off(this._dragStartTarget, START, this._onDown, this);

		this._enabled = false;
		this._moved = false;
	},

	_onDown: function (e) {
		// Ignore simulated events, since we handle both touch and
		// mouse explicitly; otherwise we risk getting duplicates of
		// touch events, see #4315.
		// Also ignore the event if disabled; this happens in IE11
		// under some circumstances, see #3666.
		if (e._simulated || !this._enabled) { return; }

		this._moved = false;

		if (hasClass(this._element, 'leaflet-zoom-anim')) { return; }

		if (Draggable._dragging || e.shiftKey || ((e.which !== 1) && (e.button !== 1) && !e.touches)) { return; }
		Draggable._dragging = this;  // Prevent dragging multiple objects at once.

		if (this._preventOutline) {
			preventOutline(this._element);
		}

		disableImageDrag();
		disableTextSelection();

		if (this._moving) { return; }

		// @event down: Event
		// Fired when a drag is about to start.
		this.fire('down');

		var first = e.touches ? e.touches[0] : e,
		    sizedParent = getSizedParentNode(this._element);

		this._startPoint = new Point(first.clientX, first.clientY);

		// Cache the scale, so that we can continuously compensate for it during drag (_onMove).
		this._parentScale = getScale(sizedParent);

		on(document, MOVE[e.type], this._onMove, this);
		on(document, END[e.type], this._onUp, this);
	},

	_onMove: function (e) {
		// Ignore simulated events, since we handle both touch and
		// mouse explicitly; otherwise we risk getting duplicates of
		// touch events, see #4315.
		// Also ignore the event if disabled; this happens in IE11
		// under some circumstances, see #3666.
		if (e._simulated || !this._enabled) { return; }

		if (e.touches && e.touches.length > 1) {
			this._moved = true;
			return;
		}

		var first = (e.touches && e.touches.length === 1 ? e.touches[0] : e),
		    offset = new Point(first.clientX, first.clientY)._subtract(this._startPoint);

		if (!offset.x && !offset.y) { return; }
		if (Math.abs(offset.x) + Math.abs(offset.y) < this.options.clickTolerance) { return; }

		// We assume that the parent container's position, border and scale do not change for the duration of the drag.
		// Therefore there is no need to account for the position and border (they are eliminated by the subtraction)
		// and we can use the cached value for the scale.
		offset.x /= this._parentScale.x;
		offset.y /= this._parentScale.y;

		preventDefault(e);

		if (!this._moved) {
			// @event dragstart: Event
			// Fired when a drag starts
			this.fire('dragstart');

			this._moved = true;
			this._startPos = getPosition(this._element).subtract(offset);

			addClass(document.body, 'leaflet-dragging');

			this._lastTarget = e.target || e.srcElement;
			// IE and Edge do not give the <use> element, so fetch it
			// if necessary
			if ((window.SVGElementInstance) && (this._lastTarget instanceof SVGElementInstance)) {
				this._lastTarget = this._lastTarget.correspondingUseElement;
			}
			addClass(this._lastTarget, 'leaflet-drag-target');
		}

		this._newPos = this._startPos.add(offset);
		this._moving = true;

		cancelAnimFrame(this._animRequest);
		this._lastEvent = e;
		this._animRequest = requestAnimFrame(this._updatePosition, this, true);
	},

	_updatePosition: function () {
		var e = {originalEvent: this._lastEvent};

		// @event predrag: Event
		// Fired continuously during dragging *before* each corresponding
		// update of the element's position.
		this.fire('predrag', e);
		setPosition(this._element, this._newPos);

		// @event drag: Event
		// Fired continuously during dragging.
		this.fire('drag', e);
	},

	_onUp: function (e) {
		// Ignore simulated events, since we handle both touch and
		// mouse explicitly; otherwise we risk getting duplicates of
		// touch events, see #4315.
		// Also ignore the event if disabled; this happens in IE11
		// under some circumstances, see #3666.
		if (e._simulated || !this._enabled) { return; }
		this.finishDrag();
	},

	finishDrag: function () {
		removeClass(document.body, 'leaflet-dragging');

		if (this._lastTarget) {
			removeClass(this._lastTarget, 'leaflet-drag-target');
			this._lastTarget = null;
		}

		for (var i in MOVE) {
			off(document, MOVE[i], this._onMove, this);
			off(document, END[i], this._onUp, this);
		}

		enableImageDrag();
		enableTextSelection();

		if (this._moved && this._moving) {
			// ensure drag is not fired after dragend
			cancelAnimFrame(this._animRequest);

			// @event dragend: DragEndEvent
			// Fired when the drag ends.
			this.fire('dragend', {
				distance: this._newPos.distanceTo(this._startPos)
			});
		}

		this._moving = false;
		Draggable._dragging = false;
	}

});

/*
 * @namespace LineUtil
 *
 * Various utility functions for polyline points processing, used by Leaflet internally to make polylines lightning-fast.
 */

// Simplify polyline with vertex reduction and Douglas-Peucker simplification.
// Improves rendering performance dramatically by lessening the number of points to draw.

// @function simplify(points: Point[], tolerance: Number): Point[]
// Dramatically reduces the number of points in a polyline while retaining
// its shape and returns a new array of simplified points, using the
// [Douglas-Peucker algorithm](http://en.wikipedia.org/wiki/Douglas-Peucker_algorithm).
// Used for a huge performance boost when processing/displaying Leaflet polylines for
// each zoom level and also reducing visual noise. tolerance affects the amount of
// simplification (lesser value means higher quality but slower and with more points).
// Also released as a separated micro-library [Simplify.js](http://mourner.github.com/simplify-js/).
function simplify(points, tolerance) {
	if (!tolerance || !points.length) {
		return points.slice();
	}

	var sqTolerance = tolerance * tolerance;

	    // stage 1: vertex reduction
	    points = _reducePoints(points, sqTolerance);

	    // stage 2: Douglas-Peucker simplification
	    points = _simplifyDP(points, sqTolerance);

	return points;
}

// @function pointToSegmentDistance(p: Point, p1: Point, p2: Point): Number
// Returns the distance between point `p` and segment `p1` to `p2`.
function pointToSegmentDistance(p, p1, p2) {
	return Math.sqrt(_sqClosestPointOnSegment(p, p1, p2, true));
}

// @function closestPointOnSegment(p: Point, p1: Point, p2: Point): Number
// Returns the closest point from a point `p` on a segment `p1` to `p2`.
function closestPointOnSegment(p, p1, p2) {
	return _sqClosestPointOnSegment(p, p1, p2);
}

// Douglas-Peucker simplification, see http://en.wikipedia.org/wiki/Douglas-Peucker_algorithm
function _simplifyDP(points, sqTolerance) {

	var len = points.length,
	    ArrayConstructor = typeof Uint8Array !== undefined + '' ? Uint8Array : Array,
	    markers = new ArrayConstructor(len);

	    markers[0] = markers[len - 1] = 1;

	_simplifyDPStep(points, markers, sqTolerance, 0, len - 1);

	var i,
	    newPoints = [];

	for (i = 0; i < len; i++) {
		if (markers[i]) {
			newPoints.push(points[i]);
		}
	}

	return newPoints;
}

function _simplifyDPStep(points, markers, sqTolerance, first, last) {

	var maxSqDist = 0,
	index, i, sqDist;

	for (i = first + 1; i <= last - 1; i++) {
		sqDist = _sqClosestPointOnSegment(points[i], points[first], points[last], true);

		if (sqDist > maxSqDist) {
			index = i;
			maxSqDist = sqDist;
		}
	}

	if (maxSqDist > sqTolerance) {
		markers[index] = 1;

		_simplifyDPStep(points, markers, sqTolerance, first, index);
		_simplifyDPStep(points, markers, sqTolerance, index, last);
	}
}

// reduce points that are too close to each other to a single point
function _reducePoints(points, sqTolerance) {
	var reducedPoints = [points[0]];

	for (var i = 1, prev = 0, len = points.length; i < len; i++) {
		if (_sqDist(points[i], points[prev]) > sqTolerance) {
			reducedPoints.push(points[i]);
			prev = i;
		}
	}
	if (prev < len - 1) {
		reducedPoints.push(points[len - 1]);
	}
	return reducedPoints;
}

var _lastCode;

// @function clipSegment(a: Point, b: Point, bounds: Bounds, useLastCode?: Boolean, round?: Boolean): Point[]|Boolean
// Clips the segment a to b by rectangular bounds with the
// [Cohen-Sutherland algorithm](https://en.wikipedia.org/wiki/Cohen%E2%80%93Sutherland_algorithm)
// (modifying the segment points directly!). Used by Leaflet to only show polyline
// points that are on the screen or near, increasing performance.
function clipSegment(a, b, bounds, useLastCode, round) {
	var codeA = useLastCode ? _lastCode : _getBitCode(a, bounds),
	    codeB = _getBitCode(b, bounds),

	    codeOut, p, newCode;

	    // save 2nd code to avoid calculating it on the next segment
	    _lastCode = codeB;

	while (true) {
		// if a,b is inside the clip window (trivial accept)
		if (!(codeA | codeB)) {
			return [a, b];
		}

		// if a,b is outside the clip window (trivial reject)
		if (codeA & codeB) {
			return false;
		}

		// other cases
		codeOut = codeA || codeB;
		p = _getEdgeIntersection(a, b, codeOut, bounds, round);
		newCode = _getBitCode(p, bounds);

		if (codeOut === codeA) {
			a = p;
			codeA = newCode;
		} else {
			b = p;
			codeB = newCode;
		}
	}
}

function _getEdgeIntersection(a, b, code, bounds, round) {
	var dx = b.x - a.x,
	    dy = b.y - a.y,
	    min = bounds.min,
	    max = bounds.max,
	    x, y;

	if (code & 8) { // top
		x = a.x + dx * (max.y - a.y) / dy;
		y = max.y;

	} else if (code & 4) { // bottom
		x = a.x + dx * (min.y - a.y) / dy;
		y = min.y;

	} else if (code & 2) { // right
		x = max.x;
		y = a.y + dy * (max.x - a.x) / dx;

	} else if (code & 1) { // left
		x = min.x;
		y = a.y + dy * (min.x - a.x) / dx;
	}

	return new Point(x, y, round);
}

function _getBitCode(p, bounds) {
	var code = 0;

	if (p.x < bounds.min.x) { // left
		code |= 1;
	} else if (p.x > bounds.max.x) { // right
		code |= 2;
	}

	if (p.y < bounds.min.y) { // bottom
		code |= 4;
	} else if (p.y > bounds.max.y) { // top
		code |= 8;
	}

	return code;
}

// square distance (to avoid unnecessary Math.sqrt calls)
function _sqDist(p1, p2) {
	var dx = p2.x - p1.x,
	    dy = p2.y - p1.y;
	return dx * dx + dy * dy;
}

// return closest point on segment or distance to that point
function _sqClosestPointOnSegment(p, p1, p2, sqDist) {
	var x = p1.x,
	    y = p1.y,
	    dx = p2.x - x,
	    dy = p2.y - y,
	    dot = dx * dx + dy * dy,
	    t;

	if (dot > 0) {
		t = ((p.x - x) * dx + (p.y - y) * dy) / dot;

		if (t > 1) {
			x = p2.x;
			y = p2.y;
		} else if (t > 0) {
			x += dx * t;
			y += dy * t;
		}
	}

	dx = p.x - x;
	dy = p.y - y;

	return sqDist ? dx * dx + dy * dy : new Point(x, y);
}


// @function isFlat(latlngs: LatLng[]): Boolean
// Returns true if `latlngs` is a flat array, false is nested.
function isFlat(latlngs) {
	return !isArray(latlngs[0]) || (typeof latlngs[0][0] !== 'object' && typeof latlngs[0][0] !== 'undefined');
}

function _flat(latlngs) {
	console.warn('Deprecated use of _flat, please use L.LineUtil.isFlat instead.');
	return isFlat(latlngs);
}


var LineUtil = (Object.freeze || Object)({
	simplify: simplify,
	pointToSegmentDistance: pointToSegmentDistance,
	closestPointOnSegment: closestPointOnSegment,
	clipSegment: clipSegment,
	_getEdgeIntersection: _getEdgeIntersection,
	_getBitCode: _getBitCode,
	_sqClosestPointOnSegment: _sqClosestPointOnSegment,
	isFlat: isFlat,
	_flat: _flat
});

/*
 * @namespace PolyUtil
 * Various utility functions for polygon geometries.
 */

/* @function clipPolygon(points: Point[], bounds: Bounds, round?: Boolean): Point[]
 * Clips the polygon geometry defined by the given `points` by the given bounds (using the [Sutherland-Hodgman algorithm](https://en.wikipedia.org/wiki/Sutherland%E2%80%93Hodgman_algorithm)).
 * Used by Leaflet to only show polygon points that are on the screen or near, increasing
 * performance. Note that polygon points needs different algorithm for clipping
 * than polyline, so there's a separate method for it.
 */
function clipPolygon(points, bounds, round) {
	var clippedPoints,
	    edges = [1, 4, 2, 8],
	    i, j, k,
	    a, b,
	    len, edge, p;

	for (i = 0, len = points.length; i < len; i++) {
		points[i]._code = _getBitCode(points[i], bounds);
	}

	// for each edge (left, bottom, right, top)
	for (k = 0; k < 4; k++) {
		edge = edges[k];
		clippedPoints = [];

		for (i = 0, len = points.length, j = len - 1; i < len; j = i++) {
			a = points[i];
			b = points[j];

			// if a is inside the clip window
			if (!(a._code & edge)) {
				// if b is outside the clip window (a->b goes out of screen)
				if (b._code & edge) {
					p = _getEdgeIntersection(b, a, edge, bounds, round);
					p._code = _getBitCode(p, bounds);
					clippedPoints.push(p);
				}
				clippedPoints.push(a);

			// else if b is inside the clip window (a->b enters the screen)
			} else if (!(b._code & edge)) {
				p = _getEdgeIntersection(b, a, edge, bounds, round);
				p._code = _getBitCode(p, bounds);
				clippedPoints.push(p);
			}
		}
		points = clippedPoints;
	}

	return points;
}


var PolyUtil = (Object.freeze || Object)({
	clipPolygon: clipPolygon
});

/*
 * @namespace Projection
 * @section
 * Leaflet comes with a set of already defined Projections out of the box:
 *
 * @projection L.Projection.LonLat
 *
 * Equirectangular, or Plate Carree projection — the most simple projection,
 * mostly used by GIS enthusiasts. Directly maps `x` as longitude, and `y` as
 * latitude. Also suitable for flat worlds, e.g. game maps. Used by the
 * `EPSG:4326` and `Simple` CRS.
 */

var LonLat = {
	project: function (latlng) {
		return new Point(latlng.lng, latlng.lat);
	},

	unproject: function (point) {
		return new LatLng(point.y, point.x);
	},

	bounds: new Bounds([-180, -90], [180, 90])
};

/*
 * @namespace Projection
 * @projection L.Projection.Mercator
 *
 * Elliptical Mercator projection — more complex than Spherical Mercator. Takes into account that Earth is a geoid, not a perfect sphere. Used by the EPSG:3395 CRS.
 */

var Mercator = {
	R: 6378137,
	R_MINOR: 6356752.314245179,

	bounds: new Bounds([-20037508.34279, -15496570.73972], [20037508.34279, 18764656.23138]),

	project: function (latlng) {
		var d = Math.PI / 180,
		    r = this.R,
		    y = latlng.lat * d,
		    tmp = this.R_MINOR / r,
		    e = Math.sqrt(1 - tmp * tmp),
		    con = e * Math.sin(y);

		var ts = Math.tan(Math.PI / 4 - y / 2) / Math.pow((1 - con) / (1 + con), e / 2);
		y = -r * Math.log(Math.max(ts, 1E-10));

		return new Point(latlng.lng * d * r, y);
	},

	unproject: function (point) {
		var d = 180 / Math.PI,
		    r = this.R,
		    tmp = this.R_MINOR / r,
		    e = Math.sqrt(1 - tmp * tmp),
		    ts = Math.exp(-point.y / r),
		    phi = Math.PI / 2 - 2 * Math.atan(ts);

		for (var i = 0, dphi = 0.1, con; i < 15 && Math.abs(dphi) > 1e-7; i++) {
			con = e * Math.sin(phi);
			con = Math.pow((1 - con) / (1 + con), e / 2);
			dphi = Math.PI / 2 - 2 * Math.atan(ts * con) - phi;
			phi += dphi;
		}

		return new LatLng(phi * d, point.x * d / r);
	}
};

/*
 * @class Projection

 * An object with methods for projecting geographical coordinates of the world onto
 * a flat surface (and back). See [Map projection](http://en.wikipedia.org/wiki/Map_projection).

 * @property bounds: Bounds
 * The bounds (specified in CRS units) where the projection is valid

 * @method project(latlng: LatLng): Point
 * Projects geographical coordinates into a 2D point.
 * Only accepts actual `L.LatLng` instances, not arrays.

 * @method unproject(point: Point): LatLng
 * The inverse of `project`. Projects a 2D point into a geographical location.
 * Only accepts actual `L.Point` instances, not arrays.

 * Note that the projection instances do not inherit from Leafet's `Class` object,
 * and can't be instantiated. Also, new classes can't inherit from them,
 * and methods can't be added to them with the `include` function.

 */




var index = (Object.freeze || Object)({
	LonLat: LonLat,
	Mercator: Mercator,
	SphericalMercator: SphericalMercator
});

/*
 * @namespace CRS
 * @crs L.CRS.EPSG3395
 *
 * Rarely used by some commercial tile providers. Uses Elliptical Mercator projection.
 */
var EPSG3395 = extend({}, Earth, {
	code: 'EPSG:3395',
	projection: Mercator,

	transformation: (function () {
		var scale = 0.5 / (Math.PI * Mercator.R);
		return toTransformation(scale, 0.5, -scale, 0.5);
	}())
});

/*
 * @namespace CRS
 * @crs L.CRS.EPSG4326
 *
 * A common CRS among GIS enthusiasts. Uses simple Equirectangular projection.
 *
 * Leaflet 1.0.x complies with the [TMS coordinate scheme for EPSG:4326](https://wiki.osgeo.org/wiki/Tile_Map_Service_Specification#global-geodetic),
 * which is a breaking change from 0.7.x behaviour.  If you are using a `TileLayer`
 * with this CRS, ensure that there are two 256x256 pixel tiles covering the
 * whole earth at zoom level zero, and that the tile coordinate origin is (-180,+90),
 * or (-180,-90) for `TileLayer`s with [the `tms` option](#tilelayer-tms) set.
 */

var EPSG4326 = extend({}, Earth, {
	code: 'EPSG:4326',
	projection: LonLat,
	transformation: toTransformation(1 / 180, 1, -1 / 180, 0.5)
});

/*
 * @namespace CRS
 * @crs L.CRS.Simple
 *
 * A simple CRS that maps longitude and latitude into `x` and `y` directly.
 * May be used for maps of flat surfaces (e.g. game maps). Note that the `y`
 * axis should still be inverted (going from bottom to top). `distance()` returns
 * simple euclidean distance.
 */

var Simple = extend({}, CRS, {
	projection: LonLat,
	transformation: toTransformation(1, 0, -1, 0),

	scale: function (zoom) {
		return Math.pow(2, zoom);
	},

	zoom: function (scale) {
		return Math.log(scale) / Math.LN2;
	},

	distance: function (latlng1, latlng2) {
		var dx = latlng2.lng - latlng1.lng,
		    dy = latlng2.lat - latlng1.lat;

		return Math.sqrt(dx * dx + dy * dy);
	},

	infinite: true
});

CRS.Earth = Earth;
CRS.EPSG3395 = EPSG3395;
CRS.EPSG3857 = EPSG3857;
CRS.EPSG900913 = EPSG900913;
CRS.EPSG4326 = EPSG4326;
CRS.Simple = Simple;

/*
 * @class Layer
 * @inherits Evented
 * @aka L.Layer
 * @aka ILayer
 *
 * A set of methods from the Layer base class that all Leaflet layers use.
 * Inherits all methods, options and events from `L.Evented`.
 *
 * @example
 *
 * ```js
 * var layer = L.Marker(latlng).addTo(map);
 * layer.addTo(map);
 * layer.remove();
 * ```
 *
 * @event add: Event
 * Fired after the layer is added to a map
 *
 * @event remove: Event
 * Fired after the layer is removed from a map
 */


var Layer = Evented.extend({

	// Classes extending `L.Layer` will inherit the following options:
	options: {
		// @option pane: String = 'overlayPane'
		// By default the layer will be added to the map's [overlay pane](#map-overlaypane). Overriding this option will cause the layer to be placed on another pane by default.
		pane: 'overlayPane',

		// @option attribution: String = null
		// String to be shown in the attribution control, describes the layer data, e.g. "© Mapbox".
		attribution: null,

		bubblingMouseEvents: true
	},

	/* @section
	 * Classes extending `L.Layer` will inherit the following methods:
	 *
	 * @method addTo(map: Map|LayerGroup): this
	 * Adds the layer to the given map or layer group.
	 */
	addTo: function (map) {
		map.addLayer(this);
		return this;
	},

	// @method remove: this
	// Removes the layer from the map it is currently active on.
	remove: function () {
		return this.removeFrom(this._map || this._mapToAdd);
	},

	// @method removeFrom(map: Map): this
	// Removes the layer from the given map
	removeFrom: function (obj) {
		if (obj) {
			obj.removeLayer(this);
		}
		return this;
	},

	// @method getPane(name? : String): HTMLElement
	// Returns the `HTMLElement` representing the named pane on the map. If `name` is omitted, returns the pane for this layer.
	getPane: function (name) {
		return this._map.getPane(name ? (this.options[name] || name) : this.options.pane);
	},

	addInteractiveTarget: function (targetEl) {
		this._map._targets[stamp(targetEl)] = this;
		return this;
	},

	removeInteractiveTarget: function (targetEl) {
		delete this._map._targets[stamp(targetEl)];
		return this;
	},

	// @method getAttribution: String
	// Used by the `attribution control`, returns the [attribution option](#gridlayer-attribution).
	getAttribution: function () {
		return this.options.attribution;
	},

	_layerAdd: function (e) {
		var map = e.target;

		// check in case layer gets added and then removed before the map is ready
		if (!map.hasLayer(this)) { return; }

		this._map = map;
		this._zoomAnimated = map._zoomAnimated;

		if (this.getEvents) {
			var events = this.getEvents();
			map.on(events, this);
			this.once('remove', function () {
				map.off(events, this);
			}, this);
		}

		this.onAdd(map);

		if (this.getAttribution && map.attributionControl) {
			map.attributionControl.addAttribution(this.getAttribution());
		}

		this.fire('add');
		map.fire('layeradd', {layer: this});
	}
});

/* @section Extension methods
 * @uninheritable
 *
 * Every layer should extend from `L.Layer` and (re-)implement the following methods.
 *
 * @method onAdd(map: Map): this
 * Should contain code that creates DOM elements for the layer, adds them to `map panes` where they should belong and puts listeners on relevant map events. Called on [`map.addLayer(layer)`](#map-addlayer).
 *
 * @method onRemove(map: Map): this
 * Should contain all clean up code that removes the layer's elements from the DOM and removes listeners previously added in [`onAdd`](#layer-onadd). Called on [`map.removeLayer(layer)`](#map-removelayer).
 *
 * @method getEvents(): Object
 * This optional method should return an object like `{ viewreset: this._reset }` for [`addEventListener`](#evented-addeventlistener). The event handlers in this object will be automatically added and removed from the map with your layer.
 *
 * @method getAttribution(): String
 * This optional method should return a string containing HTML to be shown on the `Attribution control` whenever the layer is visible.
 *
 * @method beforeAdd(map: Map): this
 * Optional method. Called on [`map.addLayer(layer)`](#map-addlayer), before the layer is added to the map, before events are initialized, without waiting until the map is in a usable state. Use for early initialization only.
 */


/* @namespace Map
 * @section Layer events
 *
 * @event layeradd: LayerEvent
 * Fired when a new layer is added to the map.
 *
 * @event layerremove: LayerEvent
 * Fired when some layer is removed from the map
 *
 * @section Methods for Layers and Controls
 */
Map.include({
	// @method addLayer(layer: Layer): this
	// Adds the given layer to the map
	addLayer: function (layer) {
		if (!layer._layerAdd) {
			throw new Error('The provided object is not a Layer.');
		}

		var id = stamp(layer);
		if (this._layers[id]) { return this; }
		this._layers[id] = layer;

		layer._mapToAdd = this;

		if (layer.beforeAdd) {
			layer.beforeAdd(this);
		}

		this.whenReady(layer._layerAdd, layer);

		return this;
	},

	// @method removeLayer(layer: Layer): this
	// Removes the given layer from the map.
	removeLayer: function (layer) {
		var id = stamp(layer);

		if (!this._layers[id]) { return this; }

		if (this._loaded) {
			layer.onRemove(this);
		}

		if (layer.getAttribution && this.attributionControl) {
			this.attributionControl.removeAttribution(layer.getAttribution());
		}

		delete this._layers[id];

		if (this._loaded) {
			this.fire('layerremove', {layer: layer});
			layer.fire('remove');
		}

		layer._map = layer._mapToAdd = null;

		return this;
	},

	// @method hasLayer(layer: Layer): Boolean
	// Returns `true` if the given layer is currently added to the map
	hasLayer: function (layer) {
		return !!layer && (stamp(layer) in this._layers);
	},

	/* @method eachLayer(fn: Function, context?: Object): this
	 * Iterates over the layers of the map, optionally specifying context of the iterator function.
	 * ```
	 * map.eachLayer(function(layer){
	 *     layer.bindPopup('Hello');
	 * });
	 * ```
	 */
	eachLayer: function (method, context) {
		for (var i in this._layers) {
			method.call(context, this._layers[i]);
		}
		return this;
	},

	_addLayers: function (layers) {
		layers = layers ? (isArray(layers) ? layers : [layers]) : [];

		for (var i = 0, len = layers.length; i < len; i++) {
			this.addLayer(layers[i]);
		}
	},

	_addZoomLimit: function (layer) {
		if (isNaN(layer.options.maxZoom) || !isNaN(layer.options.minZoom)) {
			this._zoomBoundLayers[stamp(layer)] = layer;
			this._updateZoomLevels();
		}
	},

	_removeZoomLimit: function (layer) {
		var id = stamp(layer);

		if (this._zoomBoundLayers[id]) {
			delete this._zoomBoundLayers[id];
			this._updateZoomLevels();
		}
	},

	_updateZoomLevels: function () {
		var minZoom = Infinity,
		    maxZoom = -Infinity,
		    oldZoomSpan = this._getZoomSpan();

		for (var i in this._zoomBoundLayers) {
			var options = this._zoomBoundLayers[i].options;

			minZoom = options.minZoom === undefined ? minZoom : Math.min(minZoom, options.minZoom);
			maxZoom = options.maxZoom === undefined ? maxZoom : Math.max(maxZoom, options.maxZoom);
		}

		this._layersMaxZoom = maxZoom === -Infinity ? undefined : maxZoom;
		this._layersMinZoom = minZoom === Infinity ? undefined : minZoom;

		// @section Map state change events
		// @event zoomlevelschange: Event
		// Fired when the number of zoomlevels on the map is changed due
		// to adding or removing a layer.
		if (oldZoomSpan !== this._getZoomSpan()) {
			this.fire('zoomlevelschange');
		}

		if (this.options.maxZoom === undefined && this._layersMaxZoom && this.getZoom() > this._layersMaxZoom) {
			this.setZoom(this._layersMaxZoom);
		}
		if (this.options.minZoom === undefined && this._layersMinZoom && this.getZoom() < this._layersMinZoom) {
			this.setZoom(this._layersMinZoom);
		}
	}
});

/*
 * @class LayerGroup
 * @aka L.LayerGroup
 * @inherits Layer
 *
 * Used to group several layers and handle them as one. If you add it to the map,
 * any layers added or removed from the group will be added/removed on the map as
 * well. Extends `Layer`.
 *
 * @example
 *
 * ```js
 * L.layerGroup([marker1, marker2])
 * 	.addLayer(polyline)
 * 	.addTo(map);
 * ```
 */

var LayerGroup = Layer.extend({

	initialize: function (layers, options) {
		setOptions(this, options);

		this._layers = {};

		var i, len;

		if (layers) {
			for (i = 0, len = layers.length; i < len; i++) {
				this.addLayer(layers[i]);
			}
		}
	},

	// @method addLayer(layer: Layer): this
	// Adds the given layer to the group.
	addLayer: function (layer) {
		var id = this.getLayerId(layer);

		this._layers[id] = layer;

		if (this._map) {
			this._map.addLayer(layer);
		}

		return this;
	},

	// @method removeLayer(layer: Layer): this
	// Removes the given layer from the group.
	// @alternative
	// @method removeLayer(id: Number): this
	// Removes the layer with the given internal ID from the group.
	removeLayer: function (layer) {
		var id = layer in this._layers ? layer : this.getLayerId(layer);

		if (this._map && this._layers[id]) {
			this._map.removeLayer(this._layers[id]);
		}

		delete this._layers[id];

		return this;
	},

	// @method hasLayer(layer: Layer): Boolean
	// Returns `true` if the given layer is currently added to the group.
	// @alternative
	// @method hasLayer(id: Number): Boolean
	// Returns `true` if the given internal ID is currently added to the group.
	hasLayer: function (layer) {
		return !!layer && (layer in this._layers || this.getLayerId(layer) in this._layers);
	},

	// @method clearLayers(): this
	// Removes all the layers from the group.
	clearLayers: function () {
		return this.eachLayer(this.removeLayer, this);
	},

	// @method invoke(methodName: String, …): this
	// Calls `methodName` on every layer contained in this group, passing any
	// additional parameters. Has no effect if the layers contained do not
	// implement `methodName`.
	invoke: function (methodName) {
		var args = Array.prototype.slice.call(arguments, 1),
		    i, layer;

		for (i in this._layers) {
			layer = this._layers[i];

			if (layer[methodName]) {
				layer[methodName].apply(layer, args);
			}
		}

		return this;
	},

	onAdd: function (map) {
		this.eachLayer(map.addLayer, map);
	},

	onRemove: function (map) {
		this.eachLayer(map.removeLayer, map);
	},

	// @method eachLayer(fn: Function, context?: Object): this
	// Iterates over the layers of the group, optionally specifying context of the iterator function.
	// ```js
	// group.eachLayer(function (layer) {
	// 	layer.bindPopup('Hello');
	// });
	// ```
	eachLayer: function (method, context) {
		for (var i in this._layers) {
			method.call(context, this._layers[i]);
		}
		return this;
	},

	// @method getLayer(id: Number): Layer
	// Returns the layer with the given internal ID.
	getLayer: function (id) {
		return this._layers[id];
	},

	// @method getLayers(): Layer[]
	// Returns an array of all the layers added to the group.
	getLayers: function () {
		var layers = [];
		this.eachLayer(layers.push, layers);
		return layers;
	},

	// @method setZIndex(zIndex: Number): this
	// Calls `setZIndex` on every layer contained in this group, passing the z-index.
	setZIndex: function (zIndex) {
		return this.invoke('setZIndex', zIndex);
	},

	// @method getLayerId(layer: Layer): Number
	// Returns the internal ID for a layer
	getLayerId: function (layer) {
		return stamp(layer);
	}
});


// @factory L.layerGroup(layers?: Layer[], options?: Object)
// Create a layer group, optionally given an initial set of layers and an `options` object.
var layerGroup = function (layers, options) {
	return new LayerGroup(layers, options);
};

/*
 * @class FeatureGroup
 * @aka L.FeatureGroup
 * @inherits LayerGroup
 *
 * Extended `LayerGroup` that makes it easier to do the same thing to all its member layers:
 *  * [`bindPopup`](#layer-bindpopup) binds a popup to all of the layers at once (likewise with [`bindTooltip`](#layer-bindtooltip))
 *  * Events are propagated to the `FeatureGroup`, so if the group has an event
 * handler, it will handle events from any of the layers. This includes mouse events
 * and custom events.
 *  * Has `layeradd` and `layerremove` events
 *
 * @example
 *
 * ```js
 * L.featureGroup([marker1, marker2, polyline])
 * 	.bindPopup('Hello world!')
 * 	.on('click', function() { alert('Clicked on a member of the group!'); })
 * 	.addTo(map);
 * ```
 */

var FeatureGroup = LayerGroup.extend({

	addLayer: function (layer) {
		if (this.hasLayer(layer)) {
			return this;
		}

		layer.addEventParent(this);

		LayerGroup.prototype.addLayer.call(this, layer);

		// @event layeradd: LayerEvent
		// Fired when a layer is added to this `FeatureGroup`
		return this.fire('layeradd', {layer: layer});
	},

	removeLayer: function (layer) {
		if (!this.hasLayer(layer)) {
			return this;
		}
		if (layer in this._layers) {
			layer = this._layers[layer];
		}

		layer.removeEventParent(this);

		LayerGroup.prototype.removeLayer.call(this, layer);

		// @event layerremove: LayerEvent
		// Fired when a layer is removed from this `FeatureGroup`
		return this.fire('layerremove', {layer: layer});
	},

	// @method setStyle(style: Path options): this
	// Sets the given path options to each layer of the group that has a `setStyle` method.
	setStyle: function (style) {
		return this.invoke('setStyle', style);
	},

	// @method bringToFront(): this
	// Brings the layer group to the top of all other layers
	bringToFront: function () {
		return this.invoke('bringToFront');
	},

	// @method bringToBack(): this
	// Brings the layer group to the back of all other layers
	bringToBack: function () {
		return this.invoke('bringToBack');
	},

	// @method getBounds(): LatLngBounds
	// Returns the LatLngBounds of the Feature Group (created from bounds and coordinates of its children).
	getBounds: function () {
		var bounds = new LatLngBounds();

		for (var id in this._layers) {
			var layer = this._layers[id];
			bounds.extend(layer.getBounds ? layer.getBounds() : layer.getLatLng());
		}
		return bounds;
	}
});

// @factory L.featureGroup(layers: Layer[])
// Create a feature group, optionally given an initial set of layers.
var featureGroup = function (layers) {
	return new FeatureGroup(layers);
};

/*
 * @class Icon
 * @aka L.Icon
 *
 * Represents an icon to provide when creating a marker.
 *
 * @example
 *
 * ```js
 * var myIcon = L.icon({
 *     iconUrl: 'my-icon.png',
 *     iconRetinaUrl: 'my-icon@2x.png',
 *     iconSize: [38, 95],
 *     iconAnchor: [22, 94],
 *     popupAnchor: [-3, -76],
 *     shadowUrl: 'my-icon-shadow.png',
 *     shadowRetinaUrl: 'my-icon-shadow@2x.png',
 *     shadowSize: [68, 95],
 *     shadowAnchor: [22, 94]
 * });
 *
 * L.marker([50.505, 30.57], {icon: myIcon}).addTo(map);
 * ```
 *
 * `L.Icon.Default` extends `L.Icon` and is the blue icon Leaflet uses for markers by default.
 *
 */

var Icon = Class.extend({

	/* @section
	 * @aka Icon options
	 *
	 * @option iconUrl: String = null
	 * **(required)** The URL to the icon image (absolute or relative to your script path).
	 *
	 * @option iconRetinaUrl: String = null
	 * The URL to a retina sized version of the icon image (absolute or relative to your
	 * script path). Used for Retina screen devices.
	 *
	 * @option iconSize: Point = null
	 * Size of the icon image in pixels.
	 *
	 * @option iconAnchor: Point = null
	 * The coordinates of the "tip" of the icon (relative to its top left corner). The icon
	 * will be aligned so that this point is at the marker's geographical location. Centered
	 * by default if size is specified, also can be set in CSS with negative margins.
	 *
	 * @option popupAnchor: Point = [0, 0]
	 * The coordinates of the point from which popups will "open", relative to the icon anchor.
	 *
	 * @option tooltipAnchor: Point = [0, 0]
	 * The coordinates of the point from which tooltips will "open", relative to the icon anchor.
	 *
	 * @option shadowUrl: String = null
	 * The URL to the icon shadow image. If not specified, no shadow image will be created.
	 *
	 * @option shadowRetinaUrl: String = null
	 *
	 * @option shadowSize: Point = null
	 * Size of the shadow image in pixels.
	 *
	 * @option shadowAnchor: Point = null
	 * The coordinates of the "tip" of the shadow (relative to its top left corner) (the same
	 * as iconAnchor if not specified).
	 *
	 * @option className: String = ''
	 * A custom class name to assign to both icon and shadow images. Empty by default.
	 */

	options: {
		popupAnchor: [0, 0],
		tooltipAnchor: [0, 0]
	},

	initialize: function (options) {
		setOptions(this, options);
	},

	// @method createIcon(oldIcon?: HTMLElement): HTMLElement
	// Called internally when the icon has to be shown, returns a `<img>` HTML element
	// styled according to the options.
	createIcon: function (oldIcon) {
		return this._createIcon('icon', oldIcon);
	},

	// @method createShadow(oldIcon?: HTMLElement): HTMLElement
	// As `createIcon`, but for the shadow beneath it.
	createShadow: function (oldIcon) {
		return this._createIcon('shadow', oldIcon);
	},

	_createIcon: function (name, oldIcon) {
		var src = this._getIconUrl(name);

		if (!src) {
			if (name === 'icon') {
				throw new Error('iconUrl not set in Icon options (see the docs).');
			}
			return null;
		}

		var img = this._createImg(src, oldIcon && oldIcon.tagName === 'IMG' ? oldIcon : null);
		this._setIconStyles(img, name);

		return img;
	},

	_setIconStyles: function (img, name) {
		var options = this.options;
		var sizeOption = options[name + 'Size'];

		if (typeof sizeOption === 'number') {
			sizeOption = [sizeOption, sizeOption];
		}

		var size = toPoint(sizeOption),
		    anchor = toPoint(name === 'shadow' && options.shadowAnchor || options.iconAnchor ||
		            size && size.divideBy(2, true));

		img.className = 'leaflet-marker-' + name + ' ' + (options.className || '');

		if (anchor) {
			img.style.marginLeft = (-anchor.x) + 'px';
			img.style.marginTop  = (-anchor.y) + 'px';
		}

		if (size) {
			img.style.width  = size.x + 'px';
			img.style.height = size.y + 'px';
		}
	},

	_createImg: function (src, el) {
		el = el || document.createElement('img');
		el.src = src;
		return el;
	},

	_getIconUrl: function (name) {
		return retina && this.options[name + 'RetinaUrl'] || this.options[name + 'Url'];
	}
});


// @factory L.icon(options: Icon options)
// Creates an icon instance with the given options.
function icon(options) {
	return new Icon(options);
}

/*
 * @miniclass Icon.Default (Icon)
 * @aka L.Icon.Default
 * @section
 *
 * A trivial subclass of `Icon`, represents the icon to use in `Marker`s when
 * no icon is specified. Points to the blue marker image distributed with Leaflet
 * releases.
 *
 * In order to customize the default icon, just change the properties of `L.Icon.Default.prototype.options`
 * (which is a set of `Icon options`).
 *
 * If you want to _completely_ replace the default icon, override the
 * `L.Marker.prototype.options.icon` with your own icon instead.
 */

var IconDefault = Icon.extend({

	options: {
		iconUrl:       'marker-icon.png',
		iconRetinaUrl: 'marker-icon-2x.png',
		shadowUrl:     'marker-shadow.png',
		iconSize:    [25, 41],
		iconAnchor:  [12, 41],
		popupAnchor: [1, -34],
		tooltipAnchor: [16, -28],
		shadowSize:  [41, 41]
	},

	_getIconUrl: function (name) {
		if (!IconDefault.imagePath) {	// Deprecated, backwards-compatibility only
			IconDefault.imagePath = this._detectIconPath();
		}

		// @option imagePath: String
		// `Icon.Default` will try to auto-detect the location of the
		// blue icon images. If you are placing these images in a non-standard
		// way, set this option to point to the right path.
		return (this.options.imagePath || IconDefault.imagePath) + Icon.prototype._getIconUrl.call(this, name);
	},

	_detectIconPath: function () {
		var el = create$1('div',  'leaflet-default-icon-path', document.body);
		var path = getStyle(el, 'background-image') ||
		           getStyle(el, 'backgroundImage');	// IE8

		document.body.removeChild(el);

		if (path === null || path.indexOf('url') !== 0) {
			path = '';
		} else {
			path = path.replace(/^url\(["']?/, '').replace(/marker-icon\.png["']?\)$/, '');
		}

		return path;
	}
});

/*
 * L.Handler.MarkerDrag is used internally by L.Marker to make the markers draggable.
 */


/* @namespace Marker
 * @section Interaction handlers
 *
 * Interaction handlers are properties of a marker instance that allow you to control interaction behavior in runtime, enabling or disabling certain features such as dragging (see `Handler` methods). Example:
 *
 * ```js
 * marker.dragging.disable();
 * ```
 *
 * @property dragging: Handler
 * Marker dragging handler (by both mouse and touch). Only valid when the marker is on the map (Otherwise set [`marker.options.draggable`](#marker-draggable)).
 */

var MarkerDrag = Handler.extend({
	initialize: function (marker) {
		this._marker = marker;
	},

	addHooks: function () {
		var icon = this._marker._icon;

		if (!this._draggable) {
			this._draggable = new Draggable(icon, icon, true);
		}

		this._draggable.on({
			dragstart: this._onDragStart,
			predrag: this._onPreDrag,
			drag: this._onDrag,
			dragend: this._onDragEnd
		}, this).enable();

		addClass(icon, 'leaflet-marker-draggable');
	},

	removeHooks: function () {
		this._draggable.off({
			dragstart: this._onDragStart,
			predrag: this._onPreDrag,
			drag: this._onDrag,
			dragend: this._onDragEnd
		}, this).disable();

		if (this._marker._icon) {
			removeClass(this._marker._icon, 'leaflet-marker-draggable');
		}
	},

	moved: function () {
		return this._draggable && this._draggable._moved;
	},

	_adjustPan: function (e) {
		var marker = this._marker,
		    map = marker._map,
		    speed = this._marker.options.autoPanSpeed,
		    padding = this._marker.options.autoPanPadding,
		    iconPos = getPosition(marker._icon),
		    bounds = map.getPixelBounds(),
		    origin = map.getPixelOrigin();

		var panBounds = toBounds(
			bounds.min._subtract(origin).add(padding),
			bounds.max._subtract(origin).subtract(padding)
		);

		if (!panBounds.contains(iconPos)) {
			// Compute incremental movement
			var movement = toPoint(
				(Math.max(panBounds.max.x, iconPos.x) - panBounds.max.x) / (bounds.max.x - panBounds.max.x) -
				(Math.min(panBounds.min.x, iconPos.x) - panBounds.min.x) / (bounds.min.x - panBounds.min.x),

				(Math.max(panBounds.max.y, iconPos.y) - panBounds.max.y) / (bounds.max.y - panBounds.max.y) -
				(Math.min(panBounds.min.y, iconPos.y) - panBounds.min.y) / (bounds.min.y - panBounds.min.y)
			).multiplyBy(speed);

			map.panBy(movement, {animate: false});

			this._draggable._newPos._add(movement);
			this._draggable._startPos._add(movement);

			setPosition(marker._icon, this._draggable._newPos);
			this._onDrag(e);

			this._panRequest = requestAnimFrame(this._adjustPan.bind(this, e));
		}
	},

	_onDragStart: function () {
		// @section Dragging events
		// @event dragstart: Event
		// Fired when the user starts dragging the marker.

		// @event movestart: Event
		// Fired when the marker starts moving (because of dragging).

		this._oldLatLng = this._marker.getLatLng();
		this._marker
		    .closePopup()
		    .fire('movestart')
		    .fire('dragstart');
	},

	_onPreDrag: function (e) {
		if (this._marker.options.autoPan) {
			cancelAnimFrame(this._panRequest);
			this._panRequest = requestAnimFrame(this._adjustPan.bind(this, e));
		}
	},

	_onDrag: function (e) {
		var marker = this._marker,
		    shadow = marker._shadow,
		    iconPos = getPosition(marker._icon),
		    latlng = marker._map.layerPointToLatLng(iconPos);

		// update shadow position
		if (shadow) {
			setPosition(shadow, iconPos);
		}

		marker._latlng = latlng;
		e.latlng = latlng;
		e.oldLatLng = this._oldLatLng;

		// @event drag: Event
		// Fired repeatedly while the user drags the marker.
		marker
		    .fire('move', e)
		    .fire('drag', e);
	},

	_onDragEnd: function (e) {
		// @event dragend: DragEndEvent
		// Fired when the user stops dragging the marker.

		 cancelAnimFrame(this._panRequest);

		// @event moveend: Event
		// Fired when the marker stops moving (because of dragging).
		delete this._oldLatLng;
		this._marker
		    .fire('moveend')
		    .fire('dragend', e);
	}
});

/*
 * @class Marker
 * @inherits Interactive layer
 * @aka L.Marker
 * L.Marker is used to display clickable/draggable icons on the map. Extends `Layer`.
 *
 * @example
 *
 * ```js
 * L.marker([50.5, 30.5]).addTo(map);
 * ```
 */

var Marker = Layer.extend({

	// @section
	// @aka Marker options
	options: {
		// @option icon: Icon = *
		// Icon instance to use for rendering the marker.
		// See [Icon documentation](#L.Icon) for details on how to customize the marker icon.
		// If not specified, a common instance of `L.Icon.Default` is used.
		icon: new IconDefault(),

		// Option inherited from "Interactive layer" abstract class
		interactive: true,

		// @option keyboard: Boolean = true
		// Whether the marker can be tabbed to with a keyboard and clicked by pressing enter.
		keyboard: true,

		// @option title: String = ''
		// Text for the browser tooltip that appear on marker hover (no tooltip by default).
		title: '',

		// @option alt: String = ''
		// Text for the `alt` attribute of the icon image (useful for accessibility).
		alt: '',

		// @option zIndexOffset: Number = 0
		// By default, marker images zIndex is set automatically based on its latitude. Use this option if you want to put the marker on top of all others (or below), specifying a high value like `1000` (or high negative value, respectively).
		zIndexOffset: 0,

		// @option opacity: Number = 1.0
		// The opacity of the marker.
		opacity: 1,

		// @option riseOnHover: Boolean = false
		// If `true`, the marker will get on top of others when you hover the mouse over it.
		riseOnHover: false,

		// @option riseOffset: Number = 250
		// The z-index offset used for the `riseOnHover` feature.
		riseOffset: 250,

		// @option pane: String = 'markerPane'
		// `Map pane` where the markers icon will be added.
		pane: 'markerPane',

		// @option bubblingMouseEvents: Boolean = false
		// When `true`, a mouse event on this marker will trigger the same event on the map
		// (unless [`L.DomEvent.stopPropagation`](#domevent-stoppropagation) is used).
		bubblingMouseEvents: false,

		// @section Draggable marker options
		// @option draggable: Boolean = false
		// Whether the marker is draggable with mouse/touch or not.
		draggable: false,

		// @option autoPan: Boolean = false
		// Whether to pan the map when dragging this marker near its edge or not.
		autoPan: false,

		// @option autoPanPadding: Point = Point(50, 50)
		// Distance (in pixels to the left/right and to the top/bottom) of the
		// map edge to start panning the map.
		autoPanPadding: [50, 50],

		// @option autoPanSpeed: Number = 10
		// Number of pixels the map should pan by.
		autoPanSpeed: 10
	},

	/* @section
	 *
	 * In addition to [shared layer methods](#Layer) like `addTo()` and `remove()` and [popup methods](#Popup) like bindPopup() you can also use the following methods:
	 */

	initialize: function (latlng, options) {
		setOptions(this, options);
		this._latlng = toLatLng(latlng);
	},

	onAdd: function (map) {
		this._zoomAnimated = this._zoomAnimated && map.options.markerZoomAnimation;

		if (this._zoomAnimated) {
			map.on('zoomanim', this._animateZoom, this);
		}

		this._initIcon();
		this.update();
	},

	onRemove: function (map) {
		if (this.dragging && this.dragging.enabled()) {
			this.options.draggable = true;
			this.dragging.removeHooks();
		}
		delete this.dragging;

		if (this._zoomAnimated) {
			map.off('zoomanim', this._animateZoom, this);
		}

		this._removeIcon();
		this._removeShadow();
	},

	getEvents: function () {
		return {
			zoom: this.update,
			viewreset: this.update
		};
	},

	// @method getLatLng: LatLng
	// Returns the current geographical position of the marker.
	getLatLng: function () {
		return this._latlng;
	},

	// @method setLatLng(latlng: LatLng): this
	// Changes the marker position to the given point.
	setLatLng: function (latlng) {
		var oldLatLng = this._latlng;
		this._latlng = toLatLng(latlng);
		this.update();

		// @event move: Event
		// Fired when the marker is moved via [`setLatLng`](#marker-setlatlng) or by [dragging](#marker-dragging). Old and new coordinates are included in event arguments as `oldLatLng`, `latlng`.
		return this.fire('move', {oldLatLng: oldLatLng, latlng: this._latlng});
	},

	// @method setZIndexOffset(offset: Number): this
	// Changes the [zIndex offset](#marker-zindexoffset) of the marker.
	setZIndexOffset: function (offset) {
		this.options.zIndexOffset = offset;
		return this.update();
	},

	// @method setIcon(icon: Icon): this
	// Changes the marker icon.
	setIcon: function (icon) {

		this.options.icon = icon;

		if (this._map) {
			this._initIcon();
			this.update();
		}

		if (this._popup) {
			this.bindPopup(this._popup, this._popup.options);
		}

		return this;
	},

	getElement: function () {
		return this._icon;
	},

	update: function () {

		if (this._icon && this._map) {
			var pos = this._map.latLngToLayerPoint(this._latlng).round();
			this._setPos(pos);
		}

		return this;
	},

	_initIcon: function () {
		var options = this.options,
		    classToAdd = 'leaflet-zoom-' + (this._zoomAnimated ? 'animated' : 'hide');

		var icon = options.icon.createIcon(this._icon),
		    addIcon = false;

		// if we're not reusing the icon, remove the old one and init new one
		if (icon !== this._icon) {
			if (this._icon) {
				this._removeIcon();
			}
			addIcon = true;

			if (options.title) {
				icon.title = options.title;
			}

			if (icon.tagName === 'IMG') {
				icon.alt = options.alt || '';
			}
		}

		addClass(icon, classToAdd);

		if (options.keyboard) {
			icon.tabIndex = '0';
		}

		this._icon = icon;

		if (options.riseOnHover) {
			this.on({
				mouseover: this._bringToFront,
				mouseout: this._resetZIndex
			});
		}

		var newShadow = options.icon.createShadow(this._shadow),
		    addShadow = false;

		if (newShadow !== this._shadow) {
			this._removeShadow();
			addShadow = true;
		}

		if (newShadow) {
			addClass(newShadow, classToAdd);
			newShadow.alt = '';
		}
		this._shadow = newShadow;


		if (options.opacity < 1) {
			this._updateOpacity();
		}


		if (addIcon) {
			this.getPane().appendChild(this._icon);
		}
		this._initInteraction();
		if (newShadow && addShadow) {
			this.getPane('shadowPane').appendChild(this._shadow);
		}
	},

	_removeIcon: function () {
		if (this.options.riseOnHover) {
			this.off({
				mouseover: this._bringToFront,
				mouseout: this._resetZIndex
			});
		}

		remove(this._icon);
		this.removeInteractiveTarget(this._icon);

		this._icon = null;
	},

	_removeShadow: function () {
		if (this._shadow) {
			remove(this._shadow);
		}
		this._shadow = null;
	},

	_setPos: function (pos) {
		setPosition(this._icon, pos);

		if (this._shadow) {
			setPosition(this._shadow, pos);
		}

		this._zIndex = pos.y + this.options.zIndexOffset;

		this._resetZIndex();
	},

	_updateZIndex: function (offset) {
		this._icon.style.zIndex = this._zIndex + offset;
	},

	_animateZoom: function (opt) {
		var pos = this._map._latLngToNewLayerPoint(this._latlng, opt.zoom, opt.center).round();

		this._setPos(pos);
	},

	_initInteraction: function () {

		if (!this.options.interactive) { return; }

		addClass(this._icon, 'leaflet-interactive');

		this.addInteractiveTarget(this._icon);

		if (MarkerDrag) {
			var draggable = this.options.draggable;
			if (this.dragging) {
				draggable = this.dragging.enabled();
				this.dragging.disable();
			}

			this.dragging = new MarkerDrag(this);

			if (draggable) {
				this.dragging.enable();
			}
		}
	},

	// @method setOpacity(opacity: Number): this
	// Changes the opacity of the marker.
	setOpacity: function (opacity) {
		this.options.opacity = opacity;
		if (this._map) {
			this._updateOpacity();
		}

		return this;
	},

	_updateOpacity: function () {
		var opacity = this.options.opacity;

		setOpacity(this._icon, opacity);

		if (this._shadow) {
			setOpacity(this._shadow, opacity);
		}
	},

	_bringToFront: function () {
		this._updateZIndex(this.options.riseOffset);
	},

	_resetZIndex: function () {
		this._updateZIndex(0);
	},

	_getPopupAnchor: function () {
		return this.options.icon.options.popupAnchor;
	},

	_getTooltipAnchor: function () {
		return this.options.icon.options.tooltipAnchor;
	}
});


// factory L.marker(latlng: LatLng, options? : Marker options)

// @factory L.marker(latlng: LatLng, options? : Marker options)
// Instantiates a Marker object given a geographical point and optionally an options object.
function marker(latlng, options) {
	return new Marker(latlng, options);
}

/*
 * @class Path
 * @aka L.Path
 * @inherits Interactive layer
 *
 * An abstract class that contains options and constants shared between vector
 * overlays (Polygon, Polyline, Circle). Do not use it directly. Extends `Layer`.
 */

var Path = Layer.extend({

	// @section
	// @aka Path options
	options: {
		// @option stroke: Boolean = true
		// Whether to draw stroke along the path. Set it to `false` to disable borders on polygons or circles.
		stroke: true,

		// @option color: String = '#3388ff'
		// Stroke color
		color: '#3388ff',

		// @option weight: Number = 3
		// Stroke width in pixels
		weight: 3,

		// @option opacity: Number = 1.0
		// Stroke opacity
		opacity: 1,

		// @option lineCap: String= 'round'
		// A string that defines [shape to be used at the end](https://developer.mozilla.org/docs/Web/SVG/Attribute/stroke-linecap) of the stroke.
		lineCap: 'round',

		// @option lineJoin: String = 'round'
		// A string that defines [shape to be used at the corners](https://developer.mozilla.org/docs/Web/SVG/Attribute/stroke-linejoin) of the stroke.
		lineJoin: 'round',

		// @option dashArray: String = null
		// A string that defines the stroke [dash pattern](https://developer.mozilla.org/docs/Web/SVG/Attribute/stroke-dasharray). Doesn't work on `Canvas`-powered layers in [some old browsers](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/setLineDash#Browser_compatibility).
		dashArray: null,

		// @option dashOffset: String = null
		// A string that defines the [distance into the dash pattern to start the dash](https://developer.mozilla.org/docs/Web/SVG/Attribute/stroke-dashoffset). Doesn't work on `Canvas`-powered layers in [some old browsers](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/setLineDash#Browser_compatibility).
		dashOffset: null,

		// @option fill: Boolean = depends
		// Whether to fill the path with color. Set it to `false` to disable filling on polygons or circles.
		fill: false,

		// @option fillColor: String = *
		// Fill color. Defaults to the value of the [`color`](#path-color) option
		fillColor: null,

		// @option fillOpacity: Number = 0.2
		// Fill opacity.
		fillOpacity: 0.2,

		// @option fillRule: String = 'evenodd'
		// A string that defines [how the inside of a shape](https://developer.mozilla.org/docs/Web/SVG/Attribute/fill-rule) is determined.
		fillRule: 'evenodd',

		// className: '',

		// Option inherited from "Interactive layer" abstract class
		interactive: true,

		// @option bubblingMouseEvents: Boolean = true
		// When `true`, a mouse event on this path will trigger the same event on the map
		// (unless [`L.DomEvent.stopPropagation`](#domevent-stoppropagation) is used).
		bubblingMouseEvents: true
	},

	beforeAdd: function (map) {
		// Renderer is set here because we need to call renderer.getEvents
		// before this.getEvents.
		this._renderer = map.getRenderer(this);
	},

	onAdd: function () {
		this._renderer._initPath(this);
		this._reset();
		this._renderer._addPath(this);
	},

	onRemove: function () {
		this._renderer._removePath(this);
	},

	// @method redraw(): this
	// Redraws the layer. Sometimes useful after you changed the coordinates that the path uses.
	redraw: function () {
		if (this._map) {
			this._renderer._updatePath(this);
		}
		return this;
	},

	// @method setStyle(style: Path options): this
	// Changes the appearance of a Path based on the options in the `Path options` object.
	setStyle: function (style) {
		setOptions(this, style);
		if (this._renderer) {
			this._renderer._updateStyle(this);
		}
		return this;
	},

	// @method bringToFront(): this
	// Brings the layer to the top of all path layers.
	bringToFront: function () {
		if (this._renderer) {
			this._renderer._bringToFront(this);
		}
		return this;
	},

	// @method bringToBack(): this
	// Brings the layer to the bottom of all path layers.
	bringToBack: function () {
		if (this._renderer) {
			this._renderer._bringToBack(this);
		}
		return this;
	},

	getElement: function () {
		return this._path;
	},

	_reset: function () {
		// defined in child classes
		this._project();
		this._update();
	},

	_clickTolerance: function () {
		// used when doing hit detection for Canvas layers
		return (this.options.stroke ? this.options.weight / 2 : 0) + this._renderer.options.tolerance;
	}
});

/*
 * @class CircleMarker
 * @aka L.CircleMarker
 * @inherits Path
 *
 * A circle of a fixed size with radius specified in pixels. Extends `Path`.
 */

var CircleMarker = Path.extend({

	// @section
	// @aka CircleMarker options
	options: {
		fill: true,

		// @option radius: Number = 10
		// Radius of the circle marker, in pixels
		radius: 10
	},

	initialize: function (latlng, options) {
		setOptions(this, options);
		this._latlng = toLatLng(latlng);
		this._radius = this.options.radius;
	},

	// @method setLatLng(latLng: LatLng): this
	// Sets the position of a circle marker to a new location.
	setLatLng: function (latlng) {
		this._latlng = toLatLng(latlng);
		this.redraw();
		return this.fire('move', {latlng: this._latlng});
	},

	// @method getLatLng(): LatLng
	// Returns the current geographical position of the circle marker
	getLatLng: function () {
		return this._latlng;
	},

	// @method setRadius(radius: Number): this
	// Sets the radius of a circle marker. Units are in pixels.
	setRadius: function (radius) {
		this.options.radius = this._radius = radius;
		return this.redraw();
	},

	// @method getRadius(): Number
	// Returns the current radius of the circle
	getRadius: function () {
		return this._radius;
	},

	setStyle : function (options) {
		var radius = options && options.radius || this._radius;
		Path.prototype.setStyle.call(this, options);
		this.setRadius(radius);
		return this;
	},

	_project: function () {
		this._point = this._map.latLngToLayerPoint(this._latlng);
		this._updateBounds();
	},

	_updateBounds: function () {
		var r = this._radius,
		    r2 = this._radiusY || r,
		    w = this._clickTolerance(),
		    p = [r + w, r2 + w];
		this._pxBounds = new Bounds(this._point.subtract(p), this._point.add(p));
	},

	_update: function () {
		if (this._map) {
			this._updatePath();
		}
	},

	_updatePath: function () {
		this._renderer._updateCircle(this);
	},

	_empty: function () {
		return this._radius && !this._renderer._bounds.intersects(this._pxBounds);
	},

	// Needed by the `Canvas` renderer for interactivity
	_containsPoint: function (p) {
		return p.distanceTo(this._point) <= this._radius + this._clickTolerance();
	}
});


// @factory L.circleMarker(latlng: LatLng, options?: CircleMarker options)
// Instantiates a circle marker object given a geographical point, and an optional options object.
function circleMarker(latlng, options) {
	return new CircleMarker(latlng, options);
}

/*
 * @class Circle
 * @aka L.Circle
 * @inherits CircleMarker
 *
 * A class for drawing circle overlays on a map. Extends `CircleMarker`.
 *
 * It's an approximation and starts to diverge from a real circle closer to poles (due to projection distortion).
 *
 * @example
 *
 * ```js
 * L.circle([50.5, 30.5], {radius: 200}).addTo(map);
 * ```
 */

var Circle = CircleMarker.extend({

	initialize: function (latlng, options, legacyOptions) {
		if (typeof options === 'number') {
			// Backwards compatibility with 0.7.x factory (latlng, radius, options?)
			options = extend({}, legacyOptions, {radius: options});
		}
		setOptions(this, options);
		this._latlng = toLatLng(latlng);

		if (isNaN(this.options.radius)) { throw new Error('Circle radius cannot be NaN'); }

		// @section
		// @aka Circle options
		// @option radius: Number; Radius of the circle, in meters.
		this._mRadius = this.options.radius;
	},

	// @method setRadius(radius: Number): this
	// Sets the radius of a circle. Units are in meters.
	setRadius: function (radius) {
		this._mRadius = radius;
		return this.redraw();
	},

	// @method getRadius(): Number
	// Returns the current radius of a circle. Units are in meters.
	getRadius: function () {
		return this._mRadius;
	},

	// @method getBounds(): LatLngBounds
	// Returns the `LatLngBounds` of the path.
	getBounds: function () {
		var half = [this._radius, this._radiusY || this._radius];

		return new LatLngBounds(
			this._map.layerPointToLatLng(this._point.subtract(half)),
			this._map.layerPointToLatLng(this._point.add(half)));
	},

	setStyle: Path.prototype.setStyle,

	_project: function () {

		var lng = this._latlng.lng,
		    lat = this._latlng.lat,
		    map = this._map,
		    crs = map.options.crs;

		if (crs.distance === Earth.distance) {
			var d = Math.PI / 180,
			    latR = (this._mRadius / Earth.R) / d,
			    top = map.project([lat + latR, lng]),
			    bottom = map.project([lat - latR, lng]),
			    p = top.add(bottom).divideBy(2),
			    lat2 = map.unproject(p).lat,
			    lngR = Math.acos((Math.cos(latR * d) - Math.sin(lat * d) * Math.sin(lat2 * d)) /
			            (Math.cos(lat * d) * Math.cos(lat2 * d))) / d;

			if (isNaN(lngR) || lngR === 0) {
				lngR = latR / Math.cos(Math.PI / 180 * lat); // Fallback for edge case, #2425
			}

			this._point = p.subtract(map.getPixelOrigin());
			this._radius = isNaN(lngR) ? 0 : p.x - map.project([lat2, lng - lngR]).x;
			this._radiusY = p.y - top.y;

		} else {
			var latlng2 = crs.unproject(crs.project(this._latlng).subtract([this._mRadius, 0]));

			this._point = map.latLngToLayerPoint(this._latlng);
			this._radius = this._point.x - map.latLngToLayerPoint(latlng2).x;
		}

		this._updateBounds();
	}
});

// @factory L.circle(latlng: LatLng, options?: Circle options)
// Instantiates a circle object given a geographical point, and an options object
// which contains the circle radius.
// @alternative
// @factory L.circle(latlng: LatLng, radius: Number, options?: Circle options)
// Obsolete way of instantiating a circle, for compatibility with 0.7.x code.
// Do not use in new applications or plugins.
function circle(latlng, options, legacyOptions) {
	return new Circle(latlng, options, legacyOptions);
}

/*
 * @class Polyline
 * @aka L.Polyline
 * @inherits Path
 *
 * A class for drawing polyline overlays on a map. Extends `Path`.
 *
 * @example
 *
 * ```js
 * // create a red polyline from an array of LatLng points
 * var latlngs = [
 * 	[45.51, -122.68],
 * 	[37.77, -122.43],
 * 	[34.04, -118.2]
 * ];
 *
 * var polyline = L.polyline(latlngs, {color: 'red'}).addTo(map);
 *
 * // zoom the map to the polyline
 * map.fitBounds(polyline.getBounds());
 * ```
 *
 * You can also pass a multi-dimensional array to represent a `MultiPolyline` shape:
 *
 * ```js
 * // create a red polyline from an array of arrays of LatLng points
 * var latlngs = [
 * 	[[45.51, -122.68],
 * 	 [37.77, -122.43],
 * 	 [34.04, -118.2]],
 * 	[[40.78, -73.91],
 * 	 [41.83, -87.62],
 * 	 [32.76, -96.72]]
 * ];
 * ```
 */


var Polyline = Path.extend({

	// @section
	// @aka Polyline options
	options: {
		// @option smoothFactor: Number = 1.0
		// How much to simplify the polyline on each zoom level. More means
		// better performance and smoother look, and less means more accurate representation.
		smoothFactor: 1.0,

		// @option noClip: Boolean = false
		// Disable polyline clipping.
		noClip: false
	},

	initialize: function (latlngs, options) {
		setOptions(this, options);
		this._setLatLngs(latlngs);
	},

	// @method getLatLngs(): LatLng[]
	// Returns an array of the points in the path, or nested arrays of points in case of multi-polyline.
	getLatLngs: function () {
		return this._latlngs;
	},

	// @method setLatLngs(latlngs: LatLng[]): this
	// Replaces all the points in the polyline with the given array of geographical points.
	setLatLngs: function (latlngs) {
		this._setLatLngs(latlngs);
		return this.redraw();
	},

	// @method isEmpty(): Boolean
	// Returns `true` if the Polyline has no LatLngs.
	isEmpty: function () {
		return !this._latlngs.length;
	},

	// @method closestLayerPoint(p: Point): Point
	// Returns the point closest to `p` on the Polyline.
	closestLayerPoint: function (p) {
		var minDistance = Infinity,
		    minPoint = null,
		    closest = _sqClosestPointOnSegment,
		    p1, p2;

		for (var j = 0, jLen = this._parts.length; j < jLen; j++) {
			var points = this._parts[j];

			for (var i = 1, len = points.length; i < len; i++) {
				p1 = points[i - 1];
				p2 = points[i];

				var sqDist = closest(p, p1, p2, true);

				if (sqDist < minDistance) {
					minDistance = sqDist;
					minPoint = closest(p, p1, p2);
				}
			}
		}
		if (minPoint) {
			minPoint.distance = Math.sqrt(minDistance);
		}
		return minPoint;
	},

	// @method getCenter(): LatLng
	// Returns the center ([centroid](http://en.wikipedia.org/wiki/Centroid)) of the polyline.
	getCenter: function () {
		// throws error when not yet added to map as this center calculation requires projected coordinates
		if (!this._map) {
			throw new Error('Must add layer to map before using getCenter()');
		}

		var i, halfDist, segDist, dist, p1, p2, ratio,
		    points = this._rings[0],
		    len = points.length;

		if (!len) { return null; }

		// polyline centroid algorithm; only uses the first ring if there are multiple

		for (i = 0, halfDist = 0; i < len - 1; i++) {
			halfDist += points[i].distanceTo(points[i + 1]) / 2;
		}

		// The line is so small in the current view that all points are on the same pixel.
		if (halfDist === 0) {
			return this._map.layerPointToLatLng(points[0]);
		}

		for (i = 0, dist = 0; i < len - 1; i++) {
			p1 = points[i];
			p2 = points[i + 1];
			segDist = p1.distanceTo(p2);
			dist += segDist;

			if (dist > halfDist) {
				ratio = (dist - halfDist) / segDist;
				return this._map.layerPointToLatLng([
					p2.x - ratio * (p2.x - p1.x),
					p2.y - ratio * (p2.y - p1.y)
				]);
			}
		}
	},

	// @method getBounds(): LatLngBounds
	// Returns the `LatLngBounds` of the path.
	getBounds: function () {
		return this._bounds;
	},

	// @method addLatLng(latlng: LatLng, latlngs? LatLng[]): this
	// Adds a given point to the polyline. By default, adds to the first ring of
	// the polyline in case of a multi-polyline, but can be overridden by passing
	// a specific ring as a LatLng array (that you can earlier access with [`getLatLngs`](#polyline-getlatlngs)).
	addLatLng: function (latlng, latlngs) {
		latlngs = latlngs || this._defaultShape();
		latlng = toLatLng(latlng);
		latlngs.push(latlng);
		this._bounds.extend(latlng);
		return this.redraw();
	},

	_setLatLngs: function (latlngs) {
		this._bounds = new LatLngBounds();
		this._latlngs = this._convertLatLngs(latlngs);
	},

	_defaultShape: function () {
		return isFlat(this._latlngs) ? this._latlngs : this._latlngs[0];
	},

	// recursively convert latlngs input into actual LatLng instances; calculate bounds along the way
	_convertLatLngs: function (latlngs) {
		var result = [],
		    flat = isFlat(latlngs);

		for (var i = 0, len = latlngs.length; i < len; i++) {
			if (flat) {
				result[i] = toLatLng(latlngs[i]);
				this._bounds.extend(result[i]);
			} else {
				result[i] = this._convertLatLngs(latlngs[i]);
			}
		}

		return result;
	},

	_project: function () {
		var pxBounds = new Bounds();
		this._rings = [];
		this._projectLatlngs(this._latlngs, this._rings, pxBounds);

		var w = this._clickTolerance(),
		    p = new Point(w, w);

		if (this._bounds.isValid() && pxBounds.isValid()) {
			pxBounds.min._subtract(p);
			pxBounds.max._add(p);
			this._pxBounds = pxBounds;
		}
	},

	// recursively turns latlngs into a set of rings with projected coordinates
	_projectLatlngs: function (latlngs, result, projectedBounds) {
		var flat = latlngs[0] instanceof LatLng,
		    len = latlngs.length,
		    i, ring;

		if (flat) {
			ring = [];
			for (i = 0; i < len; i++) {
				ring[i] = this._map.latLngToLayerPoint(latlngs[i]);
				projectedBounds.extend(ring[i]);
			}
			result.push(ring);
		} else {
			for (i = 0; i < len; i++) {
				this._projectLatlngs(latlngs[i], result, projectedBounds);
			}
		}
	},

	// clip polyline by renderer bounds so that we have less to render for performance
	_clipPoints: function () {
		var bounds = this._renderer._bounds;

		this._parts = [];
		if (!this._pxBounds || !this._pxBounds.intersects(bounds)) {
			return;
		}

		if (this.options.noClip) {
			this._parts = this._rings;
			return;
		}

		var parts = this._parts,
		    i, j, k, len, len2, segment, points;

		for (i = 0, k = 0, len = this._rings.length; i < len; i++) {
			points = this._rings[i];

			for (j = 0, len2 = points.length; j < len2 - 1; j++) {
				segment = clipSegment(points[j], points[j + 1], bounds, j, true);

				if (!segment) { continue; }

				parts[k] = parts[k] || [];
				parts[k].push(segment[0]);

				// if segment goes out of screen, or it's the last one, it's the end of the line part
				if ((segment[1] !== points[j + 1]) || (j === len2 - 2)) {
					parts[k].push(segment[1]);
					k++;
				}
			}
		}
	},

	// simplify each clipped part of the polyline for performance
	_simplifyPoints: function () {
		var parts = this._parts,
		    tolerance = this.options.smoothFactor;

		for (var i = 0, len = parts.length; i < len; i++) {
			parts[i] = simplify(parts[i], tolerance);
		}
	},

	_update: function () {
		if (!this._map) { return; }

		this._clipPoints();
		this._simplifyPoints();
		this._updatePath();
	},

	_updatePath: function () {
		this._renderer._updatePoly(this);
	},

	// Needed by the `Canvas` renderer for interactivity
	_containsPoint: function (p, closed) {
		var i, j, k, len, len2, part,
		    w = this._clickTolerance();

		if (!this._pxBounds || !this._pxBounds.contains(p)) { return false; }

		// hit detection for polylines
		for (i = 0, len = this._parts.length; i < len; i++) {
			part = this._parts[i];

			for (j = 0, len2 = part.length, k = len2 - 1; j < len2; k = j++) {
				if (!closed && (j === 0)) { continue; }

				if (pointToSegmentDistance(p, part[k], part[j]) <= w) {
					return true;
				}
			}
		}
		return false;
	}
});

// @factory L.polyline(latlngs: LatLng[], options?: Polyline options)
// Instantiates a polyline object given an array of geographical points and
// optionally an options object. You can create a `Polyline` object with
// multiple separate lines (`MultiPolyline`) by passing an array of arrays
// of geographic points.
function polyline(latlngs, options) {
	return new Polyline(latlngs, options);
}

// Retrocompat. Allow plugins to support Leaflet versions before and after 1.1.
Polyline._flat = _flat;

/*
 * @class Polygon
 * @aka L.Polygon
 * @inherits Polyline
 *
 * A class for drawing polygon overlays on a map. Extends `Polyline`.
 *
 * Note that points you pass when creating a polygon shouldn't have an additional last point equal to the first one — it's better to filter out such points.
 *
 *
 * @example
 *
 * ```js
 * // create a red polygon from an array of LatLng points
 * var latlngs = [[37, -109.05],[41, -109.03],[41, -102.05],[37, -102.04]];
 *
 * var polygon = L.polygon(latlngs, {color: 'red'}).addTo(map);
 *
 * // zoom the map to the polygon
 * map.fitBounds(polygon.getBounds());
 * ```
 *
 * You can also pass an array of arrays of latlngs, with the first array representing the outer shape and the other arrays representing holes in the outer shape:
 *
 * ```js
 * var latlngs = [
 *   [[37, -109.05],[41, -109.03],[41, -102.05],[37, -102.04]], // outer ring
 *   [[37.29, -108.58],[40.71, -108.58],[40.71, -102.50],[37.29, -102.50]] // hole
 * ];
 * ```
 *
 * Additionally, you can pass a multi-dimensional array to represent a MultiPolygon shape.
 *
 * ```js
 * var latlngs = [
 *   [ // first polygon
 *     [[37, -109.05],[41, -109.03],[41, -102.05],[37, -102.04]], // outer ring
 *     [[37.29, -108.58],[40.71, -108.58],[40.71, -102.50],[37.29, -102.50]] // hole
 *   ],
 *   [ // second polygon
 *     [[41, -111.03],[45, -111.04],[45, -104.05],[41, -104.05]]
 *   ]
 * ];
 * ```
 */

var Polygon = Polyline.extend({

	options: {
		fill: true
	},

	isEmpty: function () {
		return !this._latlngs.length || !this._latlngs[0].length;
	},

	getCenter: function () {
		// throws error when not yet added to map as this center calculation requires projected coordinates
		if (!this._map) {
			throw new Error('Must add layer to map before using getCenter()');
		}

		var i, j, p1, p2, f, area, x, y, center,
		    points = this._rings[0],
		    len = points.length;

		if (!len) { return null; }

		// polygon centroid algorithm; only uses the first ring if there are multiple

		area = x = y = 0;

		for (i = 0, j = len - 1; i < len; j = i++) {
			p1 = points[i];
			p2 = points[j];

			f = p1.y * p2.x - p2.y * p1.x;
			x += (p1.x + p2.x) * f;
			y += (p1.y + p2.y) * f;
			area += f * 3;
		}

		if (area === 0) {
			// Polygon is so small that all points are on same pixel.
			center = points[0];
		} else {
			center = [x / area, y / area];
		}
		return this._map.layerPointToLatLng(center);
	},

	_convertLatLngs: function (latlngs) {
		var result = Polyline.prototype._convertLatLngs.call(this, latlngs),
		    len = result.length;

		// remove last point if it equals first one
		if (len >= 2 && result[0] instanceof LatLng && result[0].equals(result[len - 1])) {
			result.pop();
		}
		return result;
	},

	_setLatLngs: function (latlngs) {
		Polyline.prototype._setLatLngs.call(this, latlngs);
		if (isFlat(this._latlngs)) {
			this._latlngs = [this._latlngs];
		}
	},

	_defaultShape: function () {
		return isFlat(this._latlngs[0]) ? this._latlngs[0] : this._latlngs[0][0];
	},

	_clipPoints: function () {
		// polygons need a different clipping algorithm so we redefine that

		var bounds = this._renderer._bounds,
		    w = this.options.weight,
		    p = new Point(w, w);

		// increase clip padding by stroke width to avoid stroke on clip edges
		bounds = new Bounds(bounds.min.subtract(p), bounds.max.add(p));

		this._parts = [];
		if (!this._pxBounds || !this._pxBounds.intersects(bounds)) {
			return;
		}

		if (this.options.noClip) {
			this._parts = this._rings;
			return;
		}

		for (var i = 0, len = this._rings.length, clipped; i < len; i++) {
			clipped = clipPolygon(this._rings[i], bounds, true);
			if (clipped.length) {
				this._parts.push(clipped);
			}
		}
	},

	_updatePath: function () {
		this._renderer._updatePoly(this, true);
	},

	// Needed by the `Canvas` renderer for interactivity
	_containsPoint: function (p) {
		var inside = false,
		    part, p1, p2, i, j, k, len, len2;

		if (!this._pxBounds || !this._pxBounds.contains(p)) { return false; }

		// ray casting algorithm for detecting if point is in polygon
		for (i = 0, len = this._parts.length; i < len; i++) {
			part = this._parts[i];

			for (j = 0, len2 = part.length, k = len2 - 1; j < len2; k = j++) {
				p1 = part[j];
				p2 = part[k];

				if (((p1.y > p.y) !== (p2.y > p.y)) && (p.x < (p2.x - p1.x) * (p.y - p1.y) / (p2.y - p1.y) + p1.x)) {
					inside = !inside;
				}
			}
		}

		// also check if it's on polygon stroke
		return inside || Polyline.prototype._containsPoint.call(this, p, true);
	}

});


// @factory L.polygon(latlngs: LatLng[], options?: Polyline options)
function polygon(latlngs, options) {
	return new Polygon(latlngs, options);
}

/*
 * @class GeoJSON
 * @aka L.GeoJSON
 * @inherits FeatureGroup
 *
 * Represents a GeoJSON object or an array of GeoJSON objects. Allows you to parse
 * GeoJSON data and display it on the map. Extends `FeatureGroup`.
 *
 * @example
 *
 * ```js
 * L.geoJSON(data, {
 * 	style: function (feature) {
 * 		return {color: feature.properties.color};
 * 	}
 * }).bindPopup(function (layer) {
 * 	return layer.feature.properties.description;
 * }).addTo(map);
 * ```
 */

var GeoJSON = FeatureGroup.extend({

	/* @section
	 * @aka GeoJSON options
	 *
	 * @option pointToLayer: Function = *
	 * A `Function` defining how GeoJSON points spawn Leaflet layers. It is internally
	 * called when data is added, passing the GeoJSON point feature and its `LatLng`.
	 * The default is to spawn a default `Marker`:
	 * ```js
	 * function(geoJsonPoint, latlng) {
	 * 	return L.marker(latlng);
	 * }
	 * ```
	 *
	 * @option style: Function = *
	 * A `Function` defining the `Path options` for styling GeoJSON lines and polygons,
	 * called internally when data is added.
	 * The default value is to not override any defaults:
	 * ```js
	 * function (geoJsonFeature) {
	 * 	return {}
	 * }
	 * ```
	 *
	 * @option onEachFeature: Function = *
	 * A `Function` that will be called once for each created `Feature`, after it has
	 * been created and styled. Useful for attaching events and popups to features.
	 * The default is to do nothing with the newly created layers:
	 * ```js
	 * function (feature, layer) {}
	 * ```
	 *
	 * @option filter: Function = *
	 * A `Function` that will be used to decide whether to include a feature or not.
	 * The default is to include all features:
	 * ```js
	 * function (geoJsonFeature) {
	 * 	return true;
	 * }
	 * ```
	 * Note: dynamically changing the `filter` option will have effect only on newly
	 * added data. It will _not_ re-evaluate already included features.
	 *
	 * @option coordsToLatLng: Function = *
	 * A `Function` that will be used for converting GeoJSON coordinates to `LatLng`s.
	 * The default is the `coordsToLatLng` static method.
	 */

	initialize: function (geojson, options) {
		setOptions(this, options);

		this._layers = {};

		if (geojson) {
			this.addData(geojson);
		}
	},

	// @method addData( <GeoJSON> data ): this
	// Adds a GeoJSON object to the layer.
	addData: function (geojson) {
		var features = isArray(geojson) ? geojson : geojson.features,
		    i, len, feature;

		if (features) {
			for (i = 0, len = features.length; i < len; i++) {
				// only add this if geometry or geometries are set and not null
				feature = features[i];
				if (feature.geometries || feature.geometry || feature.features || feature.coordinates) {
					this.addData(feature);
				}
			}
			return this;
		}

		var options = this.options;

		if (options.filter && !options.filter(geojson)) { return this; }

		var layer = geometryToLayer(geojson, options);
		if (!layer) {
			return this;
		}
		layer.feature = asFeature(geojson);

		layer.defaultOptions = layer.options;
		this.resetStyle(layer);

		if (options.onEachFeature) {
			options.onEachFeature(geojson, layer);
		}

		return this.addLayer(layer);
	},

	// @method resetStyle( <Path> layer ): this
	// Resets the given vector layer's style to the original GeoJSON style, useful for resetting style after hover events.
	resetStyle: function (layer) {
		// reset any custom styles
		layer.options = extend({}, layer.defaultOptions);
		this._setLayerStyle(layer, this.options.style);
		return this;
	},

	// @method setStyle( <Function> style ): this
	// Changes styles of GeoJSON vector layers with the given style function.
	setStyle: function (style) {
		return this.eachLayer(function (layer) {
			this._setLayerStyle(layer, style);
		}, this);
	},

	_setLayerStyle: function (layer, style) {
		if (typeof style === 'function') {
			style = style(layer.feature);
		}
		if (layer.setStyle) {
			layer.setStyle(style);
		}
	}
});

// @section
// There are several static functions which can be called without instantiating L.GeoJSON:

// @function geometryToLayer(featureData: Object, options?: GeoJSON options): Layer
// Creates a `Layer` from a given GeoJSON feature. Can use a custom
// [`pointToLayer`](#geojson-pointtolayer) and/or [`coordsToLatLng`](#geojson-coordstolatlng)
// functions if provided as options.
function geometryToLayer(geojson, options) {

	var geometry = geojson.type === 'Feature' ? geojson.geometry : geojson,
	    coords = geometry ? geometry.coordinates : null,
	    layers = [],
	    pointToLayer = options && options.pointToLayer,
	    _coordsToLatLng = options && options.coordsToLatLng || coordsToLatLng,
	    latlng, latlngs, i, len;

	if (!coords && !geometry) {
		return null;
	}

	switch (geometry.type) {
	case 'Point':
		latlng = _coordsToLatLng(coords);
		return pointToLayer ? pointToLayer(geojson, latlng) : new Marker(latlng);

	case 'MultiPoint':
		for (i = 0, len = coords.length; i < len; i++) {
			latlng = _coordsToLatLng(coords[i]);
			layers.push(pointToLayer ? pointToLayer(geojson, latlng) : new Marker(latlng));
		}
		return new FeatureGroup(layers);

	case 'LineString':
	case 'MultiLineString':
		latlngs = coordsToLatLngs(coords, geometry.type === 'LineString' ? 0 : 1, _coordsToLatLng);
		return new Polyline(latlngs, options);

	case 'Polygon':
	case 'MultiPolygon':
		latlngs = coordsToLatLngs(coords, geometry.type === 'Polygon' ? 1 : 2, _coordsToLatLng);
		return new Polygon(latlngs, options);

	case 'GeometryCollection':
		for (i = 0, len = geometry.geometries.length; i < len; i++) {
			var layer = geometryToLayer({
				geometry: geometry.geometries[i],
				type: 'Feature',
				properties: geojson.properties
			}, options);

			if (layer) {
				layers.push(layer);
			}
		}
		return new FeatureGroup(layers);

	default:
		throw new Error('Invalid GeoJSON object.');
	}
}

// @function coordsToLatLng(coords: Array): LatLng
// Creates a `LatLng` object from an array of 2 numbers (longitude, latitude)
// or 3 numbers (longitude, latitude, altitude) used in GeoJSON for points.
function coordsToLatLng(coords) {
	return new LatLng(coords[1], coords[0], coords[2]);
}

// @function coordsToLatLngs(coords: Array, levelsDeep?: Number, coordsToLatLng?: Function): Array
// Creates a multidimensional array of `LatLng`s from a GeoJSON coordinates array.
// `levelsDeep` specifies the nesting level (0 is for an array of points, 1 for an array of arrays of points, etc., 0 by default).
// Can use a custom [`coordsToLatLng`](#geojson-coordstolatlng) function.
function coordsToLatLngs(coords, levelsDeep, _coordsToLatLng) {
	var latlngs = [];

	for (var i = 0, len = coords.length, latlng; i < len; i++) {
		latlng = levelsDeep ?
			coordsToLatLngs(coords[i], levelsDeep - 1, _coordsToLatLng) :
			(_coordsToLatLng || coordsToLatLng)(coords[i]);

		latlngs.push(latlng);
	}

	return latlngs;
}

// @function latLngToCoords(latlng: LatLng, precision?: Number): Array
// Reverse of [`coordsToLatLng`](#geojson-coordstolatlng)
function latLngToCoords(latlng, precision) {
	precision = typeof precision === 'number' ? precision : 6;
	return latlng.alt !== undefined ?
		[formatNum(latlng.lng, precision), formatNum(latlng.lat, precision), formatNum(latlng.alt, precision)] :
		[formatNum(latlng.lng, precision), formatNum(latlng.lat, precision)];
}

// @function latLngsToCoords(latlngs: Array, levelsDeep?: Number, closed?: Boolean): Array
// Reverse of [`coordsToLatLngs`](#geojson-coordstolatlngs)
// `closed` determines whether the first point should be appended to the end of the array to close the feature, only used when `levelsDeep` is 0. False by default.
function latLngsToCoords(latlngs, levelsDeep, closed, precision) {
	var coords = [];

	for (var i = 0, len = latlngs.length; i < len; i++) {
		coords.push(levelsDeep ?
			latLngsToCoords(latlngs[i], levelsDeep - 1, closed, precision) :
			latLngToCoords(latlngs[i], precision));
	}

	if (!levelsDeep && closed) {
		coords.push(coords[0]);
	}

	return coords;
}

function getFeature(layer, newGeometry) {
	return layer.feature ?
		extend({}, layer.feature, {geometry: newGeometry}) :
		asFeature(newGeometry);
}

// @function asFeature(geojson: Object): Object
// Normalize GeoJSON geometries/features into GeoJSON features.
function asFeature(geojson) {
	if (geojson.type === 'Feature' || geojson.type === 'FeatureCollection') {
		return geojson;
	}

	return {
		type: 'Feature',
		properties: {},
		geometry: geojson
	};
}

var PointToGeoJSON = {
	toGeoJSON: function (precision) {
		return getFeature(this, {
			type: 'Point',
			coordinates: latLngToCoords(this.getLatLng(), precision)
		});
	}
};

// @namespace Marker
// @method toGeoJSON(): Object
// Returns a [`GeoJSON`](http://en.wikipedia.org/wiki/GeoJSON) representation of the marker (as a GeoJSON `Point` Feature).
Marker.include(PointToGeoJSON);

// @namespace CircleMarker
// @method toGeoJSON(): Object
// Returns a [`GeoJSON`](http://en.wikipedia.org/wiki/GeoJSON) representation of the circle marker (as a GeoJSON `Point` Feature).
Circle.include(PointToGeoJSON);
CircleMarker.include(PointToGeoJSON);


// @namespace Polyline
// @method toGeoJSON(): Object
// Returns a [`GeoJSON`](http://en.wikipedia.org/wiki/GeoJSON) representation of the polyline (as a GeoJSON `LineString` or `MultiLineString` Feature).
Polyline.include({
	toGeoJSON: function (precision) {
		var multi = !isFlat(this._latlngs);

		var coords = latLngsToCoords(this._latlngs, multi ? 1 : 0, false, precision);

		return getFeature(this, {
			type: (multi ? 'Multi' : '') + 'LineString',
			coordinates: coords
		});
	}
});

// @namespace Polygon
// @method toGeoJSON(): Object
// Returns a [`GeoJSON`](http://en.wikipedia.org/wiki/GeoJSON) representation of the polygon (as a GeoJSON `Polygon` or `MultiPolygon` Feature).
Polygon.include({
	toGeoJSON: function (precision) {
		var holes = !isFlat(this._latlngs),
		    multi = holes && !isFlat(this._latlngs[0]);

		var coords = latLngsToCoords(this._latlngs, multi ? 2 : holes ? 1 : 0, true, precision);

		if (!holes) {
			coords = [coords];
		}

		return getFeature(this, {
			type: (multi ? 'Multi' : '') + 'Polygon',
			coordinates: coords
		});
	}
});


// @namespace LayerGroup
LayerGroup.include({
	toMultiPoint: function (precision) {
		var coords = [];

		this.eachLayer(function (layer) {
			coords.push(layer.toGeoJSON(precision).geometry.coordinates);
		});

		return getFeature(this, {
			type: 'MultiPoint',
			coordinates: coords
		});
	},

	// @method toGeoJSON(): Object
	// Returns a [`GeoJSON`](http://en.wikipedia.org/wiki/GeoJSON) representation of the layer group (as a GeoJSON `FeatureCollection`, `GeometryCollection`, or `MultiPoint`).
	toGeoJSON: function (precision) {

		var type = this.feature && this.feature.geometry && this.feature.geometry.type;

		if (type === 'MultiPoint') {
			return this.toMultiPoint(precision);
		}

		var isGeometryCollection = type === 'GeometryCollection',
		    jsons = [];

		this.eachLayer(function (layer) {
			if (layer.toGeoJSON) {
				var json = layer.toGeoJSON(precision);
				if (isGeometryCollection) {
					jsons.push(json.geometry);
				} else {
					var feature = asFeature(json);
					// Squash nested feature collections
					if (feature.type === 'FeatureCollection') {
						jsons.push.apply(jsons, feature.features);
					} else {
						jsons.push(feature);
					}
				}
			}
		});

		if (isGeometryCollection) {
			return getFeature(this, {
				geometries: jsons,
				type: 'GeometryCollection'
			});
		}

		return {
			type: 'FeatureCollection',
			features: jsons
		};
	}
});

// @namespace GeoJSON
// @factory L.geoJSON(geojson?: Object, options?: GeoJSON options)
// Creates a GeoJSON layer. Optionally accepts an object in
// [GeoJSON format](https://tools.ietf.org/html/rfc7946) to display on the map
// (you can alternatively add it later with `addData` method) and an `options` object.
function geoJSON(geojson, options) {
	return new GeoJSON(geojson, options);
}

// Backward compatibility.
var geoJson = geoJSON;

/*
 * @class ImageOverlay
 * @aka L.ImageOverlay
 * @inherits Interactive layer
 *
 * Used to load and display a single image over specific bounds of the map. Extends `Layer`.
 *
 * @example
 *
 * ```js
 * var imageUrl = 'http://www.lib.utexas.edu/maps/historical/newark_nj_1922.jpg',
 * 	imageBounds = [[40.712216, -74.22655], [40.773941, -74.12544]];
 * L.imageOverlay(imageUrl, imageBounds).addTo(map);
 * ```
 */

var ImageOverlay = Layer.extend({

	// @section
	// @aka ImageOverlay options
	options: {
		// @option opacity: Number = 1.0
		// The opacity of the image overlay.
		opacity: 1,

		// @option alt: String = ''
		// Text for the `alt` attribute of the image (useful for accessibility).
		alt: '',

		// @option interactive: Boolean = false
		// If `true`, the image overlay will emit [mouse events](#interactive-layer) when clicked or hovered.
		interactive: false,

		// @option crossOrigin: Boolean|String = false
		// Whether the crossOrigin attribute will be added to the image.
		// If a String is provided, the image will have its crossOrigin attribute set to the String provided. This is needed if you want to access image pixel data.
		// Refer to [CORS Settings](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_settings_attributes) for valid String values.
		crossOrigin: false,

		// @option errorOverlayUrl: String = ''
		// URL to the overlay image to show in place of the overlay that failed to load.
		errorOverlayUrl: '',

		// @option zIndex: Number = 1
		// The explicit [zIndex](https://developer.mozilla.org/docs/Web/CSS/CSS_Positioning/Understanding_z_index) of the overlay layer.
		zIndex: 1,

		// @option className: String = ''
		// A custom class name to assign to the image. Empty by default.
		className: ''
	},

	initialize: function (url, bounds, options) { // (String, LatLngBounds, Object)
		this._url = url;
		this._bounds = toLatLngBounds(bounds);

		setOptions(this, options);
	},

	onAdd: function () {
		if (!this._image) {
			this._initImage();

			if (this.options.opacity < 1) {
				this._updateOpacity();
			}
		}

		if (this.options.interactive) {
			addClass(this._image, 'leaflet-interactive');
			this.addInteractiveTarget(this._image);
		}

		this.getPane().appendChild(this._image);
		this._reset();
	},

	onRemove: function () {
		remove(this._image);
		if (this.options.interactive) {
			this.removeInteractiveTarget(this._image);
		}
	},

	// @method setOpacity(opacity: Number): this
	// Sets the opacity of the overlay.
	setOpacity: function (opacity) {
		this.options.opacity = opacity;

		if (this._image) {
			this._updateOpacity();
		}
		return this;
	},

	setStyle: function (styleOpts) {
		if (styleOpts.opacity) {
			this.setOpacity(styleOpts.opacity);
		}
		return this;
	},

	// @method bringToFront(): this
	// Brings the layer to the top of all overlays.
	bringToFront: function () {
		if (this._map) {
			toFront(this._image);
		}
		return this;
	},

	// @method bringToBack(): this
	// Brings the layer to the bottom of all overlays.
	bringToBack: function () {
		if (this._map) {
			toBack(this._image);
		}
		return this;
	},

	// @method setUrl(url: String): this
	// Changes the URL of the image.
	setUrl: function (url) {
		this._url = url;

		if (this._image) {
			this._image.src = url;
		}
		return this;
	},

	// @method setBounds(bounds: LatLngBounds): this
	// Update the bounds that this ImageOverlay covers
	setBounds: function (bounds) {
		this._bounds = toLatLngBounds(bounds);

		if (this._map) {
			this._reset();
		}
		return this;
	},

	getEvents: function () {
		var events = {
			zoom: this._reset,
			viewreset: this._reset
		};

		if (this._zoomAnimated) {
			events.zoomanim = this._animateZoom;
		}

		return events;
	},

	// @method setZIndex(value: Number): this
	// Changes the [zIndex](#imageoverlay-zindex) of the image overlay.
	setZIndex: function (value) {
		this.options.zIndex = value;
		this._updateZIndex();
		return this;
	},

	// @method getBounds(): LatLngBounds
	// Get the bounds that this ImageOverlay covers
	getBounds: function () {
		return this._bounds;
	},

	// @method getElement(): HTMLElement
	// Returns the instance of [`HTMLImageElement`](https://developer.mozilla.org/docs/Web/API/HTMLImageElement)
	// used by this overlay.
	getElement: function () {
		return this._image;
	},

	_initImage: function () {
		var wasElementSupplied = this._url.tagName === 'IMG';
		var img = this._image = wasElementSupplied ? this._url : create$1('img');

		addClass(img, 'leaflet-image-layer');
		if (this._zoomAnimated) { addClass(img, 'leaflet-zoom-animated'); }
		if (this.options.className) { addClass(img, this.options.className); }

		img.onselectstart = falseFn;
		img.onmousemove = falseFn;

		// @event load: Event
		// Fired when the ImageOverlay layer has loaded its image
		img.onload = bind(this.fire, this, 'load');
		img.onerror = bind(this._overlayOnError, this, 'error');

		if (this.options.crossOrigin || this.options.crossOrigin === '') {
			img.crossOrigin = this.options.crossOrigin === true ? '' : this.options.crossOrigin;
		}

		if (this.options.zIndex) {
			this._updateZIndex();
		}

		if (wasElementSupplied) {
			this._url = img.src;
			return;
		}

		img.src = this._url;
		img.alt = this.options.alt;
	},

	_animateZoom: function (e) {
		var scale = this._map.getZoomScale(e.zoom),
		    offset = this._map._latLngBoundsToNewLayerBounds(this._bounds, e.zoom, e.center).min;

		setTransform(this._image, offset, scale);
	},

	_reset: function () {
		var image = this._image,
		    bounds = new Bounds(
		        this._map.latLngToLayerPoint(this._bounds.getNorthWest()),
		        this._map.latLngToLayerPoint(this._bounds.getSouthEast())),
		    size = bounds.getSize();

		setPosition(image, bounds.min);

		image.style.width  = size.x + 'px';
		image.style.height = size.y + 'px';
	},

	_updateOpacity: function () {
		setOpacity(this._image, this.options.opacity);
	},

	_updateZIndex: function () {
		if (this._image && this.options.zIndex !== undefined && this.options.zIndex !== null) {
			this._image.style.zIndex = this.options.zIndex;
		}
	},

	_overlayOnError: function () {
		// @event error: Event
		// Fired when the ImageOverlay layer fails to load its image
		this.fire('error');

		var errorUrl = this.options.errorOverlayUrl;
		if (errorUrl && this._url !== errorUrl) {
			this._url = errorUrl;
			this._image.src = errorUrl;
		}
	}
});

// @factory L.imageOverlay(imageUrl: String, bounds: LatLngBounds, options?: ImageOverlay options)
// Instantiates an image overlay object given the URL of the image and the
// geographical bounds it is tied to.
var imageOverlay = function (url, bounds, options) {
	return new ImageOverlay(url, bounds, options);
};

/*
 * @class VideoOverlay
 * @aka L.VideoOverlay
 * @inherits ImageOverlay
 *
 * Used to load and display a video player over specific bounds of the map. Extends `ImageOverlay`.
 *
 * A video overlay uses the [`<video>`](https://developer.mozilla.org/docs/Web/HTML/Element/video)
 * HTML5 element.
 *
 * @example
 *
 * ```js
 * var videoUrl = 'https://www.mapbox.com/bites/00188/patricia_nasa.webm',
 * 	videoBounds = [[ 32, -130], [ 13, -100]];
 * L.videoOverlay(videoUrl, videoBounds ).addTo(map);
 * ```
 */

var VideoOverlay = ImageOverlay.extend({

	// @section
	// @aka VideoOverlay options
	options: {
		// @option autoplay: Boolean = true
		// Whether the video starts playing automatically when loaded.
		autoplay: true,

		// @option loop: Boolean = true
		// Whether the video will loop back to the beginning when played.
		loop: true
	},

	_initImage: function () {
		var wasElementSupplied = this._url.tagName === 'VIDEO';
		var vid = this._image = wasElementSupplied ? this._url : create$1('video');

		addClass(vid, 'leaflet-image-layer');
		if (this._zoomAnimated) { addClass(vid, 'leaflet-zoom-animated'); }

		vid.onselectstart = falseFn;
		vid.onmousemove = falseFn;

		// @event load: Event
		// Fired when the video has finished loading the first frame
		vid.onloadeddata = bind(this.fire, this, 'load');

		if (wasElementSupplied) {
			var sourceElements = vid.getElementsByTagName('source');
			var sources = [];
			for (var j = 0; j < sourceElements.length; j++) {
				sources.push(sourceElements[j].src);
			}

			this._url = (sourceElements.length > 0) ? sources : [vid.src];
			return;
		}

		if (!isArray(this._url)) { this._url = [this._url]; }

		vid.autoplay = !!this.options.autoplay;
		vid.loop = !!this.options.loop;
		for (var i = 0; i < this._url.length; i++) {
			var source = create$1('source');
			source.src = this._url[i];
			vid.appendChild(source);
		}
	}

	// @method getElement(): HTMLVideoElement
	// Returns the instance of [`HTMLVideoElement`](https://developer.mozilla.org/docs/Web/API/HTMLVideoElement)
	// used by this overlay.
});


// @factory L.videoOverlay(video: String|Array|HTMLVideoElement, bounds: LatLngBounds, options?: VideoOverlay options)
// Instantiates an image overlay object given the URL of the video (or array of URLs, or even a video element) and the
// geographical bounds it is tied to.

function videoOverlay(video, bounds, options) {
	return new VideoOverlay(video, bounds, options);
}

/*
 * @class DivOverlay
 * @inherits Layer
 * @aka L.DivOverlay
 * Base model for L.Popup and L.Tooltip. Inherit from it for custom popup like plugins.
 */

// @namespace DivOverlay
var DivOverlay = Layer.extend({

	// @section
	// @aka DivOverlay options
	options: {
		// @option offset: Point = Point(0, 7)
		// The offset of the popup position. Useful to control the anchor
		// of the popup when opening it on some overlays.
		offset: [0, 7],

		// @option className: String = ''
		// A custom CSS class name to assign to the popup.
		className: '',

		// @option pane: String = 'popupPane'
		// `Map pane` where the popup will be added.
		pane: 'popupPane'
	},

	initialize: function (options, source) {
		setOptions(this, options);

		this._source = source;
	},

	onAdd: function (map) {
		this._zoomAnimated = map._zoomAnimated;

		if (!this._container) {
			this._initLayout();
		}

		if (map._fadeAnimated) {
			setOpacity(this._container, 0);
		}

		clearTimeout(this._removeTimeout);
		this.getPane().appendChild(this._container);
		this.update();

		if (map._fadeAnimated) {
			setOpacity(this._container, 1);
		}

		this.bringToFront();
	},

	onRemove: function (map) {
		if (map._fadeAnimated) {
			setOpacity(this._container, 0);
			this._removeTimeout = setTimeout(bind(remove, undefined, this._container), 200);
		} else {
			remove(this._container);
		}
	},

	// @namespace Popup
	// @method getLatLng: LatLng
	// Returns the geographical point of popup.
	getLatLng: function () {
		return this._latlng;
	},

	// @method setLatLng(latlng: LatLng): this
	// Sets the geographical point where the popup will open.
	setLatLng: function (latlng) {
		this._latlng = toLatLng(latlng);
		if (this._map) {
			this._updatePosition();
			this._adjustPan();
		}
		return this;
	},

	// @method getContent: String|HTMLElement
	// Returns the content of the popup.
	getContent: function () {
		return this._content;
	},

	// @method setContent(htmlContent: String|HTMLElement|Function): this
	// Sets the HTML content of the popup. If a function is passed the source layer will be passed to the function. The function should return a `String` or `HTMLElement` to be used in the popup.
	setContent: function (content) {
		this._content = content;
		this.update();
		return this;
	},

	// @method getElement: String|HTMLElement
	// Alias for [getContent()](#popup-getcontent)
	getElement: function () {
		return this._container;
	},

	// @method update: null
	// Updates the popup content, layout and position. Useful for updating the popup after something inside changed, e.g. image loaded.
	update: function () {
		if (!this._map) { return; }

		this._container.style.visibility = 'hidden';

		this._updateContent();
		this._updateLayout();
		this._updatePosition();

		this._container.style.visibility = '';

		this._adjustPan();
	},

	getEvents: function () {
		var events = {
			zoom: this._updatePosition,
			viewreset: this._updatePosition
		};

		if (this._zoomAnimated) {
			events.zoomanim = this._animateZoom;
		}
		return events;
	},

	// @method isOpen: Boolean
	// Returns `true` when the popup is visible on the map.
	isOpen: function () {
		return !!this._map && this._map.hasLayer(this);
	},

	// @method bringToFront: this
	// Brings this popup in front of other popups (in the same map pane).
	bringToFront: function () {
		if (this._map) {
			toFront(this._container);
		}
		return this;
	},

	// @method bringToBack: this
	// Brings this popup to the back of other popups (in the same map pane).
	bringToBack: function () {
		if (this._map) {
			toBack(this._container);
		}
		return this;
	},

	_updateContent: function () {
		if (!this._content) { return; }

		var node = this._contentNode;
		var content = (typeof this._content === 'function') ? this._content(this._source || this) : this._content;

		if (typeof content === 'string') {
			node.innerHTML = content;
		} else {
			while (node.hasChildNodes()) {
				node.removeChild(node.firstChild);
			}
			node.appendChild(content);
		}
		this.fire('contentupdate');
	},

	_updatePosition: function () {
		if (!this._map) { return; }

		var pos = this._map.latLngToLayerPoint(this._latlng),
		    offset = toPoint(this.options.offset),
		    anchor = this._getAnchor();

		if (this._zoomAnimated) {
			setPosition(this._container, pos.add(anchor));
		} else {
			offset = offset.add(pos).add(anchor);
		}

		var bottom = this._containerBottom = -offset.y,
		    left = this._containerLeft = -Math.round(this._containerWidth / 2) + offset.x;

		// bottom position the popup in case the height of the popup changes (images loading etc)
		this._container.style.bottom = bottom + 'px';
		this._container.style.left = left + 'px';
	},

	_getAnchor: function () {
		return [0, 0];
	}

});

/*
 * @class Popup
 * @inherits DivOverlay
 * @aka L.Popup
 * Used to open popups in certain places of the map. Use [Map.openPopup](#map-openpopup) to
 * open popups while making sure that only one popup is open at one time
 * (recommended for usability), or use [Map.addLayer](#map-addlayer) to open as many as you want.
 *
 * @example
 *
 * If you want to just bind a popup to marker click and then open it, it's really easy:
 *
 * ```js
 * marker.bindPopup(popupContent).openPopup();
 * ```
 * Path overlays like polylines also have a `bindPopup` method.
 * Here's a more complicated way to open a popup on a map:
 *
 * ```js
 * var popup = L.popup()
 * 	.setLatLng(latlng)
 * 	.setContent('<p>Hello world!<br />This is a nice popup.</p>')
 * 	.openOn(map);
 * ```
 */


// @namespace Popup
var Popup = DivOverlay.extend({

	// @section
	// @aka Popup options
	options: {
		// @option maxWidth: Number = 300
		// Max width of the popup, in pixels.
		maxWidth: 300,

		// @option minWidth: Number = 50
		// Min width of the popup, in pixels.
		minWidth: 50,

		// @option maxHeight: Number = null
		// If set, creates a scrollable container of the given height
		// inside a popup if its content exceeds it.
		maxHeight: null,

		// @option autoPan: Boolean = true
		// Set it to `false` if you don't want the map to do panning animation
		// to fit the opened popup.
		autoPan: true,

		// @option autoPanPaddingTopLeft: Point = null
		// The margin between the popup and the top left corner of the map
		// view after autopanning was performed.
		autoPanPaddingTopLeft: null,

		// @option autoPanPaddingBottomRight: Point = null
		// The margin between the popup and the bottom right corner of the map
		// view after autopanning was performed.
		autoPanPaddingBottomRight: null,

		// @option autoPanPadding: Point = Point(5, 5)
		// Equivalent of setting both top left and bottom right autopan padding to the same value.
		autoPanPadding: [5, 5],

		// @option keepInView: Boolean = false
		// Set it to `true` if you want to prevent users from panning the popup
		// off of the screen while it is open.
		keepInView: false,

		// @option closeButton: Boolean = true
		// Controls the presence of a close button in the popup.
		closeButton: true,

		// @option autoClose: Boolean = true
		// Set it to `false` if you want to override the default behavior of
		// the popup closing when another popup is opened.
		autoClose: true,

		// @option closeOnEscapeKey: Boolean = true
		// Set it to `false` if you want to override the default behavior of
		// the ESC key for closing of the popup.
		closeOnEscapeKey: true,

		// @option closeOnClick: Boolean = *
		// Set it if you want to override the default behavior of the popup closing when user clicks
		// on the map. Defaults to the map's [`closePopupOnClick`](#map-closepopuponclick) option.

		// @option className: String = ''
		// A custom CSS class name to assign to the popup.
		className: ''
	},

	// @namespace Popup
	// @method openOn(map: Map): this
	// Adds the popup to the map and closes the previous one. The same as `map.openPopup(popup)`.
	openOn: function (map) {
		map.openPopup(this);
		return this;
	},

	onAdd: function (map) {
		DivOverlay.prototype.onAdd.call(this, map);

		// @namespace Map
		// @section Popup events
		// @event popupopen: PopupEvent
		// Fired when a popup is opened in the map
		map.fire('popupopen', {popup: this});

		if (this._source) {
			// @namespace Layer
			// @section Popup events
			// @event popupopen: PopupEvent
			// Fired when a popup bound to this layer is opened
			this._source.fire('popupopen', {popup: this}, true);
			// For non-path layers, we toggle the popup when clicking
			// again the layer, so prevent the map to reopen it.
			if (!(this._source instanceof Path)) {
				this._source.on('preclick', stopPropagation);
			}
		}
	},

	onRemove: function (map) {
		DivOverlay.prototype.onRemove.call(this, map);

		// @namespace Map
		// @section Popup events
		// @event popupclose: PopupEvent
		// Fired when a popup in the map is closed
		map.fire('popupclose', {popup: this});

		if (this._source) {
			// @namespace Layer
			// @section Popup events
			// @event popupclose: PopupEvent
			// Fired when a popup bound to this layer is closed
			this._source.fire('popupclose', {popup: this}, true);
			if (!(this._source instanceof Path)) {
				this._source.off('preclick', stopPropagation);
			}
		}
	},

	getEvents: function () {
		var events = DivOverlay.prototype.getEvents.call(this);

		if (this.options.closeOnClick !== undefined ? this.options.closeOnClick : this._map.options.closePopupOnClick) {
			events.preclick = this._close;
		}

		if (this.options.keepInView) {
			events.moveend = this._adjustPan;
		}

		return events;
	},

	_close: function () {
		if (this._map) {
			this._map.closePopup(this);
		}
	},

	_initLayout: function () {
		var prefix = 'leaflet-popup',
		    container = this._container = create$1('div',
			prefix + ' ' + (this.options.className || '') +
			' leaflet-zoom-animated');

		var wrapper = this._wrapper = create$1('div', prefix + '-content-wrapper', container);
		this._contentNode = create$1('div', prefix + '-content', wrapper);

		disableClickPropagation(wrapper);
		disableScrollPropagation(this._contentNode);
		on(wrapper, 'contextmenu', stopPropagation);

		this._tipContainer = create$1('div', prefix + '-tip-container', container);
		this._tip = create$1('div', prefix + '-tip', this._tipContainer);

		if (this.options.closeButton) {
			var closeButton = this._closeButton = create$1('a', prefix + '-close-button', container);
			closeButton.href = '#close';
			closeButton.innerHTML = '&#215;';

			on(closeButton, 'click', this._onCloseButtonClick, this);
		}
	},

	_updateLayout: function () {
		var container = this._contentNode,
		    style = container.style;

		style.width = '';
		style.whiteSpace = 'nowrap';

		var width = container.offsetWidth;
		width = Math.min(width, this.options.maxWidth);
		width = Math.max(width, this.options.minWidth);

		style.width = (width + 1) + 'px';
		style.whiteSpace = '';

		style.height = '';

		var height = container.offsetHeight,
		    maxHeight = this.options.maxHeight,
		    scrolledClass = 'leaflet-popup-scrolled';

		if (maxHeight && height > maxHeight) {
			style.height = maxHeight + 'px';
			addClass(container, scrolledClass);
		} else {
			removeClass(container, scrolledClass);
		}

		this._containerWidth = this._container.offsetWidth;
	},

	_animateZoom: function (e) {
		var pos = this._map._latLngToNewLayerPoint(this._latlng, e.zoom, e.center),
		    anchor = this._getAnchor();
		setPosition(this._container, pos.add(anchor));
	},

	_adjustPan: function () {
		if (!this.options.autoPan || (this._map._panAnim && this._map._panAnim._inProgress)) { return; }

		var map = this._map,
		    marginBottom = parseInt(getStyle(this._container, 'marginBottom'), 10) || 0,
		    containerHeight = this._container.offsetHeight + marginBottom,
		    containerWidth = this._containerWidth,
		    layerPos = new Point(this._containerLeft, -containerHeight - this._containerBottom);

		layerPos._add(getPosition(this._container));

		var containerPos = map.layerPointToContainerPoint(layerPos),
		    padding = toPoint(this.options.autoPanPadding),
		    paddingTL = toPoint(this.options.autoPanPaddingTopLeft || padding),
		    paddingBR = toPoint(this.options.autoPanPaddingBottomRight || padding),
		    size = map.getSize(),
		    dx = 0,
		    dy = 0;

		if (containerPos.x + containerWidth + paddingBR.x > size.x) { // right
			dx = containerPos.x + containerWidth - size.x + paddingBR.x;
		}
		if (containerPos.x - dx - paddingTL.x < 0) { // left
			dx = containerPos.x - paddingTL.x;
		}
		if (containerPos.y + containerHeight + paddingBR.y > size.y) { // bottom
			dy = containerPos.y + containerHeight - size.y + paddingBR.y;
		}
		if (containerPos.y - dy - paddingTL.y < 0) { // top
			dy = containerPos.y - paddingTL.y;
		}

		// @namespace Map
		// @section Popup events
		// @event autopanstart: Event
		// Fired when the map starts autopanning when opening a popup.
		if (dx || dy) {
			map
			    .fire('autopanstart')
			    .panBy([dx, dy]);
		}
	},

	_onCloseButtonClick: function (e) {
		this._close();
		stop(e);
	},

	_getAnchor: function () {
		// Where should we anchor the popup on the source layer?
		return toPoint(this._source && this._source._getPopupAnchor ? this._source._getPopupAnchor() : [0, 0]);
	}

});

// @namespace Popup
// @factory L.popup(options?: Popup options, source?: Layer)
// Instantiates a `Popup` object given an optional `options` object that describes its appearance and location and an optional `source` object that is used to tag the popup with a reference to the Layer to which it refers.
var popup = function (options, source) {
	return new Popup(options, source);
};


/* @namespace Map
 * @section Interaction Options
 * @option closePopupOnClick: Boolean = true
 * Set it to `false` if you don't want popups to close when user clicks the map.
 */
Map.mergeOptions({
	closePopupOnClick: true
});


// @namespace Map
// @section Methods for Layers and Controls
Map.include({
	// @method openPopup(popup: Popup): this
	// Opens the specified popup while closing the previously opened (to make sure only one is opened at one time for usability).
	// @alternative
	// @method openPopup(content: String|HTMLElement, latlng: LatLng, options?: Popup options): this
	// Creates a popup with the specified content and options and opens it in the given point on a map.
	openPopup: function (popup, latlng, options) {
		if (!(popup instanceof Popup)) {
			popup = new Popup(options).setContent(popup);
		}

		if (latlng) {
			popup.setLatLng(latlng);
		}

		if (this.hasLayer(popup)) {
			return this;
		}

		if (this._popup && this._popup.options.autoClose) {
			this.closePopup();
		}

		this._popup = popup;
		return this.addLayer(popup);
	},

	// @method closePopup(popup?: Popup): this
	// Closes the popup previously opened with [openPopup](#map-openpopup) (or the given one).
	closePopup: function (popup) {
		if (!popup || popup === this._popup) {
			popup = this._popup;
			this._popup = null;
		}
		if (popup) {
			this.removeLayer(popup);
		}
		return this;
	}
});

/*
 * @namespace Layer
 * @section Popup methods example
 *
 * All layers share a set of methods convenient for binding popups to it.
 *
 * ```js
 * var layer = L.Polygon(latlngs).bindPopup('Hi There!').addTo(map);
 * layer.openPopup();
 * layer.closePopup();
 * ```
 *
 * Popups will also be automatically opened when the layer is clicked on and closed when the layer is removed from the map or another popup is opened.
 */

// @section Popup methods
Layer.include({

	// @method bindPopup(content: String|HTMLElement|Function|Popup, options?: Popup options): this
	// Binds a popup to the layer with the passed `content` and sets up the
	// necessary event listeners. If a `Function` is passed it will receive
	// the layer as the first argument and should return a `String` or `HTMLElement`.
	bindPopup: function (content, options) {

		if (content instanceof Popup) {
			setOptions(content, options);
			this._popup = content;
			content._source = this;
		} else {
			if (!this._popup || options) {
				this._popup = new Popup(options, this);
			}
			this._popup.setContent(content);
		}

		if (!this._popupHandlersAdded) {
			this.on({
				click: this._openPopup,
				keypress: this._onKeyPress,
				remove: this.closePopup,
				move: this._movePopup
			});
			this._popupHandlersAdded = true;
		}

		return this;
	},

	// @method unbindPopup(): this
	// Removes the popup previously bound with `bindPopup`.
	unbindPopup: function () {
		if (this._popup) {
			this.off({
				click: this._openPopup,
				keypress: this._onKeyPress,
				remove: this.closePopup,
				move: this._movePopup
			});
			this._popupHandlersAdded = false;
			this._popup = null;
		}
		return this;
	},

	// @method openPopup(latlng?: LatLng): this
	// Opens the bound popup at the specified `latlng` or at the default popup anchor if no `latlng` is passed.
	openPopup: function (layer, latlng) {
		if (!(layer instanceof Layer)) {
			latlng = layer;
			layer = this;
		}

		if (layer instanceof FeatureGroup) {
			for (var id in this._layers) {
				layer = this._layers[id];
				break;
			}
		}

		if (!latlng) {
			latlng = layer.getCenter ? layer.getCenter() : layer.getLatLng();
		}

		if (this._popup && this._map) {
			// set popup source to this layer
			this._popup._source = layer;

			// update the popup (content, layout, ect...)
			this._popup.update();

			// open the popup on the map
			this._map.openPopup(this._popup, latlng);
		}

		return this;
	},

	// @method closePopup(): this
	// Closes the popup bound to this layer if it is open.
	closePopup: function () {
		if (this._popup) {
			this._popup._close();
		}
		return this;
	},

	// @method togglePopup(): this
	// Opens or closes the popup bound to this layer depending on its current state.
	togglePopup: function (target) {
		if (this._popup) {
			if (this._popup._map) {
				this.closePopup();
			} else {
				this.openPopup(target);
			}
		}
		return this;
	},

	// @method isPopupOpen(): boolean
	// Returns `true` if the popup bound to this layer is currently open.
	isPopupOpen: function () {
		return (this._popup ? this._popup.isOpen() : false);
	},

	// @method setPopupContent(content: String|HTMLElement|Popup): this
	// Sets the content of the popup bound to this layer.
	setPopupContent: function (content) {
		if (this._popup) {
			this._popup.setContent(content);
		}
		return this;
	},

	// @method getPopup(): Popup
	// Returns the popup bound to this layer.
	getPopup: function () {
		return this._popup;
	},

	_openPopup: function (e) {
		var layer = e.layer || e.target;

		if (!this._popup) {
			return;
		}

		if (!this._map) {
			return;
		}

		// prevent map click
		stop(e);

		// if this inherits from Path its a vector and we can just
		// open the popup at the new location
		if (layer instanceof Path) {
			this.openPopup(e.layer || e.target, e.latlng);
			return;
		}

		// otherwise treat it like a marker and figure out
		// if we should toggle it open/closed
		if (this._map.hasLayer(this._popup) && this._popup._source === layer) {
			this.closePopup();
		} else {
			this.openPopup(layer, e.latlng);
		}
	},

	_movePopup: function (e) {
		this._popup.setLatLng(e.latlng);
	},

	_onKeyPress: function (e) {
		if (e.originalEvent.keyCode === 13) {
			this._openPopup(e);
		}
	}
});

/*
 * @class Tooltip
 * @inherits DivOverlay
 * @aka L.Tooltip
 * Used to display small texts on top of map layers.
 *
 * @example
 *
 * ```js
 * marker.bindTooltip("my tooltip text").openTooltip();
 * ```
 * Note about tooltip offset. Leaflet takes two options in consideration
 * for computing tooltip offsetting:
 * - the `offset` Tooltip option: it defaults to [0, 0], and it's specific to one tooltip.
 *   Add a positive x offset to move the tooltip to the right, and a positive y offset to
 *   move it to the bottom. Negatives will move to the left and top.
 * - the `tooltipAnchor` Icon option: this will only be considered for Marker. You
 *   should adapt this value if you use a custom icon.
 */


// @namespace Tooltip
var Tooltip = DivOverlay.extend({

	// @section
	// @aka Tooltip options
	options: {
		// @option pane: String = 'tooltipPane'
		// `Map pane` where the tooltip will be added.
		pane: 'tooltipPane',

		// @option offset: Point = Point(0, 0)
		// Optional offset of the tooltip position.
		offset: [0, 0],

		// @option direction: String = 'auto'
		// Direction where to open the tooltip. Possible values are: `right`, `left`,
		// `top`, `bottom`, `center`, `auto`.
		// `auto` will dynamically switch between `right` and `left` according to the tooltip
		// position on the map.
		direction: 'auto',

		// @option permanent: Boolean = false
		// Whether to open the tooltip permanently or only on mouseover.
		permanent: false,

		// @option sticky: Boolean = false
		// If true, the tooltip will follow the mouse instead of being fixed at the feature center.
		sticky: false,

		// @option interactive: Boolean = false
		// If true, the tooltip will listen to the feature events.
		interactive: false,

		// @option opacity: Number = 0.9
		// Tooltip container opacity.
		opacity: 0.9
	},

	onAdd: function (map) {
		DivOverlay.prototype.onAdd.call(this, map);
		this.setOpacity(this.options.opacity);

		// @namespace Map
		// @section Tooltip events
		// @event tooltipopen: TooltipEvent
		// Fired when a tooltip is opened in the map.
		map.fire('tooltipopen', {tooltip: this});

		if (this._source) {
			// @namespace Layer
			// @section Tooltip events
			// @event tooltipopen: TooltipEvent
			// Fired when a tooltip bound to this layer is opened.
			this._source.fire('tooltipopen', {tooltip: this}, true);
		}
	},

	onRemove: function (map) {
		DivOverlay.prototype.onRemove.call(this, map);

		// @namespace Map
		// @section Tooltip events
		// @event tooltipclose: TooltipEvent
		// Fired when a tooltip in the map is closed.
		map.fire('tooltipclose', {tooltip: this});

		if (this._source) {
			// @namespace Layer
			// @section Tooltip events
			// @event tooltipclose: TooltipEvent
			// Fired when a tooltip bound to this layer is closed.
			this._source.fire('tooltipclose', {tooltip: this}, true);
		}
	},

	getEvents: function () {
		var events = DivOverlay.prototype.getEvents.call(this);

		if (touch && !this.options.permanent) {
			events.preclick = this._close;
		}

		return events;
	},

	_close: function () {
		if (this._map) {
			this._map.closeTooltip(this);
		}
	},

	_initLayout: function () {
		var prefix = 'leaflet-tooltip',
		    className = prefix + ' ' + (this.options.className || '') + ' leaflet-zoom-' + (this._zoomAnimated ? 'animated' : 'hide');

		this._contentNode = this._container = create$1('div', className);
	},

	_updateLayout: function () {},

	_adjustPan: function () {},

	_setPosition: function (pos) {
		var map = this._map,
		    container = this._container,
		    centerPoint = map.latLngToContainerPoint(map.getCenter()),
		    tooltipPoint = map.layerPointToContainerPoint(pos),
		    direction = this.options.direction,
		    tooltipWidth = container.offsetWidth,
		    tooltipHeight = container.offsetHeight,
		    offset = toPoint(this.options.offset),
		    anchor = this._getAnchor();

		if (direction === 'top') {
			pos = pos.add(toPoint(-tooltipWidth / 2 + offset.x, -tooltipHeight + offset.y + anchor.y, true));
		} else if (direction === 'bottom') {
			pos = pos.subtract(toPoint(tooltipWidth / 2 - offset.x, -offset.y, true));
		} else if (direction === 'center') {
			pos = pos.subtract(toPoint(tooltipWidth / 2 + offset.x, tooltipHeight / 2 - anchor.y + offset.y, true));
		} else if (direction === 'right' || direction === 'auto' && tooltipPoint.x < centerPoint.x) {
			direction = 'right';
			pos = pos.add(toPoint(offset.x + anchor.x, anchor.y - tooltipHeight / 2 + offset.y, true));
		} else {
			direction = 'left';
			pos = pos.subtract(toPoint(tooltipWidth + anchor.x - offset.x, tooltipHeight / 2 - anchor.y - offset.y, true));
		}

		removeClass(container, 'leaflet-tooltip-right');
		removeClass(container, 'leaflet-tooltip-left');
		removeClass(container, 'leaflet-tooltip-top');
		removeClass(container, 'leaflet-tooltip-bottom');
		addClass(container, 'leaflet-tooltip-' + direction);
		setPosition(container, pos);
	},

	_updatePosition: function () {
		var pos = this._map.latLngToLayerPoint(this._latlng);
		this._setPosition(pos);
	},

	setOpacity: function (opacity) {
		this.options.opacity = opacity;

		if (this._container) {
			setOpacity(this._container, opacity);
		}
	},

	_animateZoom: function (e) {
		var pos = this._map._latLngToNewLayerPoint(this._latlng, e.zoom, e.center);
		this._setPosition(pos);
	},

	_getAnchor: function () {
		// Where should we anchor the tooltip on the source layer?
		return toPoint(this._source && this._source._getTooltipAnchor && !this.options.sticky ? this._source._getTooltipAnchor() : [0, 0]);
	}

});

// @namespace Tooltip
// @factory L.tooltip(options?: Tooltip options, source?: Layer)
// Instantiates a Tooltip object given an optional `options` object that describes its appearance and location and an optional `source` object that is used to tag the tooltip with a reference to the Layer to which it refers.
var tooltip = function (options, source) {
	return new Tooltip(options, source);
};

// @namespace Map
// @section Methods for Layers and Controls
Map.include({

	// @method openTooltip(tooltip: Tooltip): this
	// Opens the specified tooltip.
	// @alternative
	// @method openTooltip(content: String|HTMLElement, latlng: LatLng, options?: Tooltip options): this
	// Creates a tooltip with the specified content and options and open it.
	openTooltip: function (tooltip, latlng, options) {
		if (!(tooltip instanceof Tooltip)) {
			tooltip = new Tooltip(options).setContent(tooltip);
		}

		if (latlng) {
			tooltip.setLatLng(latlng);
		}

		if (this.hasLayer(tooltip)) {
			return this;
		}

		return this.addLayer(tooltip);
	},

	// @method closeTooltip(tooltip?: Tooltip): this
	// Closes the tooltip given as parameter.
	closeTooltip: function (tooltip) {
		if (tooltip) {
			this.removeLayer(tooltip);
		}
		return this;
	}

});

/*
 * @namespace Layer
 * @section Tooltip methods example
 *
 * All layers share a set of methods convenient for binding tooltips to it.
 *
 * ```js
 * var layer = L.Polygon(latlngs).bindTooltip('Hi There!').addTo(map);
 * layer.openTooltip();
 * layer.closeTooltip();
 * ```
 */

// @section Tooltip methods
Layer.include({

	// @method bindTooltip(content: String|HTMLElement|Function|Tooltip, options?: Tooltip options): this
	// Binds a tooltip to the layer with the passed `content` and sets up the
	// necessary event listeners. If a `Function` is passed it will receive
	// the layer as the first argument and should return a `String` or `HTMLElement`.
	bindTooltip: function (content, options) {

		if (content instanceof Tooltip) {
			setOptions(content, options);
			this._tooltip = content;
			content._source = this;
		} else {
			if (!this._tooltip || options) {
				this._tooltip = new Tooltip(options, this);
			}
			this._tooltip.setContent(content);

		}

		this._initTooltipInteractions();

		if (this._tooltip.options.permanent && this._map && this._map.hasLayer(this)) {
			this.openTooltip();
		}

		return this;
	},

	// @method unbindTooltip(): this
	// Removes the tooltip previously bound with `bindTooltip`.
	unbindTooltip: function () {
		if (this._tooltip) {
			this._initTooltipInteractions(true);
			this.closeTooltip();
			this._tooltip = null;
		}
		return this;
	},

	_initTooltipInteractions: function (remove$$1) {
		if (!remove$$1 && this._tooltipHandlersAdded) { return; }
		var onOff = remove$$1 ? 'off' : 'on',
		    events = {
			remove: this.closeTooltip,
			move: this._moveTooltip
		    };
		if (!this._tooltip.options.permanent) {
			events.mouseover = this._openTooltip;
			events.mouseout = this.closeTooltip;
			if (this._tooltip.options.sticky) {
				events.mousemove = this._moveTooltip;
			}
			if (touch) {
				events.click = this._openTooltip;
			}
		} else {
			events.add = this._openTooltip;
		}
		this[onOff](events);
		this._tooltipHandlersAdded = !remove$$1;
	},

	// @method openTooltip(latlng?: LatLng): this
	// Opens the bound tooltip at the specified `latlng` or at the default tooltip anchor if no `latlng` is passed.
	openTooltip: function (layer, latlng) {
		if (!(layer instanceof Layer)) {
			latlng = layer;
			layer = this;
		}

		if (layer instanceof FeatureGroup) {
			for (var id in this._layers) {
				layer = this._layers[id];
				break;
			}
		}

		if (!latlng) {
			latlng = layer.getCenter ? layer.getCenter() : layer.getLatLng();
		}

		if (this._tooltip && this._map) {

			// set tooltip source to this layer
			this._tooltip._source = layer;

			// update the tooltip (content, layout, ect...)
			this._tooltip.update();

			// open the tooltip on the map
			this._map.openTooltip(this._tooltip, latlng);

			// Tooltip container may not be defined if not permanent and never
			// opened.
			if (this._tooltip.options.interactive && this._tooltip._container) {
				addClass(this._tooltip._container, 'leaflet-clickable');
				this.addInteractiveTarget(this._tooltip._container);
			}
		}

		return this;
	},

	// @method closeTooltip(): this
	// Closes the tooltip bound to this layer if it is open.
	closeTooltip: function () {
		if (this._tooltip) {
			this._tooltip._close();
			if (this._tooltip.options.interactive && this._tooltip._container) {
				removeClass(this._tooltip._container, 'leaflet-clickable');
				this.removeInteractiveTarget(this._tooltip._container);
			}
		}
		return this;
	},

	// @method toggleTooltip(): this
	// Opens or closes the tooltip bound to this layer depending on its current state.
	toggleTooltip: function (target) {
		if (this._tooltip) {
			if (this._tooltip._map) {
				this.closeTooltip();
			} else {
				this.openTooltip(target);
			}
		}
		return this;
	},

	// @method isTooltipOpen(): boolean
	// Returns `true` if the tooltip bound to this layer is currently open.
	isTooltipOpen: function () {
		return this._tooltip.isOpen();
	},

	// @method setTooltipContent(content: String|HTMLElement|Tooltip): this
	// Sets the content of the tooltip bound to this layer.
	setTooltipContent: function (content) {
		if (this._tooltip) {
			this._tooltip.setContent(content);
		}
		return this;
	},

	// @method getTooltip(): Tooltip
	// Returns the tooltip bound to this layer.
	getTooltip: function () {
		return this._tooltip;
	},

	_openTooltip: function (e) {
		var layer = e.layer || e.target;

		if (!this._tooltip || !this._map) {
			return;
		}
		this.openTooltip(layer, this._tooltip.options.sticky ? e.latlng : undefined);
	},

	_moveTooltip: function (e) {
		var latlng = e.latlng, containerPoint, layerPoint;
		if (this._tooltip.options.sticky && e.originalEvent) {
			containerPoint = this._map.mouseEventToContainerPoint(e.originalEvent);
			layerPoint = this._map.containerPointToLayerPoint(containerPoint);
			latlng = this._map.layerPointToLatLng(layerPoint);
		}
		this._tooltip.setLatLng(latlng);
	}
});

/*
 * @class DivIcon
 * @aka L.DivIcon
 * @inherits Icon
 *
 * Represents a lightweight icon for markers that uses a simple `<div>`
 * element instead of an image. Inherits from `Icon` but ignores the `iconUrl` and shadow options.
 *
 * @example
 * ```js
 * var myIcon = L.divIcon({className: 'my-div-icon'});
 * // you can set .my-div-icon styles in CSS
 *
 * L.marker([50.505, 30.57], {icon: myIcon}).addTo(map);
 * ```
 *
 * By default, it has a 'leaflet-div-icon' CSS class and is styled as a little white square with a shadow.
 */

var DivIcon = Icon.extend({
	options: {
		// @section
		// @aka DivIcon options
		iconSize: [12, 12], // also can be set through CSS

		// iconAnchor: (Point),
		// popupAnchor: (Point),

		// @option html: String = ''
		// Custom HTML code to put inside the div element, empty by default.
		html: false,

		// @option bgPos: Point = [0, 0]
		// Optional relative position of the background, in pixels
		bgPos: null,

		className: 'leaflet-div-icon'
	},

	createIcon: function (oldIcon) {
		var div = (oldIcon && oldIcon.tagName === 'DIV') ? oldIcon : document.createElement('div'),
		    options = this.options;

		div.innerHTML = options.html !== false ? options.html : '';

		if (options.bgPos) {
			var bgPos = toPoint(options.bgPos);
			div.style.backgroundPosition = (-bgPos.x) + 'px ' + (-bgPos.y) + 'px';
		}
		this._setIconStyles(div, 'icon');

		return div;
	},

	createShadow: function () {
		return null;
	}
});

// @factory L.divIcon(options: DivIcon options)
// Creates a `DivIcon` instance with the given options.
function divIcon(options) {
	return new DivIcon(options);
}

Icon.Default = IconDefault;

/*
 * @class GridLayer
 * @inherits Layer
 * @aka L.GridLayer
 *
 * Generic class for handling a tiled grid of HTML elements. This is the base class for all tile layers and replaces `TileLayer.Canvas`.
 * GridLayer can be extended to create a tiled grid of HTML elements like `<canvas>`, `<img>` or `<div>`. GridLayer will handle creating and animating these DOM elements for you.
 *
 *
 * @section Synchronous usage
 * @example
 *
 * To create a custom layer, extend GridLayer and implement the `createTile()` method, which will be passed a `Point` object with the `x`, `y`, and `z` (zoom level) coordinates to draw your tile.
 *
 * ```js
 * var CanvasLayer = L.GridLayer.extend({
 *     createTile: function(coords){
 *         // create a <canvas> element for drawing
 *         var tile = L.DomUtil.create('canvas', 'leaflet-tile');
 *
 *         // setup tile width and height according to the options
 *         var size = this.getTileSize();
 *         tile.width = size.x;
 *         tile.height = size.y;
 *
 *         // get a canvas context and draw something on it using coords.x, coords.y and coords.z
 *         var ctx = tile.getContext('2d');
 *
 *         // return the tile so it can be rendered on screen
 *         return tile;
 *     }
 * });
 * ```
 *
 * @section Asynchronous usage
 * @example
 *
 * Tile creation can also be asynchronous, this is useful when using a third-party drawing library. Once the tile is finished drawing it can be passed to the `done()` callback.
 *
 * ```js
 * var CanvasLayer = L.GridLayer.extend({
 *     createTile: function(coords, done){
 *         var error;
 *
 *         // create a <canvas> element for drawing
 *         var tile = L.DomUtil.create('canvas', 'leaflet-tile');
 *
 *         // setup tile width and height according to the options
 *         var size = this.getTileSize();
 *         tile.width = size.x;
 *         tile.height = size.y;
 *
 *         // draw something asynchronously and pass the tile to the done() callback
 *         setTimeout(function() {
 *             done(error, tile);
 *         }, 1000);
 *
 *         return tile;
 *     }
 * });
 * ```
 *
 * @section
 */


var GridLayer = Layer.extend({

	// @section
	// @aka GridLayer options
	options: {
		// @option tileSize: Number|Point = 256
		// Width and height of tiles in the grid. Use a number if width and height are equal, or `L.point(width, height)` otherwise.
		tileSize: 256,

		// @option opacity: Number = 1.0
		// Opacity of the tiles. Can be used in the `createTile()` function.
		opacity: 1,

		// @option updateWhenIdle: Boolean = (depends)
		// Load new tiles only when panning ends.
		// `true` by default on mobile browsers, in order to avoid too many requests and keep smooth navigation.
		// `false` otherwise in order to display new tiles _during_ panning, since it is easy to pan outside the
		// [`keepBuffer`](#gridlayer-keepbuffer) option in desktop browsers.
		updateWhenIdle: mobile,

		// @option updateWhenZooming: Boolean = true
		// By default, a smooth zoom animation (during a [touch zoom](#map-touchzoom) or a [`flyTo()`](#map-flyto)) will update grid layers every integer zoom level. Setting this option to `false` will update the grid layer only when the smooth animation ends.
		updateWhenZooming: true,

		// @option updateInterval: Number = 200
		// Tiles will not update more than once every `updateInterval` milliseconds when panning.
		updateInterval: 200,

		// @option zIndex: Number = 1
		// The explicit zIndex of the tile layer.
		zIndex: 1,

		// @option bounds: LatLngBounds = undefined
		// If set, tiles will only be loaded inside the set `LatLngBounds`.
		bounds: null,

		// @option minZoom: Number = 0
		// The minimum zoom level down to which this layer will be displayed (inclusive).
		minZoom: 0,

		// @option maxZoom: Number = undefined
		// The maximum zoom level up to which this layer will be displayed (inclusive).
		maxZoom: undefined,

		// @option maxNativeZoom: Number = undefined
		// Maximum zoom number the tile source has available. If it is specified,
		// the tiles on all zoom levels higher than `maxNativeZoom` will be loaded
		// from `maxNativeZoom` level and auto-scaled.
		maxNativeZoom: undefined,

		// @option minNativeZoom: Number = undefined
		// Minimum zoom number the tile source has available. If it is specified,
		// the tiles on all zoom levels lower than `minNativeZoom` will be loaded
		// from `minNativeZoom` level and auto-scaled.
		minNativeZoom: undefined,

		// @option noWrap: Boolean = false
		// Whether the layer is wrapped around the antimeridian. If `true`, the
		// GridLayer will only be displayed once at low zoom levels. Has no
		// effect when the [map CRS](#map-crs) doesn't wrap around. Can be used
		// in combination with [`bounds`](#gridlayer-bounds) to prevent requesting
		// tiles outside the CRS limits.
		noWrap: false,

		// @option pane: String = 'tilePane'
		// `Map pane` where the grid layer will be added.
		pane: 'tilePane',

		// @option className: String = ''
		// A custom class name to assign to the tile layer. Empty by default.
		className: '',

		// @option keepBuffer: Number = 2
		// When panning the map, keep this many rows and columns of tiles before unloading them.
		keepBuffer: 2
	},

	initialize: function (options) {
		setOptions(this, options);
	},

	onAdd: function () {
		this._initContainer();

		this._levels = {};
		this._tiles = {};

		this._resetView();
		this._update();
	},

	beforeAdd: function (map) {
		map._addZoomLimit(this);
	},

	onRemove: function (map) {
		this._removeAllTiles();
		remove(this._container);
		map._removeZoomLimit(this);
		this._container = null;
		this._tileZoom = undefined;
	},

	// @method bringToFront: this
	// Brings the tile layer to the top of all tile layers.
	bringToFront: function () {
		if (this._map) {
			toFront(this._container);
			this._setAutoZIndex(Math.max);
		}
		return this;
	},

	// @method bringToBack: this
	// Brings the tile layer to the bottom of all tile layers.
	bringToBack: function () {
		if (this._map) {
			toBack(this._container);
			this._setAutoZIndex(Math.min);
		}
		return this;
	},

	// @method getContainer: HTMLElement
	// Returns the HTML element that contains the tiles for this layer.
	getContainer: function () {
		return this._container;
	},

	// @method setOpacity(opacity: Number): this
	// Changes the [opacity](#gridlayer-opacity) of the grid layer.
	setOpacity: function (opacity) {
		this.options.opacity = opacity;
		this._updateOpacity();
		return this;
	},

	// @method setZIndex(zIndex: Number): this
	// Changes the [zIndex](#gridlayer-zindex) of the grid layer.
	setZIndex: function (zIndex) {
		this.options.zIndex = zIndex;
		this._updateZIndex();

		return this;
	},

	// @method isLoading: Boolean
	// Returns `true` if any tile in the grid layer has not finished loading.
	isLoading: function () {
		return this._loading;
	},

	// @method redraw: this
	// Causes the layer to clear all the tiles and request them again.
	redraw: function () {
		if (this._map) {
			this._removeAllTiles();
			this._update();
		}
		return this;
	},

	getEvents: function () {
		var events = {
			viewprereset: this._invalidateAll,
			viewreset: this._resetView,
			zoom: this._resetView,
			moveend: this._onMoveEnd
		};

		if (!this.options.updateWhenIdle) {
			// update tiles on move, but not more often than once per given interval
			if (!this._onMove) {
				this._onMove = throttle(this._onMoveEnd, this.options.updateInterval, this);
			}

			events.move = this._onMove;
		}

		if (this._zoomAnimated) {
			events.zoomanim = this._animateZoom;
		}

		return events;
	},

	// @section Extension methods
	// Layers extending `GridLayer` shall reimplement the following method.
	// @method createTile(coords: Object, done?: Function): HTMLElement
	// Called only internally, must be overridden by classes extending `GridLayer`.
	// Returns the `HTMLElement` corresponding to the given `coords`. If the `done` callback
	// is specified, it must be called when the tile has finished loading and drawing.
	createTile: function () {
		return document.createElement('div');
	},

	// @section
	// @method getTileSize: Point
	// Normalizes the [tileSize option](#gridlayer-tilesize) into a point. Used by the `createTile()` method.
	getTileSize: function () {
		var s = this.options.tileSize;
		return s instanceof Point ? s : new Point(s, s);
	},

	_updateZIndex: function () {
		if (this._container && this.options.zIndex !== undefined && this.options.zIndex !== null) {
			this._container.style.zIndex = this.options.zIndex;
		}
	},

	_setAutoZIndex: function (compare) {
		// go through all other layers of the same pane, set zIndex to max + 1 (front) or min - 1 (back)

		var layers = this.getPane().children,
		    edgeZIndex = -compare(-Infinity, Infinity); // -Infinity for max, Infinity for min

		for (var i = 0, len = layers.length, zIndex; i < len; i++) {

			zIndex = layers[i].style.zIndex;

			if (layers[i] !== this._container && zIndex) {
				edgeZIndex = compare(edgeZIndex, +zIndex);
			}
		}

		if (isFinite(edgeZIndex)) {
			this.options.zIndex = edgeZIndex + compare(-1, 1);
			this._updateZIndex();
		}
	},

	_updateOpacity: function () {
		if (!this._map) { return; }

		// IE doesn't inherit filter opacity properly, so we're forced to set it on tiles
		if (ielt9) { return; }

		setOpacity(this._container, this.options.opacity);

		var now = +new Date(),
		    nextFrame = false,
		    willPrune = false;

		for (var key in this._tiles) {
			var tile = this._tiles[key];
			if (!tile.current || !tile.loaded) { continue; }

			var fade = Math.min(1, (now - tile.loaded) / 200);

			setOpacity(tile.el, fade);
			if (fade < 1) {
				nextFrame = true;
			} else {
				if (tile.active) {
					willPrune = true;
				} else {
					this._onOpaqueTile(tile);
				}
				tile.active = true;
			}
		}

		if (willPrune && !this._noPrune) { this._pruneTiles(); }

		if (nextFrame) {
			cancelAnimFrame(this._fadeFrame);
			this._fadeFrame = requestAnimFrame(this._updateOpacity, this);
		}
	},

	_onOpaqueTile: falseFn,

	_initContainer: function () {
		if (this._container) { return; }

		this._container = create$1('div', 'leaflet-layer ' + (this.options.className || ''));
		this._updateZIndex();

		if (this.options.opacity < 1) {
			this._updateOpacity();
		}

		this.getPane().appendChild(this._container);
	},

	_updateLevels: function () {

		var zoom = this._tileZoom,
		    maxZoom = this.options.maxZoom;

		if (zoom === undefined) { return undefined; }

		for (var z in this._levels) {
			if (this._levels[z].el.children.length || z === zoom) {
				this._levels[z].el.style.zIndex = maxZoom - Math.abs(zoom - z);
				this._onUpdateLevel(z);
			} else {
				remove(this._levels[z].el);
				this._removeTilesAtZoom(z);
				this._onRemoveLevel(z);
				delete this._levels[z];
			}
		}

		var level = this._levels[zoom],
		    map = this._map;

		if (!level) {
			level = this._levels[zoom] = {};

			level.el = create$1('div', 'leaflet-tile-container leaflet-zoom-animated', this._container);
			level.el.style.zIndex = maxZoom;

			level.origin = map.project(map.unproject(map.getPixelOrigin()), zoom).round();
			level.zoom = zoom;

			this._setZoomTransform(level, map.getCenter(), map.getZoom());

			// force the browser to consider the newly added element for transition
			falseFn(level.el.offsetWidth);

			this._onCreateLevel(level);
		}

		this._level = level;

		return level;
	},

	_onUpdateLevel: falseFn,

	_onRemoveLevel: falseFn,

	_onCreateLevel: falseFn,

	_pruneTiles: function () {
		if (!this._map) {
			return;
		}

		var key, tile;

		var zoom = this._map.getZoom();
		if (zoom > this.options.maxZoom ||
			zoom < this.options.minZoom) {
			this._removeAllTiles();
			return;
		}

		for (key in this._tiles) {
			tile = this._tiles[key];
			tile.retain = tile.current;
		}

		for (key in this._tiles) {
			tile = this._tiles[key];
			if (tile.current && !tile.active) {
				var coords = tile.coords;
				if (!this._retainParent(coords.x, coords.y, coords.z, coords.z - 5)) {
					this._retainChildren(coords.x, coords.y, coords.z, coords.z + 2);
				}
			}
		}

		for (key in this._tiles) {
			if (!this._tiles[key].retain) {
				this._removeTile(key);
			}
		}
	},

	_removeTilesAtZoom: function (zoom) {
		for (var key in this._tiles) {
			if (this._tiles[key].coords.z !== zoom) {
				continue;
			}
			this._removeTile(key);
		}
	},

	_removeAllTiles: function () {
		for (var key in this._tiles) {
			this._removeTile(key);
		}
	},

	_invalidateAll: function () {
		for (var z in this._levels) {
			remove(this._levels[z].el);
			this._onRemoveLevel(z);
			delete this._levels[z];
		}
		this._removeAllTiles();

		this._tileZoom = undefined;
	},

	_retainParent: function (x, y, z, minZoom) {
		var x2 = Math.floor(x / 2),
		    y2 = Math.floor(y / 2),
		    z2 = z - 1,
		    coords2 = new Point(+x2, +y2);
		coords2.z = +z2;

		var key = this._tileCoordsToKey(coords2),
		    tile = this._tiles[key];

		if (tile && tile.active) {
			tile.retain = true;
			return true;

		} else if (tile && tile.loaded) {
			tile.retain = true;
		}

		if (z2 > minZoom) {
			return this._retainParent(x2, y2, z2, minZoom);
		}

		return false;
	},

	_retainChildren: function (x, y, z, maxZoom) {

		for (var i = 2 * x; i < 2 * x + 2; i++) {
			for (var j = 2 * y; j < 2 * y + 2; j++) {

				var coords = new Point(i, j);
				coords.z = z + 1;

				var key = this._tileCoordsToKey(coords),
				    tile = this._tiles[key];

				if (tile && tile.active) {
					tile.retain = true;
					continue;

				} else if (tile && tile.loaded) {
					tile.retain = true;
				}

				if (z + 1 < maxZoom) {
					this._retainChildren(i, j, z + 1, maxZoom);
				}
			}
		}
	},

	_resetView: function (e) {
		var animating = e && (e.pinch || e.flyTo);
		this._setView(this._map.getCenter(), this._map.getZoom(), animating, animating);
	},

	_animateZoom: function (e) {
		this._setView(e.center, e.zoom, true, e.noUpdate);
	},

	_clampZoom: function (zoom) {
		var options = this.options;

		if (undefined !== options.minNativeZoom && zoom < options.minNativeZoom) {
			return options.minNativeZoom;
		}

		if (undefined !== options.maxNativeZoom && options.maxNativeZoom < zoom) {
			return options.maxNativeZoom;
		}

		return zoom;
	},

	_setView: function (center, zoom, noPrune, noUpdate) {
		var tileZoom = this._clampZoom(Math.round(zoom));
		if ((this.options.maxZoom !== undefined && tileZoom > this.options.maxZoom) ||
		    (this.options.minZoom !== undefined && tileZoom < this.options.minZoom)) {
			tileZoom = undefined;
		}

		var tileZoomChanged = this.options.updateWhenZooming && (tileZoom !== this._tileZoom);

		if (!noUpdate || tileZoomChanged) {

			this._tileZoom = tileZoom;

			if (this._abortLoading) {
				this._abortLoading();
			}

			this._updateLevels();
			this._resetGrid();

			if (tileZoom !== undefined) {
				this._update(center);
			}

			if (!noPrune) {
				this._pruneTiles();
			}

			// Flag to prevent _updateOpacity from pruning tiles during
			// a zoom anim or a pinch gesture
			this._noPrune = !!noPrune;
		}

		this._setZoomTransforms(center, zoom);
	},

	_setZoomTransforms: function (center, zoom) {
		for (var i in this._levels) {
			this._setZoomTransform(this._levels[i], center, zoom);
		}
	},

	_setZoomTransform: function (level, center, zoom) {
		var scale = this._map.getZoomScale(zoom, level.zoom),
		    translate = level.origin.multiplyBy(scale)
		        .subtract(this._map._getNewPixelOrigin(center, zoom)).round();

		if (any3d) {
			setTransform(level.el, translate, scale);
		} else {
			setPosition(level.el, translate);
		}
	},

	_resetGrid: function () {
		var map = this._map,
		    crs = map.options.crs,
		    tileSize = this._tileSize = this.getTileSize(),
		    tileZoom = this._tileZoom;

		var bounds = this._map.getPixelWorldBounds(this._tileZoom);
		if (bounds) {
			this._globalTileRange = this._pxBoundsToTileRange(bounds);
		}

		this._wrapX = crs.wrapLng && !this.options.noWrap && [
			Math.floor(map.project([0, crs.wrapLng[0]], tileZoom).x / tileSize.x),
			Math.ceil(map.project([0, crs.wrapLng[1]], tileZoom).x / tileSize.y)
		];
		this._wrapY = crs.wrapLat && !this.options.noWrap && [
			Math.floor(map.project([crs.wrapLat[0], 0], tileZoom).y / tileSize.x),
			Math.ceil(map.project([crs.wrapLat[1], 0], tileZoom).y / tileSize.y)
		];
	},

	_onMoveEnd: function () {
		if (!this._map || this._map._animatingZoom) { return; }

		this._update();
	},

	_getTiledPixelBounds: function (center) {
		var map = this._map,
		    mapZoom = map._animatingZoom ? Math.max(map._animateToZoom, map.getZoom()) : map.getZoom(),
		    scale = map.getZoomScale(mapZoom, this._tileZoom),
		    pixelCenter = map.project(center, this._tileZoom).floor(),
		    halfSize = map.getSize().divideBy(scale * 2);

		return new Bounds(pixelCenter.subtract(halfSize), pixelCenter.add(halfSize));
	},

	// Private method to load tiles in the grid's active zoom level according to map bounds
	_update: function (center) {
		var map = this._map;
		if (!map) { return; }
		var zoom = this._clampZoom(map.getZoom());

		if (center === undefined) { center = map.getCenter(); }
		if (this._tileZoom === undefined) { return; }	// if out of minzoom/maxzoom

		var pixelBounds = this._getTiledPixelBounds(center),
		    tileRange = this._pxBoundsToTileRange(pixelBounds),
		    tileCenter = tileRange.getCenter(),
		    queue = [],
		    margin = this.options.keepBuffer,
		    noPruneRange = new Bounds(tileRange.getBottomLeft().subtract([margin, -margin]),
		                              tileRange.getTopRight().add([margin, -margin]));

		// Sanity check: panic if the tile range contains Infinity somewhere.
		if (!(isFinite(tileRange.min.x) &&
		      isFinite(tileRange.min.y) &&
		      isFinite(tileRange.max.x) &&
		      isFinite(tileRange.max.y))) { throw new Error('Attempted to load an infinite number of tiles'); }

		for (var key in this._tiles) {
			var c = this._tiles[key].coords;
			if (c.z !== this._tileZoom || !noPruneRange.contains(new Point(c.x, c.y))) {
				this._tiles[key].current = false;
			}
		}

		// _update just loads more tiles. If the tile zoom level differs too much
		// from the map's, let _setView reset levels and prune old tiles.
		if (Math.abs(zoom - this._tileZoom) > 1) { this._setView(center, zoom); return; }

		// create a queue of coordinates to load tiles from
		for (var j = tileRange.min.y; j <= tileRange.max.y; j++) {
			for (var i = tileRange.min.x; i <= tileRange.max.x; i++) {
				var coords = new Point(i, j);
				coords.z = this._tileZoom;

				if (!this._isValidTile(coords)) { continue; }

				var tile = this._tiles[this._tileCoordsToKey(coords)];
				if (tile) {
					tile.current = true;
				} else {
					queue.push(coords);
				}
			}
		}

		// sort tile queue to load tiles in order of their distance to center
		queue.sort(function (a, b) {
			return a.distanceTo(tileCenter) - b.distanceTo(tileCenter);
		});

		if (queue.length !== 0) {
			// if it's the first batch of tiles to load
			if (!this._loading) {
				this._loading = true;
				// @event loading: Event
				// Fired when the grid layer starts loading tiles.
				this.fire('loading');
			}

			// create DOM fragment to append tiles in one batch
			var fragment = document.createDocumentFragment();

			for (i = 0; i < queue.length; i++) {
				this._addTile(queue[i], fragment);
			}

			this._level.el.appendChild(fragment);
		}
	},

	_isValidTile: function (coords) {
		var crs = this._map.options.crs;

		if (!crs.infinite) {
			// don't load tile if it's out of bounds and not wrapped
			var bounds = this._globalTileRange;
			if ((!crs.wrapLng && (coords.x < bounds.min.x || coords.x > bounds.max.x)) ||
			    (!crs.wrapLat && (coords.y < bounds.min.y || coords.y > bounds.max.y))) { return false; }
		}

		if (!this.options.bounds) { return true; }

		// don't load tile if it doesn't intersect the bounds in options
		var tileBounds = this._tileCoordsToBounds(coords);
		return toLatLngBounds(this.options.bounds).overlaps(tileBounds);
	},

	_keyToBounds: function (key) {
		return this._tileCoordsToBounds(this._keyToTileCoords(key));
	},

	_tileCoordsToNwSe: function (coords) {
		var map = this._map,
		    tileSize = this.getTileSize(),
		    nwPoint = coords.scaleBy(tileSize),
		    sePoint = nwPoint.add(tileSize),
		    nw = map.unproject(nwPoint, coords.z),
		    se = map.unproject(sePoint, coords.z);
		return [nw, se];
	},

	// converts tile coordinates to its geographical bounds
	_tileCoordsToBounds: function (coords) {
		var bp = this._tileCoordsToNwSe(coords),
		    bounds = new LatLngBounds(bp[0], bp[1]);

		if (!this.options.noWrap) {
			bounds = this._map.wrapLatLngBounds(bounds);
		}
		return bounds;
	},
	// converts tile coordinates to key for the tile cache
	_tileCoordsToKey: function (coords) {
		return coords.x + ':' + coords.y + ':' + coords.z;
	},

	// converts tile cache key to coordinates
	_keyToTileCoords: function (key) {
		var k = key.split(':'),
		    coords = new Point(+k[0], +k[1]);
		coords.z = +k[2];
		return coords;
	},

	_removeTile: function (key) {
		var tile = this._tiles[key];
		if (!tile) { return; }

		remove(tile.el);

		delete this._tiles[key];

		// @event tileunload: TileEvent
		// Fired when a tile is removed (e.g. when a tile goes off the screen).
		this.fire('tileunload', {
			tile: tile.el,
			coords: this._keyToTileCoords(key)
		});
	},

	_initTile: function (tile) {
		addClass(tile, 'leaflet-tile');

		var tileSize = this.getTileSize();
		tile.style.width = tileSize.x + 'px';
		tile.style.height = tileSize.y + 'px';

		tile.onselectstart = falseFn;
		tile.onmousemove = falseFn;

		// update opacity on tiles in IE7-8 because of filter inheritance problems
		if (ielt9 && this.options.opacity < 1) {
			setOpacity(tile, this.options.opacity);
		}

		// without this hack, tiles disappear after zoom on Chrome for Android
		// https://github.com/Leaflet/Leaflet/issues/2078
		if (android && !android23) {
			tile.style.WebkitBackfaceVisibility = 'hidden';
		}
	},

	_addTile: function (coords, container) {
		var tilePos = this._getTilePos(coords),
		    key = this._tileCoordsToKey(coords);

		var tile = this.createTile(this._wrapCoords(coords), bind(this._tileReady, this, coords));

		this._initTile(tile);

		// if createTile is defined with a second argument ("done" callback),
		// we know that tile is async and will be ready later; otherwise
		if (this.createTile.length < 2) {
			// mark tile as ready, but delay one frame for opacity animation to happen
			requestAnimFrame(bind(this._tileReady, this, coords, null, tile));
		}

		setPosition(tile, tilePos);

		// save tile in cache
		this._tiles[key] = {
			el: tile,
			coords: coords,
			current: true
		};

		container.appendChild(tile);
		// @event tileloadstart: TileEvent
		// Fired when a tile is requested and starts loading.
		this.fire('tileloadstart', {
			tile: tile,
			coords: coords
		});
	},

	_tileReady: function (coords, err, tile) {
		if (err) {
			// @event tileerror: TileErrorEvent
			// Fired when there is an error loading a tile.
			this.fire('tileerror', {
				error: err,
				tile: tile,
				coords: coords
			});
		}

		var key = this._tileCoordsToKey(coords);

		tile = this._tiles[key];
		if (!tile) { return; }

		tile.loaded = +new Date();
		if (this._map._fadeAnimated) {
			setOpacity(tile.el, 0);
			cancelAnimFrame(this._fadeFrame);
			this._fadeFrame = requestAnimFrame(this._updateOpacity, this);
		} else {
			tile.active = true;
			this._pruneTiles();
		}

		if (!err) {
			addClass(tile.el, 'leaflet-tile-loaded');

			// @event tileload: TileEvent
			// Fired when a tile loads.
			this.fire('tileload', {
				tile: tile.el,
				coords: coords
			});
		}

		if (this._noTilesToLoad()) {
			this._loading = false;
			// @event load: Event
			// Fired when the grid layer loaded all visible tiles.
			this.fire('load');

			if (ielt9 || !this._map._fadeAnimated) {
				requestAnimFrame(this._pruneTiles, this);
			} else {
				// Wait a bit more than 0.2 secs (the duration of the tile fade-in)
				// to trigger a pruning.
				setTimeout(bind(this._pruneTiles, this), 250);
			}
		}
	},

	_getTilePos: function (coords) {
		return coords.scaleBy(this.getTileSize()).subtract(this._level.origin);
	},

	_wrapCoords: function (coords) {
		var newCoords = new Point(
			this._wrapX ? wrapNum(coords.x, this._wrapX) : coords.x,
			this._wrapY ? wrapNum(coords.y, this._wrapY) : coords.y);
		newCoords.z = coords.z;
		return newCoords;
	},

	_pxBoundsToTileRange: function (bounds) {
		var tileSize = this.getTileSize();
		return new Bounds(
			bounds.min.unscaleBy(tileSize).floor(),
			bounds.max.unscaleBy(tileSize).ceil().subtract([1, 1]));
	},

	_noTilesToLoad: function () {
		for (var key in this._tiles) {
			if (!this._tiles[key].loaded) { return false; }
		}
		return true;
	}
});

// @factory L.gridLayer(options?: GridLayer options)
// Creates a new instance of GridLayer with the supplied options.
function gridLayer(options) {
	return new GridLayer(options);
}

/*
 * @class TileLayer
 * @inherits GridLayer
 * @aka L.TileLayer
 * Used to load and display tile layers on the map. Extends `GridLayer`.
 *
 * @example
 *
 * ```js
 * L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}', {foo: 'bar'}).addTo(map);
 * ```
 *
 * @section URL template
 * @example
 *
 * A string of the following form:
 *
 * ```
 * 'http://{s}.somedomain.com/blabla/{z}/{x}/{y}{r}.png'
 * ```
 *
 * `{s}` means one of the available subdomains (used sequentially to help with browser parallel requests per domain limitation; subdomain values are specified in options; `a`, `b` or `c` by default, can be omitted), `{z}` — zoom level, `{x}` and `{y}` — tile coordinates. `{r}` can be used to add "&commat;2x" to the URL to load retina tiles.
 *
 * You can use custom keys in the template, which will be [evaluated](#util-template) from TileLayer options, like this:
 *
 * ```
 * L.tileLayer('http://{s}.somedomain.com/{foo}/{z}/{x}/{y}.png', {foo: 'bar'});
 * ```
 */


var TileLayer = GridLayer.extend({

	// @section
	// @aka TileLayer options
	options: {
		// @option minZoom: Number = 0
		// The minimum zoom level down to which this layer will be displayed (inclusive).
		minZoom: 0,

		// @option maxZoom: Number = 18
		// The maximum zoom level up to which this layer will be displayed (inclusive).
		maxZoom: 18,

		// @option subdomains: String|String[] = 'abc'
		// Subdomains of the tile service. Can be passed in the form of one string (where each letter is a subdomain name) or an array of strings.
		subdomains: 'abc',

		// @option errorTileUrl: String = ''
		// URL to the tile image to show in place of the tile that failed to load.
		errorTileUrl: '',

		// @option zoomOffset: Number = 0
		// The zoom number used in tile URLs will be offset with this value.
		zoomOffset: 0,

		// @option tms: Boolean = false
		// If `true`, inverses Y axis numbering for tiles (turn this on for [TMS](https://en.wikipedia.org/wiki/Tile_Map_Service) services).
		tms: false,

		// @option zoomReverse: Boolean = false
		// If set to true, the zoom number used in tile URLs will be reversed (`maxZoom - zoom` instead of `zoom`)
		zoomReverse: false,

		// @option detectRetina: Boolean = false
		// If `true` and user is on a retina display, it will request four tiles of half the specified size and a bigger zoom level in place of one to utilize the high resolution.
		detectRetina: false,

		// @option crossOrigin: Boolean|String = false
		// Whether the crossOrigin attribute will be added to the tiles.
		// If a String is provided, all tiles will have their crossOrigin attribute set to the String provided. This is needed if you want to access tile pixel data.
		// Refer to [CORS Settings](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_settings_attributes) for valid String values.
		crossOrigin: false
	},

	initialize: function (url, options) {

		this._url = url;

		options = setOptions(this, options);

		// detecting retina displays, adjusting tileSize and zoom levels
		if (options.detectRetina && retina && options.maxZoom > 0) {

			options.tileSize = Math.floor(options.tileSize / 2);

			if (!options.zoomReverse) {
				options.zoomOffset++;
				options.maxZoom--;
			} else {
				options.zoomOffset--;
				options.minZoom++;
			}

			options.minZoom = Math.max(0, options.minZoom);
		}

		if (typeof options.subdomains === 'string') {
			options.subdomains = options.subdomains.split('');
		}

		// for https://github.com/Leaflet/Leaflet/issues/137
		if (!android) {
			this.on('tileunload', this._onTileRemove);
		}
	},

	// @method setUrl(url: String, noRedraw?: Boolean): this
	// Updates the layer's URL template and redraws it (unless `noRedraw` is set to `true`).
	setUrl: function (url, noRedraw) {
		this._url = url;

		if (!noRedraw) {
			this.redraw();
		}
		return this;
	},

	// @method createTile(coords: Object, done?: Function): HTMLElement
	// Called only internally, overrides GridLayer's [`createTile()`](#gridlayer-createtile)
	// to return an `<img>` HTML element with the appropriate image URL given `coords`. The `done`
	// callback is called when the tile has been loaded.
	createTile: function (coords, done) {
		var tile = document.createElement('img');

		on(tile, 'load', bind(this._tileOnLoad, this, done, tile));
		on(tile, 'error', bind(this._tileOnError, this, done, tile));

		if (this.options.crossOrigin || this.options.crossOrigin === '') {
			tile.crossOrigin = this.options.crossOrigin === true ? '' : this.options.crossOrigin;
		}

		/*
		 Alt tag is set to empty string to keep screen readers from reading URL and for compliance reasons
		 http://www.w3.org/TR/WCAG20-TECHS/H67
		*/
		tile.alt = '';

		/*
		 Set role="presentation" to force screen readers to ignore this
		 https://www.w3.org/TR/wai-aria/roles#textalternativecomputation
		*/
		tile.setAttribute('role', 'presentation');

		tile.src = this.getTileUrl(coords);

		return tile;
	},

	// @section Extension methods
	// @uninheritable
	// Layers extending `TileLayer` might reimplement the following method.
	// @method getTileUrl(coords: Object): String
	// Called only internally, returns the URL for a tile given its coordinates.
	// Classes extending `TileLayer` can override this function to provide custom tile URL naming schemes.
	getTileUrl: function (coords) {
		var data = {
			r: retina ? '@2x' : '',
			s: this._getSubdomain(coords),
			x: coords.x,
			y: coords.y,
			z: this._getZoomForUrl()
		};
		if (this._map && !this._map.options.crs.infinite) {
			var invertedY = this._globalTileRange.max.y - coords.y;
			if (this.options.tms) {
				data['y'] = invertedY;
			}
			data['-y'] = invertedY;
		}

		return template(this._url, extend(data, this.options));
	},

	_tileOnLoad: function (done, tile) {
		// For https://github.com/Leaflet/Leaflet/issues/3332
		if (ielt9) {
			setTimeout(bind(done, this, null, tile), 0);
		} else {
			done(null, tile);
		}
	},

	_tileOnError: function (done, tile, e) {
		var errorUrl = this.options.errorTileUrl;
		if (errorUrl && tile.getAttribute('src') !== errorUrl) {
			tile.src = errorUrl;
		}
		done(e, tile);
	},

	_onTileRemove: function (e) {
		e.tile.onload = null;
	},

	_getZoomForUrl: function () {
		var zoom = this._tileZoom,
		maxZoom = this.options.maxZoom,
		zoomReverse = this.options.zoomReverse,
		zoomOffset = this.options.zoomOffset;

		if (zoomReverse) {
			zoom = maxZoom - zoom;
		}

		return zoom + zoomOffset;
	},

	_getSubdomain: function (tilePoint) {
		var index = Math.abs(tilePoint.x + tilePoint.y) % this.options.subdomains.length;
		return this.options.subdomains[index];
	},

	// stops loading all tiles in the background layer
	_abortLoading: function () {
		var i, tile;
		for (i in this._tiles) {
			if (this._tiles[i].coords.z !== this._tileZoom) {
				tile = this._tiles[i].el;

				tile.onload = falseFn;
				tile.onerror = falseFn;

				if (!tile.complete) {
					tile.src = emptyImageUrl;
					remove(tile);
					delete this._tiles[i];
				}
			}
		}
	},

	_removeTile: function (key) {
		var tile = this._tiles[key];
		if (!tile) { return; }

		// Cancels any pending http requests associated with the tile
		// unless we're on Android's stock browser,
		// see https://github.com/Leaflet/Leaflet/issues/137
		if (!androidStock) {
			tile.el.setAttribute('src', emptyImageUrl);
		}

		return GridLayer.prototype._removeTile.call(this, key);
	},

	_tileReady: function (coords, err, tile) {
		if (!this._map || (tile && tile.getAttribute('src') === emptyImageUrl)) {
			return;
		}

		return GridLayer.prototype._tileReady.call(this, coords, err, tile);
	}
});


// @factory L.tilelayer(urlTemplate: String, options?: TileLayer options)
// Instantiates a tile layer object given a `URL template` and optionally an options object.

function tileLayer(url, options) {
	return new TileLayer(url, options);
}

/*
 * @class TileLayer.WMS
 * @inherits TileLayer
 * @aka L.TileLayer.WMS
 * Used to display [WMS](https://en.wikipedia.org/wiki/Web_Map_Service) services as tile layers on the map. Extends `TileLayer`.
 *
 * @example
 *
 * ```js
 * var nexrad = L.tileLayer.wms("http://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r.cgi", {
 * 	layers: 'nexrad-n0r-900913',
 * 	format: 'image/png',
 * 	transparent: true,
 * 	attribution: "Weather data © 2012 IEM Nexrad"
 * });
 * ```
 */

var TileLayerWMS = TileLayer.extend({

	// @section
	// @aka TileLayer.WMS options
	// If any custom options not documented here are used, they will be sent to the
	// WMS server as extra parameters in each request URL. This can be useful for
	// [non-standard vendor WMS parameters](http://docs.geoserver.org/stable/en/user/services/wms/vendor.html).
	defaultWmsParams: {
		service: 'WMS',
		request: 'GetMap',

		// @option layers: String = ''
		// **(required)** Comma-separated list of WMS layers to show.
		layers: '',

		// @option styles: String = ''
		// Comma-separated list of WMS styles.
		styles: '',

		// @option format: String = 'image/jpeg'
		// WMS image format (use `'image/png'` for layers with transparency).
		format: 'image/jpeg',

		// @option transparent: Boolean = false
		// If `true`, the WMS service will return images with transparency.
		transparent: false,

		// @option version: String = '1.1.1'
		// Version of the WMS service to use
		version: '1.1.1'
	},

	options: {
		// @option crs: CRS = null
		// Coordinate Reference System to use for the WMS requests, defaults to
		// map CRS. Don't change this if you're not sure what it means.
		crs: null,

		// @option uppercase: Boolean = false
		// If `true`, WMS request parameter keys will be uppercase.
		uppercase: false
	},

	initialize: function (url, options) {

		this._url = url;

		var wmsParams = extend({}, this.defaultWmsParams);

		// all keys that are not TileLayer options go to WMS params
		for (var i in options) {
			if (!(i in this.options)) {
				wmsParams[i] = options[i];
			}
		}

		options = setOptions(this, options);

		var realRetina = options.detectRetina && retina ? 2 : 1;
		var tileSize = this.getTileSize();
		wmsParams.width = tileSize.x * realRetina;
		wmsParams.height = tileSize.y * realRetina;

		this.wmsParams = wmsParams;
	},

	onAdd: function (map) {

		this._crs = this.options.crs || map.options.crs;
		this._wmsVersion = parseFloat(this.wmsParams.version);

		var projectionKey = this._wmsVersion >= 1.3 ? 'crs' : 'srs';
		this.wmsParams[projectionKey] = this._crs.code;

		TileLayer.prototype.onAdd.call(this, map);
	},

	getTileUrl: function (coords) {

		var tileBounds = this._tileCoordsToNwSe(coords),
		    crs = this._crs,
		    bounds = toBounds(crs.project(tileBounds[0]), crs.project(tileBounds[1])),
		    min = bounds.min,
		    max = bounds.max,
		    bbox = (this._wmsVersion >= 1.3 && this._crs === EPSG4326 ?
		    [min.y, min.x, max.y, max.x] :
		    [min.x, min.y, max.x, max.y]).join(','),
		    url = TileLayer.prototype.getTileUrl.call(this, coords);
		return url +
			getParamString(this.wmsParams, url, this.options.uppercase) +
			(this.options.uppercase ? '&BBOX=' : '&bbox=') + bbox;
	},

	// @method setParams(params: Object, noRedraw?: Boolean): this
	// Merges an object with the new parameters and re-requests tiles on the current screen (unless `noRedraw` was set to true).
	setParams: function (params, noRedraw) {

		extend(this.wmsParams, params);

		if (!noRedraw) {
			this.redraw();
		}

		return this;
	}
});


// @factory L.tileLayer.wms(baseUrl: String, options: TileLayer.WMS options)
// Instantiates a WMS tile layer object given a base URL of the WMS service and a WMS parameters/options object.
function tileLayerWMS(url, options) {
	return new TileLayerWMS(url, options);
}

TileLayer.WMS = TileLayerWMS;
tileLayer.wms = tileLayerWMS;

/*
 * @class Renderer
 * @inherits Layer
 * @aka L.Renderer
 *
 * Base class for vector renderer implementations (`SVG`, `Canvas`). Handles the
 * DOM container of the renderer, its bounds, and its zoom animation.
 *
 * A `Renderer` works as an implicit layer group for all `Path`s - the renderer
 * itself can be added or removed to the map. All paths use a renderer, which can
 * be implicit (the map will decide the type of renderer and use it automatically)
 * or explicit (using the [`renderer`](#path-renderer) option of the path).
 *
 * Do not use this class directly, use `SVG` and `Canvas` instead.
 *
 * @event update: Event
 * Fired when the renderer updates its bounds, center and zoom, for example when
 * its map has moved
 */

var Renderer = Layer.extend({

	// @section
	// @aka Renderer options
	options: {
		// @option padding: Number = 0.1
		// How much to extend the clip area around the map view (relative to its size)
		// e.g. 0.1 would be 10% of map view in each direction
		padding: 0.1,

		// @option tolerance: Number = 0
		// How much to extend click tolerance round a path/object on the map
		tolerance : 0
	},

	initialize: function (options) {
		setOptions(this, options);
		stamp(this);
		this._layers = this._layers || {};
	},

	onAdd: function () {
		if (!this._container) {
			this._initContainer(); // defined by renderer implementations

			if (this._zoomAnimated) {
				addClass(this._container, 'leaflet-zoom-animated');
			}
		}

		this.getPane().appendChild(this._container);
		this._update();
		this.on('update', this._updatePaths, this);
	},

	onRemove: function () {
		this.off('update', this._updatePaths, this);
		this._destroyContainer();
	},

	getEvents: function () {
		var events = {
			viewreset: this._reset,
			zoom: this._onZoom,
			moveend: this._update,
			zoomend: this._onZoomEnd
		};
		if (this._zoomAnimated) {
			events.zoomanim = this._onAnimZoom;
		}
		return events;
	},

	_onAnimZoom: function (ev) {
		this._updateTransform(ev.center, ev.zoom);
	},

	_onZoom: function () {
		this._updateTransform(this._map.getCenter(), this._map.getZoom());
	},

	_updateTransform: function (center, zoom) {
		var scale = this._map.getZoomScale(zoom, this._zoom),
		    position = getPosition(this._container),
		    viewHalf = this._map.getSize().multiplyBy(0.5 + this.options.padding),
		    currentCenterPoint = this._map.project(this._center, zoom),
		    destCenterPoint = this._map.project(center, zoom),
		    centerOffset = destCenterPoint.subtract(currentCenterPoint),

		    topLeftOffset = viewHalf.multiplyBy(-scale).add(position).add(viewHalf).subtract(centerOffset);

		if (any3d) {
			setTransform(this._container, topLeftOffset, scale);
		} else {
			setPosition(this._container, topLeftOffset);
		}
	},

	_reset: function () {
		this._update();
		this._updateTransform(this._center, this._zoom);

		for (var id in this._layers) {
			this._layers[id]._reset();
		}
	},

	_onZoomEnd: function () {
		for (var id in this._layers) {
			this._layers[id]._project();
		}
	},

	_updatePaths: function () {
		for (var id in this._layers) {
			this._layers[id]._update();
		}
	},

	_update: function () {
		// Update pixel bounds of renderer container (for positioning/sizing/clipping later)
		// Subclasses are responsible of firing the 'update' event.
		var p = this.options.padding,
		    size = this._map.getSize(),
		    min = this._map.containerPointToLayerPoint(size.multiplyBy(-p)).round();

		this._bounds = new Bounds(min, min.add(size.multiplyBy(1 + p * 2)).round());

		this._center = this._map.getCenter();
		this._zoom = this._map.getZoom();
	}
});

/*
 * @class Canvas
 * @inherits Renderer
 * @aka L.Canvas
 *
 * Allows vector layers to be displayed with [`<canvas>`](https://developer.mozilla.org/docs/Web/API/Canvas_API).
 * Inherits `Renderer`.
 *
 * Due to [technical limitations](http://caniuse.com/#search=canvas), Canvas is not
 * available in all web browsers, notably IE8, and overlapping geometries might
 * not display properly in some edge cases.
 *
 * @example
 *
 * Use Canvas by default for all paths in the map:
 *
 * ```js
 * var map = L.map('map', {
 * 	renderer: L.canvas()
 * });
 * ```
 *
 * Use a Canvas renderer with extra padding for specific vector geometries:
 *
 * ```js
 * var map = L.map('map');
 * var myRenderer = L.canvas({ padding: 0.5 });
 * var line = L.polyline( coordinates, { renderer: myRenderer } );
 * var circle = L.circle( center, { renderer: myRenderer } );
 * ```
 */

var Canvas = Renderer.extend({
	getEvents: function () {
		var events = Renderer.prototype.getEvents.call(this);
		events.viewprereset = this._onViewPreReset;
		return events;
	},

	_onViewPreReset: function () {
		// Set a flag so that a viewprereset+moveend+viewreset only updates&redraws once
		this._postponeUpdatePaths = true;
	},

	onAdd: function () {
		Renderer.prototype.onAdd.call(this);

		// Redraw vectors since canvas is cleared upon removal,
		// in case of removing the renderer itself from the map.
		this._draw();
	},

	_initContainer: function () {
		var container = this._container = document.createElement('canvas');

		on(container, 'mousemove', throttle(this._onMouseMove, 32, this), this);
		on(container, 'click dblclick mousedown mouseup contextmenu', this._onClick, this);
		on(container, 'mouseout', this._handleMouseOut, this);

		this._ctx = container.getContext('2d');
	},

	_destroyContainer: function () {
		cancelAnimFrame(this._redrawRequest);
		delete this._ctx;
		remove(this._container);
		off(this._container);
		delete this._container;
	},

	_updatePaths: function () {
		if (this._postponeUpdatePaths) { return; }

		var layer;
		this._redrawBounds = null;
		for (var id in this._layers) {
			layer = this._layers[id];
			layer._update();
		}
		this._redraw();
	},

	_update: function () {
		if (this._map._animatingZoom && this._bounds) { return; }

		this._drawnLayers = {};

		Renderer.prototype._update.call(this);

		var b = this._bounds,
		    container = this._container,
		    size = b.getSize(),
		    m = retina ? 2 : 1;

		setPosition(container, b.min);

		// set canvas size (also clearing it); use double size on retina
		container.width = m * size.x;
		container.height = m * size.y;
		container.style.width = size.x + 'px';
		container.style.height = size.y + 'px';

		if (retina) {
			this._ctx.scale(2, 2);
		}

		// translate so we use the same path coordinates after canvas element moves
		this._ctx.translate(-b.min.x, -b.min.y);

		// Tell paths to redraw themselves
		this.fire('update');
	},

	_reset: function () {
		Renderer.prototype._reset.call(this);

		if (this._postponeUpdatePaths) {
			this._postponeUpdatePaths = false;
			this._updatePaths();
		}
	},

	_initPath: function (layer) {
		this._updateDashArray(layer);
		this._layers[stamp(layer)] = layer;

		var order = layer._order = {
			layer: layer,
			prev: this._drawLast,
			next: null
		};
		if (this._drawLast) { this._drawLast.next = order; }
		this._drawLast = order;
		this._drawFirst = this._drawFirst || this._drawLast;
	},

	_addPath: function (layer) {
		this._requestRedraw(layer);
	},

	_removePath: function (layer) {
		var order = layer._order;
		var next = order.next;
		var prev = order.prev;

		if (next) {
			next.prev = prev;
		} else {
			this._drawLast = prev;
		}
		if (prev) {
			prev.next = next;
		} else {
			this._drawFirst = next;
		}

		delete this._drawnLayers[layer._leaflet_id];

		delete layer._order;

		delete this._layers[stamp(layer)];

		this._requestRedraw(layer);
	},

	_updatePath: function (layer) {
		// Redraw the union of the layer's old pixel
		// bounds and the new pixel bounds.
		this._extendRedrawBounds(layer);
		layer._project();
		layer._update();
		// The redraw will extend the redraw bounds
		// with the new pixel bounds.
		this._requestRedraw(layer);
	},

	_updateStyle: function (layer) {
		this._updateDashArray(layer);
		this._requestRedraw(layer);
	},

	_updateDashArray: function (layer) {
		if (typeof layer.options.dashArray === 'string') {
			var parts = layer.options.dashArray.split(/[, ]+/),
			    dashArray = [],
			    i;
			for (i = 0; i < parts.length; i++) {
				dashArray.push(Number(parts[i]));
			}
			layer.options._dashArray = dashArray;
		} else {
			layer.options._dashArray = layer.options.dashArray;
		}
	},

	_requestRedraw: function (layer) {
		if (!this._map) { return; }

		this._extendRedrawBounds(layer);
		this._redrawRequest = this._redrawRequest || requestAnimFrame(this._redraw, this);
	},

	_extendRedrawBounds: function (layer) {
		if (layer._pxBounds) {
			var padding = (layer.options.weight || 0) + 1;
			this._redrawBounds = this._redrawBounds || new Bounds();
			this._redrawBounds.extend(layer._pxBounds.min.subtract([padding, padding]));
			this._redrawBounds.extend(layer._pxBounds.max.add([padding, padding]));
		}
	},

	_redraw: function () {
		this._redrawRequest = null;

		if (this._redrawBounds) {
			this._redrawBounds.min._floor();
			this._redrawBounds.max._ceil();
		}

		this._clear(); // clear layers in redraw bounds
		this._draw(); // draw layers

		this._redrawBounds = null;
	},

	_clear: function () {
		var bounds = this._redrawBounds;
		if (bounds) {
			var size = bounds.getSize();
			this._ctx.clearRect(bounds.min.x, bounds.min.y, size.x, size.y);
		} else {
			this._ctx.clearRect(0, 0, this._container.width, this._container.height);
		}
	},

	_draw: function () {
		var layer, bounds = this._redrawBounds;
		this._ctx.save();
		if (bounds) {
			var size = bounds.getSize();
			this._ctx.beginPath();
			this._ctx.rect(bounds.min.x, bounds.min.y, size.x, size.y);
			this._ctx.clip();
		}

		this._drawing = true;

		for (var order = this._drawFirst; order; order = order.next) {
			layer = order.layer;
			if (!bounds || (layer._pxBounds && layer._pxBounds.intersects(bounds))) {
				layer._updatePath();
			}
		}

		this._drawing = false;

		this._ctx.restore();  // Restore state before clipping.
	},

	_updatePoly: function (layer, closed) {
		if (!this._drawing) { return; }

		var i, j, len2, p,
		    parts = layer._parts,
		    len = parts.length,
		    ctx = this._ctx;

		if (!len) { return; }

		this._drawnLayers[layer._leaflet_id] = layer;

		ctx.beginPath();

		for (i = 0; i < len; i++) {
			for (j = 0, len2 = parts[i].length; j < len2; j++) {
				p = parts[i][j];
				ctx[j ? 'lineTo' : 'moveTo'](p.x, p.y);
			}
			if (closed) {
				ctx.closePath();
			}
		}

		this._fillStroke(ctx, layer);

		// TODO optimization: 1 fill/stroke for all features with equal style instead of 1 for each feature
	},

	_updateCircle: function (layer) {

		if (!this._drawing || layer._empty()) { return; }

		var p = layer._point,
		    ctx = this._ctx,
		    r = Math.max(Math.round(layer._radius), 1),
		    s = (Math.max(Math.round(layer._radiusY), 1) || r) / r;

		this._drawnLayers[layer._leaflet_id] = layer;

		if (s !== 1) {
			ctx.save();
			ctx.scale(1, s);
		}

		ctx.beginPath();
		ctx.arc(p.x, p.y / s, r, 0, Math.PI * 2, false);

		if (s !== 1) {
			ctx.restore();
		}

		this._fillStroke(ctx, layer);
	},

	_fillStroke: function (ctx, layer) {
		var options = layer.options;

		if (options.fill) {
			ctx.globalAlpha = options.fillOpacity;
			ctx.fillStyle = options.fillColor || options.color;
			ctx.fill(options.fillRule || 'evenodd');
		}

		if (options.stroke && options.weight !== 0) {
			if (ctx.setLineDash) {
				ctx.setLineDash(layer.options && layer.options._dashArray || []);
			}
			ctx.globalAlpha = options.opacity;
			ctx.lineWidth = options.weight;
			ctx.strokeStyle = options.color;
			ctx.lineCap = options.lineCap;
			ctx.lineJoin = options.lineJoin;
			ctx.stroke();
		}
	},

	// Canvas obviously doesn't have mouse events for individual drawn objects,
	// so we emulate that by calculating what's under the mouse on mousemove/click manually

	_onClick: function (e) {
		var point = this._map.mouseEventToLayerPoint(e), layer, clickedLayer;

		for (var order = this._drawFirst; order; order = order.next) {
			layer = order.layer;
			if (layer.options.interactive && layer._containsPoint(point) && !this._map._draggableMoved(layer)) {
				clickedLayer = layer;
			}
		}
		if (clickedLayer)  {
			fakeStop(e);
			this._fireEvent([clickedLayer], e);
		}
	},

	_onMouseMove: function (e) {
		if (!this._map || this._map.dragging.moving() || this._map._animatingZoom) { return; }

		var point = this._map.mouseEventToLayerPoint(e);
		this._handleMouseHover(e, point);
	},


	_handleMouseOut: function (e) {
		var layer = this._hoveredLayer;
		if (layer) {
			// if we're leaving the layer, fire mouseout
			removeClass(this._container, 'leaflet-interactive');
			this._fireEvent([layer], e, 'mouseout');
			this._hoveredLayer = null;
		}
	},

	_handleMouseHover: function (e, point) {
		var layer, candidateHoveredLayer;

		for (var order = this._drawFirst; order; order = order.next) {
			layer = order.layer;
			if (layer.options.interactive && layer._containsPoint(point)) {
				candidateHoveredLayer = layer;
			}
		}

		if (candidateHoveredLayer !== this._hoveredLayer) {
			this._handleMouseOut(e);

			if (candidateHoveredLayer) {
				addClass(this._container, 'leaflet-interactive'); // change cursor
				this._fireEvent([candidateHoveredLayer], e, 'mouseover');
				this._hoveredLayer = candidateHoveredLayer;
			}
		}

		if (this._hoveredLayer) {
			this._fireEvent([this._hoveredLayer], e);
		}
	},

	_fireEvent: function (layers, e, type) {
		this._map._fireDOMEvent(e, type || e.type, layers);
	},

	_bringToFront: function (layer) {
		var order = layer._order;
		var next = order.next;
		var prev = order.prev;

		if (next) {
			next.prev = prev;
		} else {
			// Already last
			return;
		}
		if (prev) {
			prev.next = next;
		} else if (next) {
			// Update first entry unless this is the
			// single entry
			this._drawFirst = next;
		}

		order.prev = this._drawLast;
		this._drawLast.next = order;

		order.next = null;
		this._drawLast = order;

		this._requestRedraw(layer);
	},

	_bringToBack: function (layer) {
		var order = layer._order;
		var next = order.next;
		var prev = order.prev;

		if (prev) {
			prev.next = next;
		} else {
			// Already first
			return;
		}
		if (next) {
			next.prev = prev;
		} else if (prev) {
			// Update last entry unless this is the
			// single entry
			this._drawLast = prev;
		}

		order.prev = null;

		order.next = this._drawFirst;
		this._drawFirst.prev = order;
		this._drawFirst = order;

		this._requestRedraw(layer);
	}
});

// @factory L.canvas(options?: Renderer options)
// Creates a Canvas renderer with the given options.
function canvas$1(options) {
	return canvas ? new Canvas(options) : null;
}

/*
 * Thanks to Dmitry Baranovsky and his Raphael library for inspiration!
 */


var vmlCreate = (function () {
	try {
		document.namespaces.add('lvml', 'urn:schemas-microsoft-com:vml');
		return function (name) {
			return document.createElement('<lvml:' + name + ' class="lvml">');
		};
	} catch (e) {
		return function (name) {
			return document.createElement('<' + name + ' xmlns="urn:schemas-microsoft.com:vml" class="lvml">');
		};
	}
})();


/*
 * @class SVG
 *
 * Although SVG is not available on IE7 and IE8, these browsers support [VML](https://en.wikipedia.org/wiki/Vector_Markup_Language), and the SVG renderer will fall back to VML in this case.
 *
 * VML was deprecated in 2012, which means VML functionality exists only for backwards compatibility
 * with old versions of Internet Explorer.
 */

// mixin to redefine some SVG methods to handle VML syntax which is similar but with some differences
var vmlMixin = {

	_initContainer: function () {
		this._container = create$1('div', 'leaflet-vml-container');
	},

	_update: function () {
		if (this._map._animatingZoom) { return; }
		Renderer.prototype._update.call(this);
		this.fire('update');
	},

	_initPath: function (layer) {
		var container = layer._container = vmlCreate('shape');

		addClass(container, 'leaflet-vml-shape ' + (this.options.className || ''));

		container.coordsize = '1 1';

		layer._path = vmlCreate('path');
		container.appendChild(layer._path);

		this._updateStyle(layer);
		this._layers[stamp(layer)] = layer;
	},

	_addPath: function (layer) {
		var container = layer._container;
		this._container.appendChild(container);

		if (layer.options.interactive) {
			layer.addInteractiveTarget(container);
		}
	},

	_removePath: function (layer) {
		var container = layer._container;
		remove(container);
		layer.removeInteractiveTarget(container);
		delete this._layers[stamp(layer)];
	},

	_updateStyle: function (layer) {
		var stroke = layer._stroke,
		    fill = layer._fill,
		    options = layer.options,
		    container = layer._container;

		container.stroked = !!options.stroke;
		container.filled = !!options.fill;

		if (options.stroke) {
			if (!stroke) {
				stroke = layer._stroke = vmlCreate('stroke');
			}
			container.appendChild(stroke);
			stroke.weight = options.weight + 'px';
			stroke.color = options.color;
			stroke.opacity = options.opacity;

			if (options.dashArray) {
				stroke.dashStyle = isArray(options.dashArray) ?
				    options.dashArray.join(' ') :
				    options.dashArray.replace(/( *, *)/g, ' ');
			} else {
				stroke.dashStyle = '';
			}
			stroke.endcap = options.lineCap.replace('butt', 'flat');
			stroke.joinstyle = options.lineJoin;

		} else if (stroke) {
			container.removeChild(stroke);
			layer._stroke = null;
		}

		if (options.fill) {
			if (!fill) {
				fill = layer._fill = vmlCreate('fill');
			}
			container.appendChild(fill);
			fill.color = options.fillColor || options.color;
			fill.opacity = options.fillOpacity;

		} else if (fill) {
			container.removeChild(fill);
			layer._fill = null;
		}
	},

	_updateCircle: function (layer) {
		var p = layer._point.round(),
		    r = Math.round(layer._radius),
		    r2 = Math.round(layer._radiusY || r);

		this._setPath(layer, layer._empty() ? 'M0 0' :
			'AL ' + p.x + ',' + p.y + ' ' + r + ',' + r2 + ' 0,' + (65535 * 360));
	},

	_setPath: function (layer, path) {
		layer._path.v = path;
	},

	_bringToFront: function (layer) {
		toFront(layer._container);
	},

	_bringToBack: function (layer) {
		toBack(layer._container);
	}
};

var create$2 = vml ? vmlCreate : svgCreate;

/*
 * @class SVG
 * @inherits Renderer
 * @aka L.SVG
 *
 * Allows vector layers to be displayed with [SVG](https://developer.mozilla.org/docs/Web/SVG).
 * Inherits `Renderer`.
 *
 * Due to [technical limitations](http://caniuse.com/#search=svg), SVG is not
 * available in all web browsers, notably Android 2.x and 3.x.
 *
 * Although SVG is not available on IE7 and IE8, these browsers support
 * [VML](https://en.wikipedia.org/wiki/Vector_Markup_Language)
 * (a now deprecated technology), and the SVG renderer will fall back to VML in
 * this case.
 *
 * @example
 *
 * Use SVG by default for all paths in the map:
 *
 * ```js
 * var map = L.map('map', {
 * 	renderer: L.svg()
 * });
 * ```
 *
 * Use a SVG renderer with extra padding for specific vector geometries:
 *
 * ```js
 * var map = L.map('map');
 * var myRenderer = L.svg({ padding: 0.5 });
 * var line = L.polyline( coordinates, { renderer: myRenderer } );
 * var circle = L.circle( center, { renderer: myRenderer } );
 * ```
 */

var SVG = Renderer.extend({

	getEvents: function () {
		var events = Renderer.prototype.getEvents.call(this);
		events.zoomstart = this._onZoomStart;
		return events;
	},

	_initContainer: function () {
		this._container = create$2('svg');

		// makes it possible to click through svg root; we'll reset it back in individual paths
		this._container.setAttribute('pointer-events', 'none');

		this._rootGroup = create$2('g');
		this._container.appendChild(this._rootGroup);
	},

	_destroyContainer: function () {
		remove(this._container);
		off(this._container);
		delete this._container;
		delete this._rootGroup;
		delete this._svgSize;
	},

	_onZoomStart: function () {
		// Drag-then-pinch interactions might mess up the center and zoom.
		// In this case, the easiest way to prevent this is re-do the renderer
		//   bounds and padding when the zooming starts.
		this._update();
	},

	_update: function () {
		if (this._map._animatingZoom && this._bounds) { return; }

		Renderer.prototype._update.call(this);

		var b = this._bounds,
		    size = b.getSize(),
		    container = this._container;

		// set size of svg-container if changed
		if (!this._svgSize || !this._svgSize.equals(size)) {
			this._svgSize = size;
			container.setAttribute('width', size.x);
			container.setAttribute('height', size.y);
		}

		// movement: update container viewBox so that we don't have to change coordinates of individual layers
		setPosition(container, b.min);
		container.setAttribute('viewBox', [b.min.x, b.min.y, size.x, size.y].join(' '));

		this.fire('update');
	},

	// methods below are called by vector layers implementations

	_initPath: function (layer) {
		var path = layer._path = create$2('path');

		// @namespace Path
		// @option className: String = null
		// Custom class name set on an element. Only for SVG renderer.
		if (layer.options.className) {
			addClass(path, layer.options.className);
		}

		if (layer.options.interactive) {
			addClass(path, 'leaflet-interactive');
		}

		this._updateStyle(layer);
		this._layers[stamp(layer)] = layer;
	},

	_addPath: function (layer) {
		if (!this._rootGroup) { this._initContainer(); }
		this._rootGroup.appendChild(layer._path);
		layer.addInteractiveTarget(layer._path);
	},

	_removePath: function (layer) {
		remove(layer._path);
		layer.removeInteractiveTarget(layer._path);
		delete this._layers[stamp(layer)];
	},

	_updatePath: function (layer) {
		layer._project();
		layer._update();
	},

	_updateStyle: function (layer) {
		var path = layer._path,
		    options = layer.options;

		if (!path) { return; }

		if (options.stroke) {
			path.setAttribute('stroke', options.color);
			path.setAttribute('stroke-opacity', options.opacity);
			path.setAttribute('stroke-width', options.weight);
			path.setAttribute('stroke-linecap', options.lineCap);
			path.setAttribute('stroke-linejoin', options.lineJoin);

			if (options.dashArray) {
				path.setAttribute('stroke-dasharray', options.dashArray);
			} else {
				path.removeAttribute('stroke-dasharray');
			}

			if (options.dashOffset) {
				path.setAttribute('stroke-dashoffset', options.dashOffset);
			} else {
				path.removeAttribute('stroke-dashoffset');
			}
		} else {
			path.setAttribute('stroke', 'none');
		}

		if (options.fill) {
			path.setAttribute('fill', options.fillColor || options.color);
			path.setAttribute('fill-opacity', options.fillOpacity);
			path.setAttribute('fill-rule', options.fillRule || 'evenodd');
		} else {
			path.setAttribute('fill', 'none');
		}
	},

	_updatePoly: function (layer, closed) {
		this._setPath(layer, pointsToPath(layer._parts, closed));
	},

	_updateCircle: function (layer) {
		var p = layer._point,
		    r = Math.max(Math.round(layer._radius), 1),
		    r2 = Math.max(Math.round(layer._radiusY), 1) || r,
		    arc = 'a' + r + ',' + r2 + ' 0 1,0 ';

		// drawing a circle with two half-arcs
		var d = layer._empty() ? 'M0 0' :
			'M' + (p.x - r) + ',' + p.y +
			arc + (r * 2) + ',0 ' +
			arc + (-r * 2) + ',0 ';

		this._setPath(layer, d);
	},

	_setPath: function (layer, path) {
		layer._path.setAttribute('d', path);
	},

	// SVG does not have the concept of zIndex so we resort to changing the DOM order of elements
	_bringToFront: function (layer) {
		toFront(layer._path);
	},

	_bringToBack: function (layer) {
		toBack(layer._path);
	}
});

if (vml) {
	SVG.include(vmlMixin);
}

// @namespace SVG
// @factory L.svg(options?: Renderer options)
// Creates a SVG renderer with the given options.
function svg$1(options) {
	return svg || vml ? new SVG(options) : null;
}

Map.include({
	// @namespace Map; @method getRenderer(layer: Path): Renderer
	// Returns the instance of `Renderer` that should be used to render the given
	// `Path`. It will ensure that the `renderer` options of the map and paths
	// are respected, and that the renderers do exist on the map.
	getRenderer: function (layer) {
		// @namespace Path; @option renderer: Renderer
		// Use this specific instance of `Renderer` for this path. Takes
		// precedence over the map's [default renderer](#map-renderer).
		var renderer = layer.options.renderer || this._getPaneRenderer(layer.options.pane) || this.options.renderer || this._renderer;

		if (!renderer) {
			renderer = this._renderer = this._createRenderer();
		}

		if (!this.hasLayer(renderer)) {
			this.addLayer(renderer);
		}
		return renderer;
	},

	_getPaneRenderer: function (name) {
		if (name === 'overlayPane' || name === undefined) {
			return false;
		}

		var renderer = this._paneRenderers[name];
		if (renderer === undefined) {
			renderer = this._createRenderer({pane: name});
			this._paneRenderers[name] = renderer;
		}
		return renderer;
	},

	_createRenderer: function (options) {
		// @namespace Map; @option preferCanvas: Boolean = false
		// Whether `Path`s should be rendered on a `Canvas` renderer.
		// By default, all `Path`s are rendered in a `SVG` renderer.
		return (this.options.preferCanvas && canvas$1(options)) || svg$1(options);
	}
});

/*
 * L.Rectangle extends Polygon and creates a rectangle when passed a LatLngBounds object.
 */

/*
 * @class Rectangle
 * @aka L.Rectangle
 * @inherits Polygon
 *
 * A class for drawing rectangle overlays on a map. Extends `Polygon`.
 *
 * @example
 *
 * ```js
 * // define rectangle geographical bounds
 * var bounds = [[54.559322, -5.767822], [56.1210604, -3.021240]];
 *
 * // create an orange rectangle
 * L.rectangle(bounds, {color: "#ff7800", weight: 1}).addTo(map);
 *
 * // zoom the map to the rectangle bounds
 * map.fitBounds(bounds);
 * ```
 *
 */


var Rectangle = Polygon.extend({
	initialize: function (latLngBounds, options) {
		Polygon.prototype.initialize.call(this, this._boundsToLatLngs(latLngBounds), options);
	},

	// @method setBounds(latLngBounds: LatLngBounds): this
	// Redraws the rectangle with the passed bounds.
	setBounds: function (latLngBounds) {
		return this.setLatLngs(this._boundsToLatLngs(latLngBounds));
	},

	_boundsToLatLngs: function (latLngBounds) {
		latLngBounds = toLatLngBounds(latLngBounds);
		return [
			latLngBounds.getSouthWest(),
			latLngBounds.getNorthWest(),
			latLngBounds.getNorthEast(),
			latLngBounds.getSouthEast()
		];
	}
});


// @factory L.rectangle(latLngBounds: LatLngBounds, options?: Polyline options)
function rectangle(latLngBounds, options) {
	return new Rectangle(latLngBounds, options);
}

SVG.create = create$2;
SVG.pointsToPath = pointsToPath;

GeoJSON.geometryToLayer = geometryToLayer;
GeoJSON.coordsToLatLng = coordsToLatLng;
GeoJSON.coordsToLatLngs = coordsToLatLngs;
GeoJSON.latLngToCoords = latLngToCoords;
GeoJSON.latLngsToCoords = latLngsToCoords;
GeoJSON.getFeature = getFeature;
GeoJSON.asFeature = asFeature;

/*
 * L.Handler.BoxZoom is used to add shift-drag zoom interaction to the map
 * (zoom to a selected bounding box), enabled by default.
 */

// @namespace Map
// @section Interaction Options
Map.mergeOptions({
	// @option boxZoom: Boolean = true
	// Whether the map can be zoomed to a rectangular area specified by
	// dragging the mouse while pressing the shift key.
	boxZoom: true
});

var BoxZoom = Handler.extend({
	initialize: function (map) {
		this._map = map;
		this._container = map._container;
		this._pane = map._panes.overlayPane;
		this._resetStateTimeout = 0;
		map.on('unload', this._destroy, this);
	},

	addHooks: function () {
		on(this._container, 'mousedown', this._onMouseDown, this);
	},

	removeHooks: function () {
		off(this._container, 'mousedown', this._onMouseDown, this);
	},

	moved: function () {
		return this._moved;
	},

	_destroy: function () {
		remove(this._pane);
		delete this._pane;
	},

	_resetState: function () {
		this._resetStateTimeout = 0;
		this._moved = false;
	},

	_clearDeferredResetState: function () {
		if (this._resetStateTimeout !== 0) {
			clearTimeout(this._resetStateTimeout);
			this._resetStateTimeout = 0;
		}
	},

	_onMouseDown: function (e) {
		if (!e.shiftKey || ((e.which !== 1) && (e.button !== 1))) { return false; }

		// Clear the deferred resetState if it hasn't executed yet, otherwise it
		// will interrupt the interaction and orphan a box element in the container.
		this._clearDeferredResetState();
		this._resetState();

		disableTextSelection();
		disableImageDrag();

		this._startPoint = this._map.mouseEventToContainerPoint(e);

		on(document, {
			contextmenu: stop,
			mousemove: this._onMouseMove,
			mouseup: this._onMouseUp,
			keydown: this._onKeyDown
		}, this);
	},

	_onMouseMove: function (e) {
		if (!this._moved) {
			this._moved = true;

			this._box = create$1('div', 'leaflet-zoom-box', this._container);
			addClass(this._container, 'leaflet-crosshair');

			this._map.fire('boxzoomstart');
		}

		this._point = this._map.mouseEventToContainerPoint(e);

		var bounds = new Bounds(this._point, this._startPoint),
		    size = bounds.getSize();

		setPosition(this._box, bounds.min);

		this._box.style.width  = size.x + 'px';
		this._box.style.height = size.y + 'px';
	},

	_finish: function () {
		if (this._moved) {
			remove(this._box);
			removeClass(this._container, 'leaflet-crosshair');
		}

		enableTextSelection();
		enableImageDrag();

		off(document, {
			contextmenu: stop,
			mousemove: this._onMouseMove,
			mouseup: this._onMouseUp,
			keydown: this._onKeyDown
		}, this);
	},

	_onMouseUp: function (e) {
		if ((e.which !== 1) && (e.button !== 1)) { return; }

		this._finish();

		if (!this._moved) { return; }
		// Postpone to next JS tick so internal click event handling
		// still see it as "moved".
		this._clearDeferredResetState();
		this._resetStateTimeout = setTimeout(bind(this._resetState, this), 0);

		var bounds = new LatLngBounds(
		        this._map.containerPointToLatLng(this._startPoint),
		        this._map.containerPointToLatLng(this._point));

		this._map
			.fitBounds(bounds)
			.fire('boxzoomend', {boxZoomBounds: bounds});
	},

	_onKeyDown: function (e) {
		if (e.keyCode === 27) {
			this._finish();
		}
	}
});

// @section Handlers
// @property boxZoom: Handler
// Box (shift-drag with mouse) zoom handler.
Map.addInitHook('addHandler', 'boxZoom', BoxZoom);

/*
 * L.Handler.DoubleClickZoom is used to handle double-click zoom on the map, enabled by default.
 */

// @namespace Map
// @section Interaction Options

Map.mergeOptions({
	// @option doubleClickZoom: Boolean|String = true
	// Whether the map can be zoomed in by double clicking on it and
	// zoomed out by double clicking while holding shift. If passed
	// `'center'`, double-click zoom will zoom to the center of the
	//  view regardless of where the mouse was.
	doubleClickZoom: true
});

var DoubleClickZoom = Handler.extend({
	addHooks: function () {
		this._map.on('dblclick', this._onDoubleClick, this);
	},

	removeHooks: function () {
		this._map.off('dblclick', this._onDoubleClick, this);
	},

	_onDoubleClick: function (e) {
		var map = this._map,
		    oldZoom = map.getZoom(),
		    delta = map.options.zoomDelta,
		    zoom = e.originalEvent.shiftKey ? oldZoom - delta : oldZoom + delta;

		if (map.options.doubleClickZoom === 'center') {
			map.setZoom(zoom);
		} else {
			map.setZoomAround(e.containerPoint, zoom);
		}
	}
});

// @section Handlers
//
// Map properties include interaction handlers that allow you to control
// interaction behavior in runtime, enabling or disabling certain features such
// as dragging or touch zoom (see `Handler` methods). For example:
//
// ```js
// map.doubleClickZoom.disable();
// ```
//
// @property doubleClickZoom: Handler
// Double click zoom handler.
Map.addInitHook('addHandler', 'doubleClickZoom', DoubleClickZoom);

/*
 * L.Handler.MapDrag is used to make the map draggable (with panning inertia), enabled by default.
 */

// @namespace Map
// @section Interaction Options
Map.mergeOptions({
	// @option dragging: Boolean = true
	// Whether the map be draggable with mouse/touch or not.
	dragging: true,

	// @section Panning Inertia Options
	// @option inertia: Boolean = *
	// If enabled, panning of the map will have an inertia effect where
	// the map builds momentum while dragging and continues moving in
	// the same direction for some time. Feels especially nice on touch
	// devices. Enabled by default unless running on old Android devices.
	inertia: !android23,

	// @option inertiaDeceleration: Number = 3000
	// The rate with which the inertial movement slows down, in pixels/second².
	inertiaDeceleration: 3400, // px/s^2

	// @option inertiaMaxSpeed: Number = Infinity
	// Max speed of the inertial movement, in pixels/second.
	inertiaMaxSpeed: Infinity, // px/s

	// @option easeLinearity: Number = 0.2
	easeLinearity: 0.2,

	// TODO refactor, move to CRS
	// @option worldCopyJump: Boolean = false
	// With this option enabled, the map tracks when you pan to another "copy"
	// of the world and seamlessly jumps to the original one so that all overlays
	// like markers and vector layers are still visible.
	worldCopyJump: false,

	// @option maxBoundsViscosity: Number = 0.0
	// If `maxBounds` is set, this option will control how solid the bounds
	// are when dragging the map around. The default value of `0.0` allows the
	// user to drag outside the bounds at normal speed, higher values will
	// slow down map dragging outside bounds, and `1.0` makes the bounds fully
	// solid, preventing the user from dragging outside the bounds.
	maxBoundsViscosity: 0.0
});

var Drag = Handler.extend({
	addHooks: function () {
		if (!this._draggable) {
			var map = this._map;

			this._draggable = new Draggable(map._mapPane, map._container);

			this._draggable.on({
				dragstart: this._onDragStart,
				drag: this._onDrag,
				dragend: this._onDragEnd
			}, this);

			this._draggable.on('predrag', this._onPreDragLimit, this);
			if (map.options.worldCopyJump) {
				this._draggable.on('predrag', this._onPreDragWrap, this);
				map.on('zoomend', this._onZoomEnd, this);

				map.whenReady(this._onZoomEnd, this);
			}
		}
		addClass(this._map._container, 'leaflet-grab leaflet-touch-drag');
		this._draggable.enable();
		this._positions = [];
		this._times = [];
	},

	removeHooks: function () {
		removeClass(this._map._container, 'leaflet-grab');
		removeClass(this._map._container, 'leaflet-touch-drag');
		this._draggable.disable();
	},

	moved: function () {
		return this._draggable && this._draggable._moved;
	},

	moving: function () {
		return this._draggable && this._draggable._moving;
	},

	_onDragStart: function () {
		var map = this._map;

		map._stop();
		if (this._map.options.maxBounds && this._map.options.maxBoundsViscosity) {
			var bounds = toLatLngBounds(this._map.options.maxBounds);

			this._offsetLimit = toBounds(
				this._map.latLngToContainerPoint(bounds.getNorthWest()).multiplyBy(-1),
				this._map.latLngToContainerPoint(bounds.getSouthEast()).multiplyBy(-1)
					.add(this._map.getSize()));

			this._viscosity = Math.min(1.0, Math.max(0.0, this._map.options.maxBoundsViscosity));
		} else {
			this._offsetLimit = null;
		}

		map
		    .fire('movestart')
		    .fire('dragstart');

		if (map.options.inertia) {
			this._positions = [];
			this._times = [];
		}
	},

	_onDrag: function (e) {
		if (this._map.options.inertia) {
			var time = this._lastTime = +new Date(),
			    pos = this._lastPos = this._draggable._absPos || this._draggable._newPos;

			this._positions.push(pos);
			this._times.push(time);

			this._prunePositions(time);
		}

		this._map
		    .fire('move', e)
		    .fire('drag', e);
	},

	_prunePositions: function (time) {
		while (this._positions.length > 1 && time - this._times[0] > 50) {
			this._positions.shift();
			this._times.shift();
		}
	},

	_onZoomEnd: function () {
		var pxCenter = this._map.getSize().divideBy(2),
		    pxWorldCenter = this._map.latLngToLayerPoint([0, 0]);

		this._initialWorldOffset = pxWorldCenter.subtract(pxCenter).x;
		this._worldWidth = this._map.getPixelWorldBounds().getSize().x;
	},

	_viscousLimit: function (value, threshold) {
		return value - (value - threshold) * this._viscosity;
	},

	_onPreDragLimit: function () {
		if (!this._viscosity || !this._offsetLimit) { return; }

		var offset = this._draggable._newPos.subtract(this._draggable._startPos);

		var limit = this._offsetLimit;
		if (offset.x < limit.min.x) { offset.x = this._viscousLimit(offset.x, limit.min.x); }
		if (offset.y < limit.min.y) { offset.y = this._viscousLimit(offset.y, limit.min.y); }
		if (offset.x > limit.max.x) { offset.x = this._viscousLimit(offset.x, limit.max.x); }
		if (offset.y > limit.max.y) { offset.y = this._viscousLimit(offset.y, limit.max.y); }

		this._draggable._newPos = this._draggable._startPos.add(offset);
	},

	_onPreDragWrap: function () {
		// TODO refactor to be able to adjust map pane position after zoom
		var worldWidth = this._worldWidth,
		    halfWidth = Math.round(worldWidth / 2),
		    dx = this._initialWorldOffset,
		    x = this._draggable._newPos.x,
		    newX1 = (x - halfWidth + dx) % worldWidth + halfWidth - dx,
		    newX2 = (x + halfWidth + dx) % worldWidth - halfWidth - dx,
		    newX = Math.abs(newX1 + dx) < Math.abs(newX2 + dx) ? newX1 : newX2;

		this._draggable._absPos = this._draggable._newPos.clone();
		this._draggable._newPos.x = newX;
	},

	_onDragEnd: function (e) {
		var map = this._map,
		    options = map.options,

		    noInertia = !options.inertia || this._times.length < 2;

		map.fire('dragend', e);

		if (noInertia) {
			map.fire('moveend');

		} else {
			this._prunePositions(+new Date());

			var direction = this._lastPos.subtract(this._positions[0]),
			    duration = (this._lastTime - this._times[0]) / 1000,
			    ease = options.easeLinearity,

			    speedVector = direction.multiplyBy(ease / duration),
			    speed = speedVector.distanceTo([0, 0]),

			    limitedSpeed = Math.min(options.inertiaMaxSpeed, speed),
			    limitedSpeedVector = speedVector.multiplyBy(limitedSpeed / speed),

			    decelerationDuration = limitedSpeed / (options.inertiaDeceleration * ease),
			    offset = limitedSpeedVector.multiplyBy(-decelerationDuration / 2).round();

			if (!offset.x && !offset.y) {
				map.fire('moveend');

			} else {
				offset = map._limitOffset(offset, map.options.maxBounds);

				requestAnimFrame(function () {
					map.panBy(offset, {
						duration: decelerationDuration,
						easeLinearity: ease,
						noMoveStart: true,
						animate: true
					});
				});
			}
		}
	}
});

// @section Handlers
// @property dragging: Handler
// Map dragging handler (by both mouse and touch).
Map.addInitHook('addHandler', 'dragging', Drag);

/*
 * L.Map.Keyboard is handling keyboard interaction with the map, enabled by default.
 */

// @namespace Map
// @section Keyboard Navigation Options
Map.mergeOptions({
	// @option keyboard: Boolean = true
	// Makes the map focusable and allows users to navigate the map with keyboard
	// arrows and `+`/`-` keys.
	keyboard: true,

	// @option keyboardPanDelta: Number = 80
	// Amount of pixels to pan when pressing an arrow key.
	keyboardPanDelta: 80
});

var Keyboard = Handler.extend({

	keyCodes: {
		left:    [37],
		right:   [39],
		down:    [40],
		up:      [38],
		zoomIn:  [187, 107, 61, 171],
		zoomOut: [189, 109, 54, 173]
	},

	initialize: function (map) {
		this._map = map;

		this._setPanDelta(map.options.keyboardPanDelta);
		this._setZoomDelta(map.options.zoomDelta);
	},

	addHooks: function () {
		var container = this._map._container;

		// make the container focusable by tabbing
		if (container.tabIndex <= 0) {
			container.tabIndex = '0';
		}

		on(container, {
			focus: this._onFocus,
			blur: this._onBlur,
			mousedown: this._onMouseDown
		}, this);

		this._map.on({
			focus: this._addHooks,
			blur: this._removeHooks
		}, this);
	},

	removeHooks: function () {
		this._removeHooks();

		off(this._map._container, {
			focus: this._onFocus,
			blur: this._onBlur,
			mousedown: this._onMouseDown
		}, this);

		this._map.off({
			focus: this._addHooks,
			blur: this._removeHooks
		}, this);
	},

	_onMouseDown: function () {
		if (this._focused) { return; }

		var body = document.body,
		    docEl = document.documentElement,
		    top = body.scrollTop || docEl.scrollTop,
		    left = body.scrollLeft || docEl.scrollLeft;

		this._map._container.focus();

		window.scrollTo(left, top);
	},

	_onFocus: function () {
		this._focused = true;
		this._map.fire('focus');
	},

	_onBlur: function () {
		this._focused = false;
		this._map.fire('blur');
	},

	_setPanDelta: function (panDelta) {
		var keys = this._panKeys = {},
		    codes = this.keyCodes,
		    i, len;

		for (i = 0, len = codes.left.length; i < len; i++) {
			keys[codes.left[i]] = [-1 * panDelta, 0];
		}
		for (i = 0, len = codes.right.length; i < len; i++) {
			keys[codes.right[i]] = [panDelta, 0];
		}
		for (i = 0, len = codes.down.length; i < len; i++) {
			keys[codes.down[i]] = [0, panDelta];
		}
		for (i = 0, len = codes.up.length; i < len; i++) {
			keys[codes.up[i]] = [0, -1 * panDelta];
		}
	},

	_setZoomDelta: function (zoomDelta) {
		var keys = this._zoomKeys = {},
		    codes = this.keyCodes,
		    i, len;

		for (i = 0, len = codes.zoomIn.length; i < len; i++) {
			keys[codes.zoomIn[i]] = zoomDelta;
		}
		for (i = 0, len = codes.zoomOut.length; i < len; i++) {
			keys[codes.zoomOut[i]] = -zoomDelta;
		}
	},

	_addHooks: function () {
		on(document, 'keydown', this._onKeyDown, this);
	},

	_removeHooks: function () {
		off(document, 'keydown', this._onKeyDown, this);
	},

	_onKeyDown: function (e) {
		if (e.altKey || e.ctrlKey || e.metaKey) { return; }

		var key = e.keyCode,
		    map = this._map,
		    offset;

		if (key in this._panKeys) {
			if (!map._panAnim || !map._panAnim._inProgress) {
				offset = this._panKeys[key];
				if (e.shiftKey) {
					offset = toPoint(offset).multiplyBy(3);
				}

				map.panBy(offset);

				if (map.options.maxBounds) {
					map.panInsideBounds(map.options.maxBounds);
				}
			}
		} else if (key in this._zoomKeys) {
			map.setZoom(map.getZoom() + (e.shiftKey ? 3 : 1) * this._zoomKeys[key]);

		} else if (key === 27 && map._popup && map._popup.options.closeOnEscapeKey) {
			map.closePopup();

		} else {
			return;
		}

		stop(e);
	}
});

// @section Handlers
// @section Handlers
// @property keyboard: Handler
// Keyboard navigation handler.
Map.addInitHook('addHandler', 'keyboard', Keyboard);

/*
 * L.Handler.ScrollWheelZoom is used by L.Map to enable mouse scroll wheel zoom on the map.
 */

// @namespace Map
// @section Interaction Options
Map.mergeOptions({
	// @section Mousewheel options
	// @option scrollWheelZoom: Boolean|String = true
	// Whether the map can be zoomed by using the mouse wheel. If passed `'center'`,
	// it will zoom to the center of the view regardless of where the mouse was.
	scrollWheelZoom: true,

	// @option wheelDebounceTime: Number = 40
	// Limits the rate at which a wheel can fire (in milliseconds). By default
	// user can't zoom via wheel more often than once per 40 ms.
	wheelDebounceTime: 40,

	// @option wheelPxPerZoomLevel: Number = 60
	// How many scroll pixels (as reported by [L.DomEvent.getWheelDelta](#domevent-getwheeldelta))
	// mean a change of one full zoom level. Smaller values will make wheel-zooming
	// faster (and vice versa).
	wheelPxPerZoomLevel: 60
});

var ScrollWheelZoom = Handler.extend({
	addHooks: function () {
		on(this._map._container, 'mousewheel', this._onWheelScroll, this);

		this._delta = 0;
	},

	removeHooks: function () {
		off(this._map._container, 'mousewheel', this._onWheelScroll, this);
	},

	_onWheelScroll: function (e) {
		var delta = getWheelDelta(e);

		var debounce = this._map.options.wheelDebounceTime;

		this._delta += delta;
		this._lastMousePos = this._map.mouseEventToContainerPoint(e);

		if (!this._startTime) {
			this._startTime = +new Date();
		}

		var left = Math.max(debounce - (+new Date() - this._startTime), 0);

		clearTimeout(this._timer);
		this._timer = setTimeout(bind(this._performZoom, this), left);

		stop(e);
	},

	_performZoom: function () {
		var map = this._map,
		    zoom = map.getZoom(),
		    snap = this._map.options.zoomSnap || 0;

		map._stop(); // stop panning and fly animations if any

		// map the delta with a sigmoid function to -4..4 range leaning on -1..1
		var d2 = this._delta / (this._map.options.wheelPxPerZoomLevel * 4),
		    d3 = 4 * Math.log(2 / (1 + Math.exp(-Math.abs(d2)))) / Math.LN2,
		    d4 = snap ? Math.ceil(d3 / snap) * snap : d3,
		    delta = map._limitZoom(zoom + (this._delta > 0 ? d4 : -d4)) - zoom;

		this._delta = 0;
		this._startTime = null;

		if (!delta) { return; }

		if (map.options.scrollWheelZoom === 'center') {
			map.setZoom(zoom + delta);
		} else {
			map.setZoomAround(this._lastMousePos, zoom + delta);
		}
	}
});

// @section Handlers
// @property scrollWheelZoom: Handler
// Scroll wheel zoom handler.
Map.addInitHook('addHandler', 'scrollWheelZoom', ScrollWheelZoom);

/*
 * L.Map.Tap is used to enable mobile hacks like quick taps and long hold.
 */

// @namespace Map
// @section Interaction Options
Map.mergeOptions({
	// @section Touch interaction options
	// @option tap: Boolean = true
	// Enables mobile hacks for supporting instant taps (fixing 200ms click
	// delay on iOS/Android) and touch holds (fired as `contextmenu` events).
	tap: true,

	// @option tapTolerance: Number = 15
	// The max number of pixels a user can shift his finger during touch
	// for it to be considered a valid tap.
	tapTolerance: 15
});

var Tap = Handler.extend({
	addHooks: function () {
		on(this._map._container, 'touchstart', this._onDown, this);
	},

	removeHooks: function () {
		off(this._map._container, 'touchstart', this._onDown, this);
	},

	_onDown: function (e) {
		if (!e.touches) { return; }

		preventDefault(e);

		this._fireClick = true;

		// don't simulate click or track longpress if more than 1 touch
		if (e.touches.length > 1) {
			this._fireClick = false;
			clearTimeout(this._holdTimeout);
			return;
		}

		var first = e.touches[0],
		    el = first.target;

		this._startPos = this._newPos = new Point(first.clientX, first.clientY);

		// if touching a link, highlight it
		if (el.tagName && el.tagName.toLowerCase() === 'a') {
			addClass(el, 'leaflet-active');
		}

		// simulate long hold but setting a timeout
		this._holdTimeout = setTimeout(bind(function () {
			if (this._isTapValid()) {
				this._fireClick = false;
				this._onUp();
				this._simulateEvent('contextmenu', first);
			}
		}, this), 1000);

		this._simulateEvent('mousedown', first);

		on(document, {
			touchmove: this._onMove,
			touchend: this._onUp
		}, this);
	},

	_onUp: function (e) {
		clearTimeout(this._holdTimeout);

		off(document, {
			touchmove: this._onMove,
			touchend: this._onUp
		}, this);

		if (this._fireClick && e && e.changedTouches) {

			var first = e.changedTouches[0],
			    el = first.target;

			if (el && el.tagName && el.tagName.toLowerCase() === 'a') {
				removeClass(el, 'leaflet-active');
			}

			this._simulateEvent('mouseup', first);

			// simulate click if the touch didn't move too much
			if (this._isTapValid()) {
				this._simulateEvent('click', first);
			}
		}
	},

	_isTapValid: function () {
		return this._newPos.distanceTo(this._startPos) <= this._map.options.tapTolerance;
	},

	_onMove: function (e) {
		var first = e.touches[0];
		this._newPos = new Point(first.clientX, first.clientY);
		this._simulateEvent('mousemove', first);
	},

	_simulateEvent: function (type, e) {
		var simulatedEvent = document.createEvent('MouseEvents');

		simulatedEvent._simulated = true;
		e.target._simulatedClick = true;

		simulatedEvent.initMouseEvent(
		        type, true, true, window, 1,
		        e.screenX, e.screenY,
		        e.clientX, e.clientY,
		        false, false, false, false, 0, null);

		e.target.dispatchEvent(simulatedEvent);
	}
});

// @section Handlers
// @property tap: Handler
// Mobile touch hacks (quick tap and touch hold) handler.
if (touch && !pointer) {
	Map.addInitHook('addHandler', 'tap', Tap);
}

/*
 * L.Handler.TouchZoom is used by L.Map to add pinch zoom on supported mobile browsers.
 */

// @namespace Map
// @section Interaction Options
Map.mergeOptions({
	// @section Touch interaction options
	// @option touchZoom: Boolean|String = *
	// Whether the map can be zoomed by touch-dragging with two fingers. If
	// passed `'center'`, it will zoom to the center of the view regardless of
	// where the touch events (fingers) were. Enabled for touch-capable web
	// browsers except for old Androids.
	touchZoom: touch && !android23,

	// @option bounceAtZoomLimits: Boolean = true
	// Set it to false if you don't want the map to zoom beyond min/max zoom
	// and then bounce back when pinch-zooming.
	bounceAtZoomLimits: true
});

var TouchZoom = Handler.extend({
	addHooks: function () {
		addClass(this._map._container, 'leaflet-touch-zoom');
		on(this._map._container, 'touchstart', this._onTouchStart, this);
	},

	removeHooks: function () {
		removeClass(this._map._container, 'leaflet-touch-zoom');
		off(this._map._container, 'touchstart', this._onTouchStart, this);
	},

	_onTouchStart: function (e) {
		var map = this._map;
		if (!e.touches || e.touches.length !== 2 || map._animatingZoom || this._zooming) { return; }

		var p1 = map.mouseEventToContainerPoint(e.touches[0]),
		    p2 = map.mouseEventToContainerPoint(e.touches[1]);

		this._centerPoint = map.getSize()._divideBy(2);
		this._startLatLng = map.containerPointToLatLng(this._centerPoint);
		if (map.options.touchZoom !== 'center') {
			this._pinchStartLatLng = map.containerPointToLatLng(p1.add(p2)._divideBy(2));
		}

		this._startDist = p1.distanceTo(p2);
		this._startZoom = map.getZoom();

		this._moved = false;
		this._zooming = true;

		map._stop();

		on(document, 'touchmove', this._onTouchMove, this);
		on(document, 'touchend', this._onTouchEnd, this);

		preventDefault(e);
	},

	_onTouchMove: function (e) {
		if (!e.touches || e.touches.length !== 2 || !this._zooming) { return; }

		var map = this._map,
		    p1 = map.mouseEventToContainerPoint(e.touches[0]),
		    p2 = map.mouseEventToContainerPoint(e.touches[1]),
		    scale = p1.distanceTo(p2) / this._startDist;

		this._zoom = map.getScaleZoom(scale, this._startZoom);

		if (!map.options.bounceAtZoomLimits && (
			(this._zoom < map.getMinZoom() && scale < 1) ||
			(this._zoom > map.getMaxZoom() && scale > 1))) {
			this._zoom = map._limitZoom(this._zoom);
		}

		if (map.options.touchZoom === 'center') {
			this._center = this._startLatLng;
			if (scale === 1) { return; }
		} else {
			// Get delta from pinch to center, so centerLatLng is delta applied to initial pinchLatLng
			var delta = p1._add(p2)._divideBy(2)._subtract(this._centerPoint);
			if (scale === 1 && delta.x === 0 && delta.y === 0) { return; }
			this._center = map.unproject(map.project(this._pinchStartLatLng, this._zoom).subtract(delta), this._zoom);
		}

		if (!this._moved) {
			map._moveStart(true, false);
			this._moved = true;
		}

		cancelAnimFrame(this._animRequest);

		var moveFn = bind(map._move, map, this._center, this._zoom, {pinch: true, round: false});
		this._animRequest = requestAnimFrame(moveFn, this, true);

		preventDefault(e);
	},

	_onTouchEnd: function () {
		if (!this._moved || !this._zooming) {
			this._zooming = false;
			return;
		}

		this._zooming = false;
		cancelAnimFrame(this._animRequest);

		off(document, 'touchmove', this._onTouchMove);
		off(document, 'touchend', this._onTouchEnd);

		// Pinch updates GridLayers' levels only when zoomSnap is off, so zoomSnap becomes noUpdate.
		if (this._map.options.zoomAnimation) {
			this._map._animateZoom(this._center, this._map._limitZoom(this._zoom), true, this._map.options.zoomSnap);
		} else {
			this._map._resetView(this._center, this._map._limitZoom(this._zoom));
		}
	}
});

// @section Handlers
// @property touchZoom: Handler
// Touch zoom handler.
Map.addInitHook('addHandler', 'touchZoom', TouchZoom);

Map.BoxZoom = BoxZoom;
Map.DoubleClickZoom = DoubleClickZoom;
Map.Drag = Drag;
Map.Keyboard = Keyboard;
Map.ScrollWheelZoom = ScrollWheelZoom;
Map.Tap = Tap;
Map.TouchZoom = TouchZoom;

Object.freeze = freeze;

exports.version = version;
exports.Control = Control;
exports.control = control;
exports.Browser = Browser;
exports.Evented = Evented;
exports.Mixin = Mixin;
exports.Util = Util;
exports.Class = Class;
exports.Handler = Handler;
exports.extend = extend;
exports.bind = bind;
exports.stamp = stamp;
exports.setOptions = setOptions;
exports.DomEvent = DomEvent;
exports.DomUtil = DomUtil;
exports.PosAnimation = PosAnimation;
exports.Draggable = Draggable;
exports.LineUtil = LineUtil;
exports.PolyUtil = PolyUtil;
exports.Point = Point;
exports.point = toPoint;
exports.Bounds = Bounds;
exports.bounds = toBounds;
exports.Transformation = Transformation;
exports.transformation = toTransformation;
exports.Projection = index;
exports.LatLng = LatLng;
exports.latLng = toLatLng;
exports.LatLngBounds = LatLngBounds;
exports.latLngBounds = toLatLngBounds;
exports.CRS = CRS;
exports.GeoJSON = GeoJSON;
exports.geoJSON = geoJSON;
exports.geoJson = geoJson;
exports.Layer = Layer;
exports.LayerGroup = LayerGroup;
exports.layerGroup = layerGroup;
exports.FeatureGroup = FeatureGroup;
exports.featureGroup = featureGroup;
exports.ImageOverlay = ImageOverlay;
exports.imageOverlay = imageOverlay;
exports.VideoOverlay = VideoOverlay;
exports.videoOverlay = videoOverlay;
exports.DivOverlay = DivOverlay;
exports.Popup = Popup;
exports.popup = popup;
exports.Tooltip = Tooltip;
exports.tooltip = tooltip;
exports.Icon = Icon;
exports.icon = icon;
exports.DivIcon = DivIcon;
exports.divIcon = divIcon;
exports.Marker = Marker;
exports.marker = marker;
exports.TileLayer = TileLayer;
exports.tileLayer = tileLayer;
exports.GridLayer = GridLayer;
exports.gridLayer = gridLayer;
exports.SVG = SVG;
exports.svg = svg$1;
exports.Renderer = Renderer;
exports.Canvas = Canvas;
exports.canvas = canvas$1;
exports.Path = Path;
exports.CircleMarker = CircleMarker;
exports.circleMarker = circleMarker;
exports.Circle = Circle;
exports.circle = circle;
exports.Polyline = Polyline;
exports.polyline = polyline;
exports.Polygon = Polygon;
exports.polygon = polygon;
exports.Rectangle = Rectangle;
exports.rectangle = rectangle;
exports.Map = Map;
exports.map = createMap;

var oldL = window.L;
exports.noConflict = function() {
	window.L = oldL;
	return this;
}

// Always export us to window global (see #2364)
window.L = exports;

})));


},{}],2:[function(require,module,exports){
const L = require('leaflet')
const terrBounds = require('./territory_bounds')
const terrMeta = require('./territory_meta')


let theMap = L.map('map', { 
    attributionControl: false,
    crs: L.CRS.Simple,
    center: [1024, 1024],
    inertia: false,
    minZoom: -1.5,
    maxZoom: 1,
    zoom: -.5,
    zoomDelta: .5,
    zoomSnap: .5
})

let mapTerrCanvas = L.canvas()

let attribution = L.control.attribution({ prefix: "Map Image &copy; Muse Games" }).addTo(theMap)
attribution.addAttribution('<a href="https://leafletjs.com" target="_blank">Leaflet</a>')

let bounds = [[0, 0], [2048, 2048]]
let mapImage = L.imageOverlay('map_comp.png', bounds).addTo(theMap)

theMap.setMaxBounds([[-150, -250], [2198, 2298]])

let mapTerrs = L.layerGroup().addTo(theMap)
let mapCapitols = L.layerGroup().addTo(theMap)


terrBounds.forEach(item => {
    L.polygon(item[1], { color: '#aaa', weight: 1, renderer: mapTerrCanvas, interactive: false }).addTo(mapTerrs)
})

terrMeta.forEach(meta => {
    L.circleMarker(meta.capitol, { radius: 5, color: '#fff', fillOpacity: 1, weight: 1, interactive: false }).addTo(theMap)
})


},{"./territory_bounds":3,"./territory_meta":4,"leaflet":1}],3:[function(require,module,exports){
module.exports = [['beldusios',[[671.5,1804.0],[670.36,1800.18],[670.36,1800.18],[670.36,1800.18],[672.88,1798.62],[672.88,1798.62],[672.88,1798.62],[675.25,1798.62],[675.25,1798.62],[675.25,1798.62],[680.12,1802.25],[680.12,1802.25],[680.12,1802.25],[684.62,1802.25],[684.62,1802.25],[684.62,1802.25],[689.25,1796.5],[689.25,1796.5],[689.25,1796.5],[689.5,1792.12],[689.5,1792.12],[689.5,1792.12],[694.75,1787.0],[694.75,1787.0],[694.75,1787.0],[701.62,1785.38],[701.62,1785.38],[701.62,1785.38],[709.12,1779.75],[709.12,1779.75],[709.12,1779.75],[709.88,1772.88],[709.88,1772.88],[709.88,1772.88],[706.75,1769.12],[706.75,1769.12],[706.75,1769.12],[705.5,1764.62],[705.5,1764.62],[705.5,1764.62],[698.0,1763.25],[698.0,1763.25],[698.0,1763.25],[698.0,1757.25],[698.0,1757.25],[698.0,1757.25],[705.18,1750.36],[705.18,1750.36],[705.18,1750.36],[706.18,1747.45],[706.18,1747.45],[706.18,1747.45],[706.09,1740.0],[706.09,1740.0],[706.09,1740.0],[704.09,1734.18],[704.09,1734.18],[704.09,1734.18],[709.09,1726.91],[709.09,1726.91],[709.09,1726.91],[708.91,1722.82],[708.91,1722.82],[708.91,1722.82],[712.18,1717.36],[712.18,1717.36],[712.18,1717.36],[718.0,1713.45],[718.0,1713.45],[718.0,1713.45],[719.56,1710.38],[719.56,1710.38],[719.56,1710.38],[726.45,1705.64],[726.45,1705.64],[726.45,1705.64],[733.75,1704.81],[733.75,1704.81],[733.75,1704.81],[737.82,1697.45],[737.82,1697.45],[737.82,1697.45],[737.94,1690.38],[737.94,1690.38],[737.94,1690.38],[739.44,1687.5],[739.44,1687.5],[739.44,1687.5],[745.82,1687.82],[745.82,1687.82],[745.82,1687.82],[749.56,1689.88],[749.56,1689.88],[749.56,1689.88],[755.73,1689.64],[755.73,1689.64],[755.73,1689.64],[758.7,1691.09],[758.7,1691.09],[758.7,1691.09],[761.13,1691.04],[761.13,1691.04],[761.13,1691.04],[763.81,1689.5],[763.81,1689.5],[763.81,1689.5],[766.91,1692.55],[766.91,1692.55],[766.91,1692.55],[772.36,1687.91],[772.36,1687.91],[772.36,1687.91],[774.91,1688.09],[774.91,1688.09],[774.91,1688.09],[778.27,1692.27],[778.27,1692.27],[778.27,1692.27],[778.45,1694.55],[778.45,1694.55],[778.45,1694.55],[781.18,1698.36],[781.18,1698.36],[781.18,1698.36],[781.27,1701.18],[781.27,1701.18],[781.27,1701.18],[776.55,1700.18],[776.55,1700.18],[776.55,1700.18],[770.55,1701.64],[770.55,1701.64],[770.55,1701.64],[764.18,1707.55],[764.18,1707.55],[764.18,1707.55],[765.27,1712.45],[765.27,1712.45],[765.27,1712.45],[762.55,1714.82],[762.55,1714.82],[762.55,1714.82],[758.55,1714.91],[758.55,1714.91],[758.55,1714.91],[755.09,1720.55],[755.09,1720.55],[755.09,1720.55],[754.91,1732.0],[754.91,1732.0],[754.91,1732.0],[758.55,1735.27],[758.55,1735.27],[758.55,1735.27],[767.45,1735.36],[767.45,1735.36],[767.45,1735.36],[775.73,1741.27],[775.73,1741.27],[775.73,1741.27],[778.18,1741.55],[778.18,1741.55],[778.18,1741.55],[778.27,1753.64],[778.27,1753.64],[778.27,1753.64],[783.27,1758.36],[783.27,1758.36],[783.27,1758.36],[784.0,1761.45],[784.0,1761.45],[784.0,1761.45],[786.0,1763.27],[786.0,1763.27],[786.0,1763.27],[797.27,1763.91],[797.27,1763.91],[797.27,1763.91],[802.18,1768.73],[802.18,1768.73],[802.18,1768.73],[806.36,1769.55],[806.36,1769.55],[806.36,1769.55],[812.91,1775.73],[812.91,1775.73],[812.91,1775.73],[813.82,1782.18],[813.82,1782.18],[813.82,1782.18],[811.73,1791.55],[811.73,1791.55],[811.73,1791.55],[812.91,1795.82],[812.91,1795.82],[812.91,1795.82],[814.18,1798.73],[814.18,1798.73],[814.18,1798.73],[811.91,1802.09],[811.91,1802.09],[811.91,1802.09],[803.55,1803.18],[803.55,1803.18],[803.55,1803.18],[793.0,1792.73],[793.0,1792.73],[793.0,1792.73],[781.45,1792.0],[781.45,1792.0],[781.45,1792.0],[774.18,1797.0],[774.18,1797.0],[774.18,1797.0],[774.36,1803.73],[774.36,1803.73],[774.36,1803.73],[775.64,1805.27],[775.64,1805.27],[775.64,1805.27],[775.45,1807.73],[775.45,1807.73],[775.45,1807.73],[768.61,1812.96],[768.61,1812.96],[768.61,1812.96],[765.48,1814.39],[765.48,1814.39],[765.48,1814.39],[761.7,1818.22],[761.7,1818.22],[761.7,1818.22],[753.7,1818.39],[753.7,1818.39],[753.7,1818.39],[751.74,1820.74],[751.74,1820.74],[751.74,1820.74],[755.61,1825.26],[755.61,1825.26],[755.61,1825.26],[755.3,1827.48],[755.3,1827.48],[755.3,1827.48],[750.91,1828.04],[750.91,1828.04],[750.91,1828.04],[749.0,1826.0],[749.0,1826.0],[749.0,1826.0],[744.18,1825.91],[744.18,1825.91],[744.18,1825.91],[743.91,1833.18],[743.91,1833.18],[743.91,1833.18],[738.45,1837.36],[738.45,1837.36],[738.45,1837.36],[737.82,1841.55],[737.82,1841.55],[737.82,1841.55],[735.73,1844.09],[735.73,1844.09],[735.73,1844.09],[732.27,1845.45],[732.27,1845.45],[732.27,1845.45],[728.61,1849.17],[728.61,1849.17],[728.61,1849.17],[728.57,1850.83],[728.57,1850.83],[728.57,1850.83],[733.83,1855.91],[733.83,1855.91],[733.83,1855.91],[733.48,1859.61],[733.48,1859.61],[733.48,1859.61],[726.0,1863.81],[726.0,1863.81],[726.0,1863.81],[723.5,1868.56],[723.5,1868.56],[723.5,1868.56],[723.5,1874.38],[723.5,1874.38],[723.5,1874.38],[726.81,1887.19],[726.81,1887.19],[726.81,1887.19],[724.19,1891.62],[724.19,1891.62],[724.19,1891.62],[716.38,1891.88],[716.38,1891.88],[716.38,1891.88],[712.62,1889.62],[712.62,1889.62],[712.62,1889.62],[712.44,1886.19],[712.44,1886.19],[712.44,1886.19],[703.12,1877.69],[703.12,1877.69],[703.12,1877.69],[699.75,1875.94],[699.75,1875.94],[699.75,1875.94],[694.06,1868.25],[694.06,1868.25],[694.06,1868.25],[689.88,1866.31],[689.88,1866.31],[689.88,1866.31],[686.44,1859.62],[686.44,1859.62],[686.44,1859.62],[686.56,1849.0],[686.56,1849.0],[686.56,1849.0],[679.19,1837.12],[679.19,1837.12],[679.19,1837.12],[679.38,1820.62],[679.38,1820.62],[679.38,1820.62],[674.19,1810.5],[674.19,1810.5],[674.19,1810.5],[673.56,1806.88],[673.56,1806.88],[673.56,1806.88],[671.5,1804.0],[671.5,1804.0]]],['lirodunum',[[672.88,1798.62],[675.25,1798.62],[675.25,1798.62],[675.25,1798.62],[680.12,1802.25],[680.12,1802.25],[680.12,1802.25],[684.62,1802.25],[684.62,1802.25],[684.62,1802.25],[689.25,1796.5],[689.25,1796.5],[689.25,1796.5],[689.5,1792.12],[689.5,1792.12],[689.5,1792.12],[694.75,1787.0],[694.75,1787.0],[694.75,1787.0],[701.62,1785.38],[701.62,1785.38],[701.62,1785.38],[709.12,1779.75],[709.12,1779.75],[709.12,1779.75],[709.88,1772.88],[709.88,1772.88],[709.88,1772.88],[706.75,1769.12],[706.75,1769.12],[706.75,1769.12],[705.5,1764.62],[705.5,1764.62],[705.5,1764.62],[698.0,1763.25],[698.0,1763.25],[698.0,1763.25],[698.0,1757.25],[698.0,1757.25],[698.0,1757.25],[705.18,1750.36],[705.18,1750.36],[705.18,1750.36],[706.18,1747.45],[706.18,1747.45],[706.18,1747.45],[706.09,1740.0],[706.09,1740.0],[706.09,1740.0],[704.09,1734.18],[704.09,1734.18],[704.09,1734.18],[709.09,1726.91],[709.09,1726.91],[709.09,1726.91],[708.91,1722.82],[708.91,1722.82],[708.91,1722.82],[712.18,1717.36],[712.18,1717.36],[712.18,1717.36],[718.0,1713.45],[718.0,1713.45],[718.0,1713.45],[719.56,1710.38],[719.56,1710.38],[719.56,1710.38],[726.45,1705.64],[726.45,1705.64],[726.45,1705.64],[733.75,1704.81],[733.75,1704.81],[733.75,1704.81],[737.82,1697.45],[737.82,1697.45],[737.82,1697.45],[737.94,1690.38],[737.94,1690.38],[737.94,1690.38],[739.44,1687.5],[739.44,1687.5],[739.44,1687.5],[745.82,1687.82],[745.82,1687.82],[745.82,1687.82],[749.56,1689.88],[749.56,1689.88],[749.56,1689.88],[755.73,1689.64],[755.73,1689.64],[755.73,1689.64],[758.7,1691.09],[758.7,1691.09],[758.7,1691.09],[761.13,1691.04],[761.13,1691.04],[761.13,1691.04],[763.81,1689.5],[763.81,1689.5],[763.81,1689.5],[763.5,1687.94],[763.5,1687.94],[763.5,1687.94],[768.25,1681.75],[768.25,1681.75],[768.25,1681.75],[768.44,1675.44],[768.44,1675.44],[768.44,1675.44],[771.38,1671.44],[771.38,1671.44],[771.38,1671.44],[775.69,1671.31],[775.69,1671.31],[775.69,1671.31],[779.0,1675.31],[779.0,1675.31],[779.0,1675.31],[782.38,1676.25],[782.38,1676.25],[782.38,1676.25],[788.12,1675.19],[788.12,1675.19],[788.12,1675.19],[790.75,1667.81],[790.75,1667.81],[790.75,1667.81],[788.62,1665.06],[788.62,1665.06],[788.62,1665.06],[787.38,1658.81],[787.38,1658.81],[787.38,1658.81],[784.81,1655.81],[784.81,1655.81],[784.81,1655.81],[781.44,1655.5],[781.44,1655.5],[781.44,1655.5],[778.38,1658.94],[778.38,1658.94],[778.38,1658.94],[772.81,1655.31],[772.81,1655.31],[772.81,1655.31],[771.62,1648.69],[771.62,1648.69],[771.62,1648.69],[768.44,1644.38],[768.44,1644.38],[768.44,1644.38],[766.0,1643.12],[766.0,1643.12],[766.0,1643.12],[760.69,1634.94],[760.69,1634.94],[760.69,1634.94],[753.88,1623.69],[753.88,1623.69],[753.88,1623.69],[750.75,1623.44],[750.75,1623.44],[750.75,1623.44],[746.12,1618.88],[746.12,1618.88],[746.12,1618.88],[745.62,1615.25],[745.62,1615.25],[745.62,1615.25],[743.94,1612.5],[743.94,1612.5],[743.94,1612.5],[743.91,1605.65],[743.91,1605.65],[743.91,1605.65],[737.48,1599.65],[737.48,1599.65],[737.48,1599.65],[734.48,1598.35],[734.48,1598.35],[734.48,1598.35],[732.65,1599.48],[732.65,1599.48],[732.65,1599.48],[731.39,1608.48],[731.39,1608.48],[731.39,1608.48],[732.75,1617.25],[732.75,1617.25],[732.75,1617.25],[739.62,1626.88],[739.62,1626.88],[739.62,1626.88],[740.0,1630.75],[740.0,1630.75],[740.0,1630.75],[738.0,1638.0],[738.0,1638.0],[738.0,1638.0],[739.25,1641.75],[739.25,1641.75],[739.25,1641.75],[739.75,1651.38],[739.75,1651.38],[739.75,1651.38],[744.5,1658.62],[744.5,1658.62],[744.5,1658.62],[744.75,1661.88],[744.75,1661.88],[744.75,1661.88],[747.25,1666.12],[747.25,1666.12],[747.25,1666.12],[746.0,1668.75],[746.0,1668.75],[746.0,1668.75],[743.75,1668.88],[743.75,1668.88],[743.75,1668.88],[738.5,1664.38],[738.5,1664.38],[738.5,1664.38],[734.5,1663.25],[734.5,1663.25],[734.5,1663.25],[727.12,1665.75],[727.12,1665.75],[727.12,1665.75],[722.88,1665.25],[722.88,1665.25],[722.88,1665.25],[722.64,1671.73],[722.64,1671.73],[722.64,1671.73],[721.36,1674.36],[721.36,1674.36],[721.36,1674.36],[721.09,1677.45],[721.09,1677.45],[721.09,1677.45],[716.73,1681.82],[716.73,1681.82],[716.73,1681.82],[710.91,1682.91],[710.91,1682.91],[710.91,1682.91],[708.27,1681.55],[708.27,1681.55],[708.27,1681.55],[704.55,1681.55],[704.55,1681.55],[704.55,1681.55],[700.18,1685.18],[700.18,1685.18],[700.18,1685.18],[687.64,1686.82],[687.64,1686.82],[687.64,1686.82],[679.91,1682.73],[679.91,1682.73],[679.91,1682.73],[671.82,1682.73],[671.82,1682.73],[671.82,1682.73],[667.31,1685.38],[667.31,1685.38],[667.31,1685.38],[665.94,1689.88],[665.94,1689.88],[665.94,1689.88],[664.38,1696.69],[664.38,1696.69],[664.38,1696.69],[659.69,1705.31],[659.69,1705.31],[659.69,1705.31],[656.73,1706.82],[656.73,1706.82],[656.73,1706.82],[655.64,1708.64],[655.64,1708.64],[655.64,1708.64],[660.09,1711.55],[660.09,1711.55],[660.09,1711.55],[660.09,1714.27],[660.09,1714.27],[660.09,1714.27],[655.09,1720.27],[655.09,1720.27],[655.09,1720.27],[655.36,1729.09],[655.36,1729.09],[655.36,1729.09],[656.55,1735.91],[656.55,1735.91],[656.55,1735.91],[664.0,1746.09],[664.0,1746.09],[664.0,1746.09],[664.27,1751.18],[664.27,1751.18],[664.27,1751.18],[663.18,1752.73],[663.18,1752.73],[663.18,1752.73],[663.09,1765.82],[663.09,1765.82],[663.09,1765.82],[655.18,1778.27],[655.18,1778.27],[655.18,1778.27],[654.18,1783.91],[654.18,1783.91],[654.18,1783.91],[655.18,1787.27],[655.18,1787.27],[655.18,1787.27],[664.55,1794.64],[664.55,1794.64],[664.55,1794.64],[668.55,1796.36],[668.55,1796.36],[668.55,1796.36],[670.36,1800.18],[670.36,1800.18],[670.36,1800.18],[672.88,1798.62],[672.88,1798.62]]],['andelata',[[655.64,1708.64],[649.0,1704.45],[649.0,1704.45],[649.0,1704.45],[648.73,1699.55],[648.73,1699.55],[648.73,1699.55],[655.82,1691.45],[655.82,1691.45],[655.82,1691.45],[655.82,1686.09],[655.82,1686.09],[655.82,1686.09],[649.64,1682.64],[649.64,1682.64],[649.64,1682.64],[647.18,1678.91],[647.18,1678.91],[647.18,1678.91],[643.73,1675.73],[643.73,1675.73],[643.73,1675.73],[635.91,1672.91],[635.91,1672.91],[635.91,1672.91],[633.73,1669.36],[633.73,1669.36],[633.73,1669.36],[635.36,1660.45],[635.36,1660.45],[635.36,1660.45],[632.91,1657.91],[632.91,1657.91],[632.91,1657.91],[630.27,1657.91],[630.27,1657.91],[630.27,1657.91],[624.82,1662.73],[624.82,1662.73],[624.82,1662.73],[621.18,1663.64],[621.18,1663.64],[621.18,1663.64],[615.73,1662.55],[615.73,1662.55],[615.73,1662.55],[611.55,1658.73],[611.55,1658.73],[611.55,1658.73],[609.0,1658.73],[609.0,1658.73],[609.0,1658.73],[605.36,1662.09],[605.36,1662.09],[605.36,1662.09],[600.82,1662.0],[600.82,1662.0],[600.82,1662.0],[599.18,1658.55],[599.18,1658.55],[599.18,1658.55],[595.82,1656.45],[595.82,1656.45],[595.82,1656.45],[592.55,1656.0],[592.55,1656.0],[592.55,1656.0],[591.55,1652.45],[591.55,1652.45],[591.55,1652.45],[589.18,1652.64],[589.18,1652.64],[589.18,1652.64],[585.73,1657.55],[585.73,1657.55],[585.73,1657.55],[583.73,1657.82],[583.73,1657.82],[583.73,1657.82],[581.0,1651.82],[581.0,1651.82],[581.0,1651.82],[581.91,1637.73],[581.91,1637.73],[581.91,1637.73],[578.91,1629.27],[578.91,1629.27],[578.91,1629.27],[578.55,1620.0],[578.55,1620.0],[578.55,1620.0],[580.55,1612.36],[580.55,1612.36],[580.55,1612.36],[581.64,1599.45],[581.64,1599.45],[581.64,1599.45],[586.36,1590.18],[586.36,1590.18],[586.36,1590.18],[588.64,1577.09],[588.64,1577.09],[588.64,1577.09],[584.64,1563.91],[584.64,1563.91],[584.64,1563.91],[578.27,1553.91],[578.27,1553.91],[578.27,1553.91],[575.45,1552.55],[575.45,1552.55],[575.45,1552.55],[570.27,1548.27],[570.27,1548.27],[570.27,1548.27],[564.0,1536.09],[564.0,1536.09],[564.0,1536.09],[567.0,1532.64],[567.0,1532.64],[567.0,1532.64],[568.36,1528.09],[568.36,1528.09],[568.36,1528.09],[573.5,1525.88],[573.5,1525.88],[573.5,1525.88],[584.38,1525.62],[584.38,1525.62],[584.38,1525.62],[591.36,1523.09],[591.36,1523.09],[591.36,1523.09],[597.09,1516.73],[597.09,1516.73],[597.09,1516.73],[601.88,1515.0],[601.88,1515.0],[601.88,1515.0],[606.62,1516.75],[606.62,1516.75],[606.62,1516.75],[611.38,1517.25],[611.38,1517.25],[611.38,1517.25],[620.75,1513.0],[620.75,1513.0],[620.75,1513.0],[623.62,1506.12],[623.62,1506.12],[623.62,1506.12],[627.38,1500.88],[627.38,1500.88],[627.38,1500.88],[635.12,1500.25],[635.12,1500.25],[635.12,1500.25],[638.62,1496.62],[638.62,1496.62],[638.62,1496.62],[645.62,1495.5],[645.62,1495.5],[645.62,1495.5],[652.12,1492.62],[652.12,1492.62],[652.12,1492.62],[657.5,1482.75],[657.5,1482.75],[657.5,1482.75],[660.5,1469.75],[660.5,1469.75],[660.5,1469.75],[665.36,1465.64],[665.36,1465.64],[665.36,1465.64],[670.25,1469.5],[670.25,1469.5],[670.25,1469.5],[674.5,1472.25],[674.5,1472.25],[674.5,1472.25],[672.25,1482.5],[672.25,1482.5],[672.25,1482.5],[672.5,1492.12],[672.5,1492.12],[672.5,1492.12],[675.38,1495.25],[675.38,1495.25],[675.38,1495.25],[671.75,1498.0],[671.75,1498.0],[671.75,1498.0],[672.0,1507.0],[672.0,1507.0],[672.0,1507.0],[681.25,1523.25],[681.25,1523.25],[681.25,1523.25],[682.0,1527.0],[682.0,1527.0],[682.0,1527.0],[685.62,1531.62],[685.62,1531.62],[685.62,1531.62],[685.5,1536.38],[685.5,1536.38],[685.5,1536.38],[677.38,1551.12],[677.38,1551.12],[677.38,1551.12],[677.62,1555.88],[677.62,1555.88],[677.62,1555.88],[679.38,1557.12],[679.38,1557.12],[679.38,1557.12],[679.75,1559.75],[679.75,1559.75],[679.75,1559.75],[682.38,1560.0],[682.38,1560.0],[682.38,1560.0],[685.88,1565.25],[685.88,1565.25],[685.88,1565.25],[689.88,1575.12],[689.88,1575.12],[689.88,1575.12],[697.0,1580.0],[697.0,1580.0],[697.0,1580.0],[703.62,1581.12],[703.62,1581.12],[703.62,1581.12],[710.5,1587.0],[710.5,1587.0],[710.5,1587.0],[706.35,1591.61],[706.35,1591.61],[706.35,1591.61],[706.74,1596.22],[706.74,1596.22],[706.74,1596.22],[711.43,1597.74],[711.43,1597.74],[711.43,1597.74],[714.0,1607.82],[714.0,1607.82],[714.0,1607.82],[718.82,1617.64],[718.82,1617.64],[718.82,1617.64],[718.45,1620.27],[718.45,1620.27],[718.45,1620.27],[715.73,1620.09],[715.73,1620.09],[715.73,1620.09],[709.36,1612.36],[709.36,1612.36],[709.36,1612.36],[708.55,1610.0],[708.55,1610.0],[708.55,1610.0],[703.64,1604.73],[703.64,1604.73],[703.64,1604.73],[701.45,1604.55],[701.45,1604.55],[701.45,1604.55],[701.55,1607.73],[701.55,1607.73],[701.55,1607.73],[704.36,1611.82],[704.36,1611.82],[704.36,1611.82],[703.45,1613.73],[703.45,1613.73],[703.45,1613.73],[695.64,1613.55],[695.64,1613.55],[695.64,1613.55],[687.75,1618.38],[687.75,1618.38],[687.75,1618.38],[688.0,1620.94],[688.0,1620.94],[688.0,1620.94],[693.06,1629.0],[693.06,1629.0],[693.06,1629.0],[693.38,1635.06],[693.38,1635.06],[693.38,1635.06],[690.38,1638.75],[690.38,1638.75],[690.38,1638.75],[690.75,1643.5],[690.75,1643.5],[690.75,1643.5],[696.62,1653.75],[696.62,1653.75],[696.62,1653.75],[702.75,1659.5],[702.75,1659.5],[702.75,1659.5],[709.38,1659.75],[709.38,1659.75],[709.38,1659.75],[711.62,1657.44],[711.62,1657.44],[711.62,1657.44],[714.0,1657.56],[714.0,1657.56],[714.0,1657.56],[721.0,1662.75],[721.0,1662.75],[721.0,1662.75],[722.88,1665.25],[722.88,1665.25],[722.88,1665.25],[722.64,1671.73],[722.64,1671.73],[722.64,1671.73],[721.36,1674.36],[721.36,1674.36],[721.36,1674.36],[721.09,1677.45],[721.09,1677.45],[721.09,1677.45],[716.73,1681.82],[716.73,1681.82],[716.73,1681.82],[710.91,1682.91],[710.91,1682.91],[710.91,1682.91],[708.27,1681.55],[708.27,1681.55],[708.27,1681.55],[704.55,1681.55],[704.55,1681.55],[704.55,1681.55],[700.18,1685.18],[700.18,1685.18],[700.18,1685.18],[687.64,1686.82],[687.64,1686.82],[687.64,1686.82],[679.91,1682.73],[679.91,1682.73],[679.91,1682.73],[671.82,1682.73],[671.82,1682.73],[671.82,1682.73],[667.31,1685.38],[667.31,1685.38],[667.31,1685.38],[665.94,1689.88],[665.94,1689.88],[665.94,1689.88],[664.38,1696.69],[664.38,1696.69],[664.38,1696.69],[659.69,1705.31],[659.69,1705.31],[659.69,1705.31],[656.73,1706.82],[656.73,1706.82],[656.73,1706.82],[655.64,1708.64],[655.64,1708.64]]],['morMare',[[663.82,1464.18],[663.55,1460.18],[663.55,1460.18],[663.55,1460.18],[651.91,1455.0],[651.91,1455.0],[651.91,1455.0],[644.36,1454.0],[644.36,1454.0],[644.36,1454.0],[642.09,1451.82],[642.09,1451.82],[642.09,1451.82],[637.0,1450.36],[637.0,1450.36],[637.0,1450.36],[636.64,1447.36],[636.64,1447.36],[636.64,1447.36],[634.09,1444.09],[634.09,1444.09],[634.09,1444.09],[629.73,1442.0],[629.73,1442.0],[629.73,1442.0],[631.55,1438.09],[631.55,1438.09],[631.55,1438.09],[633.91,1437.18],[633.91,1437.18],[633.91,1437.18],[634.18,1434.73],[634.18,1434.73],[634.18,1434.73],[637.12,1432.25],[637.12,1432.25],[637.12,1432.25],[637.0,1428.18],[637.0,1428.18],[637.0,1428.18],[629.62,1427.5],[629.62,1427.5],[629.62,1427.5],[623.75,1422.25],[623.75,1422.25],[623.75,1422.25],[619.12,1421.75],[619.12,1421.75],[619.12,1421.75],[615.38,1418.25],[615.38,1418.25],[615.38,1418.25],[615.25,1414.0],[615.25,1414.0],[615.25,1414.0],[612.88,1411.25],[612.88,1411.25],[612.88,1411.25],[610.5,1411.38],[610.5,1411.38],[610.5,1411.38],[608.62,1413.38],[608.62,1413.38],[608.62,1413.38],[608.5,1418.0],[608.5,1418.0],[608.5,1418.0],[605.38,1421.0],[605.38,1421.0],[605.38,1421.0],[605.25,1425.5],[605.25,1425.5],[605.25,1425.5],[610.88,1432.25],[610.88,1432.25],[610.88,1432.25],[610.88,1437.0],[610.88,1437.0],[610.88,1437.0],[607.88,1441.5],[607.88,1441.5],[607.88,1441.5],[602.75,1443.62],[602.75,1443.62],[602.75,1443.62],[598.88,1441.0],[598.88,1441.0],[598.88,1441.0],[597.88,1436.0],[597.88,1436.0],[597.88,1436.0],[595.88,1429.62],[595.88,1429.62],[595.88,1429.62],[597.0,1420.75],[597.0,1420.75],[597.0,1420.75],[593.5,1418.0],[593.5,1418.0],[593.5,1418.0],[593.62,1412.25],[593.62,1412.25],[593.62,1412.25],[590.75,1410.25],[590.75,1410.25],[590.75,1410.25],[583.0,1410.38],[583.0,1410.38],[583.0,1410.38],[581.12,1409.0],[581.12,1409.0],[581.12,1409.0],[581.12,1401.75],[581.12,1401.75],[581.12,1401.75],[578.0,1401.12],[578.0,1401.12],[578.0,1401.12],[573.88,1395.0],[573.88,1395.0],[573.88,1395.0],[573.75,1385.88],[573.75,1385.88],[573.75,1385.88],[575.62,1381.62],[575.62,1381.62],[575.62,1381.62],[577.88,1381.38],[577.88,1381.38],[577.88,1381.38],[584.62,1374.62],[584.62,1374.62],[584.62,1374.62],[584.75,1367.62],[584.75,1367.62],[584.75,1367.62],[589.25,1363.62],[589.25,1363.62],[589.25,1363.62],[591.5,1360.75],[591.5,1360.75],[591.5,1360.75],[591.88,1355.75],[591.88,1355.75],[591.88,1355.75],[594.5,1352.12],[594.5,1352.12],[594.5,1352.12],[597.88,1352.0],[597.88,1352.0],[597.88,1352.0],[602.25,1350.38],[602.25,1350.38],[602.25,1350.38],[606.64,1344.91],[606.64,1344.91],[606.64,1344.91],[596.36,1334.55],[596.36,1334.55],[596.36,1334.55],[596.09,1331.27],[596.09,1331.27],[596.09,1331.27],[592.0,1325.55],[592.0,1325.55],[592.0,1325.55],[592.0,1318.82],[592.0,1318.82],[592.0,1318.82],[595.27,1310.36],[595.27,1310.36],[595.27,1310.36],[595.18,1299.73],[595.18,1299.73],[595.18,1299.73],[589.27,1289.73],[589.27,1289.73],[589.27,1289.73],[588.91,1285.45],[588.91,1285.45],[588.91,1285.45],[587.55,1282.45],[587.55,1282.45],[587.55,1282.45],[587.64,1275.0],[587.64,1275.0],[587.64,1275.0],[582.73,1269.73],[582.73,1269.73],[582.73,1269.73],[573.55,1269.45],[573.55,1269.45],[573.55,1269.45],[567.73,1265.73],[567.73,1265.73],[567.73,1265.73],[564.55,1265.36],[564.55,1265.36],[564.55,1265.36],[559.64,1274.18],[559.64,1274.18],[559.64,1274.18],[557.0,1274.27],[557.0,1274.27],[557.0,1274.27],[553.36,1266.55],[553.36,1266.55],[553.36,1266.55],[539.91,1258.55],[539.91,1258.55],[539.91,1258.55],[534.45,1257.27],[534.45,1257.27],[534.45,1257.27],[527.36,1248.36],[527.36,1248.36],[527.36,1248.36],[523.91,1241.18],[523.91,1241.18],[523.91,1241.18],[521.18,1239.91],[521.18,1239.91],[521.18,1239.91],[517.64,1241.36],[517.64,1241.36],[517.64,1241.36],[514.09,1238.27],[514.09,1238.27],[514.09,1238.27],[513.27,1233.82],[513.27,1233.82],[513.27,1233.82],[507.0,1236.64],[507.0,1236.64],[507.0,1236.64],[502.09,1244.64],[502.09,1244.64],[502.09,1244.64],[499.55,1253.82],[499.55,1253.82],[499.55,1253.82],[495.36,1259.36],[495.36,1259.36],[495.36,1259.36],[488.27,1261.27],[488.27,1261.27],[488.27,1261.27],[481.64,1259.36],[481.64,1259.36],[481.64,1259.36],[481.27,1263.82],[481.27,1263.82],[481.27,1263.82],[478.18,1270.36],[478.18,1270.36],[478.18,1270.36],[478.0,1286.09],[478.0,1286.09],[478.0,1286.09],[475.45,1294.91],[475.45,1294.91],[475.45,1294.91],[475.55,1304.55],[475.55,1304.55],[475.55,1304.55],[479.91,1310.45],[479.91,1310.45],[479.91,1310.45],[482.64,1315.55],[482.64,1315.55],[482.64,1315.55],[489.55,1316.91],[489.55,1316.91],[489.55,1316.91],[490.55,1319.55],[490.55,1319.55],[490.55,1319.55],[500.55,1331.64],[500.55,1331.64],[500.55,1331.64],[505.45,1332.09],[505.45,1332.09],[505.45,1332.09],[509.18,1335.36],[509.18,1335.36],[509.18,1335.36],[509.45,1339.64],[509.45,1339.64],[509.45,1339.64],[507.73,1342.55],[507.73,1342.55],[507.73,1342.55],[507.55,1347.91],[507.55,1347.91],[507.55,1347.91],[509.82,1351.73],[509.82,1351.73],[509.82,1351.73],[506.09,1358.36],[506.09,1358.36],[506.09,1358.36],[505.55,1366.09],[505.55,1366.09],[505.55,1366.09],[501.0,1369.64],[501.0,1369.64],[501.0,1369.64],[500.18,1379.18],[500.18,1379.18],[500.18,1379.18],[501.82,1389.27],[501.82,1389.27],[501.82,1389.27],[518.45,1397.45],[518.45,1397.45],[518.45,1397.45],[520.45,1405.73],[520.45,1405.73],[520.45,1405.73],[518.27,1419.09],[518.27,1419.09],[518.27,1419.09],[518.91,1425.7],[518.91,1425.7],[518.91,1425.7],[522.78,1431.74],[522.78,1431.74],[522.78,1431.74],[529.62,1437.0],[529.62,1437.0],[529.62,1437.0],[544.38,1442.38],[544.38,1442.38],[544.38,1442.38],[548.38,1442.88],[548.38,1442.88],[548.38,1442.88],[554.75,1441.75],[554.75,1441.75],[554.75,1441.75],[564.5,1443.88],[564.5,1443.88],[564.5,1443.88],[570.5,1447.75],[570.5,1447.75],[570.5,1447.75],[572.38,1451.88],[572.38,1451.88],[572.38,1451.88],[584.75,1466.12],[584.75,1466.12],[584.75,1466.12],[584.75,1469.0],[584.75,1469.0],[584.75,1469.0],[581.88,1470.5],[581.88,1470.5],[581.88,1470.5],[572.38,1471.0],[572.38,1471.0],[572.38,1471.0],[567.5,1468.5],[567.5,1468.5],[567.5,1468.5],[561.62,1468.5],[561.62,1468.5],[561.62,1468.5],[557.5,1472.5],[557.5,1472.5],[557.5,1472.5],[557.5,1477.12],[557.5,1477.12],[557.5,1477.12],[562.62,1485.56],[562.62,1485.56],[562.62,1485.56],[562.88,1490.25],[562.88,1490.25],[562.88,1490.25],[566.56,1503.5],[566.56,1503.5],[566.56,1503.5],[572.56,1509.44],[572.56,1509.44],[572.56,1509.44],[573.5,1512.56],[573.5,1512.56],[573.5,1512.56],[574.12,1519.06],[574.12,1519.06],[574.12,1519.06],[573.5,1525.88],[573.5,1525.88],[573.5,1525.88],[584.38,1525.62],[584.38,1525.62],[584.38,1525.62],[591.36,1523.09],[591.36,1523.09],[591.36,1523.09],[597.09,1516.73],[597.09,1516.73],[597.09,1516.73],[601.88,1515.0],[601.88,1515.0],[601.88,1515.0],[606.62,1516.75],[606.62,1516.75],[606.62,1516.75],[611.38,1517.25],[611.38,1517.25],[611.38,1517.25],[620.75,1513.0],[620.75,1513.0],[620.75,1513.0],[623.62,1506.12],[623.62,1506.12],[623.62,1506.12],[627.38,1500.88],[627.38,1500.88],[627.38,1500.88],[635.12,1500.25],[635.12,1500.25],[635.12,1500.25],[638.62,1496.62],[638.62,1496.62],[638.62,1496.62],[645.62,1495.5],[645.62,1495.5],[645.62,1495.5],[652.12,1492.62],[652.12,1492.62],[652.12,1492.62],[657.5,1482.75],[657.5,1482.75],[657.5,1482.75],[660.5,1469.75],[660.5,1469.75],[660.5,1469.75],[665.36,1465.64],[665.36,1465.64],[665.36,1465.64],[663.82,1464.18],[663.82,1464.18]]],['vamaRea',[[535.45,1195.82],[535.73,1200.09],[535.73,1200.09],[535.73,1200.09],[541.82,1205.36],[541.82,1205.36],[541.82,1205.36],[547.18,1206.91],[547.18,1206.91],[547.18,1206.91],[549.0,1210.45],[549.0,1210.45],[549.0,1210.45],[554.18,1212.18],[554.18,1212.18],[554.18,1212.18],[559.55,1211.27],[559.55,1211.27],[559.55,1211.27],[561.55,1212.27],[561.55,1212.27],[561.55,1212.27],[566.18,1220.0],[566.18,1220.0],[566.18,1220.0],[571.73,1220.0],[571.73,1220.0],[571.73,1220.0],[575.73,1217.82],[575.73,1217.82],[575.73,1217.82],[584.91,1217.91],[584.91,1217.91],[584.91,1217.91],[586.91,1215.91],[586.91,1215.91],[586.91,1215.91],[590.18,1215.82],[590.18,1215.82],[590.18,1215.82],[593.27,1212.91],[593.27,1212.91],[593.27,1212.91],[595.27,1204.64],[595.27,1204.64],[595.27,1204.64],[593.91,1199.09],[593.91,1199.09],[593.91,1199.09],[595.36,1192.64],[595.36,1192.64],[595.36,1192.64],[599.18,1191.45],[599.18,1191.45],[599.18,1191.45],[601.45,1185.36],[601.45,1185.36],[601.45,1185.36],[603.91,1183.09],[603.91,1183.09],[603.91,1183.09],[610.73,1182.55],[610.73,1182.55],[610.73,1182.55],[615.0,1177.91],[615.0,1177.91],[615.0,1177.91],[616.0,1170.45],[616.0,1170.45],[616.0,1170.45],[618.55,1166.09],[618.55,1166.09],[618.55,1166.09],[622.55,1162.09],[622.55,1162.09],[622.55,1162.09],[629.31,1166.69],[629.31,1166.69],[629.31,1166.69],[629.88,1173.81],[629.88,1173.81],[629.88,1173.81],[633.06,1179.12],[633.06,1179.12],[633.06,1179.12],[637.06,1179.62],[637.06,1179.62],[637.06,1179.62],[643.0,1185.56],[643.0,1185.56],[643.0,1185.56],[649.56,1186.12],[649.56,1186.12],[649.56,1186.12],[651.88,1188.75],[651.88,1188.75],[651.88,1188.75],[651.94,1193.19],[651.94,1193.19],[651.94,1193.19],[658.19,1195.12],[658.19,1195.12],[658.19,1195.12],[665.0,1192.69],[665.0,1192.69],[665.0,1192.69],[670.44,1192.88],[670.44,1192.88],[670.44,1192.88],[674.25,1187.31],[674.25,1187.31],[674.25,1187.31],[679.81,1185.19],[679.81,1185.19],[679.81,1185.19],[683.94,1185.56],[683.94,1185.56],[683.94,1185.56],[685.94,1188.5],[685.94,1188.5],[685.94,1188.5],[685.5,1191.12],[685.5,1191.12],[685.5,1191.12],[691.62,1190.75],[691.62,1190.75],[691.62,1190.75],[696.5,1186.12],[696.5,1186.12],[696.5,1186.12],[701.38,1184.25],[701.38,1184.25],[701.38,1184.25],[704.75,1186.0],[704.75,1186.0],[704.75,1186.0],[702.88,1190.25],[702.88,1190.25],[702.88,1190.25],[706.25,1193.0],[706.25,1193.0],[706.25,1193.0],[712.75,1194.12],[712.75,1194.12],[712.75,1194.12],[716.62,1200.25],[716.62,1200.25],[716.62,1200.25],[724.25,1202.25],[724.25,1202.25],[724.25,1202.25],[727.43,1204.96],[727.43,1204.96],[727.43,1204.96],[727.13,1207.43],[727.13,1207.43],[727.13,1207.43],[722.43,1211.48],[722.43,1211.48],[722.43,1211.48],[719.48,1221.35],[719.48,1221.35],[719.48,1221.35],[717.73,1228.09],[717.73,1228.09],[717.73,1228.09],[718.55,1232.0],[718.55,1232.0],[718.55,1232.0],[721.64,1235.82],[721.64,1235.82],[721.64,1235.82],[721.45,1241.0],[721.45,1241.0],[721.45,1241.0],[718.64,1243.64],[718.64,1243.64],[718.64,1243.64],[715.18,1244.09],[715.18,1244.09],[715.18,1244.09],[712.09,1247.45],[712.09,1247.45],[712.09,1247.45],[703.91,1249.18],[703.91,1249.18],[703.91,1249.18],[695.91,1257.82],[695.91,1257.82],[695.91,1257.82],[690.09,1258.0],[690.09,1258.0],[690.09,1258.0],[688.55,1259.45],[688.55,1259.45],[688.55,1259.45],[677.55,1260.91],[677.55,1260.91],[677.55,1260.91],[675.73,1262.91],[675.73,1262.91],[675.73,1262.91],[673.09,1274.09],[673.09,1274.09],[673.09,1274.09],[663.82,1288.18],[663.82,1288.18],[663.82,1288.18],[657.09,1293.82],[657.09,1293.82],[657.09,1293.82],[653.27,1304.36],[653.27,1304.36],[653.27,1304.36],[652.0,1314.55],[652.0,1314.55],[652.0,1314.55],[648.0,1319.09],[648.0,1319.09],[648.0,1319.09],[635.82,1322.36],[635.82,1322.36],[635.82,1322.36],[630.18,1331.64],[630.18,1331.64],[630.18,1331.64],[619.62,1337.88],[619.62,1337.88],[619.62,1337.88],[615.0,1338.75],[615.0,1338.75],[615.0,1338.75],[610.0,1342.88],[610.0,1342.88],[610.0,1342.88],[606.64,1344.91],[606.64,1344.91],[606.64,1344.91],[596.36,1334.55],[596.36,1334.55],[596.36,1334.55],[596.09,1331.27],[596.09,1331.27],[596.09,1331.27],[592.0,1325.55],[592.0,1325.55],[592.0,1325.55],[592.0,1318.82],[592.0,1318.82],[592.0,1318.82],[595.27,1310.36],[595.27,1310.36],[595.27,1310.36],[595.18,1299.73],[595.18,1299.73],[595.18,1299.73],[589.27,1289.73],[589.27,1289.73],[589.27,1289.73],[588.91,1285.45],[588.91,1285.45],[588.91,1285.45],[587.55,1282.45],[587.55,1282.45],[587.55,1282.45],[587.64,1275.0],[587.64,1275.0],[587.64,1275.0],[582.73,1269.73],[582.73,1269.73],[582.73,1269.73],[573.55,1269.45],[573.55,1269.45],[573.55,1269.45],[567.73,1265.73],[567.73,1265.73],[567.73,1265.73],[564.55,1265.36],[564.55,1265.36],[564.55,1265.36],[559.64,1274.18],[559.64,1274.18],[559.64,1274.18],[557.0,1274.27],[557.0,1274.27],[557.0,1274.27],[553.36,1266.55],[553.36,1266.55],[553.36,1266.55],[539.91,1258.55],[539.91,1258.55],[539.91,1258.55],[534.45,1257.27],[534.45,1257.27],[534.45,1257.27],[527.36,1248.36],[527.36,1248.36],[527.36,1248.36],[523.91,1241.18],[523.91,1241.18],[523.91,1241.18],[521.18,1239.91],[521.18,1239.91],[521.18,1239.91],[517.64,1241.36],[517.64,1241.36],[517.64,1241.36],[514.09,1238.27],[514.09,1238.27],[514.09,1238.27],[513.27,1233.82],[513.27,1233.82],[513.27,1233.82],[515.27,1230.45],[515.27,1230.45],[515.27,1230.45],[520.36,1215.91],[520.36,1215.91],[520.36,1215.91],[524.18,1211.36],[524.18,1211.36],[524.18,1211.36],[524.27,1201.09],[524.27,1201.09],[524.27,1201.09],[530.36,1195.73],[530.36,1195.73],[530.36,1195.73],[535.45,1195.82],[535.45,1195.82]]],['vyshtorg',[[554.06,1061.0],[556.73,1061.55],[556.73,1061.55],[556.73,1061.55],[566.09,1072.09],[566.09,1072.09],[566.09,1072.09],[568.55,1072.36],[568.55,1072.36],[568.55,1072.36],[572.36,1079.91],[572.36,1079.91],[572.36,1079.91],[573.91,1091.64],[573.91,1091.64],[573.91,1091.64],[572.82,1097.64],[572.82,1097.64],[572.82,1097.64],[573.45,1103.91],[573.45,1103.91],[573.45,1103.91],[575.62,1107.5],[575.62,1107.5],[575.62,1107.5],[577.18,1115.09],[577.18,1115.09],[577.18,1115.09],[577.19,1123.0],[577.19,1123.0],[577.19,1123.0],[572.81,1131.06],[572.81,1131.06],[572.81,1131.06],[572.64,1139.73],[572.64,1139.73],[572.64,1139.73],[573.36,1142.55],[573.36,1142.55],[573.36,1142.55],[568.73,1153.91],[568.73,1153.91],[568.73,1153.91],[562.91,1164.0],[562.91,1164.0],[562.91,1164.0],[562.45,1168.91],[562.45,1168.91],[562.45,1168.91],[558.18,1177.27],[558.18,1177.27],[558.18,1177.27],[556.55,1186.64],[556.55,1186.64],[556.55,1186.64],[553.0,1188.0],[553.0,1188.0],[553.0,1188.0],[545.64,1197.09],[545.64,1197.09],[545.64,1197.09],[535.45,1195.82],[535.45,1195.82],[535.45,1195.82],[530.36,1195.73],[530.36,1195.73],[530.36,1195.73],[524.27,1201.09],[524.27,1201.09],[524.27,1201.09],[524.18,1211.36],[524.18,1211.36],[524.18,1211.36],[520.36,1215.91],[520.36,1215.91],[520.36,1215.91],[515.27,1230.45],[515.27,1230.45],[515.27,1230.45],[513.27,1233.82],[513.27,1233.82],[513.27,1233.82],[507.0,1236.64],[507.0,1236.64],[507.0,1236.64],[502.09,1244.64],[502.09,1244.64],[502.09,1244.64],[499.55,1253.82],[499.55,1253.82],[499.55,1253.82],[495.36,1259.36],[495.36,1259.36],[495.36,1259.36],[488.27,1261.27],[488.27,1261.27],[488.27,1261.27],[481.64,1259.36],[481.64,1259.36],[481.64,1259.36],[480.38,1254.75],[480.38,1254.75],[480.38,1254.75],[476.62,1250.5],[476.62,1250.5],[476.62,1250.5],[475.88,1245.62],[475.88,1245.62],[475.88,1245.62],[472.25,1244.12],[472.25,1244.12],[472.25,1244.12],[469.25,1245.62],[469.25,1245.62],[469.25,1245.62],[464.38,1246.25],[464.38,1246.25],[464.38,1246.25],[458.62,1252.62],[458.62,1252.62],[458.62,1252.62],[455.12,1252.88],[455.12,1252.88],[455.12,1252.88],[454.38,1250.75],[454.38,1250.75],[454.38,1250.75],[459.12,1242.0],[459.12,1242.0],[459.12,1242.0],[459.62,1236.12],[459.62,1236.12],[459.62,1236.12],[453.12,1229.88],[453.12,1229.88],[453.12,1229.88],[446.12,1230.12],[446.12,1230.12],[446.12,1230.12],[438.12,1237.0],[438.12,1237.0],[438.12,1237.0],[438.38,1240.88],[438.38,1240.88],[438.38,1240.88],[436.0,1247.5],[436.0,1247.5],[436.0,1247.5],[431.0,1250.38],[431.0,1250.38],[431.0,1250.38],[426.0,1244.62],[426.0,1244.62],[426.0,1244.62],[417.75,1242.38],[417.75,1242.38],[417.75,1242.38],[412.25,1237.0],[412.25,1237.0],[412.25,1237.0],[412.5,1229.38],[412.5,1229.38],[412.5,1229.38],[422.0,1227.88],[422.0,1227.88],[422.0,1227.88],[423.38,1222.5],[423.38,1222.5],[423.38,1222.5],[419.88,1215.88],[419.88,1215.88],[419.88,1215.88],[424.12,1207.0],[424.12,1207.0],[424.12,1207.0],[424.0,1189.88],[424.0,1189.88],[424.0,1189.88],[423.12,1184.38],[423.12,1184.38],[423.12,1184.38],[425.0,1174.75],[425.0,1174.75],[425.0,1174.75],[425.5,1139.25],[425.5,1139.25],[425.5,1139.25],[424.25,1128.88],[424.25,1128.88],[424.25,1128.88],[419.25,1122.0],[419.25,1122.0],[419.25,1122.0],[418.88,1117.88],[418.88,1117.88],[418.88,1117.88],[410.88,1111.75],[410.88,1111.75],[410.88,1111.75],[410.5,1108.38],[410.5,1108.38],[410.5,1108.38],[414.62,1103.38],[414.62,1103.38],[414.62,1103.38],[415.12,1096.12],[415.12,1096.12],[415.12,1096.12],[410.5,1091.88],[410.5,1091.88],[410.5,1091.88],[407.62,1087.88],[407.62,1087.88],[407.62,1087.88],[401.25,1085.25],[401.25,1085.25],[401.25,1085.25],[395.73,1080.55],[395.73,1080.55],[395.73,1080.55],[399.0,1076.75],[399.0,1076.75],[399.0,1076.75],[404.25,1075.0],[404.25,1075.0],[404.25,1075.0],[408.5,1075.0],[408.5,1075.0],[408.5,1075.0],[413.94,1070.06],[413.94,1070.06],[413.94,1070.06],[414.19,1065.38],[414.19,1065.38],[414.19,1065.38],[419.25,1061.62],[419.25,1061.62],[419.25,1061.62],[424.38,1061.56],[424.38,1061.56],[424.38,1061.56],[426.31,1062.88],[426.31,1062.88],[426.31,1062.88],[437.44,1062.75],[437.44,1062.75],[437.44,1062.75],[442.81,1060.12],[442.81,1060.12],[442.81,1060.12],[447.56,1050.94],[447.56,1050.94],[447.56,1050.94],[451.38,1047.5],[451.38,1047.5],[451.38,1047.5],[458.31,1045.94],[458.31,1045.94],[458.31,1045.94],[474.25,1045.75],[474.25,1045.75],[474.25,1045.75],[481.0,1049.0],[481.0,1049.0],[481.0,1049.0],[491.25,1049.69],[491.25,1049.69],[491.25,1049.69],[496.12,1052.75],[496.12,1052.75],[496.12,1052.75],[510.91,1054.26],[510.91,1054.26],[510.91,1054.26],[514.13,1058.22],[514.13,1058.22],[514.13,1058.22],[519.26,1062.0],[519.26,1062.0],[519.26,1062.0],[527.91,1063.83],[527.91,1063.83],[527.91,1063.83],[530.36,1065.64],[530.36,1065.64],[530.36,1065.64],[543.27,1064.91],[543.27,1064.91],[543.27,1064.91],[550.0,1061.64],[550.0,1061.64],[550.0,1061.64],[554.06,1061.0],[554.06,1061.0]]],['starostrog',[[622.55,1162.09],[618.55,1166.09],[618.55,1166.09],[618.55,1166.09],[616.0,1170.45],[616.0,1170.45],[616.0,1170.45],[615.0,1177.91],[615.0,1177.91],[615.0,1177.91],[610.73,1182.55],[610.73,1182.55],[610.73,1182.55],[603.91,1183.09],[603.91,1183.09],[603.91,1183.09],[601.45,1185.36],[601.45,1185.36],[601.45,1185.36],[599.18,1191.45],[599.18,1191.45],[599.18,1191.45],[595.36,1192.64],[595.36,1192.64],[595.36,1192.64],[593.91,1199.09],[593.91,1199.09],[593.91,1199.09],[595.27,1204.64],[595.27,1204.64],[595.27,1204.64],[593.27,1212.91],[593.27,1212.91],[593.27,1212.91],[590.18,1215.82],[590.18,1215.82],[590.18,1215.82],[586.91,1215.91],[586.91,1215.91],[586.91,1215.91],[584.91,1217.91],[584.91,1217.91],[584.91,1217.91],[575.73,1217.82],[575.73,1217.82],[575.73,1217.82],[571.73,1220.0],[571.73,1220.0],[571.73,1220.0],[566.18,1220.0],[566.18,1220.0],[566.18,1220.0],[561.55,1212.27],[561.55,1212.27],[561.55,1212.27],[559.55,1211.27],[559.55,1211.27],[559.55,1211.27],[554.18,1212.18],[554.18,1212.18],[554.18,1212.18],[549.0,1210.45],[549.0,1210.45],[549.0,1210.45],[547.18,1206.91],[547.18,1206.91],[547.18,1206.91],[541.82,1205.36],[541.82,1205.36],[541.82,1205.36],[535.73,1200.09],[535.73,1200.09],[535.73,1200.09],[535.45,1195.82],[535.45,1195.82],[535.45,1195.82],[545.64,1197.09],[545.64,1197.09],[545.64,1197.09],[553.0,1188.0],[553.0,1188.0],[553.0,1188.0],[556.55,1186.64],[556.55,1186.64],[556.55,1186.64],[558.18,1177.27],[558.18,1177.27],[558.18,1177.27],[562.45,1168.91],[562.45,1168.91],[562.45,1168.91],[562.91,1164.0],[562.91,1164.0],[562.91,1164.0],[568.73,1153.91],[568.73,1153.91],[568.73,1153.91],[573.36,1142.55],[573.36,1142.55],[573.36,1142.55],[572.64,1139.73],[572.64,1139.73],[572.64,1139.73],[572.81,1131.06],[572.81,1131.06],[572.81,1131.06],[577.19,1123.0],[577.19,1123.0],[577.19,1123.0],[577.18,1115.09],[577.18,1115.09],[577.18,1115.09],[575.62,1107.5],[575.62,1107.5],[575.62,1107.5],[573.45,1103.91],[573.45,1103.91],[573.45,1103.91],[572.82,1097.64],[572.82,1097.64],[572.82,1097.64],[573.91,1091.64],[573.91,1091.64],[573.91,1091.64],[572.36,1079.91],[572.36,1079.91],[572.36,1079.91],[568.55,1072.36],[568.55,1072.36],[568.55,1072.36],[566.09,1072.09],[566.09,1072.09],[566.09,1072.09],[556.73,1061.55],[556.73,1061.55],[556.73,1061.55],[554.06,1061.0],[554.06,1061.0],[554.06,1061.0],[555.88,1058.0],[555.88,1058.0],[555.88,1058.0],[561.0,1054.31],[561.0,1054.31],[561.0,1054.31],[566.88,1052.56],[566.88,1052.56],[566.88,1052.56],[572.82,1046.18],[572.82,1046.18],[572.82,1046.18],[573.55,1043.36],[573.55,1043.36],[573.55,1043.36],[580.82,1038.45],[580.82,1038.45],[580.82,1038.45],[587.09,1038.45],[587.09,1038.45],[587.09,1038.45],[594.36,1043.27],[594.36,1043.27],[594.36,1043.27],[599.27,1050.82],[599.27,1050.82],[599.27,1050.82],[601.91,1053.45],[601.91,1053.45],[601.91,1053.45],[606.56,1054.06],[606.56,1054.06],[606.56,1054.06],[608.64,1061.73],[608.64,1061.73],[608.64,1061.73],[613.18,1067.73],[613.18,1067.73],[613.18,1067.73],[617.55,1078.91],[617.55,1078.91],[617.55,1078.91],[618.73,1090.82],[618.73,1090.82],[618.73,1090.82],[630.09,1101.82],[630.09,1101.82],[630.09,1101.82],[630.27,1108.18],[630.27,1108.18],[630.27,1108.18],[634.82,1113.45],[634.82,1113.45],[634.82,1113.45],[630.45,1118.45],[630.45,1118.45],[630.45,1118.45],[630.18,1125.91],[630.18,1125.91],[630.18,1125.91],[620.18,1132.55],[620.18,1132.55],[620.18,1132.55],[615.27,1132.45],[615.27,1132.45],[615.27,1132.45],[610.45,1128.73],[610.45,1128.73],[610.45,1128.73],[604.45,1127.73],[604.45,1127.73],[604.45,1127.73],[602.36,1130.27],[602.36,1130.27],[602.36,1130.27],[605.45,1134.45],[605.45,1134.45],[605.45,1134.45],[611.18,1137.73],[611.18,1137.73],[611.18,1137.73],[613.82,1142.55],[613.82,1142.55],[613.82,1142.55],[613.82,1148.45],[613.82,1148.45],[613.82,1148.45],[615.73,1151.18],[615.73,1151.18],[615.73,1151.18],[614.91,1152.82],[614.91,1152.82],[614.91,1152.82],[622.55,1162.09],[622.55,1162.09]]],['orlevsela',[[510.27,1046.09],[510.55,1043.0],[510.55,1043.0],[510.55,1043.0],[513.55,1038.64],[513.55,1038.64],[513.55,1038.64],[513.64,1026.36],[513.64,1026.36],[513.64,1026.36],[508.91,1020.18],[508.91,1020.18],[508.91,1020.18],[508.27,1016.73],[508.27,1016.73],[508.27,1016.73],[501.36,1003.55],[501.36,1003.55],[501.36,1003.55],[501.27,985.55],[501.27,985.55],[501.27,985.55],[502.55,984.82],[502.55,984.82],[502.55,984.82],[502.55,981.82],[502.55,981.82],[502.55,981.82],[508.45,973.91],[508.45,973.91],[508.45,973.91],[512.36,970.64],[512.36,970.64],[512.36,970.64],[515.64,970.0],[515.64,970.0],[515.64,970.0],[516.82,964.64],[516.82,964.64],[516.82,964.64],[518.82,962.82],[518.82,962.82],[518.82,962.82],[523.36,962.27],[523.36,962.27],[523.36,962.27],[526.45,956.18],[526.45,956.18],[526.45,956.18],[529.09,941.27],[529.09,941.27],[529.09,941.27],[524.64,927.45],[524.64,927.45],[524.64,927.45],[525.64,923.91],[525.64,923.91],[525.64,923.91],[527.27,919.73],[527.27,919.73],[527.27,919.73],[524.62,913.25],[524.62,913.25],[524.62,913.25],[524.75,908.31],[524.75,908.31],[524.75,908.31],[521.06,899.38],[521.06,899.38],[521.06,899.38],[524.31,890.75],[524.31,890.75],[524.31,890.75],[523.88,885.81],[523.88,885.81],[523.88,885.81],[518.12,879.69],[518.12,879.69],[518.12,879.69],[516.31,876.88],[516.31,876.88],[516.31,876.88],[516.91,872.18],[516.91,872.18],[516.91,872.18],[521.27,872.09],[521.27,872.09],[521.27,872.09],[525.18,869.18],[525.18,869.18],[525.18,869.18],[529.18,869.45],[529.18,869.45],[529.18,869.45],[531.18,872.36],[531.18,872.36],[531.18,872.36],[531.18,877.73],[531.18,877.73],[531.18,877.73],[542.91,882.73],[542.91,882.73],[542.91,882.73],[550.18,890.73],[550.18,890.73],[550.18,890.73],[553.45,897.27],[553.45,897.27],[553.45,897.27],[553.27,901.45],[553.27,901.45],[553.27,901.45],[556.18,905.27],[556.18,905.27],[556.18,905.27],[563.64,904.91],[563.64,904.91],[563.64,904.91],[566.55,908.18],[566.55,908.18],[566.55,908.18],[565.82,914.91],[565.82,914.91],[565.82,914.91],[568.0,917.82],[568.0,917.82],[568.0,917.82],[568.36,921.09],[568.36,921.09],[568.36,921.09],[574.18,924.55],[574.18,924.55],[574.18,924.55],[578.91,930.36],[578.91,930.36],[578.91,930.36],[578.73,934.73],[578.73,934.73],[578.73,934.73],[576.73,937.27],[576.73,937.27],[576.73,937.27],[579.09,942.91],[579.09,942.91],[579.09,942.91],[579.27,947.82],[579.27,947.82],[579.27,947.82],[576.91,950.91],[576.91,950.91],[576.91,950.91],[578.91,963.82],[578.91,963.82],[578.91,963.82],[576.91,969.27],[576.91,969.27],[576.91,969.27],[583.09,980.73],[583.09,980.73],[583.09,980.73],[583.45,984.18],[583.45,984.18],[583.45,984.18],[578.91,988.36],[578.91,988.36],[578.91,988.36],[578.91,992.55],[578.91,992.55],[578.91,992.55],[582.91,997.45],[582.91,997.45],[582.91,997.45],[589.82,997.82],[589.82,997.82],[589.82,997.82],[591.82,1000.36],[591.82,1000.36],[591.82,1000.36],[592.18,1008.18],[592.18,1008.18],[592.18,1008.18],[595.64,1011.82],[595.64,1011.82],[595.64,1011.82],[603.45,1013.09],[603.45,1013.09],[603.45,1013.09],[605.25,1016.0],[605.25,1016.0],[605.25,1016.0],[598.43,1028.52],[598.43,1028.52],[598.43,1028.52],[598.57,1034.3],[598.57,1034.3],[598.57,1034.3],[600.25,1037.12],[600.25,1037.12],[600.25,1037.12],[606.62,1042.69],[606.62,1042.69],[606.62,1042.69],[609.5,1044.44],[609.5,1044.44],[609.5,1044.44],[609.75,1049.69],[609.75,1049.69],[609.75,1049.69],[606.56,1054.06],[606.56,1054.06],[606.56,1054.06],[601.91,1053.45],[601.91,1053.45],[601.91,1053.45],[599.27,1050.82],[599.27,1050.82],[599.27,1050.82],[594.36,1043.27],[594.36,1043.27],[594.36,1043.27],[587.09,1038.45],[587.09,1038.45],[587.09,1038.45],[580.82,1038.45],[580.82,1038.45],[580.82,1038.45],[573.55,1043.36],[573.55,1043.36],[573.55,1043.36],[572.82,1046.18],[572.82,1046.18],[572.82,1046.18],[566.88,1052.56],[566.88,1052.56],[566.88,1052.56],[561.0,1054.31],[561.0,1054.31],[561.0,1054.31],[555.88,1058.0],[555.88,1058.0],[555.88,1058.0],[554.06,1061.0],[554.06,1061.0],[554.06,1061.0],[550.0,1061.64],[550.0,1061.64],[550.0,1061.64],[543.27,1064.91],[543.27,1064.91],[543.27,1064.91],[530.36,1065.64],[530.36,1065.64],[530.36,1065.64],[527.91,1063.83],[527.91,1063.83],[527.91,1063.83],[519.26,1062.0],[519.26,1062.0],[519.26,1062.0],[514.13,1058.22],[514.13,1058.22],[514.13,1058.22],[510.91,1054.26],[510.91,1054.26],[510.91,1054.26],[510.27,1046.09],[510.27,1046.09]]],['selogorod',[[524.62,913.25],[527.27,919.73],[527.27,919.73],[527.27,919.73],[525.64,923.91],[525.64,923.91],[525.64,923.91],[524.64,927.45],[524.64,927.45],[524.64,927.45],[529.09,941.27],[529.09,941.27],[529.09,941.27],[526.45,956.18],[526.45,956.18],[526.45,956.18],[523.36,962.27],[523.36,962.27],[523.36,962.27],[518.82,962.82],[518.82,962.82],[518.82,962.82],[516.82,964.64],[516.82,964.64],[516.82,964.64],[515.64,970.0],[515.64,970.0],[515.64,970.0],[512.36,970.64],[512.36,970.64],[512.36,970.64],[508.45,973.91],[508.45,973.91],[508.45,973.91],[502.55,981.82],[502.55,981.82],[502.55,981.82],[502.55,984.82],[502.55,984.82],[502.55,984.82],[501.27,985.55],[501.27,985.55],[501.27,985.55],[501.36,1003.55],[501.36,1003.55],[501.36,1003.55],[508.27,1016.73],[508.27,1016.73],[508.27,1016.73],[508.91,1020.18],[508.91,1020.18],[508.91,1020.18],[513.64,1026.36],[513.64,1026.36],[513.64,1026.36],[513.55,1038.64],[513.55,1038.64],[513.55,1038.64],[510.55,1043.0],[510.55,1043.0],[510.55,1043.0],[510.27,1046.09],[510.27,1046.09],[510.27,1046.09],[510.91,1054.26],[510.91,1054.26],[510.91,1054.26],[496.12,1052.75],[496.12,1052.75],[496.12,1052.75],[491.25,1049.69],[491.25,1049.69],[491.25,1049.69],[481.0,1049.0],[481.0,1049.0],[481.0,1049.0],[474.25,1045.75],[474.25,1045.75],[474.25,1045.75],[458.31,1045.94],[458.31,1045.94],[458.31,1045.94],[451.38,1047.5],[451.38,1047.5],[451.38,1047.5],[447.56,1050.94],[447.56,1050.94],[447.56,1050.94],[442.81,1060.12],[442.81,1060.12],[442.81,1060.12],[437.44,1062.75],[437.44,1062.75],[437.44,1062.75],[426.31,1062.88],[426.31,1062.88],[426.31,1062.88],[424.38,1061.56],[424.38,1061.56],[424.38,1061.56],[419.25,1061.62],[419.25,1061.62],[419.25,1061.62],[414.19,1065.38],[414.19,1065.38],[414.19,1065.38],[413.94,1070.06],[413.94,1070.06],[413.94,1070.06],[408.5,1075.0],[408.5,1075.0],[408.5,1075.0],[404.25,1075.0],[404.25,1075.0],[404.25,1075.0],[399.0,1076.75],[399.0,1076.75],[399.0,1076.75],[395.73,1080.55],[395.73,1080.55],[395.73,1080.55],[393.09,1077.18],[393.09,1077.18],[393.09,1077.18],[392.36,1071.55],[392.36,1071.55],[392.36,1071.55],[394.0,1063.45],[394.0,1063.45],[394.0,1063.45],[393.91,1045.45],[393.91,1045.45],[393.91,1045.45],[390.55,1038.09],[390.55,1038.09],[390.55,1038.09],[389.91,1032.55],[389.91,1032.55],[389.91,1032.55],[385.18,1021.36],[385.18,1021.36],[385.18,1021.36],[385.18,1014.82],[385.18,1014.82],[385.18,1014.82],[387.09,1008.91],[387.09,1008.91],[387.09,1008.91],[387.36,983.82],[387.36,983.82],[387.36,983.82],[393.27,965.91],[393.27,965.91],[393.27,965.91],[393.82,957.82],[393.82,957.82],[393.82,957.82],[397.69,951.56],[397.69,951.56],[397.69,951.56],[404.12,955.62],[404.12,955.62],[404.12,955.62],[419.5,959.12],[419.5,959.12],[419.5,959.12],[434.62,963.38],[434.62,963.38],[434.62,963.38],[447.12,969.75],[447.12,969.75],[447.12,969.75],[454.5,969.75],[454.5,969.75],[454.5,969.75],[463.0,960.25],[463.0,960.25],[463.0,960.25],[474.62,954.88],[474.62,954.88],[474.62,954.88],[478.88,950.88],[478.88,950.88],[478.88,950.88],[484.0,936.88],[484.0,936.88],[484.0,936.88],[490.0,925.25],[490.0,925.25],[490.0,925.25],[499.38,918.75],[499.38,918.75],[499.38,918.75],[506.25,917.62],[506.25,917.62],[506.25,917.62],[512.0,917.62],[512.0,917.62],[512.0,917.62],[518.56,914.31],[518.56,914.31],[518.56,914.31],[524.62,913.25],[524.62,913.25]]],['sabakumura',[[397.69,951.56],[397.96,948.65],[397.96,948.65],[397.96,948.65],[401.45,940.36],[401.45,940.36],[401.45,940.36],[408.55,932.91],[408.55,932.91],[408.55,932.91],[414.91,917.45],[414.91,917.45],[414.91,917.45],[418.0,902.91],[418.0,902.91],[418.0,902.91],[408.73,889.82],[408.73,889.82],[408.73,889.82],[406.0,881.82],[406.0,881.82],[406.0,881.82],[396.55,871.64],[396.55,871.64],[396.55,871.64],[393.64,863.09],[393.64,863.09],[393.64,863.09],[389.82,857.82],[389.82,857.82],[389.82,857.82],[389.27,849.64],[389.27,849.64],[389.27,849.64],[393.45,848.18],[393.45,848.18],[393.45,848.18],[396.73,840.18],[396.73,840.18],[396.73,840.18],[396.91,834.55],[396.91,834.55],[396.91,834.55],[392.91,826.55],[392.91,826.55],[392.91,826.55],[392.91,821.09],[392.91,821.09],[392.91,821.09],[395.64,812.0],[395.64,812.0],[395.64,812.0],[405.09,805.82],[405.09,805.82],[405.09,805.82],[406.55,800.73],[406.55,800.73],[406.55,800.73],[410.0,796.91],[410.0,796.91],[410.0,796.91],[411.45,792.55],[411.45,792.55],[411.45,792.55],[416.73,786.73],[416.73,786.73],[416.73,786.73],[421.64,786.91],[421.64,786.91],[421.64,786.91],[426.55,791.82],[426.55,791.82],[426.55,791.82],[433.09,791.64],[433.09,791.64],[433.09,791.64],[435.36,789.09],[435.36,789.09],[435.36,789.09],[440.09,793.36],[440.09,793.36],[440.09,793.36],[452.0,794.73],[452.0,794.73],[452.0,794.73],[457.36,801.36],[457.36,801.36],[457.36,801.36],[467.45,805.91],[467.45,805.91],[467.45,805.91],[473.73,804.91],[473.73,804.91],[473.73,804.91],[480.82,798.27],[480.82,798.27],[480.82,798.27],[483.27,796.91],[483.27,796.91],[483.27,796.91],[487.27,797.09],[487.27,797.09],[487.27,797.09],[493.27,792.73],[493.27,792.73],[493.27,792.73],[495.73,793.27],[495.73,793.27],[495.73,793.27],[505.18,804.73],[505.18,804.73],[505.18,804.73],[503.27,817.55],[503.27,817.55],[503.27,817.55],[504.18,820.09],[504.18,820.09],[504.18,820.09],[507.0,820.45],[507.0,820.45],[507.0,820.45],[491.36,841.27],[491.36,841.27],[491.36,841.27],[491.64,852.36],[491.64,852.36],[491.64,852.36],[488.82,856.45],[488.82,856.45],[488.82,856.45],[489.18,859.18],[489.18,859.18],[489.18,859.18],[494.27,862.09],[494.27,862.09],[494.27,862.09],[498.73,861.64],[498.73,861.64],[498.73,861.64],[502.55,857.91],[502.55,857.91],[502.55,857.91],[505.27,858.0],[505.27,858.0],[505.27,858.0],[508.36,861.09],[508.36,861.09],[508.36,861.09],[515.45,861.45],[515.45,861.45],[515.45,861.45],[517.0,865.91],[517.0,865.91],[517.0,865.91],[515.0,870.0],[515.0,870.0],[515.0,870.0],[516.91,872.18],[516.91,872.18],[516.91,872.18],[516.31,876.88],[516.31,876.88],[516.31,876.88],[518.12,879.69],[518.12,879.69],[518.12,879.69],[523.88,885.81],[523.88,885.81],[523.88,885.81],[524.31,890.75],[524.31,890.75],[524.31,890.75],[521.06,899.38],[521.06,899.38],[521.06,899.38],[524.75,908.31],[524.75,908.31],[524.75,908.31],[524.62,913.25],[524.62,913.25],[524.62,913.25],[518.56,914.31],[518.56,914.31],[518.56,914.31],[512.0,917.62],[512.0,917.62],[512.0,917.62],[506.25,917.62],[506.25,917.62],[506.25,917.62],[499.38,918.75],[499.38,918.75],[499.38,918.75],[490.0,925.25],[490.0,925.25],[490.0,925.25],[484.0,936.88],[484.0,936.88],[484.0,936.88],[478.88,950.88],[478.88,950.88],[478.88,950.88],[474.62,954.88],[474.62,954.88],[474.62,954.88],[463.0,960.25],[463.0,960.25],[463.0,960.25],[454.5,969.75],[454.5,969.75],[454.5,969.75],[447.12,969.75],[447.12,969.75],[447.12,969.75],[434.62,963.38],[434.62,963.38],[434.62,963.38],[419.5,959.12],[419.5,959.12],[419.5,959.12],[404.12,955.62],[404.12,955.62],[404.12,955.62],[397.69,951.56],[397.69,951.56]]],['kire',[[434.75,784.25],[426.38,772.5],[426.38,772.5],[426.38,772.5],[422.5,771.62],[422.5,771.62],[422.5,771.62],[421.0,768.25],[421.0,768.25],[421.0,768.25],[422.0,764.75],[422.0,764.75],[422.0,764.75],[414.12,756.25],[414.12,756.25],[414.12,756.25],[413.12,751.25],[413.12,751.25],[413.12,751.25],[422.38,746.62],[422.38,746.62],[422.38,746.62],[426.0,738.5],[426.0,738.5],[426.0,738.5],[429.75,733.0],[429.75,733.0],[429.75,733.0],[429.38,723.12],[429.38,723.12],[429.38,723.12],[443.5,707.69],[443.5,707.69],[443.5,707.69],[443.69,704.38],[443.69,704.38],[443.69,704.38],[433.38,703.5],[433.38,703.5],[433.38,703.5],[430.12,698.56],[430.12,698.56],[430.12,698.56],[433.44,694.31],[433.44,694.31],[433.44,694.31],[433.56,689.31],[433.56,689.31],[433.56,689.31],[431.69,688.94],[431.69,688.94],[431.69,688.94],[427.69,683.62],[427.69,683.62],[427.69,683.62],[425.62,684.5],[425.62,684.5],[425.62,684.5],[425.25,680.88],[425.25,680.88],[425.25,680.88],[428.12,679.38],[428.12,679.38],[428.12,679.38],[434.25,681.38],[434.25,681.38],[434.25,681.38],[442.62,679.5],[442.62,679.5],[442.62,679.5],[448.88,675.62],[448.88,675.62],[448.88,675.62],[449.12,667.25],[449.12,667.25],[449.12,667.25],[452.38,662.88],[452.38,662.88],[452.38,662.88],[458.88,662.62],[458.88,662.62],[458.88,662.62],[465.25,659.62],[465.25,659.62],[465.25,659.62],[464.38,650.38],[464.38,650.38],[464.38,650.38],[475.88,640.5],[475.88,640.5],[475.88,640.5],[485.75,637.38],[485.75,637.38],[485.75,637.38],[489.75,632.75],[489.75,632.75],[489.75,632.75],[494.88,631.5],[494.88,631.5],[494.88,631.5],[503.12,625.25],[503.12,625.25],[503.12,625.25],[511.75,626.12],[511.75,626.12],[511.75,626.12],[515.75,630.25],[515.75,630.25],[515.75,630.25],[525.38,632.12],[525.38,632.12],[525.38,632.12],[527.38,635.12],[527.38,635.12],[527.38,635.12],[533.12,636.0],[533.12,636.0],[533.12,636.0],[537.88,636.0],[537.88,636.0],[537.88,636.0],[547.38,630.25],[547.38,630.25],[547.38,630.25],[554.73,630.0],[554.73,630.0],[554.73,630.0],[560.0,632.36],[560.0,632.36],[560.0,632.36],[567.64,632.55],[567.64,632.55],[567.64,632.55],[570.45,634.64],[570.45,634.64],[570.45,634.64],[581.39,633.0],[581.39,633.0],[581.39,633.0],[586.18,629.82],[586.18,629.82],[586.18,629.82],[589.55,643.0],[589.55,643.0],[589.55,643.0],[589.27,651.45],[589.27,651.45],[589.27,651.45],[584.36,657.0],[584.36,657.0],[584.36,657.0],[581.55,667.64],[581.55,667.64],[581.55,667.64],[575.45,674.27],[575.45,674.27],[575.45,674.27],[575.18,675.82],[575.18,675.82],[575.18,675.82],[570.09,681.09],[570.09,681.09],[570.09,681.09],[565.73,681.27],[565.73,681.27],[565.73,681.27],[563.82,682.82],[563.82,682.82],[563.82,682.82],[563.82,688.27],[563.82,688.27],[563.82,688.27],[557.36,694.55],[557.36,694.55],[557.36,694.55],[552.55,696.45],[552.55,696.45],[552.55,696.45],[548.64,699.91],[548.64,699.91],[548.64,699.91],[547.55,704.0],[547.55,704.0],[547.55,704.0],[540.73,711.45],[540.73,711.45],[540.73,711.45],[533.5,724.25],[533.5,724.25],[533.5,724.25],[528.62,738.75],[528.62,738.75],[528.62,738.75],[530.0,748.0],[530.0,748.0],[530.0,748.0],[529.12,752.25],[529.12,752.25],[529.12,752.25],[527.5,753.62],[527.5,753.62],[527.5,753.62],[523.25,755.0],[523.25,755.0],[523.25,755.0],[523.62,762.88],[523.62,762.88],[523.62,762.88],[519.0,770.5],[519.0,770.5],[519.0,770.5],[518.38,783.25],[518.38,783.25],[518.38,783.25],[516.5,788.5],[516.5,788.5],[516.5,788.5],[516.88,797.75],[516.88,797.75],[516.88,797.75],[518.12,800.88],[518.12,800.88],[518.12,800.88],[516.88,806.62],[516.88,806.62],[516.88,806.62],[510.0,811.75],[510.0,811.75],[510.0,811.75],[507.0,820.45],[507.0,820.45],[507.0,820.45],[504.18,820.09],[504.18,820.09],[504.18,820.09],[503.27,817.55],[503.27,817.55],[503.27,817.55],[505.18,804.73],[505.18,804.73],[505.18,804.73],[495.73,793.27],[495.73,793.27],[495.73,793.27],[493.27,792.73],[493.27,792.73],[493.27,792.73],[487.27,797.09],[487.27,797.09],[487.27,797.09],[483.27,796.91],[483.27,796.91],[483.27,796.91],[480.82,798.27],[480.82,798.27],[480.82,798.27],[473.73,804.91],[473.73,804.91],[473.73,804.91],[467.45,805.91],[467.45,805.91],[467.45,805.91],[457.36,801.36],[457.36,801.36],[457.36,801.36],[452.0,794.73],[452.0,794.73],[452.0,794.73],[440.09,793.36],[440.09,793.36],[440.09,793.36],[435.36,789.09],[435.36,789.09],[435.36,789.09],[434.75,784.25],[434.75,784.25]]],['caldera',[[425.27,687.36],[422.09,690.73],[422.09,690.73],[422.09,690.73],[420.0,690.18],[420.0,690.18],[420.0,690.18],[416.82,684.55],[416.82,684.55],[416.82,684.55],[410.36,682.55],[410.36,682.55],[410.36,682.55],[403.27,677.18],[403.27,677.18],[403.27,677.18],[400.45,672.36],[400.45,672.36],[400.45,672.36],[390.91,664.18],[390.91,664.18],[390.91,664.18],[390.64,659.82],[390.64,659.82],[390.64,659.82],[383.82,652.91],[383.82,652.91],[383.82,652.91],[384.0,650.45],[384.0,650.45],[384.0,650.45],[381.0,645.33],[381.0,645.33],[381.0,645.33],[380.91,529.04],[380.91,529.04],[380.91,529.04],[387.26,523.87],[387.26,523.87],[387.26,523.87],[387.87,520.83],[387.87,520.83],[387.87,520.83],[394.0,514.36],[394.0,514.36],[394.0,514.36],[394.55,511.64],[394.55,511.64],[394.55,511.64],[397.64,509.64],[397.64,509.64],[397.64,509.64],[400.91,507.27],[400.91,507.27],[400.91,507.27],[401.27,499.27],[401.27,499.27],[401.27,499.27],[403.82,496.91],[403.82,496.91],[403.82,496.91],[408.73,489.27],[408.73,489.27],[408.73,489.27],[409.18,481.82],[409.18,481.82],[409.18,481.82],[416.18,485.45],[416.18,485.45],[416.18,485.45],[420.45,483.27],[420.45,483.27],[420.45,483.27],[420.45,478.82],[420.45,478.82],[420.45,478.82],[422.0,476.18],[422.0,476.18],[422.0,476.18],[434.73,476.0],[434.73,476.0],[434.73,476.0],[438.91,473.0],[438.91,473.0],[438.91,473.0],[439.36,469.55],[439.36,469.55],[439.36,469.55],[448.36,460.73],[448.36,460.73],[448.36,460.73],[453.18,452.82],[453.18,452.82],[453.18,452.82],[463.09,453.45],[463.09,453.45],[463.09,453.45],[465.45,455.09],[465.45,455.09],[465.45,455.09],[465.55,460.82],[465.55,460.82],[465.55,460.82],[471.45,462.0],[471.45,462.0],[471.45,462.0],[479.0,465.73],[479.0,465.73],[479.0,465.73],[491.82,477.73],[491.82,477.73],[491.82,477.73],[495.18,478.73],[495.18,478.73],[495.18,478.73],[496.55,474.73],[496.55,474.73],[496.55,474.73],[501.36,475.0],[501.36,475.0],[501.36,475.0],[508.36,481.82],[508.36,481.82],[508.36,481.82],[511.18,486.91],[511.18,486.91],[511.18,486.91],[518.38,491.12],[518.38,491.12],[518.38,491.12],[516.88,495.12],[516.88,495.12],[516.88,495.12],[517.62,498.62],[517.62,498.62],[517.62,498.62],[528.38,507.75],[528.38,507.75],[528.38,507.75],[528.5,513.5],[528.5,513.5],[528.5,513.5],[523.88,513.75],[523.88,513.75],[523.88,513.75],[520.5,516.5],[520.5,516.5],[520.5,516.5],[520.5,523.25],[520.5,523.25],[520.5,523.25],[516.38,525.75],[516.38,525.75],[516.38,525.75],[515.5,533.38],[515.5,533.38],[515.5,533.38],[502.0,542.12],[502.0,542.12],[502.0,542.12],[500.38,544.38],[500.38,544.38],[500.38,544.38],[496.25,547.0],[496.25,547.0],[496.25,547.0],[496.12,550.38],[496.12,550.38],[496.12,550.38],[498.5,554.75],[498.5,554.75],[498.5,554.75],[497.88,562.0],[497.88,562.0],[497.88,562.0],[493.75,567.88],[493.75,567.88],[493.75,567.88],[494.0,572.0],[494.0,572.0],[494.0,572.0],[495.25,573.0],[495.25,573.0],[495.25,573.0],[500.62,573.62],[500.62,573.62],[500.62,573.62],[506.38,571.0],[506.38,571.0],[506.38,571.0],[511.25,572.0],[511.25,572.0],[511.25,572.0],[514.38,574.75],[514.38,574.75],[514.38,574.75],[515.0,580.88],[515.0,580.88],[515.0,580.88],[516.38,584.62],[516.38,584.62],[516.38,584.62],[520.38,586.62],[520.38,586.62],[520.38,586.62],[527.25,588.38],[527.25,588.38],[527.25,588.38],[530.0,592.62],[530.0,592.62],[530.0,592.62],[530.0,599.38],[530.0,599.38],[530.0,599.38],[527.75,606.5],[527.75,606.5],[527.75,606.5],[527.88,614.12],[527.88,614.12],[527.88,614.12],[533.12,619.38],[533.12,619.38],[533.12,619.38],[534.38,625.62],[534.38,625.62],[534.38,625.62],[533.12,636.0],[533.12,636.0],[533.12,636.0],[527.38,635.12],[527.38,635.12],[527.38,635.12],[525.38,632.12],[525.38,632.12],[525.38,632.12],[515.75,630.25],[515.75,630.25],[515.75,630.25],[511.75,626.12],[511.75,626.12],[511.75,626.12],[503.12,625.25],[503.12,625.25],[503.12,625.25],[494.88,631.5],[494.88,631.5],[494.88,631.5],[489.75,632.75],[489.75,632.75],[489.75,632.75],[485.75,637.38],[485.75,637.38],[485.75,637.38],[475.88,640.5],[475.88,640.5],[475.88,640.5],[464.38,650.38],[464.38,650.38],[464.38,650.38],[465.25,659.62],[465.25,659.62],[465.25,659.62],[458.88,662.62],[458.88,662.62],[458.88,662.62],[452.38,662.88],[452.38,662.88],[452.38,662.88],[449.12,667.25],[449.12,667.25],[449.12,667.25],[448.88,675.62],[448.88,675.62],[448.88,675.62],[442.62,679.5],[442.62,679.5],[442.62,679.5],[434.25,681.38],[434.25,681.38],[434.25,681.38],[428.12,679.38],[428.12,679.38],[428.12,679.38],[425.25,680.88],[425.25,680.88],[425.25,680.88],[425.62,684.5],[425.62,684.5],[425.62,684.5],[425.27,687.36],[425.27,687.36]]],['alleron',[[606.62,453.88],[602.25,459.0],[602.25,459.0],[602.25,459.0],[598.12,459.88],[598.12,459.88],[598.12,459.88],[593.38,463.62],[593.38,463.62],[593.38,463.62],[593.25,468.88],[593.25,468.88],[593.25,468.88],[589.75,475.88],[589.75,475.88],[589.75,475.88],[584.88,479.62],[584.88,479.62],[584.88,479.62],[581.25,480.0],[581.25,480.0],[581.25,480.0],[574.62,482.5],[574.62,482.5],[574.62,482.5],[572.0,486.5],[572.0,486.5],[572.0,486.5],[568.25,488.75],[568.25,488.75],[568.25,488.75],[564.12,489.12],[564.12,489.12],[564.12,489.12],[559.62,491.25],[559.62,491.25],[559.62,491.25],[549.12,491.12],[549.12,491.12],[549.12,491.12],[544.88,490.12],[544.88,490.12],[544.88,490.12],[538.5,492.25],[538.5,492.25],[538.5,492.25],[534.62,489.12],[534.62,489.12],[534.62,489.12],[529.38,489.25],[529.38,489.25],[529.38,489.25],[525.5,491.12],[525.5,491.12],[525.5,491.12],[518.38,491.12],[518.38,491.12],[518.38,491.12],[511.18,486.91],[511.18,486.91],[511.18,486.91],[508.36,481.82],[508.36,481.82],[508.36,481.82],[501.36,475.0],[501.36,475.0],[501.36,475.0],[496.55,474.73],[496.55,474.73],[496.55,474.73],[495.18,478.73],[495.18,478.73],[495.18,478.73],[491.82,477.73],[491.82,477.73],[491.82,477.73],[479.0,465.73],[479.0,465.73],[479.0,465.73],[471.45,462.0],[471.45,462.0],[471.45,462.0],[465.55,460.82],[465.55,460.82],[465.55,460.82],[465.45,455.09],[465.45,455.09],[465.45,455.09],[463.09,453.45],[463.09,453.45],[463.09,453.45],[453.18,452.82],[453.18,452.82],[453.18,452.82],[448.36,460.73],[448.36,460.73],[448.36,460.73],[439.36,469.55],[439.36,469.55],[439.36,469.55],[438.91,473.0],[438.91,473.0],[438.91,473.0],[434.73,476.0],[434.73,476.0],[434.73,476.0],[422.0,476.18],[422.0,476.18],[422.0,476.18],[420.45,478.82],[420.45,478.82],[420.45,478.82],[420.45,483.27],[420.45,483.27],[420.45,483.27],[416.18,485.45],[416.18,485.45],[416.18,485.45],[409.18,481.82],[409.18,481.82],[409.18,481.82],[405.06,471.0],[405.06,471.0],[405.06,471.0],[405.06,466.81],[405.06,466.81],[405.06,466.81],[402.19,461.0],[402.19,461.0],[402.19,461.0],[402.56,454.62],[402.56,454.62],[402.56,454.62],[411.88,443.69],[411.88,443.69],[411.88,443.69],[411.44,438.06],[411.44,438.06],[411.44,438.06],[403.69,426.5],[403.69,426.5],[403.69,426.5],[403.69,414.19],[403.69,414.19],[403.69,414.19],[406.5,408.88],[406.5,408.88],[406.5,408.88],[406.56,401.0],[406.56,401.0],[406.56,401.0],[402.06,392.88],[402.06,392.88],[402.06,392.88],[407.44,382.0],[407.44,382.0],[407.44,382.0],[409.81,371.88],[409.81,371.88],[409.81,371.88],[409.94,358.44],[409.94,358.44],[409.94,358.44],[416.5,348.38],[416.5,348.38],[416.5,348.38],[417.06,338.25],[417.06,338.25],[417.06,338.25],[419.44,334.81],[419.44,334.81],[419.44,334.81],[428.44,330.69],[428.44,330.69],[428.44,330.69],[435.62,324.62],[435.62,324.62],[435.62,324.62],[441.88,324.25],[441.88,324.25],[441.88,324.25],[447.31,317.25],[447.31,317.25],[447.31,317.25],[450.75,315.88],[450.75,315.88],[450.75,315.88],[463.75,315.88],[463.75,315.88],[463.75,315.88],[467.38,309.5],[467.38,309.5],[467.38,309.5],[469.62,308.75],[469.62,308.75],[469.62,308.75],[471.38,305.62],[471.38,305.62],[471.38,305.62],[477.75,301.25],[477.75,301.25],[477.75,301.25],[479.5,294.38],[479.5,294.38],[479.5,294.38],[483.62,294.38],[483.62,294.38],[483.62,294.38],[487.0,297.25],[487.0,297.25],[487.0,297.25],[491.75,297.5],[491.75,297.5],[491.75,297.5],[497.0,292.88],[497.0,292.88],[497.0,292.88],[499.0,292.88],[499.0,292.88],[499.0,292.88],[499.62,290.25],[499.62,290.25],[499.62,290.25],[503.88,290.0],[503.88,290.0],[503.88,290.0],[508.06,291.44],[508.06,291.44],[508.06,291.44],[515.88,291.44],[515.88,291.44],[515.88,291.44],[523.82,285.82],[523.82,285.82],[523.82,285.82],[528.55,287.27],[528.55,287.27],[528.55,287.27],[530.91,291.27],[530.91,291.27],[530.91,291.27],[537.45,292.18],[537.45,292.18],[537.45,292.18],[542.91,295.64],[542.91,295.64],[542.91,295.64],[545.27,303.27],[545.27,303.27],[545.27,303.27],[549.82,309.45],[549.82,309.45],[549.82,309.45],[552.91,309.27],[552.91,309.27],[552.91,309.27],[554.04,310.26],[554.04,310.26],[554.04,310.26],[559.87,311.17],[559.87,311.17],[559.87,311.17],[560.18,314.18],[560.18,314.18],[560.18,314.18],[568.36,324.0],[568.36,324.0],[568.36,324.0],[573.45,325.09],[573.45,325.09],[573.45,325.09],[576.91,324.18],[576.91,324.18],[576.91,324.18],[581.27,325.09],[581.27,325.09],[581.27,325.09],[587.0,332.12],[587.0,332.12],[587.0,332.12],[590.88,333.25],[590.88,333.25],[590.88,333.25],[591.75,335.38],[591.75,335.38],[591.75,335.38],[596.12,335.62],[596.12,335.62],[596.12,335.62],[598.12,337.75],[598.12,337.75],[598.12,337.75],[598.75,344.12],[598.75,344.12],[598.75,344.12],[601.0,344.75],[601.0,344.75],[601.0,344.75],[604.88,348.75],[604.88,348.75],[604.88,348.75],[618.62,354.88],[618.62,354.88],[618.62,354.88],[628.0,354.82],[628.0,354.82],[628.0,354.82],[627.12,360.25],[627.12,360.25],[627.12,360.25],[623.0,366.88],[623.0,366.88],[623.0,366.88],[626.12,379.12],[626.12,379.12],[626.12,379.12],[629.12,384.5],[629.12,384.5],[629.12,384.5],[628.88,390.38],[628.88,390.38],[628.88,390.38],[624.5,397.12],[624.5,397.12],[624.5,397.12],[618.62,402.38],[618.62,402.38],[618.62,402.38],[617.5,412.88],[617.5,412.88],[617.5,412.88],[615.88,417.12],[615.88,417.12],[615.88,417.12],[610.88,422.38],[610.88,422.38],[610.88,422.38],[611.38,442.75],[611.38,442.75],[611.38,442.75],[609.62,446.5],[609.62,446.5]]],['canon',[[553.88,307.22],[554.75,302.12],[554.75,302.12],[554.75,302.12],[557.75,287.12],[557.75,287.12],[557.75,287.12],[563.12,275.88],[563.12,275.88],[563.12,275.88],[571.5,269.12],[571.5,269.12],[571.5,269.12],[577.25,263.25],[577.25,263.25],[577.25,263.25],[577.25,257.0],[577.25,257.0],[577.25,257.0],[578.12,253.88],[578.12,253.88],[578.12,253.88],[582.88,249.0],[582.88,249.0],[582.88,249.0],[582.88,243.62],[582.88,243.62],[582.88,243.62],[585.12,240.12],[585.12,240.12],[585.12,240.12],[589.62,240.0],[589.62,240.0],[589.62,240.0],[592.25,241.75],[592.25,241.75],[592.25,241.75],[595.75,242.12],[595.75,242.12],[595.75,242.12],[599.75,238.75],[599.75,238.75],[599.75,238.75],[603.38,238.62],[603.38,238.62],[603.38,238.62],[606.88,240.25],[606.88,240.25],[606.88,240.25],[609.25,240.38],[609.25,240.38],[609.25,240.38],[617.25,245.75],[617.25,245.75],[617.25,245.75],[631.27,245.09],[631.27,245.09],[631.27,245.09],[634.36,247.64],[634.36,247.64],[634.36,247.64],[637.64,248.18],[637.64,248.18],[637.64,248.18],[639.09,251.27],[639.09,251.27],[639.09,251.27],[637.09,254.36],[637.09,254.36],[637.09,254.36],[639.27,257.27],[639.27,257.27],[639.27,257.27],[642.91,257.27],[642.91,257.27],[642.91,257.27],[644.73,262.91],[644.73,262.91],[644.73,262.91],[647.64,265.27],[647.64,265.27],[647.64,265.27],[653.27,261.64],[653.27,261.64],[653.27,261.64],[655.82,261.64],[655.82,261.64],[655.82,261.64],[656.73,267.64],[656.73,267.64],[656.73,267.64],[662.25,275.88],[662.25,275.88],[662.25,275.88],[662.5,278.12],[662.5,278.12],[662.5,278.12],[669.12,287.38],[669.12,287.38],[669.12,287.38],[669.12,298.25],[669.12,298.25],[669.12,298.25],[672.27,305.82],[672.27,305.82],[672.27,305.82],[669.88,311.75],[669.88,311.75],[669.88,311.75],[665.5,315.62],[665.5,315.62],[665.5,315.62],[660.75,328.12],[660.75,328.12],[660.75,328.12],[653.88,335.75],[653.88,335.75],[653.88,335.75],[651.0,336.38],[651.0,336.38],[651.0,336.38],[648.5,335.12],[648.5,335.12],[648.5,335.12],[638.88,338.0],[638.88,338.0],[638.88,338.0],[633.62,342.25],[633.62,342.25],[633.62,342.25],[632.62,345.0],[632.62,345.0],[632.62,345.0],[630.25,345.25],[630.25,345.25],[630.25,345.25],[628.0,350.12],[628.0,350.12],[628.0,350.12],[628.0,354.82],[628.0,354.82],[628.0,354.82],[618.62,354.88],[618.62,354.88],[618.62,354.88],[604.88,348.75],[604.88,348.75],[604.88,348.75],[601.0,344.75],[601.0,344.75],[601.0,344.75],[598.75,344.12],[598.75,344.12],[598.75,344.12],[598.12,337.75],[598.12,337.75],[598.12,337.75],[596.12,335.62],[596.12,335.62],[596.12,335.62],[591.75,335.38],[591.75,335.38],[591.75,335.38],[590.88,333.25],[590.88,333.25],[590.88,333.25],[587.0,332.12],[587.0,332.12],[587.0,332.12],[581.27,325.09],[581.27,325.09],[581.27,325.09],[576.91,324.18],[576.91,324.18],[576.91,324.18],[573.45,325.09],[573.45,325.09],[573.45,325.09],[568.36,324.0],[568.36,324.0],[568.36,324.0],[560.18,314.18],[560.18,314.18],[560.18,314.18],[559.87,311.17],[559.87,311.17],[559.87,311.17],[554.04,310.26],[554.04,310.26],[554.04,310.26],[552.91,309.27],[552.91,309.27],[552.91,309.27],[553.88,307.22],[553.88,307.22]]],['flyaway',[[611.82,238.64],[612.0,234.45],[612.0,234.45],[612.0,234.45],[620.18,230.91],[620.18,230.91],[620.18,230.91],[629.55,226.0],[629.55,226.0],[629.55,226.0],[635.27,218.82],[635.27,218.82],[635.27,218.82],[639.73,204.82],[639.73,204.82],[639.73,204.82],[652.45,195.55],[652.45,195.55],[652.45,195.55],[656.18,189.36],[656.18,189.36],[656.18,189.36],[663.64,183.55],[663.64,183.55],[663.64,183.55],[668.09,183.09],[668.09,183.09],[668.09,183.09],[671.55,188.45],[671.55,188.45],[671.55,188.45],[675.36,188.73],[675.36,188.73],[675.36,188.73],[680.0,183.09],[680.0,183.09],[680.0,183.09],[685.73,185.0],[685.73,185.0],[685.73,185.0],[702.27,181.91],[702.27,181.91],[702.27,181.91],[709.45,182.0],[709.45,182.0],[709.45,182.0],[713.0,183.91],[713.0,183.91],[713.0,183.91],[713.09,190.09],[713.09,190.09],[713.09,190.09],[714.64,191.64],[714.64,191.64],[714.64,191.64],[724.36,193.09],[724.36,193.09],[724.36,193.09],[731.45,189.91],[731.45,189.91],[731.45,189.91],[735.73,192.73],[735.73,192.73],[735.73,192.73],[743.64,196.27],[743.64,196.27],[743.64,196.27],[744.64,199.91],[744.64,199.91],[744.64,199.91],[756.64,199.82],[756.64,199.82],[756.64,199.82],[761.91,197.09],[761.91,197.09],[761.91,197.09],[764.64,191.73],[764.64,191.73],[764.64,191.73],[766.55,192.09],[766.55,192.09],[766.55,192.09],[774.0,203.0],[774.0,203.0],[774.0,203.0],[773.55,206.09],[773.55,206.09],[773.55,206.09],[769.36,212.91],[769.36,212.91],[769.36,212.91],[769.27,216.73],[769.27,216.73],[769.27,216.73],[767.73,218.64],[767.73,218.64],[767.73,218.64],[767.64,223.73],[767.64,223.73],[767.64,223.73],[769.82,227.18],[769.82,227.18],[769.82,227.18],[769.64,231.82],[769.64,231.82],[769.64,231.82],[764.82,239.64],[764.82,239.64],[764.82,239.64],[764.73,243.55],[764.73,243.55],[764.73,243.55],[770.45,249.27],[770.45,249.27],[770.45,249.27],[770.62,256.62],[770.62,256.62],[770.62,256.62],[768.12,260.62],[768.12,260.62],[768.12,260.62],[768.75,264.5],[768.75,264.5],[768.75,264.5],[775.0,271.38],[775.0,271.38],[775.0,271.38],[773.75,275.0],[773.75,275.0],[773.75,275.0],[771.25,278.0],[771.25,278.0],[771.25,278.0],[768.75,278.62],[768.75,278.62],[768.75,278.62],[764.75,285.38],[764.75,285.38],[764.75,285.38],[764.5,287.88],[764.5,287.88],[764.5,287.88],[759.52,285.65],[759.52,285.65],[759.52,285.65],[755.78,285.3],[755.78,285.3],[755.78,285.3],[749.26,290.96],[749.26,290.96],[749.26,290.96],[739.91,290.73],[739.91,290.73],[739.91,290.73],[733.36,295.18],[733.36,295.18],[733.36,295.18],[731.91,299.18],[731.91,299.18],[731.91,299.18],[727.0,303.73],[727.0,303.73],[727.0,303.73],[708.64,305.27],[708.64,305.27],[708.64,305.27],[705.64,307.55],[705.64,307.55],[705.64,307.55],[698.36,307.82],[698.36,307.82],[698.36,307.82],[694.64,305.91],[694.64,305.91],[694.64,305.91],[689.91,305.09],[689.91,305.09],[689.91,305.09],[686.82,305.91],[686.82,305.91],[686.82,305.91],[672.27,305.82],[672.27,305.82],[672.27,305.82],[669.12,298.25],[669.12,298.25],[669.12,298.25],[669.12,287.38],[669.12,287.38],[669.12,287.38],[662.5,278.12],[662.5,278.12],[662.5,278.12],[662.25,275.88],[662.25,275.88],[662.25,275.88],[656.73,267.64],[656.73,267.64],[656.73,267.64],[655.82,261.64],[655.82,261.64],[655.82,261.64],[653.27,261.64],[653.27,261.64],[653.27,261.64],[647.64,265.27],[647.64,265.27],[647.64,265.27],[644.73,262.91],[644.73,262.91],[644.73,262.91],[642.91,257.27],[642.91,257.27],[642.91,257.27],[639.27,257.27],[639.27,257.27],[639.27,257.27],[637.09,254.36],[637.09,254.36],[637.09,254.36],[639.09,251.27],[639.09,251.27],[639.09,251.27],[637.64,248.18],[637.64,248.18],[637.64,248.18],[634.36,247.64],[634.36,247.64],[634.36,247.64],[631.27,245.09],[631.27,245.09],[631.27,245.09],[617.25,245.75],[617.25,245.75],[617.25,245.75],[609.25,240.38],[609.25,240.38],[609.25,240.38],[611.82,238.64],[611.82,238.64]]],['sabbia',[[704.64,395.27],[705.36,392.36],[705.36,392.36],[705.36,392.36],[702.55,389.82],[702.55,389.82],[702.55,389.82],[702.0,382.82],[702.0,382.82],[702.0,382.82],[699.73,380.73],[699.73,380.73],[699.73,380.73],[696.27,380.91],[696.27,380.91],[696.27,380.91],[693.36,381.73],[693.36,381.73],[693.36,381.73],[685.45,381.36],[685.45,381.36],[685.45,381.36],[683.55,378.0],[683.55,378.0],[683.55,378.0],[680.0,377.27],[680.0,377.27],[680.0,377.27],[677.82,375.0],[677.82,375.0],[677.82,375.0],[672.09,374.64],[672.09,374.64],[672.09,374.64],[662.82,377.91],[662.82,377.91],[662.82,377.91],[655.82,377.82],[655.82,377.82],[655.82,377.82],[645.18,361.64],[645.18,361.64],[645.18,361.64],[641.82,358.82],[641.82,358.82],[641.82,358.82],[637.09,358.45],[637.09,358.45],[637.09,358.45],[634.18,355.55],[634.18,355.55],[634.18,355.55],[628.0,354.82],[628.0,354.82],[628.0,354.82],[628.0,350.12],[628.0,350.12],[628.0,350.12],[630.25,345.25],[630.25,345.25],[630.25,345.25],[632.62,345.0],[632.62,345.0],[632.62,345.0],[633.62,342.25],[633.62,342.25],[633.62,342.25],[638.88,338.0],[638.88,338.0],[638.88,338.0],[648.5,335.12],[648.5,335.12],[648.5,335.12],[651.0,336.38],[651.0,336.38],[651.0,336.38],[653.88,335.75],[653.88,335.75],[653.88,335.75],[660.75,328.12],[660.75,328.12],[660.75,328.12],[665.5,315.62],[665.5,315.62],[665.5,315.62],[669.88,311.75],[669.88,311.75],[669.88,311.75],[672.27,305.82],[672.27,305.82],[672.27,305.82],[686.82,305.91],[686.82,305.91],[686.82,305.91],[689.91,305.09],[689.91,305.09],[689.91,305.09],[694.64,305.91],[694.64,305.91],[694.64,305.91],[698.36,307.82],[698.36,307.82],[698.36,307.82],[705.64,307.55],[705.64,307.55],[705.64,307.55],[708.64,305.27],[708.64,305.27],[708.64,305.27],[727.0,303.73],[727.0,303.73],[727.0,303.73],[731.91,299.18],[731.91,299.18],[731.91,299.18],[733.36,295.18],[733.36,295.18],[733.36,295.18],[739.91,290.73],[739.91,290.73],[739.91,290.73],[749.26,290.96],[749.26,290.96],[749.26,290.96],[755.78,285.3],[755.78,285.3],[755.78,285.3],[759.52,285.65],[759.52,285.65],[759.52,285.65],[764.5,287.88],[764.5,287.88],[764.5,287.88],[764.81,292.0],[764.81,292.0],[764.81,292.0],[766.19,293.81],[766.19,293.81],[766.19,293.81],[762.38,303.62],[762.38,303.62],[762.38,303.62],[762.25,308.12],[762.25,308.12],[762.25,308.12],[754.75,320.25],[754.75,320.25],[754.75,320.25],[754.5,332.25],[754.5,332.25],[754.5,332.25],[752.38,335.0],[752.38,335.0],[752.38,335.0],[751.5,345.88],[751.5,345.88],[751.5,345.88],[746.88,350.38],[746.88,350.38],[746.88,350.38],[743.75,351.38],[743.75,351.38],[743.75,351.38],[738.88,357.25],[738.88,357.25],[738.88,357.25],[734.62,357.88],[734.62,357.88],[734.62,357.88],[731.5,361.12],[731.5,361.12],[731.5,361.12],[735.0,368.12],[735.0,368.12],[735.0,368.12],[735.0,374.25],[735.0,374.25],[735.0,374.25],[733.75,376.38],[733.75,376.38],[733.75,376.38],[734.12,380.12],[734.12,380.12],[734.12,380.12],[740.75,391.62],[740.75,391.62],[740.75,391.62],[739.25,393.25],[739.25,393.25],[739.25,393.25],[737.25,393.38],[737.25,393.38],[737.25,393.38],[734.38,396.0],[734.38,396.0],[734.38,396.0],[722.0,396.5],[722.0,396.5],[722.0,396.5],[716.62,398.88],[716.62,398.88],[716.62,398.88],[712.12,399.62],[712.12,399.62],[712.12,399.62],[704.64,395.27],[704.64,395.27]]],['naufrage',[[628.0,354.82],[627.12,360.25],[627.12,360.25],[627.12,360.25],[623.0,366.88],[623.0,366.88],[623.0,366.88],[626.12,379.12],[626.12,379.12],[626.12,379.12],[629.12,384.5],[629.12,384.5],[629.12,384.5],[628.88,390.38],[628.88,390.38],[628.88,390.38],[624.5,397.12],[624.5,397.12],[624.5,397.12],[618.62,402.38],[618.62,402.38],[618.62,402.38],[617.5,412.88],[617.5,412.88],[617.5,412.88],[615.88,417.12],[615.88,417.12],[615.88,417.12],[610.88,422.38],[610.88,422.38],[610.88,422.38],[611.38,442.75],[611.38,442.75],[611.38,442.75],[609.62,446.5],[609.62,446.5],[609.62,446.5],[613.88,446.62],[613.88,446.62],[613.88,446.62],[621.12,454.38],[621.12,454.38],[621.12,454.38],[619.88,460.0],[619.88,460.0],[619.88,460.0],[622.62,465.38],[622.62,465.38],[622.62,465.38],[621.75,470.25],[621.75,470.25],[621.75,470.25],[625.12,474.0],[625.12,474.0],[625.12,474.0],[630.5,472.38],[630.5,472.38],[630.5,472.38],[637.62,479.75],[637.62,479.75],[637.62,479.75],[642.82,483.73],[642.82,483.73],[642.82,483.73],[647.09,485.64],[647.09,485.64],[647.09,485.64],[651.38,487.75],[651.38,487.75],[651.38,487.75],[659.31,484.75],[659.31,484.75],[659.31,484.75],[664.5,489.88],[664.5,489.88],[664.5,489.88],[670.88,487.25],[670.88,487.25],[670.88,487.25],[676.12,482.62],[676.12,482.62],[676.12,482.62],[682.62,482.62],[682.62,482.62],[682.62,482.62],[682.25,477.0],[682.25,477.0],[682.25,477.0],[683.5,470.62],[683.5,470.62],[683.5,470.62],[688.25,464.88],[688.25,464.88],[688.25,464.88],[691.0,455.75],[691.0,455.75],[691.0,455.75],[689.12,450.25],[689.12,450.25],[689.12,450.25],[685.0,442.88],[685.0,442.88],[685.0,442.88],[684.5,438.75],[684.5,438.75],[684.5,438.75],[697.75,431.38],[697.75,431.38],[697.75,431.38],[702.62,426.25],[702.62,426.25],[702.62,426.25],[708.0,416.62],[708.0,416.62],[708.0,416.62],[709.5,406.25],[709.5,406.25],[709.5,406.25],[712.12,399.62],[712.12,399.62],[712.12,399.62],[704.64,395.27],[704.64,395.27],[704.64,395.27],[705.36,392.36],[705.36,392.36],[705.36,392.36],[702.55,389.82],[702.55,389.82],[702.55,389.82],[702.0,382.82],[702.0,382.82],[702.0,382.82],[699.73,380.73],[699.73,380.73],[699.73,380.73],[696.27,380.91],[696.27,380.91],[696.27,380.91],[693.36,381.73],[693.36,381.73],[693.36,381.73],[685.45,381.36],[685.45,381.36],[685.45,381.36],[683.55,378.0],[683.55,378.0],[683.55,378.0],[680.0,377.27],[680.0,377.27],[680.0,377.27],[677.82,375.0],[677.82,375.0],[677.82,375.0],[672.09,374.64],[672.09,374.64],[672.09,374.64],[662.82,377.91],[662.82,377.91],[662.82,377.91],[655.82,377.82],[655.82,377.82],[655.82,377.82],[645.18,361.64],[645.18,361.64],[645.18,361.64],[641.82,358.82],[641.82,358.82],[641.82,358.82],[637.09,358.45],[637.09,358.45],[637.09,358.45],[634.18,355.55],[634.18,355.55],[634.18,355.55],[628.0,354.82],[628.0,354.82]]],['landmark',[[516.88,495.12],[517.62,498.62],[517.62,498.62],[517.62,498.62],[528.38,507.75],[528.38,507.75],[528.38,507.75],[528.5,513.5],[528.5,513.5],[528.5,513.5],[523.88,513.75],[523.88,513.75],[523.88,513.75],[520.5,516.5],[520.5,516.5],[520.5,516.5],[520.5,523.25],[520.5,523.25],[520.5,523.25],[516.38,525.75],[516.38,525.75],[516.38,525.75],[515.5,533.38],[515.5,533.38],[515.5,533.38],[502.0,542.12],[502.0,542.12],[502.0,542.12],[500.38,544.38],[500.38,544.38],[500.38,544.38],[496.25,547.0],[496.25,547.0],[496.25,547.0],[496.12,550.38],[496.12,550.38],[496.12,550.38],[498.5,554.75],[498.5,554.75],[498.5,554.75],[497.88,562.0],[497.88,562.0],[497.88,562.0],[493.75,567.88],[493.75,567.88],[493.75,567.88],[494.0,572.0],[494.0,572.0],[494.0,572.0],[495.25,573.0],[495.25,573.0],[495.25,573.0],[500.62,573.62],[500.62,573.62],[500.62,573.62],[506.38,571.0],[506.38,571.0],[506.38,571.0],[511.25,572.0],[511.25,572.0],[511.25,572.0],[514.38,574.75],[514.38,574.75],[514.38,574.75],[515.0,580.88],[515.0,580.88],[515.0,580.88],[516.38,584.62],[516.38,584.62],[516.38,584.62],[520.38,586.62],[520.38,586.62],[520.38,586.62],[527.25,588.38],[527.25,588.38],[527.25,588.38],[530.0,592.62],[530.0,592.62],[530.0,592.62],[530.0,599.38],[530.0,599.38],[530.0,599.38],[527.75,606.5],[527.75,606.5],[527.75,606.5],[527.88,614.12],[527.88,614.12],[527.88,614.12],[533.12,619.38],[533.12,619.38],[533.12,619.38],[534.38,625.62],[534.38,625.62],[534.38,625.62],[533.12,636.0],[533.12,636.0],[533.12,636.0],[537.88,636.0],[537.88,636.0],[537.88,636.0],[547.38,630.25],[547.38,630.25],[547.38,630.25],[554.73,630.0],[554.73,630.0],[554.73,630.0],[560.0,632.36],[560.0,632.36],[560.0,632.36],[567.64,632.55],[567.64,632.55],[567.64,632.55],[570.45,634.64],[570.45,634.64],[570.45,634.64],[581.39,633.0],[581.39,633.0],[581.39,633.0],[586.18,629.82],[586.18,629.82],[586.18,629.82],[585.12,624.0],[585.12,624.0],[585.12,624.0],[585.75,617.75],[585.75,617.75],[585.75,617.75],[597.12,606.5],[597.12,606.5],[597.12,606.5],[600.25,606.62],[600.25,606.62],[600.25,606.62],[602.5,613.38],[602.5,613.38],[602.5,613.38],[605.75,617.88],[605.75,617.88],[605.75,617.88],[608.75,618.38],[608.75,618.38],[608.75,618.38],[613.5,613.25],[613.5,613.25],[613.5,613.25],[615.38,614.62],[615.38,614.62],[615.38,614.62],[619.38,610.75],[619.38,610.75],[619.38,610.75],[619.88,605.75],[619.88,605.75],[619.88,605.75],[624.0,604.5],[624.0,604.5],[624.0,604.5],[629.5,601.5],[629.5,601.5],[629.5,601.5],[633.25,596.0],[633.25,596.0],[633.25,596.0],[636.25,596.12],[636.25,596.12],[636.25,596.12],[644.5,602.38],[644.5,602.38],[644.5,602.38],[646.25,603.0],[646.25,603.0],[646.25,603.0],[648.62,606.38],[648.62,606.38],[648.62,606.38],[652.25,608.5],[652.25,608.5],[652.25,608.5],[655.12,606.62],[655.12,606.62],[655.12,606.62],[656.12,601.75],[656.12,601.75],[656.12,601.75],[666.12,589.0],[666.12,589.0],[666.12,589.0],[666.12,583.75],[666.12,583.75],[666.12,583.75],[664.5,581.5],[664.5,581.5],[664.5,581.5],[664.38,575.62],[664.38,575.62],[664.38,575.62],[668.38,563.12],[668.38,563.12],[668.38,563.12],[667.38,559.12],[667.38,559.12],[667.38,559.12],[664.5,559.25],[664.5,559.25],[664.5,559.25],[661.88,555.25],[661.88,555.25],[661.88,555.25],[661.75,550.5],[661.75,550.5],[661.75,550.5],[663.25,546.88],[663.25,546.88],[663.25,546.88],[663.12,537.75],[663.12,537.75],[663.12,537.75],[664.25,536.88],[664.25,536.88],[664.25,536.88],[664.12,533.38],[664.12,533.38],[664.12,533.38],[665.5,531.25],[665.5,531.25],[665.5,531.25],[665.25,517.38],[665.25,517.38],[665.25,517.38],[663.62,514.25],[663.62,514.25],[663.62,514.25],[664.25,500.5],[664.25,500.5],[664.25,500.5],[665.75,497.0],[665.75,497.0],[665.75,497.0],[664.5,489.88],[664.5,489.88],[664.5,489.88],[659.31,484.75],[659.31,484.75],[659.31,484.75],[651.38,487.75],[651.38,487.75],[651.38,487.75],[647.09,485.64],[647.09,485.64],[647.09,485.64],[642.82,483.73],[642.82,483.73],[642.82,483.73],[637.62,479.75],[637.62,479.75],[637.62,479.75],[630.5,472.38],[630.5,472.38],[630.5,472.38],[625.12,474.0],[625.12,474.0],[625.12,474.0],[621.75,470.25],[621.75,470.25],[621.75,470.25],[622.62,465.38],[622.62,465.38],[622.62,465.38],[619.88,460.0],[619.88,460.0],[619.88,460.0],[621.12,454.38],[621.12,454.38],[621.12,454.38],[613.88,446.62],[613.88,446.62],[613.88,446.62],[609.62,446.5],[609.62,446.5],[609.62,446.5],[606.62,453.88],[606.62,453.88],[606.62,453.88],[602.25,459.0],[602.25,459.0],[602.25,459.0],[598.12,459.88],[598.12,459.88],[598.12,459.88],[593.38,463.62],[593.38,463.62],[593.38,463.62],[593.25,468.88],[593.25,468.88],[593.25,468.88],[589.75,475.88],[589.75,475.88],[589.75,475.88],[584.88,479.62],[584.88,479.62],[584.88,479.62],[581.25,480.0],[581.25,480.0],[581.25,480.0],[574.62,482.5],[574.62,482.5],[574.62,482.5],[572.0,486.5],[572.0,486.5],[572.0,486.5],[568.25,488.75],[568.25,488.75],[568.25,488.75],[564.12,489.12],[564.12,489.12],[564.12,489.12],[559.62,491.25],[559.62,491.25],[559.62,491.25],[549.12,491.12],[549.12,491.12],[549.12,491.12],[544.88,490.12],[544.88,490.12],[544.88,490.12],[538.5,492.25],[538.5,492.25],[538.5,492.25],[534.62,489.12],[534.62,489.12],[534.62,489.12],[529.38,489.25],[529.38,489.25],[529.38,489.25],[525.5,491.12],[525.5,491.12],[525.5,491.12],[518.38,491.12],[518.38,491.12],[518.38,491.12],[516.88,495.12],[516.88,495.12]]],['faron',[[615.38,614.62],[619.38,610.75],[619.38,610.75],[619.38,610.75],[619.88,605.75],[619.88,605.75],[619.88,605.75],[624.0,604.5],[624.0,604.5],[624.0,604.5],[629.5,601.5],[629.5,601.5],[629.5,601.5],[633.25,596.0],[633.25,596.0],[633.25,596.0],[636.25,596.12],[636.25,596.12],[636.25,596.12],[644.5,602.38],[644.5,602.38],[644.5,602.38],[646.25,603.0],[646.25,603.0],[646.25,603.0],[648.62,606.38],[648.62,606.38],[648.62,606.38],[652.25,608.5],[652.25,608.5],[652.25,608.5],[655.12,606.62],[655.12,606.62],[655.12,606.62],[656.12,601.75],[656.12,601.75],[656.12,601.75],[666.12,589.0],[666.12,589.0],[666.12,589.0],[666.12,583.75],[666.12,583.75],[666.12,583.75],[664.5,581.5],[664.5,581.5],[664.5,581.5],[664.38,575.62],[664.38,575.62],[664.38,575.62],[668.38,563.12],[668.38,563.12],[668.38,563.12],[667.38,559.12],[667.38,559.12],[667.38,559.12],[664.5,559.25],[664.5,559.25],[664.5,559.25],[661.88,555.25],[661.88,555.25],[661.88,555.25],[661.75,550.5],[661.75,550.5],[661.75,550.5],[663.25,546.88],[663.25,546.88],[663.25,546.88],[663.12,537.75],[663.12,537.75],[663.12,537.75],[664.25,536.88],[664.25,536.88],[664.25,536.88],[664.12,533.38],[664.12,533.38],[664.12,533.38],[665.5,531.25],[665.5,531.25],[665.5,531.25],[665.25,517.38],[665.25,517.38],[665.25,517.38],[663.62,514.25],[663.62,514.25],[663.62,514.25],[664.25,500.5],[664.25,500.5],[664.25,500.5],[665.75,497.0],[665.75,497.0],[665.75,497.0],[664.5,489.88],[664.5,489.88],[664.5,489.88],[670.88,487.25],[670.88,487.25],[670.88,487.25],[676.12,482.62],[676.12,482.62],[676.12,482.62],[682.62,482.62],[682.62,482.62],[682.62,482.62],[682.88,489.62],[682.88,489.62],[682.88,489.62],[685.62,496.5],[685.62,496.5],[685.62,496.5],[689.62,500.5],[689.62,500.5],[689.62,500.5],[692.75,501.88],[692.75,501.88],[692.75,501.88],[695.62,509.12],[695.62,509.12],[695.62,509.12],[701.75,508.88],[701.75,508.88],[701.75,508.88],[707.75,505.5],[707.75,505.5],[707.75,505.5],[711.38,505.62],[711.38,505.62],[711.38,505.62],[713.25,509.62],[713.25,509.62],[713.25,509.62],[717.12,512.88],[717.12,512.88],[717.12,512.88],[717.88,526.62],[717.88,526.62],[717.88,526.62],[716.88,528.5],[716.88,528.5],[716.88,528.5],[721.0,535.38],[721.0,535.38],[721.0,535.38],[728.25,538.12],[728.25,538.12],[728.25,538.12],[732.5,542.25],[732.5,542.25],[732.5,542.25],[732.38,544.38],[732.38,544.38],[732.38,544.38],[736.38,544.62],[736.38,544.62],[736.38,544.62],[738.0,543.25],[738.0,543.25],[738.0,543.25],[741.12,543.62],[741.12,543.62],[741.12,543.62],[744.62,548.5],[744.62,548.5],[744.62,548.5],[752.55,550.09],[752.55,550.09],[752.55,550.09],[755.36,552.64],[755.36,552.64],[755.36,552.64],[776.0,554.55],[776.0,554.55],[776.0,554.55],[780.0,559.0],[780.0,559.0],[780.0,559.0],[788.25,563.0],[788.25,563.0],[788.25,563.0],[799.0,566.25],[799.0,566.25],[799.0,566.25],[806.0,574.5],[806.0,574.5],[806.0,574.5],[809.75,585.0],[809.75,585.0],[809.75,585.0],[808.0,591.75],[808.0,591.75],[808.0,591.75],[803.0,595.0],[803.0,595.0],[803.0,595.0],[803.25,600.5],[803.25,600.5],[803.25,600.5],[809.75,606.75],[809.75,606.75],[809.75,606.75],[815.36,616.64],[815.36,616.64],[815.36,616.64],[821.75,620.25],[821.75,620.25],[821.75,620.25],[828.0,627.25],[828.0,627.25],[828.0,627.25],[832.25,630.25],[832.25,630.25],[832.25,630.25],[838.09,630.0],[838.09,630.0],[838.09,630.0],[832.36,634.36],[832.36,634.36],[832.36,634.36],[831.64,642.91],[831.64,642.91],[831.64,642.91],[834.91,648.73],[834.91,648.73],[834.91,648.73],[834.36,654.91],[834.36,654.91],[834.36,654.91],[830.36,658.36],[830.36,658.36],[830.36,658.36],[822.55,659.09],[822.55,659.09],[822.55,659.09],[818.73,656.91],[818.73,656.91],[818.73,656.91],[812.55,657.64],[812.55,657.64],[812.55,657.64],[805.27,662.0],[805.27,662.0],[805.27,662.0],[796.18,661.64],[796.18,661.64],[796.18,661.64],[788.0,663.45],[788.0,663.45],[788.0,663.45],[787.82,669.09],[787.82,669.09],[787.82,669.09],[782.73,674.55],[782.73,674.55],[782.73,674.55],[781.45,681.27],[781.45,681.27],[781.45,681.27],[775.27,685.64],[775.27,685.64],[775.27,685.64],[773.09,699.45],[773.09,699.45],[773.09,699.45],[765.45,703.45],[765.45,703.45],[765.45,703.45],[765.27,705.64],[765.27,705.64],[765.27,705.64],[769.94,709.19],[769.94,709.19],[769.94,709.19],[769.38,712.56],[769.38,712.56],[769.38,712.56],[768.38,713.62],[768.38,713.62],[768.38,713.62],[769.12,716.75],[769.12,716.75],[769.12,716.75],[767.25,719.19],[767.25,719.19],[767.25,719.19],[761.94,719.0],[761.94,719.0],[761.94,719.0],[756.91,716.73],[756.91,716.73],[756.91,716.73],[751.64,718.55],[751.64,718.55],[751.64,718.55],[748.09,714.36],[748.09,714.36],[748.09,714.36],[744.82,715.73],[744.82,715.73],[744.82,715.73],[745.73,720.82],[745.73,720.82],[745.73,720.82],[741.45,729.36],[741.45,729.36],[741.45,729.36],[737.0,724.09],[737.0,724.09],[737.0,724.09],[734.09,724.36],[734.09,724.36],[734.09,724.36],[734.55,727.64],[734.55,727.64],[734.55,727.64],[739.55,733.36],[739.55,733.36],[739.55,733.36],[737.55,735.18],[737.55,735.18],[737.55,735.18],[729.91,735.27],[729.91,735.27],[729.91,735.27],[725.27,724.45],[725.27,724.45],[725.27,724.45],[725.0,719.36],[725.0,719.36],[725.0,719.36],[716.55,711.55],[716.55,711.55],[716.55,711.55],[715.82,704.36],[715.82,704.36],[715.82,704.36],[717.09,693.45],[717.09,693.45],[717.09,693.45],[720.64,691.73],[720.64,691.73],[720.64,691.73],[724.09,697.0],[724.09,697.0],[724.09,697.0],[728.18,697.45],[728.18,697.45],[728.18,697.45],[728.27,690.64],[728.27,690.64],[728.27,690.64],[722.0,684.91],[722.0,684.91],[722.0,684.91],[722.0,678.18],[722.0,678.18],[722.0,678.18],[726.27,672.64],[726.27,672.64],[726.27,672.64],[726.09,662.82],[726.09,662.82],[726.09,662.82],[732.36,656.91],[732.36,656.91],[732.36,656.91],[732.91,653.91],[732.91,653.91],[732.91,653.91],[729.18,653.0],[729.18,653.0],[729.18,653.0],[723.91,656.73],[723.91,656.73],[723.91,656.73],[722.09,655.36],[722.09,655.36],[722.09,655.36],[720.91,645.36],[720.91,645.36],[720.91,645.36],[719.36,643.18],[719.36,643.18],[719.36,643.18],[713.09,640.82],[713.09,640.82],[713.09,640.82],[711.18,635.36],[711.18,635.36],[711.18,635.36],[712.73,632.27],[712.73,632.27],[712.73,632.27],[707.91,628.27],[707.91,628.27],[707.91,628.27],[706.18,620.55],[706.18,620.55],[706.18,620.55],[701.09,617.73],[701.09,617.73],[701.09,617.73],[696.64,618.18],[696.64,618.18],[696.64,618.18],[695.64,621.18],[695.64,621.18],[695.64,621.18],[691.09,623.82],[691.09,623.82],[691.09,623.82],[684.0,625.09],[684.0,625.09],[684.0,625.09],[680.0,631.45],[680.0,631.45],[680.0,631.45],[671.82,632.0],[671.82,632.0],[671.82,632.0],[669.09,635.64],[669.09,635.64],[669.09,635.64],[669.09,641.27],[669.09,641.27],[669.09,641.27],[666.0,644.36],[666.0,644.36],[666.0,644.36],[661.09,644.55],[661.09,644.55],[661.09,644.55],[658.36,649.64],[658.36,649.64],[658.36,649.64],[654.0,649.45],[654.0,649.45],[654.0,649.45],[651.91,648.64],[651.91,648.64],[651.91,648.64],[648.82,649.09],[648.82,649.09],[648.82,649.09],[647.64,650.55],[647.64,650.55],[647.64,650.55],[647.45,658.55],[647.45,658.55],[647.45,658.55],[644.45,661.45],[644.45,661.45],[644.45,661.45],[640.55,662.18],[640.55,662.18],[640.55,662.18],[636.73,667.91],[636.73,667.91],[636.73,667.91],[637.09,681.36],[637.09,681.36],[637.09,681.36],[639.91,687.0],[639.91,687.0],[639.91,687.0],[639.36,690.55],[639.36,690.55],[639.36,690.55],[634.55,698.36],[634.55,698.36],[634.55,698.36],[629.27,702.55],[629.27,702.55],[629.27,702.55],[625.64,702.64],[625.64,702.64],[625.64,702.64],[623.91,700.82],[623.91,700.82],[623.91,700.82],[625.55,698.18],[625.55,698.18],[625.55,698.18],[627.18,696.73],[627.18,696.73],[627.18,696.73],[627.0,688.64],[627.0,688.64],[627.0,688.64],[621.73,685.55],[621.73,685.55],[621.73,685.55],[616.64,677.73],[616.64,677.73],[616.64,677.73],[620.18,674.27],[620.18,674.27],[620.18,674.27],[620.0,664.91],[620.0,664.91],[620.0,664.91],[617.45,660.27],[617.45,660.27],[617.45,660.27],[617.82,657.18],[617.82,657.18],[617.82,657.18],[620.64,655.18],[620.64,655.18],[620.64,655.18],[625.18,653.73],[625.18,653.73],[625.18,653.73],[629.09,650.91],[629.09,650.91],[629.09,650.91],[630.09,646.73],[630.09,646.73],[630.09,646.73],[627.0,643.27],[627.0,643.27],[627.0,643.27],[622.27,642.18],[622.27,642.18],[622.27,642.18],[619.36,638.91],[619.36,638.91],[619.36,638.91],[619.27,633.18],[619.27,633.18],[619.27,633.18],[617.73,631.73],[617.73,631.73],[617.73,631.73],[612.09,631.36],[612.09,631.36],[612.09,631.36],[610.64,629.73],[610.64,629.73],[610.64,629.73],[610.73,626.18],[610.73,626.18],[610.73,626.18],[614.18,622.91],[614.18,622.91],[614.18,622.91],[615.09,617.55],[615.09,617.55],[615.09,617.55],[615.38,614.62],[615.38,614.62]]],['dragontown',[[752.55,550.09],[752.91,548.0],[752.91,548.0],[752.91,548.0],[759.36,541.18],[759.36,541.18],[759.36,541.18],[764.73,541.18],[764.73,541.18],[764.73,541.18],[770.27,544.0],[770.27,544.0],[770.27,544.0],[774.09,543.82],[774.09,543.82],[774.09,543.82],[777.06,540.69],[777.06,540.69],[777.06,540.69],[779.62,535.25],[779.62,535.25],[779.62,535.25],[777.0,530.25],[777.0,530.25],[777.0,530.25],[773.0,523.75],[773.0,523.75],[773.0,523.75],[775.0,518.75],[775.0,518.75],[775.0,518.75],[781.5,512.25],[781.5,512.25],[781.5,512.25],[781.62,506.88],[781.62,506.88],[781.62,506.88],[780.88,501.75],[780.88,501.75],[780.88,501.75],[782.0,493.5],[782.0,493.5],[782.0,493.5],[789.12,486.38],[789.12,486.38],[789.12,486.38],[793.25,485.25],[793.25,485.25],[793.25,485.25],[795.25,482.5],[795.25,482.5],[795.25,482.5],[803.0,480.75],[803.0,480.75],[803.0,480.75],[809.75,474.75],[809.75,474.75],[809.75,474.75],[811.25,468.5],[811.25,468.5],[811.25,468.5],[811.06,460.56],[811.06,460.56],[811.06,460.56],[809.82,458.45],[809.82,458.45],[809.82,458.45],[811.73,455.0],[811.73,455.0],[811.73,455.0],[815.36,452.0],[815.36,452.0],[815.36,452.0],[819.82,450.91],[819.82,450.91],[819.82,450.91],[824.73,446.73],[824.73,446.73],[824.73,446.73],[828.0,445.45],[828.0,445.45],[828.0,445.45],[830.18,437.64],[830.18,437.64],[830.18,437.64],[828.0,430.18],[828.0,430.18],[828.0,430.18],[830.18,423.82],[830.18,423.82],[830.18,423.82],[833.45,421.27],[833.45,421.27],[833.45,421.27],[832.91,416.73],[832.91,416.73],[832.91,416.73],[831.09,413.09],[831.09,413.09],[831.09,413.09],[831.09,405.82],[831.09,405.82],[831.09,405.82],[833.64,404.73],[833.64,404.73],[833.64,404.73],[837.64,398.36],[837.64,398.36],[837.64,398.36],[836.73,391.09],[836.73,391.09],[836.73,391.09],[833.64,385.09],[833.64,385.09],[833.64,385.09],[830.73,384.36],[830.73,384.36],[830.73,384.36],[830.36,374.91],[830.36,374.91],[830.36,374.91],[821.45,372.36],[821.45,372.36],[821.45,372.36],[812.36,369.82],[812.36,369.82],[812.36,369.82],[810.0,366.36],[810.0,366.36],[810.0,366.36],[811.09,363.82],[811.09,363.82],[811.09,363.82],[807.09,360.55],[807.09,360.55],[807.09,360.55],[787.64,355.82],[787.64,355.82],[787.64,355.82],[781.82,351.64],[781.82,351.64],[781.82,351.64],[779.09,351.64],[779.09,351.64],[779.09,351.64],[776.36,347.45],[776.36,347.45],[776.36,347.45],[773.82,347.27],[773.82,347.27],[773.82,347.27],[772.36,342.91],[772.36,342.91],[772.36,342.91],[773.27,339.27],[773.27,339.27],[773.27,339.27],[776.91,336.0],[776.91,336.0],[776.91,336.0],[781.45,335.09],[781.45,335.09],[781.45,335.09],[786.91,328.55],[786.91,328.55],[786.91,328.55],[786.91,318.55],[786.91,318.55],[786.91,318.55],[785.31,316.06],[785.31,316.06],[785.31,316.06],[784.0,310.5],[784.0,310.5],[784.0,310.5],[779.12,306.88],[779.12,306.88],[779.12,306.88],[772.44,304.69],[772.44,304.69],[772.44,304.69],[769.25,300.31],[769.25,300.31],[769.25,300.31],[767.69,295.62],[767.69,295.62],[767.69,295.62],[766.19,293.81],[766.19,293.81],[766.19,293.81],[762.38,303.62],[762.38,303.62],[762.38,303.62],[762.25,308.12],[762.25,308.12],[762.25,308.12],[754.75,320.25],[754.75,320.25],[754.75,320.25],[754.5,332.25],[754.5,332.25],[754.5,332.25],[752.38,335.0],[752.38,335.0],[752.38,335.0],[751.5,345.88],[751.5,345.88],[751.5,345.88],[746.88,350.38],[746.88,350.38],[746.88,350.38],[743.75,351.38],[743.75,351.38],[743.75,351.38],[738.88,357.25],[738.88,357.25],[738.88,357.25],[734.62,357.88],[734.62,357.88],[734.62,357.88],[731.5,361.12],[731.5,361.12],[731.5,361.12],[735.0,368.12],[735.0,368.12],[735.0,368.12],[735.0,374.25],[735.0,374.25],[735.0,374.25],[733.75,376.38],[733.75,376.38],[733.75,376.38],[734.12,380.12],[734.12,380.12],[734.12,380.12],[740.75,391.62],[740.75,391.62],[740.75,391.62],[739.25,393.25],[739.25,393.25],[739.25,393.25],[737.25,393.38],[737.25,393.38],[737.25,393.38],[734.38,396.0],[734.38,396.0],[734.38,396.0],[722.0,396.5],[722.0,396.5],[722.0,396.5],[716.62,398.88],[716.62,398.88],[716.62,398.88],[712.12,399.62],[712.12,399.62],[712.12,399.62],[709.5,406.25],[709.5,406.25],[709.5,406.25],[708.0,416.62],[708.0,416.62],[708.0,416.62],[702.62,426.25],[702.62,426.25],[702.62,426.25],[697.75,431.38],[697.75,431.38],[697.75,431.38],[684.5,438.75],[684.5,438.75],[684.5,438.75],[685.0,442.88],[685.0,442.88],[685.0,442.88],[689.12,450.25],[689.12,450.25],[689.12,450.25],[691.0,455.75],[691.0,455.75],[691.0,455.75],[688.25,464.88],[688.25,464.88],[688.25,464.88],[683.5,470.62],[683.5,470.62],[683.5,470.62],[682.25,477.0],[682.25,477.0],[682.25,477.0],[682.62,482.62],[682.62,482.62],[682.62,482.62],[682.88,489.62],[682.88,489.62],[682.88,489.62],[685.62,496.5],[685.62,496.5],[685.62,496.5],[689.62,500.5],[689.62,500.5],[689.62,500.5],[692.75,501.88],[692.75,501.88],[692.75,501.88],[695.62,509.12],[695.62,509.12],[695.62,509.12],[701.75,508.88],[701.75,508.88],[701.75,508.88],[707.75,505.5],[707.75,505.5],[707.75,505.5],[711.38,505.62],[711.38,505.62],[711.38,505.62],[713.25,509.62],[713.25,509.62],[713.25,509.62],[717.12,512.88],[717.12,512.88],[717.12,512.88],[717.88,526.62],[717.88,526.62],[717.88,526.62],[716.88,528.5],[716.88,528.5],[716.88,528.5],[721.0,535.38],[721.0,535.38],[721.0,535.38],[728.25,538.12],[728.25,538.12],[728.25,538.12],[732.5,542.25],[732.5,542.25],[732.5,542.25],[732.38,544.38],[732.38,544.38],[732.38,544.38],[736.38,544.62],[736.38,544.62],[736.38,544.62],[738.0,543.25],[738.0,543.25],[738.0,543.25],[741.12,543.62],[741.12,543.62],[741.12,543.62],[744.62,548.5],[744.62,548.5],[744.62,548.5],[752.55,550.09],[752.55,550.09]]],['baiHuaHill',[[764.45,186.91],[769.82,184.09],[769.82,184.09],[769.82,184.09],[777.82,182.91],[777.82,182.91],[777.82,182.91],[793.91,182.82],[793.91,182.82],[793.91,182.82],[801.91,177.91],[801.91,177.91],[801.91,177.91],[805.0,177.27],[805.0,177.27],[805.0,177.27],[811.09,181.18],[811.09,181.18],[811.09,181.18],[816.91,181.73],[816.91,181.73],[816.91,181.73],[819.31,182.94],[819.31,182.94],[819.31,182.94],[818.88,187.5],[818.88,187.5],[818.88,187.5],[815.75,191.38],[815.75,191.38],[815.75,191.38],[815.38,197.0],[815.38,197.0],[815.38,197.0],[820.38,201.25],[820.38,201.25],[820.38,201.25],[820.38,210.25],[820.38,210.25],[820.38,210.25],[816.88,215.5],[816.88,215.5],[816.88,215.5],[812.0,217.25],[812.0,217.25],[812.0,217.25],[809.25,220.75],[809.25,220.75],[809.25,220.75],[809.0,225.62],[809.0,225.62],[809.0,225.62],[810.25,227.5],[810.25,227.5],[810.25,227.5],[811.5,238.0],[811.5,238.0],[811.5,238.0],[814.38,239.62],[814.38,239.62],[814.38,239.62],[814.88,242.5],[814.88,242.5],[814.88,242.5],[823.75,249.0],[823.75,249.0],[823.75,249.0],[828.25,254.62],[828.25,254.62],[828.25,254.62],[829.12,262.25],[829.12,262.25],[829.12,262.25],[825.0,271.12],[825.0,271.12],[825.0,271.12],[820.38,277.75],[820.38,277.75],[820.38,277.75],[818.62,286.0],[818.62,286.0],[818.62,286.0],[815.25,289.25],[815.25,289.25],[815.25,289.25],[809.12,290.75],[809.12,290.75],[809.12,290.75],[802.12,298.38],[802.12,298.38],[802.12,298.38],[800.12,306.62],[800.12,306.62],[800.12,306.62],[796.75,313.25],[796.75,313.25],[796.75,313.25],[791.5,317.25],[791.5,317.25],[791.5,317.25],[786.75,318.62],[786.75,318.62],[786.75,318.62],[785.31,316.06],[785.31,316.06],[785.31,316.06],[784.0,310.5],[784.0,310.5],[784.0,310.5],[779.12,306.88],[779.12,306.88],[779.12,306.88],[772.44,304.69],[772.44,304.69],[772.44,304.69],[769.25,300.31],[769.25,300.31],[769.25,300.31],[767.69,295.62],[767.69,295.62],[767.69,295.62],[766.19,293.81],[766.19,293.81],[766.19,293.81],[764.81,292.0],[764.81,292.0],[764.81,292.0],[764.5,287.88],[764.5,287.88],[764.5,287.88],[764.75,285.38],[764.75,285.38],[764.75,285.38],[768.75,278.62],[768.75,278.62],[768.75,278.62],[771.25,278.0],[771.25,278.0],[771.25,278.0],[773.75,275.0],[773.75,275.0],[773.75,275.0],[775.0,271.38],[775.0,271.38],[775.0,271.38],[768.75,264.5],[768.75,264.5],[768.75,264.5],[768.12,260.62],[768.12,260.62],[768.12,260.62],[770.62,256.62],[770.62,256.62],[770.62,256.62],[770.45,249.27],[770.45,249.27],[770.45,249.27],[764.73,243.55],[764.73,243.55],[764.73,243.55],[764.82,239.64],[764.82,239.64],[764.82,239.64],[769.64,231.82],[769.64,231.82],[769.64,231.82],[769.82,227.18],[769.82,227.18],[769.82,227.18],[767.64,223.73],[767.64,223.73],[767.64,223.73],[767.73,218.64],[767.73,218.64],[767.73,218.64],[769.27,216.73],[769.27,216.73],[769.27,216.73],[769.36,212.91],[769.36,212.91],[769.36,212.91],[773.55,206.09],[773.55,206.09],[773.55,206.09],[774.0,203.0],[774.0,203.0],[774.0,203.0],[766.55,192.09],[766.55,192.09],[766.55,192.09],[764.64,191.73],[764.64,191.73],[764.64,191.73],[764.45,186.91],[764.45,186.91]]],['yaoLingPass',[[820.38,277.75],[818.62,286.0],[818.62,286.0],[818.62,286.0],[815.25,289.25],[815.25,289.25],[815.25,289.25],[809.12,290.75],[809.12,290.75],[809.12,290.75],[802.12,298.38],[802.12,298.38],[802.12,298.38],[800.12,306.62],[800.12,306.62],[800.12,306.62],[796.75,313.25],[796.75,313.25],[796.75,313.25],[791.5,317.25],[791.5,317.25],[791.5,317.25],[786.75,318.62],[786.75,318.62],[786.75,318.62],[786.91,328.55],[786.91,328.55],[786.91,328.55],[781.45,335.09],[781.45,335.09],[781.45,335.09],[776.91,336.0],[776.91,336.0],[776.91,336.0],[773.27,339.27],[773.27,339.27],[773.27,339.27],[772.36,342.91],[772.36,342.91],[772.36,342.91],[773.82,347.27],[773.82,347.27],[773.82,347.27],[776.36,347.45],[776.36,347.45],[776.36,347.45],[779.09,351.64],[779.09,351.64],[779.09,351.64],[781.82,351.64],[781.82,351.64],[781.82,351.64],[787.64,355.82],[787.64,355.82],[787.64,355.82],[807.09,360.55],[807.09,360.55],[807.09,360.55],[811.09,363.82],[811.09,363.82],[811.09,363.82],[810.0,366.36],[810.0,366.36],[810.0,366.36],[812.36,369.82],[812.36,369.82],[812.36,369.82],[821.45,372.36],[821.45,372.36],[821.45,372.36],[830.36,374.91],[830.36,374.91],[830.36,374.91],[830.73,384.36],[830.73,384.36],[830.73,384.36],[833.64,385.09],[833.64,385.09],[833.64,385.09],[836.73,391.09],[836.73,391.09],[836.73,391.09],[837.64,398.36],[837.64,398.36],[837.64,398.36],[833.64,404.73],[833.64,404.73],[833.64,404.73],[831.09,405.82],[831.09,405.82],[831.09,405.82],[831.09,413.09],[831.09,413.09],[831.09,413.09],[832.91,416.73],[832.91,416.73],[832.91,416.73],[833.45,421.27],[833.45,421.27],[833.45,421.27],[830.18,423.82],[830.18,423.82],[830.18,423.82],[828.0,430.18],[828.0,430.18],[828.0,430.18],[830.18,437.64],[830.18,437.64],[830.18,437.64],[828.0,445.45],[828.0,445.45],[828.0,445.45],[824.73,446.73],[824.73,446.73],[824.73,446.73],[819.82,450.91],[819.82,450.91],[819.82,450.91],[815.36,452.0],[815.36,452.0],[815.36,452.0],[811.73,455.0],[811.73,455.0],[811.73,455.0],[809.82,458.45],[809.82,458.45],[809.82,458.45],[811.06,460.56],[811.06,460.56],[811.06,460.56],[818.36,467.27],[818.36,467.27],[818.36,467.27],[828.0,467.27],[828.0,467.27],[828.0,467.27],[836.0,464.55],[836.0,464.55],[836.0,464.55],[838.55,460.36],[838.55,460.36],[838.55,460.36],[844.73,455.27],[844.73,455.27],[844.73,455.27],[854.73,454.18],[854.73,454.18],[854.73,454.18],[862.18,450.0],[862.18,450.0],[862.18,450.0],[872.36,439.27],[872.36,439.27],[872.36,439.27],[881.27,435.64],[881.27,435.64],[881.27,435.64],[886.55,437.09],[886.55,437.09],[886.55,437.09],[892.36,433.45],[892.36,433.45],[892.36,433.45],[901.45,433.82],[901.45,433.82],[901.45,433.82],[920.36,440.36],[920.36,440.36],[920.36,440.36],[929.27,448.18],[929.27,448.18],[929.27,448.18],[948.18,456.91],[948.18,456.91],[948.18,456.91],[951.64,457.09],[951.64,457.09],[951.64,457.09],[950.91,453.82],[950.91,453.82],[950.91,453.82],[954.91,438.73],[954.91,438.73],[954.91,438.73],[954.0,434.25],[954.0,434.25],[954.0,434.25],[949.82,428.27],[949.82,428.27],[949.82,428.27],[952.36,417.27],[952.36,417.27],[952.36,417.27],[949.75,406.5],[949.75,406.5],[949.75,406.5],[943.25,400.0],[943.25,400.0],[943.25,400.0],[936.5,394.0],[936.5,394.0],[936.5,394.0],[936.75,378.25],[936.75,378.25],[936.75,378.25],[928.0,368.0],[928.0,368.0],[928.0,368.0],[929.0,353.0],[929.0,353.0],[929.0,353.0],[932.0,348.5],[932.0,348.5],[932.0,348.5],[939.75,347.5],[939.75,347.5],[939.75,347.5],[943.0,344.25],[943.0,344.25],[943.0,344.25],[943.25,336.5],[943.25,336.5],[943.25,336.5],[940.0,330.5],[940.0,330.5],[940.0,330.5],[937.25,318.0],[937.25,318.0],[937.25,318.0],[933.75,315.5],[933.75,315.5],[933.75,315.5],[929.0,310.75],[929.0,310.75],[929.0,310.75],[923.94,310.69],[923.94,310.69],[923.94,310.69],[916.55,314.91],[916.55,314.91],[916.55,314.91],[904.36,314.36],[904.36,314.36],[904.36,314.36],[900.91,309.27],[900.91,309.27],[900.91,309.27],[904.0,296.73],[904.0,296.73],[904.0,296.73],[903.82,293.45],[903.82,293.45],[903.82,293.45],[897.5,291.0],[897.5,291.0],[897.5,291.0],[893.5,285.75],[893.5,285.75],[893.5,285.75],[883.5,281.25],[883.5,281.25],[883.5,281.25],[880.75,276.25],[880.75,276.25],[880.75,276.25],[880.25,267.0],[880.25,267.0],[880.25,267.0],[876.5,264.5],[876.5,264.5],[876.5,264.5],[866.25,264.0],[866.25,264.0],[866.25,264.0],[858.75,270.25],[858.75,270.25],[858.75,270.25],[844.5,275.25],[844.5,275.25],[844.5,275.25],[833.38,276.12],[833.38,276.12],[833.38,276.12],[827.88,273.62],[827.88,273.62],[827.88,273.62],[825.0,271.12],[825.0,271.12],[825.0,271.12],[820.38,277.75],[820.38,277.75]]],['luTower',[[818.88,187.5],[815.75,191.38],[815.75,191.38],[815.75,191.38],[815.38,197.0],[815.38,197.0],[815.38,197.0],[820.38,201.25],[820.38,201.25],[820.38,201.25],[820.38,210.25],[820.38,210.25],[820.38,210.25],[816.88,215.5],[816.88,215.5],[816.88,215.5],[812.0,217.25],[812.0,217.25],[812.0,217.25],[809.25,220.75],[809.25,220.75],[809.25,220.75],[809.0,225.62],[809.0,225.62],[809.0,225.62],[810.25,227.5],[810.25,227.5],[810.25,227.5],[811.5,238.0],[811.5,238.0],[811.5,238.0],[814.38,239.62],[814.38,239.62],[814.38,239.62],[814.88,242.5],[814.88,242.5],[814.88,242.5],[823.75,249.0],[823.75,249.0],[823.75,249.0],[828.25,254.62],[828.25,254.62],[828.25,254.62],[829.12,262.25],[829.12,262.25],[829.12,262.25],[825.0,271.12],[825.0,271.12],[825.0,271.12],[827.88,273.62],[827.88,273.62],[827.88,273.62],[833.38,276.12],[833.38,276.12],[833.38,276.12],[844.5,275.25],[844.5,275.25],[844.5,275.25],[858.75,270.25],[858.75,270.25],[858.75,270.25],[866.25,264.0],[866.25,264.0],[866.25,264.0],[876.5,264.5],[876.5,264.5],[876.5,264.5],[880.25,267.0],[880.25,267.0],[880.25,267.0],[880.75,276.25],[880.75,276.25],[880.75,276.25],[883.5,281.25],[883.5,281.25],[883.5,281.25],[893.5,285.75],[893.5,285.75],[893.5,285.75],[897.5,291.0],[897.5,291.0],[897.5,291.0],[903.82,293.45],[903.82,293.45],[903.82,293.45],[904.0,288.73],[904.0,288.73],[904.0,288.73],[910.55,282.91],[910.55,282.91],[910.55,282.91],[919.45,275.64],[919.45,275.64],[919.45,275.64],[922.55,275.27],[922.55,275.27],[922.55,275.27],[925.82,270.73],[925.82,270.73],[925.82,270.73],[930.91,266.36],[930.91,266.36],[930.91,266.36],[932.36,257.82],[932.36,257.82],[932.36,257.82],[935.09,252.73],[935.09,252.73],[935.09,252.73],[935.64,248.0],[935.64,248.0],[935.64,248.0],[940.73,243.64],[940.73,243.64],[940.73,243.64],[940.36,239.27],[940.36,239.27],[940.36,239.27],[936.18,228.0],[936.18,228.0],[936.18,228.0],[937.09,223.82],[937.09,223.82],[937.09,223.82],[939.45,218.91],[939.45,218.91],[939.45,218.91],[942.18,215.64],[942.18,215.64],[942.18,215.64],[951.27,213.45],[951.27,213.45],[951.27,213.45],[957.19,208.94],[957.19,208.94],[957.19,208.94],[952.33,207.67],[952.33,207.67],[952.33,207.67],[940.88,206.62],[940.88,206.62],[940.88,206.62],[929.5,199.12],[929.5,199.12],[929.5,199.12],[916.25,199.25],[916.25,199.25],[916.25,199.25],[907.75,203.5],[907.75,203.5],[907.75,203.5],[895.5,205.0],[895.5,205.0],[895.5,205.0],[892.0,203.25],[892.0,203.25],[892.0,203.25],[891.0,200.0],[891.0,200.0],[891.0,200.0],[884.5,192.5],[884.5,192.5],[884.5,192.5],[873.5,191.75],[873.5,191.75],[873.5,191.75],[867.75,187.25],[867.75,187.25],[867.75,187.25],[856.25,181.25],[856.25,181.25],[856.25,181.25],[838.36,175.45],[838.36,175.45],[838.36,175.45],[822.88,182.5],[822.88,182.5],[822.88,182.5],[819.31,182.94],[819.31,182.94],[819.31,182.94],[818.88,187.5],[818.88,187.5]]],['changning',[[954.0,434.25],[949.82,428.27],[949.82,428.27],[949.82,428.27],[952.36,417.27],[952.36,417.27],[952.36,417.27],[949.75,406.5],[949.75,406.5],[949.75,406.5],[943.25,400.0],[943.25,400.0],[943.25,400.0],[936.5,394.0],[936.5,394.0],[936.5,394.0],[936.75,378.25],[936.75,378.25],[936.75,378.25],[928.0,368.0],[928.0,368.0],[928.0,368.0],[929.0,353.0],[929.0,353.0],[929.0,353.0],[932.0,348.5],[932.0,348.5],[932.0,348.5],[939.75,347.5],[939.75,347.5],[939.75,347.5],[943.0,344.25],[943.0,344.25],[943.0,344.25],[943.25,336.5],[943.25,336.5],[943.25,336.5],[940.0,330.5],[940.0,330.5],[940.0,330.5],[937.25,318.0],[937.25,318.0],[937.25,318.0],[933.75,315.5],[933.75,315.5],[933.75,315.5],[929.0,310.75],[929.0,310.75],[929.0,310.75],[923.94,310.69],[923.94,310.69],[923.94,310.69],[916.55,314.91],[916.55,314.91],[916.55,314.91],[904.36,314.36],[904.36,314.36],[904.36,314.36],[900.91,309.27],[900.91,309.27],[900.91,309.27],[904.0,296.73],[904.0,296.73],[904.0,296.73],[903.82,293.45],[903.82,293.45],[903.82,293.45],[904.0,288.73],[904.0,288.73],[904.0,288.73],[910.55,282.91],[910.55,282.91],[910.55,282.91],[919.45,275.64],[919.45,275.64],[919.45,275.64],[922.55,275.27],[922.55,275.27],[922.55,275.27],[925.82,270.73],[925.82,270.73],[925.82,270.73],[930.91,266.36],[930.91,266.36],[930.91,266.36],[932.36,257.82],[932.36,257.82],[932.36,257.82],[935.09,252.73],[935.09,252.73],[935.09,252.73],[935.64,248.0],[935.64,248.0],[935.64,248.0],[940.73,243.64],[940.73,243.64],[940.73,243.64],[940.36,239.27],[940.36,239.27],[940.36,239.27],[936.18,228.0],[936.18,228.0],[936.18,228.0],[937.09,223.82],[937.09,223.82],[937.09,223.82],[939.45,218.91],[939.45,218.91],[939.45,218.91],[942.18,215.64],[942.18,215.64],[942.18,215.64],[951.27,213.45],[951.27,213.45],[951.27,213.45],[957.19,208.94],[957.19,208.94],[957.19,208.94],[968.25,207.75],[968.25,207.75],[968.25,207.75],[976.25,214.25],[976.25,214.25],[976.25,214.25],[980.5,214.0],[980.5,214.0],[980.5,214.0],[983.75,217.75],[983.75,217.75],[983.75,217.75],[988.0,217.75],[988.0,217.75],[988.0,217.75],[993.27,214.18],[993.27,214.18],[993.27,214.18],[997.27,213.09],[997.27,213.09],[997.27,213.09],[998.73,216.73],[998.73,216.73],[998.73,216.73],[1009.27,228.55],[1009.27,228.55],[1009.27,228.55],[1010.91,234.18],[1010.91,234.18],[1010.91,234.18],[1013.27,234.55],[1013.27,234.55],[1013.27,234.55],[1013.82,239.45],[1013.82,239.45],[1013.82,239.45],[1024.73,240.18],[1024.73,240.18],[1024.73,240.18],[1035.45,235.09],[1035.45,235.09],[1035.45,235.09],[1041.64,236.73],[1041.64,236.73],[1041.64,236.73],[1055.45,236.18],[1055.45,236.18],[1055.45,236.18],[1066.55,246.18],[1066.55,246.18],[1066.55,246.18],[1071.09,246.18],[1071.09,246.18],[1071.09,246.18],[1080.91,254.36],[1080.91,254.36],[1080.91,254.36],[1087.82,248.18],[1087.82,248.18],[1087.82,248.18],[1092.36,246.55],[1092.36,246.55],[1092.36,246.55],[1095.82,248.18],[1095.82,248.18],[1095.82,248.18],[1100.73,248.18],[1100.73,248.18],[1100.73,248.18],[1103.45,243.82],[1103.45,243.82],[1103.45,243.82],[1102.36,240.18],[1102.36,240.18],[1102.36,240.18],[1103.82,238.0],[1103.82,238.0],[1103.82,238.0],[1111.75,244.12],[1111.75,244.12],[1111.75,244.12],[1113.62,247.88],[1113.62,247.88],[1113.62,247.88],[1126.38,258.75],[1126.38,258.75],[1126.38,258.75],[1132.38,264.25],[1132.38,264.25],[1132.38,264.25],[1134.25,269.62],[1134.25,269.62],[1134.25,269.62],[1134.25,279.5],[1134.25,279.5],[1134.25,279.5],[1138.62,285.0],[1138.62,285.0],[1138.62,285.0],[1137.88,292.75],[1137.88,292.75],[1137.88,292.75],[1130.75,295.88],[1130.75,295.88],[1130.75,295.88],[1124.25,303.0],[1124.25,303.0],[1124.25,303.0],[1123.62,305.75],[1123.62,305.75],[1123.62,305.75],[1115.75,312.0],[1115.75,312.0],[1115.75,312.0],[1104.62,316.0],[1104.62,316.0],[1104.62,316.0],[1098.5,323.0],[1098.5,323.0],[1098.5,323.0],[1096.88,333.0],[1096.88,333.0],[1096.88,333.0],[1092.38,339.12],[1092.38,339.12],[1092.38,339.12],[1087.62,340.5],[1087.62,340.5],[1087.62,340.5],[1083.75,343.0],[1083.75,343.0],[1083.75,343.0],[1077.5,351.0],[1077.5,351.0],[1077.5,351.0],[1077.27,355.64],[1077.27,355.64],[1077.27,355.64],[1066.0,351.5],[1066.0,351.5],[1066.0,351.5],[1063.62,343.5],[1063.62,343.5],[1063.62,343.5],[1061.38,342.0],[1061.38,342.0],[1061.38,342.0],[1052.88,342.0],[1052.88,342.0],[1052.88,342.0],[1048.5,346.62],[1048.5,346.62],[1048.5,346.62],[1048.5,351.88],[1048.5,351.88],[1048.5,351.88],[1043.25,357.25],[1043.25,357.25],[1043.25,357.25],[1038.38,360.38],[1038.38,360.38],[1038.38,360.38],[1036.62,365.38],[1036.62,365.38],[1036.62,365.38],[1020.5,369.5],[1020.5,369.5],[1020.5,369.5],[1016.25,374.25],[1016.25,374.25],[1016.25,374.25],[1008.62,374.62],[1008.62,374.62],[1008.62,374.62],[1002.0,372.25],[1002.0,372.25],[1002.0,372.25],[993.62,373.62],[993.62,373.62],[993.62,373.62],[988.5,381.25],[988.5,381.25],[988.5,381.25],[985.62,391.5],[985.62,391.5],[985.62,391.5],[980.38,395.0],[980.38,395.0],[980.38,395.0],[977.75,401.62],[977.75,401.62],[977.75,401.62],[965.12,411.25],[965.12,411.25],[965.12,411.25],[963.62,425.12],[963.62,425.12],[963.62,425.12],[954.0,434.25],[954.0,434.25]]],['wuTower',[[954.0,434.25],[963.62,425.12],[963.62,425.12],[963.62,425.12],[965.12,411.25],[965.12,411.25],[965.12,411.25],[977.75,401.62],[977.75,401.62],[977.75,401.62],[980.38,395.0],[980.38,395.0],[980.38,395.0],[985.62,391.5],[985.62,391.5],[985.62,391.5],[988.5,381.25],[988.5,381.25],[988.5,381.25],[993.62,373.62],[993.62,373.62],[993.62,373.62],[1002.0,372.25],[1002.0,372.25],[1002.0,372.25],[1008.62,374.62],[1008.62,374.62],[1008.62,374.62],[1016.25,374.25],[1016.25,374.25],[1016.25,374.25],[1020.5,369.5],[1020.5,369.5],[1020.5,369.5],[1036.62,365.38],[1036.62,365.38],[1036.62,365.38],[1038.38,360.38],[1038.38,360.38],[1038.38,360.38],[1043.25,357.25],[1043.25,357.25],[1043.25,357.25],[1048.5,351.88],[1048.5,351.88],[1048.5,351.88],[1048.5,346.62],[1048.5,346.62],[1048.5,346.62],[1052.88,342.0],[1052.88,342.0],[1052.88,342.0],[1061.38,342.0],[1061.38,342.0],[1061.38,342.0],[1063.62,343.5],[1063.62,343.5],[1063.62,343.5],[1066.0,351.5],[1066.0,351.5],[1066.0,351.5],[1077.27,355.64],[1077.27,355.64],[1077.27,355.64],[1081.0,364.91],[1081.0,364.91],[1081.0,364.91],[1081.36,379.36],[1081.36,379.36],[1081.36,379.36],[1084.73,387.18],[1084.73,387.18],[1084.73,387.18],[1080.0,402.09],[1080.0,402.09],[1080.0,402.09],[1081.73,405.55],[1081.73,405.55],[1081.73,405.55],[1081.91,410.09],[1081.91,410.09],[1081.91,410.09],[1080.0,412.91],[1080.0,412.91],[1080.0,412.91],[1082.36,416.36],[1082.36,416.36],[1082.36,416.36],[1088.36,416.91],[1088.36,416.91],[1088.36,416.91],[1089.0,419.55],[1089.0,419.55],[1089.0,419.55],[1094.82,426.82],[1094.82,426.82],[1094.82,426.82],[1096.91,426.91],[1096.91,426.91],[1096.91,426.91],[1099.18,429.18],[1099.18,429.18],[1099.18,429.18],[1092.75,437.0],[1092.75,437.0],[1092.75,437.0],[1087.0,442.12],[1087.0,442.12],[1087.0,442.12],[1079.5,442.5],[1079.5,442.5],[1079.5,442.5],[1074.5,437.25],[1074.5,437.25],[1074.5,437.25],[1071.88,437.25],[1071.88,437.25],[1071.88,437.25],[1062.5,432.0],[1062.5,432.0],[1062.5,432.0],[1055.25,432.5],[1055.25,432.5],[1055.25,432.5],[1049.12,437.38],[1049.12,437.38],[1049.12,437.38],[1043.75,437.5],[1043.75,437.5],[1043.75,437.5],[1037.5,435.75],[1037.5,435.75],[1037.5,435.75],[1033.75,437.25],[1033.75,437.25],[1033.75,437.25],[1024.62,446.12],[1024.62,446.12],[1024.62,446.12],[1016.5,449.12],[1016.5,449.12],[1016.5,449.12],[1004.88,449.25],[1004.88,449.25],[1004.88,449.25],[996.5,455.75],[996.5,455.75],[996.5,455.75],[993.0,455.88],[993.0,455.88],[993.0,455.88],[979.75,449.62],[979.75,449.62],[979.75,449.62],[976.5,449.88],[976.5,449.88],[976.5,449.88],[972.5,456.0],[972.5,456.0],[972.5,456.0],[970.5,461.0],[970.5,461.0],[970.5,461.0],[968.0,463.45],[968.0,463.45],[968.0,463.45],[963.09,460.73],[963.09,460.73],[963.09,460.73],[955.27,460.18],[955.27,460.18],[955.27,460.18],[951.64,457.09],[951.64,457.09],[951.64,457.09],[950.91,453.82],[950.91,453.82],[950.91,453.82],[954.91,438.73],[954.91,438.73],[954.91,438.73],[954.0,434.25],[954.0,434.25]]],['sanctuary',[[951.64,457.09],[955.27,460.18],[955.27,460.18],[955.27,460.18],[963.09,460.73],[963.09,460.73],[963.09,460.73],[968.0,463.45],[968.0,463.45],[968.0,463.45],[971.27,465.82],[971.27,465.82],[971.27,465.82],[974.36,470.55],[974.36,470.55],[974.36,470.55],[975.45,476.73],[975.45,476.73],[975.45,476.73],[980.55,483.27],[980.55,483.27],[980.55,483.27],[983.82,489.27],[983.82,489.27],[983.82,489.27],[984.0,501.27],[984.0,501.27],[984.0,501.27],[981.09,511.09],[981.09,511.09],[981.09,511.09],[983.09,518.18],[983.09,518.18],[983.09,518.18],[988.91,527.27],[988.91,527.27],[988.91,527.27],[990.91,536.0],[990.91,536.0],[990.91,536.0],[994.0,543.25],[994.0,543.25],[994.0,543.25],[988.88,548.88],[988.88,548.88],[988.88,548.88],[985.64,548.64],[985.64,548.64],[985.64,548.64],[983.64,550.55],[983.64,550.55],[983.64,550.55],[982.55,553.82],[982.55,553.82],[982.55,553.82],[977.82,557.27],[977.82,557.27],[977.82,557.27],[971.09,559.0],[971.09,559.0],[971.09,559.0],[963.82,565.36],[963.82,565.36],[963.82,565.36],[960.18,566.55],[960.18,566.55],[960.18,566.55],[954.18,566.64],[954.18,566.64],[954.18,566.64],[950.64,561.64],[950.64,561.64],[950.64,561.64],[947.0,560.91],[947.0,560.91],[947.0,560.91],[938.91,556.73],[938.91,556.73],[938.91,556.73],[929.64,548.09],[929.64,548.09],[929.64,548.09],[927.27,547.27],[927.27,547.27],[927.27,547.27],[921.73,542.55],[921.73,542.55],[921.73,542.55],[917.45,541.55],[917.45,541.55],[917.45,541.55],[914.55,542.18],[914.55,542.18],[914.55,542.18],[908.45,548.18],[908.45,548.18],[908.45,548.18],[901.36,550.18],[901.36,550.18],[901.36,550.18],[897.82,550.64],[897.82,550.64],[897.82,550.64],[891.45,549.09],[891.45,549.09],[891.45,549.09],[885.82,548.91],[885.82,548.91],[885.82,548.91],[879.73,544.64],[879.73,544.64],[879.73,544.64],[868.18,543.18],[868.18,543.18],[868.18,543.18],[861.91,541.64],[861.91,541.64],[861.91,541.64],[856.18,543.45],[856.18,543.45],[856.18,543.45],[846.73,545.09],[846.73,545.09],[846.73,545.09],[838.55,547.82],[838.55,547.82],[838.55,547.82],[825.64,548.18],[825.64,548.18],[825.64,548.18],[820.55,545.64],[820.55,545.64],[820.55,545.64],[812.0,545.64],[812.0,545.64],[812.0,545.64],[808.55,547.27],[808.55,547.27],[808.55,547.27],[802.73,547.27],[802.73,547.27],[802.73,547.27],[794.55,542.18],[794.55,542.18],[794.55,542.18],[777.06,540.69],[777.06,540.69],[777.06,540.69],[779.62,535.25],[779.62,535.25],[779.62,535.25],[777.0,530.25],[777.0,530.25],[777.0,530.25],[773.0,523.75],[773.0,523.75],[773.0,523.75],[775.0,518.75],[775.0,518.75],[775.0,518.75],[781.5,512.25],[781.5,512.25],[781.5,512.25],[781.62,506.88],[781.62,506.88],[781.62,506.88],[780.88,501.75],[780.88,501.75],[780.88,501.75],[782.0,493.5],[782.0,493.5],[782.0,493.5],[789.12,486.38],[789.12,486.38],[789.12,486.38],[793.25,485.25],[793.25,485.25],[793.25,485.25],[795.25,482.5],[795.25,482.5],[795.25,482.5],[803.0,480.75],[803.0,480.75],[803.0,480.75],[809.75,474.75],[809.75,474.75],[809.75,474.75],[811.25,468.5],[811.25,468.5],[811.25,468.5],[811.06,460.56],[811.06,460.56],[811.06,460.56],[818.36,467.27],[818.36,467.27],[818.36,467.27],[828.0,467.27],[828.0,467.27],[828.0,467.27],[836.0,464.55],[836.0,464.55],[836.0,464.55],[838.55,460.36],[838.55,460.36],[838.55,460.36],[844.73,455.27],[844.73,455.27],[844.73,455.27],[854.73,454.18],[854.73,454.18],[854.73,454.18],[862.18,450.0],[862.18,450.0],[862.18,450.0],[872.36,439.27],[872.36,439.27],[872.36,439.27],[881.27,435.64],[881.27,435.64],[881.27,435.64],[886.55,437.09],[886.55,437.09],[886.55,437.09],[892.36,433.45],[892.36,433.45],[892.36,433.45],[901.45,433.82],[901.45,433.82],[901.45,433.82],[920.36,440.36],[920.36,440.36],[920.36,440.36],[929.27,448.18],[929.27,448.18],[929.27,448.18],[948.18,456.91],[948.18,456.91],[948.18,456.91],[951.64,457.09],[951.64,457.09]]],['orrington',[[990.88,551.38],[995.5,552.75],[995.5,552.75],[995.5,552.75],[997.38,554.75],[997.38,554.75],[997.38,554.75],[997.62,559.38],[997.62,559.38],[997.62,559.38],[991.62,564.12],[991.62,564.12],[991.62,564.12],[987.75,564.75],[987.75,564.75],[987.75,564.75],[979.12,570.25],[979.12,570.25],[979.12,570.25],[973.25,571.88],[973.25,571.88],[973.25,571.88],[971.62,576.0],[971.62,576.0],[971.62,576.0],[966.0,581.88],[966.0,581.88],[966.0,581.88],[962.88,582.88],[962.88,582.88],[962.88,582.88],[960.0,580.62],[960.0,580.62],[960.0,580.62],[954.38,580.88],[954.38,580.88],[954.38,580.88],[950.62,584.12],[950.62,584.12],[950.62,584.12],[952.88,587.5],[952.88,587.5],[952.88,587.5],[952.62,594.25],[952.62,594.25],[952.62,594.25],[958.91,600.91],[958.91,600.91],[958.91,600.91],[962.27,606.36],[962.27,606.36],[962.27,606.36],[961.91,610.64],[961.91,610.64],[961.91,610.64],[957.18,615.09],[957.18,615.09],[957.18,615.09],[951.91,618.73],[951.91,618.73],[951.91,618.73],[952.0,624.36],[952.0,624.36],[952.0,624.36],[950.91,625.55],[950.91,625.55],[950.91,625.55],[951.18,631.09],[951.18,631.09],[951.18,631.09],[954.12,637.38],[954.12,637.38],[954.12,637.38],[956.62,642.5],[956.62,642.5],[956.62,642.5],[956.75,655.0],[956.75,655.0],[956.75,655.0],[967.5,663.12],[967.5,663.12],[967.5,663.12],[962.75,669.0],[962.75,669.0],[962.75,669.0],[961.12,676.0],[961.12,676.0],[961.12,676.0],[957.62,678.0],[957.62,678.0],[957.62,678.0],[952.75,686.38],[952.75,686.38],[952.75,686.38],[950.0,690.12],[950.0,690.12],[950.0,690.12],[946.62,690.62],[946.62,690.62],[946.62,690.62],[945.12,694.62],[945.12,694.62],[945.12,694.62],[934.62,698.25],[934.62,698.25],[934.62,698.25],[932.62,702.38],[932.62,702.38],[932.62,702.38],[929.12,703.5],[929.12,703.5],[929.12,703.5],[927.5,709.38],[927.5,709.38],[927.5,709.38],[924.38,710.12],[924.38,710.12],[924.38,710.12],[919.62,708.75],[919.62,708.75],[919.62,708.75],[916.38,710.75],[916.38,710.75],[916.38,710.75],[917.5,713.38],[917.5,713.38],[917.5,713.38],[913.75,717.5],[913.75,717.5],[913.75,717.5],[909.25,719.75],[909.25,719.75],[909.25,719.75],[908.62,715.38],[908.62,715.38],[908.62,715.38],[903.0,702.88],[903.0,702.88],[903.0,702.88],[894.0,690.55],[894.0,690.55],[894.0,690.55],[893.45,688.36],[893.45,688.36],[893.45,688.36],[887.45,681.27],[887.45,681.27],[887.45,681.27],[884.73,674.55],[884.73,674.55],[884.73,674.55],[884.55,668.73],[884.55,668.73],[884.55,668.73],[879.45,661.27],[879.45,661.27],[879.45,661.27],[880.0,656.36],[880.0,656.36],[880.0,656.36],[877.64,651.82],[877.64,651.82],[877.64,651.82],[877.09,649.27],[877.09,649.27],[877.09,649.27],[872.91,645.82],[872.91,645.82],[872.91,645.82],[874.18,642.73],[874.18,642.73],[874.18,642.73],[875.09,630.55],[875.09,630.55],[875.09,630.55],[872.91,625.64],[872.91,625.64],[872.91,625.64],[867.27,622.73],[867.27,622.73],[867.27,622.73],[851.45,622.0],[851.45,622.0],[851.45,622.0],[848.36,621.27],[848.36,621.27],[848.36,621.27],[844.55,623.82],[844.55,623.82],[844.55,623.82],[844.36,625.82],[844.36,625.82],[844.36,625.82],[838.09,630.0],[838.09,630.0],[838.09,630.0],[832.25,630.25],[832.25,630.25],[832.25,630.25],[828.0,627.25],[828.0,627.25],[828.0,627.25],[821.75,620.25],[821.75,620.25],[821.75,620.25],[815.36,616.64],[815.36,616.64],[815.36,616.64],[809.75,606.75],[809.75,606.75],[809.75,606.75],[803.25,600.5],[803.25,600.5],[803.25,600.5],[803.0,595.0],[803.0,595.0],[803.0,595.0],[808.0,591.75],[808.0,591.75],[808.0,591.75],[809.75,585.0],[809.75,585.0],[809.75,585.0],[806.0,574.5],[806.0,574.5],[806.0,574.5],[799.0,566.25],[799.0,566.25],[799.0,566.25],[788.25,563.0],[788.25,563.0],[788.25,563.0],[780.0,559.0],[780.0,559.0],[780.0,559.0],[776.0,554.55],[776.0,554.55],[776.0,554.55],[755.36,552.64],[755.36,552.64],[755.36,552.64],[752.55,550.09],[752.55,550.09],[752.55,550.09],[752.91,548.0],[752.91,548.0],[752.91,548.0],[759.36,541.18],[759.36,541.18],[759.36,541.18],[764.73,541.18],[764.73,541.18],[764.73,541.18],[770.27,544.0],[770.27,544.0],[770.27,544.0],[774.09,543.82],[774.09,543.82],[774.09,543.82],[777.06,540.69],[777.06,540.69],[777.06,540.69],[794.55,542.18],[794.55,542.18],[794.55,542.18],[802.73,547.27],[802.73,547.27],[802.73,547.27],[808.55,547.27],[808.55,547.27],[808.55,547.27],[812.0,545.64],[812.0,545.64],[812.0,545.64],[820.55,545.64],[820.55,545.64],[820.55,545.64],[825.64,548.18],[825.64,548.18],[825.64,548.18],[838.55,547.82],[838.55,547.82],[838.55,547.82],[846.73,545.09],[846.73,545.09],[846.73,545.09],[856.18,543.45],[856.18,543.45],[856.18,543.45],[861.91,541.64],[861.91,541.64],[861.91,541.64],[868.18,543.18],[868.18,543.18],[868.18,543.18],[879.73,544.64],[879.73,544.64],[879.73,544.64],[885.82,548.91],[885.82,548.91],[885.82,548.91],[891.45,549.09],[891.45,549.09],[891.45,549.09],[897.82,550.64],[897.82,550.64],[897.82,550.64],[901.36,550.18],[901.36,550.18],[901.36,550.18],[908.45,548.18],[908.45,548.18],[908.45,548.18],[914.55,542.18],[914.55,542.18],[914.55,542.18],[917.45,541.55],[917.45,541.55],[917.45,541.55],[921.73,542.55],[921.73,542.55],[921.73,542.55],[927.27,547.27],[927.27,547.27],[927.27,547.27],[929.64,548.09],[929.64,548.09],[929.64,548.09],[938.91,556.73],[938.91,556.73],[938.91,556.73],[947.0,560.91],[947.0,560.91],[947.0,560.91],[950.64,561.64],[950.64,561.64],[950.64,561.64],[954.18,566.64],[954.18,566.64],[954.18,566.64],[960.18,566.55],[960.18,566.55],[960.18,566.55],[963.82,565.36],[963.82,565.36],[963.82,565.36],[971.09,559.0],[971.09,559.0],[971.09,559.0],[977.82,557.27],[977.82,557.27],[977.82,557.27],[982.55,553.82],[982.55,553.82],[982.55,553.82],[983.64,550.55],[983.64,550.55],[983.64,550.55],[985.64,548.64],[985.64,548.64],[985.64,548.64],[988.88,548.88],[988.88,548.88],[988.88,548.88],[990.88,551.38],[990.88,551.38]]],['saltpan',[[994.0,543.25],[995.82,540.36],[995.82,540.36],[995.82,540.36],[1000.0,536.73],[1000.0,536.73],[1000.0,536.73],[1001.27,533.82],[1001.27,533.82],[1001.27,533.82],[1007.82,532.91],[1007.82,532.91],[1007.82,532.91],[1013.09,533.64],[1013.09,533.64],[1013.09,533.64],[1018.55,537.09],[1018.55,537.09],[1018.55,537.09],[1026.18,537.45],[1026.18,537.45],[1026.18,537.45],[1036.73,540.91],[1036.73,540.91],[1036.73,540.91],[1052.0,541.64],[1052.0,541.64],[1052.0,541.64],[1056.55,543.09],[1056.55,543.09],[1056.55,543.09],[1059.82,546.55],[1059.82,546.55],[1059.82,546.55],[1061.45,552.73],[1061.45,552.73],[1061.45,552.73],[1066.36,560.0],[1066.36,560.0],[1066.36,560.0],[1069.27,561.82],[1069.27,561.82],[1069.27,561.82],[1068.73,566.73],[1068.73,566.73],[1068.73,566.73],[1069.88,570.75],[1069.88,570.75],[1069.88,570.75],[1067.82,571.55],[1067.82,571.55],[1067.82,571.55],[1065.64,573.45],[1065.64,573.45],[1065.64,573.45],[1065.19,576.88],[1065.19,576.88],[1065.19,576.88],[1065.88,582.19],[1065.88,582.19],[1065.88,582.19],[1063.36,587.18],[1063.36,587.18],[1063.36,587.18],[1059.36,591.18],[1059.36,591.18],[1059.36,591.18],[1057.81,593.88],[1057.81,593.88],[1057.81,593.88],[1057.75,597.06],[1057.75,597.06],[1057.75,597.06],[1062.09,602.91],[1062.09,602.91],[1062.09,602.91],[1065.56,608.88],[1065.56,608.88],[1065.56,608.88],[1065.62,611.75],[1065.62,611.75],[1065.62,611.75],[1063.62,614.62],[1063.62,614.62],[1063.62,614.62],[1055.82,613.09],[1055.82,613.09],[1055.82,613.09],[1050.0,615.91],[1050.0,615.91],[1050.0,615.91],[1045.27,615.73],[1045.27,615.73],[1045.27,615.73],[1039.45,621.36],[1039.45,621.36],[1039.45,621.36],[1035.55,621.27],[1035.55,621.27],[1035.55,621.27],[1033.45,624.18],[1033.45,624.18],[1033.45,624.18],[1030.73,624.45],[1030.73,624.45],[1030.73,624.45],[1030.09,628.36],[1030.09,628.36],[1030.09,628.36],[1019.45,631.64],[1019.45,631.64],[1019.45,631.64],[1015.55,629.55],[1015.55,629.55],[1015.55,629.55],[1014.82,618.82],[1014.82,618.82],[1014.82,618.82],[1010.91,617.82],[1010.91,617.82],[1010.91,617.82],[1009.27,621.09],[1009.27,621.09],[1009.27,621.09],[1003.45,623.18],[1003.45,623.18],[1003.45,623.18],[1000.18,622.27],[1000.18,622.27],[1000.18,622.27],[999.82,617.45],[999.82,617.45],[999.82,617.45],[995.91,612.36],[995.91,612.36],[995.91,612.36],[986.91,610.55],[986.91,610.55],[986.91,610.55],[985.64,612.64],[985.64,612.64],[985.64,612.64],[987.55,617.27],[987.55,617.27],[987.55,617.27],[981.45,622.45],[981.45,622.45],[981.45,622.45],[972.38,621.62],[972.38,621.62],[972.38,621.62],[971.25,629.12],[971.25,629.12],[971.25,629.12],[965.62,633.5],[965.62,633.5],[965.62,633.5],[961.38,633.62],[961.38,633.62],[961.38,633.62],[957.0,637.25],[957.0,637.25],[957.0,637.25],[954.12,637.38],[954.12,637.38],[954.12,637.38],[951.18,631.09],[951.18,631.09],[951.18,631.09],[950.91,625.55],[950.91,625.55],[950.91,625.55],[952.0,624.36],[952.0,624.36],[952.0,624.36],[951.91,618.73],[951.91,618.73],[951.91,618.73],[957.18,615.09],[957.18,615.09],[957.18,615.09],[961.91,610.64],[961.91,610.64],[961.91,610.64],[962.27,606.36],[962.27,606.36],[962.27,606.36],[958.91,600.91],[958.91,600.91],[958.91,600.91],[952.62,594.25],[952.62,594.25],[952.62,594.25],[952.88,587.5],[952.88,587.5],[952.88,587.5],[950.62,584.12],[950.62,584.12],[950.62,584.12],[954.38,580.88],[954.38,580.88],[954.38,580.88],[960.0,580.62],[960.0,580.62],[960.0,580.62],[962.88,582.88],[962.88,582.88],[962.88,582.88],[966.0,581.88],[966.0,581.88],[966.0,581.88],[971.62,576.0],[971.62,576.0],[971.62,576.0],[973.25,571.88],[973.25,571.88],[973.25,571.88],[979.12,570.25],[979.12,570.25],[979.12,570.25],[987.75,564.75],[987.75,564.75],[987.75,564.75],[991.62,564.12],[991.62,564.12],[991.62,564.12],[997.62,559.38],[997.62,559.38],[997.62,559.38],[997.38,554.75],[997.38,554.75],[997.38,554.75],[995.5,552.75],[995.5,552.75],[995.5,552.75],[990.88,551.38],[990.88,551.38],[990.88,551.38],[988.88,548.88],[988.88,548.88],[988.88,548.88],[994.0,543.25],[994.0,543.25]]],['qinjuru',[[990.91,536.0],[988.91,527.27],[988.91,527.27],[988.91,527.27],[983.09,518.18],[983.09,518.18],[983.09,518.18],[981.09,511.09],[981.09,511.09],[981.09,511.09],[984.0,501.27],[984.0,501.27],[984.0,501.27],[983.82,489.27],[983.82,489.27],[983.82,489.27],[980.55,483.27],[980.55,483.27],[980.55,483.27],[975.45,476.73],[975.45,476.73],[975.45,476.73],[974.36,470.55],[974.36,470.55],[974.36,470.55],[971.27,465.82],[971.27,465.82],[971.27,465.82],[968.0,463.45],[968.0,463.45],[968.0,463.45],[970.5,461.0],[970.5,461.0],[970.5,461.0],[972.5,456.0],[972.5,456.0],[972.5,456.0],[976.5,449.88],[976.5,449.88],[976.5,449.88],[979.75,449.62],[979.75,449.62],[979.75,449.62],[993.0,455.88],[993.0,455.88],[993.0,455.88],[996.5,455.75],[996.5,455.75],[996.5,455.75],[1004.88,449.25],[1004.88,449.25],[1004.88,449.25],[1016.5,449.12],[1016.5,449.12],[1016.5,449.12],[1024.62,446.12],[1024.62,446.12],[1024.62,446.12],[1033.75,437.25],[1033.75,437.25],[1033.75,437.25],[1037.5,435.75],[1037.5,435.75],[1037.5,435.75],[1043.75,437.5],[1043.75,437.5],[1043.75,437.5],[1049.12,437.38],[1049.12,437.38],[1049.12,437.38],[1055.25,432.5],[1055.25,432.5],[1055.25,432.5],[1062.5,432.0],[1062.5,432.0],[1062.5,432.0],[1071.88,437.25],[1071.88,437.25],[1071.88,437.25],[1074.5,437.25],[1074.5,437.25],[1074.5,437.25],[1079.5,442.5],[1079.5,442.5],[1079.5,442.5],[1087.0,442.12],[1087.0,442.12],[1087.0,442.12],[1092.75,437.0],[1092.75,437.0],[1092.75,437.0],[1099.18,429.18],[1099.18,429.18],[1099.18,429.18],[1106.64,437.09],[1106.64,437.09],[1106.64,437.09],[1112.82,441.18],[1112.82,441.18],[1112.82,441.18],[1121.09,441.0],[1121.09,441.0],[1121.09,441.0],[1125.09,445.27],[1125.09,445.27],[1125.09,445.27],[1126.36,454.36],[1126.36,454.36],[1126.36,454.36],[1129.73,458.91],[1129.73,458.91],[1129.73,458.91],[1132.55,458.82],[1132.55,458.82],[1132.55,458.82],[1141.0,449.18],[1141.0,449.18],[1141.0,449.18],[1143.55,448.82],[1143.55,448.82],[1143.55,448.82],[1149.55,441.73],[1149.55,441.73],[1149.55,441.73],[1151.73,441.09],[1151.73,441.09],[1151.73,441.09],[1157.73,434.55],[1157.73,434.55],[1157.73,434.55],[1159.88,433.88],[1159.88,433.88],[1159.88,433.88],[1159.12,439.38],[1159.12,439.38],[1159.12,439.38],[1153.25,448.25],[1153.25,448.25],[1153.25,448.25],[1153.25,453.12],[1153.25,453.12],[1153.25,453.12],[1145.88,461.88],[1145.88,461.88],[1145.88,461.88],[1147.0,473.75],[1147.0,473.75],[1147.0,473.75],[1152.5,480.38],[1152.5,480.38],[1152.5,480.38],[1152.25,486.12],[1152.25,486.12],[1152.25,486.12],[1147.5,492.25],[1147.5,492.25],[1147.5,492.25],[1146.38,498.0],[1146.38,498.0],[1146.38,498.0],[1140.38,504.25],[1140.38,504.25],[1140.38,504.25],[1135.0,506.0],[1135.0,506.0],[1135.0,506.0],[1134.25,510.5],[1134.25,510.5],[1134.25,510.5],[1131.25,517.25],[1131.25,517.25],[1131.25,517.25],[1131.38,521.75],[1131.38,521.75],[1131.38,521.75],[1136.25,529.5],[1136.25,529.5],[1136.25,529.5],[1136.5,535.25],[1136.5,535.25],[1136.5,535.25],[1139.25,542.0],[1139.25,542.0],[1139.25,542.0],[1136.88,547.0],[1136.88,547.0],[1136.88,547.0],[1132.12,547.5],[1132.12,547.5],[1132.12,547.5],[1127.38,549.62],[1127.38,549.62],[1127.38,549.62],[1123.12,553.0],[1123.12,553.0],[1123.12,553.0],[1112.88,551.88],[1112.88,551.88],[1112.88,551.88],[1109.62,556.5],[1109.62,556.5],[1109.62,556.5],[1109.5,564.38],[1109.5,564.38],[1109.5,564.38],[1107.62,568.75],[1107.62,568.75],[1107.62,568.75],[1103.75,569.88],[1103.75,569.88],[1103.75,569.88],[1104.12,574.5],[1104.12,574.5],[1104.12,574.5],[1100.75,577.0],[1100.75,577.0],[1100.75,577.0],[1100.75,585.0],[1100.75,585.0],[1100.75,585.0],[1096.38,585.88],[1096.38,585.88],[1096.38,585.88],[1091.75,580.12],[1091.75,580.12],[1091.75,580.12],[1080.0,572.5],[1080.0,572.5],[1080.0,572.5],[1076.75,571.38],[1076.75,571.38],[1076.75,571.38],[1074.38,572.75],[1074.38,572.75],[1074.38,572.75],[1069.88,570.75],[1069.88,570.75],[1069.88,570.75],[1068.73,566.73],[1068.73,566.73],[1068.73,566.73],[1069.27,561.82],[1069.27,561.82],[1069.27,561.82],[1066.36,560.0],[1066.36,560.0],[1066.36,560.0],[1061.45,552.73],[1061.45,552.73],[1061.45,552.73],[1059.82,546.55],[1059.82,546.55],[1059.82,546.55],[1056.55,543.09],[1056.55,543.09],[1056.55,543.09],[1052.0,541.64],[1052.0,541.64],[1052.0,541.64],[1036.73,540.91],[1036.73,540.91],[1036.73,540.91],[1026.18,537.45],[1026.18,537.45],[1026.18,537.45],[1018.55,537.09],[1018.55,537.09],[1018.55,537.09],[1013.09,533.64],[1013.09,533.64],[1013.09,533.64],[1007.82,532.91],[1007.82,532.91],[1007.82,532.91],[1001.27,533.82],[1001.27,533.82],[1001.27,533.82],[1000.0,536.73],[1000.0,536.73],[1000.0,536.73],[995.82,540.36],[995.82,540.36],[995.82,540.36],[994.0,543.25],[994.0,543.25],[994.0,543.25],[990.91,536.0],[990.91,536.0]]],['jingshan',[[1177.88,441.62],[1172.5,444.75],[1172.5,444.75],[1172.5,444.75],[1169.0,442.75],[1169.0,442.75],[1169.0,442.75],[1170.38,437.38],[1170.38,437.38],[1170.38,437.38],[1168.0,428.75],[1168.0,428.75],[1168.0,428.75],[1159.88,433.88],[1159.88,433.88],[1159.88,433.88],[1157.73,434.55],[1157.73,434.55],[1157.73,434.55],[1151.73,441.09],[1151.73,441.09],[1151.73,441.09],[1149.55,441.73],[1149.55,441.73],[1149.55,441.73],[1143.55,448.82],[1143.55,448.82],[1143.55,448.82],[1141.0,449.18],[1141.0,449.18],[1141.0,449.18],[1132.55,458.82],[1132.55,458.82],[1132.55,458.82],[1129.73,458.91],[1129.73,458.91],[1129.73,458.91],[1126.36,454.36],[1126.36,454.36],[1126.36,454.36],[1125.09,445.27],[1125.09,445.27],[1125.09,445.27],[1121.09,441.0],[1121.09,441.0],[1121.09,441.0],[1112.82,441.18],[1112.82,441.18],[1112.82,441.18],[1106.64,437.09],[1106.64,437.09],[1106.64,437.09],[1099.18,429.18],[1099.18,429.18],[1099.18,429.18],[1096.91,426.91],[1096.91,426.91],[1096.91,426.91],[1094.82,426.82],[1094.82,426.82],[1094.82,426.82],[1089.0,419.55],[1089.0,419.55],[1089.0,419.55],[1088.36,416.91],[1088.36,416.91],[1088.36,416.91],[1082.36,416.36],[1082.36,416.36],[1082.36,416.36],[1080.0,412.91],[1080.0,412.91],[1080.0,412.91],[1081.91,410.09],[1081.91,410.09],[1081.91,410.09],[1081.73,405.55],[1081.73,405.55],[1081.73,405.55],[1080.0,402.09],[1080.0,402.09],[1080.0,402.09],[1084.73,387.18],[1084.73,387.18],[1084.73,387.18],[1081.36,379.36],[1081.36,379.36],[1081.36,379.36],[1081.0,364.91],[1081.0,364.91],[1081.0,364.91],[1077.27,355.64],[1077.27,355.64],[1077.27,355.64],[1077.5,351.0],[1077.5,351.0],[1077.5,351.0],[1083.75,343.0],[1083.75,343.0],[1083.75,343.0],[1087.62,340.5],[1087.62,340.5],[1087.62,340.5],[1092.38,339.12],[1092.38,339.12],[1092.38,339.12],[1096.88,333.0],[1096.88,333.0],[1096.88,333.0],[1098.5,323.0],[1098.5,323.0],[1098.5,323.0],[1104.62,316.0],[1104.62,316.0],[1104.62,316.0],[1115.75,312.0],[1115.75,312.0],[1115.75,312.0],[1123.62,305.75],[1123.62,305.75],[1123.62,305.75],[1124.25,303.0],[1124.25,303.0],[1124.25,303.0],[1130.75,295.88],[1130.75,295.88],[1130.75,295.88],[1137.88,292.75],[1137.88,292.75],[1137.88,292.75],[1138.62,285.0],[1138.62,285.0],[1138.62,285.0],[1134.25,279.5],[1134.25,279.5],[1134.25,279.5],[1134.25,269.62],[1134.25,269.62],[1134.25,269.62],[1132.38,264.25],[1132.38,264.25],[1132.38,264.25],[1126.38,258.75],[1126.38,258.75],[1126.38,258.75],[1113.62,247.88],[1113.62,247.88],[1113.62,247.88],[1111.75,244.12],[1111.75,244.12],[1111.75,244.12],[1122.5,244.0],[1122.5,244.0],[1122.5,244.0],[1132.38,241.75],[1132.38,241.75],[1132.38,241.75],[1133.62,239.88],[1133.62,239.88],[1133.62,239.88],[1140.0,233.62],[1140.0,233.62],[1140.0,233.62],[1144.88,233.62],[1144.88,233.62],[1144.88,233.62],[1152.88,239.0],[1152.88,239.0],[1152.88,239.0],[1161.12,239.25],[1161.12,239.25],[1161.12,239.25],[1163.88,237.12],[1163.88,237.12],[1163.88,237.12],[1169.38,237.5],[1169.38,237.5],[1169.38,237.5],[1176.25,241.0],[1176.25,241.0],[1176.25,241.0],[1189.25,245.0],[1189.25,245.0],[1189.25,245.0],[1196.5,252.25],[1196.5,252.25],[1196.5,252.25],[1200.25,252.75],[1200.25,252.75],[1200.25,252.75],[1203.18,249.64],[1203.18,249.64],[1203.18,249.64],[1207.45,264.36],[1207.45,264.36],[1207.45,264.36],[1214.91,274.0],[1214.91,274.0],[1214.91,274.0],[1216.09,277.27],[1216.09,277.27],[1216.09,277.27],[1216.27,288.0],[1216.27,288.0],[1216.27,288.0],[1212.0,294.09],[1212.0,294.09],[1212.0,294.09],[1212.36,301.55],[1212.36,301.55],[1212.36,301.55],[1209.09,305.73],[1209.09,305.73],[1209.09,305.73],[1205.82,305.64],[1205.82,305.64],[1205.82,305.64],[1203.36,307.45],[1203.36,307.45],[1203.36,307.45],[1205.09,310.18],[1205.09,310.18],[1205.09,310.18],[1200.36,316.55],[1200.36,316.55],[1200.36,316.55],[1199.64,318.91],[1199.64,318.91],[1199.64,318.91],[1196.55,322.0],[1196.55,322.0],[1196.55,322.0],[1195.82,327.27],[1195.82,327.27],[1195.82,327.27],[1196.55,335.27],[1196.55,335.27],[1196.55,335.27],[1203.09,346.18],[1203.09,346.18],[1203.09,346.18],[1205.64,353.82],[1205.64,353.82],[1205.64,353.82],[1210.91,362.18],[1210.91,362.18],[1210.91,362.18],[1211.09,367.27],[1211.09,367.27],[1211.09,367.27],[1212.36,370.55],[1212.36,370.55],[1212.36,370.55],[1212.91,385.82],[1212.91,385.82],[1212.91,385.82],[1212.18,398.73],[1212.18,398.73],[1212.18,398.73],[1208.91,406.36],[1208.91,406.36],[1208.91,406.36],[1208.73,409.64],[1208.73,409.64],[1208.73,409.64],[1200.73,431.27],[1200.73,431.27],[1200.73,431.27],[1200.73,437.09],[1200.73,437.09],[1200.73,437.09],[1198.0,440.18],[1198.0,440.18],[1198.0,440.18],[1198.36,446.18],[1198.36,446.18],[1198.36,446.18],[1197.27,449.64],[1197.27,449.64],[1197.27,449.64],[1197.09,470.91],[1197.09,470.91],[1197.09,470.91],[1193.88,473.0],[1193.88,473.0],[1193.88,473.0],[1189.88,468.75],[1189.88,468.75],[1189.88,468.75],[1186.12,456.88],[1186.12,456.88],[1186.12,456.88],[1183.75,453.0],[1183.75,453.0],[1183.75,453.0],[1185.12,447.25],[1185.12,447.25],[1185.12,447.25],[1180.62,443.12],[1180.62,443.12]]],['cusichaca',[[1203.36,307.45],[1205.82,305.64],[1205.82,305.64],[1205.82,305.64],[1209.09,305.73],[1209.09,305.73],[1209.09,305.73],[1212.36,301.55],[1212.36,301.55],[1212.36,301.55],[1212.0,294.09],[1212.0,294.09],[1212.0,294.09],[1216.27,288.0],[1216.27,288.0],[1216.27,288.0],[1216.09,277.27],[1216.09,277.27],[1216.09,277.27],[1214.91,274.0],[1214.91,274.0],[1214.91,274.0],[1207.45,264.36],[1207.45,264.36],[1207.45,264.36],[1203.18,249.64],[1203.18,249.64],[1203.18,249.64],[1204.91,246.36],[1204.91,246.36],[1204.91,246.36],[1205.09,229.82],[1205.09,229.82],[1205.09,229.82],[1200.91,222.0],[1200.91,222.0],[1200.91,222.0],[1200.91,217.27],[1200.91,217.27],[1200.91,217.27],[1211.27,212.73],[1211.27,212.73],[1211.27,212.73],[1212.55,210.73],[1212.55,210.73],[1212.55,210.73],[1223.45,211.09],[1223.45,211.09],[1223.45,211.09],[1225.27,209.09],[1225.27,209.09],[1225.27,209.09],[1237.45,208.73],[1237.45,208.73],[1237.45,208.73],[1239.64,214.18],[1239.64,214.18],[1239.64,214.18],[1245.27,211.82],[1245.27,211.82],[1245.27,211.82],[1248.91,206.0],[1248.91,206.0],[1248.91,206.0],[1248.73,179.09],[1248.73,179.09],[1248.73,179.09],[1250.73,169.82],[1250.73,169.82],[1250.73,169.82],[1255.45,164.55],[1255.45,164.55],[1255.45,164.55],[1264.0,163.09],[1264.0,163.09],[1264.0,163.09],[1266.18,161.09],[1266.18,161.09],[1266.18,161.09],[1272.18,159.27],[1272.18,159.27],[1272.18,159.27],[1277.45,163.64],[1277.45,163.64],[1277.45,163.64],[1283.27,164.36],[1283.27,164.36],[1283.27,164.36],[1288.36,159.64],[1288.36,159.64],[1288.36,159.64],[1294.73,159.09],[1294.73,159.09],[1294.73,159.09],[1298.55,160.91],[1298.55,160.91],[1298.55,160.91],[1328.18,161.82],[1328.18,161.82],[1328.18,161.82],[1337.27,158.0],[1337.27,158.0],[1337.27,158.0],[1345.64,158.0],[1345.64,158.0],[1345.64,158.0],[1353.82,168.0],[1353.82,168.0],[1353.82,168.0],[1354.09,171.27],[1354.09,171.27],[1354.09,171.27],[1357.0,177.09],[1357.0,177.09],[1357.0,177.09],[1356.82,183.27],[1356.82,183.27],[1356.82,183.27],[1354.18,188.18],[1354.18,188.18],[1354.18,188.18],[1359.36,196.64],[1359.36,196.64],[1359.36,196.64],[1367.09,197.36],[1367.09,197.36],[1367.09,197.36],[1373.36,206.09],[1373.36,206.09],[1373.36,206.09],[1370.18,208.64],[1370.18,208.64],[1370.18,208.64],[1370.0,211.27],[1370.0,211.27],[1370.0,211.27],[1376.18,217.82],[1376.18,217.82],[1376.18,217.82],[1377.09,222.73],[1377.09,222.73],[1377.09,222.73],[1380.55,225.64],[1380.55,225.64],[1380.55,225.64],[1386.18,227.45],[1386.18,227.45],[1386.18,227.45],[1388.36,229.27],[1388.36,229.27],[1388.36,229.27],[1393.09,230.55],[1393.09,230.55],[1393.09,230.55],[1393.27,235.27],[1393.27,235.27],[1393.27,235.27],[1395.82,241.09],[1395.82,241.09],[1395.82,241.09],[1393.27,248.0],[1393.27,248.0],[1393.27,248.0],[1395.64,262.91],[1395.64,262.91],[1395.64,262.91],[1392.91,267.27],[1392.91,267.27],[1392.91,267.27],[1390.55,267.45],[1390.55,267.45],[1390.55,267.45],[1388.55,265.64],[1388.55,265.64],[1388.55,265.64],[1381.09,261.82],[1381.09,261.82],[1381.09,261.82],[1374.73,260.91],[1374.73,260.91],[1374.73,260.91],[1366.73,253.82],[1366.73,253.82],[1366.73,253.82],[1357.45,251.45],[1357.45,251.45],[1357.45,251.45],[1351.09,255.45],[1351.09,255.45],[1351.09,255.45],[1350.73,258.55],[1350.73,258.55],[1350.73,258.55],[1348.0,262.36],[1348.0,262.36],[1348.0,262.36],[1343.27,262.55],[1343.27,262.55],[1343.27,262.55],[1336.36,271.09],[1336.36,271.09],[1336.36,271.09],[1326.91,271.82],[1326.91,271.82],[1326.91,271.82],[1326.36,276.36],[1326.36,276.36],[1326.36,276.36],[1321.27,279.27],[1321.27,279.27],[1321.27,279.27],[1314.73,277.45],[1314.73,277.45],[1314.73,277.45],[1311.64,280.91],[1311.64,280.91],[1311.64,280.91],[1305.45,281.64],[1305.45,281.64],[1305.45,281.64],[1304.91,286.36],[1304.91,286.36],[1304.91,286.36],[1299.64,290.91],[1299.64,290.91],[1299.64,290.91],[1296.91,290.91],[1296.91,290.91],[1296.91,290.91],[1291.09,300.0],[1291.09,300.0],[1291.09,300.0],[1291.27,309.64],[1291.27,309.64],[1291.27,309.64],[1283.82,311.09],[1283.82,311.09],[1283.82,311.09],[1278.36,317.27],[1278.36,317.27],[1278.36,317.27],[1276.91,325.18],[1276.91,325.18],[1276.91,325.18],[1272.55,321.82],[1272.55,321.82],[1272.55,321.82],[1270.82,316.27],[1270.82,316.27],[1270.82,316.27],[1267.82,316.0],[1267.82,316.0],[1267.82,316.0],[1264.73,308.73],[1264.73,308.73],[1264.73,308.73],[1266.27,304.09],[1266.27,304.09],[1266.27,304.09],[1263.45,301.64],[1263.45,301.64],[1263.45,301.64],[1261.0,302.18],[1261.0,302.18],[1261.0,302.18],[1255.55,305.82],[1255.55,305.82],[1255.55,305.82],[1253.09,305.36],[1253.09,305.36],[1253.09,305.36],[1249.64,301.0],[1249.64,301.0],[1249.64,301.0],[1243.36,299.36],[1243.36,299.36],[1243.36,299.36],[1234.64,300.27],[1234.64,300.27],[1234.64,300.27],[1230.27,305.27],[1230.27,305.27],[1230.27,305.27],[1222.36,305.55],[1222.36,305.55],[1222.36,305.55],[1220.73,313.27],[1220.73,313.27],[1220.73,313.27],[1217.0,313.73],[1217.0,313.73],[1217.0,313.73],[1214.64,315.09],[1214.64,315.09],[1214.64,315.09],[1205.09,310.18],[1205.09,310.18],[1205.09,310.18],[1203.36,307.45],[1203.36,307.45]]],['hongshiCoast',[[1200.36,316.55],[1199.64,318.91],[1199.64,318.91],[1199.64,318.91],[1196.55,322.0],[1196.55,322.0],[1196.55,322.0],[1195.82,327.27],[1195.82,327.27],[1195.82,327.27],[1196.55,335.27],[1196.55,335.27],[1196.55,335.27],[1203.09,346.18],[1203.09,346.18],[1203.09,346.18],[1205.64,353.82],[1205.64,353.82],[1205.64,353.82],[1210.91,362.18],[1210.91,362.18],[1210.91,362.18],[1211.09,367.27],[1211.09,367.27],[1211.09,367.27],[1212.36,370.55],[1212.36,370.55],[1212.36,370.55],[1212.91,385.82],[1212.91,385.82],[1212.91,385.82],[1212.18,398.73],[1212.18,398.73],[1212.18,398.73],[1208.91,406.36],[1208.91,406.36],[1208.91,406.36],[1208.73,409.64],[1208.73,409.64],[1208.73,409.64],[1200.73,431.27],[1200.73,431.27],[1200.73,431.27],[1200.73,437.09],[1200.73,437.09],[1200.73,437.09],[1198.0,440.18],[1198.0,440.18],[1198.0,440.18],[1198.36,446.18],[1198.36,446.18],[1198.36,446.18],[1197.27,449.64],[1197.27,449.64],[1197.27,449.64],[1197.09,470.91],[1197.09,470.91],[1197.09,470.91],[1204.73,488.73],[1204.73,488.73],[1204.73,488.73],[1213.09,495.64],[1213.09,495.64],[1213.09,495.64],[1220.0,506.91],[1220.0,506.91],[1220.0,506.91],[1221.25,514.75],[1221.25,514.75],[1221.25,514.75],[1223.0,527.36],[1223.0,527.36],[1223.0,527.36],[1230.45,538.82],[1230.45,538.82],[1230.45,538.82],[1236.27,538.82],[1236.27,538.82],[1236.27,538.82],[1242.09,534.27],[1242.09,534.27],[1242.09,534.27],[1243.18,528.27],[1243.18,528.27],[1243.18,528.27],[1255.36,529.73],[1255.36,529.73],[1255.36,529.73],[1266.25,527.38],[1266.25,527.38],[1266.25,527.38],[1279.75,526.62],[1279.75,526.62],[1279.75,526.62],[1285.0,516.0],[1285.0,516.0],[1285.0,516.0],[1283.31,515.88],[1283.31,515.88],[1283.31,515.88],[1281.62,517.5],[1281.62,517.5],[1281.62,517.5],[1281.12,520.31],[1281.12,520.31],[1281.12,520.31],[1279.31,520.56],[1279.31,520.56],[1279.31,520.56],[1277.56,518.62],[1277.56,518.62],[1277.56,518.62],[1277.56,513.62],[1277.56,513.62],[1277.56,513.62],[1279.12,511.12],[1279.12,511.12],[1279.12,511.12],[1278.19,508.0],[1278.19,508.0],[1278.19,508.0],[1276.0,506.44],[1276.0,506.44],[1276.0,506.44],[1275.62,501.5],[1275.62,501.5],[1275.62,501.5],[1274.25,499.75],[1274.25,499.75],[1274.25,499.75],[1274.0,494.12],[1274.0,494.12],[1274.0,494.12],[1268.25,488.38],[1268.25,488.38],[1268.25,488.38],[1270.5,485.38],[1270.5,485.38],[1270.5,485.38],[1271.0,478.25],[1271.0,478.25],[1271.0,478.25],[1268.38,471.38],[1268.38,471.38],[1268.38,471.38],[1268.62,465.25],[1268.62,465.25],[1268.62,465.25],[1270.62,461.12],[1270.62,461.12],[1270.62,461.12],[1274.38,448.75],[1274.38,448.75],[1274.38,448.75],[1276.38,438.0],[1276.38,438.0],[1276.38,438.0],[1278.62,429.75],[1278.62,429.75],[1278.62,429.75],[1284.62,420.88],[1284.62,420.88],[1284.62,420.88],[1287.38,415.62],[1287.38,415.62],[1287.38,415.62],[1284.12,409.88],[1284.12,409.88],[1284.12,409.88],[1288.38,407.62],[1288.38,407.62],[1288.38,407.62],[1289.12,401.25],[1289.12,401.25],[1289.12,401.25],[1287.62,400.38],[1287.62,400.38],[1287.62,400.38],[1284.25,403.25],[1284.25,403.25],[1284.25,403.25],[1282.12,400.25],[1282.12,400.25],[1282.12,400.25],[1277.75,403.75],[1277.75,403.75],[1277.75,403.75],[1276.38,403.0],[1276.38,403.0],[1276.38,403.0],[1277.62,397.5],[1277.62,397.5],[1277.62,397.5],[1278.0,390.38],[1278.0,390.38],[1278.0,390.38],[1282.0,384.5],[1282.0,384.5],[1282.0,384.5],[1282.25,381.75],[1282.25,381.75],[1282.25,381.75],[1276.62,372.75],[1276.62,372.75],[1276.62,372.75],[1276.0,366.88],[1276.0,366.88],[1276.0,366.88],[1274.25,362.25],[1274.25,362.25],[1274.25,362.25],[1276.38,349.75],[1276.38,349.75],[1276.38,349.75],[1274.88,344.75],[1274.88,344.75],[1274.88,344.75],[1272.62,342.75],[1272.62,342.75],[1272.62,342.75],[1276.5,337.88],[1276.5,337.88],[1276.5,337.88],[1274.75,333.25],[1274.75,333.25],[1274.75,333.25],[1277.0,328.12],[1277.0,328.12],[1277.0,328.12],[1276.91,325.18],[1276.91,325.18],[1276.91,325.18],[1272.55,321.82],[1272.55,321.82],[1272.55,321.82],[1270.82,316.27],[1270.82,316.27],[1270.82,316.27],[1267.82,316.0],[1267.82,316.0],[1267.82,316.0],[1264.73,308.73],[1264.73,308.73],[1264.73,308.73],[1266.27,304.09],[1266.27,304.09],[1266.27,304.09],[1263.45,301.64],[1263.45,301.64],[1263.45,301.64],[1261.0,302.18],[1261.0,302.18],[1261.0,302.18],[1255.55,305.82],[1255.55,305.82],[1255.55,305.82],[1253.09,305.36],[1253.09,305.36],[1253.09,305.36],[1249.64,301.0],[1249.64,301.0],[1249.64,301.0],[1243.36,299.36],[1243.36,299.36],[1243.36,299.36],[1234.64,300.27],[1234.64,300.27],[1234.64,300.27],[1230.27,305.27],[1230.27,305.27],[1230.27,305.27],[1222.36,305.55],[1222.36,305.55],[1222.36,305.55],[1220.73,313.27],[1220.73,313.27],[1220.73,313.27],[1217.0,313.73],[1217.0,313.73],[1217.0,313.73],[1214.64,315.09],[1214.64,315.09],[1214.64,315.09],[1205.09,310.18],[1205.09,310.18],[1205.09,310.18],[1200.36,316.55],[1200.36,316.55]]],['suna',[[1067.82,571.55],[1065.64,573.45],[1065.64,573.45],[1065.64,573.45],[1065.19,576.88],[1065.19,576.88],[1065.19,576.88],[1065.88,582.19],[1065.88,582.19],[1065.88,582.19],[1063.36,587.18],[1063.36,587.18],[1063.36,587.18],[1059.36,591.18],[1059.36,591.18],[1059.36,591.18],[1057.81,593.88],[1057.81,593.88],[1057.81,593.88],[1057.75,597.06],[1057.75,597.06],[1057.75,597.06],[1062.09,602.91],[1062.09,602.91],[1062.09,602.91],[1065.56,608.88],[1065.56,608.88],[1065.56,608.88],[1065.62,611.75],[1065.62,611.75],[1065.62,611.75],[1063.62,614.62],[1063.62,614.62],[1063.62,614.62],[1063.5,620.12],[1063.5,620.12],[1063.5,620.12],[1062.25,623.25],[1062.25,623.25],[1062.25,623.25],[1061.38,631.12],[1061.38,631.12],[1061.38,631.12],[1064.0,635.38],[1064.0,635.38],[1064.0,635.38],[1064.5,643.12],[1064.5,643.12],[1064.5,643.12],[1058.5,655.5],[1058.5,655.5],[1058.5,655.5],[1058.12,663.75],[1058.12,663.75],[1058.12,663.75],[1059.25,666.0],[1059.25,666.0],[1059.25,666.0],[1058.62,674.38],[1058.62,674.38],[1058.62,674.38],[1060.62,675.0],[1060.62,675.0],[1060.62,675.0],[1074.31,674.25],[1074.31,674.25],[1074.31,674.25],[1077.82,670.18],[1077.82,670.18],[1077.82,670.18],[1078.18,664.18],[1078.18,664.18],[1078.18,664.18],[1080.0,661.64],[1080.0,661.64],[1080.0,661.64],[1081.27,657.64],[1081.27,657.64],[1081.27,657.64],[1088.36,654.18],[1088.36,654.18],[1088.36,654.18],[1093.27,654.36],[1093.27,654.36],[1093.27,654.36],[1101.09,659.64],[1101.09,659.64],[1101.09,659.64],[1109.45,660.0],[1109.45,660.0],[1109.45,660.0],[1115.09,657.82],[1115.09,657.82],[1115.09,657.82],[1117.27,653.45],[1117.27,653.45],[1117.27,653.45],[1123.45,654.18],[1123.45,654.18],[1123.45,654.18],[1126.0,652.91],[1126.0,652.91],[1126.0,652.91],[1130.36,647.27],[1130.36,647.27],[1130.36,647.27],[1130.18,642.91],[1130.18,642.91],[1130.18,642.91],[1132.36,641.09],[1132.36,641.09],[1132.36,641.09],[1132.73,632.73],[1132.73,632.73],[1132.73,632.73],[1137.64,629.27],[1137.64,629.27],[1137.64,629.27],[1141.62,629.12],[1141.62,629.12],[1141.62,629.12],[1147.38,626.38],[1147.38,626.38],[1147.38,626.38],[1151.38,627.25],[1151.38,627.25],[1151.38,627.25],[1157.12,631.38],[1157.12,631.38],[1157.12,631.38],[1162.38,625.75],[1162.38,625.75],[1162.38,625.75],[1164.73,624.36],[1164.73,624.36],[1164.73,624.36],[1170.75,616.25],[1170.75,616.25],[1170.75,616.25],[1176.62,615.38],[1176.62,615.38],[1176.62,615.38],[1183.88,606.88],[1183.88,606.88],[1183.88,606.88],[1182.25,599.5],[1182.25,599.5],[1182.25,599.5],[1182.25,591.25],[1182.25,591.25],[1182.25,591.25],[1185.12,588.0],[1185.12,588.0],[1185.12,588.0],[1191.0,588.25],[1191.0,588.25],[1191.0,588.25],[1193.25,587.0],[1193.25,587.0],[1193.25,587.0],[1194.25,580.25],[1194.25,580.25],[1194.25,580.25],[1196.75,573.0],[1196.75,573.0],[1196.75,573.0],[1201.5,566.0],[1201.5,566.0],[1201.5,566.0],[1201.75,563.0],[1201.75,563.0],[1201.75,563.0],[1206.25,556.0],[1206.25,556.0],[1206.25,556.0],[1206.25,547.25],[1206.25,547.25],[1206.25,547.25],[1203.0,538.5],[1203.0,538.5],[1203.0,538.5],[1203.0,528.5],[1203.0,528.5],[1203.0,528.5],[1205.5,525.0],[1205.5,525.0],[1205.5,525.0],[1211.0,517.75],[1211.0,517.75],[1211.0,517.75],[1221.25,514.75],[1221.25,514.75],[1221.25,514.75],[1220.0,506.91],[1220.0,506.91],[1220.0,506.91],[1213.09,495.64],[1213.09,495.64],[1213.09,495.64],[1204.73,488.73],[1204.73,488.73],[1204.73,488.73],[1197.09,470.91],[1197.09,470.91],[1197.09,470.91],[1193.88,473.0],[1193.88,473.0],[1193.88,473.0],[1189.88,468.75],[1189.88,468.75],[1189.88,468.75],[1186.12,456.88],[1186.12,456.88],[1186.12,456.88],[1183.75,453.0],[1183.75,453.0],[1183.75,453.0],[1185.12,447.25],[1185.12,447.25],[1185.12,447.25],[1180.62,443.12],[1180.62,443.12],[1180.62,443.12],[1177.88,441.62],[1177.88,441.62],[1177.88,441.62],[1172.5,444.75],[1172.5,444.75],[1172.5,444.75],[1169.0,442.75],[1169.0,442.75],[1169.0,442.75],[1170.38,437.38],[1170.38,437.38],[1170.38,437.38],[1168.0,428.75],[1168.0,428.75],[1168.0,428.75],[1159.88,433.88],[1159.88,433.88],[1159.88,433.88],[1159.12,439.38],[1159.12,439.38],[1159.12,439.38],[1153.25,448.25],[1153.25,448.25],[1153.25,448.25],[1153.25,453.12],[1153.25,453.12],[1153.25,453.12],[1145.88,461.88],[1145.88,461.88],[1145.88,461.88],[1147.0,473.75],[1147.0,473.75],[1147.0,473.75],[1152.5,480.38],[1152.5,480.38],[1152.5,480.38],[1152.25,486.12],[1152.25,486.12],[1152.25,486.12],[1147.5,492.25],[1147.5,492.25],[1147.5,492.25],[1146.38,498.0],[1146.38,498.0],[1146.38,498.0],[1140.38,504.25],[1140.38,504.25],[1140.38,504.25],[1135.0,506.0],[1135.0,506.0],[1135.0,506.0],[1134.25,510.5],[1134.25,510.5],[1134.25,510.5],[1131.25,517.25],[1131.25,517.25],[1131.25,517.25],[1131.38,521.75],[1131.38,521.75],[1131.38,521.75],[1136.25,529.5],[1136.25,529.5],[1136.25,529.5],[1136.5,535.25],[1136.5,535.25],[1136.5,535.25],[1139.25,542.0],[1139.25,542.0],[1139.25,542.0],[1136.88,547.0],[1136.88,547.0],[1136.88,547.0],[1132.12,547.5],[1132.12,547.5],[1132.12,547.5],[1127.38,549.62],[1127.38,549.62],[1127.38,549.62],[1123.12,553.0],[1123.12,553.0],[1123.12,553.0],[1112.88,551.88],[1112.88,551.88],[1112.88,551.88],[1109.62,556.5],[1109.62,556.5],[1109.62,556.5],[1109.5,564.38],[1109.5,564.38],[1109.5,564.38],[1107.62,568.75],[1107.62,568.75],[1107.62,568.75],[1103.75,569.88],[1103.75,569.88],[1103.75,569.88],[1104.12,574.5],[1104.12,574.5],[1104.12,574.5],[1100.75,577.0],[1100.75,577.0],[1100.75,577.0],[1100.75,585.0],[1100.75,585.0],[1100.75,585.0],[1096.38,585.88],[1096.38,585.88],[1096.38,585.88],[1091.75,580.12],[1091.75,580.12],[1091.75,580.12],[1080.0,572.5],[1080.0,572.5],[1080.0,572.5],[1076.75,571.38],[1076.75,571.38],[1076.75,571.38],[1074.38,572.75],[1074.38,572.75],[1074.38,572.75],[1069.88,570.75],[1069.88,570.75],[1069.88,570.75],[1067.82,571.55],[1067.82,571.55]]],['yunin',[[1170.75,616.25],[1176.62,615.38],[1176.62,615.38],[1176.62,615.38],[1183.88,606.88],[1183.88,606.88],[1183.88,606.88],[1182.25,599.5],[1182.25,599.5],[1182.25,599.5],[1182.25,591.25],[1182.25,591.25],[1182.25,591.25],[1185.12,588.0],[1185.12,588.0],[1185.12,588.0],[1191.0,588.25],[1191.0,588.25],[1191.0,588.25],[1193.25,587.0],[1193.25,587.0],[1193.25,587.0],[1194.25,580.25],[1194.25,580.25],[1194.25,580.25],[1196.75,573.0],[1196.75,573.0],[1196.75,573.0],[1201.5,566.0],[1201.5,566.0],[1201.5,566.0],[1201.75,563.0],[1201.75,563.0],[1201.75,563.0],[1206.25,556.0],[1206.25,556.0],[1206.25,556.0],[1206.25,547.25],[1206.25,547.25],[1206.25,547.25],[1203.0,538.5],[1203.0,538.5],[1203.0,538.5],[1203.0,528.5],[1203.0,528.5],[1203.0,528.5],[1205.5,525.0],[1205.5,525.0],[1205.5,525.0],[1211.0,517.75],[1211.0,517.75],[1211.0,517.75],[1221.25,514.75],[1221.25,514.75],[1221.25,514.75],[1223.0,527.36],[1223.0,527.36],[1223.0,527.36],[1230.45,538.82],[1230.45,538.82],[1230.45,538.82],[1236.27,538.82],[1236.27,538.82],[1236.27,538.82],[1242.09,534.27],[1242.09,534.27],[1242.09,534.27],[1243.18,528.27],[1243.18,528.27],[1243.18,528.27],[1255.36,529.73],[1255.36,529.73],[1255.36,529.73],[1266.25,527.38],[1266.25,527.38],[1266.25,527.38],[1279.75,526.62],[1279.75,526.62],[1279.75,526.62],[1285.0,516.0],[1285.0,516.0],[1285.0,516.0],[1287.91,519.09],[1287.91,519.09],[1287.91,519.09],[1290.73,519.18],[1290.73,519.18],[1290.73,519.18],[1292.82,521.73],[1292.82,521.73],[1292.82,521.73],[1289.18,526.73],[1289.18,526.73],[1289.18,526.73],[1291.0,528.82],[1291.0,528.82],[1291.0,528.82],[1301.36,528.91],[1301.36,528.91],[1301.36,528.91],[1304.55,526.0],[1304.55,526.0],[1304.55,526.0],[1308.36,525.09],[1308.36,525.09],[1308.36,525.09],[1316.55,529.64],[1316.55,529.64],[1316.55,529.64],[1331.27,531.09],[1331.27,531.09],[1331.27,531.09],[1333.45,534.55],[1333.45,534.55],[1333.45,534.55],[1332.55,537.64],[1332.55,537.64],[1332.55,537.64],[1325.45,545.64],[1325.45,545.64],[1325.45,545.64],[1325.27,549.27],[1325.27,549.27],[1325.27,549.27],[1321.45,549.27],[1321.45,549.27],[1321.45,549.27],[1312.55,557.45],[1312.55,557.45],[1312.55,557.45],[1309.27,565.64],[1309.27,565.64],[1309.27,565.64],[1303.45,571.64],[1303.45,571.64],[1303.45,571.64],[1303.82,578.55],[1303.82,578.55],[1303.82,578.55],[1309.82,587.09],[1309.82,587.09],[1309.82,587.09],[1311.82,596.18],[1311.82,596.18],[1311.82,596.18],[1310.55,607.09],[1310.55,607.09],[1310.55,607.09],[1315.75,612.25],[1315.75,612.25],[1315.75,612.25],[1313.25,617.75],[1313.25,617.75],[1313.25,617.75],[1303.5,616.75],[1303.5,616.75],[1303.5,616.75],[1299.5,620.25],[1299.5,620.25],[1299.5,620.25],[1295.5,620.5],[1295.5,620.5],[1295.5,620.5],[1293.25,618.75],[1293.25,618.75],[1293.25,618.75],[1274.75,612.5],[1274.75,612.5],[1274.75,612.5],[1270.0,612.0],[1270.0,612.0],[1270.0,612.0],[1257.25,624.75],[1257.25,624.75],[1257.25,624.75],[1246.5,624.75],[1246.5,624.75],[1246.5,624.75],[1246.75,633.25],[1246.75,633.25],[1246.75,633.25],[1240.75,638.0],[1240.75,638.0],[1240.75,638.0],[1239.25,645.75],[1239.25,645.75],[1239.25,645.75],[1234.75,652.5],[1234.75,652.5],[1234.75,652.5],[1235.0,658.0],[1235.0,658.0],[1235.0,658.0],[1231.25,666.25],[1231.25,666.25],[1231.25,666.25],[1224.33,659.33],[1224.33,659.33],[1224.33,659.33],[1214.0,657.33],[1214.0,657.33],[1214.0,657.33],[1207.67,652.33],[1207.67,652.33],[1207.67,652.33],[1205.0,654.67],[1205.0,654.67],[1205.0,654.67],[1199.67,655.33],[1199.67,655.33],[1199.67,655.33],[1200.0,660.0],[1200.0,660.0],[1200.0,660.0],[1195.33,662.33],[1195.33,662.33],[1195.33,662.33],[1200.67,668.67],[1200.67,668.67],[1200.67,668.67],[1200.33,674.67],[1200.33,674.67],[1200.33,674.67],[1193.0,674.67],[1193.0,674.67],[1193.0,674.67],[1192.33,680.33],[1192.33,680.33],[1192.33,680.33],[1187.67,683.33],[1187.67,683.33],[1187.67,683.33],[1182.33,679.33],[1182.33,679.33],[1182.33,679.33],[1177.67,677.33],[1177.67,677.33],[1177.67,677.33],[1179.45,674.0],[1179.45,674.0],[1179.45,674.0],[1179.27,671.09],[1179.27,671.09],[1179.27,671.09],[1185.27,665.27],[1185.27,665.27],[1185.27,665.27],[1183.09,655.82],[1183.09,655.82],[1183.09,655.82],[1179.64,654.18],[1179.64,654.18],[1179.64,654.18],[1179.64,646.36],[1179.64,646.36],[1179.64,646.36],[1172.91,642.18],[1172.91,642.18],[1172.91,642.18],[1168.55,641.45],[1168.55,641.45],[1168.55,641.45],[1162.73,638.36],[1162.73,638.36],[1162.73,638.36],[1162.0,635.09],[1162.0,635.09],[1162.0,635.09],[1164.55,628.91],[1164.55,628.91],[1164.55,628.91],[1164.73,624.36],[1164.73,624.36],[1164.73,624.36],[1170.75,616.25],[1170.75,616.25]]],['aleston',[[1133.67,756.0],[1130.91,755.45],[1130.91,755.45],[1130.91,755.45],[1126.36,747.27],[1126.36,747.27],[1126.36,747.27],[1115.82,737.82],[1115.82,737.82],[1115.82,737.82],[1112.73,737.82],[1112.73,737.82],[1112.73,737.82],[1105.82,731.45],[1105.82,731.45],[1105.82,731.45],[1100.55,730.91],[1100.55,730.91],[1100.55,730.91],[1094.73,732.73],[1094.73,732.73],[1094.73,732.73],[1087.09,732.36],[1087.09,732.36],[1087.09,732.36],[1084.36,738.0],[1084.36,738.0],[1084.36,738.0],[1075.64,738.55],[1075.64,738.55],[1075.64,738.55],[1072.73,740.55],[1072.73,740.55],[1072.73,740.55],[1065.09,740.91],[1065.09,740.91],[1065.09,740.91],[1057.82,738.36],[1057.82,738.36],[1057.82,738.36],[1049.45,728.55],[1049.45,728.55],[1049.45,728.55],[1050.73,723.82],[1050.73,723.82],[1050.73,723.82],[1048.0,720.91],[1048.0,720.91],[1048.0,720.91],[1045.45,719.64],[1045.45,719.64],[1045.45,719.64],[1042.82,720.64],[1042.82,720.64],[1042.82,720.64],[1039.73,717.55],[1039.73,717.55],[1039.73,717.55],[1045.62,717.38],[1045.62,717.38],[1045.62,717.38],[1051.75,705.38],[1051.75,705.38],[1051.75,705.38],[1049.88,696.88],[1049.88,696.88],[1049.88,696.88],[1047.25,689.75],[1047.25,689.75],[1047.25,689.75],[1047.62,684.88],[1047.62,684.88],[1047.62,684.88],[1051.38,683.0],[1051.38,683.0],[1051.38,683.0],[1058.62,674.38],[1058.62,674.38],[1058.62,674.38],[1060.62,675.0],[1060.62,675.0],[1060.62,675.0],[1074.31,674.25],[1074.31,674.25],[1074.31,674.25],[1077.82,670.18],[1077.82,670.18],[1077.82,670.18],[1078.18,664.18],[1078.18,664.18],[1078.18,664.18],[1080.0,661.64],[1080.0,661.64],[1080.0,661.64],[1081.27,657.64],[1081.27,657.64],[1081.27,657.64],[1088.36,654.18],[1088.36,654.18],[1088.36,654.18],[1093.27,654.36],[1093.27,654.36],[1093.27,654.36],[1101.09,659.64],[1101.09,659.64],[1101.09,659.64],[1109.45,660.0],[1109.45,660.0],[1109.45,660.0],[1115.09,657.82],[1115.09,657.82],[1115.09,657.82],[1117.27,653.45],[1117.27,653.45],[1117.27,653.45],[1123.45,654.18],[1123.45,654.18],[1123.45,654.18],[1126.0,652.91],[1126.0,652.91],[1126.0,652.91],[1130.36,647.27],[1130.36,647.27],[1130.36,647.27],[1130.18,642.91],[1130.18,642.91],[1130.18,642.91],[1132.36,641.09],[1132.36,641.09],[1132.36,641.09],[1132.73,632.73],[1132.73,632.73],[1132.73,632.73],[1137.64,629.27],[1137.64,629.27],[1137.64,629.27],[1141.62,629.12],[1141.62,629.12],[1141.62,629.12],[1147.38,626.38],[1147.38,626.38],[1147.38,626.38],[1151.38,627.25],[1151.38,627.25],[1151.38,627.25],[1157.12,631.38],[1157.12,631.38],[1157.12,631.38],[1162.38,625.75],[1162.38,625.75],[1162.38,625.75],[1164.73,624.36],[1164.73,624.36],[1164.73,624.36],[1164.55,628.91],[1164.55,628.91],[1164.55,628.91],[1162.0,635.09],[1162.0,635.09],[1162.0,635.09],[1162.73,638.36],[1162.73,638.36],[1162.73,638.36],[1168.55,641.45],[1168.55,641.45],[1168.55,641.45],[1172.91,642.18],[1172.91,642.18],[1172.91,642.18],[1179.64,646.36],[1179.64,646.36],[1179.64,646.36],[1179.64,654.18],[1179.64,654.18],[1179.64,654.18],[1183.09,655.82],[1183.09,655.82],[1183.09,655.82],[1185.27,665.27],[1185.27,665.27],[1185.27,665.27],[1179.27,671.09],[1179.27,671.09],[1179.27,671.09],[1179.45,674.0],[1179.45,674.0],[1179.45,674.0],[1177.67,677.33],[1177.67,677.33],[1177.67,677.33],[1172.0,682.67],[1172.0,682.67],[1172.0,682.67],[1170.67,689.0],[1170.67,689.0],[1170.67,689.0],[1164.0,694.67],[1164.0,694.67],[1164.0,694.67],[1154.0,705.33],[1154.0,705.33],[1154.0,705.33],[1153.33,717.33],[1153.33,717.33],[1153.33,717.33],[1148.33,726.0],[1148.33,726.0],[1148.33,726.0],[1147.0,739.0],[1147.0,739.0],[1147.0,739.0],[1142.33,751.33],[1142.33,751.33]]],['oblivionPass',[[860.25,771.62],[863.62,773.75],[863.62,773.75],[863.62,773.75],[866.62,773.0],[866.62,773.0],[866.62,773.0],[877.25,774.38],[877.25,774.38],[877.25,774.38],[879.5,772.12],[879.5,772.12],[879.5,772.12],[881.5,767.62],[881.5,767.62],[881.5,767.62],[884.62,770.62],[884.62,770.62],[884.62,770.62],[890.25,769.5],[890.25,769.5],[890.25,769.5],[892.38,770.25],[892.38,770.25],[892.38,770.25],[894.62,773.5],[894.62,773.5],[894.62,773.5],[900.12,772.75],[900.12,772.75],[900.12,772.75],[899.75,767.62],[899.75,767.62],[899.75,767.62],[903.36,764.36],[903.36,764.36],[903.36,764.36],[903.14,758.0],[903.14,758.0],[903.14,758.0],[907.27,757.45],[907.27,757.45],[907.27,757.45],[908.73,751.45],[908.73,751.45],[908.73,751.45],[914.18,749.27],[914.18,749.27],[914.18,749.27],[922.91,750.55],[922.91,750.55],[922.91,750.55],[932.18,757.64],[932.18,757.64],[932.18,757.64],[936.0,758.91],[936.0,758.91],[936.0,758.91],[945.82,755.82],[945.82,755.82],[945.82,755.82],[946.73,751.45],[946.73,751.45],[946.73,751.45],[949.82,745.64],[949.82,745.64],[949.82,745.64],[948.36,741.27],[948.36,741.27],[948.36,741.27],[950.18,738.18],[950.18,738.18],[950.18,738.18],[955.45,738.0],[955.45,738.0],[955.45,738.0],[960.73,731.82],[960.73,731.82],[960.73,731.82],[968.91,727.27],[968.91,727.27],[968.91,727.27],[974.73,728.18],[974.73,728.18],[974.73,728.18],[982.55,732.91],[982.55,732.91],[982.55,732.91],[984.18,736.36],[984.18,736.36],[984.18,736.36],[987.64,738.36],[987.64,738.36],[987.64,738.36],[990.36,735.09],[990.36,735.09],[990.36,735.09],[993.27,735.45],[993.27,735.45],[993.27,735.45],[994.0,730.73],[994.0,730.73],[994.0,730.73],[995.45,729.27],[995.45,729.27],[995.45,729.27],[1000.75,728.12],[1000.75,728.12],[1000.75,728.12],[1000.88,724.25],[1000.88,724.25],[1000.88,724.25],[999.38,720.5],[999.38,720.5],[999.38,720.5],[1003.25,716.62],[1003.25,716.62],[1003.25,716.62],[1006.75,715.88],[1006.75,715.88],[1006.75,715.88],[1015.0,718.75],[1015.0,718.75],[1015.0,718.75],[1021.5,724.88],[1021.5,724.88],[1021.5,724.88],[1027.27,725.09],[1027.27,725.09],[1027.27,725.09],[1031.62,716.75],[1031.62,716.75],[1031.62,716.75],[1034.27,715.36],[1034.27,715.36],[1034.27,715.36],[1039.73,717.55],[1039.73,717.55],[1039.73,717.55],[1045.62,717.38],[1045.62,717.38],[1045.62,717.38],[1051.75,705.38],[1051.75,705.38],[1051.75,705.38],[1049.88,696.88],[1049.88,696.88],[1049.88,696.88],[1047.25,689.75],[1047.25,689.75],[1047.25,689.75],[1047.62,684.88],[1047.62,684.88],[1047.62,684.88],[1051.38,683.0],[1051.38,683.0],[1051.38,683.0],[1058.62,674.38],[1058.62,674.38],[1058.62,674.38],[1059.25,666.0],[1059.25,666.0],[1059.25,666.0],[1058.12,663.75],[1058.12,663.75],[1058.12,663.75],[1058.5,655.5],[1058.5,655.5],[1058.5,655.5],[1064.5,643.12],[1064.5,643.12],[1064.5,643.12],[1064.0,635.38],[1064.0,635.38],[1064.0,635.38],[1061.38,631.12],[1061.38,631.12],[1061.38,631.12],[1062.25,623.25],[1062.25,623.25],[1062.25,623.25],[1063.5,620.12],[1063.5,620.12],[1063.5,620.12],[1063.62,614.62],[1063.62,614.62],[1063.62,614.62],[1055.82,613.09],[1055.82,613.09],[1055.82,613.09],[1050.0,615.91],[1050.0,615.91],[1050.0,615.91],[1045.27,615.73],[1045.27,615.73],[1045.27,615.73],[1039.45,621.36],[1039.45,621.36],[1039.45,621.36],[1035.55,621.27],[1035.55,621.27],[1035.55,621.27],[1033.45,624.18],[1033.45,624.18],[1033.45,624.18],[1030.73,624.45],[1030.73,624.45],[1030.73,624.45],[1030.09,628.36],[1030.09,628.36],[1030.09,628.36],[1019.45,631.64],[1019.45,631.64],[1019.45,631.64],[1015.55,629.55],[1015.55,629.55],[1015.55,629.55],[1014.82,618.82],[1014.82,618.82],[1014.82,618.82],[1010.91,617.82],[1010.91,617.82],[1010.91,617.82],[1009.27,621.09],[1009.27,621.09],[1009.27,621.09],[1003.45,623.18],[1003.45,623.18],[1003.45,623.18],[1000.18,622.27],[1000.18,622.27],[1000.18,622.27],[999.82,617.45],[999.82,617.45],[999.82,617.45],[995.91,612.36],[995.91,612.36],[995.91,612.36],[986.91,610.55],[986.91,610.55],[986.91,610.55],[985.64,612.64],[985.64,612.64],[985.64,612.64],[987.55,617.27],[987.55,617.27],[987.55,617.27],[981.45,622.45],[981.45,622.45],[981.45,622.45],[972.38,621.62],[972.38,621.62],[972.38,621.62],[971.25,629.12],[971.25,629.12],[971.25,629.12],[965.62,633.5],[965.62,633.5],[965.62,633.5],[961.38,633.62],[961.38,633.62],[961.38,633.62],[957.0,637.25],[957.0,637.25],[957.0,637.25],[954.12,637.38],[954.12,637.38],[954.12,637.38],[956.62,642.5],[956.62,642.5],[956.62,642.5],[956.75,655.0],[956.75,655.0],[956.75,655.0],[967.5,663.12],[967.5,663.12],[967.5,663.12],[962.75,669.0],[962.75,669.0],[962.75,669.0],[961.12,676.0],[961.12,676.0],[961.12,676.0],[957.62,678.0],[957.62,678.0],[957.62,678.0],[952.75,686.38],[952.75,686.38],[952.75,686.38],[950.0,690.12],[950.0,690.12],[950.0,690.12],[946.62,690.62],[946.62,690.62],[946.62,690.62],[945.12,694.62],[945.12,694.62],[945.12,694.62],[934.62,698.25],[934.62,698.25],[934.62,698.25],[932.62,702.38],[932.62,702.38],[932.62,702.38],[929.12,703.5],[929.12,703.5],[929.12,703.5],[927.5,709.38],[927.5,709.38],[927.5,709.38],[924.38,710.12],[924.38,710.12],[924.38,710.12],[919.62,708.75],[919.62,708.75],[919.62,708.75],[916.38,710.75],[916.38,710.75],[916.38,710.75],[917.5,713.38],[917.5,713.38],[917.5,713.38],[913.75,717.5],[913.75,717.5],[913.75,717.5],[909.25,719.75],[909.25,719.75],[909.25,719.75],[906.5,726.75],[906.5,726.75],[906.5,726.75],[901.88,731.62],[901.88,731.62],[901.88,731.62],[899.5,732.75],[899.5,732.75],[899.5,732.75],[891.25,741.12],[891.25,741.12],[891.25,741.12],[879.5,746.25],[879.5,746.25],[879.5,746.25],[873.25,747.75],[873.25,747.75],[873.25,747.75],[868.62,754.75],[868.62,754.75],[868.62,754.75],[868.12,759.75],[868.12,759.75],[868.12,759.75],[863.62,766.0],[863.62,766.0],[863.62,766.0],[863.5,768.62],[863.5,768.62],[863.5,768.62],[860.25,771.62],[860.25,771.62]]],['cathedral',[[1133.67,756.0],[1130.91,755.45],[1130.91,755.45],[1130.91,755.45],[1126.36,747.27],[1126.36,747.27],[1126.36,747.27],[1115.82,737.82],[1115.82,737.82],[1115.82,737.82],[1112.73,737.82],[1112.73,737.82],[1112.73,737.82],[1105.82,731.45],[1105.82,731.45],[1105.82,731.45],[1100.55,730.91],[1100.55,730.91],[1100.55,730.91],[1094.73,732.73],[1094.73,732.73],[1094.73,732.73],[1087.09,732.36],[1087.09,732.36],[1087.09,732.36],[1084.36,738.0],[1084.36,738.0],[1084.36,738.0],[1075.64,738.55],[1075.64,738.55],[1075.64,738.55],[1072.73,740.55],[1072.73,740.55],[1072.73,740.55],[1065.09,740.91],[1065.09,740.91],[1065.09,740.91],[1057.82,738.36],[1057.82,738.36],[1057.82,738.36],[1049.45,728.55],[1049.45,728.55],[1049.45,728.55],[1050.73,723.82],[1050.73,723.82],[1050.73,723.82],[1048.0,720.91],[1048.0,720.91],[1048.0,720.91],[1045.45,719.64],[1045.45,719.64],[1045.45,719.64],[1042.82,720.64],[1042.82,720.64],[1042.82,720.64],[1039.73,717.55],[1039.73,717.55],[1039.73,717.55],[1034.27,715.36],[1034.27,715.36],[1034.27,715.36],[1031.62,716.75],[1031.62,716.75],[1031.62,716.75],[1027.27,725.09],[1027.27,725.09],[1027.27,725.09],[1029.09,729.82],[1029.09,729.82],[1029.09,729.82],[1026.55,739.64],[1026.55,739.64],[1026.55,739.64],[1029.09,743.64],[1029.09,743.64],[1029.09,743.64],[1029.45,749.82],[1029.45,749.82],[1029.45,749.82],[1035.64,755.27],[1035.64,755.27],[1035.64,755.27],[1036.73,763.45],[1036.73,763.45],[1036.73,763.45],[1026.91,769.82],[1026.91,769.82],[1026.91,769.82],[1024.91,777.45],[1024.91,777.45],[1024.91,777.45],[1031.45,791.45],[1031.45,791.45],[1031.45,791.45],[1039.45,798.36],[1039.45,798.36],[1039.45,798.36],[1041.45,804.55],[1041.45,804.55],[1041.45,804.55],[1037.27,808.0],[1037.27,808.0],[1037.27,808.0],[1034.36,819.27],[1034.36,819.27],[1034.36,819.27],[1035.45,826.0],[1035.45,826.0],[1035.45,826.0],[1033.5,832.0],[1033.5,832.0],[1033.5,832.0],[1035.0,837.0],[1035.0,837.0],[1035.0,837.0],[1042.62,844.88],[1042.62,844.88],[1042.62,844.88],[1043.75,855.88],[1043.75,855.88],[1043.75,855.88],[1049.75,861.5],[1049.75,861.5],[1049.75,861.5],[1061.62,867.5],[1061.62,867.5],[1061.62,867.5],[1068.25,866.0],[1068.25,866.0],[1068.25,866.0],[1073.64,868.91],[1073.64,868.91],[1073.64,868.91],[1081.75,870.25],[1081.75,870.25],[1081.75,870.25],[1086.75,866.0],[1086.75,866.0],[1086.75,866.0],[1105.0,868.0],[1105.0,868.0],[1105.0,868.0],[1126.5,851.0],[1126.5,851.0],[1126.5,851.0],[1127.75,838.75],[1127.75,838.75],[1127.75,838.75],[1135.75,835.25],[1135.75,835.25],[1135.75,835.25],[1141.75,836.5],[1141.75,836.5],[1141.75,836.5],[1148.88,834.12],[1148.88,834.12],[1148.88,834.12],[1152.25,827.0],[1152.25,827.0],[1152.25,827.0],[1156.0,825.64],[1156.0,825.64],[1156.0,825.64],[1156.18,821.27],[1156.18,821.27],[1156.18,821.27],[1160.91,817.82],[1160.91,817.82],[1160.91,817.82],[1160.73,810.55],[1160.73,810.55],[1160.73,810.55],[1156.0,803.82],[1156.0,803.82],[1156.0,803.82],[1150.73,786.18],[1150.73,786.18],[1150.73,786.18],[1154.0,778.18],[1154.0,778.18],[1154.0,778.18],[1146.91,769.45],[1146.91,769.45],[1146.91,769.45],[1134.36,760.36],[1134.36,760.36],[1134.36,760.36],[1133.67,756.0],[1133.67,756.0]]],['garrow',[[903.64,758.0],[907.27,757.45],[907.27,757.45],[907.27,757.45],[908.73,751.45],[908.73,751.45],[908.73,751.45],[914.18,749.27],[914.18,749.27],[914.18,749.27],[922.91,750.55],[922.91,750.55],[922.91,750.55],[932.18,757.64],[932.18,757.64],[932.18,757.64],[936.0,758.91],[936.0,758.91],[936.0,758.91],[945.82,755.82],[945.82,755.82],[945.82,755.82],[946.73,751.45],[946.73,751.45],[946.73,751.45],[949.82,745.64],[949.82,745.64],[949.82,745.64],[948.36,741.27],[948.36,741.27],[948.36,741.27],[950.18,738.18],[950.18,738.18],[950.18,738.18],[955.45,738.0],[955.45,738.0],[955.45,738.0],[960.73,731.82],[960.73,731.82],[960.73,731.82],[968.91,727.27],[968.91,727.27],[968.91,727.27],[974.73,728.18],[974.73,728.18],[974.73,728.18],[982.55,732.91],[982.55,732.91],[982.55,732.91],[984.18,736.36],[984.18,736.36],[984.18,736.36],[987.64,738.36],[987.64,738.36],[987.64,738.36],[990.36,735.09],[990.36,735.09],[990.36,735.09],[993.27,735.45],[993.27,735.45],[993.27,735.45],[994.0,730.73],[994.0,730.73],[994.0,730.73],[995.45,729.27],[995.45,729.27],[995.45,729.27],[1000.75,728.12],[1000.75,728.12],[1000.75,728.12],[1000.88,724.25],[1000.88,724.25],[1000.88,724.25],[999.38,720.5],[999.38,720.5],[999.38,720.5],[1003.25,716.62],[1003.25,716.62],[1003.25,716.62],[1006.75,715.88],[1006.75,715.88],[1006.75,715.88],[1015.0,718.75],[1015.0,718.75],[1015.0,718.75],[1021.5,724.88],[1021.5,724.88],[1021.5,724.88],[1027.27,725.09],[1027.27,725.09],[1027.27,725.09],[1029.09,729.82],[1029.09,729.82],[1029.09,729.82],[1026.55,739.64],[1026.55,739.64],[1026.55,739.64],[1029.09,743.64],[1029.09,743.64],[1029.09,743.64],[1029.45,749.82],[1029.45,749.82],[1029.45,749.82],[1035.64,755.27],[1035.64,755.27],[1035.64,755.27],[1036.73,763.45],[1036.73,763.45],[1036.73,763.45],[1026.91,769.82],[1026.91,769.82],[1026.91,769.82],[1024.91,777.45],[1024.91,777.45],[1024.91,777.45],[1031.45,791.45],[1031.45,791.45],[1031.45,791.45],[1039.45,798.36],[1039.45,798.36],[1039.45,798.36],[1041.45,804.55],[1041.45,804.55],[1041.45,804.55],[1037.27,808.0],[1037.27,808.0],[1037.27,808.0],[1034.36,819.27],[1034.36,819.27],[1034.36,819.27],[1035.45,826.0],[1035.45,826.0],[1035.45,826.0],[1033.5,832.0],[1033.5,832.0],[1033.5,832.0],[1025.62,827.0],[1025.62,827.0],[1025.62,827.0],[1022.25,827.12],[1022.25,827.12],[1022.25,827.12],[1018.0,822.75],[1018.0,822.75],[1018.0,822.75],[1016.88,818.62],[1016.88,818.62],[1016.88,818.62],[1011.0,818.62],[1011.0,818.62],[1011.0,818.62],[1010.25,820.88],[1010.25,820.88],[1010.25,820.88],[1008.12,822.38],[1008.12,822.38],[1008.12,822.38],[1003.62,819.62],[1003.62,819.62],[1003.62,819.62],[1000.38,821.75],[1000.38,821.75],[1000.38,821.75],[999.62,826.25],[999.62,826.25],[999.62,826.25],[996.5,831.0],[996.5,831.0],[996.5,831.0],[996.12,840.88],[996.12,840.88],[996.12,840.88],[990.88,846.5],[990.88,846.5],[990.88,846.5],[983.75,847.62],[983.75,847.62],[983.75,847.62],[982.12,843.38],[982.12,843.38],[982.12,843.38],[977.38,841.62],[977.38,841.62],[977.38,841.62],[973.25,844.62],[973.25,844.62],[973.25,844.62],[970.38,845.12],[970.38,845.12],[970.38,845.12],[960.25,852.75],[960.25,852.75],[960.25,852.75],[959.19,856.06],[959.19,856.06],[959.19,856.06],[952.56,861.88],[952.56,861.88],[952.56,861.88],[948.06,863.5],[948.06,863.5],[948.06,863.5],[946.62,867.56],[946.62,867.56],[946.62,867.56],[941.27,868.27],[941.27,868.27],[941.27,868.27],[933.18,858.55],[933.18,858.55],[933.18,858.55],[932.18,855.0],[932.18,855.0],[932.18,855.0],[928.82,852.91],[928.82,852.91],[928.82,852.91],[925.45,855.27],[925.45,855.27],[925.45,855.27],[922.82,855.64],[922.82,855.64],[922.82,855.64],[920.64,857.45],[920.64,857.45],[920.64,857.45],[915.09,857.73],[915.09,857.73],[915.09,857.73],[913.36,856.18],[913.36,856.18],[913.36,856.18],[913.64,854.09],[913.64,854.09],[913.64,854.09],[917.36,851.64],[917.36,851.64],[917.36,851.64],[920.0,851.36],[920.0,851.36],[920.0,851.36],[924.27,844.82],[924.27,844.82],[924.27,844.82],[924.82,839.27],[924.82,839.27],[924.82,839.27],[930.27,831.09],[930.27,831.09],[930.27,831.09],[927.09,821.64],[927.09,821.64],[927.09,821.64],[925.73,811.55],[925.73,811.55],[925.73,811.55],[923.27,807.36],[923.27,807.36],[923.27,807.36],[917.18,804.18],[917.18,804.18],[917.18,804.18],[917.0,796.0],[917.0,796.0],[917.0,796.0],[920.36,789.55],[920.36,789.55],[920.36,789.55],[920.55,782.55],[920.55,782.55],[920.55,782.55],[912.0,772.73],[912.0,772.73],[912.0,772.73],[910.82,767.91],[910.82,767.91],[910.82,767.91],[903.36,764.36],[903.36,764.36],[903.36,764.36],[903.64,758.0],[903.64,758.0]]],['albys',[[852.55,777.09],[848.55,777.09],[848.55,777.09],[848.55,777.09],[841.45,784.0],[841.45,784.0],[841.45,784.0],[840.36,798.91],[840.36,798.91],[840.36,798.91],[834.73,806.0],[834.73,806.0],[834.73,806.0],[830.36,820.91],[830.36,820.91],[830.36,820.91],[823.82,825.45],[823.82,825.45],[823.82,825.45],[817.82,833.45],[817.82,833.45],[817.82,833.45],[808.55,840.73],[808.55,840.73],[808.55,840.73],[808.55,843.82],[808.55,843.82],[808.55,843.82],[806.18,845.45],[806.18,845.45],[806.18,845.45],[805.82,854.91],[805.82,854.91],[805.82,854.91],[802.55,855.64],[802.55,855.64],[802.55,855.64],[792.36,865.27],[792.36,865.27],[792.36,865.27],[792.18,868.18],[792.18,868.18],[792.18,868.18],[786.0,876.73],[786.0,876.73],[786.0,876.73],[780.18,881.09],[780.18,881.09],[780.18,881.09],[778.36,886.36],[778.36,886.36],[778.36,886.36],[760.55,900.73],[760.55,900.73],[760.55,900.73],[763.64,912.18],[763.64,912.18],[763.64,912.18],[764.0,920.73],[764.0,920.73],[764.0,920.73],[768.18,929.09],[768.18,929.09],[768.18,929.09],[778.73,941.27],[778.73,941.27],[778.73,941.27],[804.36,966.36],[804.36,966.36],[804.36,966.36],[811.45,968.55],[811.45,968.55],[811.45,968.55],[817.64,973.27],[817.64,973.27],[817.64,973.27],[827.09,973.27],[827.09,973.27],[827.09,973.27],[830.36,971.45],[830.36,971.45],[830.36,971.45],[833.82,971.45],[833.82,971.45],[833.82,971.45],[837.09,967.74],[837.09,967.74],[837.09,967.74],[836.25,964.88],[836.25,964.88],[836.25,964.88],[834.5,962.62],[834.5,962.62],[834.5,962.62],[830.62,964.38],[830.62,964.38],[830.62,964.38],[828.25,962.0],[828.25,962.0],[828.25,962.0],[828.62,959.88],[828.62,959.88],[828.62,959.88],[830.88,959.12],[830.88,959.12],[830.88,959.12],[834.38,955.88],[834.38,955.88],[834.38,955.88],[834.5,950.12],[834.5,950.12],[834.5,950.12],[831.75,948.0],[831.75,948.0],[831.75,948.0],[831.62,943.12],[831.62,943.12],[831.62,943.12],[830.38,943.12],[830.38,943.12],[830.38,943.12],[830.75,936.75],[830.75,936.75],[830.75,936.75],[837.0,928.0],[837.0,928.0],[837.0,928.0],[844.75,924.25],[844.75,924.25],[844.75,924.25],[848.5,920.25],[848.5,920.25],[848.5,920.25],[851.0,909.5],[851.0,909.5],[851.0,909.5],[854.38,904.5],[854.38,904.5],[854.38,904.5],[857.5,905.75],[857.5,905.75],[857.5,905.75],[863.75,901.38],[863.75,901.38],[863.75,901.38],[872.5,903.12],[872.5,903.12],[872.5,903.12],[876.25,906.88],[876.25,906.88],[876.25,906.88],[880.25,905.25],[880.25,905.25],[880.25,905.25],[879.25,887.5],[879.25,887.5],[879.25,887.5],[882.38,880.88],[882.38,880.88],[882.38,880.88],[885.5,880.38],[885.5,880.38],[885.5,880.38],[887.5,878.0],[887.5,878.0],[887.5,878.0],[894.0,877.75],[894.0,877.75],[894.0,877.75],[896.12,875.5],[896.12,875.5],[896.12,875.5],[899.38,875.62],[899.38,875.62],[899.38,875.62],[910.5,863.38],[910.5,863.38],[910.5,863.38],[913.36,856.18],[913.36,856.18],[913.36,856.18],[913.64,854.09],[913.64,854.09],[913.64,854.09],[917.36,851.64],[917.36,851.64],[917.36,851.64],[920.0,851.36],[920.0,851.36],[920.0,851.36],[924.27,844.82],[924.27,844.82],[924.27,844.82],[924.82,839.27],[924.82,839.27],[924.82,839.27],[930.27,831.09],[930.27,831.09],[930.27,831.09],[927.09,821.64],[927.09,821.64],[927.09,821.64],[925.73,811.55],[925.73,811.55],[925.73,811.55],[923.27,807.36],[923.27,807.36],[923.27,807.36],[917.18,804.18],[917.18,804.18],[917.18,804.18],[917.0,796.0],[917.0,796.0],[917.0,796.0],[920.36,789.55],[920.36,789.55],[920.36,789.55],[920.55,782.55],[920.55,782.55],[920.55,782.55],[912.0,772.73],[912.0,772.73],[912.0,772.73],[910.82,767.91],[910.82,767.91],[910.82,767.91],[903.36,764.36],[903.36,764.36],[903.36,764.36],[899.75,767.62],[899.75,767.62],[899.75,767.62],[900.12,772.75],[900.12,772.75],[900.12,772.75],[894.62,773.5],[894.62,773.5],[894.62,773.5],[892.38,770.25],[892.38,770.25],[892.38,770.25],[890.25,769.5],[890.25,769.5],[890.25,769.5],[884.62,770.62],[884.62,770.62],[884.62,770.62],[881.5,767.62],[881.5,767.62],[881.5,767.62],[879.5,772.12],[879.5,772.12],[879.5,772.12],[877.25,774.38],[877.25,774.38],[877.25,774.38],[866.62,773.0],[866.62,773.0],[866.62,773.0],[863.62,773.75],[863.62,773.75],[863.62,773.75],[860.25,771.62],[860.25,771.62],[860.25,771.62],[852.55,777.09],[852.55,777.09]]],['jacksonHole',[[950.73,868.0],[956.36,873.45],[956.36,873.45],[956.36,873.45],[957.64,876.18],[957.64,876.18],[957.64,876.18],[956.0,884.91],[956.0,884.91],[956.0,884.91],[958.73,894.55],[958.73,894.55],[958.73,894.55],[957.45,902.73],[957.45,902.73],[957.45,902.73],[958.36,907.09],[958.36,907.09],[958.36,907.09],[952.91,912.36],[952.91,912.36],[952.91,912.36],[953.09,917.82],[953.09,917.82],[953.09,917.82],[950.0,924.75],[950.0,924.75],[950.0,924.75],[943.5,931.5],[943.5,931.5],[943.5,931.5],[942.62,943.88],[942.62,943.88],[942.62,943.88],[935.88,950.5],[935.88,950.5],[935.88,950.5],[927.75,951.88],[927.75,951.88],[927.75,951.88],[923.75,954.62],[923.75,954.62],[923.75,954.62],[921.0,960.12],[921.0,960.12],[921.0,960.12],[907.12,964.25],[907.12,964.25],[907.12,964.25],[900.25,971.62],[900.25,971.62],[900.25,971.62],[900.0,975.25],[900.0,975.25],[900.0,975.25],[896.5,978.5],[896.5,978.5],[896.5,978.5],[893.73,979.09],[893.73,979.09],[893.73,979.09],[890.45,981.09],[890.45,981.09],[890.45,981.09],[886.91,980.09],[886.91,980.09],[886.91,980.09],[878.36,972.55],[878.36,972.55],[878.36,972.55],[877.45,970.36],[877.45,970.36],[877.45,970.36],[868.18,963.09],[868.18,963.09],[868.18,963.09],[853.82,959.27],[853.82,959.27],[853.82,959.27],[845.45,960.91],[845.45,960.91],[845.45,960.91],[840.0,964.82],[840.0,964.82],[840.0,964.82],[837.09,967.74],[837.09,967.74],[837.09,967.74],[836.25,964.88],[836.25,964.88],[836.25,964.88],[834.5,962.62],[834.5,962.62],[834.5,962.62],[830.62,964.38],[830.62,964.38],[830.62,964.38],[828.25,962.0],[828.25,962.0],[828.25,962.0],[828.62,959.88],[828.62,959.88],[828.62,959.88],[830.88,959.12],[830.88,959.12],[830.88,959.12],[834.38,955.88],[834.38,955.88],[834.38,955.88],[834.5,950.12],[834.5,950.12],[834.5,950.12],[831.75,948.0],[831.75,948.0],[831.75,948.0],[831.62,943.12],[831.62,943.12],[831.62,943.12],[830.38,943.12],[830.38,943.12],[830.38,943.12],[830.75,936.75],[830.75,936.75],[830.75,936.75],[837.0,928.0],[837.0,928.0],[837.0,928.0],[844.75,924.25],[844.75,924.25],[844.75,924.25],[848.5,920.25],[848.5,920.25],[848.5,920.25],[851.0,909.5],[851.0,909.5],[851.0,909.5],[854.38,904.5],[854.38,904.5],[854.38,904.5],[857.5,905.75],[857.5,905.75],[857.5,905.75],[863.75,901.38],[863.75,901.38],[863.75,901.38],[872.5,903.12],[872.5,903.12],[872.5,903.12],[876.25,906.88],[876.25,906.88],[876.25,906.88],[880.25,905.25],[880.25,905.25],[880.25,905.25],[879.25,887.5],[879.25,887.5],[879.25,887.5],[882.38,880.88],[882.38,880.88],[882.38,880.88],[885.5,880.38],[885.5,880.38],[885.5,880.38],[887.5,878.0],[887.5,878.0],[887.5,878.0],[894.0,877.75],[894.0,877.75],[894.0,877.75],[896.12,875.5],[896.12,875.5],[896.12,875.5],[899.38,875.62],[899.38,875.62],[899.38,875.62],[910.5,863.38],[910.5,863.38],[910.5,863.38],[913.36,856.18],[913.36,856.18],[913.36,856.18],[915.09,857.73],[915.09,857.73],[915.09,857.73],[920.64,857.45],[920.64,857.45],[920.64,857.45],[922.82,855.64],[922.82,855.64],[922.82,855.64],[925.45,855.27],[925.45,855.27],[925.45,855.27],[928.82,852.91],[928.82,852.91],[928.82,852.91],[932.18,855.0],[932.18,855.0],[932.18,855.0],[933.18,858.55],[933.18,858.55],[933.18,858.55],[941.27,868.27],[941.27,868.27],[941.27,868.27],[946.62,867.56],[946.62,867.56],[946.62,867.56],[950.73,868.0],[950.73,868.0]]],['sunder',[[948.06,863.5],[952.56,861.88],[952.56,861.88],[952.56,861.88],[959.19,856.06],[959.19,856.06],[959.19,856.06],[960.25,852.75],[960.25,852.75],[960.25,852.75],[970.38,845.12],[970.38,845.12],[970.38,845.12],[973.25,844.62],[973.25,844.62],[973.25,844.62],[977.38,841.62],[977.38,841.62],[977.38,841.62],[982.12,843.38],[982.12,843.38],[982.12,843.38],[983.75,847.62],[983.75,847.62],[983.75,847.62],[990.88,846.5],[990.88,846.5],[990.88,846.5],[996.12,840.88],[996.12,840.88],[996.12,840.88],[996.5,831.0],[996.5,831.0],[996.5,831.0],[999.62,826.25],[999.62,826.25],[999.62,826.25],[1000.38,821.75],[1000.38,821.75],[1000.38,821.75],[1003.62,819.62],[1003.62,819.62],[1003.62,819.62],[1008.12,822.38],[1008.12,822.38],[1008.12,822.38],[1010.25,820.88],[1010.25,820.88],[1010.25,820.88],[1011.0,818.62],[1011.0,818.62],[1011.0,818.62],[1016.88,818.62],[1016.88,818.62],[1016.88,818.62],[1018.0,822.75],[1018.0,822.75],[1018.0,822.75],[1022.25,827.12],[1022.25,827.12],[1022.25,827.12],[1025.62,827.0],[1025.62,827.0],[1025.62,827.0],[1033.5,832.0],[1033.5,832.0],[1033.5,832.0],[1035.0,837.0],[1035.0,837.0],[1035.0,837.0],[1042.62,844.88],[1042.62,844.88],[1042.62,844.88],[1043.75,855.88],[1043.75,855.88],[1043.75,855.88],[1049.75,861.5],[1049.75,861.5],[1049.75,861.5],[1061.62,867.5],[1061.62,867.5],[1061.62,867.5],[1068.25,866.0],[1068.25,866.0],[1068.25,866.0],[1073.64,868.91],[1073.64,868.91],[1073.64,868.91],[1076.0,873.82],[1076.0,873.82],[1076.0,873.82],[1072.73,881.64],[1072.73,881.64],[1072.73,881.64],[1073.09,885.82],[1073.09,885.82],[1073.09,885.82],[1062.91,889.64],[1062.91,889.64],[1062.91,889.64],[1058.73,901.27],[1058.73,901.27],[1058.73,901.27],[1058.91,914.0],[1058.91,914.0],[1058.91,914.0],[1065.64,922.73],[1065.64,922.73],[1065.64,922.73],[1066.18,928.91],[1066.18,928.91],[1066.18,928.91],[1064.73,933.09],[1064.73,933.09],[1064.73,933.09],[1060.25,943.5],[1060.25,943.5],[1060.25,943.5],[1052.75,944.0],[1052.75,944.0],[1052.75,944.0],[1047.75,946.0],[1047.75,946.0],[1047.75,946.0],[1047.0,951.75],[1047.0,951.75],[1047.0,951.75],[1053.0,959.0],[1053.0,959.0],[1053.0,959.0],[1047.45,964.36],[1047.45,964.36],[1047.45,964.36],[1047.0,968.36],[1047.0,968.36],[1047.0,968.36],[1038.36,978.91],[1038.36,978.91],[1038.36,978.91],[1031.09,980.18],[1031.09,980.18],[1031.09,980.18],[1028.73,978.18],[1028.73,978.18],[1028.73,978.18],[1025.27,977.91],[1025.27,977.91],[1025.27,977.91],[1016.45,972.73],[1016.45,972.73],[1016.45,972.73],[1012.82,971.91],[1012.82,971.91],[1012.82,971.91],[1008.0,973.91],[1008.0,973.91],[1008.0,973.91],[1006.91,977.36],[1006.91,977.36],[1006.91,977.36],[1003.91,979.0],[1003.91,979.0],[1003.91,979.0],[1000.5,978.25],[1000.5,978.25],[1000.5,978.25],[996.73,972.27],[996.73,972.27],[996.73,972.27],[998.91,964.09],[998.91,964.09],[998.91,964.09],[997.55,959.09],[997.55,959.09],[997.55,959.09],[993.27,954.09],[993.27,954.09],[993.27,954.09],[984.82,951.36],[984.82,951.36],[984.82,951.36],[974.09,950.91],[974.09,950.91],[974.09,950.91],[969.55,946.36],[969.55,946.36],[969.55,946.36],[963.45,944.36],[963.45,944.36],[963.45,944.36],[956.73,924.18],[956.73,924.18],[956.73,924.18],[953.09,917.82],[953.09,917.82],[953.09,917.82],[952.91,912.36],[952.91,912.36],[952.91,912.36],[958.36,907.09],[958.36,907.09],[958.36,907.09],[957.45,902.73],[957.45,902.73],[957.45,902.73],[958.73,894.55],[958.73,894.55],[958.73,894.55],[956.0,884.91],[956.0,884.91],[956.0,884.91],[957.64,876.18],[957.64,876.18],[957.64,876.18],[956.36,873.45],[956.36,873.45],[956.36,873.45],[950.73,868.0],[950.73,868.0],[950.73,868.0],[946.62,867.56],[946.62,867.56],[946.62,867.56],[948.06,863.5],[948.06,863.5]]],['lookout',[[1054.36,1072.55],[1056.36,1069.82],[1056.36,1069.82],[1056.36,1069.82],[1057.27,1065.09],[1057.27,1065.09],[1057.27,1065.09],[1072.36,1060.36],[1072.36,1060.36],[1072.36,1060.36],[1079.82,1052.36],[1079.82,1052.36],[1079.82,1052.36],[1077.27,1047.09],[1077.27,1047.09],[1077.27,1047.09],[1076.73,1044.0],[1076.73,1044.0],[1076.73,1044.0],[1071.09,1035.45],[1071.09,1035.45],[1071.09,1035.45],[1073.09,1029.45],[1073.09,1029.45],[1073.09,1029.45],[1080.36,1022.36],[1080.36,1022.36],[1080.36,1022.36],[1079.82,1013.82],[1079.82,1013.82],[1079.82,1013.82],[1081.82,1006.91],[1081.82,1006.91],[1081.82,1006.91],[1077.0,994.75],[1077.0,994.75],[1077.0,994.75],[1070.25,993.0],[1070.25,993.0],[1070.25,993.0],[1064.75,989.25],[1064.75,989.25],[1064.75,989.25],[1063.5,983.5],[1063.5,983.5],[1063.5,983.5],[1065.5,981.0],[1065.5,981.0],[1065.5,981.0],[1065.25,976.75],[1065.25,976.75],[1065.25,976.75],[1059.0,968.0],[1059.0,968.0],[1059.0,968.0],[1058.25,962.0],[1058.25,962.0],[1058.25,962.0],[1052.82,959.0],[1052.82,959.0],[1052.82,959.0],[1047.45,964.36],[1047.45,964.36],[1047.45,964.36],[1047.0,968.36],[1047.0,968.36],[1047.0,968.36],[1038.36,978.91],[1038.36,978.91],[1038.36,978.91],[1031.09,980.18],[1031.09,980.18],[1031.09,980.18],[1028.73,978.18],[1028.73,978.18],[1028.73,978.18],[1025.27,977.91],[1025.27,977.91],[1025.27,977.91],[1016.45,972.73],[1016.45,972.73],[1016.45,972.73],[1012.82,971.91],[1012.82,971.91],[1012.82,971.91],[1008.0,973.91],[1008.0,973.91],[1008.0,973.91],[1006.91,977.36],[1006.91,977.36],[1006.91,977.36],[1003.91,979.0],[1003.91,979.0],[1003.91,979.0],[1000.5,978.25],[1000.5,978.25],[1000.5,978.25],[999.88,982.0],[999.88,982.0],[999.88,982.0],[995.88,984.5],[995.88,984.5],[995.88,984.5],[991.88,989.25],[991.88,989.25],[991.88,989.25],[993.38,992.88],[993.38,992.88],[993.38,992.88],[993.25,1002.5],[993.25,1002.5],[993.25,1002.5],[991.12,1005.62],[991.12,1005.62],[991.12,1005.62],[990.88,1017.62],[990.88,1017.62],[990.88,1017.62],[988.25,1022.62],[988.25,1022.62],[988.25,1022.62],[984.38,1020.62],[984.38,1020.62],[984.38,1020.62],[981.0,1021.5],[981.0,1021.5],[981.0,1021.5],[978.62,1025.75],[978.62,1025.75],[978.62,1025.75],[981.75,1030.38],[981.75,1030.38],[981.75,1030.38],[981.75,1037.62],[981.75,1037.62],[981.75,1037.62],[975.5,1043.12],[975.5,1043.12],[975.5,1043.12],[976.0,1048.75],[976.0,1048.75],[976.0,1048.75],[977.62,1052.12],[977.62,1052.12],[977.62,1052.12],[975.88,1054.38],[975.88,1054.38],[975.88,1054.38],[976.0,1056.75],[976.0,1056.75],[976.0,1056.75],[980.25,1057.38],[980.25,1057.38],[980.25,1057.38],[984.75,1061.0],[984.75,1061.0],[984.75,1061.0],[988.88,1068.88],[988.88,1068.88],[988.88,1068.88],[998.5,1079.25],[998.5,1079.25],[998.5,1079.25],[1005.0,1080.88],[1005.0,1080.88],[1005.0,1080.88],[1012.88,1080.0],[1012.88,1080.0],[1012.88,1080.0],[1017.12,1077.0],[1017.12,1077.0],[1017.12,1077.0],[1022.88,1083.25],[1022.88,1083.25],[1022.88,1083.25],[1025.5,1083.12],[1025.5,1083.12],[1025.5,1083.12],[1027.75,1078.25],[1027.75,1078.25],[1027.75,1078.25],[1031.25,1078.0],[1031.25,1078.0],[1031.25,1078.0],[1039.75,1071.75],[1039.75,1071.75],[1039.75,1071.75],[1048.0,1073.12],[1048.0,1073.12],[1048.0,1073.12],[1050.88,1075.38],[1050.88,1075.38],[1050.88,1075.38],[1054.36,1075.45],[1054.36,1075.45],[1054.36,1075.45],[1054.36,1072.55],[1054.36,1072.55]]],['boomtown',[[973.91,1058.55],[976.0,1056.75],[976.0,1056.75],[976.0,1056.75],[975.88,1054.38],[975.88,1054.38],[975.88,1054.38],[977.62,1052.12],[977.62,1052.12],[977.62,1052.12],[976.0,1048.75],[976.0,1048.75],[976.0,1048.75],[975.5,1043.12],[975.5,1043.12],[975.5,1043.12],[981.75,1037.62],[981.75,1037.62],[981.75,1037.62],[981.75,1030.38],[981.75,1030.38],[981.75,1030.38],[978.62,1025.75],[978.62,1025.75],[978.62,1025.75],[981.0,1021.5],[981.0,1021.5],[981.0,1021.5],[984.38,1020.62],[984.38,1020.62],[984.38,1020.62],[988.25,1022.62],[988.25,1022.62],[988.25,1022.62],[990.88,1017.62],[990.88,1017.62],[990.88,1017.62],[991.12,1005.62],[991.12,1005.62],[991.12,1005.62],[993.25,1002.5],[993.25,1002.5],[993.25,1002.5],[993.38,992.88],[993.38,992.88],[993.38,992.88],[991.88,989.25],[991.88,989.25],[991.88,989.25],[995.88,984.5],[995.88,984.5],[995.88,984.5],[999.88,982.0],[999.88,982.0],[999.88,982.0],[1000.5,978.25],[1000.5,978.25],[1000.5,978.25],[996.73,972.27],[996.73,972.27],[996.73,972.27],[998.91,964.09],[998.91,964.09],[998.91,964.09],[997.55,959.09],[997.55,959.09],[997.55,959.09],[993.27,954.09],[993.27,954.09],[993.27,954.09],[984.82,951.36],[984.82,951.36],[984.82,951.36],[974.09,950.91],[974.09,950.91],[974.09,950.91],[969.55,946.36],[969.55,946.36],[969.55,946.36],[963.45,944.36],[963.45,944.36],[963.45,944.36],[956.73,924.18],[956.73,924.18],[956.73,924.18],[953.09,917.82],[953.09,917.82],[953.09,917.82],[950.0,924.75],[950.0,924.75],[950.0,924.75],[943.5,931.5],[943.5,931.5],[943.5,931.5],[942.62,943.88],[942.62,943.88],[942.62,943.88],[935.88,950.5],[935.88,950.5],[935.88,950.5],[927.75,951.88],[927.75,951.88],[927.75,951.88],[923.75,954.62],[923.75,954.62],[923.75,954.62],[921.0,960.12],[921.0,960.12],[921.0,960.12],[907.12,964.25],[907.12,964.25],[907.12,964.25],[900.25,971.62],[900.25,971.62],[900.25,971.62],[900.0,975.25],[900.0,975.25],[900.0,975.25],[896.5,978.5],[896.5,978.5],[896.5,978.5],[899.09,978.64],[899.09,978.64],[899.09,978.64],[901.64,980.0],[901.64,980.0],[901.64,980.0],[901.64,982.91],[901.64,982.91],[901.64,982.91],[898.91,987.09],[898.91,987.09],[898.91,987.09],[895.45,988.64],[895.45,988.64],[895.45,988.64],[895.27,1000.0],[895.27,1000.0],[895.27,1000.0],[896.36,1003.36],[896.36,1003.36],[896.36,1003.36],[894.27,1010.0],[894.27,1010.0],[894.27,1010.0],[889.55,1015.64],[889.55,1015.64],[889.55,1015.64],[887.38,1021.75],[887.38,1021.75],[887.38,1021.75],[891.27,1023.09],[891.27,1023.09],[891.27,1023.09],[896.73,1030.91],[896.73,1030.91],[896.73,1030.91],[902.73,1031.64],[902.73,1031.64],[902.73,1031.64],[906.0,1035.82],[906.0,1035.82],[906.0,1035.82],[914.73,1036.36],[914.73,1036.36],[914.73,1036.36],[915.27,1040.36],[915.27,1040.36],[915.27,1040.36],[920.55,1046.73],[920.55,1046.73],[920.55,1046.73],[924.36,1047.64],[924.36,1047.64],[924.36,1047.64],[925.64,1050.0],[925.64,1050.0],[925.64,1050.0],[923.64,1054.73],[923.64,1054.73],[923.64,1054.73],[931.09,1064.91],[931.09,1064.91],[931.09,1064.91],[936.0,1065.27],[936.0,1065.27],[936.0,1065.27],[940.73,1066.55],[940.73,1066.55],[940.73,1066.55],[946.55,1062.36],[946.55,1062.36],[946.55,1062.36],[958.0,1063.0],[958.0,1063.0],[958.0,1063.0],[965.09,1059.0],[965.09,1059.0],[965.09,1059.0],[973.91,1058.55],[973.91,1058.55],[973.91,1058.55],[976.0,1056.75],[976.0,1056.75]]],['troydon',[[958.0,1063.0],[946.55,1062.36],[946.55,1062.36],[946.55,1062.36],[940.73,1066.55],[940.73,1066.55],[940.73,1066.55],[936.0,1065.27],[936.0,1065.27],[936.0,1065.27],[931.09,1064.91],[931.09,1064.91],[931.09,1064.91],[923.64,1054.73],[923.64,1054.73],[923.64,1054.73],[925.64,1050.0],[925.64,1050.0],[925.64,1050.0],[924.36,1047.64],[924.36,1047.64],[924.36,1047.64],[920.55,1046.73],[920.55,1046.73],[920.55,1046.73],[915.27,1040.36],[915.27,1040.36],[915.27,1040.36],[914.73,1036.36],[914.73,1036.36],[914.73,1036.36],[906.0,1035.82],[906.0,1035.82],[906.0,1035.82],[902.73,1031.64],[902.73,1031.64],[902.73,1031.64],[896.73,1030.91],[896.73,1030.91],[896.73,1030.91],[891.27,1023.09],[891.27,1023.09],[891.27,1023.09],[887.38,1021.75],[887.38,1021.75],[887.38,1021.75],[884.18,1027.64],[884.18,1027.64],[884.18,1027.64],[879.27,1033.64],[879.27,1033.64],[879.27,1033.64],[874.36,1034.73],[874.36,1034.73],[874.36,1034.73],[870.73,1038.18],[870.73,1038.18],[870.73,1038.18],[868.36,1046.18],[868.36,1046.18],[868.36,1046.18],[863.82,1051.45],[863.82,1051.45],[863.82,1051.45],[862.73,1062.36],[862.73,1062.36],[862.73,1062.36],[864.36,1065.82],[864.36,1065.82],[864.36,1065.82],[854.73,1087.27],[854.73,1087.27],[854.73,1087.27],[857.27,1094.0],[857.27,1094.0],[857.27,1094.0],[856.18,1112.73],[856.18,1112.73],[856.18,1112.73],[859.09,1116.0],[859.09,1116.0],[859.09,1116.0],[856.91,1120.91],[856.91,1120.91],[856.91,1120.91],[857.09,1124.91],[857.09,1124.91],[857.09,1124.91],[864.18,1132.18],[864.18,1132.18],[864.18,1132.18],[874.55,1135.64],[874.55,1135.64],[874.55,1135.64],[876.73,1142.91],[876.73,1142.91],[876.73,1142.91],[881.64,1148.55],[881.64,1148.55],[881.64,1148.55],[881.82,1162.55],[881.82,1162.55],[881.82,1162.55],[887.27,1163.82],[887.27,1163.82],[887.27,1163.82],[886.91,1171.82],[886.91,1171.82],[886.91,1171.82],[885.64,1175.09],[885.64,1175.09],[885.64,1175.09],[876.91,1181.82],[876.91,1181.82],[876.91,1181.82],[876.55,1190.73],[876.55,1190.73],[876.55,1190.73],[874.36,1193.45],[874.36,1193.45],[874.36,1193.45],[873.45,1215.45],[873.45,1215.45],[873.45,1215.45],[874.91,1216.91],[874.91,1216.91],[874.91,1216.91],[876.55,1225.09],[876.55,1225.09],[876.55,1225.09],[880.73,1228.36],[880.73,1228.36],[880.73,1228.36],[898.73,1229.27],[898.73,1229.27],[898.73,1229.27],[920.0,1235.64],[920.0,1235.64],[920.0,1235.64],[924.73,1235.91],[924.73,1235.91],[924.73,1235.91],[934.73,1230.91],[934.73,1230.91],[934.73,1230.91],[947.09,1229.0],[947.09,1229.0],[947.09,1229.0],[949.0,1225.75],[949.0,1225.75],[949.0,1225.75],[947.12,1222.25],[947.12,1222.25],[947.12,1222.25],[940.38,1215.5],[940.38,1215.5],[940.38,1215.5],[940.25,1211.5],[940.25,1211.5],[940.25,1211.5],[946.75,1207.38],[946.75,1207.38],[946.75,1207.38],[947.25,1199.0],[947.25,1199.0],[947.25,1199.0],[951.25,1190.88],[951.25,1190.88],[951.25,1190.88],[949.38,1184.25],[949.38,1184.25],[949.38,1184.25],[945.5,1189.5],[945.5,1189.5],[945.5,1189.5],[945.62,1192.5],[945.62,1192.5],[945.62,1192.5],[941.5,1189.5],[941.5,1189.5],[941.5,1189.5],[943.62,1185.12],[943.62,1185.12],[943.62,1185.12],[944.0,1181.5],[944.0,1181.5],[944.0,1181.5],[948.0,1177.88],[948.0,1177.88],[948.0,1177.88],[947.88,1169.38],[947.88,1169.38],[947.88,1169.38],[951.75,1164.25],[951.75,1164.25],[951.75,1164.25],[951.0,1162.25],[951.0,1162.25],[951.0,1162.25],[957.75,1151.75],[957.75,1151.75],[957.75,1151.75],[954.5,1137.75],[954.5,1137.75],[954.5,1137.75],[957.75,1134.88],[957.75,1134.88],[957.75,1134.88],[958.0,1131.12],[958.0,1131.12],[958.0,1131.12],[960.88,1128.5],[960.88,1128.5],[960.88,1128.5],[962.12,1117.62],[962.12,1117.62],[962.12,1117.62],[965.5,1111.88],[965.5,1111.88],[965.5,1111.88],[959.75,1104.62],[959.75,1104.62],[959.75,1104.62],[959.75,1101.75],[959.75,1101.75],[959.75,1101.75],[968.0,1102.25],[968.0,1102.25],[968.0,1102.25],[972.62,1099.25],[972.62,1099.25],[972.62,1099.25],[974.75,1088.0],[974.75,1088.0],[974.75,1088.0],[972.88,1079.0],[972.88,1079.0],[972.88,1079.0],[968.75,1073.25],[968.75,1073.25],[968.75,1073.25],[965.0,1064.25],[965.0,1064.25],[965.0,1064.25],[965.09,1059.0],[965.09,1059.0],[965.09,1059.0],[958.0,1063.0],[958.0,1063.0]]],['ballast',[[1050.88,1075.38],[1048.0,1073.12],[1048.0,1073.12],[1048.0,1073.12],[1039.75,1071.75],[1039.75,1071.75],[1039.75,1071.75],[1031.25,1078.0],[1031.25,1078.0],[1031.25,1078.0],[1027.75,1078.25],[1027.75,1078.25],[1027.75,1078.25],[1025.5,1083.12],[1025.5,1083.12],[1025.5,1083.12],[1022.88,1083.25],[1022.88,1083.25],[1022.88,1083.25],[1017.12,1077.0],[1017.12,1077.0],[1017.12,1077.0],[1012.88,1080.0],[1012.88,1080.0],[1012.88,1080.0],[1005.0,1080.88],[1005.0,1080.88],[1005.0,1080.88],[998.5,1079.25],[998.5,1079.25],[998.5,1079.25],[988.88,1068.88],[988.88,1068.88],[988.88,1068.88],[984.75,1061.0],[984.75,1061.0],[984.75,1061.0],[980.25,1057.38],[980.25,1057.38],[980.25,1057.38],[976.0,1056.75],[976.0,1056.75],[976.0,1056.75],[973.91,1058.55],[973.91,1058.55],[973.91,1058.55],[965.09,1059.0],[965.09,1059.0],[965.09,1059.0],[965.0,1064.25],[965.0,1064.25],[965.0,1064.25],[968.75,1073.25],[968.75,1073.25],[968.75,1073.25],[972.88,1079.0],[972.88,1079.0],[972.88,1079.0],[974.75,1088.0],[974.75,1088.0],[974.75,1088.0],[972.62,1099.25],[972.62,1099.25],[972.62,1099.25],[968.0,1102.25],[968.0,1102.25],[968.0,1102.25],[959.75,1101.75],[959.75,1101.75],[959.75,1101.75],[959.75,1104.62],[959.75,1104.62],[959.75,1104.62],[965.5,1111.88],[965.5,1111.88],[965.5,1111.88],[962.12,1117.62],[962.12,1117.62],[962.12,1117.62],[960.88,1128.5],[960.88,1128.5],[960.88,1128.5],[958.0,1131.12],[958.0,1131.12],[958.0,1131.12],[957.75,1134.88],[957.75,1134.88],[957.75,1134.88],[954.5,1137.75],[954.5,1137.75],[954.5,1137.75],[957.75,1151.75],[957.75,1151.75],[957.75,1151.75],[951.0,1162.25],[951.0,1162.25],[951.0,1162.25],[951.75,1164.25],[951.75,1164.25],[951.75,1164.25],[947.88,1169.38],[947.88,1169.38],[947.88,1169.38],[948.0,1177.88],[948.0,1177.88],[948.0,1177.88],[944.0,1181.5],[944.0,1181.5],[944.0,1181.5],[943.62,1185.12],[943.62,1185.12],[943.62,1185.12],[941.5,1189.5],[941.5,1189.5],[941.5,1189.5],[945.62,1192.5],[945.62,1192.5],[945.62,1192.5],[945.5,1189.5],[945.5,1189.5],[945.5,1189.5],[949.38,1184.25],[949.38,1184.25],[949.38,1184.25],[951.25,1190.88],[951.25,1190.88],[951.25,1190.88],[947.25,1199.0],[947.25,1199.0],[947.25,1199.0],[946.75,1207.38],[946.75,1207.38],[946.75,1207.38],[940.25,1211.5],[940.25,1211.5],[940.25,1211.5],[940.38,1215.5],[940.38,1215.5],[940.38,1215.5],[947.12,1222.25],[947.12,1222.25],[947.12,1222.25],[949.0,1225.75],[949.0,1225.75],[949.0,1225.75],[952.36,1222.73],[952.36,1222.73],[952.36,1222.73],[960.0,1221.82],[960.0,1221.82],[960.0,1221.82],[963.45,1217.82],[963.45,1217.82],[963.45,1217.82],[974.73,1212.36],[974.73,1212.36],[974.73,1212.36],[980.55,1206.18],[980.55,1206.18],[980.55,1206.18],[988.0,1201.82],[988.0,1201.82],[988.0,1201.82],[992.18,1202.0],[992.18,1202.0],[992.18,1202.0],[1008.36,1205.27],[1008.36,1205.27],[1008.36,1205.27],[1030.25,1205.88],[1030.25,1205.88],[1030.25,1205.88],[1029.38,1200.88],[1029.38,1200.88],[1029.38,1200.88],[1029.88,1190.88],[1029.88,1190.88],[1029.88,1190.88],[1027.62,1184.38],[1027.62,1184.38],[1027.62,1184.38],[1022.75,1180.25],[1022.75,1180.25],[1022.75,1180.25],[1023.88,1167.12],[1023.88,1167.12],[1023.88,1167.12],[1034.5,1150.75],[1034.5,1150.75],[1034.5,1150.75],[1040.38,1146.62],[1040.38,1146.62],[1040.38,1146.62],[1042.38,1141.12],[1042.38,1141.12],[1042.38,1141.12],[1034.38,1131.75],[1034.38,1131.75],[1034.38,1131.75],[1034.5,1127.75],[1034.5,1127.75],[1034.5,1127.75],[1037.38,1124.0],[1037.38,1124.0],[1037.38,1124.0],[1045.38,1107.12],[1045.38,1107.12],[1045.38,1107.12],[1046.0,1103.5],[1046.0,1103.5],[1046.0,1103.5],[1052.88,1091.5],[1052.88,1091.5],[1052.88,1091.5],[1054.36,1075.45],[1054.36,1075.45],[1054.36,1075.45],[1050.88,1075.38],[1050.88,1075.38]]],['aspara',[[1030.25,1205.88],[1029.38,1200.88],[1029.38,1200.88],[1029.38,1200.88],[1029.88,1190.88],[1029.88,1190.88],[1029.88,1190.88],[1027.62,1184.38],[1027.62,1184.38],[1027.62,1184.38],[1022.75,1180.25],[1022.75,1180.25],[1022.75,1180.25],[1023.88,1167.12],[1023.88,1167.12],[1023.88,1167.12],[1034.5,1150.75],[1034.5,1150.75],[1034.5,1150.75],[1040.38,1146.62],[1040.38,1146.62],[1040.38,1146.62],[1042.38,1141.12],[1042.38,1141.12],[1042.38,1141.12],[1034.38,1131.75],[1034.38,1131.75],[1034.38,1131.75],[1034.5,1127.75],[1034.5,1127.75],[1034.5,1127.75],[1037.38,1124.0],[1037.38,1124.0],[1037.38,1124.0],[1045.38,1107.12],[1045.38,1107.12],[1045.38,1107.12],[1046.0,1103.5],[1046.0,1103.5],[1046.0,1103.5],[1052.88,1091.5],[1052.88,1091.5],[1052.88,1091.5],[1054.36,1075.45],[1054.36,1075.45],[1054.36,1075.45],[1054.36,1072.55],[1054.36,1072.55],[1054.36,1072.55],[1056.36,1069.82],[1056.36,1069.82],[1056.36,1069.82],[1057.27,1065.09],[1057.27,1065.09],[1057.27,1065.09],[1072.36,1060.36],[1072.36,1060.36],[1072.36,1060.36],[1079.82,1052.36],[1079.82,1052.36],[1079.82,1052.36],[1077.27,1047.09],[1077.27,1047.09],[1077.27,1047.09],[1076.73,1044.0],[1076.73,1044.0],[1076.73,1044.0],[1071.09,1035.45],[1071.09,1035.45],[1071.09,1035.45],[1073.09,1029.45],[1073.09,1029.45],[1073.09,1029.45],[1080.36,1022.36],[1080.36,1022.36],[1080.36,1022.36],[1079.82,1013.82],[1079.82,1013.82],[1079.82,1013.82],[1081.82,1006.91],[1081.82,1006.91],[1081.82,1006.91],[1077.0,994.75],[1077.0,994.75],[1077.0,994.75],[1070.25,993.0],[1070.25,993.0],[1070.25,993.0],[1064.75,989.25],[1064.75,989.25],[1064.75,989.25],[1063.5,983.5],[1063.5,983.5],[1063.5,983.5],[1065.5,981.0],[1065.5,981.0],[1065.5,981.0],[1065.25,976.75],[1065.25,976.75],[1065.25,976.75],[1059.0,968.0],[1059.0,968.0],[1059.0,968.0],[1058.25,962.0],[1058.25,962.0],[1058.25,962.0],[1053.0,959.0],[1053.0,959.0],[1053.0,959.0],[1047.0,951.75],[1047.0,951.75],[1047.0,951.75],[1047.75,946.0],[1047.75,946.0],[1047.75,946.0],[1052.75,944.0],[1052.75,944.0],[1052.75,944.0],[1060.25,943.5],[1060.25,943.5],[1060.25,943.5],[1064.73,933.09],[1064.73,933.09],[1064.73,933.09],[1066.73,937.45],[1066.73,937.45],[1066.73,937.45],[1067.64,948.36],[1067.64,948.36],[1067.64,948.36],[1070.55,953.27],[1070.55,953.27],[1070.55,953.27],[1072.73,966.18],[1072.73,966.18],[1072.73,966.18],[1078.73,973.27],[1078.73,973.27],[1078.73,973.27],[1084.18,970.36],[1084.18,970.36],[1084.18,970.36],[1084.73,964.55],[1084.73,964.55],[1084.73,964.55],[1088.0,960.73],[1088.0,960.73],[1088.0,960.73],[1089.09,955.27],[1089.09,955.27],[1089.09,955.27],[1094.0,951.09],[1094.0,951.09],[1094.0,951.09],[1100.18,951.09],[1100.18,951.09],[1100.18,951.09],[1107.27,958.91],[1107.27,958.91],[1107.27,958.91],[1113.09,959.27],[1113.09,959.27],[1113.09,959.27],[1116.36,956.0],[1116.36,956.0],[1116.36,956.0],[1127.0,955.5],[1127.0,955.5],[1127.0,955.5],[1125.82,962.18],[1125.82,962.18],[1125.82,962.18],[1116.55,968.73],[1116.55,968.73],[1116.55,968.73],[1116.55,971.64],[1116.55,971.64],[1116.55,971.64],[1122.0,974.36],[1122.0,974.36],[1122.0,974.36],[1127.45,984.36],[1127.45,984.36],[1127.45,984.36],[1127.27,997.09],[1127.27,997.09],[1127.27,997.09],[1130.73,1001.64],[1130.73,1001.64],[1130.73,1001.64],[1133.82,1012.55],[1133.82,1012.55],[1133.82,1012.55],[1142.55,1024.0],[1142.55,1024.0],[1142.55,1024.0],[1141.45,1029.09],[1141.45,1029.09],[1141.45,1029.09],[1147.82,1036.36],[1147.82,1036.36],[1147.82,1036.36],[1151.27,1037.45],[1151.27,1037.45],[1151.27,1037.45],[1153.64,1040.18],[1153.64,1040.18],[1153.64,1040.18],[1146.36,1051.27],[1146.36,1051.27],[1146.36,1051.27],[1146.36,1056.91],[1146.36,1056.91],[1146.36,1056.91],[1148.73,1061.09],[1148.73,1061.09],[1148.73,1061.09],[1147.09,1065.27],[1147.09,1065.27],[1147.09,1065.27],[1151.82,1070.0],[1151.82,1070.0],[1151.82,1070.0],[1152.91,1080.55],[1152.91,1080.55],[1152.91,1080.55],[1151.0,1084.64],[1151.0,1084.64],[1151.0,1084.64],[1152.82,1089.64],[1152.82,1089.64],[1152.82,1089.64],[1154.73,1095.82],[1154.73,1095.82],[1154.73,1095.82],[1153.09,1099.64],[1153.09,1099.64],[1153.09,1099.64],[1148.73,1105.45],[1148.73,1105.45],[1148.73,1105.45],[1142.55,1112.0],[1142.55,1112.0],[1142.55,1112.0],[1139.64,1118.55],[1139.64,1118.55],[1139.64,1118.55],[1142.18,1127.09],[1142.18,1127.09],[1142.18,1127.09],[1151.27,1137.09],[1151.27,1137.09],[1151.27,1137.09],[1151.27,1140.36],[1151.27,1140.36],[1151.27,1140.36],[1147.45,1144.0],[1147.45,1144.0],[1147.45,1144.0],[1140.73,1146.55],[1140.73,1146.55],[1140.73,1146.55],[1133.64,1154.36],[1133.64,1154.36],[1133.64,1154.36],[1132.36,1159.82],[1132.36,1159.82],[1132.36,1159.82],[1126.0,1162.55],[1126.0,1162.55],[1126.0,1162.55],[1122.3,1167.04],[1122.3,1167.04],[1122.3,1167.04],[1121.96,1173.09],[1121.96,1173.09],[1121.96,1173.09],[1116.04,1178.04],[1116.04,1178.04],[1116.04,1178.04],[1113.56,1182.5],[1113.56,1182.5],[1113.56,1182.5],[1111.5,1186.62],[1111.5,1186.62],[1111.5,1186.62],[1106.25,1189.88],[1106.25,1189.88],[1106.25,1189.88],[1098.5,1187.5],[1098.5,1187.5],[1098.5,1187.5],[1092.5,1189.75],[1092.5,1189.75],[1092.5,1189.75],[1085.0,1188.12],[1085.0,1188.12],[1085.0,1188.12],[1080.62,1190.38],[1080.62,1190.38],[1080.62,1190.38],[1079.0,1194.38],[1079.0,1194.38],[1079.0,1194.38],[1074.25,1195.12],[1074.25,1195.12],[1074.25,1195.12],[1065.75,1193.5],[1065.75,1193.5],[1065.75,1193.5],[1065.38,1195.75],[1065.38,1195.75],[1065.38,1195.75],[1067.62,1198.12],[1067.62,1198.12],[1067.62,1198.12],[1065.12,1200.75],[1065.12,1200.75],[1065.12,1200.75],[1064.88,1205.25],[1064.88,1205.25],[1064.88,1205.25],[1060.75,1210.25],[1060.75,1210.25],[1060.75,1210.25],[1055.75,1212.25],[1055.75,1212.25],[1055.75,1212.25],[1052.62,1215.75],[1052.62,1215.75],[1052.62,1215.75],[1045.75,1216.0],[1045.75,1216.0],[1045.75,1216.0],[1039.0,1211.88],[1039.0,1211.88],[1039.0,1211.88],[1035.5,1210.88],[1035.5,1210.88],[1035.5,1210.88],[1030.25,1205.88],[1030.25,1205.88]]],['allonia',[[1022.91,1660.73],[1019.94,1663.25],[1019.94,1663.25],[1019.94,1663.25],[1014.62,1665.5],[1014.62,1665.5],[1014.62,1665.5],[1009.44,1665.38],[1009.44,1665.38],[1009.44,1665.38],[1006.06,1663.06],[1006.06,1663.06],[1006.06,1663.06],[998.81,1663.0],[998.81,1663.0],[998.81,1663.0],[991.56,1667.38],[991.56,1667.38],[991.56,1667.38],[984.88,1666.94],[984.88,1666.94],[984.88,1666.94],[981.12,1665.38],[981.12,1665.38],[981.12,1665.38],[976.75,1668.25],[976.75,1668.25],[976.75,1668.25],[963.81,1665.44],[963.81,1665.44],[963.81,1665.44],[957.88,1668.81],[957.88,1668.81],[957.88,1668.81],[957.19,1673.31],[957.19,1673.31],[957.19,1673.31],[952.62,1678.12],[952.62,1678.12],[952.62,1678.12],[960.38,1682.12],[960.38,1682.12],[960.38,1682.12],[973.38,1676.75],[973.38,1676.75],[973.38,1676.75],[978.12,1678.88],[978.12,1678.88],[978.12,1678.88],[977.62,1683.5],[977.62,1683.5],[977.62,1683.5],[973.88,1684.62],[973.88,1684.62],[973.88,1684.62],[967.0,1691.0],[967.0,1691.0],[967.0,1691.0],[963.62,1691.5],[963.62,1691.5],[963.62,1691.5],[963.62,1696.0],[963.62,1696.0],[963.62,1696.0],[969.25,1701.12],[969.25,1701.12],[969.25,1701.12],[973.0,1699.75],[973.0,1699.75],[973.0,1699.75],[973.88,1694.5],[973.88,1694.5],[973.88,1694.5],[976.88,1694.38],[976.88,1694.38],[976.88,1694.38],[983.12,1702.38],[983.12,1702.38],[983.12,1702.38],[979.62,1706.25],[979.62,1706.25],[979.62,1706.25],[975.38,1706.62],[975.38,1706.62],[975.38,1706.62],[973.62,1711.88],[973.62,1711.88],[973.62,1711.88],[965.12,1711.88],[965.12,1711.88],[965.12,1711.88],[963.5,1716.62],[963.5,1716.62],[963.5,1716.62],[959.25,1720.25],[959.25,1720.25],[959.25,1720.25],[961.75,1724.88],[961.75,1724.88],[961.75,1724.88],[960.62,1727.25],[960.62,1727.25],[960.62,1727.25],[955.62,1725.12],[955.62,1725.12],[955.62,1725.12],[949.12,1731.12],[949.12,1731.12],[949.12,1731.12],[942.0,1732.12],[942.0,1732.12],[942.0,1732.12],[934.38,1739.25],[934.38,1739.25],[934.38,1739.25],[933.62,1746.88],[933.62,1746.88],[933.62,1746.88],[928.62,1748.88],[928.62,1748.88],[928.62,1748.88],[922.88,1748.0],[922.88,1748.0],[922.88,1748.0],[920.0,1751.88],[920.0,1751.88],[920.0,1751.88],[913.25,1752.25],[913.25,1752.25],[913.25,1752.25],[907.5,1757.0],[907.5,1757.0],[907.5,1757.0],[906.12,1760.25],[906.12,1760.25],[906.12,1760.25],[899.62,1764.5],[899.62,1764.5],[899.62,1764.5],[898.62,1769.5],[898.62,1769.5],[898.62,1769.5],[891.62,1770.0],[891.62,1770.0],[891.62,1770.0],[888.12,1773.5],[888.12,1773.5],[888.12,1773.5],[885.5,1773.5],[885.5,1773.5],[885.5,1773.5],[883.75,1771.62],[883.75,1771.62],[883.75,1771.62],[876.88,1772.0],[876.88,1772.0],[876.88,1772.0],[873.12,1777.88],[873.12,1777.88],[873.12,1777.88],[877.75,1785.25],[877.75,1785.25],[877.75,1785.25],[881.25,1784.5],[881.25,1784.5],[881.25,1784.5],[881.88,1782.75],[881.88,1782.75],[881.88,1782.75],[884.5,1783.12],[884.5,1783.12],[884.5,1783.12],[887.5,1787.0],[887.5,1787.0],[887.5,1787.0],[893.5,1787.0],[893.5,1787.0],[893.5,1787.0],[895.25,1790.62],[895.25,1790.62],[895.25,1790.62],[900.62,1790.88],[900.62,1790.88],[900.62,1790.88],[901.88,1781.0],[901.88,1781.0],[901.88,1781.0],[912.5,1782.0],[912.5,1782.0],[912.5,1782.0],[919.0,1779.62],[919.0,1779.62],[919.0,1779.62],[939.0,1781.25],[939.0,1781.25],[939.0,1781.25],[948.12,1791.38],[948.12,1791.38],[948.12,1791.38],[948.5,1796.62],[948.5,1796.62],[948.5,1796.62],[953.62,1797.5],[953.62,1797.5],[953.62,1797.5],[958.25,1799.75],[958.25,1799.75],[958.25,1799.75],[962.62,1799.88],[962.62,1799.88],[962.62,1799.88],[974.75,1787.12],[974.75,1787.12],[974.75,1787.12],[975.5,1784.25],[975.5,1784.25],[975.5,1784.25],[978.62,1782.5],[978.62,1782.5],[978.62,1782.5],[980.88,1777.88],[980.88,1777.88],[980.88,1777.88],[988.12,1777.5],[988.12,1777.5],[988.12,1777.5],[990.62,1779.62],[990.62,1779.62],[990.62,1779.62],[990.75,1783.12],[990.75,1783.12],[990.75,1783.12],[997.38,1786.12],[997.38,1786.12],[997.38,1786.12],[1001.25,1784.75],[1001.25,1784.75],[1001.25,1784.75],[1007.62,1792.75],[1007.62,1792.75],[1007.62,1792.75],[1016.12,1793.0],[1016.12,1793.0],[1016.12,1793.0],[1020.38,1798.75],[1020.38,1798.75],[1020.38,1798.75],[1033.0,1799.75],[1033.0,1799.75],[1033.0,1799.75],[1042.38,1796.0],[1042.38,1796.0],[1042.38,1796.0],[1048.12,1796.38],[1048.12,1796.38],[1048.12,1796.38],[1049.75,1788.38],[1049.75,1788.38],[1049.75,1788.38],[1047.75,1780.0],[1047.75,1780.0],[1047.75,1780.0],[1048.75,1775.62],[1048.75,1775.62],[1048.75,1775.62],[1052.5,1772.75],[1052.5,1772.75],[1052.5,1772.75],[1052.25,1768.75],[1052.25,1768.75],[1052.25,1768.75],[1047.25,1766.38],[1047.25,1766.38],[1047.25,1766.38],[1046.0,1759.75],[1046.0,1759.75],[1046.0,1759.75],[1039.0,1751.75],[1039.0,1751.75],[1039.0,1751.75],[1039.75,1745.25],[1039.75,1745.25],[1039.75,1745.25],[1033.25,1741.62],[1033.25,1741.62],[1033.25,1741.62],[1033.75,1737.62],[1033.75,1737.62],[1033.75,1737.62],[1041.25,1737.25],[1041.25,1737.25],[1041.25,1737.25],[1044.25,1732.38],[1044.25,1732.38],[1044.25,1732.38],[1044.36,1728.73],[1044.36,1728.73],[1044.36,1728.73],[1046.44,1725.38],[1046.44,1725.38],[1046.44,1725.38],[1043.69,1720.38],[1043.69,1720.38],[1043.69,1720.38],[1039.45,1718.91],[1039.45,1718.91],[1039.45,1718.91],[1035.82,1715.09],[1035.82,1715.09],[1035.82,1715.09],[1032.91,1708.91],[1032.91,1708.91],[1032.91,1708.91],[1032.73,1699.09],[1032.73,1699.09],[1032.73,1699.09],[1030.55,1689.27],[1030.55,1689.27],[1030.55,1689.27],[1033.09,1683.09],[1033.09,1683.09],[1033.09,1683.09],[1031.27,1669.82],[1031.27,1669.82],[1031.27,1669.82],[1022.91,1660.73],[1022.91,1660.73]]],['lutessa',[[952.62,1678.12],[957.19,1673.31],[957.19,1673.31],[957.19,1673.31],[957.88,1668.81],[957.88,1668.81],[957.88,1668.81],[963.81,1665.44],[963.81,1665.44],[963.81,1665.44],[976.75,1668.25],[976.75,1668.25],[976.75,1668.25],[981.12,1665.38],[981.12,1665.38],[981.12,1665.38],[984.88,1666.94],[984.88,1666.94],[984.88,1666.94],[991.56,1667.38],[991.56,1667.38],[991.56,1667.38],[998.81,1663.0],[998.81,1663.0],[998.81,1663.0],[1006.06,1663.06],[1006.06,1663.06],[1006.06,1663.06],[1009.44,1665.38],[1009.44,1665.38],[1009.44,1665.38],[1014.62,1665.5],[1014.62,1665.5],[1014.62,1665.5],[1019.94,1663.25],[1019.94,1663.25],[1019.94,1663.25],[1022.91,1660.73],[1022.91,1660.73],[1022.91,1660.73],[1013.82,1651.27],[1013.82,1651.27],[1013.82,1651.27],[1012.73,1638.73],[1012.73,1638.73],[1012.73,1638.73],[1009.45,1636.73],[1009.45,1636.73],[1009.45,1636.73],[1008.91,1633.09],[1008.91,1633.09],[1008.91,1633.09],[1001.64,1627.82],[1001.64,1627.82],[1001.64,1627.82],[1002.06,1610.94],[1002.06,1610.94],[1002.06,1610.94],[1006.94,1598.5],[1006.94,1598.5],[1006.94,1598.5],[1015.62,1591.94],[1015.62,1591.94],[1015.62,1591.94],[1020.69,1591.75],[1020.69,1591.75],[1020.69,1591.75],[1027.75,1587.31],[1027.75,1587.31],[1027.75,1587.31],[1033.56,1578.88],[1033.56,1578.88],[1033.56,1578.88],[1033.88,1573.94],[1033.88,1573.94],[1033.88,1573.94],[1031.75,1573.25],[1031.75,1573.25],[1031.75,1573.25],[1027.88,1566.75],[1027.88,1566.75],[1027.88,1566.75],[1024.12,1566.75],[1024.12,1566.75],[1024.12,1566.75],[1020.0,1571.5],[1020.0,1571.5],[1020.0,1571.5],[1000.25,1573.12],[1000.25,1573.12],[1000.25,1573.12],[995.75,1579.5],[995.75,1579.5],[995.75,1579.5],[992.38,1579.88],[992.38,1579.88],[992.38,1579.88],[990.0,1576.75],[990.0,1576.75],[990.0,1576.75],[979.88,1577.5],[979.88,1577.5],[979.88,1577.5],[977.0,1581.12],[977.0,1581.12],[977.0,1581.12],[965.25,1581.25],[965.25,1581.25],[965.25,1581.25],[957.5,1587.88],[957.5,1587.88],[957.5,1587.88],[952.0,1588.5],[952.0,1588.5],[952.0,1588.5],[948.0,1585.62],[948.0,1585.62],[948.0,1585.62],[943.38,1585.5],[943.38,1585.5],[943.38,1585.5],[939.5,1580.62],[939.5,1580.62],[939.5,1580.62],[938.62,1576.25],[938.62,1576.25],[938.62,1576.25],[935.12,1572.0],[935.12,1572.0],[935.12,1572.0],[930.75,1571.62],[930.75,1571.62],[930.75,1571.62],[926.38,1575.62],[926.38,1575.62],[926.38,1575.62],[914.25,1575.25],[914.25,1575.25],[914.25,1575.25],[907.5,1579.88],[907.5,1579.88],[907.5,1579.88],[903.5,1581.0],[903.5,1581.0],[903.5,1581.0],[902.88,1587.25],[902.88,1587.25],[902.88,1587.25],[895.5,1587.5],[895.5,1587.5],[895.5,1587.5],[893.0,1582.5],[893.0,1582.5],[893.0,1582.5],[889.88,1581.88],[889.88,1581.88],[889.88,1581.88],[888.25,1585.0],[888.25,1585.0],[888.25,1585.0],[876.38,1585.88],[876.38,1585.88],[876.38,1585.88],[873.62,1588.62],[873.62,1588.62],[873.62,1588.62],[870.62,1589.0],[870.62,1589.0],[870.62,1589.0],[863.25,1595.12],[863.25,1595.12],[863.25,1595.12],[861.25,1595.5],[861.25,1595.5],[861.25,1595.5],[857.75,1599.0],[857.75,1599.0],[857.75,1599.0],[855.5,1606.62],[855.5,1606.62],[855.5,1606.62],[851.62,1611.62],[851.62,1611.62],[851.62,1611.62],[852.0,1615.38],[852.0,1615.38],[852.0,1615.38],[856.0,1616.75],[856.0,1616.75],[856.0,1616.75],[859.38,1619.12],[859.38,1619.12],[859.38,1619.12],[869.12,1619.12],[869.12,1619.12],[869.12,1619.12],[869.62,1623.25],[869.62,1623.25],[869.62,1623.25],[860.75,1630.12],[860.75,1630.12],[860.75,1630.12],[857.12,1630.12],[857.12,1630.12],[857.12,1630.12],[856.88,1633.5],[856.88,1633.5],[856.88,1633.5],[861.25,1634.12],[861.25,1634.12],[861.25,1634.12],[865.88,1638.0],[865.88,1638.0],[865.88,1638.0],[871.0,1638.38],[871.0,1638.38],[871.0,1638.38],[872.25,1644.25],[872.25,1644.25],[872.25,1644.25],[874.12,1648.62],[874.12,1648.62],[874.12,1648.62],[885.0,1646.75],[885.0,1646.75],[885.0,1646.75],[888.38,1642.75],[888.38,1642.75],[888.38,1642.75],[894.25,1648.88],[894.25,1648.88],[894.25,1648.88],[899.0,1650.62],[899.0,1650.62],[899.0,1650.62],[903.5,1649.38],[903.5,1649.38],[903.5,1649.38],[908.0,1650.75],[908.0,1650.75],[908.0,1650.75],[911.38,1655.5],[911.38,1655.5],[911.38,1655.5],[914.88,1657.12],[914.88,1657.12],[914.88,1657.12],[924.38,1664.38],[924.38,1664.38],[924.38,1664.38],[926.5,1664.5],[926.5,1664.5],[926.5,1664.5],[927.12,1668.38],[927.12,1668.38],[927.12,1668.38],[931.62,1672.25],[931.62,1672.25],[931.62,1672.25],[943.38,1672.88],[943.38,1672.88],[943.38,1672.88],[952.62,1678.12],[952.62,1678.12]]],['averna',[[1036.55,1573.64],[1045.0,1563.5],[1045.0,1563.5],[1045.0,1563.5],[1058.88,1564.62],[1058.88,1564.62],[1058.88,1564.62],[1065.88,1572.38],[1065.88,1572.38],[1065.88,1572.38],[1070.25,1568.0],[1070.25,1568.0],[1070.25,1568.0],[1073.12,1568.38],[1073.12,1568.38],[1073.12,1568.38],[1076.38,1572.25],[1076.38,1572.25],[1076.38,1572.25],[1080.75,1573.88],[1080.75,1573.88],[1080.75,1573.88],[1084.62,1580.12],[1084.62,1580.12],[1084.62,1580.12],[1089.5,1579.88],[1089.5,1579.88],[1089.5,1579.88],[1089.5,1575.88],[1089.5,1575.88],[1089.5,1575.88],[1096.5,1566.62],[1096.5,1566.62],[1096.5,1566.62],[1100.0,1566.0],[1100.0,1566.0],[1100.0,1566.0],[1103.5,1560.38],[1103.5,1560.38],[1103.5,1560.38],[1106.38,1562.88],[1106.38,1562.88],[1106.38,1562.88],[1106.25,1566.12],[1106.25,1566.12],[1106.25,1566.12],[1103.88,1573.62],[1103.88,1573.62],[1103.88,1573.62],[1105.88,1576.56],[1105.88,1576.56],[1105.88,1576.56],[1102.75,1580.75],[1102.75,1580.75],[1102.75,1580.75],[1102.81,1585.81],[1102.81,1585.81],[1102.81,1585.81],[1112.56,1594.75],[1112.56,1594.75],[1112.56,1594.75],[1117.94,1602.25],[1117.94,1602.25],[1117.94,1602.25],[1121.38,1616.5],[1121.38,1616.5],[1121.38,1616.5],[1126.88,1620.12],[1126.88,1620.12],[1126.88,1620.12],[1133.25,1621.38],[1133.25,1621.38],[1133.25,1621.38],[1138.25,1624.75],[1138.25,1624.75],[1138.25,1624.75],[1147.88,1625.75],[1147.88,1625.75],[1147.88,1625.75],[1153.12,1629.25],[1153.12,1629.25],[1153.12,1629.25],[1155.38,1634.88],[1155.38,1634.88],[1155.38,1634.88],[1156.0,1641.75],[1156.0,1641.75],[1156.0,1641.75],[1169.12,1654.5],[1169.12,1654.5],[1169.12,1654.5],[1169.0,1659.0],[1169.0,1659.0],[1169.0,1659.0],[1171.5,1662.88],[1171.5,1662.88],[1171.5,1662.88],[1160.75,1672.88],[1160.75,1672.88],[1160.75,1672.88],[1158.88,1678.12],[1158.88,1678.12],[1158.88,1678.12],[1160.88,1680.75],[1160.88,1680.75],[1160.88,1680.75],[1150.73,1684.64],[1150.73,1684.64],[1150.73,1684.64],[1146.09,1685.45],[1146.09,1685.45],[1146.09,1685.45],[1136.27,1691.55],[1136.27,1691.55],[1136.27,1691.55],[1139.91,1696.91],[1139.91,1696.91],[1139.91,1696.91],[1134.91,1704.09],[1134.91,1704.09],[1134.91,1704.09],[1123.55,1712.18],[1123.55,1712.18],[1123.55,1712.18],[1122.0,1715.55],[1122.0,1715.55],[1122.0,1715.55],[1112.45,1716.0],[1112.45,1716.0],[1112.45,1716.0],[1109.55,1718.55],[1109.55,1718.55],[1109.55,1718.55],[1099.36,1719.0],[1099.36,1719.0],[1099.36,1719.0],[1096.0,1722.27],[1096.0,1722.27],[1096.0,1722.27],[1087.55,1722.55],[1087.55,1722.55],[1087.55,1722.55],[1082.09,1727.09],[1082.09,1727.09],[1082.09,1727.09],[1065.73,1726.27],[1065.73,1726.27],[1065.73,1726.27],[1060.82,1722.73],[1060.82,1722.73],[1060.82,1722.73],[1054.0,1724.73],[1054.0,1724.73],[1054.0,1724.73],[1046.44,1725.38],[1046.44,1725.38],[1046.44,1725.38],[1043.69,1720.38],[1043.69,1720.38],[1043.69,1720.38],[1039.45,1718.91],[1039.45,1718.91],[1039.45,1718.91],[1035.82,1715.09],[1035.82,1715.09],[1035.82,1715.09],[1032.91,1708.91],[1032.91,1708.91],[1032.91,1708.91],[1032.73,1699.09],[1032.73,1699.09],[1032.73,1699.09],[1030.55,1689.27],[1030.55,1689.27],[1030.55,1689.27],[1033.09,1683.09],[1033.09,1683.09],[1033.09,1683.09],[1031.27,1669.82],[1031.27,1669.82],[1031.27,1669.82],[1022.91,1660.73],[1022.91,1660.73],[1022.91,1660.73],[1013.82,1651.27],[1013.82,1651.27],[1013.82,1651.27],[1012.73,1638.73],[1012.73,1638.73],[1012.73,1638.73],[1009.45,1636.73],[1009.45,1636.73],[1009.45,1636.73],[1008.91,1633.09],[1008.91,1633.09],[1008.91,1633.09],[1001.64,1627.82],[1001.64,1627.82],[1001.64,1627.82],[1002.06,1610.94],[1002.06,1610.94],[1002.06,1610.94],[1006.94,1598.5],[1006.94,1598.5],[1006.94,1598.5],[1015.62,1591.94],[1015.62,1591.94],[1015.62,1591.94],[1020.69,1591.75],[1020.69,1591.75],[1020.69,1591.75],[1027.75,1587.31],[1027.75,1587.31],[1027.75,1587.31],[1033.56,1578.88],[1033.56,1578.88],[1033.56,1578.88],[1033.88,1573.94],[1033.88,1573.94],[1033.88,1573.94],[1036.55,1573.64],[1036.55,1573.64]]],['anthos',[[1105.88,1576.56],[1102.75,1580.75],[1102.75,1580.75],[1102.75,1580.75],[1102.81,1585.81],[1102.81,1585.81],[1102.81,1585.81],[1112.56,1594.75],[1112.56,1594.75],[1112.56,1594.75],[1117.94,1602.25],[1117.94,1602.25],[1117.94,1602.25],[1121.38,1616.5],[1121.38,1616.5],[1121.38,1616.5],[1126.88,1620.12],[1126.88,1620.12],[1126.88,1620.12],[1133.25,1621.38],[1133.25,1621.38],[1133.25,1621.38],[1138.25,1624.75],[1138.25,1624.75],[1138.25,1624.75],[1147.88,1625.75],[1147.88,1625.75],[1147.88,1625.75],[1153.12,1629.25],[1153.12,1629.25],[1153.12,1629.25],[1155.38,1634.88],[1155.38,1634.88],[1155.38,1634.88],[1156.0,1641.75],[1156.0,1641.75],[1156.0,1641.75],[1169.12,1654.5],[1169.12,1654.5],[1169.12,1654.5],[1169.0,1659.0],[1169.0,1659.0],[1169.0,1659.0],[1171.5,1662.88],[1171.5,1662.88],[1171.5,1662.88],[1160.75,1672.88],[1160.75,1672.88],[1160.75,1672.88],[1158.88,1678.12],[1158.88,1678.12],[1158.88,1678.12],[1160.88,1680.75],[1160.88,1680.75],[1160.88,1680.75],[1164.64,1679.18],[1164.64,1679.18],[1164.64,1679.18],[1169.64,1680.82],[1169.64,1680.82],[1169.64,1680.82],[1175.45,1680.45],[1175.45,1680.45],[1175.45,1680.45],[1181.82,1672.45],[1181.82,1672.45],[1181.82,1672.45],[1184.82,1677.27],[1184.82,1677.27],[1184.82,1677.27],[1187.64,1677.0],[1187.64,1677.0],[1187.64,1677.0],[1190.36,1671.36],[1190.36,1671.36],[1190.36,1671.36],[1195.0,1672.09],[1195.0,1672.09],[1195.0,1672.09],[1195.82,1682.27],[1195.82,1682.27],[1195.82,1682.27],[1199.09,1682.82],[1199.09,1682.82],[1199.09,1682.82],[1201.82,1680.18],[1201.82,1680.18],[1201.82,1680.18],[1220.91,1678.55],[1220.91,1678.55],[1220.91,1678.55],[1224.36,1675.18],[1224.36,1675.18],[1224.36,1675.18],[1225.09,1670.91],[1225.09,1670.91],[1225.09,1670.91],[1229.18,1668.91],[1229.18,1668.91],[1229.18,1668.91],[1241.55,1673.91],[1241.55,1673.91],[1241.55,1673.91],[1241.91,1668.09],[1241.91,1668.09],[1241.91,1668.09],[1240.09,1665.64],[1240.09,1665.64],[1240.09,1665.64],[1240.0,1661.18],[1240.0,1661.18],[1240.0,1661.18],[1243.27,1658.64],[1243.27,1658.64],[1243.27,1658.64],[1243.91,1655.27],[1243.91,1655.27],[1243.91,1655.27],[1242.27,1649.18],[1242.27,1649.18],[1242.27,1649.18],[1246.36,1648.0],[1246.36,1648.0],[1246.36,1648.0],[1245.82,1640.91],[1245.82,1640.91],[1245.82,1640.91],[1241.82,1640.64],[1241.82,1640.64],[1241.82,1640.64],[1238.0,1635.82],[1238.0,1635.82],[1238.0,1635.82],[1245.18,1627.73],[1245.18,1627.73],[1245.18,1627.73],[1245.55,1617.73],[1245.55,1617.73],[1245.55,1617.73],[1250.18,1614.09],[1250.18,1614.09],[1250.18,1614.09],[1250.64,1609.64],[1250.64,1609.64],[1250.64,1609.64],[1253.55,1607.64],[1253.55,1607.64],[1253.55,1607.64],[1255.73,1610.64],[1255.73,1610.64],[1255.73,1610.64],[1260.18,1610.0],[1260.18,1610.0],[1260.18,1610.0],[1261.91,1602.27],[1261.91,1602.27],[1261.91,1602.27],[1268.73,1602.82],[1268.73,1602.82],[1268.73,1602.82],[1268.64,1606.91],[1268.64,1606.91],[1268.64,1606.91],[1272.36,1609.91],[1272.36,1609.91],[1272.36,1609.91],[1281.64,1610.45],[1281.64,1610.45],[1281.64,1610.45],[1285.73,1607.73],[1285.73,1607.73],[1285.73,1607.73],[1290.73,1606.82],[1290.73,1606.82],[1290.73,1606.82],[1299.55,1607.64],[1299.55,1607.64],[1299.55,1607.64],[1311.73,1596.55],[1311.73,1596.55],[1311.73,1596.55],[1311.82,1589.36],[1311.82,1589.36],[1311.82,1589.36],[1308.18,1583.18],[1308.18,1583.18],[1308.18,1583.18],[1308.75,1579.88],[1308.75,1579.88],[1308.75,1579.88],[1308.25,1577.12],[1308.25,1577.12],[1308.25,1577.12],[1306.5,1576.25],[1306.5,1576.25],[1306.5,1576.25],[1306.38,1571.88],[1306.38,1571.88],[1306.38,1571.88],[1300.5,1566.12],[1300.5,1566.12],[1300.5,1566.12],[1297.62,1552.75],[1297.62,1552.75],[1297.62,1552.75],[1291.75,1545.62],[1291.75,1545.62],[1291.75,1545.62],[1289.25,1545.25],[1289.25,1545.25],[1289.25,1545.25],[1281.75,1535.88],[1281.75,1535.88],[1281.75,1535.88],[1264.0,1536.0],[1264.0,1536.0],[1264.0,1536.0],[1260.25,1540.38],[1260.25,1540.38],[1260.25,1540.38],[1255.0,1540.12],[1255.0,1540.12],[1255.0,1540.12],[1249.62,1536.88],[1249.62,1536.88],[1249.62,1536.88],[1244.62,1537.12],[1244.62,1537.12],[1244.62,1537.12],[1236.38,1542.12],[1236.38,1542.12],[1236.38,1542.12],[1228.75,1542.88],[1228.75,1542.88],[1228.75,1542.88],[1228.12,1541.38],[1228.12,1541.38],[1228.12,1541.38],[1223.25,1541.06],[1223.25,1541.06],[1223.25,1541.06],[1219.5,1537.12],[1219.5,1537.12],[1219.5,1537.12],[1215.0,1537.81],[1215.0,1537.81],[1215.0,1537.81],[1204.88,1547.56],[1204.88,1547.56],[1204.88,1547.56],[1204.5,1552.5],[1204.5,1552.5],[1204.5,1552.5],[1207.94,1556.81],[1207.94,1556.81],[1207.94,1556.81],[1208.0,1560.94],[1208.0,1560.94],[1208.0,1560.94],[1201.69,1559.69],[1201.69,1559.69],[1201.69,1559.69],[1201.44,1555.44],[1201.44,1555.44],[1201.44,1555.44],[1198.31,1552.75],[1198.31,1552.75],[1198.31,1552.75],[1186.81,1551.5],[1186.81,1551.5],[1186.81,1551.5],[1176.25,1546.5],[1176.25,1546.5],[1176.25,1546.5],[1169.25,1540.88],[1169.25,1540.88],[1169.25,1540.88],[1162.62,1540.75],[1162.62,1540.75],[1162.62,1540.75],[1154.12,1546.38],[1154.12,1546.38],[1154.12,1546.38],[1152.75,1552.25],[1152.75,1552.25],[1152.75,1552.25],[1139.75,1554.88],[1139.75,1554.88],[1139.75,1554.88],[1132.75,1550.12],[1132.75,1550.12],[1132.75,1550.12],[1122.62,1552.5],[1122.62,1552.5],[1122.62,1552.5],[1115.25,1557.0],[1115.25,1557.0],[1115.25,1557.0],[1115.25,1562.0],[1115.25,1562.0],[1115.25,1562.0],[1111.62,1566.25],[1111.62,1566.25],[1111.62,1566.25],[1109.75,1575.56],[1109.75,1575.56],[1109.75,1575.56],[1105.88,1576.56],[1105.88,1576.56]]],['lascus',[[1104.45,1409.82],[1106.18,1412.27],[1106.18,1412.27],[1106.18,1412.27],[1114.18,1412.73],[1114.18,1412.73],[1114.18,1412.73],[1118.82,1410.36],[1118.82,1410.36],[1118.82,1410.36],[1122.91,1412.64],[1122.91,1412.64],[1122.91,1412.64],[1127.27,1420.64],[1127.27,1420.64],[1127.27,1420.64],[1133.36,1421.0],[1133.36,1421.0],[1133.36,1421.0],[1149.55,1437.55],[1149.55,1437.55],[1149.55,1437.55],[1158.73,1439.09],[1158.73,1439.09],[1158.73,1439.09],[1166.55,1441.82],[1166.55,1441.82],[1166.55,1441.82],[1172.91,1452.09],[1172.91,1452.09],[1172.91,1452.09],[1173.09,1455.27],[1173.09,1455.27],[1173.09,1455.27],[1181.0,1466.09],[1181.0,1466.09],[1181.0,1466.09],[1189.82,1474.64],[1189.82,1474.64],[1189.82,1474.64],[1197.18,1475.18],[1197.18,1475.18],[1197.18,1475.18],[1200.55,1477.64],[1200.55,1477.64],[1200.55,1477.64],[1209.45,1478.55],[1209.45,1478.55],[1209.45,1478.55],[1219.55,1488.55],[1219.55,1488.55],[1219.55,1488.55],[1229.82,1501.27],[1229.82,1501.27],[1229.82,1501.27],[1228.27,1509.18],[1228.27,1509.18],[1228.27,1509.18],[1226.09,1512.0],[1226.09,1512.0],[1226.09,1512.0],[1225.64,1522.0],[1225.64,1522.0],[1225.64,1522.0],[1228.55,1530.0],[1228.55,1530.0],[1228.55,1530.0],[1227.73,1532.27],[1227.73,1532.27],[1227.73,1532.27],[1225.55,1534.45],[1225.55,1534.45],[1225.55,1534.45],[1215.55,1526.0],[1215.55,1526.0],[1215.55,1526.0],[1204.64,1527.0],[1204.64,1527.0],[1204.64,1527.0],[1204.55,1519.0],[1204.55,1519.0],[1204.55,1519.0],[1202.82,1517.36],[1202.82,1517.36],[1202.82,1517.36],[1200.0,1517.55],[1200.0,1517.55],[1200.0,1517.55],[1194.0,1521.64],[1194.0,1521.64],[1194.0,1521.64],[1185.45,1521.82],[1185.45,1521.82],[1185.45,1521.82],[1176.38,1519.5],[1176.38,1519.5],[1176.38,1519.5],[1171.62,1512.25],[1171.62,1512.25],[1171.62,1512.25],[1171.5,1508.5],[1171.5,1508.5],[1171.5,1508.5],[1163.88,1499.0],[1163.88,1499.0],[1163.88,1499.0],[1167.38,1488.5],[1167.38,1488.5],[1167.38,1488.5],[1163.62,1485.5],[1163.62,1485.5],[1163.62,1485.5],[1157.75,1490.62],[1157.75,1490.62],[1157.75,1490.62],[1152.38,1491.12],[1152.38,1491.12],[1152.38,1491.12],[1148.75,1486.38],[1148.75,1486.38],[1148.75,1486.38],[1150.88,1479.75],[1150.88,1479.75],[1150.88,1479.75],[1158.75,1476.5],[1158.75,1476.5],[1158.75,1476.5],[1157.12,1470.12],[1157.12,1470.12],[1157.12,1470.12],[1149.12,1468.88],[1149.12,1468.88],[1149.12,1468.88],[1140.12,1477.38],[1140.12,1477.38],[1140.12,1477.38],[1125.0,1480.25],[1125.0,1480.25],[1125.0,1480.25],[1120.88,1486.75],[1120.88,1486.75],[1120.88,1486.75],[1117.75,1489.38],[1117.75,1489.38],[1117.75,1489.38],[1113.88,1485.0],[1113.88,1485.0],[1113.88,1485.0],[1115.75,1478.38],[1115.75,1478.38],[1115.75,1478.38],[1123.62,1473.62],[1123.62,1473.62],[1123.62,1473.62],[1124.88,1467.25],[1124.88,1467.25],[1124.88,1467.25],[1121.75,1466.5],[1121.75,1466.5],[1121.75,1466.5],[1119.75,1471.25],[1119.75,1471.25],[1119.75,1471.25],[1114.5,1474.5],[1114.5,1474.5],[1114.5,1474.5],[1110.88,1475.12],[1110.88,1475.12],[1110.88,1475.12],[1106.75,1487.0],[1106.75,1487.0],[1106.75,1487.0],[1109.0,1491.75],[1109.0,1491.75],[1109.0,1491.75],[1113.0,1506.62],[1113.0,1506.62],[1113.0,1506.62],[1106.12,1507.12],[1106.12,1507.12],[1106.12,1507.12],[1103.75,1509.88],[1103.75,1509.88],[1103.75,1509.88],[1092.88,1509.25],[1092.88,1509.25],[1092.88,1509.25],[1086.5,1504.12],[1086.5,1504.12],[1086.5,1504.12],[1078.38,1509.12],[1078.38,1509.12],[1078.38,1509.12],[1065.25,1506.88],[1065.25,1506.88],[1065.25,1506.88],[1057.5,1516.12],[1057.5,1516.12],[1057.5,1516.12],[1051.25,1517.0],[1051.25,1517.0],[1051.25,1517.0],[1045.38,1514.0],[1045.38,1514.0],[1045.38,1514.0],[1041.38,1517.12],[1041.38,1517.12],[1041.38,1517.12],[1034.12,1517.5],[1034.12,1517.5],[1034.12,1517.5],[1030.62,1514.38],[1030.62,1514.38],[1030.62,1514.38],[1027.88,1505.0],[1027.88,1505.0],[1027.88,1505.0],[1027.12,1497.25],[1027.12,1497.25],[1027.12,1497.25],[1026.12,1487.62],[1026.12,1487.62],[1026.12,1487.62],[1029.0,1485.25],[1029.0,1485.25],[1029.0,1485.25],[1030.12,1479.5],[1030.12,1479.5],[1030.12,1479.5],[1036.25,1480.75],[1036.25,1480.75],[1036.25,1480.75],[1042.75,1481.0],[1042.75,1481.0],[1042.75,1481.0],[1050.62,1475.38],[1050.62,1475.38],[1050.62,1475.38],[1053.88,1469.38],[1053.88,1469.38],[1053.88,1469.38],[1057.62,1465.88],[1057.62,1465.88],[1057.62,1465.88],[1058.0,1460.75],[1058.0,1460.75],[1058.0,1460.75],[1063.75,1455.0],[1063.75,1455.0],[1063.75,1455.0],[1069.75,1455.0],[1069.75,1455.0],[1069.75,1455.0],[1074.0,1451.12],[1074.0,1451.12],[1074.0,1451.12],[1074.62,1445.25],[1074.62,1445.25],[1074.62,1445.25],[1079.75,1441.38],[1079.75,1441.38],[1079.75,1441.38],[1083.88,1439.0],[1083.88,1439.0],[1083.88,1439.0],[1092.12,1431.12],[1092.12,1431.12],[1092.12,1431.12],[1097.75,1422.75],[1097.75,1422.75],[1097.75,1422.75],[1102.12,1414.38],[1102.12,1414.38],[1102.12,1414.38],[1104.45,1409.82],[1104.45,1409.82]]],['itonia',[[1104.45,1409.82],[1106.18,1412.27],[1106.18,1412.27],[1106.18,1412.27],[1114.18,1412.73],[1114.18,1412.73],[1114.18,1412.73],[1118.82,1410.36],[1118.82,1410.36],[1118.82,1410.36],[1122.91,1412.64],[1122.91,1412.64],[1122.91,1412.64],[1127.27,1420.64],[1127.27,1420.64],[1127.27,1420.64],[1133.36,1421.0],[1133.36,1421.0],[1133.36,1421.0],[1149.55,1437.55],[1149.55,1437.55],[1149.55,1437.55],[1158.73,1439.09],[1158.73,1439.09],[1158.73,1439.09],[1166.55,1441.82],[1166.55,1441.82],[1166.55,1441.82],[1172.91,1452.09],[1172.91,1452.09],[1172.91,1452.09],[1173.09,1455.27],[1173.09,1455.27],[1173.09,1455.27],[1181.0,1466.09],[1181.0,1466.09],[1181.0,1466.09],[1189.82,1474.64],[1189.82,1474.64],[1189.82,1474.64],[1197.18,1475.18],[1197.18,1475.18],[1197.18,1475.18],[1200.55,1477.64],[1200.55,1477.64],[1200.55,1477.64],[1209.45,1478.55],[1209.45,1478.55],[1209.45,1478.55],[1219.55,1488.55],[1219.55,1488.55],[1219.55,1488.55],[1229.82,1501.27],[1229.82,1501.27],[1229.82,1501.27],[1228.27,1509.18],[1228.27,1509.18],[1228.27,1509.18],[1226.09,1512.0],[1226.09,1512.0],[1226.09,1512.0],[1225.64,1522.0],[1225.64,1522.0],[1225.64,1522.0],[1228.55,1530.0],[1228.55,1530.0],[1228.55,1530.0],[1227.73,1532.27],[1227.73,1532.27],[1227.73,1532.27],[1225.55,1534.45],[1225.55,1534.45],[1225.55,1534.45],[1229.62,1538.25],[1229.62,1538.25],[1229.62,1538.25],[1228.12,1541.38],[1228.12,1541.38],[1228.12,1541.38],[1228.75,1542.88],[1228.75,1542.88],[1228.75,1542.88],[1236.38,1542.12],[1236.38,1542.12],[1236.38,1542.12],[1244.62,1537.12],[1244.62,1537.12],[1244.62,1537.12],[1249.62,1536.88],[1249.62,1536.88],[1249.62,1536.88],[1255.0,1540.12],[1255.0,1540.12],[1255.0,1540.12],[1260.25,1540.38],[1260.25,1540.38],[1260.25,1540.38],[1264.0,1536.0],[1264.0,1536.0],[1264.0,1536.0],[1281.75,1535.88],[1281.75,1535.88],[1281.75,1535.88],[1289.25,1545.25],[1289.25,1545.25],[1289.25,1545.25],[1291.75,1545.62],[1291.75,1545.62],[1291.75,1545.62],[1297.62,1552.75],[1297.62,1552.75],[1297.62,1552.75],[1300.5,1566.12],[1300.5,1566.12],[1300.5,1566.12],[1306.38,1571.88],[1306.38,1571.88],[1306.38,1571.88],[1306.5,1576.25],[1306.5,1576.25],[1306.5,1576.25],[1308.25,1577.12],[1308.25,1577.12],[1308.25,1577.12],[1308.75,1579.88],[1308.75,1579.88],[1308.75,1579.88],[1311.45,1579.82],[1311.45,1579.82],[1311.45,1579.82],[1316.18,1585.27],[1316.18,1585.27],[1316.18,1585.27],[1321.09,1585.09],[1321.09,1585.09],[1321.09,1585.09],[1332.91,1593.82],[1332.91,1593.82],[1332.91,1593.82],[1332.73,1605.27],[1332.73,1605.27],[1332.73,1605.27],[1337.09,1611.27],[1337.09,1611.27],[1337.09,1611.27],[1345.45,1614.18],[1345.45,1614.18],[1345.45,1614.18],[1351.64,1612.18],[1351.64,1612.18],[1351.64,1612.18],[1361.09,1612.0],[1361.09,1612.0],[1361.09,1612.0],[1377.09,1622.91],[1377.09,1622.91],[1377.09,1622.91],[1384.55,1621.64],[1384.55,1621.64],[1384.55,1621.64],[1389.45,1621.64],[1389.45,1621.64],[1389.45,1621.64],[1403.09,1629.27],[1403.09,1629.27],[1403.09,1629.27],[1406.73,1628.91],[1406.73,1628.91],[1406.73,1628.91],[1410.0,1626.0],[1410.0,1626.0],[1410.0,1626.0],[1413.45,1625.45],[1413.45,1625.45],[1413.45,1625.45],[1417.27,1628.36],[1417.27,1628.36],[1417.27,1628.36],[1418.18,1624.91],[1418.18,1624.91],[1418.18,1624.91],[1414.73,1619.45],[1414.73,1619.45],[1414.73,1619.45],[1409.09,1618.91],[1409.09,1618.91],[1409.09,1618.91],[1406.91,1621.27],[1406.91,1621.27],[1406.91,1621.27],[1399.45,1621.27],[1399.45,1621.27],[1399.45,1621.27],[1396.73,1617.64],[1396.73,1617.64],[1396.73,1617.64],[1396.73,1608.55],[1396.73,1608.55],[1396.73,1608.55],[1391.82,1602.36],[1391.82,1602.36],[1391.82,1602.36],[1383.64,1596.55],[1383.64,1596.55],[1383.64,1596.55],[1381.82,1584.0],[1381.82,1584.0],[1381.82,1584.0],[1379.09,1578.91],[1379.09,1578.91],[1379.09,1578.91],[1379.82,1575.45],[1379.82,1575.45],[1379.82,1575.45],[1387.64,1568.55],[1387.64,1568.55],[1387.64,1568.55],[1389.09,1562.18],[1389.09,1562.18],[1389.09,1562.18],[1385.27,1556.36],[1385.27,1556.36],[1385.27,1556.36],[1376.36,1556.36],[1376.36,1556.36],[1376.36,1556.36],[1375.82,1548.18],[1375.82,1548.18],[1375.82,1548.18],[1372.73,1545.64],[1372.73,1545.64],[1372.73,1545.64],[1376.55,1542.91],[1376.55,1542.91],[1376.55,1542.91],[1375.64,1539.09],[1375.64,1539.09],[1375.64,1539.09],[1355.45,1535.82],[1355.45,1535.82],[1355.45,1535.82],[1352.73,1543.09],[1352.73,1543.09],[1352.73,1543.09],[1346.55,1544.18],[1346.55,1544.18],[1346.55,1544.18],[1343.82,1539.09],[1343.82,1539.09],[1343.82,1539.09],[1342.55,1525.82],[1342.55,1525.82],[1342.55,1525.82],[1336.55,1517.64],[1336.55,1517.64],[1336.55,1517.64],[1337.09,1509.27],[1337.09,1509.27],[1337.09,1509.27],[1330.91,1505.09],[1330.91,1505.09],[1330.91,1505.09],[1332.0,1497.64],[1332.0,1497.64],[1332.0,1497.64],[1330.55,1495.64],[1330.55,1495.64],[1330.55,1495.64],[1320.0,1492.91],[1320.0,1492.91],[1320.0,1492.91],[1317.82,1466.91],[1317.82,1466.91],[1317.82,1466.91],[1319.82,1462.73],[1319.82,1462.73],[1319.82,1462.73],[1320.36,1451.82],[1320.36,1451.82],[1320.36,1451.82],[1326.55,1444.0],[1326.55,1444.0],[1326.55,1444.0],[1334.55,1444.18],[1334.55,1444.18],[1334.55,1444.18],[1337.45,1447.09],[1337.45,1447.09],[1337.45,1447.09],[1344.73,1447.45],[1344.73,1447.45],[1344.73,1447.45],[1349.09,1442.36],[1349.09,1442.36],[1349.09,1442.36],[1357.09,1441.09],[1357.09,1441.09],[1357.09,1441.09],[1362.18,1435.09],[1362.18,1435.09],[1362.18,1435.09],[1359.45,1432.55],[1359.45,1432.55],[1359.45,1432.55],[1341.09,1430.0],[1341.09,1430.0],[1341.09,1430.0],[1332.55,1431.82],[1332.55,1431.82],[1332.55,1431.82],[1328.91,1429.82],[1328.91,1429.82],[1328.91,1429.82],[1327.27,1424.91],[1327.27,1424.91],[1327.27,1424.91],[1321.09,1425.45],[1321.09,1425.45],[1321.09,1425.45],[1316.91,1434.55],[1316.91,1434.55],[1316.91,1434.55],[1307.09,1441.45],[1307.09,1441.45],[1307.09,1441.45],[1297.27,1442.36],[1297.27,1442.36],[1297.27,1442.36],[1294.91,1440.0],[1294.91,1440.0],[1294.91,1440.0],[1289.27,1440.18],[1289.27,1440.18],[1289.27,1440.18],[1282.55,1442.55],[1282.55,1442.55],[1282.55,1442.55],[1273.82,1441.27],[1273.82,1441.27],[1273.82,1441.27],[1268.73,1439.09],[1268.73,1439.09],[1268.73,1439.09],[1263.27,1443.27],[1263.27,1443.27],[1263.27,1443.27],[1264.0,1447.82],[1264.0,1447.82],[1264.0,1447.82],[1268.73,1446.91],[1268.73,1446.91],[1268.73,1446.91],[1273.82,1446.73],[1273.82,1446.73],[1273.82,1446.73],[1273.64,1452.55],[1273.64,1452.55],[1273.64,1452.55],[1269.09,1455.09],[1269.09,1455.09],[1269.09,1455.09],[1265.82,1453.82],[1265.82,1453.82],[1265.82,1453.82],[1262.55,1458.55],[1262.55,1458.55],[1262.55,1458.55],[1261.27,1462.73],[1261.27,1462.73],[1261.27,1462.73],[1254.36,1466.18],[1254.36,1466.18],[1254.36,1466.18],[1241.45,1468.55],[1241.45,1468.55],[1241.45,1468.55],[1236.18,1462.18],[1236.18,1462.18],[1236.18,1462.18],[1230.18,1455.64],[1230.18,1455.64],[1230.18,1455.64],[1219.27,1454.18],[1219.27,1454.18],[1219.27,1454.18],[1206.73,1442.91],[1206.73,1442.91],[1206.73,1442.91],[1194.18,1439.27],[1194.18,1439.27],[1194.18,1439.27],[1190.18,1430.36],[1190.18,1430.36],[1190.18,1430.36],[1184.73,1427.82],[1184.73,1427.82],[1184.73,1427.82],[1169.82,1426.91],[1169.82,1426.91],[1169.82,1426.91],[1157.27,1421.64],[1157.27,1421.64],[1157.27,1421.64],[1156.0,1411.45],[1156.0,1411.45],[1156.0,1411.45],[1148.73,1401.45],[1148.73,1401.45],[1148.73,1401.45],[1136.0,1400.55],[1136.0,1400.55],[1136.0,1400.55],[1129.27,1404.18],[1129.27,1404.18],[1129.27,1404.18],[1122.73,1399.64],[1122.73,1399.64],[1122.73,1399.64],[1111.27,1398.73],[1111.27,1398.73],[1111.27,1398.73],[1110.0,1405.27],[1110.0,1405.27],[1110.0,1405.27],[1104.45,1409.82],[1104.45,1409.82]]],['serpentsPoint',[[1232.5,1322.88],[1235.38,1321.62],[1235.38,1321.62],[1235.38,1321.62],[1245.0,1326.5],[1245.0,1326.5],[1245.0,1326.5],[1254.38,1327.12],[1254.38,1327.12],[1254.38,1327.12],[1258.25,1323.25],[1258.25,1323.25],[1258.25,1323.25],[1260.62,1322.88],[1260.62,1322.88],[1260.62,1322.88],[1263.88,1317.25],[1263.88,1317.25],[1263.88,1317.25],[1264.0,1312.38],[1264.0,1312.38],[1264.0,1312.38],[1269.12,1307.5],[1269.12,1307.5],[1269.12,1307.5],[1269.75,1300.38],[1269.75,1300.38],[1269.75,1300.38],[1286.88,1300.62],[1286.88,1300.62],[1286.88,1300.62],[1295.0,1306.38],[1295.0,1306.38],[1295.0,1306.38],[1295.38,1310.88],[1295.38,1310.88],[1295.38,1310.88],[1300.62,1318.5],[1300.62,1318.5],[1300.62,1318.5],[1299.38,1326.75],[1299.38,1326.75],[1299.38,1326.75],[1303.12,1337.5],[1303.12,1337.5],[1303.12,1337.5],[1307.62,1343.62],[1307.62,1343.62],[1307.62,1343.62],[1319.75,1344.62],[1319.75,1344.62],[1319.75,1344.62],[1324.0,1348.5],[1324.0,1348.5],[1324.0,1348.5],[1326.88,1354.0],[1326.88,1354.0],[1326.88,1354.0],[1324.75,1368.12],[1324.75,1368.12],[1324.75,1368.12],[1329.0,1383.25],[1329.0,1383.25],[1329.0,1383.25],[1335.0,1388.0],[1335.0,1388.0],[1335.0,1388.0],[1335.25,1395.25],[1335.25,1395.25],[1335.25,1395.25],[1337.88,1397.12],[1337.88,1397.12],[1337.88,1397.12],[1332.62,1401.5],[1332.62,1401.5],[1332.62,1401.5],[1330.38,1413.0],[1330.38,1413.0],[1330.38,1413.0],[1322.75,1422.75],[1322.75,1422.75],[1322.75,1422.75],[1312.38,1423.12],[1312.38,1423.12],[1312.38,1423.12],[1309.75,1422.38],[1309.75,1422.38],[1309.75,1422.38],[1305.38,1424.12],[1305.38,1424.12],[1305.38,1424.12],[1300.62,1424.25],[1300.62,1424.25],[1300.62,1424.25],[1293.75,1419.5],[1293.75,1419.5],[1293.75,1419.5],[1290.0,1419.5],[1290.0,1419.5],[1290.0,1419.5],[1284.75,1427.12],[1284.75,1427.12],[1284.75,1427.12],[1281.0,1426.62],[1281.0,1426.62],[1281.0,1426.62],[1277.25,1420.88],[1277.25,1420.88],[1277.25,1420.88],[1276.88,1412.25],[1276.88,1412.25],[1276.88,1412.25],[1273.12,1406.62],[1273.12,1406.62],[1273.12,1406.62],[1272.38,1391.88],[1272.38,1391.88],[1272.38,1391.88],[1264.12,1384.25],[1264.12,1384.25],[1264.12,1384.25],[1260.12,1373.5],[1260.12,1373.5],[1260.12,1373.5],[1258.88,1365.38],[1258.88,1365.38],[1258.88,1365.38],[1255.25,1360.5],[1255.25,1360.5],[1255.25,1360.5],[1246.12,1357.75],[1246.12,1357.75],[1246.12,1357.75],[1238.88,1355.5],[1238.88,1355.5],[1238.88,1355.5],[1234.38,1347.25],[1234.38,1347.25],[1234.38,1347.25],[1231.75,1340.12],[1231.75,1340.12],[1231.75,1340.12],[1236.88,1333.25],[1236.88,1333.25],[1236.88,1333.25],[1232.5,1322.88],[1232.5,1322.88]]],['blackcliff',[[1269.75,1300.38],[1269.12,1307.5],[1269.12,1307.5],[1269.12,1307.5],[1264.0,1312.38],[1264.0,1312.38],[1264.0,1312.38],[1263.88,1317.25],[1263.88,1317.25],[1263.88,1317.25],[1260.62,1322.88],[1260.62,1322.88],[1260.62,1322.88],[1258.25,1323.25],[1258.25,1323.25],[1258.25,1323.25],[1254.38,1327.12],[1254.38,1327.12],[1254.38,1327.12],[1245.0,1326.5],[1245.0,1326.5],[1245.0,1326.5],[1235.38,1321.62],[1235.38,1321.62],[1235.38,1321.62],[1232.5,1322.88],[1232.5,1322.88],[1232.5,1322.88],[1228.91,1316.0],[1228.91,1316.0],[1228.91,1316.0],[1226.18,1306.0],[1226.18,1306.0],[1226.18,1306.0],[1212.36,1288.18],[1212.36,1288.18],[1212.36,1288.18],[1211.82,1275.64],[1211.82,1275.64],[1211.82,1275.64],[1208.73,1268.0],[1208.73,1268.0],[1208.73,1268.0],[1208.55,1262.0],[1208.55,1262.0],[1208.55,1262.0],[1211.88,1255.88],[1211.88,1255.88],[1211.88,1255.88],[1215.88,1251.75],[1215.88,1251.75],[1215.88,1251.75],[1223.0,1246.12],[1223.0,1246.12],[1223.0,1246.12],[1228.38,1245.25],[1228.38,1245.25],[1228.38,1245.25],[1228.62,1241.0],[1228.62,1241.0],[1228.62,1241.0],[1225.0,1237.75],[1225.0,1237.75],[1225.0,1237.75],[1224.88,1233.5],[1224.88,1233.5],[1224.88,1233.5],[1222.75,1230.88],[1222.75,1230.88],[1222.75,1230.88],[1223.25,1227.0],[1223.25,1227.0],[1223.25,1227.0],[1229.88,1229.88],[1229.88,1229.88],[1229.88,1229.88],[1230.12,1234.25],[1230.12,1234.25],[1230.12,1234.25],[1236.12,1236.25],[1236.12,1236.25],[1236.12,1236.25],[1240.62,1241.12],[1240.62,1241.12],[1240.62,1241.12],[1245.88,1237.62],[1245.88,1237.62],[1245.88,1237.62],[1246.0,1242.25],[1246.0,1242.25],[1246.0,1242.25],[1255.0,1242.12],[1255.0,1242.12],[1255.0,1242.12],[1260.75,1245.12],[1260.75,1245.12],[1260.75,1245.12],[1265.62,1249.88],[1265.62,1249.88],[1265.62,1249.88],[1265.88,1259.12],[1265.88,1259.12],[1265.88,1259.12],[1269.38,1266.88],[1269.38,1266.88],[1269.38,1266.88],[1266.12,1273.12],[1266.12,1273.12],[1266.12,1273.12],[1265.75,1276.12],[1265.75,1276.12],[1265.75,1276.12],[1269.62,1278.25],[1269.62,1278.25],[1269.62,1278.25],[1269.62,1282.38],[1269.62,1282.38],[1269.62,1282.38],[1273.12,1286.62],[1273.12,1286.62],[1273.12,1286.62],[1271.88,1290.38],[1271.88,1290.38],[1271.88,1290.38],[1268.12,1293.12],[1268.12,1293.12],[1268.12,1293.12],[1267.62,1298.12],[1267.62,1298.12],[1267.62,1298.12],[1269.75,1300.38],[1269.75,1300.38]]],['ravenrock',[[1253.5,1134.5],[1246.25,1139.25],[1246.25,1139.25],[1246.25,1139.25],[1246.0,1144.75],[1246.0,1144.75],[1246.0,1144.75],[1247.5,1149.0],[1247.5,1149.0],[1247.5,1149.0],[1247.5,1162.25],[1247.5,1162.25],[1247.5,1162.25],[1242.25,1170.25],[1242.25,1170.25],[1242.25,1170.25],[1230.5,1186.25],[1230.5,1186.25],[1230.5,1186.25],[1222.5,1188.5],[1222.5,1188.5],[1222.5,1188.5],[1218.75,1190.75],[1218.75,1190.75],[1218.75,1190.75],[1215.75,1196.25],[1215.75,1196.25],[1215.75,1196.25],[1211.25,1197.25],[1211.25,1197.25],[1211.25,1197.25],[1203.5,1204.25],[1203.5,1204.25],[1203.5,1204.25],[1198.0,1210.75],[1198.0,1210.75],[1198.0,1210.75],[1198.5,1220.75],[1198.5,1220.75],[1198.5,1220.75],[1196.25,1223.75],[1196.25,1223.75],[1196.25,1223.75],[1196.25,1227.0],[1196.25,1227.0],[1196.25,1227.0],[1194.55,1229.0],[1194.55,1229.0],[1194.55,1229.0],[1194.64,1235.45],[1194.64,1235.45],[1194.64,1235.45],[1188.18,1238.64],[1188.18,1238.64],[1188.18,1238.64],[1187.45,1243.0],[1187.45,1243.0],[1187.45,1243.0],[1184.55,1245.91],[1184.55,1245.91],[1184.55,1245.91],[1175.64,1247.45],[1175.64,1247.45],[1175.64,1247.45],[1172.82,1249.36],[1172.82,1249.36],[1172.82,1249.36],[1168.09,1243.55],[1168.09,1243.55],[1168.09,1243.55],[1168.09,1229.91],[1168.09,1229.91],[1168.09,1229.91],[1166.0,1223.91],[1166.0,1223.91],[1166.0,1223.91],[1168.91,1217.73],[1168.91,1217.73],[1168.91,1217.73],[1170.55,1200.0],[1170.55,1200.0],[1170.55,1200.0],[1173.18,1195.45],[1173.18,1195.45],[1173.18,1195.45],[1176.73,1194.27],[1176.73,1194.27],[1176.73,1194.27],[1176.64,1190.64],[1176.64,1190.64],[1176.64,1190.64],[1173.18,1186.91],[1173.18,1186.91],[1173.18,1186.91],[1173.45,1181.55],[1173.45,1181.55],[1173.45,1181.55],[1177.64,1175.36],[1177.64,1175.36],[1177.64,1175.36],[1186.91,1176.55],[1186.91,1176.55],[1186.91,1176.55],[1191.18,1172.27],[1191.18,1172.27],[1191.18,1172.27],[1193.82,1165.18],[1193.82,1165.18],[1193.82,1165.18],[1193.91,1156.18],[1193.91,1156.18],[1193.91,1156.18],[1189.0,1146.09],[1189.0,1146.09],[1189.0,1146.09],[1183.27,1140.09],[1183.27,1140.09],[1183.27,1140.09],[1178.73,1140.0],[1178.73,1140.0],[1178.73,1140.0],[1178.36,1151.09],[1178.36,1151.09],[1178.36,1151.09],[1182.09,1156.91],[1182.09,1156.91],[1182.09,1156.91],[1183.55,1163.36],[1183.55,1163.36],[1183.55,1163.36],[1180.82,1169.0],[1180.82,1169.0],[1180.82,1169.0],[1171.09,1168.45],[1171.09,1168.45],[1171.09,1168.45],[1167.09,1171.91],[1167.09,1171.91],[1167.09,1171.91],[1167.09,1185.64],[1167.09,1185.64],[1167.09,1185.64],[1162.55,1186.64],[1162.55,1186.64],[1162.55,1186.64],[1161.55,1179.73],[1161.55,1179.73],[1161.55,1179.73],[1157.64,1175.27],[1157.64,1175.27],[1157.64,1175.27],[1153.0,1177.82],[1153.0,1177.82],[1153.0,1177.82],[1149.45,1182.82],[1149.45,1182.82],[1149.45,1182.82],[1141.09,1183.09],[1141.09,1183.09],[1141.09,1183.09],[1135.18,1187.0],[1135.18,1187.0],[1135.18,1187.0],[1125.91,1186.82],[1125.91,1186.82],[1125.91,1186.82],[1117.36,1182.73],[1117.36,1182.73],[1117.36,1182.73],[1113.56,1182.5],[1113.56,1182.5],[1113.56,1182.5],[1116.04,1178.04],[1116.04,1178.04],[1116.04,1178.04],[1121.96,1173.09],[1121.96,1173.09],[1121.96,1173.09],[1122.3,1167.04],[1122.3,1167.04],[1122.3,1167.04],[1126.0,1162.55],[1126.0,1162.55],[1126.0,1162.55],[1132.36,1159.82],[1132.36,1159.82],[1132.36,1159.82],[1133.64,1154.36],[1133.64,1154.36],[1133.64,1154.36],[1140.73,1146.55],[1140.73,1146.55],[1140.73,1146.55],[1147.45,1144.0],[1147.45,1144.0],[1147.45,1144.0],[1151.27,1140.36],[1151.27,1140.36],[1151.27,1140.36],[1151.27,1137.09],[1151.27,1137.09],[1151.27,1137.09],[1142.18,1127.09],[1142.18,1127.09],[1142.18,1127.09],[1139.64,1118.55],[1139.64,1118.55],[1139.64,1118.55],[1142.55,1112.0],[1142.55,1112.0],[1142.55,1112.0],[1148.73,1105.45],[1148.73,1105.45],[1148.73,1105.45],[1153.09,1099.64],[1153.09,1099.64],[1153.09,1099.64],[1154.73,1095.82],[1154.73,1095.82],[1154.73,1095.82],[1152.82,1089.64],[1152.82,1089.64],[1152.82,1089.64],[1160.12,1090.12],[1160.12,1090.12],[1160.12,1090.12],[1163.5,1094.12],[1163.5,1094.12],[1163.5,1094.12],[1167.88,1102.88],[1167.88,1102.88],[1167.88,1102.88],[1176.5,1101.75],[1176.5,1101.75],[1176.5,1101.75],[1180.0,1106.5],[1180.0,1106.5],[1180.0,1106.5],[1187.88,1106.12],[1187.88,1106.12],[1187.88,1106.12],[1188.62,1108.0],[1188.62,1108.0],[1188.62,1108.0],[1207.12,1109.12],[1207.12,1109.12],[1207.12,1109.12],[1208.38,1121.25],[1208.38,1121.25],[1208.38,1121.25],[1212.38,1126.62],[1212.38,1126.62],[1212.38,1126.62],[1219.38,1126.5],[1219.38,1126.5],[1219.38,1126.5],[1224.38,1122.38],[1224.38,1122.38],[1224.38,1122.38],[1229.5,1122.25],[1229.5,1122.25],[1229.5,1122.25],[1232.38,1125.0],[1232.38,1125.0],[1232.38,1125.0],[1236.12,1121.75],[1236.12,1121.75],[1236.12,1121.75],[1237.88,1116.75],[1237.88,1116.75],[1237.88,1116.75],[1244.88,1116.88],[1244.88,1116.88],[1244.88,1116.88],[1251.62,1123.12],[1251.62,1123.12],[1251.62,1123.12],[1257.0,1124.75],[1257.0,1124.75],[1257.0,1124.75],[1253.5,1134.5],[1253.5,1134.5]]],['skyend',[[1281.0,1084.5],[1280.25,1088.5],[1280.25,1088.5],[1280.25,1088.5],[1275.75,1094.25],[1275.75,1094.25],[1275.75,1094.25],[1269.75,1100.5],[1269.75,1100.5],[1269.75,1100.5],[1263.0,1107.75],[1263.0,1107.75],[1263.0,1107.75],[1259.25,1117.75],[1259.25,1117.75],[1259.25,1117.75],[1256.88,1125.12],[1256.88,1125.12],[1256.88,1125.12],[1251.62,1123.12],[1251.62,1123.12],[1251.62,1123.12],[1244.88,1116.88],[1244.88,1116.88],[1244.88,1116.88],[1237.88,1116.75],[1237.88,1116.75],[1237.88,1116.75],[1236.12,1121.75],[1236.12,1121.75],[1236.12,1121.75],[1232.38,1125.0],[1232.38,1125.0],[1232.38,1125.0],[1229.5,1122.25],[1229.5,1122.25],[1229.5,1122.25],[1224.38,1122.38],[1224.38,1122.38],[1224.38,1122.38],[1219.38,1126.5],[1219.38,1126.5],[1219.38,1126.5],[1212.38,1126.62],[1212.38,1126.62],[1212.38,1126.62],[1208.38,1121.25],[1208.38,1121.25],[1208.38,1121.25],[1207.12,1109.12],[1207.12,1109.12],[1207.12,1109.12],[1188.62,1108.0],[1188.62,1108.0],[1188.62,1108.0],[1187.88,1106.12],[1187.88,1106.12],[1187.88,1106.12],[1180.0,1106.5],[1180.0,1106.5],[1180.0,1106.5],[1176.5,1101.75],[1176.5,1101.75],[1176.5,1101.75],[1167.88,1102.88],[1167.88,1102.88],[1167.88,1102.88],[1163.5,1094.12],[1163.5,1094.12],[1163.5,1094.12],[1160.12,1090.12],[1160.12,1090.12],[1160.12,1090.12],[1152.82,1089.64],[1152.82,1089.64],[1152.82,1089.64],[1151.0,1084.64],[1151.0,1084.64],[1151.0,1084.64],[1152.91,1080.55],[1152.91,1080.55],[1152.91,1080.55],[1156.73,1078.91],[1156.73,1078.91],[1156.73,1078.91],[1160.45,1078.91],[1160.45,1078.91],[1160.45,1078.91],[1170.18,1071.45],[1170.18,1071.45],[1170.18,1071.45],[1172.91,1054.45],[1172.91,1054.45],[1172.91,1054.45],[1177.36,1048.55],[1177.36,1048.55],[1177.36,1048.55],[1183.18,1048.82],[1183.18,1048.82],[1183.18,1048.82],[1189.64,1044.36],[1189.64,1044.36],[1189.64,1044.36],[1191.09,1034.0],[1191.09,1034.0],[1191.09,1034.0],[1203.27,1022.0],[1203.27,1022.0],[1203.27,1022.0],[1204.18,1008.64],[1204.18,1008.64],[1204.18,1008.64],[1213.18,1000.18],[1213.18,1000.18],[1213.18,1000.18],[1215.18,991.27],[1215.18,991.27],[1215.18,991.27],[1220.82,989.09],[1220.82,989.09],[1220.82,989.09],[1226.0,992.09],[1226.0,992.09],[1226.0,992.09],[1229.82,991.82],[1229.82,991.82],[1229.82,991.82],[1233.0,990.5],[1233.0,990.5],[1233.0,990.5],[1232.82,996.09],[1232.82,996.09],[1232.82,996.09],[1230.82,999.27],[1230.82,999.27],[1230.82,999.27],[1231.09,1005.27],[1231.09,1005.27],[1231.09,1005.27],[1237.09,1015.55],[1237.09,1015.55],[1237.09,1015.55],[1239.64,1016.64],[1239.64,1016.64],[1239.64,1016.64],[1245.91,1024.64],[1245.91,1024.64],[1245.91,1024.64],[1253.73,1025.45],[1253.73,1025.45],[1253.73,1025.45],[1259.18,1030.27],[1259.18,1030.27],[1259.18,1030.27],[1261.82,1036.73],[1261.82,1036.73],[1261.82,1036.73],[1261.73,1044.0],[1261.73,1044.0],[1261.73,1044.0],[1260.27,1048.0],[1260.27,1048.0],[1260.27,1048.0],[1263.09,1056.18],[1263.09,1056.18],[1263.09,1056.18],[1258.18,1065.18],[1258.18,1065.18],[1258.18,1065.18],[1258.45,1069.0],[1258.45,1069.0],[1258.45,1069.0],[1266.45,1072.82],[1266.45,1072.82],[1266.45,1072.82],[1273.45,1076.82],[1273.45,1076.82],[1273.45,1076.82],[1279.55,1080.18],[1279.55,1080.18],[1279.55,1080.18],[1281.0,1084.5],[1281.0,1084.5]]],['faberia',[[1125.82,962.18],[1116.55,968.73],[1116.55,968.73],[1116.55,968.73],[1116.55,971.64],[1116.55,971.64],[1116.55,971.64],[1122.0,974.36],[1122.0,974.36],[1122.0,974.36],[1127.45,984.36],[1127.45,984.36],[1127.45,984.36],[1127.27,997.09],[1127.27,997.09],[1127.27,997.09],[1130.73,1001.64],[1130.73,1001.64],[1130.73,1001.64],[1133.82,1012.55],[1133.82,1012.55],[1133.82,1012.55],[1142.55,1024.0],[1142.55,1024.0],[1142.55,1024.0],[1141.45,1029.09],[1141.45,1029.09],[1141.45,1029.09],[1147.82,1036.36],[1147.82,1036.36],[1147.82,1036.36],[1151.27,1037.45],[1151.27,1037.45],[1151.27,1037.45],[1153.64,1040.18],[1153.64,1040.18],[1153.64,1040.18],[1146.36,1051.27],[1146.36,1051.27],[1146.36,1051.27],[1146.36,1056.91],[1146.36,1056.91],[1146.36,1056.91],[1148.73,1061.09],[1148.73,1061.09],[1148.73,1061.09],[1147.09,1065.27],[1147.09,1065.27],[1147.09,1065.27],[1151.82,1070.0],[1151.82,1070.0],[1151.82,1070.0],[1152.91,1080.55],[1152.91,1080.55],[1152.91,1080.55],[1156.73,1078.91],[1156.73,1078.91],[1156.73,1078.91],[1160.45,1078.91],[1160.45,1078.91],[1160.45,1078.91],[1170.18,1071.45],[1170.18,1071.45],[1170.18,1071.45],[1172.91,1054.45],[1172.91,1054.45],[1172.91,1054.45],[1177.36,1048.55],[1177.36,1048.55],[1177.36,1048.55],[1183.18,1048.82],[1183.18,1048.82],[1183.18,1048.82],[1189.64,1044.36],[1189.64,1044.36],[1189.64,1044.36],[1191.09,1034.0],[1191.09,1034.0],[1191.09,1034.0],[1203.27,1022.0],[1203.27,1022.0],[1203.27,1022.0],[1204.18,1008.64],[1204.18,1008.64],[1204.18,1008.64],[1213.18,1000.18],[1213.18,1000.18],[1213.18,1000.18],[1215.18,991.27],[1215.18,991.27],[1215.18,991.27],[1220.82,989.09],[1220.82,989.09],[1220.82,989.09],[1226.0,992.09],[1226.0,992.09],[1226.0,992.09],[1229.82,991.82],[1229.82,991.82],[1229.82,991.82],[1233.0,990.5],[1233.0,990.5],[1233.0,990.5],[1236.75,985.0],[1236.75,985.0],[1236.75,985.0],[1238.75,981.75],[1238.75,981.75],[1238.75,981.75],[1242.0,973.64],[1242.0,973.64],[1242.0,973.64],[1251.45,964.73],[1251.45,964.73],[1251.45,964.73],[1254.55,957.45],[1254.55,957.45],[1254.55,957.45],[1260.73,952.55],[1260.73,952.55],[1260.73,952.55],[1261.64,949.64],[1261.64,949.64],[1261.64,949.64],[1268.0,945.64],[1268.0,945.64],[1268.0,945.64],[1266.0,943.27],[1266.0,943.27],[1266.0,943.27],[1261.09,942.73],[1261.09,942.73],[1261.09,942.73],[1252.36,946.55],[1252.36,946.55],[1252.36,946.55],[1245.45,946.91],[1245.45,946.91],[1245.45,946.91],[1240.73,950.73],[1240.73,950.73],[1240.73,950.73],[1229.45,949.09],[1229.45,949.09],[1229.45,949.09],[1225.64,951.45],[1225.64,951.45],[1225.64,951.45],[1224.36,947.45],[1224.36,947.45],[1224.36,947.45],[1216.36,948.18],[1216.36,948.18],[1216.36,948.18],[1211.45,937.82],[1211.45,937.82],[1211.45,937.82],[1208.36,936.91],[1208.36,936.91],[1208.36,936.91],[1204.64,931.55],[1204.64,931.55],[1204.64,931.55],[1202.62,933.5],[1202.62,933.5],[1202.62,933.5],[1196.25,933.5],[1196.25,933.5],[1196.25,933.5],[1193.5,936.38],[1193.5,936.38],[1193.5,936.38],[1189.75,937.25],[1189.75,937.25],[1189.75,937.25],[1184.75,942.25],[1184.75,942.25],[1184.75,942.25],[1175.75,942.5],[1175.75,942.5],[1175.75,942.5],[1160.0,952.38],[1160.0,952.38],[1160.0,952.38],[1143.75,951.12],[1143.75,951.12],[1143.75,951.12],[1140.38,946.0],[1140.38,946.0],[1140.38,946.0],[1134.88,942.88],[1134.88,942.88],[1134.88,942.88],[1129.12,949.25],[1129.12,949.25],[1129.12,949.25],[1126.91,955.64],[1126.91,955.64],[1126.91,955.64],[1125.82,962.18],[1125.82,962.18]]],['bannensRest',[[1204.64,931.55],[1203.45,925.45],[1203.45,925.45],[1203.45,925.45],[1208.0,913.27],[1208.0,913.27],[1208.0,913.27],[1215.64,905.27],[1215.64,905.27],[1215.64,905.27],[1216.36,900.18],[1216.36,900.18],[1216.36,900.18],[1212.55,893.27],[1212.55,893.27],[1212.55,893.27],[1213.82,885.64],[1213.82,885.64],[1213.82,885.64],[1209.82,884.91],[1209.82,884.91],[1209.82,884.91],[1212.0,879.82],[1212.0,879.82],[1212.0,879.82],[1211.09,873.45],[1211.09,873.45],[1211.09,873.45],[1216.55,866.36],[1216.55,866.36],[1216.55,866.36],[1212.73,859.09],[1212.73,859.09],[1212.73,859.09],[1214.91,854.36],[1214.91,854.36],[1214.91,854.36],[1210.18,856.0],[1210.18,856.0],[1210.18,856.0],[1195.09,854.36],[1195.09,854.36],[1195.09,854.36],[1189.09,850.18],[1189.09,850.18],[1189.09,850.18],[1189.09,847.45],[1189.09,847.45],[1189.09,847.45],[1181.64,838.18],[1181.64,838.18],[1181.64,838.18],[1169.27,834.18],[1169.27,834.18],[1169.27,834.18],[1156.0,825.64],[1156.0,825.64],[1156.0,825.64],[1152.25,827.0],[1152.25,827.0],[1152.25,827.0],[1148.88,834.12],[1148.88,834.12],[1148.88,834.12],[1141.75,836.5],[1141.75,836.5],[1141.75,836.5],[1135.75,835.25],[1135.75,835.25],[1135.75,835.25],[1127.75,838.75],[1127.75,838.75],[1127.75,838.75],[1126.5,851.0],[1126.5,851.0],[1126.5,851.0],[1105.0,868.0],[1105.0,868.0],[1105.0,868.0],[1086.75,866.0],[1086.75,866.0],[1086.75,866.0],[1081.75,870.25],[1081.75,870.25],[1081.75,870.25],[1073.64,868.91],[1073.64,868.91],[1073.64,868.91],[1076.0,873.82],[1076.0,873.82],[1076.0,873.82],[1072.73,881.64],[1072.73,881.64],[1072.73,881.64],[1073.09,885.82],[1073.09,885.82],[1073.09,885.82],[1062.91,889.64],[1062.91,889.64],[1062.91,889.64],[1058.73,901.27],[1058.73,901.27],[1058.73,901.27],[1058.91,914.0],[1058.91,914.0],[1058.91,914.0],[1065.64,922.73],[1065.64,922.73],[1065.64,922.73],[1066.18,928.91],[1066.18,928.91],[1066.18,928.91],[1064.73,933.09],[1064.73,933.09],[1064.73,933.09],[1066.73,937.45],[1066.73,937.45],[1066.73,937.45],[1067.64,948.36],[1067.64,948.36],[1067.64,948.36],[1070.55,953.27],[1070.55,953.27],[1070.55,953.27],[1072.73,966.18],[1072.73,966.18],[1072.73,966.18],[1078.73,973.27],[1078.73,973.27],[1078.73,973.27],[1084.18,970.36],[1084.18,970.36],[1084.18,970.36],[1084.73,964.55],[1084.73,964.55],[1084.73,964.55],[1088.0,960.73],[1088.0,960.73],[1088.0,960.73],[1089.09,955.27],[1089.09,955.27],[1089.09,955.27],[1094.0,951.09],[1094.0,951.09],[1094.0,951.09],[1100.18,951.09],[1100.18,951.09],[1100.18,951.09],[1107.27,958.91],[1107.27,958.91],[1107.27,958.91],[1113.09,959.27],[1113.09,959.27],[1113.09,959.27],[1116.36,956.0],[1116.36,956.0],[1116.36,956.0],[1126.91,955.64],[1126.91,955.64],[1126.91,955.64],[1129.12,949.25],[1129.12,949.25],[1129.12,949.25],[1134.88,942.88],[1134.88,942.88],[1134.88,942.88],[1140.38,946.0],[1140.38,946.0],[1140.38,946.0],[1143.75,951.12],[1143.75,951.12],[1143.75,951.12],[1160.0,952.38],[1160.0,952.38],[1160.0,952.38],[1175.75,942.5],[1175.75,942.5],[1175.75,942.5],[1184.75,942.25],[1184.75,942.25],[1184.75,942.25],[1189.75,937.25],[1189.75,937.25],[1189.75,937.25],[1193.5,936.38],[1193.5,936.38],[1193.5,936.38],[1196.25,933.5],[1196.25,933.5],[1196.25,933.5],[1202.62,933.5],[1202.62,933.5],[1202.62,933.5],[1204.64,931.55],[1204.64,931.55]]],['fallow',[[1214.91,854.36],[1220.0,853.27],[1220.0,853.27],[1220.0,853.27],[1222.73,849.64],[1222.73,849.64],[1222.73,849.64],[1214.73,842.36],[1214.73,842.36],[1214.73,842.36],[1216.18,839.45],[1216.18,839.45],[1216.18,839.45],[1214.55,835.82],[1214.55,835.82],[1214.55,835.82],[1220.55,829.64],[1220.55,829.64],[1220.55,829.64],[1220.73,817.82],[1220.73,817.82],[1220.73,817.82],[1224.73,816.91],[1224.73,816.91],[1224.73,816.91],[1227.82,809.82],[1227.82,809.82],[1227.82,809.82],[1233.27,804.55],[1233.27,804.55],[1233.27,804.55],[1236.91,804.91],[1236.91,804.91],[1236.91,804.91],[1238.75,799.25],[1238.75,799.25],[1238.75,799.25],[1245.5,797.75],[1245.5,797.75],[1245.5,797.75],[1247.75,792.0],[1247.75,792.0],[1247.75,792.0],[1245.0,784.75],[1245.0,784.75],[1245.0,784.75],[1248.0,775.0],[1248.0,775.0],[1248.0,775.0],[1245.0,767.0],[1245.0,767.0],[1245.0,767.0],[1241.0,764.0],[1241.0,764.0],[1241.0,764.0],[1241.25,753.25],[1241.25,753.25],[1241.25,753.25],[1245.25,737.25],[1245.25,737.25],[1245.25,737.25],[1233.75,724.0],[1233.75,724.0],[1233.75,724.0],[1236.75,714.0],[1236.75,714.0],[1236.75,714.0],[1233.0,708.0],[1233.0,708.0],[1233.0,708.0],[1233.25,702.25],[1233.25,702.25],[1233.25,702.25],[1238.75,697.75],[1238.75,697.75],[1238.75,697.75],[1242.25,689.25],[1242.25,689.25],[1242.25,689.25],[1238.25,673.0],[1238.25,673.0],[1238.25,673.0],[1231.25,666.25],[1231.25,666.25],[1231.25,666.25],[1224.33,659.33],[1224.33,659.33],[1224.33,659.33],[1214.0,657.33],[1214.0,657.33],[1214.0,657.33],[1207.67,652.33],[1207.67,652.33],[1207.67,652.33],[1205.0,654.67],[1205.0,654.67],[1205.0,654.67],[1199.67,655.33],[1199.67,655.33],[1199.67,655.33],[1200.0,660.0],[1200.0,660.0],[1200.0,660.0],[1195.33,662.33],[1195.33,662.33],[1195.33,662.33],[1200.67,668.67],[1200.67,668.67],[1200.67,668.67],[1200.33,674.67],[1200.33,674.67],[1200.33,674.67],[1193.0,674.67],[1193.0,674.67],[1193.0,674.67],[1192.33,680.33],[1192.33,680.33],[1192.33,680.33],[1187.67,683.33],[1187.67,683.33],[1187.67,683.33],[1182.33,679.33],[1182.33,679.33],[1182.33,679.33],[1177.67,677.33],[1177.67,677.33],[1177.67,677.33],[1172.0,682.67],[1172.0,682.67],[1172.0,682.67],[1170.67,689.0],[1170.67,689.0],[1170.67,689.0],[1164.0,694.67],[1164.0,694.67],[1164.0,694.67],[1154.0,705.33],[1154.0,705.33],[1154.0,705.33],[1153.33,717.33],[1153.33,717.33],[1153.33,717.33],[1148.33,726.0],[1148.33,726.0],[1148.33,726.0],[1147.0,739.0],[1147.0,739.0],[1147.0,739.0],[1142.33,751.33],[1142.33,751.33],[1142.33,751.33],[1133.67,756.0],[1133.67,756.0],[1133.67,756.0],[1134.36,760.36],[1134.36,760.36],[1134.36,760.36],[1146.91,769.45],[1146.91,769.45],[1146.91,769.45],[1154.0,778.18],[1154.0,778.18],[1154.0,778.18],[1150.73,786.18],[1150.73,786.18],[1150.73,786.18],[1156.0,803.82],[1156.0,803.82],[1156.0,803.82],[1160.73,810.55],[1160.73,810.55],[1160.73,810.55],[1160.91,817.82],[1160.91,817.82],[1160.91,817.82],[1156.18,821.27],[1156.18,821.27],[1156.18,821.27],[1156.0,825.64],[1156.0,825.64],[1156.0,825.64],[1169.27,834.18],[1169.27,834.18],[1169.27,834.18],[1181.64,838.18],[1181.64,838.18],[1181.64,838.18],[1189.09,847.45],[1189.09,847.45],[1189.09,847.45],[1189.09,850.18],[1189.09,850.18],[1189.09,850.18],[1196.3,855.26],[1196.3,855.26],[1196.3,855.26],[1210.52,855.22],[1210.52,855.22],[1210.52,855.22],[1214.91,854.36],[1214.91,854.36]]],['virna',[[1240.0,806.5],[1243.25,811.5],[1243.25,811.5],[1243.25,811.5],[1252.75,810.0],[1252.75,810.0],[1252.75,810.0],[1258.5,813.0],[1258.5,813.0],[1258.5,813.0],[1272.0,808.75],[1272.0,808.75],[1272.0,808.75],[1277.25,801.25],[1277.25,801.25],[1277.25,801.25],[1284.75,798.5],[1284.75,798.5],[1284.75,798.5],[1292.0,793.75],[1292.0,793.75],[1292.0,793.75],[1293.0,790.5],[1293.0,790.5],[1293.0,790.5],[1298.0,786.0],[1298.0,786.0],[1298.0,786.0],[1302.5,786.25],[1302.5,786.25],[1302.5,786.25],[1308.25,774.5],[1308.25,774.5],[1308.25,774.5],[1312.75,772.75],[1312.75,772.75],[1312.75,772.75],[1316.5,775.25],[1316.5,775.25],[1316.5,775.25],[1320.75,772.75],[1320.75,772.75],[1320.75,772.75],[1335.0,776.0],[1335.0,776.0],[1335.0,776.0],[1341.5,769.75],[1341.5,769.75],[1341.5,769.75],[1346.75,769.5],[1346.75,769.5],[1346.75,769.5],[1352.36,774.73],[1352.36,774.73],[1352.36,774.73],[1350.0,779.27],[1350.0,779.27],[1350.0,779.27],[1350.18,784.0],[1350.18,784.0],[1350.18,784.0],[1355.27,790.36],[1355.27,790.36],[1355.27,790.36],[1358.91,797.09],[1358.91,797.09],[1358.91,797.09],[1359.45,805.27],[1359.45,805.27],[1359.45,805.27],[1360.56,811.81],[1360.56,811.81],[1360.56,811.81],[1353.5,815.88],[1353.5,815.88],[1353.5,815.88],[1344.12,816.12],[1344.12,816.12],[1344.12,816.12],[1337.12,820.62],[1337.12,820.62],[1337.12,820.62],[1323.12,821.88],[1323.12,821.88],[1323.12,821.88],[1314.88,828.25],[1314.88,828.25],[1314.88,828.25],[1313.5,832.62],[1313.5,832.62],[1313.5,832.62],[1300.88,839.75],[1300.88,839.75],[1300.88,839.75],[1294.75,840.25],[1294.75,840.25],[1294.75,840.25],[1280.5,850.38],[1280.5,850.38],[1280.5,850.38],[1279.38,854.62],[1279.38,854.62],[1279.38,854.62],[1271.5,862.25],[1271.5,862.25],[1271.5,862.25],[1268.12,868.5],[1268.12,868.5],[1268.12,868.5],[1267.62,883.5],[1267.62,883.5],[1267.62,883.5],[1271.0,888.62],[1271.0,888.62],[1271.0,888.62],[1272.75,894.12],[1272.75,894.12],[1272.75,894.12],[1281.25,900.25],[1281.25,900.25],[1281.25,900.25],[1286.5,906.62],[1286.5,906.62],[1286.5,906.62],[1287.5,912.88],[1287.5,912.88],[1287.5,912.88],[1292.62,922.38],[1292.62,922.38],[1292.62,922.38],[1294.5,927.12],[1294.5,927.12],[1294.5,927.12],[1294.62,936.25],[1294.62,936.25],[1294.62,936.25],[1293.45,938.0],[1293.45,938.0],[1293.45,938.0],[1288.91,941.09],[1288.91,941.09],[1288.91,941.09],[1284.18,941.45],[1284.18,941.45],[1284.18,941.45],[1280.0,944.91],[1280.0,944.91],[1280.0,944.91],[1268.0,945.64],[1268.0,945.64],[1268.0,945.64],[1266.0,943.27],[1266.0,943.27],[1266.0,943.27],[1261.09,942.73],[1261.09,942.73],[1261.09,942.73],[1252.36,946.55],[1252.36,946.55],[1252.36,946.55],[1245.45,946.91],[1245.45,946.91],[1245.45,946.91],[1240.73,950.73],[1240.73,950.73],[1240.73,950.73],[1229.45,949.09],[1229.45,949.09],[1229.45,949.09],[1225.64,951.45],[1225.64,951.45],[1225.64,951.45],[1224.36,947.45],[1224.36,947.45],[1224.36,947.45],[1216.36,948.18],[1216.36,948.18],[1216.36,948.18],[1211.45,937.82],[1211.45,937.82],[1211.45,937.82],[1208.36,936.91],[1208.36,936.91],[1208.36,936.91],[1204.64,931.55],[1204.64,931.55],[1204.64,931.55],[1203.45,925.45],[1203.45,925.45],[1203.45,925.45],[1208.0,913.27],[1208.0,913.27],[1208.0,913.27],[1215.64,905.27],[1215.64,905.27],[1215.64,905.27],[1216.36,900.18],[1216.36,900.18],[1216.36,900.18],[1212.55,893.27],[1212.55,893.27],[1212.55,893.27],[1213.82,885.64],[1213.82,885.64],[1213.82,885.64],[1209.82,884.91],[1209.82,884.91],[1209.82,884.91],[1212.0,879.82],[1212.0,879.82],[1212.0,879.82],[1211.09,873.45],[1211.09,873.45],[1211.09,873.45],[1216.55,866.36],[1216.55,866.36],[1216.55,866.36],[1212.73,859.09],[1212.73,859.09],[1212.73,859.09],[1214.91,854.36],[1214.91,854.36],[1214.91,854.36],[1220.0,853.27],[1220.0,853.27],[1220.0,853.27],[1222.73,849.64],[1222.73,849.64],[1222.73,849.64],[1214.73,842.36],[1214.73,842.36],[1214.73,842.36],[1216.18,839.45],[1216.18,839.45],[1216.18,839.45],[1214.55,835.82],[1214.55,835.82],[1214.55,835.82],[1220.55,829.64],[1220.55,829.64],[1220.55,829.64],[1220.73,817.82],[1220.73,817.82],[1220.73,817.82],[1224.73,816.91],[1224.73,816.91],[1224.73,816.91],[1227.82,809.82],[1227.82,809.82],[1227.82,809.82],[1233.27,804.55],[1233.27,804.55],[1233.27,804.55],[1236.91,804.91],[1236.91,804.91],[1236.91,804.91],[1240.0,806.5],[1240.0,806.5]]],['paritus',[[1321.75,613.12],[1329.25,611.25],[1329.25,611.25],[1329.25,611.25],[1340.25,603.0],[1340.25,603.0],[1340.25,603.0],[1356.25,584.5],[1356.25,584.5],[1356.25,584.5],[1367.0,581.75],[1367.0,581.75],[1367.0,581.75],[1371.0,579.25],[1371.0,579.25],[1371.0,579.25],[1378.25,579.75],[1378.25,579.75],[1378.25,579.75],[1388.73,582.55],[1388.73,582.55],[1388.73,582.55],[1390.12,580.25],[1390.12,580.25],[1390.12,580.25],[1392.38,580.38],[1392.38,580.38],[1392.38,580.38],[1392.75,584.62],[1392.75,584.62],[1392.75,584.62],[1395.12,587.38],[1395.12,587.38],[1395.12,587.38],[1395.25,594.5],[1395.25,594.5],[1395.25,594.5],[1398.5,600.12],[1398.5,600.12],[1398.5,600.12],[1400.0,612.0],[1400.0,612.0],[1400.0,612.0],[1395.38,615.88],[1395.38,615.88],[1395.38,615.88],[1395.38,621.75],[1395.38,621.75],[1395.38,621.75],[1402.75,632.62],[1402.75,632.62],[1402.75,632.62],[1402.38,644.25],[1402.38,644.25],[1402.38,644.25],[1399.88,651.62],[1399.88,651.62],[1399.88,651.62],[1394.0,658.12],[1394.0,658.12],[1394.0,658.12],[1394.25,671.38],[1394.25,671.38],[1394.25,671.38],[1392.88,672.75],[1392.88,672.75],[1392.88,672.75],[1392.88,676.25],[1392.88,676.25],[1392.88,676.25],[1398.0,681.5],[1398.0,681.5],[1398.0,681.5],[1402.0,690.62],[1402.0,690.62],[1402.0,690.62],[1402.12,694.0],[1402.12,694.0],[1402.12,694.0],[1394.62,700.62],[1394.62,700.62],[1394.62,700.62],[1388.75,702.0],[1388.75,702.0],[1388.75,702.0],[1382.38,709.0],[1382.38,709.0],[1382.38,709.0],[1382.5,713.25],[1382.5,713.25],[1382.5,713.25],[1372.5,721.5],[1372.5,721.5],[1372.5,721.5],[1370.0,728.5],[1370.0,728.5],[1370.0,728.5],[1364.38,738.5],[1364.38,738.5],[1364.38,738.5],[1364.5,752.62],[1364.5,752.62],[1364.5,752.62],[1364.62,766.38],[1364.62,766.38],[1364.62,766.38],[1358.5,774.5],[1358.5,774.5],[1358.5,774.5],[1352.36,774.73],[1352.36,774.73],[1352.36,774.73],[1346.75,769.5],[1346.75,769.5],[1346.75,769.5],[1341.5,769.75],[1341.5,769.75],[1341.5,769.75],[1335.0,776.0],[1335.0,776.0],[1335.0,776.0],[1320.75,772.75],[1320.75,772.75],[1320.75,772.75],[1316.5,775.25],[1316.5,775.25],[1316.5,775.25],[1312.75,772.75],[1312.75,772.75],[1312.75,772.75],[1308.25,774.5],[1308.25,774.5],[1308.25,774.5],[1302.5,786.25],[1302.5,786.25],[1302.5,786.25],[1298.0,786.0],[1298.0,786.0],[1298.0,786.0],[1293.0,790.5],[1293.0,790.5],[1293.0,790.5],[1292.0,793.75],[1292.0,793.75],[1292.0,793.75],[1284.75,798.5],[1284.75,798.5],[1284.75,798.5],[1277.25,801.25],[1277.25,801.25],[1277.25,801.25],[1272.0,808.75],[1272.0,808.75],[1272.0,808.75],[1258.5,813.0],[1258.5,813.0],[1258.5,813.0],[1252.75,810.0],[1252.75,810.0],[1252.75,810.0],[1243.25,811.5],[1243.25,811.5],[1243.25,811.5],[1240.0,806.5],[1240.0,806.5],[1240.0,806.5],[1236.91,804.91],[1236.91,804.91],[1236.91,804.91],[1238.75,799.25],[1238.75,799.25],[1238.75,799.25],[1245.5,797.75],[1245.5,797.75],[1245.5,797.75],[1247.75,792.0],[1247.75,792.0],[1247.75,792.0],[1245.0,784.75],[1245.0,784.75],[1245.0,784.75],[1248.0,775.0],[1248.0,775.0],[1248.0,775.0],[1245.0,767.0],[1245.0,767.0],[1245.0,767.0],[1241.0,764.0],[1241.0,764.0],[1241.0,764.0],[1241.25,753.25],[1241.25,753.25],[1241.25,753.25],[1245.25,737.25],[1245.25,737.25],[1245.25,737.25],[1233.75,724.0],[1233.75,724.0],[1233.75,724.0],[1236.75,714.0],[1236.75,714.0],[1236.75,714.0],[1233.0,708.0],[1233.0,708.0],[1233.0,708.0],[1233.25,702.25],[1233.25,702.25],[1233.25,702.25],[1238.75,697.75],[1238.75,697.75],[1238.75,697.75],[1242.25,689.25],[1242.25,689.25],[1242.25,689.25],[1238.25,673.0],[1238.25,673.0],[1238.25,673.0],[1231.25,666.25],[1231.25,666.25],[1231.25,666.25],[1235.0,658.0],[1235.0,658.0],[1235.0,658.0],[1234.75,652.5],[1234.75,652.5],[1234.75,652.5],[1239.25,645.75],[1239.25,645.75],[1239.25,645.75],[1240.75,638.0],[1240.75,638.0],[1240.75,638.0],[1246.75,633.25],[1246.75,633.25],[1246.75,633.25],[1246.5,624.75],[1246.5,624.75],[1246.5,624.75],[1257.25,624.75],[1257.25,624.75],[1257.25,624.75],[1270.0,612.0],[1270.0,612.0],[1270.0,612.0],[1274.75,612.5],[1274.75,612.5],[1274.75,612.5],[1293.25,618.75],[1293.25,618.75],[1293.25,618.75],[1295.5,620.5],[1295.5,620.5],[1295.5,620.5],[1299.5,620.25],[1299.5,620.25],[1299.5,620.25],[1303.5,616.75],[1303.5,616.75],[1303.5,616.75],[1313.25,617.75],[1313.25,617.75],[1313.25,617.75],[1315.75,612.25],[1315.75,612.25],[1315.75,612.25],[1321.75,613.12],[1321.75,613.12]]],['hanat',[[1455.45,630.91],[1457.09,618.0],[1457.09,618.0],[1457.09,618.0],[1470.18,623.27],[1470.18,623.27],[1470.18,623.27],[1473.64,616.73],[1473.64,616.73],[1473.64,616.73],[1469.64,611.64],[1469.64,611.64],[1469.64,611.64],[1468.55,597.82],[1468.55,597.82],[1468.55,597.82],[1460.18,582.36],[1460.18,582.36],[1460.18,582.36],[1454.36,577.45],[1454.36,577.45],[1454.36,577.45],[1445.64,583.09],[1445.64,583.09],[1445.64,583.09],[1440.73,583.64],[1440.73,583.64],[1440.73,583.64],[1442.0,590.73],[1442.0,590.73],[1442.0,590.73],[1434.91,594.73],[1434.91,594.73],[1434.91,594.73],[1426.73,583.45],[1426.73,583.45],[1426.73,583.45],[1423.64,583.82],[1423.64,583.82],[1423.64,583.82],[1422.36,578.55],[1422.36,578.55],[1422.36,578.55],[1427.64,572.73],[1427.64,572.73],[1427.64,572.73],[1428.91,562.55],[1428.91,562.55],[1428.91,562.55],[1424.0,562.18],[1424.0,562.18],[1424.0,562.18],[1425.09,556.18],[1425.09,556.18],[1425.09,556.18],[1419.09,552.0],[1419.09,552.0],[1419.09,552.0],[1413.64,554.36],[1413.64,554.36],[1413.64,554.36],[1413.45,545.27],[1413.45,545.27],[1413.45,545.27],[1420.18,530.55],[1420.18,530.55],[1420.18,530.55],[1415.45,528.36],[1415.45,528.36],[1415.45,528.36],[1406.91,536.36],[1406.91,536.36],[1406.91,536.36],[1403.09,534.91],[1403.09,534.91],[1403.09,534.91],[1394.18,544.91],[1394.18,544.91],[1394.18,544.91],[1390.55,556.36],[1390.55,556.36],[1390.55,556.36],[1390.12,580.25],[1390.12,580.25],[1390.12,580.25],[1392.38,580.38],[1392.38,580.38],[1392.38,580.38],[1392.75,584.62],[1392.75,584.62],[1392.75,584.62],[1395.12,587.38],[1395.12,587.38],[1395.12,587.38],[1395.25,594.5],[1395.25,594.5],[1395.25,594.5],[1398.5,600.12],[1398.5,600.12],[1398.5,600.12],[1400.0,612.0],[1400.0,612.0],[1400.0,612.0],[1395.38,615.88],[1395.38,615.88],[1395.38,615.88],[1395.38,621.75],[1395.38,621.75],[1395.38,621.75],[1402.75,632.62],[1402.75,632.62],[1402.75,632.62],[1402.38,644.25],[1402.38,644.25],[1402.38,644.25],[1399.88,651.62],[1399.88,651.62],[1399.88,651.62],[1394.0,658.12],[1394.0,658.12],[1394.0,658.12],[1394.25,671.38],[1394.25,671.38],[1394.25,671.38],[1392.88,672.75],[1392.88,672.75],[1392.88,672.75],[1392.88,676.25],[1392.88,676.25],[1392.88,676.25],[1398.0,681.5],[1398.0,681.5],[1398.0,681.5],[1402.0,690.62],[1402.0,690.62],[1402.0,690.62],[1402.12,694.0],[1402.12,694.0],[1402.12,694.0],[1394.62,700.62],[1394.62,700.62],[1394.62,700.62],[1388.75,702.0],[1388.75,702.0],[1388.75,702.0],[1382.38,709.0],[1382.38,709.0],[1382.38,709.0],[1382.5,713.25],[1382.5,713.25],[1382.5,713.25],[1372.5,721.5],[1372.5,721.5],[1372.5,721.5],[1370.0,728.5],[1370.0,728.5],[1370.0,728.5],[1364.38,738.5],[1364.38,738.5],[1364.38,738.5],[1364.5,752.62],[1364.5,752.62],[1364.5,752.62],[1364.62,766.38],[1364.62,766.38],[1364.62,766.38],[1358.5,774.5],[1358.5,774.5],[1358.5,774.5],[1352.36,774.73],[1352.36,774.73],[1352.36,774.73],[1350.0,779.27],[1350.0,779.27],[1350.0,779.27],[1350.18,784.0],[1350.18,784.0],[1350.18,784.0],[1355.27,790.36],[1355.27,790.36],[1355.27,790.36],[1358.91,797.09],[1358.91,797.09],[1358.91,797.09],[1359.45,805.27],[1359.45,805.27],[1359.45,805.27],[1360.5,811.75],[1360.5,811.75],[1360.5,811.75],[1364.25,819.25],[1364.25,819.25],[1364.25,819.25],[1365.25,826.38],[1365.25,826.38],[1365.25,826.38],[1377.0,836.75],[1377.0,836.75],[1377.0,836.75],[1384.25,844.38],[1384.25,844.38],[1384.25,844.38],[1388.0,852.25],[1388.0,852.25],[1388.0,852.25],[1391.5,852.25],[1391.5,852.25],[1391.5,852.25],[1394.0,847.25],[1394.0,847.25],[1394.0,847.25],[1398.75,844.75],[1398.75,844.75],[1398.75,844.75],[1401.25,839.25],[1401.25,839.25],[1401.25,839.25],[1405.5,837.75],[1405.5,837.75],[1405.5,837.75],[1401.5,831.5],[1401.5,831.5],[1401.5,831.5],[1401.0,828.75],[1401.0,828.75],[1401.0,828.75],[1396.5,823.75],[1396.5,823.75],[1396.5,823.75],[1404.25,815.25],[1404.25,815.25],[1404.25,815.25],[1409.0,817.5],[1409.0,817.5],[1409.0,817.5],[1415.25,815.5],[1415.25,815.5],[1415.25,815.5],[1414.5,809.75],[1414.5,809.75],[1414.5,809.75],[1408.75,807.0],[1408.75,807.0],[1408.75,807.0],[1408.25,802.75],[1408.25,802.75],[1408.25,802.75],[1411.5,800.0],[1411.5,800.0],[1411.5,800.0],[1411.75,795.75],[1411.75,795.75],[1411.75,795.75],[1416.25,791.75],[1416.25,791.75],[1416.25,791.75],[1422.33,791.33],[1422.33,791.33],[1422.33,791.33],[1424.0,779.0],[1424.0,779.0],[1424.0,779.0],[1421.67,770.33],[1421.67,770.33],[1421.67,770.33],[1421.67,752.67],[1421.67,752.67],[1421.67,752.67],[1429.0,747.33],[1429.0,747.33],[1429.0,747.33],[1433.0,748.0],[1433.0,748.0],[1433.0,748.0],[1439.33,736.67],[1439.33,736.67],[1439.33,736.67],[1441.0,722.67],[1441.0,722.67],[1441.0,722.67],[1447.67,714.0],[1447.67,714.0],[1447.67,714.0],[1447.67,710.67],[1447.67,710.67],[1447.67,710.67],[1455.0,701.0],[1455.0,701.0],[1455.0,701.0],[1463.0,699.67],[1463.0,699.67],[1463.0,699.67],[1470.33,697.0],[1470.33,697.0],[1470.33,697.0],[1472.67,687.33],[1472.67,687.33],[1472.67,687.33],[1475.33,683.33],[1475.33,683.33],[1475.33,683.33],[1475.33,676.33],[1475.33,676.33],[1475.33,676.33],[1471.33,670.0],[1471.33,670.0],[1471.33,670.0],[1471.0,665.67],[1471.0,665.67],[1471.0,665.67],[1463.33,654.67],[1463.33,654.67],[1463.33,654.67],[1457.0,650.0],[1457.0,650.0],[1457.0,650.0],[1456.67,643.33],[1456.67,643.33],[1456.67,643.33],[1462.33,637.0],[1462.33,637.0],[1462.33,637.0],[1455.45,630.91],[1455.45,630.91]]],['anvala',[[1293.45,938.0],[1304.36,946.73],[1304.36,946.73],[1304.36,946.73],[1310.18,947.27],[1310.18,947.27],[1310.18,947.27],[1313.45,944.91],[1313.45,944.91],[1313.45,944.91],[1321.82,945.64],[1321.82,945.64],[1321.82,945.64],[1325.64,943.82],[1325.64,943.82],[1325.64,943.82],[1326.0,939.27],[1326.0,939.27],[1326.0,939.27],[1329.82,936.55],[1329.82,936.55],[1329.82,936.55],[1335.27,936.73],[1335.27,936.73],[1335.27,936.73],[1338.91,939.45],[1338.91,939.45],[1338.91,939.45],[1348.55,940.18],[1348.55,940.18],[1348.55,940.18],[1351.82,935.09],[1351.82,935.09],[1351.82,935.09],[1356.73,935.64],[1356.73,935.64],[1356.73,935.64],[1363.45,942.18],[1363.45,942.18],[1363.45,942.18],[1364.18,945.45],[1364.18,945.45],[1364.18,945.45],[1366.91,948.36],[1366.91,948.36],[1366.91,948.36],[1374.73,951.27],[1374.73,951.27],[1374.73,951.27],[1379.09,959.09],[1379.09,959.09],[1379.09,959.09],[1377.64,968.91],[1377.64,968.91],[1377.64,968.91],[1382.0,977.09],[1382.0,977.09],[1382.0,977.09],[1382.55,986.36],[1382.55,986.36],[1382.55,986.36],[1387.45,994.0],[1387.45,994.0],[1387.45,994.0],[1384.91,998.91],[1384.91,998.91],[1384.91,998.91],[1380.0,1002.36],[1380.0,1002.36],[1380.0,1002.36],[1384.18,1008.91],[1384.18,1008.91],[1384.18,1008.91],[1384.0,1017.64],[1384.0,1017.64],[1384.0,1017.64],[1380.36,1020.18],[1380.36,1020.18],[1380.36,1020.18],[1380.0,1023.27],[1380.0,1023.27],[1380.0,1023.27],[1386.18,1023.64],[1386.18,1023.64],[1386.18,1023.64],[1387.09,1029.82],[1387.09,1029.82],[1387.09,1029.82],[1391.12,1031.5],[1391.12,1031.5],[1391.12,1031.5],[1393.38,1027.12],[1393.38,1027.12],[1393.38,1027.12],[1399.12,1018.38],[1399.12,1018.38],[1399.12,1018.38],[1400.38,1010.0],[1400.38,1010.0],[1400.38,1010.0],[1406.62,1007.12],[1406.62,1007.12],[1406.62,1007.12],[1415.25,999.0],[1415.25,999.0],[1415.25,999.0],[1419.0,998.12],[1419.0,998.12],[1419.0,998.12],[1433.38,999.12],[1433.38,999.12],[1433.38,999.12],[1438.88,1001.88],[1438.88,1001.88],[1438.88,1001.88],[1445.38,1002.62],[1445.38,1002.62],[1445.38,1002.62],[1447.38,1003.88],[1447.38,1003.88],[1447.38,1003.88],[1453.38,1000.75],[1453.38,1000.75],[1453.38,1000.75],[1455.0,996.75],[1455.0,996.75],[1455.0,996.75],[1452.25,990.88],[1452.25,990.88],[1452.25,990.88],[1452.0,981.5],[1452.0,981.5],[1452.0,981.5],[1450.5,976.62],[1450.5,976.62],[1450.5,976.62],[1451.5,972.5],[1451.5,972.5],[1451.5,972.5],[1454.0,969.67],[1454.0,969.67],[1454.0,969.67],[1456.67,963.67],[1456.67,963.67],[1456.67,963.67],[1454.67,947.0],[1454.67,947.0],[1454.67,947.0],[1448.0,945.33],[1448.0,945.33],[1448.0,945.33],[1446.67,940.67],[1446.67,940.67],[1446.67,940.67],[1441.67,939.67],[1441.67,939.67],[1441.67,939.67],[1439.33,934.33],[1439.33,934.33],[1439.33,934.33],[1441.0,928.67],[1441.0,928.67],[1441.0,928.67],[1444.67,928.0],[1444.67,928.0],[1444.67,928.0],[1447.0,926.0],[1447.0,926.0],[1447.0,926.0],[1446.67,920.33],[1446.67,920.33],[1446.67,920.33],[1442.33,918.33],[1442.33,918.33],[1442.33,918.33],[1443.67,912.67],[1443.67,912.67],[1443.67,912.67],[1443.67,909.67],[1443.67,909.67],[1443.67,909.67],[1450.33,906.0],[1450.33,906.0],[1450.33,906.0],[1450.33,902.0],[1450.33,902.0],[1450.33,902.0],[1451.67,900.0],[1451.67,900.0],[1451.67,900.0],[1448.33,894.33],[1448.33,894.33],[1448.33,894.33],[1443.0,892.67],[1443.0,892.67],[1443.0,892.67],[1441.0,888.0],[1441.0,888.0],[1441.0,888.0],[1434.67,888.0],[1434.67,888.0],[1434.67,888.0],[1431.67,885.67],[1431.67,885.67],[1431.67,885.67],[1427.33,885.0],[1427.33,885.0],[1427.33,885.0],[1423.0,880.33],[1423.0,880.33],[1423.0,880.33],[1416.67,883.33],[1416.67,883.33],[1416.67,883.33],[1412.67,888.0],[1412.67,888.0],[1412.67,888.0],[1404.67,883.33],[1404.67,883.33],[1404.67,883.33],[1406.0,877.33],[1406.0,877.33],[1406.0,877.33],[1405.0,871.33],[1405.0,871.33],[1405.0,871.33],[1397.67,873.0],[1397.67,873.0],[1397.67,873.0],[1395.0,869.67],[1395.0,869.67],[1395.0,869.67],[1390.33,871.33],[1390.33,871.33],[1390.33,871.33],[1385.33,866.0],[1385.33,866.0],[1385.33,866.0],[1384.75,860.5],[1384.75,860.5],[1384.75,860.5],[1388.0,852.25],[1388.0,852.25],[1388.0,852.25],[1384.25,844.38],[1384.25,844.38],[1384.25,844.38],[1377.0,836.75],[1377.0,836.75],[1377.0,836.75],[1365.25,826.38],[1365.25,826.38],[1365.25,826.38],[1364.25,819.25],[1364.25,819.25],[1364.25,819.25],[1360.5,811.75],[1360.5,811.75],[1360.5,811.75],[1353.5,815.88],[1353.5,815.88],[1353.5,815.88],[1344.12,816.12],[1344.12,816.12],[1344.12,816.12],[1337.12,820.62],[1337.12,820.62],[1337.12,820.62],[1323.12,821.88],[1323.12,821.88],[1323.12,821.88],[1314.88,828.25],[1314.88,828.25],[1314.88,828.25],[1313.5,832.62],[1313.5,832.62],[1313.5,832.62],[1300.88,839.75],[1300.88,839.75],[1300.88,839.75],[1294.75,840.25],[1294.75,840.25],[1294.75,840.25],[1280.5,850.38],[1280.5,850.38],[1280.5,850.38],[1279.38,854.62],[1279.38,854.62],[1279.38,854.62],[1271.5,862.25],[1271.5,862.25],[1271.5,862.25],[1268.12,868.5],[1268.12,868.5],[1268.12,868.5],[1267.62,883.5],[1267.62,883.5],[1267.62,883.5],[1271.0,888.62],[1271.0,888.62],[1271.0,888.62],[1272.75,894.12],[1272.75,894.12],[1272.75,894.12],[1281.25,900.25],[1281.25,900.25],[1281.25,900.25],[1286.5,906.62],[1286.5,906.62],[1286.5,906.62],[1287.5,912.88],[1287.5,912.88],[1287.5,912.88],[1292.62,922.38],[1292.62,922.38],[1292.62,922.38],[1294.5,927.12],[1294.5,927.12],[1294.5,927.12],[1294.62,936.25],[1294.62,936.25],[1294.62,936.25],[1293.45,938.0],[1293.45,938.0]]],['urhal',[[1281.0,1084.5],[1288.0,1083.5],[1288.0,1083.5],[1288.0,1083.5],[1292.0,1080.75],[1292.0,1080.75],[1292.0,1080.75],[1295.5,1081.75],[1295.5,1081.75],[1295.5,1081.75],[1304.75,1086.5],[1304.75,1086.5],[1304.75,1086.5],[1312.25,1082.0],[1312.25,1082.0],[1312.25,1082.0],[1315.5,1083.5],[1315.5,1083.5],[1315.5,1083.5],[1320.0,1082.5],[1320.0,1082.5],[1320.0,1082.5],[1322.25,1077.5],[1322.25,1077.5],[1322.25,1077.5],[1326.25,1077.75],[1326.25,1077.75],[1326.25,1077.75],[1333.5,1083.75],[1333.5,1083.75],[1333.5,1083.75],[1340.5,1085.5],[1340.5,1085.5],[1340.5,1085.5],[1345.0,1083.62],[1345.0,1083.62],[1345.0,1083.62],[1345.75,1079.0],[1345.75,1079.0],[1345.75,1079.0],[1344.0,1075.75],[1344.0,1075.75],[1344.0,1075.75],[1348.12,1067.75],[1348.12,1067.75],[1348.12,1067.75],[1350.88,1067.12],[1350.88,1067.12],[1350.88,1067.12],[1354.75,1059.62],[1354.75,1059.62],[1354.75,1059.62],[1365.88,1056.75],[1365.88,1056.75],[1365.88,1056.75],[1377.12,1056.25],[1377.12,1056.25],[1377.12,1056.25],[1385.0,1050.88],[1385.0,1050.88],[1385.0,1050.88],[1385.75,1048.38],[1385.75,1048.38],[1385.75,1048.38],[1390.5,1040.5],[1390.5,1040.5],[1390.5,1040.5],[1391.12,1031.5],[1391.12,1031.5],[1391.12,1031.5],[1387.09,1029.82],[1387.09,1029.82],[1387.09,1029.82],[1386.18,1023.64],[1386.18,1023.64],[1386.18,1023.64],[1380.0,1023.27],[1380.0,1023.27],[1380.0,1023.27],[1380.36,1020.18],[1380.36,1020.18],[1380.36,1020.18],[1384.0,1017.64],[1384.0,1017.64],[1384.0,1017.64],[1384.18,1008.91],[1384.18,1008.91],[1384.18,1008.91],[1380.0,1002.36],[1380.0,1002.36],[1380.0,1002.36],[1384.91,998.91],[1384.91,998.91],[1384.91,998.91],[1387.45,994.0],[1387.45,994.0],[1387.45,994.0],[1382.55,986.36],[1382.55,986.36],[1382.55,986.36],[1382.0,977.09],[1382.0,977.09],[1382.0,977.09],[1377.64,968.91],[1377.64,968.91],[1377.64,968.91],[1379.09,959.09],[1379.09,959.09],[1379.09,959.09],[1374.73,951.27],[1374.73,951.27],[1374.73,951.27],[1366.91,948.36],[1366.91,948.36],[1366.91,948.36],[1364.18,945.45],[1364.18,945.45],[1364.18,945.45],[1363.45,942.18],[1363.45,942.18],[1363.45,942.18],[1356.73,935.64],[1356.73,935.64],[1356.73,935.64],[1351.82,935.09],[1351.82,935.09],[1351.82,935.09],[1348.55,940.18],[1348.55,940.18],[1348.55,940.18],[1338.91,939.45],[1338.91,939.45],[1338.91,939.45],[1335.27,936.73],[1335.27,936.73],[1335.27,936.73],[1329.82,936.55],[1329.82,936.55],[1329.82,936.55],[1326.0,939.27],[1326.0,939.27],[1326.0,939.27],[1325.64,943.82],[1325.64,943.82],[1325.64,943.82],[1321.82,945.64],[1321.82,945.64],[1321.82,945.64],[1313.45,944.91],[1313.45,944.91],[1313.45,944.91],[1310.18,947.27],[1310.18,947.27],[1310.18,947.27],[1304.36,946.73],[1304.36,946.73],[1304.36,946.73],[1293.45,938.0],[1293.45,938.0],[1293.45,938.0],[1288.91,941.09],[1288.91,941.09],[1288.91,941.09],[1284.18,941.45],[1284.18,941.45],[1284.18,941.45],[1280.0,944.91],[1280.0,944.91],[1280.0,944.91],[1268.0,945.64],[1268.0,945.64],[1268.0,945.64],[1261.64,949.64],[1261.64,949.64],[1261.64,949.64],[1260.73,952.55],[1260.73,952.55],[1260.73,952.55],[1254.55,957.45],[1254.55,957.45],[1254.55,957.45],[1251.45,964.73],[1251.45,964.73],[1251.45,964.73],[1242.0,973.64],[1242.0,973.64],[1242.0,973.64],[1238.75,981.75],[1238.75,981.75],[1238.75,981.75],[1236.75,985.0],[1236.75,985.0],[1236.75,985.0],[1233.0,990.5],[1233.0,990.5],[1233.0,990.5],[1232.82,996.09],[1232.82,996.09],[1232.82,996.09],[1230.82,999.27],[1230.82,999.27],[1230.82,999.27],[1231.09,1005.27],[1231.09,1005.27],[1231.09,1005.27],[1237.09,1015.55],[1237.09,1015.55],[1237.09,1015.55],[1239.64,1016.64],[1239.64,1016.64],[1239.64,1016.64],[1245.91,1024.64],[1245.91,1024.64],[1245.91,1024.64],[1253.73,1025.45],[1253.73,1025.45],[1253.73,1025.45],[1259.18,1030.27],[1259.18,1030.27],[1259.18,1030.27],[1261.82,1036.73],[1261.82,1036.73],[1261.82,1036.73],[1261.73,1044.0],[1261.73,1044.0],[1261.73,1044.0],[1260.27,1048.0],[1260.27,1048.0],[1260.27,1048.0],[1263.09,1056.18],[1263.09,1056.18],[1263.09,1056.18],[1258.18,1065.18],[1258.18,1065.18],[1258.18,1065.18],[1258.45,1069.0],[1258.45,1069.0],[1258.45,1069.0],[1266.45,1072.82],[1266.45,1072.82],[1266.45,1072.82],[1273.45,1076.82],[1273.45,1076.82],[1273.45,1076.82],[1279.55,1080.18],[1279.55,1080.18],[1279.55,1080.18],[1281.0,1084.5],[1281.0,1084.5]]],['lordsLeap',[[1301.25,1232.5],[1304.5,1229.75],[1304.5,1229.75],[1304.5,1229.75],[1308.75,1230.0],[1308.75,1230.0],[1308.75,1230.0],[1313.75,1228.5],[1313.75,1228.5],[1313.75,1228.5],[1317.25,1228.75],[1317.25,1228.75],[1317.25,1228.75],[1323.25,1224.75],[1323.25,1224.75],[1323.25,1224.75],[1321.75,1216.5],[1321.75,1216.5],[1321.75,1216.5],[1319.25,1212.25],[1319.25,1212.25],[1319.25,1212.25],[1323.75,1208.5],[1323.75,1208.5],[1323.75,1208.5],[1331.25,1212.5],[1331.25,1212.5],[1331.25,1212.5],[1339.0,1209.75],[1339.0,1209.75],[1339.0,1209.75],[1340.75,1205.25],[1340.75,1205.25],[1340.75,1205.25],[1349.25,1200.75],[1349.25,1200.75],[1349.25,1200.75],[1355.0,1195.25],[1355.0,1195.25],[1355.0,1195.25],[1359.25,1189.5],[1359.25,1189.5],[1359.25,1189.5],[1367.75,1187.5],[1367.75,1187.5],[1367.75,1187.5],[1371.25,1184.75],[1371.25,1184.75],[1371.25,1184.75],[1371.25,1180.5],[1371.25,1180.5],[1371.25,1180.5],[1370.25,1175.75],[1370.25,1175.75],[1370.25,1175.75],[1372.75,1173.5],[1372.75,1173.5],[1372.75,1173.5],[1374.0,1170.0],[1374.0,1170.0],[1374.0,1170.0],[1376.25,1170.25],[1376.25,1170.25],[1376.25,1170.25],[1376.5,1164.88],[1376.5,1164.88],[1376.5,1164.88],[1373.62,1161.75],[1373.62,1161.75],[1373.62,1161.75],[1383.75,1146.0],[1383.75,1146.0],[1383.75,1146.0],[1382.25,1136.25],[1382.25,1136.25],[1382.25,1136.25],[1386.62,1128.25],[1386.62,1128.25],[1386.62,1128.25],[1386.38,1118.38],[1386.38,1118.38],[1386.38,1118.38],[1375.25,1107.5],[1375.25,1107.5],[1375.25,1107.5],[1369.38,1100.88],[1369.38,1100.88],[1369.38,1100.88],[1362.38,1100.75],[1362.38,1100.75],[1362.38,1100.75],[1355.38,1104.62],[1355.38,1104.62],[1355.38,1104.62],[1352.62,1102.5],[1352.62,1102.5],[1352.62,1102.5],[1344.88,1101.25],[1344.88,1101.25],[1344.88,1101.25],[1347.62,1094.88],[1347.62,1094.88],[1347.62,1094.88],[1340.75,1084.88],[1340.75,1084.88],[1340.75,1084.88],[1333.5,1083.75],[1333.5,1083.75],[1333.5,1083.75],[1326.25,1077.75],[1326.25,1077.75],[1326.25,1077.75],[1322.25,1077.5],[1322.25,1077.5],[1322.25,1077.5],[1320.0,1082.5],[1320.0,1082.5],[1320.0,1082.5],[1315.5,1083.5],[1315.5,1083.5],[1315.5,1083.5],[1312.25,1082.0],[1312.25,1082.0],[1312.25,1082.0],[1304.75,1086.5],[1304.75,1086.5],[1304.75,1086.5],[1295.5,1081.75],[1295.5,1081.75],[1295.5,1081.75],[1292.0,1080.75],[1292.0,1080.75],[1292.0,1080.75],[1288.0,1083.5],[1288.0,1083.5],[1288.0,1083.5],[1281.0,1084.5],[1281.0,1084.5],[1281.0,1084.5],[1280.25,1088.5],[1280.25,1088.5],[1280.25,1088.5],[1275.75,1094.25],[1275.75,1094.25],[1275.75,1094.25],[1269.75,1100.5],[1269.75,1100.5],[1269.75,1100.5],[1263.0,1107.75],[1263.0,1107.75],[1263.0,1107.75],[1259.25,1117.75],[1259.25,1117.75],[1259.25,1117.75],[1257.0,1124.75],[1257.0,1124.75],[1257.0,1124.75],[1253.5,1134.5],[1253.5,1134.5],[1253.5,1134.5],[1246.25,1139.25],[1246.25,1139.25],[1246.25,1139.25],[1246.0,1144.75],[1246.0,1144.75],[1246.0,1144.75],[1247.5,1149.0],[1247.5,1149.0],[1247.5,1149.0],[1247.5,1162.25],[1247.5,1162.25],[1247.5,1162.25],[1242.25,1170.25],[1242.25,1170.25],[1242.25,1170.25],[1230.5,1186.25],[1230.5,1186.25],[1230.5,1186.25],[1222.5,1188.5],[1222.5,1188.5],[1222.5,1188.5],[1218.75,1190.75],[1218.75,1190.75],[1218.75,1190.75],[1215.75,1196.25],[1215.75,1196.25],[1215.75,1196.25],[1211.25,1197.25],[1211.25,1197.25],[1211.25,1197.25],[1203.5,1204.25],[1203.5,1204.25],[1203.5,1204.25],[1198.0,1210.75],[1198.0,1210.75],[1198.0,1210.75],[1198.5,1220.75],[1198.5,1220.75],[1198.5,1220.75],[1196.25,1223.75],[1196.25,1223.75],[1196.25,1223.75],[1196.25,1227.0],[1196.25,1227.0],[1196.25,1227.0],[1203.0,1230.0],[1203.0,1230.0],[1203.0,1230.0],[1203.5,1236.25],[1203.5,1236.25],[1203.5,1236.25],[1201.0,1239.75],[1201.0,1239.75],[1201.0,1239.75],[1201.75,1243.25],[1201.75,1243.25],[1201.75,1243.25],[1204.25,1244.75],[1204.25,1244.75],[1204.25,1244.75],[1204.5,1250.0],[1204.5,1250.0],[1204.5,1250.0],[1209.75,1252.0],[1209.75,1252.0],[1209.75,1252.0],[1211.88,1255.88],[1211.88,1255.88],[1211.88,1255.88],[1215.88,1251.75],[1215.88,1251.75],[1215.88,1251.75],[1223.0,1246.12],[1223.0,1246.12],[1223.0,1246.12],[1228.38,1245.25],[1228.38,1245.25],[1228.38,1245.25],[1228.62,1241.0],[1228.62,1241.0],[1228.62,1241.0],[1225.0,1237.75],[1225.0,1237.75],[1225.0,1237.75],[1224.88,1233.5],[1224.88,1233.5],[1224.88,1233.5],[1222.75,1230.88],[1222.75,1230.88],[1222.75,1230.88],[1223.25,1227.0],[1223.25,1227.0],[1223.25,1227.0],[1229.88,1229.88],[1229.88,1229.88],[1229.88,1229.88],[1230.12,1234.25],[1230.12,1234.25],[1230.12,1234.25],[1236.12,1236.25],[1236.12,1236.25],[1236.12,1236.25],[1240.62,1241.12],[1240.62,1241.12],[1240.62,1241.12],[1245.88,1237.62],[1245.88,1237.62],[1245.88,1237.62],[1246.0,1242.25],[1246.0,1242.25],[1246.0,1242.25],[1255.0,1242.12],[1255.0,1242.12],[1255.0,1242.12],[1260.75,1245.12],[1260.75,1245.12],[1260.75,1245.12],[1265.62,1249.88],[1265.62,1249.88],[1265.62,1249.88],[1270.5,1244.5],[1270.5,1244.5],[1270.5,1244.5],[1270.88,1235.75],[1270.88,1235.75],[1270.88,1235.75],[1274.5,1228.0],[1274.5,1228.0],[1274.5,1228.0],[1265.75,1214.12],[1265.75,1214.12],[1265.75,1214.12],[1266.75,1196.62],[1266.75,1196.62],[1266.75,1196.62],[1267.25,1178.25],[1267.25,1178.25],[1267.25,1178.25],[1272.75,1172.12],[1272.75,1172.12],[1272.75,1172.12],[1276.25,1179.12],[1276.25,1179.12],[1276.25,1179.12],[1274.0,1183.12],[1274.0,1183.12],[1274.0,1183.12],[1274.38,1188.88],[1274.38,1188.88],[1274.38,1188.88],[1270.38,1193.38],[1270.38,1193.38],[1270.38,1193.38],[1276.62,1200.5],[1276.62,1200.5],[1276.62,1200.5],[1276.25,1204.88],[1276.25,1204.88],[1276.25,1204.88],[1278.88,1207.38],[1278.88,1207.38],[1278.88,1207.38],[1276.75,1210.38],[1276.75,1210.38],[1276.75,1210.38],[1279.0,1213.75],[1279.0,1213.75],[1279.0,1213.75],[1282.88,1215.25],[1282.88,1215.25],[1282.88,1215.25],[1285.75,1214.25],[1285.75,1214.25],[1285.75,1214.25],[1287.5,1215.5],[1287.5,1215.5],[1287.5,1215.5],[1287.5,1218.12],[1287.5,1218.12],[1287.5,1218.12],[1283.5,1219.25],[1283.5,1219.25],[1283.5,1219.25],[1287.62,1222.88],[1287.62,1222.88],[1287.62,1222.88],[1283.88,1229.0],[1283.88,1229.0],[1283.88,1229.0],[1284.38,1232.75],[1284.38,1232.75],[1284.38,1232.75],[1289.75,1231.75],[1289.75,1231.75],[1289.75,1231.75],[1294.75,1230.0],[1294.75,1230.0],[1294.75,1230.0],[1299.38,1226.75],[1299.38,1226.75],[1299.38,1226.75],[1301.25,1232.5],[1301.25,1232.5]]],['glowwater',[[1376.25,1170.25],[1374.0,1170.0],[1374.0,1170.0],[1374.0,1170.0],[1372.75,1173.5],[1372.75,1173.5],[1372.75,1173.5],[1370.25,1175.75],[1370.25,1175.75],[1370.25,1175.75],[1371.25,1180.5],[1371.25,1180.5],[1371.25,1180.5],[1371.25,1184.75],[1371.25,1184.75],[1371.25,1184.75],[1367.75,1187.5],[1367.75,1187.5],[1367.75,1187.5],[1359.25,1189.5],[1359.25,1189.5],[1359.25,1189.5],[1355.0,1195.25],[1355.0,1195.25],[1355.0,1195.25],[1349.25,1200.75],[1349.25,1200.75],[1349.25,1200.75],[1340.75,1205.25],[1340.75,1205.25],[1340.75,1205.25],[1339.0,1209.75],[1339.0,1209.75],[1339.0,1209.75],[1331.25,1212.5],[1331.25,1212.5],[1331.25,1212.5],[1323.75,1208.5],[1323.75,1208.5],[1323.75,1208.5],[1319.25,1212.25],[1319.25,1212.25],[1319.25,1212.25],[1321.75,1216.5],[1321.75,1216.5],[1321.75,1216.5],[1323.25,1224.75],[1323.25,1224.75],[1323.25,1224.75],[1317.25,1228.75],[1317.25,1228.75],[1317.25,1228.75],[1313.75,1228.5],[1313.75,1228.5],[1313.75,1228.5],[1308.75,1230.0],[1308.75,1230.0],[1308.75,1230.0],[1304.5,1229.75],[1304.5,1229.75],[1304.5,1229.75],[1301.25,1232.5],[1301.25,1232.5],[1301.25,1232.5],[1299.5,1238.25],[1299.5,1238.25],[1299.5,1238.25],[1294.75,1239.75],[1294.75,1239.75],[1294.75,1239.75],[1291.5,1245.75],[1291.5,1245.75],[1291.5,1245.75],[1288.5,1253.25],[1288.5,1253.25],[1288.5,1253.25],[1280.75,1257.5],[1280.75,1257.5],[1280.75,1257.5],[1281.5,1271.75],[1281.5,1271.75],[1281.5,1271.75],[1288.25,1282.5],[1288.25,1282.5],[1288.25,1282.5],[1291.5,1290.75],[1291.5,1290.75],[1291.5,1290.75],[1295.0,1290.5],[1295.0,1290.5],[1295.0,1290.5],[1303.25,1288.25],[1303.25,1288.25],[1303.25,1288.25],[1307.25,1282.25],[1307.25,1282.25],[1307.25,1282.25],[1309.5,1273.5],[1309.5,1273.5],[1309.5,1273.5],[1316.25,1270.25],[1316.25,1270.25],[1316.25,1270.25],[1321.75,1264.0],[1321.75,1264.0],[1321.75,1264.0],[1323.5,1266.25],[1323.5,1266.25],[1323.5,1266.25],[1327.5,1266.25],[1327.5,1266.25],[1327.5,1266.25],[1333.75,1264.0],[1333.75,1264.0],[1333.75,1264.0],[1333.25,1256.5],[1333.25,1256.5],[1333.25,1256.5],[1337.0,1255.5],[1337.0,1255.5],[1337.0,1255.5],[1339.5,1259.5],[1339.5,1259.5],[1339.5,1259.5],[1344.75,1262.5],[1344.75,1262.5],[1344.75,1262.5],[1342.25,1267.75],[1342.25,1267.75],[1342.25,1267.75],[1342.25,1271.0],[1342.25,1271.0],[1342.25,1271.0],[1341.0,1274.75],[1341.0,1274.75],[1341.0,1274.75],[1336.75,1275.75],[1336.75,1275.75],[1336.75,1275.75],[1337.25,1278.75],[1337.25,1278.75],[1337.25,1278.75],[1339.25,1280.0],[1339.25,1280.0],[1339.25,1280.0],[1351.5,1281.25],[1351.5,1281.25],[1351.5,1281.25],[1353.5,1284.0],[1353.5,1284.0],[1353.5,1284.0],[1357.5,1287.0],[1357.5,1287.0],[1357.5,1287.0],[1368.0,1288.0],[1368.0,1288.0],[1368.0,1288.0],[1371.0,1291.25],[1371.0,1291.25],[1371.0,1291.25],[1375.25,1289.25],[1375.25,1289.25],[1375.25,1289.25],[1375.25,1284.5],[1375.25,1284.5],[1375.25,1284.5],[1374.0,1281.5],[1374.0,1281.5],[1374.0,1281.5],[1370.75,1278.0],[1370.75,1278.0],[1370.75,1278.0],[1372.25,1273.0],[1372.25,1273.0],[1372.25,1273.0],[1377.25,1270.75],[1377.25,1270.75],[1377.25,1270.75],[1376.75,1266.75],[1376.75,1266.75],[1376.75,1266.75],[1379.0,1263.5],[1379.0,1263.5],[1379.0,1263.5],[1376.25,1258.75],[1376.25,1258.75],[1376.25,1258.75],[1370.75,1256.75],[1370.75,1256.75],[1370.75,1256.75],[1370.75,1252.5],[1370.75,1252.5],[1370.75,1252.5],[1372.25,1248.75],[1372.25,1248.75],[1372.25,1248.75],[1370.5,1246.0],[1370.5,1246.0],[1370.5,1246.0],[1370.75,1239.25],[1370.75,1239.25],[1370.75,1239.25],[1367.5,1234.75],[1367.5,1234.75],[1367.5,1234.75],[1369.75,1229.0],[1369.75,1229.0],[1369.75,1229.0],[1365.75,1224.5],[1365.75,1224.5],[1365.75,1224.5],[1364.75,1220.25],[1364.75,1220.25],[1364.75,1220.25],[1371.0,1219.25],[1371.0,1219.25],[1371.0,1219.25],[1372.75,1222.75],[1372.75,1222.75],[1372.75,1222.75],[1376.5,1221.25],[1376.5,1221.25],[1376.5,1221.25],[1376.5,1224.25],[1376.5,1224.25],[1376.5,1224.25],[1381.25,1224.25],[1381.25,1224.25],[1381.25,1224.25],[1382.5,1230.75],[1382.5,1230.75],[1382.5,1230.75],[1387.5,1231.5],[1387.5,1231.5],[1387.5,1231.5],[1388.0,1235.75],[1388.0,1235.75],[1388.0,1235.75],[1392.25,1238.5],[1392.25,1238.5],[1392.25,1238.5],[1397.25,1241.0],[1397.25,1241.0],[1397.25,1241.0],[1398.25,1244.0],[1398.25,1244.0],[1398.25,1244.0],[1401.0,1247.0],[1401.0,1247.0],[1401.0,1247.0],[1398.0,1250.75],[1398.0,1250.75],[1398.0,1250.75],[1397.75,1255.0],[1397.75,1255.0],[1397.75,1255.0],[1402.75,1260.0],[1402.75,1260.0],[1402.75,1260.0],[1403.75,1263.75],[1403.75,1263.75],[1403.75,1263.75],[1407.5,1264.25],[1407.5,1264.25],[1407.5,1264.25],[1410.0,1260.75],[1410.0,1260.75],[1410.0,1260.75],[1414.5,1260.0],[1414.5,1260.0],[1414.5,1260.0],[1416.25,1258.0],[1416.25,1258.0],[1416.25,1258.0],[1420.0,1258.5],[1420.0,1258.5],[1420.0,1258.5],[1420.0,1262.25],[1420.0,1262.25],[1420.0,1262.25],[1415.5,1267.75],[1415.5,1267.75],[1415.5,1267.75],[1416.75,1278.25],[1416.75,1278.25],[1416.75,1278.25],[1421.75,1280.0],[1421.75,1280.0],[1421.75,1280.0],[1422.25,1286.5],[1422.25,1286.5],[1422.25,1286.5],[1426.0,1288.25],[1426.0,1288.25],[1426.0,1288.25],[1427.75,1284.25],[1427.75,1284.25],[1427.75,1284.25],[1433.25,1284.0],[1433.25,1284.0],[1433.25,1284.0],[1433.5,1281.75],[1433.5,1281.75],[1433.5,1281.75],[1431.5,1281.25],[1431.5,1281.25],[1431.5,1281.25],[1430.75,1276.5],[1430.75,1276.5],[1430.75,1276.5],[1427.5,1276.25],[1427.5,1276.25],[1427.5,1276.25],[1427.5,1272.5],[1427.5,1272.5],[1427.5,1272.5],[1431.75,1272.25],[1431.75,1272.25],[1431.75,1272.25],[1430.75,1267.75],[1430.75,1267.75],[1430.75,1267.75],[1434.75,1264.25],[1434.75,1264.25],[1434.75,1264.25],[1436.5,1261.25],[1436.5,1261.25],[1436.5,1261.25],[1443.0,1262.0],[1443.0,1262.0],[1443.0,1262.0],[1445.0,1258.5],[1445.0,1258.5],[1445.0,1258.5],[1442.75,1252.75],[1442.75,1252.75],[1442.75,1252.75],[1445.75,1251.75],[1445.75,1251.75],[1445.75,1251.75],[1450.5,1248.0],[1450.5,1248.0],[1450.5,1248.0],[1454.5,1247.75],[1454.5,1247.75],[1454.5,1247.75],[1458.5,1251.0],[1458.5,1251.0],[1458.5,1251.0],[1463.5,1249.5],[1463.5,1249.5],[1463.5,1249.5],[1465.25,1244.25],[1465.25,1244.25],[1465.25,1244.25],[1463.75,1241.0],[1463.75,1241.0],[1463.75,1241.0],[1457.5,1241.25],[1457.5,1241.25],[1457.5,1241.25],[1456.75,1234.5],[1456.75,1234.5],[1456.75,1234.5],[1452.5,1229.0],[1452.5,1229.0],[1452.5,1229.0],[1452.5,1225.75],[1452.5,1225.75],[1452.5,1225.75],[1447.75,1219.75],[1447.75,1219.75],[1447.75,1219.75],[1442.0,1220.25],[1442.0,1220.25],[1442.0,1220.25],[1437.5,1225.25],[1437.5,1225.25],[1437.5,1225.25],[1433.0,1222.5],[1433.0,1222.5],[1433.0,1222.5],[1432.5,1211.25],[1432.5,1211.25],[1432.5,1211.25],[1436.0,1205.25],[1436.0,1205.25],[1436.0,1205.25],[1437.25,1201.5],[1437.25,1201.5],[1437.25,1201.5],[1441.25,1201.25],[1441.25,1201.25],[1441.25,1201.25],[1445.5,1205.75],[1445.5,1205.75],[1445.5,1205.75],[1447.25,1202.75],[1447.25,1202.75],[1447.25,1202.75],[1445.5,1199.25],[1445.5,1199.25],[1445.5,1199.25],[1447.5,1196.0],[1447.5,1196.0],[1447.5,1196.0],[1455.75,1197.5],[1455.75,1197.5],[1455.75,1197.5],[1462.75,1203.25],[1462.75,1203.25],[1462.75,1203.25],[1467.25,1201.25],[1467.25,1201.25],[1467.25,1201.25],[1476.25,1202.5],[1476.25,1202.5],[1476.25,1202.5],[1485.25,1198.25],[1485.25,1198.25],[1485.25,1198.25],[1489.75,1194.5],[1489.75,1194.5],[1489.75,1194.5],[1493.75,1195.75],[1493.75,1195.75],[1493.75,1195.75],[1497.75,1193.25],[1497.75,1193.25],[1497.75,1193.25],[1505.75,1192.5],[1505.75,1192.5],[1505.75,1192.5],[1513.25,1183.0],[1513.25,1183.0],[1513.25,1183.0],[1518.75,1182.25],[1518.75,1182.25],[1518.75,1182.25],[1526.0,1174.25],[1526.0,1174.25],[1526.0,1174.25],[1527.0,1170.25],[1527.0,1170.25],[1527.0,1170.25],[1528.75,1164.75],[1528.75,1164.75],[1528.75,1164.75],[1528.5,1152.75],[1528.5,1152.75],[1528.5,1152.75],[1532.0,1148.0],[1532.0,1148.0],[1532.0,1148.0],[1528.5,1143.0],[1528.5,1143.0],[1528.5,1143.0],[1522.5,1142.75],[1522.5,1142.75],[1522.5,1142.75],[1522.5,1140.0],[1522.5,1140.0],[1522.5,1140.0],[1518.0,1133.75],[1518.0,1133.75],[1518.0,1133.75],[1514.5,1135.0],[1514.5,1135.0],[1514.5,1135.0],[1508.25,1128.5],[1508.25,1128.5],[1508.25,1128.5],[1507.5,1123.0],[1507.5,1123.0],[1507.5,1123.0],[1504.75,1118.75],[1504.75,1118.75],[1504.75,1118.75],[1501.75,1118.75],[1501.75,1118.75],[1501.75,1118.75],[1500.25,1116.0],[1500.25,1116.0],[1500.25,1116.0],[1501.25,1111.25],[1501.25,1111.25],[1501.25,1111.25],[1495.0,1109.25],[1495.0,1109.25],[1495.0,1109.25],[1490.75,1107.5],[1490.75,1107.5],[1490.75,1107.5],[1484.25,1109.0],[1484.25,1109.0],[1484.25,1109.0],[1483.25,1107.0],[1483.25,1107.0],[1483.25,1107.0],[1481.75,1108.0],[1481.75,1108.0],[1481.75,1108.0],[1477.5,1104.5],[1477.5,1104.5],[1477.5,1104.5],[1472.0,1104.25],[1472.0,1104.25],[1472.0,1104.25],[1472.25,1100.25],[1472.25,1100.25],[1472.25,1100.25],[1470.0,1099.25],[1470.0,1099.25],[1470.0,1099.25],[1470.5,1093.88],[1470.5,1093.88],[1470.5,1093.88],[1466.25,1092.88],[1466.25,1092.88],[1466.25,1092.88],[1462.0,1096.38],[1462.0,1096.38],[1462.0,1096.38],[1461.88,1104.25],[1461.88,1104.25],[1461.88,1104.25],[1466.25,1110.25],[1466.25,1110.25],[1466.25,1110.25],[1460.75,1116.75],[1460.75,1116.75],[1460.75,1116.75],[1466.25,1122.38],[1466.25,1122.38],[1466.25,1122.38],[1464.25,1130.5],[1464.25,1130.5],[1464.25,1130.5],[1457.38,1139.12],[1457.38,1139.12],[1457.38,1139.12],[1456.62,1146.12],[1456.62,1146.12],[1456.62,1146.12],[1453.0,1148.0],[1453.0,1148.0],[1453.0,1148.0],[1453.88,1153.62],[1453.88,1153.62],[1453.88,1153.62],[1453.25,1160.88],[1453.25,1160.88],[1453.25,1160.88],[1447.5,1163.5],[1447.5,1163.5],[1447.5,1163.5],[1442.38,1159.5],[1442.38,1159.5],[1442.38,1159.5],[1429.38,1156.5],[1429.38,1156.5],[1429.38,1156.5],[1426.38,1148.0],[1426.38,1148.0],[1426.38,1148.0],[1419.0,1148.0],[1419.0,1148.0],[1419.0,1148.0],[1416.38,1157.25],[1416.38,1157.25],[1416.38,1157.25],[1411.25,1163.12],[1411.25,1163.12],[1411.25,1163.12],[1410.75,1167.62],[1410.75,1167.62],[1410.75,1167.62],[1404.0,1170.38],[1404.0,1170.38],[1404.0,1170.38],[1394.75,1170.25],[1394.75,1170.25],[1394.75,1170.25],[1387.62,1166.25],[1387.62,1166.25],[1387.62,1166.25],[1376.5,1164.88],[1376.5,1164.88],[1376.5,1164.88],[1376.25,1170.25],[1376.25,1170.25]]],['northlake',[[1454.0,969.67],[1456.0,973.67],[1456.0,973.67],[1456.0,973.67],[1461.0,979.67],[1461.0,979.67],[1461.0,979.67],[1462.67,989.0],[1462.67,989.0],[1462.67,989.0],[1464.33,1000.67],[1464.33,1000.67],[1464.33,1000.67],[1468.67,1007.0],[1468.67,1007.0],[1468.67,1007.0],[1471.33,1014.33],[1471.33,1014.33],[1471.33,1014.33],[1471.0,1021.33],[1471.0,1021.33],[1471.0,1021.33],[1463.67,1029.67],[1463.67,1029.67],[1463.67,1029.67],[1463.67,1034.0],[1463.67,1034.0],[1463.67,1034.0],[1462.67,1037.0],[1462.67,1037.0],[1462.67,1037.0],[1459.33,1041.0],[1459.33,1041.0],[1459.33,1041.0],[1459.0,1045.0],[1459.0,1045.0],[1459.0,1045.0],[1462.0,1050.33],[1462.0,1050.33],[1462.0,1050.33],[1467.67,1055.67],[1467.67,1055.67],[1467.67,1055.67],[1469.0,1060.0],[1469.0,1060.0],[1469.0,1060.0],[1466.67,1064.67],[1466.67,1064.67],[1466.67,1064.67],[1471.0,1070.33],[1471.0,1070.33],[1471.0,1070.33],[1470.67,1081.0],[1470.67,1081.0],[1470.67,1081.0],[1472.33,1085.33],[1472.33,1085.33],[1472.33,1085.33],[1470.5,1093.88],[1470.5,1093.88],[1470.5,1093.88],[1466.25,1092.88],[1466.25,1092.88],[1466.25,1092.88],[1462.0,1096.38],[1462.0,1096.38],[1462.0,1096.38],[1461.88,1104.25],[1461.88,1104.25],[1461.88,1104.25],[1466.25,1110.25],[1466.25,1110.25],[1466.25,1110.25],[1460.75,1116.75],[1460.75,1116.75],[1460.75,1116.75],[1466.25,1122.38],[1466.25,1122.38],[1466.25,1122.38],[1464.25,1130.5],[1464.25,1130.5],[1464.25,1130.5],[1457.38,1139.12],[1457.38,1139.12],[1457.38,1139.12],[1456.62,1146.12],[1456.62,1146.12],[1456.62,1146.12],[1453.0,1148.0],[1453.0,1148.0],[1453.0,1148.0],[1453.88,1153.62],[1453.88,1153.62],[1453.88,1153.62],[1453.25,1160.88],[1453.25,1160.88],[1453.25,1160.88],[1447.5,1163.5],[1447.5,1163.5],[1447.5,1163.5],[1442.38,1159.5],[1442.38,1159.5],[1442.38,1159.5],[1429.38,1156.5],[1429.38,1156.5],[1429.38,1156.5],[1426.38,1148.0],[1426.38,1148.0],[1426.38,1148.0],[1419.0,1148.0],[1419.0,1148.0],[1419.0,1148.0],[1416.38,1157.25],[1416.38,1157.25],[1416.38,1157.25],[1411.25,1163.12],[1411.25,1163.12],[1411.25,1163.12],[1410.75,1167.62],[1410.75,1167.62],[1410.75,1167.62],[1404.0,1170.38],[1404.0,1170.38],[1404.0,1170.38],[1394.75,1170.25],[1394.75,1170.25],[1394.75,1170.25],[1387.62,1166.25],[1387.62,1166.25],[1387.62,1166.25],[1376.5,1164.88],[1376.5,1164.88],[1376.5,1164.88],[1373.62,1161.75],[1373.62,1161.75],[1373.62,1161.75],[1383.75,1146.0],[1383.75,1146.0],[1383.75,1146.0],[1382.25,1136.25],[1382.25,1136.25],[1382.25,1136.25],[1386.62,1128.25],[1386.62,1128.25],[1386.62,1128.25],[1386.38,1118.38],[1386.38,1118.38],[1386.38,1118.38],[1375.25,1107.5],[1375.25,1107.5],[1375.25,1107.5],[1369.38,1100.88],[1369.38,1100.88],[1369.38,1100.88],[1362.38,1100.75],[1362.38,1100.75],[1362.38,1100.75],[1355.38,1104.62],[1355.38,1104.62],[1355.38,1104.62],[1352.62,1102.5],[1352.62,1102.5],[1352.62,1102.5],[1344.88,1101.25],[1344.88,1101.25],[1344.88,1101.25],[1347.62,1094.88],[1347.62,1094.88],[1347.62,1094.88],[1340.75,1084.88],[1340.75,1084.88],[1340.75,1084.88],[1345.0,1083.62],[1345.0,1083.62],[1345.0,1083.62],[1345.75,1079.0],[1345.75,1079.0],[1345.75,1079.0],[1344.0,1075.75],[1344.0,1075.75],[1344.0,1075.75],[1348.12,1067.75],[1348.12,1067.75],[1348.12,1067.75],[1350.88,1067.12],[1350.88,1067.12],[1350.88,1067.12],[1354.75,1059.62],[1354.75,1059.62],[1354.75,1059.62],[1365.88,1056.75],[1365.88,1056.75],[1365.88,1056.75],[1377.12,1056.25],[1377.12,1056.25],[1377.12,1056.25],[1385.0,1050.88],[1385.0,1050.88],[1385.0,1050.88],[1385.75,1048.38],[1385.75,1048.38],[1385.75,1048.38],[1390.5,1040.5],[1390.5,1040.5],[1390.5,1040.5],[1391.12,1031.5],[1391.12,1031.5],[1391.12,1031.5],[1393.38,1027.12],[1393.38,1027.12],[1393.38,1027.12],[1399.12,1018.38],[1399.12,1018.38],[1399.12,1018.38],[1400.38,1010.0],[1400.38,1010.0],[1400.38,1010.0],[1406.62,1007.12],[1406.62,1007.12],[1406.62,1007.12],[1415.25,999.0],[1415.25,999.0],[1415.25,999.0],[1419.0,998.12],[1419.0,998.12],[1419.0,998.12],[1433.38,999.12],[1433.38,999.12],[1433.38,999.12],[1438.88,1001.88],[1438.88,1001.88],[1438.88,1001.88],[1445.38,1002.62],[1445.38,1002.62],[1445.38,1002.62],[1447.38,1003.88],[1447.38,1003.88],[1447.38,1003.88],[1453.38,1000.75],[1453.38,1000.75],[1453.38,1000.75],[1455.0,996.75],[1455.0,996.75],[1455.0,996.75],[1452.25,990.88],[1452.25,990.88],[1452.25,990.88],[1452.0,981.5],[1452.0,981.5],[1452.0,981.5],[1450.5,976.62],[1450.5,976.62],[1450.5,976.62],[1451.5,972.5],[1451.5,972.5],[1451.5,972.5],[1454.0,969.67],[1454.0,969.67]]],['ulavaar',[[1416.25,791.75],[1411.75,795.75],[1411.75,795.75],[1411.75,795.75],[1411.5,800.0],[1411.5,800.0],[1411.5,800.0],[1408.25,802.75],[1408.25,802.75],[1408.25,802.75],[1408.75,807.0],[1408.75,807.0],[1408.75,807.0],[1414.5,809.75],[1414.5,809.75],[1414.5,809.75],[1415.25,815.5],[1415.25,815.5],[1415.25,815.5],[1409.0,817.5],[1409.0,817.5],[1409.0,817.5],[1404.25,815.25],[1404.25,815.25],[1404.25,815.25],[1396.5,823.75],[1396.5,823.75],[1396.5,823.75],[1401.0,828.75],[1401.0,828.75],[1401.0,828.75],[1401.5,831.5],[1401.5,831.5],[1401.5,831.5],[1405.5,837.75],[1405.5,837.75],[1405.5,837.75],[1401.25,839.25],[1401.25,839.25],[1401.25,839.25],[1398.75,844.75],[1398.75,844.75],[1398.75,844.75],[1394.0,847.25],[1394.0,847.25],[1394.0,847.25],[1391.5,852.25],[1391.5,852.25],[1391.5,852.25],[1388.0,852.25],[1388.0,852.25],[1388.0,852.25],[1384.75,860.5],[1384.75,860.5],[1384.75,860.5],[1385.33,866.0],[1385.33,866.0],[1385.33,866.0],[1390.33,871.33],[1390.33,871.33],[1390.33,871.33],[1395.0,869.67],[1395.0,869.67],[1395.0,869.67],[1397.67,873.0],[1397.67,873.0],[1397.67,873.0],[1405.0,871.33],[1405.0,871.33],[1405.0,871.33],[1406.0,877.33],[1406.0,877.33],[1406.0,877.33],[1404.67,883.33],[1404.67,883.33],[1404.67,883.33],[1412.67,888.0],[1412.67,888.0],[1412.67,888.0],[1416.67,883.33],[1416.67,883.33],[1416.67,883.33],[1423.0,880.33],[1423.0,880.33],[1423.0,880.33],[1427.33,885.0],[1427.33,885.0],[1427.33,885.0],[1431.67,885.67],[1431.67,885.67],[1431.67,885.67],[1434.67,888.0],[1434.67,888.0],[1434.67,888.0],[1441.0,888.0],[1441.0,888.0],[1441.0,888.0],[1443.0,892.67],[1443.0,892.67],[1443.0,892.67],[1448.33,894.33],[1448.33,894.33],[1448.33,894.33],[1451.67,900.0],[1451.67,900.0],[1451.67,900.0],[1450.33,902.0],[1450.33,902.0],[1450.33,902.0],[1450.33,906.0],[1450.33,906.0],[1450.33,906.0],[1443.67,909.67],[1443.67,909.67],[1443.67,909.67],[1443.67,912.67],[1443.67,912.67],[1443.67,912.67],[1442.33,918.33],[1442.33,918.33],[1442.33,918.33],[1446.67,920.33],[1446.67,920.33],[1446.67,920.33],[1447.0,926.0],[1447.0,926.0],[1447.0,926.0],[1444.67,928.0],[1444.67,928.0],[1444.67,928.0],[1441.0,928.67],[1441.0,928.67],[1441.0,928.67],[1439.33,934.33],[1439.33,934.33],[1439.33,934.33],[1441.67,939.67],[1441.67,939.67],[1441.67,939.67],[1446.67,940.67],[1446.67,940.67],[1446.67,940.67],[1448.0,945.33],[1448.0,945.33],[1448.0,945.33],[1454.67,947.0],[1454.67,947.0],[1454.67,947.0],[1456.67,963.67],[1456.67,963.67],[1456.67,963.67],[1454.0,969.67],[1454.0,969.67],[1454.0,969.67],[1456.0,973.67],[1456.0,973.67],[1456.0,973.67],[1461.0,979.67],[1461.0,979.67],[1461.0,979.67],[1462.67,989.0],[1462.67,989.0],[1462.67,989.0],[1464.33,1000.67],[1464.33,1000.67],[1464.33,1000.67],[1468.67,1007.0],[1468.67,1007.0],[1468.67,1007.0],[1471.33,1014.33],[1471.33,1014.33],[1471.33,1014.33],[1471.0,1021.33],[1471.0,1021.33],[1471.0,1021.33],[1463.67,1029.67],[1463.67,1029.67],[1463.67,1029.67],[1463.67,1034.0],[1463.67,1034.0],[1463.67,1034.0],[1462.67,1037.0],[1462.67,1037.0],[1462.67,1037.0],[1459.33,1041.0],[1459.33,1041.0],[1459.33,1041.0],[1459.0,1045.0],[1459.0,1045.0],[1459.0,1045.0],[1462.0,1050.33],[1462.0,1050.33],[1462.0,1050.33],[1467.67,1055.67],[1467.67,1055.67],[1467.67,1055.67],[1469.0,1060.0],[1469.0,1060.0],[1469.0,1060.0],[1466.67,1064.67],[1466.67,1064.67],[1466.67,1064.67],[1471.0,1070.33],[1471.0,1070.33],[1471.0,1070.33],[1470.67,1081.0],[1470.67,1081.0],[1470.67,1081.0],[1472.33,1085.33],[1472.33,1085.33],[1472.33,1085.33],[1475.67,1084.0],[1475.67,1084.0],[1475.67,1084.0],[1482.0,1084.0],[1482.0,1084.0],[1482.0,1084.0],[1486.33,1082.0],[1486.33,1082.0],[1486.33,1082.0],[1490.33,1083.67],[1490.33,1083.67],[1490.33,1083.67],[1495.67,1084.0],[1495.67,1084.0],[1495.67,1084.0],[1501.67,1085.0],[1501.67,1085.0],[1501.67,1085.0],[1503.0,1079.33],[1503.0,1079.33],[1503.0,1079.33],[1506.67,1082.67],[1506.67,1082.67],[1506.67,1082.67],[1511.0,1082.0],[1511.0,1082.0],[1511.0,1082.0],[1513.0,1085.0],[1513.0,1085.0],[1513.0,1085.0],[1517.33,1086.0],[1517.33,1086.0],[1517.33,1086.0],[1524.33,1091.0],[1524.33,1091.0],[1524.33,1091.0],[1529.67,1090.67],[1529.67,1090.67],[1529.67,1090.67],[1532.33,1085.67],[1532.33,1085.67],[1532.33,1085.67],[1533.33,1083.0],[1533.33,1083.0],[1533.33,1083.0],[1525.67,1076.0],[1525.67,1076.0],[1525.67,1076.0],[1521.0,1074.33],[1521.0,1074.33],[1521.0,1074.33],[1521.33,1071.0],[1521.33,1071.0],[1521.33,1071.0],[1528.33,1067.0],[1528.33,1067.0],[1528.33,1067.0],[1533.33,1063.33],[1533.33,1063.33],[1533.33,1063.33],[1533.33,1059.0],[1533.33,1059.0],[1533.33,1059.0],[1531.33,1055.33],[1531.33,1055.33],[1531.33,1055.33],[1526.0,1050.0],[1526.0,1050.0],[1526.0,1050.0],[1525.0,1043.33],[1525.0,1043.33],[1525.0,1043.33],[1528.67,1040.0],[1528.67,1040.0],[1528.67,1040.0],[1529.0,1033.67],[1529.0,1033.67],[1529.0,1033.67],[1535.67,1028.0],[1535.67,1028.0],[1535.67,1028.0],[1535.67,1021.67],[1535.67,1021.67],[1535.67,1021.67],[1532.0,1016.67],[1532.0,1016.67],[1532.0,1016.67],[1534.0,1010.0],[1534.0,1010.0],[1534.0,1010.0],[1530.67,1002.33],[1530.67,1002.33],[1530.67,1002.33],[1531.33,991.0],[1531.33,991.0],[1531.33,991.0],[1527.67,985.33],[1527.67,985.33],[1527.67,985.33],[1526.33,980.0],[1526.33,980.0],[1526.33,980.0],[1527.67,964.0],[1527.67,964.0],[1527.67,964.0],[1526.0,959.33],[1526.0,959.33],[1526.0,959.33],[1527.33,955.0],[1527.33,955.0],[1527.33,955.0],[1529.67,950.0],[1529.67,950.0],[1529.67,950.0],[1535.0,945.67],[1535.0,945.67],[1535.0,945.67],[1535.0,941.0],[1535.0,941.0],[1535.0,941.0],[1523.33,930.33],[1523.33,930.33],[1523.33,930.33],[1522.0,925.33],[1522.0,925.33],[1522.0,925.33],[1523.67,920.67],[1523.67,920.67],[1523.67,920.67],[1529.67,914.33],[1529.67,914.33],[1529.67,914.33],[1532.0,908.33],[1532.0,908.33],[1532.0,908.33],[1536.33,901.67],[1536.33,901.67],[1536.33,901.67],[1543.67,896.0],[1543.67,896.0],[1543.67,896.0],[1547.0,891.0],[1547.0,891.0],[1547.0,891.0],[1551.0,889.33],[1551.0,889.33],[1551.0,889.33],[1551.0,884.33],[1551.0,884.33],[1551.0,884.33],[1546.0,881.0],[1546.0,881.0],[1546.0,881.0],[1548.0,869.0],[1548.0,869.0],[1548.0,869.0],[1554.0,861.5],[1554.0,861.5],[1554.0,861.5],[1553.67,848.67],[1553.67,848.67],[1553.67,848.67],[1548.67,847.0],[1548.67,847.0],[1548.67,847.0],[1549.0,841.33],[1549.0,841.33],[1549.0,841.33],[1544.67,836.33],[1544.67,836.33],[1544.67,836.33],[1534.33,829.67],[1534.33,829.67],[1534.33,829.67],[1528.67,830.33],[1528.67,830.33],[1528.67,830.33],[1527.0,833.0],[1527.0,833.0],[1527.0,833.0],[1522.33,833.67],[1522.33,833.67],[1522.33,833.67],[1513.33,822.67],[1513.33,822.67],[1513.33,822.67],[1506.0,821.33],[1506.0,821.33],[1506.0,821.33],[1500.33,816.67],[1500.33,816.67],[1500.33,816.67],[1494.0,818.33],[1494.0,818.33],[1494.0,818.33],[1489.33,823.0],[1489.33,823.0],[1489.33,823.0],[1485.0,820.67],[1485.0,820.67],[1485.0,820.67],[1478.67,824.0],[1478.67,824.0],[1478.67,824.0],[1471.33,820.0],[1471.33,820.0],[1471.33,820.0],[1468.33,825.0],[1468.33,825.0],[1468.33,825.0],[1461.33,825.67],[1461.33,825.67],[1461.33,825.67],[1459.33,831.0],[1459.33,831.0],[1459.33,831.0],[1456.33,831.67],[1456.33,831.67],[1456.33,831.67],[1453.67,826.67],[1453.67,826.67],[1453.67,826.67],[1447.67,822.67],[1447.67,822.67],[1447.67,822.67],[1446.33,817.33],[1446.33,817.33],[1446.33,817.33],[1437.67,810.67],[1437.67,810.67],[1437.67,810.67],[1435.33,811.0],[1435.33,811.0],[1435.33,811.0],[1429.67,802.33],[1429.67,802.33],[1429.67,802.33],[1425.33,799.0],[1425.33,799.0],[1425.33,799.0],[1422.33,791.33],[1422.33,791.33],[1422.33,791.33],[1416.25,791.75],[1416.25,791.75]]],['qinqaachi',[[1462.33,637.0],[1467.67,643.33],[1467.67,643.33],[1467.67,643.33],[1472.67,641.0],[1472.67,641.0],[1472.67,641.0],[1473.0,633.67],[1473.0,633.67],[1473.0,633.67],[1478.33,632.0],[1478.33,632.0],[1478.33,632.0],[1482.67,628.67],[1482.67,628.67],[1482.67,628.67],[1486.33,636.33],[1486.33,636.33],[1486.33,636.33],[1490.67,640.33],[1490.67,640.33],[1490.67,640.33],[1497.33,642.67],[1497.33,642.67],[1497.33,642.67],[1498.0,651.33],[1498.0,651.33],[1498.0,651.33],[1502.67,652.0],[1502.67,652.0],[1502.67,652.0],[1507.67,658.0],[1507.67,658.0],[1507.67,658.0],[1509.33,654.33],[1509.33,654.33],[1509.33,654.33],[1513.67,654.33],[1513.67,654.33],[1513.67,654.33],[1516.67,659.33],[1516.67,659.33],[1516.67,659.33],[1522.67,656.67],[1522.67,656.67],[1522.67,656.67],[1529.67,655.67],[1529.67,655.67],[1529.67,655.67],[1533.0,655.0],[1533.0,655.0],[1533.0,655.0],[1537.67,654.33],[1537.67,654.33],[1537.67,654.33],[1536.67,650.33],[1536.67,650.33],[1536.67,650.33],[1547.0,651.0],[1547.0,651.0],[1547.0,651.0],[1553.67,658.0],[1553.67,658.0],[1553.67,658.0],[1556.67,651.67],[1556.67,651.67],[1556.67,651.67],[1561.0,650.67],[1561.0,650.67],[1561.0,650.67],[1568.67,657.33],[1568.67,657.33],[1568.67,657.33],[1571.67,656.67],[1571.67,656.67],[1571.67,656.67],[1573.67,663.33],[1573.67,663.33],[1573.67,663.33],[1583.0,670.33],[1583.0,670.33],[1583.0,670.33],[1581.0,676.67],[1581.0,676.67],[1581.0,676.67],[1580.67,682.67],[1580.67,682.67],[1580.67,682.67],[1574.0,683.33],[1574.0,683.33],[1574.0,683.33],[1569.33,689.0],[1569.33,689.0],[1569.33,689.0],[1579.0,692.33],[1579.0,692.33],[1579.0,692.33],[1578.0,697.67],[1578.0,697.67],[1578.0,697.67],[1573.67,704.0],[1573.67,704.0],[1573.67,704.0],[1566.67,704.0],[1566.67,704.0],[1566.67,704.0],[1567.0,708.0],[1567.0,708.0],[1567.0,708.0],[1575.33,711.67],[1575.33,711.67],[1575.33,711.67],[1576.67,716.67],[1576.67,716.67],[1576.67,716.67],[1585.0,720.67],[1585.0,720.67],[1585.0,720.67],[1592.33,727.33],[1592.33,727.33],[1592.33,727.33],[1595.33,735.0],[1595.33,735.0],[1595.33,735.0],[1600.33,735.0],[1600.33,735.0],[1600.33,735.0],[1603.0,740.0],[1603.0,740.0],[1603.0,740.0],[1600.0,744.33],[1600.0,744.33],[1600.0,744.33],[1593.0,746.33],[1593.0,746.33],[1593.0,746.33],[1593.33,766.67],[1593.33,766.67],[1593.33,766.67],[1596.67,769.33],[1596.67,769.33],[1596.67,769.33],[1596.67,780.33],[1596.67,780.33],[1596.67,780.33],[1591.67,784.0],[1591.67,784.0],[1591.67,784.0],[1584.67,780.67],[1584.67,780.67],[1584.67,780.67],[1575.33,781.0],[1575.33,781.0],[1575.33,781.0],[1569.33,785.67],[1569.33,785.67],[1569.33,785.67],[1567.0,793.0],[1567.0,793.0],[1567.0,793.0],[1563.33,801.0],[1563.33,801.0],[1563.33,801.0],[1569.67,815.0],[1569.67,815.0],[1569.67,815.0],[1567.0,826.0],[1567.0,826.0],[1567.0,826.0],[1566.0,836.67],[1566.0,836.67],[1566.0,836.67],[1563.0,839.67],[1563.0,839.67],[1563.0,839.67],[1554.33,845.33],[1554.33,845.33],[1554.33,845.33],[1553.67,848.67],[1553.67,848.67],[1553.67,848.67],[1548.67,847.0],[1548.67,847.0],[1548.67,847.0],[1549.0,841.33],[1549.0,841.33],[1549.0,841.33],[1544.67,836.33],[1544.67,836.33],[1544.67,836.33],[1534.33,829.67],[1534.33,829.67],[1534.33,829.67],[1528.67,830.33],[1528.67,830.33],[1528.67,830.33],[1527.0,833.0],[1527.0,833.0],[1527.0,833.0],[1522.33,833.67],[1522.33,833.67],[1522.33,833.67],[1513.33,822.67],[1513.33,822.67],[1513.33,822.67],[1506.0,821.33],[1506.0,821.33],[1506.0,821.33],[1500.33,816.67],[1500.33,816.67],[1500.33,816.67],[1494.0,818.33],[1494.0,818.33],[1494.0,818.33],[1489.33,823.0],[1489.33,823.0],[1489.33,823.0],[1485.0,820.67],[1485.0,820.67],[1485.0,820.67],[1478.67,824.0],[1478.67,824.0],[1478.67,824.0],[1471.33,820.0],[1471.33,820.0],[1471.33,820.0],[1468.33,825.0],[1468.33,825.0],[1468.33,825.0],[1461.33,825.67],[1461.33,825.67],[1461.33,825.67],[1459.33,831.0],[1459.33,831.0],[1459.33,831.0],[1456.33,831.67],[1456.33,831.67],[1456.33,831.67],[1453.67,826.67],[1453.67,826.67],[1453.67,826.67],[1447.67,822.67],[1447.67,822.67],[1447.67,822.67],[1446.33,817.33],[1446.33,817.33],[1446.33,817.33],[1437.67,810.67],[1437.67,810.67],[1437.67,810.67],[1435.33,811.0],[1435.33,811.0],[1435.33,811.0],[1429.67,802.33],[1429.67,802.33],[1429.67,802.33],[1425.33,799.0],[1425.33,799.0],[1425.33,799.0],[1422.33,791.33],[1422.33,791.33],[1422.33,791.33],[1424.0,779.0],[1424.0,779.0],[1424.0,779.0],[1421.67,770.33],[1421.67,770.33],[1421.67,770.33],[1421.67,752.67],[1421.67,752.67],[1421.67,752.67],[1429.0,747.33],[1429.0,747.33],[1429.0,747.33],[1433.0,748.0],[1433.0,748.0],[1433.0,748.0],[1439.33,736.67],[1439.33,736.67],[1439.33,736.67],[1441.0,722.67],[1441.0,722.67],[1441.0,722.67],[1447.67,714.0],[1447.67,714.0],[1447.67,714.0],[1447.67,710.67],[1447.67,710.67],[1447.67,710.67],[1455.0,701.0],[1455.0,701.0],[1455.0,701.0],[1463.0,699.67],[1463.0,699.67],[1463.0,699.67],[1470.33,697.0],[1470.33,697.0],[1470.33,697.0],[1472.67,687.33],[1472.67,687.33],[1472.67,687.33],[1475.33,683.33],[1475.33,683.33],[1475.33,683.33],[1475.33,676.33],[1475.33,676.33],[1475.33,676.33],[1471.33,670.0],[1471.33,670.0],[1471.33,670.0],[1471.0,665.67],[1471.0,665.67],[1471.0,665.67],[1463.33,654.67],[1463.33,654.67],[1463.33,654.67],[1457.0,650.0],[1457.0,650.0],[1457.0,650.0],[1456.67,643.33],[1456.67,643.33],[1456.67,643.33],[1462.33,637.0],[1462.33,637.0]]],['utentana',[[1532.33,433.33],[1528.33,442.67],[1528.33,442.67],[1528.33,442.67],[1523.0,447.33],[1523.0,447.33],[1523.0,447.33],[1514.67,450.0],[1514.67,450.0],[1514.67,450.0],[1507.33,452.33],[1507.33,452.33],[1507.33,452.33],[1503.67,457.67],[1503.67,457.67],[1503.67,457.67],[1499.0,458.33],[1499.0,458.33],[1499.0,458.33],[1495.67,463.33],[1495.67,463.33],[1495.67,463.33],[1492.0,462.0],[1492.0,462.0],[1492.0,462.0],[1487.33,463.67],[1487.33,463.67],[1487.33,463.67],[1485.33,469.0],[1485.33,469.0],[1485.33,469.0],[1486.33,474.0],[1486.33,474.0],[1486.33,474.0],[1488.33,473.33],[1488.33,473.33],[1488.33,473.33],[1492.33,474.33],[1492.33,474.33],[1492.33,474.33],[1492.33,478.33],[1492.33,478.33],[1492.33,478.33],[1489.67,484.0],[1489.67,484.0],[1489.67,484.0],[1492.67,487.67],[1492.67,487.67],[1492.67,487.67],[1492.67,490.67],[1492.67,490.67],[1492.67,490.67],[1488.33,495.0],[1488.33,495.0],[1488.33,495.0],[1481.0,497.0],[1481.0,497.0],[1481.0,497.0],[1474.67,496.0],[1474.67,496.0],[1474.67,496.0],[1472.67,501.0],[1472.67,501.0],[1472.67,501.0],[1479.67,509.33],[1479.67,509.33],[1479.67,509.33],[1479.0,518.33],[1479.0,518.33],[1479.0,518.33],[1482.33,521.0],[1482.33,521.0],[1482.33,521.0],[1492.67,522.33],[1492.67,522.33],[1492.67,522.33],[1499.0,525.67],[1499.0,525.67],[1499.0,525.67],[1506.0,524.67],[1506.0,524.67],[1506.0,524.67],[1509.33,530.67],[1509.33,530.67],[1509.33,530.67],[1506.0,533.33],[1506.0,533.33],[1506.0,533.33],[1507.33,538.67],[1507.33,538.67],[1507.33,538.67],[1504.33,546.33],[1504.33,546.33],[1504.33,546.33],[1503.0,552.0],[1503.0,552.0],[1503.0,552.0],[1509.33,553.67],[1509.33,553.67],[1509.33,553.67],[1512.67,557.67],[1512.67,557.67],[1512.67,557.67],[1518.67,557.67],[1518.67,557.67],[1518.67,557.67],[1521.33,559.67],[1521.33,559.67],[1521.33,559.67],[1524.33,557.67],[1524.33,557.67],[1524.33,557.67],[1530.33,557.67],[1530.33,557.67],[1530.33,557.67],[1530.33,552.0],[1530.33,552.0],[1530.33,552.0],[1532.33,550.33],[1532.33,550.33],[1532.33,550.33],[1531.33,546.67],[1531.33,546.67],[1531.33,546.67],[1534.33,546.0],[1534.33,546.0],[1534.33,546.0],[1537.0,550.0],[1537.0,550.0],[1537.0,550.0],[1541.33,551.67],[1541.33,551.67],[1541.33,551.67],[1543.33,547.33],[1543.33,547.33],[1543.33,547.33],[1544.33,542.0],[1544.33,542.0],[1544.33,542.0],[1547.0,540.67],[1547.0,540.67],[1547.0,540.67],[1547.33,536.67],[1547.33,536.67],[1547.33,536.67],[1551.0,532.0],[1551.0,532.0],[1551.0,532.0],[1552.0,523.33],[1552.0,523.33],[1552.0,523.33],[1556.33,523.67],[1556.33,523.67],[1556.33,523.67],[1558.0,527.67],[1558.0,527.67],[1558.0,527.67],[1566.0,531.0],[1566.0,531.0],[1566.0,531.0],[1574.67,527.67],[1574.67,527.67],[1574.67,527.67],[1579.33,527.0],[1579.33,527.0],[1579.33,527.0],[1585.67,524.33],[1585.67,524.33],[1585.67,524.33],[1592.33,523.67],[1592.33,523.67],[1592.33,523.67],[1595.0,521.0],[1595.0,521.0],[1595.0,521.0],[1601.67,519.33],[1601.67,519.33],[1601.67,519.33],[1605.0,515.0],[1605.0,515.0],[1605.0,515.0],[1610.33,511.0],[1610.33,511.0],[1610.33,511.0],[1615.0,511.67],[1615.0,511.67],[1615.0,511.67],[1620.0,508.33],[1620.0,508.33],[1620.0,508.33],[1622.67,501.67],[1622.67,501.67],[1622.67,501.67],[1621.67,496.67],[1621.67,496.67],[1621.67,496.67],[1620.33,491.0],[1620.33,491.0],[1620.33,491.0],[1614.67,487.67],[1614.67,487.67],[1614.67,487.67],[1613.0,483.67],[1613.0,483.67],[1613.0,483.67],[1607.0,483.33],[1607.0,483.33],[1607.0,483.33],[1607.0,479.67],[1607.0,479.67],[1607.0,479.67],[1609.67,473.0],[1609.67,473.0],[1609.67,473.0],[1615.0,470.33],[1615.0,470.33],[1615.0,470.33],[1618.67,463.0],[1618.67,463.0],[1618.67,463.0],[1620.33,458.67],[1620.33,458.67],[1620.33,458.67],[1626.5,455.5],[1626.5,455.5],[1626.5,455.5],[1620.0,451.0],[1620.0,451.0],[1620.0,451.0],[1613.5,451.5],[1613.5,451.5],[1613.5,451.5],[1608.0,452.67],[1608.0,452.67],[1608.0,452.67],[1599.67,458.67],[1599.67,458.67],[1599.67,458.67],[1592.67,459.67],[1592.67,459.67],[1592.67,459.67],[1587.67,464.67],[1587.67,464.67],[1587.67,464.67],[1585.33,471.0],[1585.33,471.0],[1585.33,471.0],[1579.67,474.33],[1579.67,474.33],[1579.67,474.33],[1575.0,474.33],[1575.0,474.33],[1575.0,474.33],[1574.0,469.33],[1574.0,469.33],[1574.0,469.33],[1568.0,466.33],[1568.0,466.33],[1568.0,466.33],[1562.67,469.0],[1562.67,469.0],[1562.67,469.0],[1558.0,466.67],[1558.0,466.67],[1558.0,466.67],[1550.0,465.0],[1550.0,465.0],[1550.0,465.0],[1545.33,459.33],[1545.33,459.33],[1545.33,459.33],[1545.33,449.0],[1545.33,449.0],[1545.33,449.0],[1542.67,444.0],[1542.67,444.0],[1542.67,444.0],[1542.33,436.33],[1542.33,436.33],[1542.33,436.33],[1539.33,431.0],[1539.33,431.0],[1539.33,431.0],[1532.33,433.33],[1532.33,433.33]]],['oaxley',[[1539.33,431.0],[1544.67,422.0],[1544.67,422.0],[1544.67,422.0],[1543.67,414.67],[1543.67,414.67],[1543.67,414.67],[1540.0,408.67],[1540.0,408.67],[1540.0,408.67],[1539.67,387.67],[1539.67,387.67],[1539.67,387.67],[1544.0,377.33],[1544.0,377.33],[1544.0,377.33],[1544.67,371.0],[1544.67,371.0],[1544.67,371.0],[1548.0,368.33],[1548.0,368.33],[1548.0,368.33],[1549.33,364.67],[1549.33,364.67],[1549.33,364.67],[1543.33,361.33],[1543.33,361.33],[1543.33,361.33],[1547.33,357.0],[1547.33,357.0],[1547.33,357.0],[1548.67,353.67],[1548.67,353.67],[1548.67,353.67],[1552.33,351.33],[1552.33,351.33],[1552.33,351.33],[1549.0,345.0],[1549.0,345.0],[1549.0,345.0],[1542.67,342.0],[1542.67,342.0],[1542.67,342.0],[1540.0,337.33],[1540.0,337.33],[1540.0,337.33],[1538.0,330.67],[1538.0,330.67],[1538.0,330.67],[1534.33,325.0],[1534.33,325.0],[1534.33,325.0],[1535.33,317.0],[1535.33,317.0],[1535.33,317.0],[1530.67,317.33],[1530.67,317.33],[1530.67,317.33],[1525.67,316.0],[1525.67,316.0],[1525.67,316.0],[1520.0,319.33],[1520.0,319.33],[1520.0,319.33],[1523.0,321.33],[1523.0,321.33],[1523.0,321.33],[1528.67,322.0],[1528.67,322.0],[1528.67,322.0],[1528.67,325.33],[1528.67,325.33],[1528.67,325.33],[1522.33,325.67],[1522.33,325.67],[1522.33,325.67],[1521.67,329.67],[1521.67,329.67],[1521.67,329.67],[1517.33,329.33],[1517.33,329.33],[1517.33,329.33],[1509.33,335.67],[1509.33,335.67],[1509.33,335.67],[1504.33,335.0],[1504.33,335.0],[1504.33,335.0],[1499.0,339.0],[1499.0,339.0],[1499.0,339.0],[1502.33,344.0],[1502.33,344.0],[1502.33,344.0],[1500.33,348.33],[1500.33,348.33],[1500.33,348.33],[1505.0,351.67],[1505.0,351.67],[1505.0,351.67],[1508.67,354.67],[1508.67,354.67],[1508.67,354.67],[1511.0,350.67],[1511.0,350.67],[1511.0,350.67],[1516.0,349.33],[1516.0,349.33],[1516.0,349.33],[1521.0,347.33],[1521.0,347.33],[1521.0,347.33],[1525.33,347.33],[1525.33,347.33],[1525.33,347.33],[1521.33,352.0],[1521.33,352.0],[1521.33,352.0],[1522.67,355.33],[1522.67,355.33],[1522.67,355.33],[1520.33,358.0],[1520.33,358.0],[1520.33,358.0],[1515.67,354.67],[1515.67,354.67],[1515.67,354.67],[1507.67,359.33],[1507.67,359.33],[1507.67,359.33],[1510.67,364.67],[1510.67,364.67],[1510.67,364.67],[1505.33,367.33],[1505.33,367.33],[1505.33,367.33],[1509.0,374.33],[1509.0,374.33],[1509.0,374.33],[1508.33,383.33],[1508.33,383.33],[1508.33,383.33],[1504.0,389.33],[1504.0,389.33],[1504.0,389.33],[1502.33,393.33],[1502.33,393.33],[1502.33,393.33],[1499.67,396.33],[1499.67,396.33],[1499.67,396.33],[1501.67,403.67],[1501.67,403.67],[1501.67,403.67],[1506.33,404.33],[1506.33,404.33],[1506.33,404.33],[1509.33,409.67],[1509.33,409.67],[1509.33,409.67],[1505.0,416.33],[1505.0,416.33],[1505.0,416.33],[1500.33,416.33],[1500.33,416.33],[1500.33,416.33],[1498.67,420.0],[1498.67,420.0],[1498.67,420.0],[1504.33,421.33],[1504.33,421.33],[1504.33,421.33],[1509.0,426.0],[1509.0,426.0],[1509.0,426.0],[1507.67,437.33],[1507.67,437.33],[1507.67,437.33],[1504.33,435.33],[1504.33,435.33],[1504.33,435.33],[1500.33,436.33],[1500.33,436.33],[1500.33,436.33],[1497.33,434.67],[1497.33,434.67],[1497.33,434.67],[1498.67,442.0],[1498.67,442.0],[1498.67,442.0],[1503.33,445.33],[1503.33,445.33],[1503.33,445.33],[1502.67,451.33],[1502.67,451.33],[1502.67,451.33],[1498.33,456.0],[1498.33,456.0],[1498.33,456.0],[1499.0,458.33],[1499.0,458.33],[1499.0,458.33],[1503.67,457.67],[1503.67,457.67],[1503.67,457.67],[1507.33,452.33],[1507.33,452.33],[1507.33,452.33],[1514.67,450.0],[1514.67,450.0],[1514.67,450.0],[1523.0,447.33],[1523.0,447.33],[1523.0,447.33],[1528.33,442.67],[1528.33,442.67],[1528.33,442.67],[1532.33,433.33],[1532.33,433.33]]],['kinforth',[[1640.0,285.0],[1641.0,291.5],[1641.0,291.5],[1641.0,291.5],[1645.5,296.0],[1645.5,296.0],[1645.5,296.0],[1650.5,310.5],[1650.5,310.5],[1650.5,310.5],[1650.0,321.0],[1650.0,321.0],[1650.0,321.0],[1648.0,327.0],[1648.0,327.0],[1648.0,327.0],[1650.5,336.5],[1650.5,336.5],[1650.5,336.5],[1656.5,340.0],[1656.5,340.0],[1656.5,340.0],[1657.5,348.5],[1657.5,348.5],[1657.5,348.5],[1658.0,356.5],[1658.0,356.5],[1658.0,356.5],[1659.5,361.5],[1659.5,361.5],[1659.5,361.5],[1657.5,364.5],[1657.5,364.5],[1657.5,364.5],[1657.0,373.5],[1657.0,373.5],[1657.0,373.5],[1654.0,381.0],[1654.0,381.0],[1654.0,381.0],[1649.0,384.0],[1649.0,384.0],[1649.0,384.0],[1649.0,392.5],[1649.0,392.5],[1649.0,392.5],[1654.5,396.0],[1654.5,396.0],[1654.5,396.0],[1653.5,406.5],[1653.5,406.5],[1653.5,406.5],[1655.5,409.0],[1655.5,409.0],[1655.5,409.0],[1653.0,429.0],[1653.0,429.0],[1653.0,429.0],[1648.5,440.0],[1648.5,440.0],[1648.5,440.0],[1641.5,446.0],[1641.5,446.0],[1641.5,446.0],[1630.5,450.5],[1630.5,450.5],[1630.5,450.5],[1626.5,455.5],[1626.5,455.5],[1626.5,455.5],[1620.0,451.0],[1620.0,451.0],[1620.0,451.0],[1613.5,451.5],[1613.5,451.5],[1613.5,451.5],[1608.0,452.67],[1608.0,452.67],[1608.0,452.67],[1599.67,458.67],[1599.67,458.67],[1599.67,458.67],[1592.67,459.67],[1592.67,459.67],[1592.67,459.67],[1587.67,464.67],[1587.67,464.67],[1587.67,464.67],[1585.33,471.0],[1585.33,471.0],[1585.33,471.0],[1579.67,474.33],[1579.67,474.33],[1579.67,474.33],[1575.0,474.33],[1575.0,474.33],[1575.0,474.33],[1574.0,469.33],[1574.0,469.33],[1574.0,469.33],[1568.0,466.33],[1568.0,466.33],[1568.0,466.33],[1562.67,469.0],[1562.67,469.0],[1562.67,469.0],[1558.0,466.67],[1558.0,466.67],[1558.0,466.67],[1550.0,465.0],[1550.0,465.0],[1550.0,465.0],[1545.33,459.33],[1545.33,459.33],[1545.33,459.33],[1545.33,449.0],[1545.33,449.0],[1545.33,449.0],[1542.67,444.0],[1542.67,444.0],[1542.67,444.0],[1542.33,436.33],[1542.33,436.33],[1542.33,436.33],[1539.33,431.0],[1539.33,431.0],[1539.33,431.0],[1544.67,422.0],[1544.67,422.0],[1544.67,422.0],[1543.67,414.67],[1543.67,414.67],[1543.67,414.67],[1540.0,408.67],[1540.0,408.67],[1540.0,408.67],[1539.67,387.67],[1539.67,387.67],[1539.67,387.67],[1544.0,377.33],[1544.0,377.33],[1544.0,377.33],[1544.67,371.0],[1544.67,371.0],[1544.67,371.0],[1548.0,368.33],[1548.0,368.33],[1548.0,368.33],[1549.33,364.67],[1549.33,364.67],[1549.33,364.67],[1543.33,361.33],[1543.33,361.33],[1543.33,361.33],[1547.33,357.0],[1547.33,357.0],[1547.33,357.0],[1548.67,353.67],[1548.67,353.67],[1548.67,353.67],[1552.33,351.33],[1552.33,351.33],[1552.33,351.33],[1549.0,345.0],[1549.0,345.0],[1549.0,345.0],[1542.67,342.0],[1542.67,342.0],[1542.67,342.0],[1540.0,337.33],[1540.0,337.33],[1540.0,337.33],[1538.0,330.67],[1538.0,330.67],[1538.0,330.67],[1534.33,325.0],[1534.33,325.0],[1534.33,325.0],[1535.33,317.0],[1535.33,317.0],[1535.33,317.0],[1537.0,313.33],[1537.0,313.33],[1537.0,313.33],[1536.67,309.0],[1536.67,309.0],[1536.67,309.0],[1539.33,305.0],[1539.33,305.0],[1539.33,305.0],[1539.33,299.67],[1539.33,299.67],[1539.33,299.67],[1537.0,294.0],[1537.0,294.0],[1537.0,294.0],[1543.67,286.0],[1543.67,286.0],[1543.67,286.0],[1541.5,283.5],[1541.5,283.5],[1541.5,283.5],[1544.0,272.0],[1544.0,272.0],[1544.0,272.0],[1547.5,264.5],[1547.5,264.5],[1547.5,264.5],[1557.0,262.0],[1557.0,262.0],[1557.0,262.0],[1567.5,264.5],[1567.5,264.5],[1567.5,264.5],[1577.5,267.0],[1577.5,267.0],[1577.5,267.0],[1585.0,266.5],[1585.0,266.5],[1585.0,266.5],[1592.0,265.0],[1592.0,265.0],[1592.0,265.0],[1599.0,267.0],[1599.0,267.0],[1599.0,267.0],[1605.0,272.5],[1605.0,272.5],[1605.0,272.5],[1612.5,277.5],[1612.5,277.5],[1612.5,277.5],[1616.5,279.0],[1616.5,279.0],[1616.5,279.0],[1620.0,283.0],[1620.0,283.0],[1620.0,283.0],[1625.0,284.0],[1625.0,284.0],[1625.0,284.0],[1634.0,283.5],[1634.0,283.5],[1634.0,283.5],[1640.0,285.0],[1640.0,285.0]]],['tamblair',[[1634.0,283.5],[1633.5,279.0],[1633.5,279.0],[1633.5,279.0],[1637.0,272.5],[1637.0,272.5],[1637.0,272.5],[1635.0,268.0],[1635.0,268.0],[1635.0,268.0],[1640.0,259.0],[1640.0,259.0],[1640.0,259.0],[1640.5,254.0],[1640.5,254.0],[1640.5,254.0],[1651.0,238.5],[1651.0,238.5],[1651.0,238.5],[1651.0,235.5],[1651.0,235.5],[1651.0,235.5],[1653.5,228.5],[1653.5,228.5],[1653.5,228.5],[1648.0,223.5],[1648.0,223.5],[1648.0,223.5],[1641.0,215.5],[1641.0,215.5],[1641.0,215.5],[1637.5,211.5],[1637.5,211.5],[1637.5,211.5],[1629.5,206.0],[1629.5,206.0],[1629.5,206.0],[1625.5,194.5],[1625.5,194.5],[1625.5,194.5],[1615.5,184.0],[1615.5,184.0],[1615.5,184.0],[1606.0,182.5],[1606.0,182.5],[1606.0,182.5],[1599.5,178.5],[1599.5,178.5],[1599.5,178.5],[1586.0,179.0],[1586.0,179.0],[1586.0,179.0],[1578.0,184.5],[1578.0,184.5],[1578.0,184.5],[1572.0,182.5],[1572.0,182.5],[1572.0,182.5],[1565.5,184.0],[1565.5,184.0],[1565.5,184.0],[1560.5,185.5],[1560.5,185.5],[1560.5,185.5],[1554.0,184.5],[1554.0,184.5],[1554.0,184.5],[1543.5,187.0],[1543.5,187.0],[1543.5,187.0],[1532.0,193.5],[1532.0,193.5],[1532.0,193.5],[1530.0,198.0],[1530.0,198.0],[1530.0,198.0],[1537.0,200.0],[1537.0,200.0],[1537.0,200.0],[1537.0,204.5],[1537.0,204.5],[1537.0,204.5],[1541.5,206.5],[1541.5,206.5],[1541.5,206.5],[1541.5,212.5],[1541.5,212.5],[1541.5,212.5],[1535.0,215.5],[1535.0,215.5],[1535.0,215.5],[1532.5,222.0],[1532.5,222.0],[1532.5,222.0],[1532.0,227.5],[1532.0,227.5],[1532.0,227.5],[1518.0,237.5],[1518.0,237.5],[1518.0,237.5],[1511.0,238.0],[1511.0,238.0],[1511.0,238.0],[1503.5,235.5],[1503.5,235.5],[1503.5,235.5],[1499.5,230.0],[1499.5,230.0],[1499.5,230.0],[1497.0,224.0],[1497.0,224.0],[1497.0,224.0],[1488.5,214.0],[1488.5,214.0],[1488.5,214.0],[1484.0,214.0],[1484.0,214.0],[1484.0,214.0],[1480.5,208.5],[1480.5,208.5],[1480.5,208.5],[1475.0,206.0],[1475.0,206.0],[1475.0,206.0],[1471.0,207.5],[1471.0,207.5],[1471.0,207.5],[1466.5,205.5],[1466.5,205.5],[1466.5,205.5],[1461.0,208.0],[1461.0,208.0],[1461.0,208.0],[1457.5,210.5],[1457.5,210.5],[1457.5,210.5],[1449.0,210.5],[1449.0,210.5],[1449.0,210.5],[1441.5,211.0],[1441.5,211.0],[1441.5,211.0],[1436.5,221.5],[1436.5,221.5],[1436.5,221.5],[1440.0,229.5],[1440.0,229.5],[1440.0,229.5],[1432.5,237.5],[1432.5,237.5],[1432.5,237.5],[1430.5,245.0],[1430.5,245.0],[1430.5,245.0],[1433.0,250.0],[1433.0,250.0],[1433.0,250.0],[1435.5,253.0],[1435.5,253.0],[1435.5,253.0],[1431.5,258.5],[1431.5,258.5],[1431.5,258.5],[1433.0,263.5],[1433.0,263.5],[1433.0,263.5],[1432.5,267.5],[1432.5,267.5],[1432.5,267.5],[1435.5,278.5],[1435.5,278.5],[1435.5,278.5],[1438.5,284.5],[1438.5,284.5],[1438.5,284.5],[1446.0,286.5],[1446.0,286.5],[1446.0,286.5],[1444.5,292.0],[1444.5,292.0],[1444.5,292.0],[1446.5,295.0],[1446.5,295.0],[1446.5,295.0],[1452.5,291.0],[1452.5,291.0],[1452.5,291.0],[1456.5,289.5],[1456.5,289.5],[1456.5,289.5],[1459.5,290.0],[1459.5,290.0],[1459.5,290.0],[1461.0,294.5],[1461.0,294.5],[1461.0,294.5],[1466.0,295.0],[1466.0,295.0],[1466.0,295.0],[1475.0,295.5],[1475.0,295.5],[1475.0,295.5],[1482.5,292.5],[1482.5,292.5],[1482.5,292.5],[1481.5,286.5],[1481.5,286.5],[1481.5,286.5],[1484.0,281.5],[1484.0,281.5],[1484.0,281.5],[1489.5,281.5],[1489.5,281.5],[1489.5,281.5],[1488.0,287.0],[1488.0,287.0],[1488.0,287.0],[1489.0,292.0],[1489.0,292.0],[1489.0,292.0],[1493.5,291.5],[1493.5,291.5],[1493.5,291.5],[1497.0,290.5],[1497.0,290.5],[1497.0,290.5],[1499.0,293.5],[1499.0,293.5],[1499.0,293.5],[1507.5,283.5],[1507.5,283.5],[1507.5,283.5],[1508.5,279.0],[1508.5,279.0],[1508.5,279.0],[1513.0,279.0],[1513.0,279.0],[1513.0,279.0],[1515.0,284.5],[1515.0,284.5],[1515.0,284.5],[1518.5,287.0],[1518.5,287.0],[1518.5,287.0],[1520.0,290.5],[1520.0,290.5],[1520.0,290.5],[1524.5,290.0],[1524.5,290.0],[1524.5,290.0],[1527.5,284.0],[1527.5,284.0],[1527.5,284.0],[1530.5,287.0],[1530.5,287.0],[1530.5,287.0],[1533.5,289.0],[1533.5,289.0],[1533.5,289.0],[1541.5,283.5],[1541.5,283.5],[1541.5,283.5],[1544.0,272.0],[1544.0,272.0],[1544.0,272.0],[1547.5,264.5],[1547.5,264.5],[1547.5,264.5],[1557.0,262.0],[1557.0,262.0],[1557.0,262.0],[1567.5,264.5],[1567.5,264.5],[1567.5,264.5],[1577.5,267.0],[1577.5,267.0],[1577.5,267.0],[1585.0,266.5],[1585.0,266.5],[1585.0,266.5],[1592.0,265.0],[1592.0,265.0],[1592.0,265.0],[1599.0,267.0],[1599.0,267.0],[1599.0,267.0],[1605.0,272.5],[1605.0,272.5],[1605.0,272.5],[1612.5,277.5],[1612.5,277.5],[1612.5,277.5],[1616.5,279.0],[1616.5,279.0],[1616.5,279.0],[1620.0,283.0],[1620.0,283.0],[1620.0,283.0],[1625.0,284.0],[1625.0,284.0],[1625.0,284.0],[1634.0,283.5],[1634.0,283.5]]]]
},{}],4:[function(require,module,exports){
module.exports = [
    {
        capitol: [1483, 235],
        name: 'Tamblair'
    },
    {
        capitol: [1572, 317],
        name: 'Kinforth'
    },
    {
        capitol: [1507, 348],
        name: 'Oaxley'
    },
    {
        capitol: [1513, 549],
        name: 'Utentana'
    },
    {
        capitol: [1377, 235],
        name: 'Cusichaca'
    },
    {
        capitol: [1271, 419],
        name: 'Hongshi Coast'
    },
    {
        capitol: [1238, 588],
        name: 'Yunin'
    },
    {
        capitol: [1336, 677],
        name: 'Paritus'
    },
    {
        capitol: [1460, 611],
        name: 'Hanat'
    },
    {
        capitol: [1548, 749],
        name: 'Qinqaachi'
    },
    {
        capitol: [1512, 885],
        name: 'Ulavaar'
    },
    {
        capitol: [1321, 875],
        name: 'Anvala'
    },
    {
        capitol: [1239, 840],
        name: 'Virna'
    },
    {
        capitol: [1300, 984],
        name: 'Urhal'
    },
    {
        capitol: [1445, 1078],
        name: 'Northlake'
    },
    {
        capitol: [1278, 1148],
        name: 'Lord\'s Leap'
    },
    {
        capitol: [1250, 1080],
        name: 'Skyend'
    },
    {
        capitol: [1229, 1150],
        name: 'Ravenrock'
    },
    {
        capitol: [1430, 1221],
        name: 'Glowwater'
    },
    {
        capitol: [1162, 1006],
        name: 'Faberia'
    },
    {
        capitol: [1077, 1190],
        name: 'Aspara'
    },
    {
        capitol: [1135, 888],
        name: 'Bannen\'s Rest'
    },
    {
        capitol: [1180, 766],
        name: 'Fallow'
    },
    {
        capitol: [1077, 799],
        name: 'Cathedral'
    },
    {
        capitol: [1105, 695],
        name: 'Aleston'
    },
    {
        capitol: [1141, 604],
        name: 'Suna'
    },
    {
        capitol: [1147, 394],
        name: 'Jingshan'
    },
    {
        capitol: [991, 294],
        name: 'Changning'
    },
    {
        capitol: [1031, 400],
        name: 'Wu Tower'
    },
    {
        capitol: [1061, 511],
        name: 'Qinjuru'
    },
    {
        capitol: [1009, 576],
        name: 'Saltpan'
    },
    {
        capitol: [1026, 685],
        name: 'Oblivion Pass'
    },
    {
        capitol: [1012, 747],
        name: 'Garrow'
    },
    {
        capitol: [1019, 871],
        name: 'Sunder'
    },
    {
        capitol: [1016, 1021],
        name: 'Lookout'
    },
    {
        capitol: [978, 1152],
        name: 'Ballast'
    },
    {
        capitol: [886, 1218],
        name: 'Troydon'
    },
    {
        capitol: [960, 1008],
        name: 'Boomtown'
    },
    {
        capitol: [924, 936],
        name: 'Jackson Hole'
    },
    {
        capitol: [769, 908],
        name: 'Albys'
    },
    {
        capitol: [901, 596],
        name: 'Orrington'
    },
    {
        capitol: [876, 486],
        name: 'Sanctuary'
    },
    {
        capitol: [853, 359],
        name: 'Yao Ling Pass'
    },
    {
        capitol: [894, 235],
        name: 'Lu Tower'
    },
    {
        capitol: [812, 260],
        name: 'Bai Hua Hills'
    },
    {
        capitol: [782, 466],
        name: 'Dragontown'
    },
    {
        capitol: [798, 645],
        name: 'Faron'
    },
    {
        capitol: [605, 578],
        name: 'Landmark'
    },
    {
        capitol: [678, 430],
        name: 'Naufrage'
    },
    {
        capitol: [692, 348],
        name: 'Sabbia'
    },
    {
        capitol: [704, 211],
        name: 'Flyaway'
    },
    {
        capitol: [584, 306],
        name: 'Canon'
    },
    {
        capitol: [505, 382],
        name: 'Alleron'
    },
    {
        capitol: [482, 578],
        name: 'Caldera'
    },
    {
        capitol: [462, 743],
        name: 'Kire'
    },
    {
        capitol: [485, 885],
        name: 'Sabakumura'
    },
    {
        capitol: [491, 1020],
        name: 'Selogorod'
    },
    {
        capitol: [562, 1029],
        name: 'Orlevsela'
    },
    {
        capitol: [631, 1103],
        name: 'Starostrog'
    },
    {
        capitol: [464, 1142],
        name: 'Vyshtorg'
    },
    {
        capitol: [680, 1225],
        name: 'Vama Rea'
    },
    {
        capitol: [552, 1391],
        name: 'Mor Mare'
    },
    {
        capitol: [681, 1590],
        name: 'Andelata'
    },
    {
        capitol: [753, 1638],
        name: 'Lirodunum'
    },
    {
        capitol: [808, 1781],
        name: 'Beldusios'
    },
    {
        capitol: [970, 1761],
        name: 'Allonia'
    },
    {
        capitol: [864, 1633],
        name: 'Lutessa'
    },
    {
        capitol: [1059, 1602],
        name: 'Averna'
    },
    {
        capitol: [1170, 1579],
        name: 'Anthos'
    },
    {
        capitol: [1046, 1487],
        name: 'Lascus'
    },
    {
        capitol: [1151, 1409],
        name: 'Itonia'
    },
    {
        capitol: [1278, 1326],
        name: 'Serpent\'s Point'
    },
    {
        capitol: [1228, 1284],
        name: 'Blackcliff'
    }
]
},{}]},{},[2]);

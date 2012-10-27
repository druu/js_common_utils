(function (window, $) {
	/**
	 * Helper function to define immutable, non-enumerable functions on builtin prototypes.
	 * If the target object is an Array, it will be traversed recursively and the method added to all its members.
	 */
	function def(target, name, fn) {
		var i;
		
		if (Array.isArray(target) && target !== Array.prototype) {
			for (i = 0; i < target.length; i += 1) {
				def(target[i], name, fn);
			}
			return;
		}
		
		if (target.hasOwnProperty(name)) {
			console.warn("Warning: Object ", target, "already has a property called '" + name + "'. Overwriting...");
		}
		try {
			Object.defineProperty(
			target, 
			name, {
				value: fn,
				writable: false,
				enumerable: false,
				configurable: false
			});
			return true;
		} catch (ex) {
			return false;
		}
	}
	
	
	def([Boolean.prototype, Number.prototype, String.prototype], "toInt", function (fallback) {
		var val = +this || parseInt(this, 10);
		return isFinite(val) ? val : (typeof fallback !== "undefined" ? fallback : 0);
	});
	def([Boolean.prototype, Number.prototype, String.prototype], "toNumber", function (fallback) {
		var val = +this || parseFloat(this, 10);
		return isFinite(val) ? val : (typeof fallback !== "undefined" ? fallback : 0);
	});
	
	
	
	/**
	 * Array Extensions
	 * ================
	 */
	def(Array.prototype, "min", function () {
		return Math.min.apply(Math, this);
	});
	def(Array.prototype, "max", function () {
		return Math.max.apply(Math, this);
	});
	def(Array.prototype, "shuffle", function () {
		var i;
		for (i = this.length; i > 0; i -= 1) {
			this.push(this.splice(Math.random() * i, 1)[0]);
		}
		return this;
	});
	def(Array.prototype, "rsort", function () {
		return this.sort().reverse();
	});
	def(Array.prototype, "natsort", function () {
		return this.sort(window.naturalSort);
	});
	def(Array.prototype, "rnatsort", function () {
		return this.sort(window.naturalSort).reverse();
	});
	def(Array.prototype, "pluck", function (prop, fallback) {
		var i, ret = [];
		for (i = 0; i < this.length; i += 1) {
			ret.push(this[i].hasOwnProperty(prop) ? this[i][prop] : fallback);
		}
		return ret;
	});
	def(Array.prototype, "contains", function (val) {
		return this.indexOf(val) > -1;
	});
	def(Array.prototype, "mapThis", function (fn) {
		var args = [].slice.call(arguments, 1);
		return this.map(function () {
			fn.call(this, args);
		});
	});
	
	
	
	/**
	 * Number Extensions
	 * =================
	 */
	def(Number.prototype, "abs", function () {
		return Math.abs(this);
	});
	def(Number.prototype, "isFinite", function () {
		return isFinite(this);
	});
	def(Number.prototype, "floor", function () {
		return Math.floor(this);
	});
	def(Number.prototype, "ceil", function () {
		return Math.ceil(this);
	});
	def(Number.prototype, "round", function (n) {
		return this.toFixed((n || 0).toInt().abs()).toNumber();
	});
	def(Number.prototype, "constrain", function (min, max) {
		min = min === null || typeof min === "undefined" ? -Infinity : min.toNumber();
		max = max === null || typeof max === "undefined" ? Infinity : max.toNumber();
		return Math.min(max, Math.max(min, this));
	});
	
	
	
	/**
	 * String Extensions
	 * =================
	 */
	def(String.prototype, "pad", function (len, padChar) {
		len = (len && parseInt(Math.abs(len), 10)) || 2;
		return (this.length >= len && this) || (padChar || "0").repeat(len - this.length) + this;
	});
	def(String.prototype, "shuffle", function () {
		return ((this && this.split('')) || []).shuffle().join('');
	});
	def(String.prototype, "repeat", function (times) {
		times = parseInt(Math.abs(times), 10);
		if (!times) {
			return;
		}
		return Array.prototype.constructor.call(Array, times + 1).join(this);
	});
	def(String.prototype, "parseDate", function (format, useUTC) {
		var map = {
				'y': 0,
				'm': 1,
				'd': 1,
				'h': 0,
				'i': 0,
				's': 0
			},
			date, i, ret;
		
		date = this.replace(/^\D+|\D+$/g, '').split(/\D/);
		format = ((format && String(format)) || "Y-m-d H:i:s").toLowerCase().replace(/[^ymdhis]/g, '').split('');
		
		for (i = 0; i < date.length && i < format.length; i += 1) {
			if (typeof map[format[i]] !== "undefined") {
				map[format[i]] = parseInt(date[i], 10) || 0;
			}
		}
		
		if (!useUTC) {
			return new Date(map.y, map.m - 1, map.d, map.h, map.i, map.s);
		}
		ret = new Date(0);
		ret.setUTCFullYear(map.y);
		ret.setUTCMonth(map.m - 1);
		ret.setUTCDate(map.d);
		ret.setUTCHours(map.h);
		ret.setUTCMinutes(map.i);
		ret.setUTCSeconds(map.s);
		return ret;
	});
	def(String.prototype, "mapLines", function (fn, trimBlankLines) {
		var val = trimBlankLines ? 
			this.replace(/\r/g, '\n').replace(/\n+/g, '\n').replace(/^\n+|\n+$/g, '') :
			this;
		
		return val.split('\n').map(fn).join('\n');
	});
	def(String.prototype, "md5", function () {
		return window.md5(this);
	});
	def(String.prototype, "sha1", function () {
		return window.sha1(this);
	});
	def(String.prototype, "sha256", function () {
		return window.sha256(this);
	});
	def(String.prototype, "contains", function (needle) {
		return this.indexOf(needle) > -1;
	});
	def(String.prototype, "nsplit", function (n) {
		var i, ret = [];
		n = Math.max(n || 1, 1);
		
		if (n === 1) {
			return this.split('');
		}
		
		for (i = 0; i < this.length; i += n) {
			ret.push(this.substring(i, i + n));
		}
		return ret;
	});
	
	
	
	/**
	 * Date Extensions
	 * ===============
	 */
	def(Date, "fromString", function (dateString, format, useUTC) {
		return dateString.parseDate(format, useUTC);
	});
	def(Date.prototype, "getYearProper", function (useUTC) {
		return String(useUTC ? this.getUTCFullYear() : this.getFullYear());
	});
	def(Date.prototype, "getMonthProper", function (useUTC) {
		return String(useUTC ? this.getUTCMonth() + 1 : this.getMonth() + 1).pad(2);
	});
	def(Date.prototype, "getDateProper", function (useUTC) {
		return String(useUTC ? this.getUTCDate() : this.getDate()).pad(2);
	});
	def(Date.prototype, "getHoursProper", function (useUTC) {
		return String(useUTC ? this.getUTCHours() : this.getHours()).pad(2);
	});
	def(Date.prototype, "getMinutesProper", function (useUTC) {
		return String(useUTC ? this.getUTCMinutes() : this.getMinutes()).pad(2);
	});
	def(Date.prototype, "getSecondsProper", function (useUTC) {
		return String(useUTC ? this.getUTCSeconds() : this.getSeconds()).pad(2);
	});
	def(Date.prototype, "getDayProper", function (useUTC) {
		return useUTC ? this.getUTCDay() : this.getDay();
	});
	def(Date.prototype, "format", (function () {
		var map = {
				'Y': 'getYearProper',
				'm': 'getMonthProper',
				'd': 'getDateProper',
				'H': 'getHoursProper',
				'i': 'getMinutesProper',
				's': 'getSecondsProper',
				'U': 'valueOf',
				'w': 'getDayProper'
			};
		
		return function (format, useUTC) {
			var i;
			format = (String(format) || "Y-m-d H:i:s").split('');
			useUTC = !!useUTC;
			
			for (i = 0; i < format.length; i += 1) {
				if (typeof map[format[i]] !== "undefined") {
					format[i] = this[map[format[i]]](useUTC);
				}
			}
			return format.join('');
		};
	}()));
	
	
	
	/**
	 * Function Extensions
	 * ===================
	 */
	def(Function.prototype, "memoize", function (hashFunc) {
		var cache = {},
			fn = this;
		
		hashFunc = (typeof hashFunc === "function" && hashFunc) || function () { return String([].slice.call(arguments)); };
		return function () {
			var key = hashFunc.apply(this, arguments);
			console.log(key);
			return (cache.hasOwnProperty(key)) ? cache[key] : (cache[key] = fn.apply(this, arguments));
			
		};
	});
	
	
	
	/**
	 * Object Extensions
	 * =================
	 */
	def(Object, "extend", window.jQuery.extend);
	def(Object.prototype, "extend", function () {
		window.jQuery.extend(this, arguments);
	});
	def(Object.prototype, "count", function () {
		var prop, i = 0;
		for (prop in this) {
			if (this.hasOwnProperty(prop)) {
				i += 1;
			}
		}
		return i;
	});
	def(Object.prototype, "walk", function (fn) {
		var prop;
		
		for (prop in this) {
			if (this.hasOwnProperty(prop)) {
				this[prop] = fn.call(this, prop, this[prop]);
			}
		}
		return this;
	});
	def(Object.prototype, "map", function (fn) {
		var prop,
			ret = [];
		
		for (prop in this) {
			if (this.hasOwnProperty(prop)) {
				ret[prop] = fn.call(this, prop, this[prop]);
			}
		}
		return ret;
	});
	def(Object.prototype, "keyArray", function () {
		var ret = [];
		this.map(function (k) {
			ret.push(k);
		});
		return ret;
	});
	def(Object.prototype, "valueArray", function () {
		var ret = [];
		this.map(function (k, v) {
			ret.push(v);
		});
		return ret;
	});
	
	
	
	/*
	 * Local Storage Extensions
	 * ========================
	 */
	 def(window.localStorage, "xget", function (key, fallback) {
		var val;
		try {
			val = this.getItem(String(key));
			val = typeof "val" === "string" ? JSON.parse(val) : fallback;
			return val;
		} catch (e) {
			return fallback;
		}
	});
	def(window.localStorage, "xset", function (key, val) {
		try {
			val = JSON.stringify(val);
			this.setItem(String(key), val);
			return true;
		} catch (e) {
			return false;
		}
	});
	def(window.localStorage, "persist", function (element, key, defaultValue) {
		$(element).val(window.localStorage.xget(key, defaultValue));
		
		$(window).on('beforeunload', function () {
			window.localStorage.xset(key, $(element).val());
		});
	});
}(window, jQuery));
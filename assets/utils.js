var utils = (function () {
	var fn = {
			date: {},
			string: {},
			number: {},
			array: {},
			storage: {}
		};
	
	
	/********
	 * Date
	 *******/
	fn.date.parse = function (dateStr, format, useUTC) {
		var map = {
				'y': 0,
				'm': 0,
				'd': 0,
				'h': 0,
				'i': 0,
				's': 0
			},
			date, i, ret;
		
		date = dateStr.split(/\D/);
		format = ((format && String(format)) || "Y-m-d H:i:s").toLowerCase().split(/[^ymdhis]/);
		
		for (i = 0; i < date.length && i < format.length; i += 1) {
			if (typeof map[format[i]] !== "undefined") {
				map[format[i]] = parseInt(date[i], 10) || 0;
			}
		}
		
		if (!useUTC) {
			return new Date(map.y, map.m - 1, map.d, map.h, map.i, map.s);
		}
		ret = new Date();
		ret.setUTCYears(map.y);
		ret.setUTCMonths(map.m - 1);
		ret.setUTCDate(map.d);
		ret.setUTCHours(map.h);
		ret.setUTCMinutes(map.i);
		ret.setUTCSeconds(map.s);
	};
	fn.date.format = (function () {
		var map = {
				'Y': Date.prototype.getFullYear,
				'm': function () { return fn.string.pad(this.getMonth() + 1); },
				'd': function () { return fn.string.pad(this.getDate()); },
				'H': function () { return fn.string.pad(this.getHours()); },
				'i': function () { return fn.string.pad(this.getMinutes()); },
				's': function () { return fn.string.pad(this.getSeconds()); },
				'U': Date.prototype.valueOf,
				'w': Date.prototype.getDay
			},
			utcMap = {
				'Y': Date.prototype.getUTCFullYear,
				'm': function () { return fn.string.pad(this.getUTCMonth() + 1); },
				'd': function () { return fn.string.pad(this.getUTCDate()); },
				'H': function () { return fn.string.pad(this.getUTCHours()); },
				'i': function () { return fn.string.pad(this.getUTCMinutes()); },
				's': function () { return fn.string.pad(this.getUTCSeconds()); },
				'U': Date.prototype.valueOf,
				'w': Date.prototype.getUTCDay
			};
		
		return function (format, date, useUTC) {
			var i,
				currentMap = useUTC ? utcMap : map;
			
			format = ((format && String(format)) || "Y-m-d H:i:s").split('');
			
			for (i = 0; i < format.length; i += 1) {
				if (typeof currentMap[format[i]] !== "undefined") {
					format[i] = currentMap[format[i]].call(date);
				}
			}
			return format.join('');
		};
	}());
	fn.date.configure = function (format, useUTC) {
		return {
			parse: function (date) {
				return fn.date.format(format, date, useUTC);
			},
			format: function (date) {
				return fn.date.format(format, date, useUTC);
			}
		};
	};
	
	
	/********
	 * String
	 *******/
	fn.string.pad = function (str, len, padChar) {
		len = (len && parseInt(Math.abs(len), 10)) || 2;
		str = String(str);
		return (str.length >= len && str) || fn.string.repeat(padChar || "0", len - str.length) + str;
	};
	fn.string.repeat = function (str, times) {
		times = parseInt(Math.abs(times), 10);
		if (!times) {
			return;
		}
		return Array.prototype.constructor.call(Array, times + 1).join(str);
	};
	fn.string.shuffle = function (str) {
		return fn.array.shuffle((str && str.split('')) || []).join('');
	};
	
	
	/********
	 * Array
	 *******/
	fn.array.shuffle = function (arr) {
		var i;
		
		for (i = arr.length; i > 0; i -= 1) {
			arr.push(arr.splice(Math.random() * i, 1));
		}
		
		return arr;
	};
	
	
	/********
	 * Local Storage
	 *******/
	fn.storage.get = function (key, fallback) {
		var val;
		try {
			val = localStorage.getItem(String(key));
			val = (typeof "val" === "string" && JSON.parse(val)) || fallback;
			return val;
		} catch (e) {
			return fallback;
		}
	};

	fn.storage.set = function (key, val) {
		try {
			val = JSON.stringify(val);
			localStorage.setItem(String(key), val);
			return true;
		} catch (e) {
			return false;
		}
	};
	
	return fn;
}(window));
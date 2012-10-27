var jsUtils = (function (window, $) {
	"use strict";
	var modules = {},
		activeModules,
		
		jsUtils = {},
		$templates = $('script[type="text/xtemplate"]');


	jsUtils.init = function () {
		var $sections,
			prop,
			i,
			$content = $('#content'),
			$search = $('#topbar_search');

		// get custom module activeModules from LocalStorage
		// TODO: drag&drop reordering, enabling/disabling
		activeModules = localStorage.xget("jsutils-plugin-activeModules", null);
		if (!Array.isArray(activeModules) || !activeModules.length) {
			activeModules = modules.keyArray();
		}
		
		for (i = 0; i < activeModules.length; i += 1) {
			if (modules[activeModules[i]] === "undefined") {
				continue;
			}

			$content.append(
				$('<div id="' + activeModules[i] + '" class="util span3"/>').html($templates.filter('[data-module="' + activeModules[i] + '"]').html())
			);
			
			modules[activeModules[i]].call(window, $('#' + activeModules[i]), $);
		}

		// force equal container height
		$sections = $('div.util');
		$sections.height(Math.max.apply(Math, $sections.map(function () { return $(this).height(); })));

		// search field and fullscreen
		$(document).
			on('keyup', function (e) {
				if ((e.charCode || e.keyCode) === 27) {
					
					$('div.util').removeClass('fullsize').show(0);
					$search.val("").focus();
				}
			}).
			on('click', 'h2', function() {
				$(this).
					parent().
					toggleClass('fullsize').
					siblings().
					toggle(0, 'hide');
			});

		$search.on('keyup', function (e) {
			var keywords, k, m;

			if ((e.charCode || e.keyCode) === 27) {
				$search.val("").trigger('keyup').blur();
				e.stopPropagation();
				return;
			}

			keywords = $search.val().replace(/[^A-Za-z0-9\_\-\s]/g, '').trim().split(/\s+/);

			outer: for (m = 0; m < activeModules.length; m += 1) {
				for (k = 0; k < keywords.length; k += 1) {
					if (!activeModules[m].contains(keywords[k])) {
						$('#' + activeModules[m]).hide();
						continue outer;
					}
				}
				$('#' + activeModules[m]).show();
			}
		}).focus();
	};


	jsUtils.register = function (name, constructor) {
		modules[name] = constructor;
	};

	return jsUtils;
}(window, window.jQuery));

jsUtils.register("urlencode", function ($container, $) {
	"use strict";
	var $ta = $('#urlencode_ta');

	$('#urlencode_enc').on('click', function () {
		$ta.val(encodeURIComponent($ta.val()).replace(/%20/g, '+'));
	});
	$('#urlencode_dec').on('click', function () {
		$ta.val(decodeURIComponent($ta.val()).replace(/\+/g, ' '));
	});
	$('#urlencode_esc_enc').on('click', function () {
		$ta.val(window.escape($ta.val()));
	});
	$('#urlencode_esc_dec').on('click', function () {
		$ta.val(window.unescape($ta.val()));
	});
});

jsUtils.register("strlen", function ($container, $) {
	"use strict";
	var $ta = $('#strlen_ta'),
		$out = $('#strlen').find('label span'),
		mode = "trim";

	function measure() {
		var val = $ta.val() || "";

		switch (mode) {
			case "trim": val = $.trim(val); break;
			case "ignore": val = val.replace(/\s/g, ''); break;
		}
		$out.text(val.length);
	}

	$('#strlen').find('select').click(function () {
		mode = $(this).val();
		measure();
	});
	$ta.bind('keyup paste click blur focus', measure);
	measure();
});

jsUtils.register("replace", function ($container, $) {
	"use strict";
	var $ta_from = $container.find('textarea:first'),
		$ta_to = $container.find('textarea:last'),
		$tf_from = $container.find('input:first'),
		$tf_to = $container.find('input:last'),
		regex,
		replacement = "",
		error = "";

	function replace() {
		if (regex) {
			$ta_to.val($ta_from.val().replace(regex, replacement));
			return;
		}
		$ta_to.val(error ? "ERROR: " + error : "");
	}

	$tf_from.bind('keyup keydown blur paste', function () {
		var val = $tf_from.val();
		error = "";
		if (val.length) {
			try {
				regex = new RegExp(val || "", "g");
				replace();
				return;
			} catch (e) {
				error = e.message;
			}
		}
		regex = null;
		replace();
	});
	$tf_to.bind('keyup blur paste', function () {
		replacement = $tf_to.val() || "";
		replace();
	});
	$ta_from.bind('keyup blur paste', replace);
});

jsUtils.register("base64", function ($container, $) {
	"use strict";
	var $ta = $('#base64_ta');

	$('#base64_enc').click(function () {
		$ta.val(window.base64.encode($ta.val()));
	});
	$('#base64_dec').click(function () {
		try {
			$ta.val(window.base64.decode($ta.val()));
		} catch (ex) {}
	});
});

jsUtils.register("hash", function ($container, $) {
	"use strict";

	var $ta = $('#hash_ta');
	$('[data-hash]').click(function () {
		var hashType = this.dataset.hash;
		$ta.val(
			$ta.val().mapLines(function (l) {
				return (l.trim() && l[hashType]()) || l;
			})
		);
	});
});

jsUtils.register("substr_count", function ($container, $) {
	"use strict";
	var $ta = $('#substr_count_ta'),
		$cb = $('#substr_count_cb'),
		$tf = $('#substr_count_tf'),
		$out = $('#substr_count').find('label span'),
		ci = $cb.is(':checked'),
		recount = function () {
			var haystack = $ta.val() || "",
				needle = $tf.val() || "",
				hlen = haystack.length,
				nlen = needle.length,
				i,
				count = 0;

			if (hlen && nlen) {
				if (ci) {
					haystack = haystack.toLowerCase();
					needle = needle.toLowerCase();
				}

				for (i = 0; i <= hlen - nlen; i += 1) {
					if (haystack.substring(i, i + nlen) === needle) {
						count += 1;
						i += nlen - 1;
					}
				}
			}
			$out.text(count);
		};

	$cb.click(function () {
		ci = $cb.is(':checked');
		recount();
	});
	$tf.bind('keyup blur paste', recount);
	$ta.bind('keyup blur paste', recount);
	recount();
});

jsUtils.register("chmod", function ($container, $) {
	"use strict";
	var $all_cb = $container.find('input[type="checkbox"]'),
		tf_oct = $('#chmod_result_oct')[0],
		tf_hum = $('#chmod_result_hum')[0],

		validRe = {
			octal: /^[0-7]{4}$/,
			human: /^([\-r][\-w][\-xSs]){2}[\-r][\-w][\-xtT]$/
		},

		octal2cb = function (octalstr) {
			var octalnum;

			if (!validRe.octal.test(octalstr)) {
				throw "Invalid octal";
			}
			octalnum = parseInt(octalstr, 8);

			$all_cb.each(function (i) {
				this.checked = !!((1 << (11 - i)) & octalnum);
			});
		},

		cb2octal = function () {
			var num = 0;

			$all_cb.each(function (i) {
				if (this.checked) {
					num += 1 << (11 - i);
				}
			});

			return num.toString(8).pad(4);
		},


		human2octal = function (str) {
			if (!validRe.human.test(str)) {
				throw "Invalid human-readable string";
			}

			return parseInt(
					(/s/i.test(str.charAt(2)) ? '1' : '0') +
					(/s/i.test(str.charAt(5)) ? '1' : '0') +
					(/t/i.test(str.charAt(8)) ? '1' : '0') +
					str.replace(/-|[ST]/g, '0').replace(/[^0]/g, '1'), 2
				).
				toString(8).
				pad(4);
		},

		octal2human = function (str) {
			var charMap = ["r", "w", "x"],
				specialMap = ["s", "s", "t"],
				special;

			if (!validRe.octal.test(str)) {
				throw "Invalid octal";
			}

			str = parseInt(str, 8).toString(2).pad(12);
			special = str.substring(0, 3);
			str = str.substring(3);

			return str.split('').map(function (e, i) {
					var mod = i % 3,
						index = Math.floor(i / 3);

					if (mod === 2 && special.charAt(index) === '1') {
						return e === "0" ? specialMap[index].toUpperCase() : specialMap[index];
					}
					return e === "0" ? '-' : charMap[mod];
				}).join('');
		},

		checkboxTrigger = function () {
			var oct = cb2octal();
			tf_oct.value = oct;
			tf_hum.value = octal2human(oct);
		},

		octalTrigger = function () {
			var octval = tf_oct.value.trim().pad(4);

			if (!validRe.octal.test(octval)) {
				tf_hum.value = "ERROR";
				octal2cb('0000');
				return;
			}
			octal2cb(octval);
			tf_hum.value = octal2human(octval);
		},

		humanTrigger = function () {
			var humval = tf_hum.value.trim(),
				octval;

			if (!validRe.human.test(humval)) {
				tf_oct.value = "ERROR";
				octal2cb('0000');
				return;
			}
			octval = human2octal(humval);
			tf_oct.value = octval;
			octal2cb(octval);
		};

	// re-order checkbox collection from "u-g-o-special" to "special-u-g-o"
	$all_cb = $.merge($all_cb.slice(9), $all_cb.slice(0, 9));

	$('#chmod_result_oct').on('keyup blur', octalTrigger);
	$('#chmod_result_hum').on('keyup blur', humanTrigger);
	$container.
		find('table').
		on('change', 'input:checkbox', checkboxTrigger).
		on('click', 'td', function (e) {
			if (e.target !== this) {
				return;
			}
			var $cb = $(this).find('input[type="checkbox"]');
			$cb.prop('checked', !$cb.prop('checked')).change();
		});
});

jsUtils.register("texttransform", function ($container, $) {
	"use strict";
	var $ta = $('#texttransform_ta');

	$('#texttransform_upper').on('click', function () {
		$ta.val($ta.val().toUpperCase());
	});
	$('#texttransform_lower').on('click', function () {
		$ta.val($ta.val().toLowerCase());
	});
	$('#texttransform_words').on('click', function () {
		$ta.val($ta.val().replace(/\b([A-Za-z])/g, function (a) {return a.toUpperCase();}));
	});
	$('#texttransform_ucfirst,#texttransform_lcfirst').on('click', function () {
		var transFunc = /ucfirst/.test(this.id) ? "toUpperCase" : "toLowerCase";

		$ta.val(
			$ta.
				val().
				mapLines(function (line) {
					var first = line.charAt(0),
						transformed = first[transFunc]();
					return transformed === first ? line : transformed + line.substring(1);
				})
		);
	});
});

jsUtils.register("textsort", function ($container, $) {
	"use strict";
	var $ta = $('#textsort_ta');

	$('#textsort_asc,#textsort_desc,#textsort_natasc,#textsort_natdesc').on('click', function () {
		var sortFunc = (/desc/.test(this.id) ? "r" : "") + (/_nat/.test(this.id) ? "natsort" : "sort");
		
		$ta.val($ta.val().split('\n')[sortFunc]().join('\n'));
	});
});

jsUtils.register('timestamps', function ($container, $) {
	"use strict";
	var $singleFields = $container.find('input:not([id])'),
		$timestamp = $('#timestamps_u'),
		$checkbox = $('#timestamps_utc'),
		useUTC = false,
		
		stampChanged = function () {
			var dateStr = new Date((parseInt($timestamp.val(), 10) * 1000) || 0).format("Y-m-d-H-i-s", useUTC);
			
			$singleFields.multiVal(dateStr.split('-'));
		},
		dateChanged = function () {
			var dateString = $singleFields.multiVal().join('-'),
				date = dateString.parseDate("Y-m-d-h-i-s", useUTC);
			
			$timestamp.val(parseInt(+date / 1000, 10));
		},
		utcChanged = function () {
			useUTC = !!this.checked;
			stampChanged();
		};
	
	
	$singleFields.on('input', dateChanged);
	$timestamp.val(parseInt(+new Date() / 1000, 10)).on('input', stampChanged);
	$checkbox.on('change', utcChanged).trigger('change');
});

jsUtils.register('rndstring', function ($container, $){
	"use strict";
	var $ta  = $('#rndstring_ta'),
		$sel = $('#rndstring_sel'),
		$chars = $('#rndstring_c'),
		$len = $('#rndstring_l'),
		getStringPool = (function () {
			var pool = {
					none: '',
					numeric: "0123456789",
					alpha_low: "abcdefghijklmnopqrstuvwxyz",
					hex: "ABCDEF0123456789",
					hex_low: "abcdef0123456789"
				};
			
			pool.alpha        = pool.alpha_low + pool.alpha_low.toUpperCase();
			pool.alphanum_low = pool.alpha_low + pool.numeric;
			pool.alphanum     = pool.alpha     + pool.numeric;

			return function (base, extra) {
				return (pool[base] || '') + extra;
			};
		}()),
		generate = function () {
			var len = parseInt($len.val(), 10),
				pool = getStringPool($sel.val(), $chars.val());
				
			$ta.val(pool.repeat(Math.ceil(len / pool.length)).shuffle().substring(0, len));
		};

	$sel.on('change', generate);
	$len.on('input', generate);
	$chars.on('input', generate).trigger('input');
});

jQuery(jsUtils.init);
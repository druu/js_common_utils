var jsUtils = (function (window, $, utils) {
	"use strict";
	var modules = {},
		activeModules,
		
		jsUtils = {};


	jsUtils.init = function () {
		var $sections, $row,
			prop,
			i,
			$body = $('body'),
			$content = $('#content');

		// get custom module activeModules from LocalStorage
		// TODO: d&d reactiveModulesing, enabling/disabling
		activeModules = utils.storage.get("jsutils-plugin-activeModules", null);
		if (!(activeModules instanceof Array) || !activeModules.length) {
			activeModules = [];
			for (prop in modules) {

				if (modules.hasOwnProperty(prop)) {
					activeModules.push(prop);
				}
			}
		}

		// instantiate
		for (i = 0; i < activeModules.length; i += 1) {
			
			if (modules[activeModules[i]] === "undefined") {
				continue;
			}

			$content.append(
				$('<div id="' + activeModules[i] + '" class="util span3"/>').html($('script[type="text/xtemplate"][data-module="' + activeModules[i] + '"]').html())
			);

			modules[activeModules[i]].apply(window, [activeModules[i], $('#' + activeModules[i]), $, utils]);
		}

		// force equal container height
		$sections = $('div.util');
		$sections.height(Math.max.apply(Math, $sections.map(function () { return $(this).height(); })));

		// search field
		$(document).on('keyup', function (e) {
			if ((e.charCode || e.keyCode) === 27) {
				$('div.util').removeClass('fullsize').show(0);
				$('#topbar_search').focus();
			}
		});

		$('#topbar_search').on('keyup', function (e) {
			var keywords, k, m;

			if ((e.charCode || e.keyCode) === 27) {
				$('#topbar_search').val("").trigger('keyup').blur();
				e.stopPropagation();
				return;
			}

			keywords = $('#topbar_search').val().replace(/[^A-Za-z0-9\_\-\s]/g, '').trim();
			if (!keywords.length) {
				keywords = ".";
			}
			keywords = keywords.split(/\s+/).map(function (word) { return new RegExp(word); });

			myfacewhenjshaslabels: for (m = 0; m < activeModules.length; m += 1) {
				for (k = 0; k < keywords.length; k += 1) {
					if (!keywords[k].test(activeModules[m])) {
						$('#' + activeModules[m]).hide();
						continue myfacewhenjshaslabels;
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
}(window, window.jQuery, window.utils));

jsUtils.register("urlencode", function (name, $container, $, utils) {
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

jsUtils.register("strlen", function (name, $container, $, utils) {
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

jsUtils.register("replace", function (name, $container, $, utils) {
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

jsUtils.register("base64", function (name, $container, $, utils) {
	"use strict";
	var $ta = $('#base64_ta');

	$('#base64_enc').click(function (e) {
		$ta.val(window.base64.encode($ta.val()));
	});
	$('#base64_dec').click(function (e) {
		try {
			$ta.val(window.base64.decode($ta.val()));
		} catch (ex) {}
	});
});

jsUtils.register("hash", function (name, $container, $, utils) {
	"use strict";

	var $ta = $('#hash_ta');
	$('#hash_md5, #hash_sha1, #hash_sha256').click(function () {
		var funcmap = {
			"hash_md5": window.md5,
			"hash_sha1": window.sha1,
			"hash_sha256": $.sha256
		};
		$ta.val(
			$ta.val().replace(/\r/g, "\n").replace(/\n{2,}/g, "\n").trim().split("\n").map(funcmap[this.id]).join("\n")
		);
	});
});

jsUtils.register("substr_count", function (name, $container, $, utils) {
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

jsUtils.register("chmod", function (name, $container, $, utils) {
	"use strict";
	var $all_cb     = $('.chmod_cb'),
		$sticky_sel = $('#chmod_sticky'),
		$chmod_oct  = $('#chmod_result_oct'),
		$chmod_hum  = $('#chmod_result_hum'),
		replaceAt = function(index, char, subject) {
			return subject.substr(0, index) + char + subject.substr(index+char.length);
		},
		permissions = (function() {
			var perms = {
				sticky : 0,
				owner  : 0,
				group  : 0,
				other  : 0
				},
				human_representation = [
					'---', '--x', '-w-', '-wx',
					'r--', 'r-x', 'rw-', 'rwx'
				],
				print = function(type, oct) {
					var output = human_representation[oct],
						perm_bs = perms[type].toString(2),
						sticky_bs = perms.sticky.toString(2),
						replacement = output.charAt(2),
						replace = function(s, p, i, f) {
							return s.charAt(i) === '1' && p.charAt(2) === '1' ? f.toLowerCase() : f.toUpperCase();
						},
						flag, i;

					perm_bs     = replaceAt(3 - perm_bs.length, perm_bs, '000');
					sticky_bs   = replaceAt(3 - sticky_bs.length, sticky_bs, '000');

					i = (type === 'owner' ? 0 : (type === 'group' ? 1 : 2) );

					flag = type === 'other' ? 't' : 's';

					if (sticky_bs.charAt(i) === '1') {
						replacement = replace(sticky_bs, perm_bs, i, flag);
						output = replaceAt(2, replacement, output);
					}

					return output;
				};

			perms.serialize = function(type) {
				var output = '';
				switch(type) {
					case 'human':
						output += print('owner', perms.owner) + print('group', perms.group) + print('other', perms.other);
						break;
					case 'octal':
						output = perms.sticky.toString() + perms.owner.toString() + perms.group.toString() + perms.other.toString();
						break;
					default:
						window.console.error('Invalid serialization method.');
				}
				return output;
			};
			return perms;
		}()),
		update = function(which) {
			switch (which) {
				case "octal":
					$chmod_oct.val(permissions.serialize('octal'));
					break;
				case "human":
					$chmod_hum.val(permissions.serialize('human'));
					break;
				default:
					$chmod_oct.val(permissions.serialize('octal'));
					$chmod_hum.val(permissions.serialize('human'));
			}
		};


	$all_cb.on('change', function(e) {
		var $this = $(this);
		permissions[$this.data('name')] += parseInt(this.value, 10) * ($this.is(':checked') ? 1 : -1);
		update();
	});

	$sticky_sel.on('change', function() {
		permissions.sticky = parseInt($(this).val(), 10);
		update();
	});

	$('#chmod_update_oct').on('click', function(e) {
		var val = $chmod_oct.val().replace(/[^0-7]/g, 0),
			len = val.length,
			p_groups = {
				sticky : 0,
				owner  : 1,
				group  : 2,
				other  : 3
			},
			p_vals = [4,2,1],
			i, el, bs, bs_sticky, checked;

		if (len === 3) {
			val = replaceAt(1, val, '0000');
		}
		else if (len !== 4) {
			val = replaceAt(0, val, '0000');
		}
		len = 4;
		$chmod_oct.val(val);

		$all_cb.attr('checked', false);

		permissions.sticky = parseInt(val.charAt(0), 10);
		permissions.owner  = parseInt(val.charAt(1), 10);
		permissions.group  = parseInt(val.charAt(2), 10);
		permissions.other  = parseInt(val.charAt(3), 10);

		bs_sticky = permissions.sticky.toString(2);
		bs_sticky = replaceAt(3 - bs_sticky.length, bs_sticky, '000');

		for(el in permissions) {
			if (permissions.hasOwnProperty(el) && el !== 'print' && el !== 'serialize' && el !== 'sticky') {

				bs = permissions[el].toString(2);
				bs = replaceAt(3 - bs.length, bs, '000');

				for(i = 0; i < 3; i +=1) {
					checked = bs.charAt(i) === '1';
					if (i === 2 && bs_sticky.charAt(p_groups.el) === '1') {
						checked = false;
					}

					$all_cb.
						filter('[data-name='+el+']').
						filter('[value='+p_vals[i]+']').
						attr('checked', checked);
				}

			}
		}
		$sticky_sel.val(permissions.sticky);
		update('human');

	});

	$('#chmod_update_hum').on('click', function(e) {
		e.preventDefault();
		e.stopPropagation();

		var val          = $chmod_hum.val().replace(/[^rwxstST\-]/g, '-'),
			len          = val.length,
			sticky       = '',
			special_case = false,
			checked      = false,
			v_input      = [4,2,1],
			m, n, i, c;

		if (len !== 9) {
			val = replaceAt(0, val, '---------');
			len = 9;
		}

		permissions.sticky = permissions.owner = permissions.group = permissions.other = 0;
		for (i = 0; i < 9; i += 1) {

			special_case = false;
			n = (i < 3 ? 'owner' : (i < 6 ? 'group' : 'other'));
			c = val.charAt(i);
			m = i % 3;

			if (m === 0) {
				c = (/[r\-]/.test(c)) ? c : '-';
			}
			else if (m === 1) {
				c = (/[w\-]/.test(c)) ? c : '-';
			}
			else {
				if(n === 'other') {
					c = (/[xtT\-]/.test(c)) ? c : '-';
				}
				else {
					c = (/[xsS\-]/.test(c)) ? c : '-';
				}
			}
			val = replaceAt(i, c, val);

			checked = c !== '-';

			if ( m === 2 && c !== c.toLowerCase()){
				checked = false;
			}

			permissions[n] += checked ? parseInt(v_input[m], 10) : 0;

			$all_cb.
				filter('[data-name='+n+']').
				filter('[value='+v_input[m]+']').
				attr('checked', checked);
		}

		$chmod_hum.val(val);

		sticky += val.charAt(2).toLowerCase() === 's' ? '1' : '0';
		sticky += val.charAt(5).toLowerCase() === 's' ? '1' : '0';
		sticky += val.charAt(8).toLowerCase() === 't' ? '1' : '0';

		permissions.sticky = parseInt(sticky, 2);

		$sticky_sel.val(permissions.sticky);

		update('octal');
	});
});

jsUtils.register("chmod2", function (name, $container, $, utils) {
	"use strict";
	var $all_cb = $container.find('input[type="checkbox"]'),
		tf_oct = $('#chmod2_result_oct')[0],
		tf_hum = $('#chmod2_result_hum')[0],

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

			return utils.string.pad(num.toString(8), 4);
		},


		human2octal = function (str) {
			if (!validRe.human.test(str)) {
				throw "Invalid human-readable string";
			}

			str = parseInt(
				(/s/i.test(str.charAt(2)) ? '1' : '0') +
				(/s/i.test(str.charAt(5)) ? '1' : '0') +
				(/t/i.test(str.charAt(8)) ? '1' : '0') +
				str.replace(/-|[ST]/g, '0').replace(/[^0]/g, '1'), 2).
				toString(8);
			return utils.string.pad(str, 4);
		},

		octal2human = function (str) {
			var charMap = ["r", "w", "x"],
				specialMap = ["s", "s", "t"],
				special;

			if (!validRe.octal.test(str)) {
				throw "Invalid octal";
			}

			str = utils.string.pad(parseInt(str, 8).toString(2), 12);
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

		checkboxTrigger = function (e) {
			var oct = cb2octal();
			tf_oct.value = oct;
			tf_hum.value = octal2human(oct);
		},

		octalTrigger = function (e) {
			var octval = tf_oct.value.trim();

			if (!validRe.octal.test(octval)) {
				tf_hum.value = "ERROR";
				octal2cb('0000');
				return;
			}
			octal2cb(octval);
			tf_hum.value = octal2human(octval);
		},

		humanTrigger = function (e) {
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

	$('#chmod2_result_oct').on('keyup blur', octalTrigger);
	$('#chmod2_result_hum').on('keyup blur', humanTrigger);
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

jsUtils.register("texttransform", function (name, $container, $, utils) {
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
				replace(/\r/g, "\n").
				replace(/\n{2,}/g, "\n").
				split("\n").
				map(function (line) {
					var first = line.charAt(0),
						transformed = first[transFunc]();
					return transformed === first ? line : transformed + line.substring(1);
				}).
				join("\n")
		);
	});
});

jsUtils.register("textsort", function (name, $container, $, utils) {
	"use strict";
	var $ta = $('#textsort_ta');

	$('#textsort_asc,#textsort_desc,#textsort_natasc,#textsort_natdesc').on('click', function () {
		var val = $ta.
				val().
				replace(/\r/g, "\n").
				replace(/\n{2,}/g, "\n").
				split("\n");

		if (/_nat/.test(this.id)) {
			val.sort(window.naturalSort);
		} else {
			val.sort();
		}
		if (/desc/.test(this.id)) {
			val.reverse();
		}
		$ta.val(val.join('\n'));
	});
});

jsUtils.register('timestamps', function (name, $container, $, utils) {
	"use strict";
	var $singleFields = $container.find('input:not([id])'),
		$timestamp = $('#timestamps_u'),
		$checkbox = $('#timestamps_utc'),
		useUTC = false,
		
		stampChanged = function () {
			var date = new Date((parseInt($timestamp.val(), 10) * 1000) || 0),
				dateStr = utils.date.format("Y-m-d-H-i-s", date, useUTC);
			
			$singleFields.multiVal(dateStr.split('-'));
		},
		dateChanged = function () {
			var dateString = $singleFields.multiVal().join('-'),
				date = utils.date.parse(dateString, "Y-m-d-h-i-s", useUTC);
			
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

jsUtils.register('rndstring', function (name, $container, $, utils){
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
				
			$ta.val(utils.string.shuffle(utils.string.repeat(pool, Math.ceil(len / pool.length))).substring(0, len));
		};

	$sel.on('change', generate);
	$len.on('input', generate);
	$chars.on('input', generate).trigger('input');
});

jQuery(function($){
	$('body').on('click', 'h2', function(){
		var $container = $(this).parent();
		$container.toggleClass('fullsize');
		$container.siblings().toggle(0, 'hide');
	});
});

jQuery(jsUtils.init);
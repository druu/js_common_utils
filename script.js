/** global jQuery: true, $:true */
var jQuery = window.jQuery;

(function ($) {
	var $ta = $('#urlencode_ta');
	$('#urlencode_enc').click(function (e) {
		$ta.val(encodeURIComponent($ta.val()).replace(/%20/g, '+'));
	});
	$('#urlencode_dec').click(function (e) {
		$ta.val(decodeURIComponent($ta.val()).replace(/\+/g, ' '));
	});
	$('#urlencode_esc_enc').click(function (e) {
		$ta.val(window.escape($ta.val()));
	});
	$('#urlencode_esc_dec').click(function (e) {
		$ta.val(window.unescape($ta.val()));
	});
}(jQuery));



(function ($) {
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
		console.log(mode);
		measure();
	});
	$ta.bind('keyup paste click blur focus', measure);
	measure();
}(jQuery));



(function ($) {
	var $container = $('#replace'),
		$ta_from = $container.find('textarea:first'),
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

}(jQuery));



(function ($) {
	var $ta = $('#base64_ta');
	$('#base64_enc').click(function (e) {
		$ta.val(window.base64.encode($ta.val()));
	});
	$('#base64_dec').click(function (e) {
		try {
			$ta.val(window.base64.decode($ta.val()));
		} catch (ex) {}
	});
}(jQuery));

(function ($) {
	var $ta = $('#hash_ta');
	$('#hash_md5, #hash_sha1, #hash_sha256').click(function () {
		var funcmap = {
			"hash_md5": window.md5,
			"hash_sha1": window.sha1,
			"hash_sha256": $.sha256,
		};
		$ta.val(
			$ta.val().replace(/\r/g, "\n").replace(/\n{2,}/g, "\n").trim().split("\n").map(funcmap[this.id]).join("\n")
		);
	});
}(jQuery));



(function ($) {
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
}(jQuery));

(function($) {
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
		})(),
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
			i, el, bs, bs_sticky, special_case, checked;

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
					if (i == 2 && bs_sticky.charAt(p_groups[el]) === '1') {
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
			v            = {
				'r' : 4,
				'w' : 2,
				'x' : 1, 's' : 1, 'S' : 1, 't' : 1, 'T' : 1,
				'-' : 0
			},
			v_input      = [4,2,1],
			m, n, i, c, sb, sgid, suid;

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
})(jQuery);

jQuery(document).ready(function($){
	var $all_sections = $('section'),
		min_height = 0;

	$all_sections.each(function(){var h = $(this).height(); min_height = h > min_height ? h : min_height;}).height(min_height);


});

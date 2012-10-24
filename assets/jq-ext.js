jQuery.single = (function ($) {
	var $elem = $([]);
		
	return function (elem) {
		$elem[0] = elem[0] || elem;
		return $elem;
	};
}(jQuery));


/**
 * wrapAround true:
 * [ ][ ][ ][ ][ ] + Arr(1,2,3) --> [1][2][3][ ][ ]
 * wrapAround false:
 * [ ][ ][ ][ ][ ] + Arr(1,2,3) --> [1][2][3][1][2]
 */
jQuery.fn.multiVal = function (values, wrapAround) {
	var bound,
		ret;
	
	if (typeof values === "undefined") {
		ret = [];
		this.each(function () {
			ret.push(this.val());
		});
		return ret;
	}
	
	if (!(values instanceof Array)) {
		this.val(String(values));
		return this;
	}
	
	bound = (wrapAround && this.length) || Math.min(this.length, values.length);
	return this.each(function (i) {
		$(this).val(values[i % values.length]);
	});
};

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
			ret.push($(this).val());
		});
		return ret;
	}
	
	if (!Array.isArray(values)) {
		this.val(String(values));
		return this;
	}
	
	bound = (wrapAround && this.length) || Math.min(this.length, values.length);
	return this.each(function (i) {
		$(this).val(values[i % values.length]);
	});
};
var base64 = (function (obj) {
  "use strict";

  var a64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  var a256 = '';
  var r64 = new Array(256);
  var r256 = new Array(256);
  var i = 0;
  while (i < 256) {
    var c = String.fromCharCode(i);
    a256 += c;
    r256[i] = i;
    r64[i] = a64.indexOf(c);
    ++i;
  }

  function code(s, discard, alpha, beta, w1, w2) {
    s = String(s);
    var buffer = 0;
    var i = 0;
    var length = s.length;
    var result = '';
    var bitsInBuffer = 0;
    while (i < length) {
      var c = s.charCodeAt(i);
      c = c < 256 ? alpha[c] : -1;
      if (c === -1) {
        throw new RangeError();
      }
      buffer = (buffer << w1) + c;
      bitsInBuffer += w1;
      while (bitsInBuffer >= w2) {
        bitsInBuffer -= w2;
        var tmp = buffer >> bitsInBuffer;
        result += beta.charAt(tmp);
        buffer ^= tmp << bitsInBuffer;
      }
      ++i;
    }
    if (!discard && bitsInBuffer > 0) {
      result += beta.charAt(buffer << (w2 - bitsInBuffer));
    }
    return result;
  }

  obj.encode = function (s) {
    s = code(s, false, r256, a64, 8, 6);
    return s + '===='.slice((s.length % 4) || 4);
  };

  obj.decode = function (s) {
    s = String(s).split('=');
    var i = s.length;
    do {
      --i;
      if (s[i].length % 4 === 1) {
        throw new RangeError();
      }
      s[i] = code(s[i], true, r64, a256, 6, 8);
    } while (i > 0);
    return s.join('');
  };

  return obj;
}({}));

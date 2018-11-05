'use strict';

var _extend = require('extend');

var _extend2 = _interopRequireDefault(_extend);

var _cryptoJs = require('crypto-js');

var _cryptoJs2 = _interopRequireDefault(_cryptoJs);

var _loaderUtils = require('loader-utils');

var _base = require('./base64');

var _aes = require('./aes');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var encrypts = {
	'base64': _base.Encrypt,
	'aes': _aes.Encrypt
};

function EncryptBase64(content, options) {
	var str = _cryptoJs2.default.enc.Utf8.parse(content);
	var base64 = _cryptoJs2.default.enc.Base64.stringify(str);

	if (!options.decode) return '\'' + base64 + '\'';

	// 加密后解密
	var res = '(function() {\n\t\tvar CryptoJS = require(\'crypto-js\');\n\t\tvar content = CryptoJS.enc.Base64.parse(\'' + base64 + '\').toString(CryptoJS.enc.Utf8);\n\t\treturn new Function(\'return \'+ content)();\n\t})()';

	return res;
}

function encrypt(content, options) {
	var res = void 0,
	    fn = null;

	if (typeof options.transform == 'function') {
		fn = options.transform;
	} else {
		fn = encrypts[options.transform];
	}

	if (fn) {
		try {
			res = fn.call(this, content, options);
		} catch (e) {
			throw e;
		}
	}

	return (options.mode == 'file' ? 'module.exports=' : '') + res;
}

module.exports = function (source) {
	var self = this,
	    options = (0, _extend2.default)(true, {
		mode: 'block',
		tag: 'encrypt',
		decode: true,
		transform: 'base64'
	}, (0, _loaderUtils.getOptions)(self));

	if (self.cacheable) self.cacheable();

	var content = source;

	if (options.mode == 'file') {
		content = encrypt.call(self, content, options);
	} else {
		var tagReg = new RegExp('(?:/\\*\\s*<' + options.tag + '>\\s*\\*/|//\\s*<' + options.tag + '>)([\\s\\S]*?)(?:/\\*\\s*</' + options.tag + '>\\s*\\*/|//\\s*</' + options.tag + '>)', 'g');
		content = content.replace(tagReg, function (m, cont) {
			var res = encrypt.call(self, cont, options);
			return res;
		});
	}

	return content;
};
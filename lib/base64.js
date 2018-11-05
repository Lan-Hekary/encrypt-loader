'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Decrypt = exports.Encrypt = undefined;

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _cryptoJs = require('crypto-js');

var _cryptoJs2 = _interopRequireDefault(_cryptoJs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Encrypt(data, options) {
	if ((typeof data === 'undefined' ? 'undefined' : (0, _typeof3.default)(data)) == 'object') {
		data = (0, _stringify2.default)(data);
	}
	var str = _cryptoJs2.default.enc.Utf8.parse(data);
	var base64 = _cryptoJs2.default.enc.Base64.stringify(str);

	if (!options.decode) return '\'' + base64 + '\'';

	// 加密后解密
	var res = '(function() {\n\t\tvar Base64 = require(\'encrypt-loader/lib/base64\');\n\t\treturn Base64.Decrypt(\'' + base64 + '\');\n\t})()';

	return res;
}

function Decrypt(str) {
	var content = _cryptoJs2.default.enc.Base64.parse(str).toString(_cryptoJs2.default.enc.Utf8);
	return new Function('return ' + content)();
}

exports.Encrypt = Encrypt;
exports.Decrypt = Decrypt;
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

var aesKey = 'WWsU007HWkQVs2yR';
var aesOpts = {
	mode: _cryptoJs2.default.mode.ECB,
	padding: _cryptoJs2.default.pad.Pkcs7
};

function Encrypt(data, options) {
	if ((typeof data === 'undefined' ? 'undefined' : (0, _typeof3.default)(data)) == 'object') {
		data = (0, _stringify2.default)(data);
	}

	var str = _cryptoJs2.default.enc.Utf8.parse(data);
	var encrypted = _cryptoJs2.default.AES.encrypt(str, aesKey, aesOpts).toString();

	if (!options.decode) return '\'' + encrypted + '\'';

	// 加密后解密
	var res = '(function() {\n\t\tvar AES = require(\'encrypt-loader/lib/aes\');\n\t\treturn AES.Decrypt(\'' + encrypted + '\');\n\t})()';

	return res;
}

function Decrypt(str) {
	var decrypt = _cryptoJs2.default.AES.decrypt(str, aesKey, aesOpts);
	var content = _cryptoJs2.default.enc.Utf8.stringify(decrypt).toString();
	return new Function('return ' + content)();
}

exports.Encrypt = Encrypt;
exports.Decrypt = Decrypt;
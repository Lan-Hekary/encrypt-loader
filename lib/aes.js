"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Encrypt = Encrypt;
exports.Decrypt = Decrypt;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _cryptoJs = _interopRequireDefault(require("crypto-js"));

var aesKey = 'WWsU007HWkQVs2yR';
var aesOpts = {
  mode: _cryptoJs.default.mode.ECB,
  padding: _cryptoJs.default.pad.Pkcs7
};

function Encrypt(data, options) {
  if ((0, _typeof2.default)(data) == 'object') {
    data = JSON.stringify(data);
  }

  var str = _cryptoJs.default.enc.Utf8.parse(data);

  var encrypted = _cryptoJs.default.AES.encrypt(str, aesKey, aesOpts).toString();

  if (!options.decode) return "'".concat(encrypted, "'"); // 加密后解密

  var res = "(function() {\n\t\tvar AES = require('encrypt-loader/lib/aes');\n\t\treturn AES.Decrypt('".concat(encrypted, "');\n\t})()");
  return res;
}

function Decrypt(str) {
  var decrypt = _cryptoJs.default.AES.decrypt(str, aesKey, aesOpts);

  var content = _cryptoJs.default.enc.Utf8.stringify(decrypt).toString();

  return new Function('return ' + content)();
}
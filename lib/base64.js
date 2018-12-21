"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Encrypt = Encrypt;
exports.Decrypt = Decrypt;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _cryptoJs = _interopRequireDefault(require("crypto-js"));

function Encrypt(data, options) {
  if ((0, _typeof2.default)(data) == 'object') {
    data = JSON.stringify(data);
  }

  var str = _cryptoJs.default.enc.Utf8.parse(data);

  var base64 = _cryptoJs.default.enc.Base64.stringify(str);

  if (!options.decode) return "'".concat(base64, "'"); // 加密后解密

  var res = "(function() {\n\t\tvar Base64 = require('encrypt-loader/lib/base64');\n\t\treturn Base64.Decrypt('".concat(base64, "');\n\t})()");
  return res;
}

function Decrypt(str) {
  var content = _cryptoJs.default.enc.Base64.parse(str).toString(_cryptoJs.default.enc.Utf8);

  return new Function('return ' + content)();
}
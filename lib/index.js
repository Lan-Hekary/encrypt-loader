"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _extend = _interopRequireDefault(require("extend"));

var _loaderUtils = require("loader-utils");

var _base = require("./base64");

var _aes = require("./aes");

var _uglifyJs = _interopRequireDefault(require("uglify-js"));

var encrypts = {
  'base64': _base.Encrypt,
  'aes': _aes.Encrypt
};

function encrypt(content, options) {
  var res,
      fn = null;

  if (typeof options.transform == 'function') {
    fn = options.transform;
  } else {
    fn = encrypts[options.transform];
  }

  if (options.minify) {
    try {
      var _UglifyJS$minify = _uglifyJs.default.minify(options.minifyPrefix + content, options.uglifyOptions),
          code = _UglifyJS$minify.code;

      content = code.substr(options.minifyPrefix.length);
    } catch (err) {
      process.stdout.write("encrypt-loader minify fail: ".concat(this.resourcePath, "\n"));
    }
  }

  if (fn) {
    try {
      res = fn.call(this, content, options);
    } catch (e) {
      throw e;
    }
  }

  return res;
}

module.exports = function (source) {
  var self = this,
      options = (0, _extend.default)(true, {
    mode: 'block',
    tag: 'encrypt',
    decode: true,
    transform: 'base64',
    minify: true,
    minifyPrefix: 'module.exports=',
    uglifyOptions: {
      output: {
        beautify: false,
        comments: false,
        ascii_only: true
      }
    }
  }, (0, _loaderUtils.getOptions)(self)); // options.uglifyOptions.output.comments = new RegExp(`<\\/?${options.tag}>`)

  if (self.cacheable) self.cacheable();

  if (options.mode == 'file') {
    source = encrypt.call(self, source, options);
  } else {
    var tagReg = new RegExp("(?:/\\*\\s*<".concat(options.tag, ">\\s*\\*/|//\\s*<").concat(options.tag, ">)([\\s\\S]*?)(?:/\\*\\s*</").concat(options.tag, ">\\s*\\*/|//\\s*</").concat(options.tag, ">)"), 'g');
    source = source.replace(tagReg, function (m, cont) {
      return encrypt.call(self, cont, options);
    });
  }

  return (options.mode == 'file' ? 'module.exports = ' : '') + source;
};
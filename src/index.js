import extend from 'extend'
import CryptoJS from 'crypto-js'
import {getOptions} from 'loader-utils'
import {Encrypt as Base64} from './base64'
import {Encrypt as AES} from './aes'

const encrypts = {
	'base64': Base64,
	'aes': AES
}

function EncryptBase64(content, options) {
	const str = CryptoJS.enc.Utf8.parse(content);
	const base64 = CryptoJS.enc.Base64.stringify(str);

	if(!options.decode) return `'${base64}'`

	// 加密后解密
	let res = `(function() {
		var CryptoJS = require('crypto-js');
		var content = CryptoJS.enc.Base64.parse('${base64}').toString(CryptoJS.enc.Utf8);
		return new Function('return '+ content)();
	})()`

	return res
}

function encrypt(content, options) {
	let res,
		fn = null

	if(typeof options.transform=='function') {
		fn = options.transform
	}else{
		fn = encrypts[options.transform]
	}

	if(fn) {
		try {
			res = fn.call(this, content, options)
		}catch(e){
			throw e;
		}
	}

	return (options.mode=='file' ? 'module.exports=' : '') + res
}

module.exports = function(source) {
	const self = this,
		options = extend(true, {
			mode: 'block',
			tag: 'encrypt',
			decode: true,
			transform: 'base64'
		}, getOptions(self));

	if (self.cacheable) self.cacheable();

	let content = source

	if(options.mode=='file') {
		content = encrypt.call(self, content, options)
	}else{
		let tagReg = new RegExp(`(?:/\\*\\s*<${options.tag}>\\s*\\*/|//\\s*<${options.tag}>)([\\s\\S]*?)(?:/\\*\\s*</${options.tag}>\\s*\\*/|//\\s*</${options.tag}>)`, 'g')
		content = content.replace(tagReg, function(m, cont) {
			let res = encrypt.call(self, cont, options)
			return res
		})
	}

	return content;
};

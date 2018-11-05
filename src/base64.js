import CryptoJS from 'crypto-js'

function Encrypt(data, options){
	if(typeof data=='object') {
		data = JSON.stringify(data)
	}
	const str = CryptoJS.enc.Utf8.parse(data);
	const base64 = CryptoJS.enc.Base64.stringify(str);

	if(!options.decode) return `'${base64}'`

	// 加密后解密
	let res = `(function() {
		var Base64 = require('encrypt-loader/lib/base64');
		return Base64.Decrypt('${base64}');
	})()`

	return res
}

function Decrypt(str){
	const content = CryptoJS.enc.Base64.parse(str).toString(CryptoJS.enc.Utf8);
	return new Function('return '+ content)();
}

export {
	Encrypt,
	Decrypt
}

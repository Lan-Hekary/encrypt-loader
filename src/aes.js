import CryptoJS from 'crypto-js'

const aesKey = 'WWsU007HWkQVs2yR'
const aesOpts = {
	mode:CryptoJS.mode.ECB,
	padding: CryptoJS.pad.Pkcs7
}

function Encrypt(data, options){
	if(typeof data=='object') {
		data = JSON.stringify(data)
	}

	const str = CryptoJS.enc.Utf8.parse(data);
	const encrypted = CryptoJS.AES.encrypt(str, aesKey, aesOpts).toString();

	if(!options.decode) return `'${encrypted}'`

	// 加密后解密
	let res = `(function() {
		var AES = require('encrypt-loader/lib/aes');
		return AES.Decrypt('${encrypted}');
	})()`

	return res
}

function Decrypt(str){
	const decrypt = CryptoJS.AES.decrypt(str, aesKey, aesOpts);
	const content = CryptoJS.enc.Utf8.stringify(decrypt).toString();
	return new Function('return '+ content)();
}

export {
	Encrypt,
	Decrypt
}

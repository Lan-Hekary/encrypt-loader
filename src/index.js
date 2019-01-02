import extend from 'extend'
import {getOptions} from 'loader-utils'
import {Encrypt as Base64} from './base64'
import {Encrypt as AES} from './aes'
import UglifyJS from 'uglify-js'

const encrypts = {
	'base64': Base64,
	'aes': AES
}

function encrypt(content, options) {
	let res,
		fn = null

	if(typeof options.transform=='function') {
		fn = options.transform
	}else{
		fn = encrypts[options.transform]
	}

	if(options.minify) {
		try {
			let {code} = UglifyJS.minify(options.minifyPrefix + content, options.uglifyOptions);
			content = code.substr(options.minifyPrefix.length)
		}catch(err) {
			process.stdout.write(`encrypt-loader minify fail: ${this.resourcePath}\n`)
		}
	}

	if(fn) {
		try {
			res = fn.call(this, content, options)
		}catch(e){
			throw e;
		}
	}

	return res
}

module.exports = function(source) {
	const self = this,
		options = extend(true, {
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

		}, getOptions(self));

	// options.uglifyOptions.output.comments = new RegExp(`<\\/?${options.tag}>`)

	if (self.cacheable) self.cacheable();

	if(options.mode=='file') {
		source = encrypt.call(self, source, options)
	}else{
		let tagReg = new RegExp(`(?:/\\*\\s*<${options.tag}>\\s*\\*/|//\\s*<${options.tag}>)([\\s\\S]*?)(?:/\\*\\s*</${options.tag}>\\s*\\*/|//\\s*</${options.tag}>)`, 'g')
		source = source.replace(tagReg, (m, cont) => encrypt.call(self, cont, options))
	}

	return (options.mode == 'file' ? 'module.exports = ' : '') + source;
};

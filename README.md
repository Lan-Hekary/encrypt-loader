# Introduction

`encrypt-loader`It is Webpack's module transcoding loader, which can specify blocks and files according to label transcoding, and can support real-time decoding. The original intention of this loader is to make some configuration files not so conspicuously exist in the file, so that people can not find it at a glance. The file built by webpack itself has the obfuscated attribute, and the transcoding and decoding process can slightly increase the difficulty of cracking

**Modified and Translated by Ahmed El-Sharnoby**

## use

npm

```batch
npm i encrypt-loader -D
```

yarn

```batch
yarn add encrypt-loader -D
```

webpack.config.js

```javascript
module.exports = {
	rules: [
		{
			test: /\.js$/,
			use: [
				{
					loader: "babel-loader?cacheDirectory", // babel
				},
				{
					loader: "encrypt-loader",
					options: {
						mode: "block", // block mode
						decode: true, // decode(iife)
					},
				},
			],
		},
		{
			test: /\.json$/,
			use: {
				loader: "encrypt-loader",
				options: {
					mode: "file", // file mode
					decode: true, // decode(iife)
					transform: "aes", // aes|base64
				},
			},
		},
	],
};
```

apis.js

```javascript
const APIS = /*<encrypt>*/ {
	info: "GET:/common/info",
	menu: "GET:/common/menu",
	login: "POST:/login",
	captcha: "GET:/captcha",
	banner: "GET:/banner/code",
}; /*</encrypt>*/

export default APIS;
```

when mode=`block`, the loader will identify the block to be transcoded according to the label (configurable)

After Webpack:

```javascript
exports.__esModule = true;
var APIS = (function () {
	var Base64 = __webpack_require__(
		"./node_modules/encrypt-loader/lib/base64.js"
	);
	return Base64.Decrypt(
		"ewoJaW5mbyAgICAgICA6ICdHRVQ6L2NvbW1vbi9pbmZvJywKCW1lbnUgICAgICAgOiAnR0VUOi9jb21tb24vbWVudScsCglsb2dpbiAgICAgIDogJ1BPU1Q6L2xvZ2luJywKCWNhcHRjaGEgICAgOiAnR0VUOi9jYXB0Y2hhJywKCWJhbm5lciAgICAgOiAnR0VUOi9iYW5uZXIvY29kZScKfQ=="
	);
})();
exports.default = APIS;
```

var.json

```json
{
	"view": 10,
	"cool": true,
	"users": [
		{
			"name": "Who am i?",
			"age": "??"
		},
		{
			"name": "东东",
			"age": 20
		},
		{
			"name": "丽丽",
			"age": 18
		}
	]
}
```

When mode=`file` ，loader will transcode the entire file

After Webpack:

```javascript
module.exports = (function () {
	var AES = __webpack_require__("./node_modules/encrypt-loader/lib/aes.js");
	return AES.Decrypt(
		"U2FsdGVkX1+kWL42w6tkMHs3ls10g/WpxZtAOOedjzwRAVMeqhi/IeOonUbKAngR8iDUdDlz/U3DD3aDNJaH0HF7IL+ZimCeStIJHp4b1pvafuk83mFAc9h6etK3vPDs9eiKujh5F86XUGFInqDYqQNqLk7TX2U42P/NUfsvsKsFC6JinkrWZ+oS/kB8YUMteIC4tg8R/P5Omu4DtSQtqqzeOW95TJ6RIoDX5bmbN/0zkAZMRjIZBqKjYaSErDbrRB0Xfc61G9biiQvIBcrBxQ=="
	);
})();
```

## Precautions

When used with babel-loader, if encrypt-loader is called after babel-loader, a `;` semicolon must be added at the end.
Consider the following example

rules are configured as:

```javascript
{
	test: /\.js$/,
	use: [
		'encrypt-loader'  // 再转码
		'babel-loader?cacheDirectory',  // 先babel转换
	]
}
```

test.js

```javascript
const APIS = /*<encrypt>*/ {
	info: "GET:/common/info",
	menu: "GET:/common/menu",
	test: {
		user: "GET:/user/info",
	},
}; /*</encrypt>*/
```

After Babel is compiled, it will become:

```javascript
var APIS = /*<encrypt>*/ {
	info: "GET:/common/info",
	menu: "GET:/common/menu",
	test: {
		user: "GET:/user/info",
	} /*</encrypt>*/,
};
```

> The comment tags are messed up... This will cause webpack to report an error after transcoding, because after transcoding, `}` will be left, and the syntax is wrong~~~

**Add a semicolon test.js at the end**

```javascript
const APIS = /*<encrypt>*/ {
	info: "GET:/common/info",
	menu: "GET:/common/menu",
	test: {
		user: "GET:/user/info",
	},
}; /*</encrypt>*/
// There is a semicolon at the end of the above line
```

After Babel is compiled, everything is back to normal:

```javascript
var APIS = /*<encrypt>*/ {
	info: "GET:/common/info",
	menu: "GET:/common/menu",
	test: {
		user: "GET:/user/info",
	},
}; /*</encrypt>*/
```

**Therefore** , it is recommended to transcode before babel-loader, do not use ES6 syntax in the source code~

### compression

Now only the part that needs to be transcoded will be compressed. In most cases, the transcoding part will be a value, but Uglify-js cannot compress the pure value, so it will add a `module.exports=`prefix before compressing. If the compression fails, please check the prefix and add Is the grammar after the correct

The process is as follows:

```javascript
const test = /*<encrypt>*/ [
	// test
	"test",
	"abc",
]; /*</encrypt>*/
```

The transcoding part is recognized as:

```javascript
[
	// test
	"test",
	"abc",
];
```

Converted to:

```javascript
module.exports = [
	// test
	"test",
	"abc",
];
```

Call compression:

```javascript
UglifyJS.minify(
	`module.exports=[
	// test
	"test",
	"abc"
];`,
	options.uglifyOptions
);
```

Intercept the compressed code, and finally:

```javascript
["test", "abc"];
```

## Options

```javascript
{
	mode: 'block', // Mode: Support block block transcoding, file entire file transcoding
	tag: 'encrypt', // Tag: mode==block, identify the transcoding block identifier. Example: <encrypt>code</encrypt>
	decode: true, // Decode: iife returns the decoded value, if set to false, it will directly return the transcoded value
	string: false, // if true it will return the decoded value as String not as a funtion that will need to be evaluated.
	transform: 'base64', // Transcoding method (string|fn ): Built-in support for base64, aes, custom methods can be set fn(content, options)
	minify: true, // enable compression, uglify-js
	minifyPrefix: 'module.exports=',  // compression part will add `module. exports=`Prefix and then compress (do not include spaces, otherwise the spaces will be lost after compression, and an error will be intercepted)
	uglifyOptions: { // Compression option
		output: {
			beautify: false,
			comments: false,
			ascii_only: true
		}
	}
}
```

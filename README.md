# 介绍
`encrypt-loader`是Webpack的模块转码loader，能根据标签转码指定块、文件，可支持实时解码。
这个loader的本意是，让一些配置文件不那么显眼的存在文件里，让人一眼就找到，webpack构建的文件本身就带了混淆属性，加上转码解码过程，可以稍微增加点破解难度（心理上的?...）

## 使用
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
			use: [{
				loader: 'babel-loader?cacheDirectory' // babel
			}, {
				loader: 'encrypt-loader',
				options: {
					mode: 'block', // block mode
					decode: true // decode(iife)
				}
			}]
		},
		{
			test: /\.json$/,
			use: {
				loader: 'encrypt-loader',
				options: {
					mode: 'file', // file mode
					decode: true, // decode(iife)
					transform: 'aes' // aes|base64
				}
			}
		}
	]
}
```

apis.js
```javascript
const APIS = /*<encrypt>*/{
	info       : 'GET:/common/info',
	menu       : 'GET:/common/menu',
	login      : 'POST:/login',
	captcha    : 'GET:/captcha',
	banner     : 'GET:/banner/code'
}/*</encrypt>*/

export default APIS
```
mode=`block`时，loader将根据`encrypt`标签（可配置）识别需要转码的块

构建后：
```javascript
exports.__esModule = true;
var APIS = function () {
	var Base64 = __webpack_require__("./node_modules/encrypt-loader/lib/base64.js");
	return Base64.Decrypt('ewoJaW5mbyAgICAgICA6ICdHRVQ6L2NvbW1vbi9pbmZvJywKCW1lbnUgICAgICAgOiAnR0VUOi9jb21tb24vbWVudScsCglsb2dpbiAgICAgIDogJ1BPU1Q6L2xvZ2luJywKCWNhcHRjaGEgICAgOiAnR0VUOi9jYXB0Y2hhJywKCWJhbm5lciAgICAgOiAnR0VUOi9iYW5uZXIvY29kZScKfQ==');
}();
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
mode=`file`时，loader将转码整个文件

构建后：
```javascript
module.exports=(function() {
	var AES = __webpack_require__("./node_modules/encrypt-loader/lib/aes.js");
	return AES.Decrypt('U2FsdGVkX1+kWL42w6tkMHs3ls10g/WpxZtAOOedjzwRAVMeqhi/IeOonUbKAngR8iDUdDlz/U3DD3aDNJaH0HF7IL+ZimCeStIJHp4b1pvafuk83mFAc9h6etK3vPDs9eiKujh5F86XUGFInqDYqQNqLk7TX2U42P/NUfsvsKsFC6JinkrWZ+oS/kB8YUMteIC4tg8R/P5Omu4DtSQtqqzeOW95TJ6RIoDX5bmbN/0zkAZMRjIZBqKjYaSErDbrRB0Xfc61G9biiQvIBcrBxQ==');
})()
```

## 选项
```javascript
{
	mode: 'block', // 模式：支持block分块转码，file整个文件转码
	tag: 'encrypt', // 标签：mode==block时，识别转码块标识。示例：<encrypt>code</encrypt>
	decode: true, // 解码：iife返回解码值，设置为false，则直接返回转码后的值
	transform: 'base64' // 转码方法(string|fn)：内置支持base64、aes，可设置自定义方法fn(content, options)
}
```

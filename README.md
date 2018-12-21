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

## 注意事项
配合babel-loader使用时，若encrypt-loader在babel-loader后调用，必须在末尾加上`;`分号。请看下例：

rules配置为
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
const APIS = /*<encrypt>*/{
	info       : 'GET:/common/info',
	menu       : 'GET:/common/menu',
	test : {
		user   : 'GET:/user/info'
	}
}/*</encrypt>*/
```
babel编译后会变成
```javascript
var APIS = /*<encrypt>*/{
	info: 'GET:/common/info',
	menu: 'GET:/common/menu',
	test: {
		user: 'GET:/user/info'
	} /*</encrypt>*/
};
```
> 注释标签错乱了...这就会导致转码后webpack报错，因为转码后会留下一个}，语法错误了~~~

**在末尾加个分号**
test.js
```javascript
const APIS = /*<encrypt>*/{
	info       : 'GET:/common/info',
	menu       : 'GET:/common/menu',
	test : {
		user   : 'GET:/user/info'
	}
};/*</encrypt>*/
// 上面这行末尾多了个分号
```
babel编译后，一切就恢复正常了~
```javascript
var APIS = /*<encrypt>*/{
	info: 'GET:/common/info',
	menu: 'GET:/common/menu',
	test: {
		user: 'GET:/user/info'
	}
}; /*</encrypt>*/
```

**所以** ，建议在babel-loader前转码，源码中不使用ES6语法~

### 压缩
现只会压缩需要转码的部分，大部分情况下，转码部分都会是`值`，但是Uglify-js不能压缩纯值，因此会加上`module.exports=`前缀后再进行压缩，若压缩失败，请检查下前缀加上后的语法是否正确。

流程如下：
```javascript
const test = /*<encrypt>*/[
	// test
	"test",
	"abc"
];/*</encrypt>*/
```

转码部分识别为
```javascript
[
	// test
	"test",
	"abc"
];
```

压缩前转换为
```javascript
module.exports=[
	// test
	"test",
	"abc"
];
```

调用压缩
```javascript
UglifyJS.minify(`module.exports=[
	// test
	"test",
	"abc"
];`, options.uglifyOptions)
```

截取压缩后的代码，最终为
```javascript
["test","abc"];
```


## 选项
```javascript
{
	mode: 'block', // 模式：支持block分块转码，file整个文件转码
	tag: 'encrypt', // 标签：mode==block时，识别转码块标识。示例：<encrypt>code</encrypt>
	decode: true, // 解码：iife返回解码值，设置为false，则直接返回转码后的值
	transform: 'base64', // 转码方法(string|fn)：内置支持base64、aes，可设置自定义方法fn(content, options)
	minify: true, // 启用压缩，uglify-js
	minifyPrefix: 'module.exports=', // 压缩部分将加上`module.exports=`前缀后再压缩（不要带空格，否则压缩后空格丢失，将截取错误）
	uglifyOptions: { // 压缩选项
		output: {
			beautify: false,
			comments: false,
			ascii_only: true
		}
	}
}
```

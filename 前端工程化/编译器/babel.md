# babel简介
> babel是JS的编译器，随着JS的发展，JS的版本在日益更新，但JS需要在浏览器上执行，为了使用上最新的JS特性，我们要让JS转译为浏览器可以解析的JS语法。

不仅如此，随着框架的发展，为了支持`React`的`JSX`语法，以及`typescript`的`ts`语法，又或者是两者结合的`tsx`语法，babel也有插件可以支持，将它们转译为JS。

babel是个编译器，它可以通过自己的一系列工具进行转译，但也支持与其他工具集成，例如`webpack`、`vite`、`rollup`等等，与它们集成时，会有一些额外的特殊配置，具体参考[babel集成工具](https://babeljs.io/setup.html#installation)。

## babel的相关包
- `@babel/core`: babel的核心包，只要用到babel就必须安装
如果需要手动转译，可以在程序内部引入核心包进行转译：
```javascript
const babel = require('@babel/core');

babel.transformSync("code", options);
```
- `@babel/cli`: babel的`cli`工具，`cli`是`client`的缩写，只要使用到`babel`这个命令行工具，都要安装
安装了这个工具之后，`node_modules`下的隐藏文件夹`.bin`就会出现一个`babel`命令。
```shell
./node_modules/.bin/babel src.js -o build.js
```
只要出现在`.bin`文件夹的命令，都可以在`package.json`内部直接使用:
```json
{
  "scripts": {
    "build": "babel ./src.js -o build.js"
  }
}
```
又或者，我们可以使用`npx`(专门用来跑`.bin`目录下命令的工具):
```shell
npx babel ./src.js -o build.js
```
- `@babel/polyfill`: babel的补丁包，babel虽然可以转译语法，但有些`API`的实现，需要打补丁，不能仅仅通过转译实现，例如`Array`数组的`flat`或者`faltMap`方法，这些方法需要在`Array.prototype`也就是数组原型上打补丁，对这个方法进行实现。注意，在`babel`7.4以上的版本之后，该包已经被废弃，现在推荐使用`core-js/stable`和`regenerator-runtime/runtime`包
```javascript
import 'core-js/stable';
import 'regenerator-runtime/runtime';
```


## babel的配置文件
虽然通过命令行的方式也可以对`babel`进行配置，但对于一个完整的项目来说，配置项应该是可以管理的。类似于prettier、eslint等，都有`.prettierrc`和`.eslintrc`等配置文件。为此，`babel`提供了配置文件，配置文件可以有多种形式。
- babel.config.json
  - babel@7.8以上的版本推荐使用，旧版本可以使用babel.config.js替代
  - Monorepo，多个项目、单个项目、需要为node_modules编译时，都首选使用
- .babelcr.json
  - 仅仅想要为项目中的部分文件进行编译时使用。
- package.json的babel字段

`babel.config.json`:
```json
{
  presets: [],
  plugins: []
}
```
旧版本babel用`babel.config.js`替代
```javascript
modules.exports = function (api) {
  api.cache(true);

  return {
    presets: [],
    plugins: [],
  }
}

```
`.babelrc.json`的方式：
```json
{
  presets: [],
  plugins: []
}
```
`package.json`的方式
```javascript
{
  "name": "my-package",
  "version": "1.0.0",
  "babel": {
    "presets": [ ... ],
    "plugins": [ ... ],
  }
}
```

## babel的plugin和preset
`babel`的编译能力来自于一系列的插件`plugin`，这些插件构建了`babel`的如何编译代码的能力，我们甚至写自己的插件通过`babel`提供的API，然后应用这些插件。例如，我们想要编译`ES2015+`版本的语法时，我们可以使用类似于`@babel/plugin-transform-arrow-funcitons`。

```shell
npm install --save-dev @babel/plugin-transform-arrow-functions

./node_modules/.bin/babel src --out-dir lib --plugins=@babel/plugin-transform-arrow-functions

```

现在，我们可以看到箭头函数被转译成了普通的函数：
```javascript
const fn = () => 1;

// converted to

var fn = function fn() {
  return 1;
};
```
这是一个良好的开端，但如果每一个特性都需要我们这样去手动引入插件，这是不现实的，为了解决这个问题，`babel`提出了`presets`的概念，`preset`其实就是一系列的`plugin`集合，就像插件可以自定义一样，预设(preset)同样可以自定义，我们可以自由组合插件作为我们的自定义预设。

例如`@babel/preset-env`,不需要经过任何的其他配置，我们就可以支持最新的JS特性：
```javascript
{
  "preset": ["@babel/env"]
}
```
当然`env`，也可以支持许多配置选项的。

## babel的targets选项
`targets`选项用于确定`babel`编译时的目标浏览器，使用方式如下：
```json
{
  "targets": "> 0.25%, not dead"
}

```
或者指定目标版本：
```json
{
  "targets": {
    "chrome": "58",
    "ie": "11"
  }
}
```
完整的浏览器选项：`chrome`, `opera`, `edge`, `firefox`, `safari`, `ie`, `ios`, `android`, `node`, `electron`。

注意，当没有`targets`配置选项时，`babel`会假定你需要编译的目标对象为尽可能适配所有旧版本的目标，例如，在我们使用`@babel/preset-env`时，会将所有的`ES2015-2020`都转译为`ES5`。

**所以，官方推荐，我们一定要使用targets属性来减少输出的转译代码大小**

# babel的preset
一些常见的`preset`包：
- @babel/preset-env for compiling ES2015+ syntax
- @babel/preset-typescript for TypeScript
- @babel/preset-react for React

## 废弃的stage
babel7已经废弃了`preset-stage-x`包，并且已经决定不再更新，因为stage-x是随着提案更新的，对用户不友好，所以现在统一使用`preset-env`。

- Stage 0 - Strawman: just an idea, possible Babel plugin.
- Stage 1 - Proposal: this is worth working on.
- Stage 2 - Draft: initial spec.
- Stage 3 - Candidate: complete spec and initial browser implementations.
- Stage 4 - Finished: will be added to the next yearly release.

Stage-0代表只是一个想法，1代表值得去实现，2代表已经成为了一个提案，3则是开始着手推动浏览器实现，4则是将会被浏览器实现。即从0到4，逐渐成为标准。并且引入的插件越来越少，即引入stage-0则会引入stage1的插件，stage1的引入则会包含stage2的插件，以此类推。

这种根据提案去添加插件的方式，对用户来说不友好，因为提案一直在更新。

## 使用env
`preset-env`默认包含了所有的年度标准预设，`babel-preset-es2020到babel-preset-es2015`。

> 特点：包含了所有年度预设，无需用户单独指定某个预设。
> 缺点：部分转码多余，如果使用默认设置，babel会将所有ES6与ES6+的新特性转成复杂的es5的代码。但是大部分现在浏览器已经支持ES6的部分特性。

为了解决上述缺点，`env`支持`targets`配置来减少包的体积。

```json
{
  "presets": [
    ["@babel/env", {
      "targets": {
        "browsers": [ "ie >= 8", "chrome >= 62" ]
      } 
    }]
  ]
}

```
这个`targets`属性和外部的`targets`配置一致，当外部配置时，也会将其作用到`@babel/env`。

## 创建自定义preset
我们可以自定义`preset`,通过简单的导出一个函数，该函数返回包含`plugins`的对象

```javascript
module.exports = function () {
  return {
    plugins: ["pluginA", "pluginB", "pluginC"]
  }
}
```

`preset`本身也能包含其他`preset`：
```javascript
module.exports = () => ({
  presets: [require("@babel/preset-env")],
  plugins: [
    [require("@babel/plugin-proposal-class-properties"), { loose: true }],
    require("@babel/plugin-proposal-object-rest-spread")
  ]
})

```

## preset执行顺序
假设有如下`presets`配置，`presets`的优先级从右往左执行：
```json
{
  "presets": ["a", "b", "c"],
}

```
即先执行`c`再执行`b`和`a`。

# babel的plugin
`babel` 的编译能力来自于应用插件。

`plugin`有两种：
- 一种是转换代码的插件，对于转换代码的插件，同时也会应用对应的语法插件，所以不需要单独启用语法插件。
- 一种是语法插件，大多数语法都可以被`babel`转化，但也有极少数的不能被转化的情况。为了解决这种情况。我们可以使用`@babel/plugin-syntax-bigint`来增强`babel`对某一种语法的识别能力。又或者有时候我们想要保留源码，仅仅想要`babel`帮我们分析语法的时候，可以单独启用语法插件。

要启用语法插件，还有一种方式:
```json
// .babelrc
{
  "parserOpts": {
    "plugins": ["jsx", "flow"]
  }
}

```

## plugin执行顺序
当有两种转化程序都访问同一节点，转化程序将会在以下顺序中选择执行`plugin`或`preset`
- Plugins 在 Presets 前执行。
- Plugin 的执行顺序是第一个到最后一个。
- Preset 的执行顺序是从最后一个到第一个。


## 自定义Plugin
参考[babel手册](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/zh-Hans/plugin-handbook.md)，学习更多自定义插件知识。为了创建一个自己的插件，首先要明白`AST抽象语法树`等更多编译知识。

以下是一个简单的转换节点名称的自定义插件：
```javascript
export default function() {
  return {
    visitor: {
      Identifier(path) {
        const name = path.node.name;
        // reverse the name: JavaScript -> tpircSavaJ
        path.node.name = name
          .split("")
          .reverse()
          .join("");
      },
    },
  };
}



```
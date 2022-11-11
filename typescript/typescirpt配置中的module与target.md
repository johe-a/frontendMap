# 前言
本文主要是为了巩固`typescript`配置中`compilerOptions`的`module`以及`target`属性。
[原文链接](https://www.tsmean.com/articles/learn-typescript/typescript-module-compiler-option/)

# 前端模块化介绍
为了理解`modules`的编译选项，我们需要理解什么是`模块`。或许听起来有些不可思议，曾经在`javascript`中，并没有一种标准的方法去写模块化的代码，为此`javascript`文件只能导入另一个文件的功能。不同区域的碎片化代码依然能够一起协作，是由于不同区域的代码都将自己绑定到全局的作用域，因此其余其余的代码则可以使用。例如我们可以从`script`标签上引入`jquery`，然后接下来的`script`就能通过`$`全局变量去访问。
当然这有很多缺点：
- `script`标签的顺序会影响模块之间的引用：例如我们要在`script`中使用`jquery`则必须在这个`script`之前引入`jquery`的`script`
- 不是真正意义上的模块化：我们通过`script`标签引用一个库，则引用了这个库的全部，不管我们有没有使用到它的部分功能。
- 全局命名空间混淆：缺乏一种有效的管理代码方式来防止全局命名空间混淆

随着`node.js`的引入，以及`SPA(single page applications)`带来的日益复杂的`javascript`逻辑。不能使用模块化的障碍成为了一个问题。
在没有官方文档介绍如何写模块化之前，社区有引进了多种`javascript`模块化的方案，这些方案让`模块化`历史进程变得更加复杂。当我们使用不同的模块化语法时，每一种模块化语法只能适用于特定的`javascript`引擎，甚至不适用于任何`javascript`引擎，需要我们通过一些工具来转化成非模块化的代码。

>注：社区的模块化方案包括但不限于`AMD`、`CMD`、`SystemJs`等

随着模块化的标准化方案出现，现在只有两个比较重要的模块化方案：
- 在node的引入时带入的`commonJS`模块化
- 在ES6标准化方案中带入的`ES Module`模块化

当我们在`typescript`的配置中选择使用`module: "commonJS"`时，`javascript`的模块化代码会被转化为`commonJs`的语法
> 我们可以通过在线的[`Typescript playground`](https://www.typescriptlang.org/play?target=1&module=1#code/KYDwDg9gTgLgBAYwgOwM7wBbADbYnAXjgHIAJHPAQmIChRJY4AzAV2QRgEsU5UBDAJ7lcEABQBKOAG8acOXCjAYLKMjhYRAbhoBfIA)查看编译后的产物

相反地，使用`module: "ESNext"`(或者 `ES6`以及`ES2015`)，模块化代码会被转化为`ES Module`的语法。


# CommonJS VS ESNext
在时间上，`ECMA`标准的`ES Module`较晚加入`模块化`的方案中，这也是为什么会有这么多的模块化方案，但是现在随着标准模块化的方案出现，所有的系统都在朝着这个标准化模块的方案前进。现在所有的现代浏览器都支持`ES Modules`.并且`node.js`也支持。

但是`node.js`自己已经拥有了`CommonJS`模块化系统。所以在支持`ES Modules`的时候会让我们感觉到奇怪，`node.js`要求支持`ES Modules`模块化方案的文件必须以`.mjs`作为后缀。对于这一点TypeScript 也没有太大帮助，因为你无法选择转译文件的扩展名，它们都是`.js`。并且使用某些脚本更改此扩展名也不能解决问题，因为这些文件被其他文件引用。
> 可以得出结论：我们在使用`typescript`以及`node.js`时，将`typescript`的模块化方案设置为`"module": "esnext"`是几乎不可能的。所以我们编译出的产物代码，如果是运行在`node`环境下的，我们应该使用`"module": "commonjs"`将模块化方案切换为`commonjs`。

如果我们的编译代码是将运行在浏览器的话，则有所不同。因为浏览器不支持`commonJS`模块化方案，但所有的现在浏览器却支持`ES Modules`。如果我们需要适配旧的浏览器，我们可能需要将编译后的代码都打包到一起（或者使用全局作用于将文件拆分），这一点可以通过`webpack`等工具做到。
> 可以得出结论：当我们的代码在现代浏览器环境中，我们应该将`module`设置为`ES2016`甚至更新，如果需要兼容旧的浏览器，则需要通过构建工具将其编译到一起或者通过全局作用于进行`script`拆分。
# 使用TS来写Webpack配置
具体参考：[Configuration Language](https://webpack.js.org/configuration/configuration-languages/#typescript)，由官网指引，知道`Webpack`的配置可以用`Typescript`来写，主要有以下几步：

1. 安装所需依赖
```shell
npm install --save-dev typescript ts-node @types/webpack @types/node
// 如果需要使用webpack-dev-server
npm install --save-dev @types/webpack-dev-server
```
其中 `ts-node` 是关键，可以帮助我们用`typescript`来写`node`, `webpack`配置实际上就是`node`脚本。`@types/webpack`、`@types/node`分别帮助`webpack`和`node`添加类型声明。我们在`开发`环境下，可能会使用`webpack-dev-server`，所以也需要添加`@types/webpack-dev-server`;

当然，还需要安装`webpack`相关依赖：
```shell
npm install --save-dev webpack webpack-cli webpack-dev-server
```

2. 配置tsconfig.json
除此之外，我们还需要配置`typescript`，在`tsconfig.json`配置的`compilerOptions`内部，需要配置`esModuleInterop`和`allowSyntheticDefaultImports`，参考[typescript配置说明](https://www.typescriptlang.org/tsconfig#esModuleInterop)。

`esModuleInterop`在默认情况下是`false`，默认情况下`typescript`在遇到CommonJS/AMD/UMD模块时，将会以`ES6 Modules`的方式进行处理。也就是：
- `import * as moment from "moment"` acts the same as `const moment = require("moment")`
- `import moment from "moment"` acts the same as `const moment = require("moment").default`

这样会导致两个问题：
1. 在`ES6 Modules`中，`import * as x`中的`x`只能是一个对象，对象中包含着模块的成员。但随着`Typescript`将`import * as x`等同于`require('x')`，也就意味着`Typescript`允许`import *`被处理为一个可以被调用的`function`。(因为可以导出一个函数)。这个打破了规范的建议。
2. 虽然 TypeScript 准确实现了 ES6 模块规范，但是大多数使用 CommonJS/AMD/UMD 模块的库并没有像 TypeScript 那样严格遵守。

开启 esModuleInterop 选项将会修复 TypeScript 转译中的这两个问题。

`allowSyntheticDefaultImports`，则允许我们使用`import React from 'react'`而不是`import * as React from 'react'`，即使在模块没有默认导出的情况下(主要是指CommonJS、AMD、CMD模块)。例如：
```javascript
// @filename: utilFunctions.js
/*
ERROR:
Module '"/home/runner/work/TypeScript-Website/TypeScript-Website/packages/typescriptlang-org/utilFunctions"' has no default export.
*/

const getStringLength = (str) => str.length;

module.exports = {
  getStringLength,
};

// @filename: index.ts
import utils from "./utilFunctions";

const count = utils.getStringLength("Check JS");
```
这段代码会引发一个错误，因为没有“default”对象可以导入，即使你认为应该有。 为了使用方便，Babel 这样的转译器会在没有默认导出时自动为其创建，使模块看起来更像：
```javascript
// @filename: utilFunctions.js
const getStringLength = (str) => str.length;
const allFunctions = {
  getStringLength,
};
module.exports = allFunctions;
module.exports.default = allFunctions;

```

3. 通过`import`使用`node`模块和`webpack`类型声明
```typescript
import webpack from 'webpack';
// path虽然是node模块，当经过TS处理后，可以进行import
import path from 'path';

// 通过声明为 Webpack 配置类型，获得很好的提示
const config: webpack.Configuration = {
  mode: 'development',
  entry: './src.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'bundle.js'
  }
}
```

4. 使用webpack-dev-server
`Webpack5`之后，不能通过`webpack-dev-server --config webpack.config.ts`的方式来进行启动，因为`Webpack5`内置了`webpack serve`命令，可以用于启用`webpack-dev-server`，但`webpack-dev-server`的依赖仍然是需要的。

虽然在官网的例子中，说的是`webpack-dev-server`引用后，`webpack`类型声明就可以完善，但通过实验，发现仍然会报`devServer`的错误：`devServer not exist in type Configuration`。
```typescript
import webpack from 'webpack';
import path from 'path';
import 'webpack-dev-server';

// 通过声明为 Webpack 配置类型，获得很好的提示
const config: webpack.Configuration = {
  mode: 'development',
  entry: './src.js',
  // error: devServer not exist in type Configuration
  devServer: {
    contentBase: path.resolve(__dirname, './dist'),
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'bundle.js'
  }
}

```
我们可以通过`接口继承`的方式解决这个问题：
```typescript
import path from 'path';
import { Configuration as WebpackConfiguration} from 'webpack';
import { Configuration as webpackDevServerConfiguration } 'webpack-dev-server';

interface Configuration extends WebpackConfiguration {
  devServer?: webpackDevServerConfiguration
}

// 通过声明为 Webpack 配置类型，获得很好的提示
const config: Configuration = {
  mode: 'development',
  entry: './src.js',
  devServer: {
    contentBase: path.resolve(__dirname, './dist'),
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'bundle.js'
  }
}
```
同时，在`package.json`内部配置命令:
```json
{
  "scripts": {
    "serve": "webpack serve --config ./webpack.config.ts"
  }
}

```
# 从使用开始
我们会如何使用`create-react-app`? 
1. 安装
2. 执行脚本

当我们安装完`create-react-app`包的时候，可以看到`node_modules`文件夹下的`.bin`目录会多出一个可执行命令`create-react-app`。然后再通过`npx create-react-app`去执行`create-react-app`命令。

所以这里重点是`.bin`目录下的`create-react-app`从哪里来，关注到`vscode`将`.bin`目录下的`create-react-app`标记为`symbolic link`,可以知道这里是一个软链。正常情况下，我们的`.bin`目录文件夹会有很多可执行命令，`npm`是如何生成这个`.bin`目录的呢？

通过`ls -l`命令或者`find . -type l -ls`可以找到`.bin`目录下当前软链，也可以看到对应软链的目标文件地址。
```shell
cd ./node_modules/.bin

ls -l
```
可以看到`.bin`目录下的`create-react-app`是`node_modules/create-react-app/index.js`的软链接。所以执行`create-react-app`命令本身，就是在执行`node_modules/create-react-app/index.js`本身。

# `npm`如何管理可执行命令
从上面`.bin`目录下的软链，产生两个疑问：
- `npm`是如何在`npm install package`的时候，将`.bin`下的可执行文件软链接到`package`下的目标文件的呢？
- `npm`如何知道该包是一个工具包，如何知道其可执行命令文件的位置？

我们知道,`npm`通常用`package.json`来管理包，`package.json`描述了该包所需的所有信息，所以切入点就是`package.json`。

通常我们使用`package.json`中的`main`或`browser`字段来描述一个包的入口，当我们引用这个包的时候，就等同于引用入口文件。当`browser`字段被定义时，该包仅用于客户端，也就是不适用于`node`端。

那么我们如何描述一个工具库？可以看到`package.json`中还有一个`bin`字段，根据[文档描述](https://docs.npmjs.com/cli/v7/configuring-npm/package-json#bin)。`bin`字段是一个`执行命令名称`与`文件路径`的`映射`，当一个工具包(具有`bin`字段的`package.json`)被全局安装时，这个`bin`映射内的`文件路径`将会被软链到全局`bin`目录下。当一个工具包被作为依赖安装时，将会被软链到`node_module`下的`.bin`目录。

例如，当我们有一个这样的`package`:
```json
{
  "bin": {
    "my-app": "./cli.js"
  }
}

```
当我们安装这个`my-app`包时，将会创建一个`cli.js`的软链接到`/usr/local/bin`目录下，命名为`my-app`。

另外，在`bin`内映射的文件，内容开头必须以`#!/usr/bin/env node`开头，否则，将不会用`node`运行时去跑这个文件。

> 题外话，`npm`软链的操作，可以手动进行软链`npm link`，通常可以用于自己开发的包进行测试。我们可以进入想测试的包,然后使用`npm link`,`npm`会以`package.json`的`name`字段作为名称，在全局`node_modules`下建立软链。再进入我们的项目，假设刚刚软链的包`name`为`test`,则可以通过`npm link test`将文件夹再次软链到项目的`node_modules`下。

# 从createReactApp.js开始
从上面所学知识，我们从`create-react-app`项目的`package.json`上的`bin`字段可以知道，入口文件为`create-react-app/index.js`,而`index.js`仅仅做了`Node`版本判断，随后就直接调用了`create-react-app.js`导出的`init`方法。

我们可以先从注释开始，了解`createReactApp.js`做了些什么：
```javascript
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//   /!\ DO NOT MODIFY THIS FILE /!\
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//
// The only job of create-react-app is to init the repository and then
// forward all the commands to the local version of create-react-app.
//
// If you need to add a new command, please add it to the scripts/ folder.
//
// The only reason to modify this file is to add more warnings and
// troubleshooting information for the `create-react-app` command.
//
// Do not make breaking changes! We absolutely don't want to have to
// tell people to update their global version of create-react-app.
//
// Also be careful with new language features.
// This file must work on Node 10+.
//
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//   /!\ DO NOT MODIFY THIS FILE /!\
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
```
根据注释我们可以知道，`create-react-app`的唯一任务是，`初始化仓库，随后跳转到相应的命令(例如build、eject、init、start、test)`。

在`create-react-app.js`内部有很多函数，可以根据功能类型区分：
- 主流程
  - init
  - createApp
  - install
  - run
- getter
  - getInstallPackage
  - getTemplateInstallPackage
  - getTemporaryDirectory
  - getPackageInfo
  - getProxy
- 判断函数
  - checkNpmVersion
  - checkYarnVersion
  - checkNodeVersion
  - checkAppName
  - checkThatNpmCanReadCwd
  - checkIfOnline
  - checkForLatestVersion
  - isSafeToCreateProjectIn
- handler
  - extractStream
  - makeCaretRange
  - setCaretRangeForRuntimeDeps
  - executeNodeScript

进入`create-react-app.js`，可以看到`init`函数做了几件事
1. 使用`Commander`来定义脚本接收的`arguments`和`options`，并对每个`options`做出详细解释，其中`arguments`只有文件夹名，`arguments`是必须的，`options`是可选的。
2. 根据入参进行判断处理，例如对文件夹名判断、判断是否为最新版本工具、环境判断等等
3. 将文件夹名、是否需要详细日志、reactScript版本、模板等信息作为初始化信息传递给`createApp`

在看源码的过程中，我们可以发现一些很好用的库，在`init`函数内，就用到了三个优秀的库：
- `Commander`：一个强大的命令行工具，可以帮我们定义参数、选项的模板以及选项的帮助说明，解析用户输入，得到以模板形式的输出等等。类似的工具还有`minimist`、`optimist`等等。本质都是对`process.argv`进行解析。
- `chalk`：一个可以输出彩色字体和背景色的日志工具，类似的还有`progress`可以输出百分比进度条。
- `envinfo`，很多时候我们的代码是运行在本地机器上的，同一段脚本放在不同的环境下可能会有各种问题，例如以下问题，为了判断繁琐的环境，我们可以使用`envinfo`去快捷打印环境信息。
  - `command not found`
  - 目标机器运行的命令版本和本地机器不一致等
  - 操作系统的不同
- 系统模块`child_process`的`execSync`，用于同步执行命令
- semver，检查`version`是否合法，可以使用一系列模板来设置判断合法条件，以及版本比较等等。

进入`createApp`，这个函数做了几件事：
1. 检查`Node`版本
2. 检查文件名、文件夹等
3. 写入`package.json`到文件夹，如果使用的是`yarn`，则复制`yarn.lock`

进入`run`，这个函数做了几件事：
1. 获取要下载的包名，分为`react-scripts`和`cra-template`，根据不同的场景下载不同的包
2. 获取包的信息，包括包的名称与版本
3. 下载包
4. 执行`react-scripts`的`init`脚本

其中第四步执行脚本可以学习到，为了解决命令在各平台的兼容性问题，这里用到了一个`cross-spawn`的库去执行命令，执行方式与`child_process`中的`spawn`方法一致，用于执行`shell`脚本。这里第四步的执行方式也可以学习一下:
```javascript
executeNodeScript(
    {
      cwd: process.cwd(),
      args: nodeArgs,
    },
    [root, appName, verbose, originalDirectory, templateName],
    `
  const init = require('${packageName}/scripts/init.js');
  init.apply(null, JSON.parse(process.argv[1]));
`
)

function executeNodeScript({ cwd, args }, data, source) {
  ...
  const child = spawn(
    process.execPath,
    [...args, '-e', source, '--', JSON.stringify(data)],
    { cwd, stdio: 'inherit' }
  );

  child.on('close', code => {
    if (code !== 0) {
      reject({
        command: `node ${args.join(' ')}`,
      });
      return;
    }
    resolve();
  });
  ...
}
```
`process.execPath`指向`node`的可执行命令文件夹,这里`spawn`与入参信息结合之后，可以解析为（只显示重要部分）:
```shell
node -e `
  const init = require('${packageName}/scripts/init.js');
  init.apply(null, JSON.parse(process.argv[1]));
` -- JSON.stringify([root, appName, verbose, originalDirectory, templateName])
```

这里我们可以学习到：
1. 使用`node -e`或`node --eval`的方式去执行`node`脚本。
2. `node --`指示`node`选项的结束。将其余参数传给脚本。
3. `node`脚本通过解析`process.argv`去得到`--`之后的剩余参数。


到此，`create-react-app`的脚本执行完毕，接下来是`react-scripts`的工作。我们可以看到`create-react-app`主要是对命令行的解析、对环境进行判断、安装两个必要的包`react-scripts`以及`cra-templates`等。在这个过程中，我们能学习到很多命令行解析方法，环境检查方法，让自己的工具类更加健壮。也能学习到`node`脚本调用另一个远程加载的脚本，如何传递参数。

传递给`init`脚本的参数顺序解析：
- root: 项目文件夹ProjectName
- appName: root的最后一部分
- verbose: 标志位，是否需要额外的日志信息
- originalDirectory: 当前执行create-react-app的目录，等同于`process.cwd()`
- templateName: 模板名称，这里是`cra-template`，根据用户的命令行输入，可能会有以下几种情况
  - cra-template
  - @SCOPE/cra-template
  - cra-template-NAME
  - @SCOPE/cra-template-NAME

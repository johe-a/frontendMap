# 查询create-react-app
由`create-react-app`创建的应用，`packge.json`已经有已下`scripts`:
```json
"scripts": {
  "start": "react-scripts start",
  "build": "react-scripts build",
  "test": "react-scripts test",
  "eject": "react-scripts eject"  
}
```

也就是用`react-scripts`脚本跑的命令，查看`node_modules`下的`react-scripts`脚本(从`react-scripts`的`package.json`看到`bin`配置为 "./bin/react-scripts.js" :
```json
"bin": {
  "react-scripts": "./bin/react-scripts.js"
}
```

可以看到`react-scripts`脚本的逻辑，从用户输入的命令中查找，有`build`、`eject`、`start`、`test`等，找到`scripts/`下的文件执行:
```javascript 
const spawn = require('react-dev-utils/crossSpawn');
const args = process.argv.slice(2);

const scriptIndex = args.findIndex(
  x => x === 'build' || x === 'eject' || x === 'start' || x === 'test'
);
const script = scriptIndex === -1 ? args[0] : args[scriptIndex];
...
 const result = spawn.sync(
    process.execPath,
    nodeArgs
      .concat(require.resolve('../scripts/' + script))
      .concat(args.slice(scriptIndex + 1)),
    { stdio: 'inherit' }
  );
```

可以看到本地开发时用的是`./scripts`下的`start`脚本，里面利用`webpackDevServer`来启动本地服务。

# 修改 react 脚手架配置
- eject scripts
第一种方法是使用·create-react-app·添加完所需要的功能之后，用`CRA`提供的`eject scripts`:
```json
"scripts": {
  "eject": "react-scripts eject"
}
```

通过运行`yarn eject` or `npm run eject`之后，可以看到生成了`config`和`script`两个文件夹。

`package.json`也跟着改变了，我们想要的配置就放在`config`文件夹下。

- react-app-rewired
`react-app-rewired`可以在继续使用`create-react-app`的情况下，更改webpack配置

# 学习CRA的脚手架原理
`CRA` 会在开发模式(webpack development mode)下将`JS`编译为最新的`ES`语法(为了更快的编译速度)，而在开发者模式下，将会根据浏览器编译(babel browserlist)

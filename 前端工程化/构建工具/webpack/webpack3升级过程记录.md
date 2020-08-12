<!--
 * @Description: 
 * @Author: johe.huang
 * @Date: 2020-08-04 10:58:29
--> 
# webpack3梳理
## 整体结构
webpack区分开发环境配置、生产环境配置、公共配置等

目录结构：
```
- build
    - build.js              
    - webpack.base.conf.js   //存放webpack公共配置
    - webpack.dev.conf.js    //存放webpack开发配置
    - webpack.prod.conf.js   //存放webpack生产配置
    - utils                  //存放公共函数，例如生成css相关的loader配置、静态资源路径生成函数等
- config
    - dev.env.js             //存放开发环境特殊配置，例如环境变量，是否开启代理，端口和登录地址
    - prod.env.js            //存放生产环境特殊配置，同上
    - index.js               //存放生产和开发环境的webpack可配置项，这类配置一般需要抽象成可配置对象，例如开发环境可配置host和Port，是否使用Eslint,以及devtool的种类等等。生产环境可配置静态资源打包地址、devtool等等
```

## 公共的webpack配置
公共的webpack配置，入口、输出、别名和路径、常见的资源处理(vue文件、js\jsx转译、图片、字体等)
```javascript
'use strict'
const path = require('path')
const utils = require('./utils')
const config = require('../config')
const vueLoaderConfig = require('./vue-loader.conf')
const webpack = require('webpack')

function resolve(dir) {
  return path.join(__dirname, '..', dir)
}

const createLintingRule = () => ({
  test: /\.(js|vue)$/,
  loader: 'eslint-loader',
  enforce: 'pre',
  include: [resolve('src'), resolve('test')],
  options: {
    formatter: require('eslint-friendly-formatter'),
    emitWarning: !config.dev.showEslintErrorsInOverlay
  }
})

module.exports = {
  context: path.resolve(__dirname, '../'),
  entry: {
    app: ['babel-polyfill', './src/main.js']
  },
  output: {
    path: config.build.assetsRoot,
    filename: '[name].js',
    publicPath: process.env.NODE_ENV === 'production'
      ? config.build.assetsPublicPath
      : config.dev.assetsPublicPath
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': resolve('src'),
    }
  },
  // 添加代码
  plugins: [
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
      jquery: "jquery",
      "window.jQuery": "jquery"
    })
  ],
  module: {
    rules: [
      ...(config.dev.useEslint ? [createLintingRule()] : []),
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueLoaderConfig
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src'), resolve('test')]
      },
      {
        test: /\.svg$/,
        loader: 'svg-sprite-loader',
        include: [resolve('src/icons')]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        exclude: [resolve('src/icons')],
        options: {
          limit: 10000,
          name: utils.assetsPath('img/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('media/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
        }
      }
    ]
  },
  node: {
    // prevent webpack from injecting useless setImmediate polyfill because Vue
    // source contains it (although only uses it if it's native).
    setImmediate: false,
    // prevent webpack from injecting mocks to Node native modules
    // that does not make sense for the client
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  },
  externals: {
    // 打包生产环境时, 排除mockjs模拟数据组件
    mockjs: 'Mock'
  }
}
```

## 生产构建过程
生产环境通过build.js去开启webpack的工程化过程,build.js主要做一些提示优化，例如进度条、日志样式优化等。
```javascript
//node和npm版本确认，如果低于package.json中设置的版本，则警告并且退出构建
require('./check-versions')()

process.env.NODE_ENV = 'production'
const ora = require('ora')
//类似于rm -rf命令，用于删除文件夹
const rm = require('rimraf')
const path = require('path')
//美化日志输出
const chalk = require('chalk')
const webpack = require('webpack')
//存放webpack可配置项
const config = require('../config')
const webpackConfig = require('./webpack.prod.conf')

//进度条
const spinner = ora('building for production...')
spinner.start()

//删除打包目录下的static静态资源文件夹(这个不需要，直接删掉dist)
rm(path.join(config.build.assetsRoot, config.build.assetsSubDirectory), err => {
  if (err) throw err
  webpack(webpackConfig, (err, stats) => {
    spinner.stop()
    if (err) throw err
    process.stdout.write(stats.toString({
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false
    }) + '\n\n')

    if (stats.hasErrors()) {
      console.log(chalk.red('  Build failed with errors.\n'))
      process.exit(1)
    }

    console.log(chalk.cyan('  Build complete.\n'))
    console.log(chalk.yellow(
      '  Tip: built files are meant to be served over an HTTP server.\n' +
      '  Opening index.html over file:// won\'t work.\n'
    ))
  })
})

```
# github actions入门
`github actions`的入门请参考阮一峰的[github actions入门教程](http://www.ruanyifeng.com/blog/2019/09/getting-started-with-github-actions.html)，`actions`就像一个`jenkins`中的`pipeline`，可以给我们自定义工作流，帮助我们进行持续部署与持续部署。`actions`采用`YAML`格式来书写。

## YAML简介
`YAML`通常被用作于`JSON`进行对比，两者可以互相转化。  
`YAML`的基本语法：
- 大小写敏感
- 使用缩进表示层级关系
- 缩进不允许使用tab，只允许空格
- 缩进的空格数不重要，只要相同层级的元素左对齐即可
- '#'表示注释

`YAML`支持以下几种数据结构：
- 对象：键值对的集合，又称为映射（mapping）/ 哈希（hashes） / 字典（dictionary）
- 数组：一组按次序排列的值，又称为序列（sequence） / 列表（list）
- 纯量（scalars）：单个的、不可再分的值

关于`YAML`的数据结构实例，请参考[YAML入门教程](https://www.runoob.com/w3cnote/yaml-intro.html)

其中我们最需要关注的是对象和数组。

`YAML`对象示例：
```yaml
key:
  child-key: value
  child-key2: value2
```
可以转化为`JSON`如下:
```json
{
  "child-key": value,
  "child-key2": value2
}
```
数组示例：
```yaml
- A
- B
- C
```
如果子成员是一个数组或者对象，可以继续使用缩进表示:
```yaml
names:
  -
    id: 1
    name: johe
    age: 27
  - 
    id: 2
    name: johe2
    age: 28
```
用`JSON`表示则为：
```json
{
  "names": [
    {
      "id": 1,
      "name": "johe",
      "age": 27
    },
    {
      "id": 2,
      "name": "johe",
      "age": 28
     }
  ]
}

```
## actions简介
`actions`可以分为以下几个粒度：
- workflow：工作流程，持续集成一次运行的过程，就是一个 workflow。
- job: 一个工作流，由多个`job`组成，含义是一个工作流由多个任务组成。
- steps: 步骤，一个任务由多个步骤组成。
- action: 每个步骤，可以执行一个或多个命令`action`

`github actions`的配置文件叫做`workflow`文件，放在仓库的`.github/workflows/`下，采用上文提到的`YAML`格式，`Github`只要发现`.github/workflows`下有`.yml`后缀的文件，就会将其放置在仓库的`github actions`下，等待时机运行。

`workflow`配置文件可配置的字段非常多，可以查看[官方文档](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)

其中，我们需要了解以下几个最重要的字段：
![](https://tva1.sinaimg.cn/large/008i3skNgy1gz7kjrmpezj31k60u0772.jpg)

> [任务之间的串行、并行、多机运行教程](https://lannonbr.com/blog/github-actions-jobs) 
>
> [指定、使用任务输出教程](https://lannonbr.com/blog/2020-04-16-gh-actions-job-outputs)


# github pages入门
`github pages`在仓库的`/settings/pages/`下。

`github`允许我们发布自己的静态站点到`github.io`域名上，默认静态站点的域名为`https://[username].github.io/[repository]/`。

其中`username`为`github`的用户名，`repository`为仓库名称。

`github pages`需要我们设置静态站点的源文件。
![](https://tva1.sinaimg.cn/large/008i3skNgy1gz7ixe39t9j31sx0u0jwp.jpg)

在上图中的`Source`中区域内，需要设置`branch`和对应的文件夹。

> 需要注意的是，在仓库对应分支更新时，`github actions`会自动跑构建&部署流程，该`action`结合`github`推荐的`Jekyll`进行构建。如果我们不希望`github`自动运行该`action`，希望使用自定义的持续集成&部署`action`，我们需要添加.nojekyll文件到仓库根目录下。约定俗称的，使用自定义的持续集成部署`action`时，我们会将`gihub pages`里的`branche`设置为`gh-pages`

# 自定义`workflow`发布`pages`
结合具体示例，可以帮助我们了解`github actions`，本文将利用`workflow`把`vuepress`框架生成静态的博客页面部署到`github pages`上。

本示例参考自：[medium](https://medium.com/@danieljimgarcia/publishing-static-sites-to-github-pages-using-github-actions-8040f57dfeaf)

## 构建并部署到`pages`
为了将博客部署到`github pages`上，我们需要以下几个步骤：
1. 安装构建所需包
2. 构建
3. 将构建产物发送到仓库的gh-pages分支上

使用`shell`脚本把以上步骤描述出来：
```shell
#!/usr/bin/env sh

# abort on errors
set -e
# 安装依赖
npm install
# 构建vuepress静态页面
npm run build
# 定位到vuepress的构建产物目录
cd docs/.vuepress/dist
# 初始化git仓库
git init
git add -A
git commit -m 'deploy'
# 将构建产物推送到gh-pages分支
git push -f git@github.com:<USERNAME>/<REPO>.git main:gh-pages
```
其中`username`是用户名，而`repo`是目的仓库名称。执行该`shell`脚本，本地构建后发布到`github pages`上，设置`github pages`的`source`为分支`gh-pages`的根目录。

由于是手动构建，所以每次在代码更新的时候，我们需要手动执行这个脚本进行构建&上传。

## 使用workflows构建并部署到`pages`
上文提到的手动构建并不符合持续集成&持续部署的诉求，我们希望`github`在接收到代码更新时，自动运行类似上文提到的`shell`脚本，就需要借助`github actions`的能力。

在根目录下创建以下文件:
```
- .github
  - workflows
    - deploy.yml
```
其中`deploy`为自定义的`workflow`名称。

接下来我们来思考`deploy.yml`文件怎么写：
1. 在`main`分支代码更新的时候，触发工作流程
2. 执行构建&部署任务
   1. 指定运行机器
   2. 执行构建&部署步骤
      1. 设置git和node环境
      2. 安装依赖
      3. 构建
      4. 初始化构建产物为git仓库
      5. 将构建产物提交到gh-pages分支

```yaml
name: deploy-vuepress-page
on:
  push:
    branches:
      - main
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2 
    - uses: actions/setup-node@v2
      with:
        node-version: '14'
    - name: Build
      run: |
        npm install
        npm run docs:build
    - name: Git init
      run: |
        cd  docs/.vuepress/dist
        touch .nojekyll
        git config --global user.name username
        git config --global user.email userEmail
        git init 
        git add .
        git commit -m "auto build publish"
    - name: GitHub Push
      uses: ad-m/github-push-action@v0.6.0
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        branch: gh-pages
        directory: ./docs/.vuepress/dist
        force: true
```
拆解以上`workflows`：
1. 使用`on`来设置此工作流触发时机，`on.push`指定为代码提交时触发工作流，`on.push.branches`来过滤分支为`main`提交更新时触发工作流。
2. 使用`job`来定义任务，设置任务运行环境为`ubuntu-latest`(runs-on)。
3. 使用`steps`来定义步骤，注意`steps`是一个数组，每一个数组的成员，都必须要有`uses`或者`run`中的一种。`uses`用于指定使用第三方`actions`，`run`用于执行命令。

其中重点为`steps`，在这里，首先使用了两个第三方的`actions`：
- `actions/checkout@v2`，用于设置`git`环境，并切换到当前分支。为了后续`git`操作做准备。
- `actions/setup-node@v2`，用于设置`node`环境，为了后面安装包做准备。其中`with`字段用于传参，这里使用`node`版本为14

我们可以从[官方文档](https://github.com/marketplace?type=actions)找到所有的`actions`。

安装完所需环境，我们开始进行`npm`包安装和`vuepress`的页面构建，这里注意使用`run`来执行命令时，使用`|`+回车的方式，来执行多行命令：
```yaml
- name: Build
  run: |
    npm install
    # 自定义的构建命令
    npm run build:docs:build
```

然后进入构建产物，初始化`git`仓库，将构建产物添加，等待`push`。这里需要设置`git`用户名和邮箱，是因为当前运行在`github`提供的机器内部，机器内部没有任何的`git`配置设置，所以如果不设置用户名和邮箱，`github`将认不出提交人是谁，并阻止本次提交。

为了让`github` 能够允许我们提交，我们还需要使用`github`提供的`GITHUB_TOKEN`，该`token`在`actions`被运行时，自动注入，我们在`workflows`中可以使用`${{ secrets.GITHUB_TOKEN }}`来获取，具体可以查看[官方文档](https://docs.github.com/en/actions/security-guides/automatic-token-authentication)

当我们有了`GITHUB_TOKEN`，可以使用以下命令来推送至远程仓库：
```shell
git push https://<GITHUB_ACCESS_TOKEN>@github.com/<GITHUB_USERNAME>/<REPOSITORY_NAME>.git
```

这里，又使用了一个第三方的`action`(ad-m/github-push-action@v0.6.0)来帮助我们`push`:
```yaml
- name: GitHub Push
      uses: ad-m/github-push-action@v0.6.0
      with:
        # 设置token
        github_token: ${{ secrets.GITHUB_TOKEN }}
        # 推送的分支
        branch: gh-pages
        # 推送的文件夹地址
        directory: ./docs/.vuepress/dist
        # 是否强制推送
        force: true
```
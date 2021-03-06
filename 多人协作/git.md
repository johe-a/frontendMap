# 简介
记录git常见操作和原理

# git rebase
> git rebase即变基，改变基准点，以commit为基准点可以随意的修改commit历史，以分支为基准点可以合并分支，同时整理commit。

所以git rebase有两大类功能：
- 修改当前分支 `commit` 历史
- 合并分支，整理不同分支的 `commit` 历史

## 修改commit
> 当前分支 `commit` 提交信息，可以通过 `git commit --amend` 修改。但是要修改多个 `commit`，就得使用 `git reabse` 了。

如何使用git rebase来修改当前分支的commit历史呢？

1. 通过 `git log --oneline` 首先查看 `commit` 历史，找出 `commit` 哈希值

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnb9lwbhiij31a40u0nir.jpg)

2. 选定需要修改的 `commit` 历史区间


测试一下
```shell
git rebase -i [startpoint] [endpoint]
```
其中 `-i` 的含义是 `--interactive`，即弹出交互式的界面让用户编辑。 `[startpoint]` 以及 `[endpoint]` 则指定了一个编辑区间，如果不指定 `[endpoint]`， 则该区间的终点默认是当前分支 `HEAD` 所指向的 `commit`。 注意，该区间是一个左开右闭区间，也就是`( startpoint, endpoint]`

在第一步查看了 log 日志后，我们运行以下命令：
```shell
git rebase -i 5c22d38
```
可以看到下面的注释部分：
```shell
# Rebase 5c22d38..a1a438a onto 5c22d38 (2 commands)
#
# Commands:
# p, pick = use commit
# r, reword = use commit, but edit the commit message
# e, edit = use commit, but stop for amending
# s, squash = use commit, but meld into previous commit
# f, fixup = like "squash", but discard this commit's log message
# x, exec = run command (the rest of the line) using shell
# d, drop = remove commit
#
# These lines can be re-ordered; they are executed from top to bottom.
#
# If you remove a line here THAT COMMIT WILL BE LOST.
```
- p 或 pick: 保留该 commit
- r 或 reword: 保留该 commit，但是要修改 commit 信息
- e 或 edit: 保留该 commit，但是要修改该提交，类似于 `--amend`
- s 或 squash: 保留该commit，将当前 commit 与前一个 commit **合并**
- f 或 fixup: 类似于squash， 将当前 commit 与前一个 commit **合并**，但不保留该 commit 的注释信息
- x 或 exec: 执行 shell 命令
- d 或 drop: 删除该 commit 

我们将最新的三次 commit 合并：

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnba52lm6lj30bl05nq2t.jpg)
```javascript
pick d2cf1f9 fix: 第一次提交

s 47971f6 fix: 第二次提交

s fb28c8d fix: 第三次提交
```
`esc` 输入 `: wq`之后，可以看到注释修改页面：

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnba7w4rvcj30sl0qon07.jpg)

在浏览状态下，可以通过 dd 删除一行，在这里我们将之前的 commit 的信息都删除，改为"合并提交"：

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnba9obicmj30po0zkq3y.jpg)

## 合并分支
假设当前项目主干分支是 `master`，从 master commit 为 m1 的时机创建了 `dev` 分支。 然后在 `dev` 上又提交了 `d1`、`d2`、`d3` 三次提交。这时， `master` 也更新了 `m2` 和 `m3` 两次提交。 在这个时候，版本树大致长这样：
```shell
m0 -- m1 -- m2 -- m3
      |
      d1 -- d2 -- d3
```
这时候，我们可能想将三次 `dev` 上的 `commit` 合并为一个新的 `d`，让dev的历史变成这样：
```shell
m0 -- m1 -- m2 -- m3 -- d
```
为了实现这一点，我们可以在 dev 上 rebase 到 master:
```shell
git checkout dev
git rebase -i master
```
rebase过程：
1. 找到两个分支的最近共同祖先m1。
2. 对比当前 `dev` 分支与 m1 的提交，提取修改，保存为临时文件。
3. 将分支指向 master 最新的 m3。
4. 编辑当前 `dev` 分支的 commit 信息，将修改后的 commit 作为 master 的 HEAD。

如果有冲突：
1. 解决冲突
2. git add 修改的文件
3. git rebase --continue


# 撤销

## 撤销暂存区
撤销经过git add操作后的文件
```shell
git checkout --

```

## 撤销版本库
回退到上一次commit 
```shell
git reset HEAD^
```
或者reset具体的commit ID,通过git log --oneline查看提交历史
```shell
git log --oneline

4268bf3 (HEAD -> master, origin/master, origin/HEAD) feat: 更新多人协作
5c22d38 feat: 抽出函数式编程为单独文件夹
4ab1111 近期总结
f8f693e nest依赖注入
7a8a812 更新nest管道

```
回退到近期总结版本
```shell
git reset 4ab1111

```

## 撤销操作
任何Git操作都会被记录到git reflog中，我们可以从git reflog中看到我们使用的Git命令历史：
```shell
git reflog
6039719 (HEAD -> master) HEAD@{0}: reset: moving to 6039719
61506be HEAD@{1}: commit: 撤销测试
6039719 (HEAD -> master) HEAD@{2}: commit: git撤销
4268bf3 (origin/master, origin/HEAD) HEAD@{3}: reset: moving to 4268bf3
b82980a HEAD@{4}: commit: test撤销

```
如果我们要回退到某个操作之前的状态，可以使用git reset --hard reflogId，例如我们如果要回退到撤销版本库之前：
```shell
git reset --hard 61506be
```

## 撤销某一次commit
`git reset`用于回退到某一次commit上，例如现在的commit历史是这样的：
```shell
A<-B<-C
```
我们想要回滚到A的commit上，通过`git reset`会导致`B`和`C`的改动消失，并且`commit`历史也会被删除。

在我们发现线上问题的时候，可能是`B`的`commit`导致的，这个时候我们并不想`C`的`commit`由于回退被删除。也就是说我们只想撤销`B`的修改，并且不影响`A`和`C`。这个时候我们就会用到`git revert`。

`git revert`用于撤销某个`commit`的改动，当我们`git revert`到`B`时，将会把`B`的所有改动撤销。

# git cherry-pick获取其他分支的commit
对于多分支的代码库，将代码从一个分支转移到另一个分支是常见需求。

这时分两种情况。一种情况是，你需要另一个分支的所有代码变动，那么就采用合并（git merge）。另一种情况是，你只需要部分代码变动（某几个提交），这时可以采用 Cherry pick。
```shell
git cherry-pick <commitHash>
```
> 上面命令就会将指定的提交commitHash，应用于当前分支。这会在当前分支产生一个新的提交，当然它们的哈希值会不一样。

举例来说，代码仓库有master和feature两个分支。

```shell
 a - b - c - d   Master
         \
           e - f - g Feature
```
现在将提交f应用到master分支。

```shell

# 切换到 master 分支
$ git checkout master

# Cherry pick 操作
$ git cherry-pick f
```

上面的操作完成以后，代码库就变成了下面的样子。

```shell

    a - b - c - d - f   Master
         \
           e - f - g Feature
```

## cherry-pick多个提交
如果想要转移一系列的连续提交，可以使用下面的简便语法。
```shell
$ git cherry-pick A..B 

```
上面的命令可以转移从 A（不包含A） 到 B 的所有提交。它们必须按照正确的顺序放置：提交 A 必须早于提交 B，否则命令将失败，但不会报错。

## cherry-pick冲突
如果操作过程中发生代码冲突，解决方式和rebase时一致，先将修改后的代码add到暂存区之后，使用`git cherry-pick --continue`。

如果这个时候想要撤销cherry-pick，可以使用`git cherry-pick --abort`
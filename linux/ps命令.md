# 前言
ps命令是Process Status的缩写。ps命令列出的是当前那些进程的快照，就是执行ps命令的那个时刻的那些进程，如果想要动态的显示进程信息，就可以使用top命令。

要对进程进行监测和控制，首先必须要了解当前进程的情况，也就是需要查看当前进程，而 ps 命令就是最基本同时也是非常强大的进程查看命令。使用该命令可以确定有哪些进程正在运行和运行的状态、进程是否结束、进程有没有僵死、哪些进程占用了过多的资源等等。

# 命令
显示所有进程：
```shell
ps -A
```
指定用户：
```shell
ps -u root
```
显示正在内存中的进程
```shell
ps aux
```
用|管道和more连接分页：
```
ps aux | more
```
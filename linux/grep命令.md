# 前言
grep用来查找文件里符合条件的字符串。


# 命令
```shell
grep match_pattern file_name
```

在多个文件中查找：
```shell
grep match_pattern file_name file_name2
```

标记匹配颜色--color=auto
```shell
grep match_pattern file_name --color=auto
```

- (-i)忽略大小写
- (-n)显示行数
- (-q)静默输出，成功0，失败非0，用于条件测试

```shell
#显示匹配某个结果之后的3行，使用 -A 选项：
seq 10 | grep "5" -A 3
5
6
7
8

#显示匹配某个结果之前的3行，使用 -B 选项：
seq 10 | grep "5" -B 3
2
3
4
5

#显示匹配某个结果的前三行和后三行，使用 -C 选项：
seq 10 | grep "5" -C 3
2
3
4
5
6
7
8
```
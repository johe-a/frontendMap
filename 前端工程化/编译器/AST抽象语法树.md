<!--
 * @Description: 
 * @Author: johe.huang
 * @Date: 2020-07-17 10:56:37
--> 
# 什么是抽象语法树AST
***AST(Abstract Syntax Tree)称为抽象语法树，是源代码语法结构的一种抽象表示。以树状的形式表现编程语言的语法结构，树上的每个节点都表示源代码中的一种结构。*** 之所以说语法是抽象的，是因为这里的语法并不会表示出真实语法中出现的每个细节。比如，嵌套括号被隐含在树的结构中，没有以节点的形式呈现。  
和抽象语法树相对的是具体语法树(通常称作分析树)，一般的，在源代码的翻译和编译过程中，语法分析器创建出分析树，然后从分析树生成抽象语法树。

上面的解释来自于维基百科，按照解释，**任何语言都可以被转化成抽象语法树，例如js、c、java甚至css的超集sass,抽象语法树有什么应用场景呢，在前端工程化的过程中，我们可以看到很多抽象语法树的应用，例如js的es6转译、js的代码压缩、sass预处理器、eslint代码格式化等等，webpack的依赖图谱、babel的插件机制，都依赖抽象语法树。**

总的来说，***抽象语法树就是将具体代码抽象化成我们能够理解的树形结构，如何抽象是根据语言来决定的，我们可以通过对抽象后的树形结构进行修改和读取。*** 例如我们先把es6代码抽象成语法树，再对其中的let、const等es6语法声明改成es5的语法声明，再将修改后的抽象语法树转化回代码。又例如我们读取抽象语法树中的信息，比如读取ImportDeclaration去获取到当前代码依赖的模块，再构建依赖图谱(webpack就是这样做的)。


![](https://tva1.sinaimg.cn/large/007S8ZIlgy1ggtt69m6nlj30qo0f0dgt.jpg)


# 如何得到抽象语法树
为了了解抽象语法树如何获取，我们可以先分析下普通的编译器做了哪些事情。

下面是一个高级语言转化成二进制的过程：
![](https://tva1.sinaimg.cn/large/007S8ZIlgy1ggttgw2s62j30qo0f0dhh.jpg)

实际上，编译过程可以分为三个阶段：
1. 解析阶段(Parsing),这一步主要把代码转化为抽象语法树
    1. 词法分析(Lexical analyzer)，将代码转成一个tokens数组
    2. 语法分析(Syngax analyzer)，将tokens数组转化成树形结构
2. 转化阶段(Transformation),将解析得到的抽象语法树按照自己的意愿进行修改
    1. 遍历(Traversal),对AST进行深度优先遍历
    2. 生成Visitors对象
3. 代码生成(Code Generation),将修改后的AST重新转换称为代码

[简单的编译器实现](https://the-super-tiny-compiler.glitch.me/)

我们没必要贯穿所有的知识点，将高级语言转译为二进制代码，我们只需要关注词法分析(Lexical analyzer)和语法分析(Syntax analyzer)，这两步是从代码中生成AST的关键所在。(实际上如果我们每一步都能掌握，就能创造一门新的编程语言了)

1. 词法分析，也叫做扫描器scanner，它读取我们的代码，然后把它们按照预定的规则合并成一个个标识tokens，同时它会移除空白符，注释等。整个代码被分隔进一个tokens列表。

![](https://tva1.sinaimg.cn/large/007S8ZIlgy1ggttus9936j30qo0f00tq.jpg)

2. 语法分析，也称为解析器。它会将词法分析出来的数组转化成树形的表达形式，同时验证语法，如果有语法错误，则抛出。

![](https://tva1.sinaimg.cn/large/007S8ZIlgy1ggttypiqqqj30qo0f0q46.jpg)

生成抽象语法树的时候，解析器会删除一些没必要的标识tokens(例如不完整的括号)，因此AST不是100%与源码匹配的，但是已经能让我们知道如何处理了。解析器100%覆盖所有代码生成的结构称为具体语法树(也就是上文所说的分析树)

![](https://tva1.sinaimg.cn/large/007S8ZIlgy1ggtu0mm678j30qo0f0wfh.jpg)

**那么我们如何得到JS的抽象语法树呢，如果只是简单查看，我们可以使用astexplorer，[astexplorer](https://astexplorer.net/)是一个在线生成抽象语法树的网站，支持多种语言的语法树抽象。如果需要在代码中使用抽象语法树，我们可以使用babylon来得到js的抽象语法树，这是由babel团队支持的，实际上Babel和webpack都在使用**


# babel
我们常常将babel和es6的代码转化联系起来，但是实际上，它的功能不仅仅是用来转化es6代码的，而是一个javascript的编译器，我们可以通过它丰富的插件对代码进行修改，例如对jsx语法支持，对动态import的支持，压缩代码等等。

![](https://tva1.sinaimg.cn/large/007S8ZIlgy1ggxj70tp3aj30qo0f0wfl.jpg)


babel通过一个完整的编译器流程：解析、转化、重新生成代码，来对代码进行修改。具体步骤：
1. 通过babylon对代码进行解析，生成抽象语法树
2. 通过babel-traverse对抽象语法树进行遍历和修改
3. 通过babel-core的transformFromAst对修改后的AST生成新代码
![](https://tva1.sinaimg.cn/large/007S8ZIlgy1ggxjf8up7yj30qo0f0q4c.jpg)

如何自定义babel的插件来对我们的代码进行自定义修改？实际上修改是在转化阶段进行的，我们要在转化阶段修改代码，需要暴露一个visitor对象：

![](https://tva1.sinaimg.cn/large/007S8ZIlgy1ggxjjw7iobj30qo0f0q3y.jpg)
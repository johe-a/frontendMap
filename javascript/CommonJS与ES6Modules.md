# CommonJS VS Modules
Modules与CommonJS模块的不同，主要有以下两个方面：
1. Modules输出的是值的引用，输出接口动态绑定，而CommonJS输出的是值的拷贝
2. Modules模块编译时执行，而CommonJS模块总是在运行时加载

## CommonJS
CommonJS模块输出的实际上是一整个模块对象
```javascript
// CommonJS
let { stat, exists, readfile } = require('fs');

// 等同于
let _fs  = require('fs');
let stat = _fs.stat;
let exists = _fs.exists;
let readfile = _fs.readfile;
```
***上面代码的实质是整体加载fs模块***(即加载fs的所有方法),生成一个对象_fs，然后从这个对象上面读取3个方法。这种加载称为"运行时加载",***因为只有运行时才能得到这个对象，导致完全没办法在编译时做静态优化。***

所以CommonJS的导出可以完全看成module.exports对象的导出，相当于将module.exports赋值。
```javascript
//a.js
//相当于引入b模块的module.exports对象
var b = require('./b');
console.log(b.foo);
setTimeout(()=>{
    console.log(b.foo);
    console.log(require('./b').foo);
},1000);

//b.js
let foo = 1;
setTimeout(()=>{
    foo = 2;
},500);
module.exports = {
    foo: foo;
}
//执行结果
//1
//1
//1
```
上面的结果可以说明三个问题：
1. 遇到require会先去执行require的模块,require不会优先执行，会运行时才执行
2. 导出的是一个module.exports对象，对于a导入的b === b的module.exports对象，只有module.exports发生改变，引入的b才会改变，由于foo是一个基本数据类型，它的改变不会影响module.exports.foo。
3. require会缓存结果

所以如果我们要获取更新后的foo，必须改变module.exports,或者将foo改变为一个引用类型
```javascript
//a.js
var b = require('./b');
console.log(b.foo.value);
setTimeout(()=>{
    console.log(b.foo.value);
    console.log(require('./b').foo.value);
});

//b.js
let foo = {
    value :1
};
setTimeout(()=>{
    foo.value = 2;
});
module.exports = {
    foo:foo
}
```
## Modules
CommonJs的导出相当于导出了module.exports这个对象，无论我们是否需要这整个对象，在引入module.exports时，module.exports对象的值都类似于函数传参的形式，是按值拷贝的，也就是module.exports内的属性若是基本数据类型，则基本数据类型的修改不会影响到module.exports里面的值，更不会影响到引入模块的值，如果是引用类型，由于修改会影响到module.exports所以会影响引入模块的值。所以我们看引入模块是否会改变就看module.exports内的值是否会改变。

ES6模块不是对象，而是通过export命令显式指定输出的代码，再通过import命令输入:
```javascript
// ES6
import { stat , exists, readfile} from 'fs';
```
**实质上是从fs模块加载3个方法，其他方法不加载。这种加载称为"编译时加载"或者静态加载。即ES6可以在编译时就完成模块加载，效率要比CommonJS模块的加载方式高。这也导致了没法引用ES6模块本身，因为它不是对象。**

Modules动态关联模块中的值，而不是生成输出对象的拷贝：
```javascript
//a.js
import { foo } from './b';
console.log(foo);
setTimeout(()=>{
    console.log(foo);
})
//b.js
export let foo = 1;
setTimeout(()=>{
    foo = 2;
});
//1
//2
```

**Modules静态编译，CommonJS运行时才加载**
```javascript
//a.js
console.log('a.js');
import { foo } from './b';

//b.js
export let foo = 1;
console.log('b.js 先执行');

//b.js先执行
//a.js
```
我们可以很明显的看出，a中虽然import晚于console.log。但是它被JS引擎通过静态分析，提到模块执行的最前面。

得出:**import命令会被js引擎静态分析，优先于模块内其他内容执行。**

export命令会有变量声明提前的效果，需要通过循环依赖加载才能看出。
```javascript
//a.js
import { foo } from './b';
console.log('a.js');
export const bar = 1;
export const bar2 = () => {
    console.log('bar2');
}
export function bar3() {
    console.log('bar3');
}

//b.js
export let foo = 1;
import * as a from './a';
console.log(a);

//执行结果
//{bar:undefined,bar2:undefined,bar3:[Function:bar3]}
//a.js
```
从上面的例子可以很直观的看出,export声明的变量也是优于模块其他内容的执行，具体的赋值要到执行相应代码的时候，这一点类似于函数的变量对象初始化(形参、函数被创建、初始化、赋值，var被创建和初始化为undefined)。


## CommonJS循环依赖
CommonJS加载模块时会有缓存，当出现循环依赖时，会取缓存中的结果
```javascript
//a.js
console.log('a starting');
exports.done = false;
const b = require('./b');
console.log('in a,b.done=',b.done);
exports.done = true;
console.log('a done');

//b.js
console.log('b starting');
exports.done = false;
const a = require('./a');
console.log('in b,a.done = ',a.done);
exports.done = true;
console.log('b done');

//输出
/*
    a starting
    b starting
    in b ,a.done = false
    b done 
    in a ,b.done = true
    a done
*/
```
我们在a中引入b，a中断执行去执行b,而b内又引用了a,由于node已经加载过a模块，所以不会重复执行a模块，而是取当前a模块输出的module.exports对象。

**在CommonJS规范中，当遇到require()语句时，会首先判断是否有缓存，如果没有则执行，如果有则不执行直接取缓存的结果。正因为如此，出现循环依赖时才不会出现无限循环调用的情况。**


## Modules循环依赖
跟CommonJS模块一样。ES6不会再去执行重复加载的模块，又由于ES6动态输出绑定的特性，能保证ES6在任何时候都能获取到其它模块当前的最新值。
```javascript
//a.js
console.log('a starting');
import { foo } from './b';
console.log('in a , foo :', foo);
export const bar = 2;
console.log('a done');

//b.js
console.log('b starting');
import { bar } from './a';
export const foo = 'foo';
console.log('in b ,bar : ',bar);
setTimeout(()=>{
    console.log('in b, setTimeout bar :',bar);
});
console.log('b done');

//执行结果
/*
    b starting
    in b ,bar : undefined
    b done
    a starting
    in a ,foo : foo
    a done
    in b,setTimeout bar : 2
*/
```

## 动态import()
ES6模块在编译时就会静态分析，优先于模块内其他内容执行，所以es6的import只能在最顶级作用域执行，而不能类似于require一样在条件判断内执行：
```javascript
if(true){
    import a from './a';
}else{
    import b from './b';
}

// or
import a from (str + 'b');

```
上面的写法都是不允许的，所以动态引入import()应运而生。
- 动态import()可以在脚本内任何地方使用
- 动态import()提供一个基于Promise的API
- import()接收字符串文字

```javascript
//a.js 
const str = './b';
const flag = true;
if(flag) {
    import('./b').then(({foo})=>{
        console.log(foo);
    })
}
import(str).then(({foo})=>{
    console.log(foo);
})

//b.js
export const foo = 'foo';

//foo
//foo
```
我们在导入一个export default模块时，由于es6的modules并不导出一个模块对象，所以我们需要显示的指定default才能获取到导出内容：
```javascript
//print.js
export default ()=>{
    console.log('print.js');
}

//main.js
import('./print.js').then((module)=>{
    let print = module.default;
    print();
})
```
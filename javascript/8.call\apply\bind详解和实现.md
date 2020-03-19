# call\apply\bind用法
> call、apply、bind都是用于改变this指向，并且可以通过call、apply来使用参数对象没有的方法。

## call\apply
call和apply的差别在于传参的差别：
```javascript
func.call(this, arg1, arg2);
func.apply(this, [arg1, arg2]);
```
- 参数固定时使用call
- 不固定时使用apply或者是被调用函数内部使用arguments类数组对象获取

### call
```javascript
function Fruits(color,name){
    this.color = color
    this.name = name 
}
Fruits.prototype = {
    constructor:Fruits,
    show:function(){
        console.log(this.color,this.name);
    }
}
var apple = new Fruits('red','apple');
apple.show();//'red apple'

var banana = {
    color:'yellow',
    name:'banana'
};
apple.show.call(banana);//'yellow banana'
Fruits.prototype.show();//'undefined undefined'
//函数借用，改变this指向
Fruits.prototype.show.call(banana);//'yellow banana'
```

call的应用：
- 将类数组对象Arguments/Dom NodeList(对象，但是key都为数值，并且具有length属性)转化为数组
```javascript
Array.prototype.slice.call(arguments);
Array.prototype.slice.call(document.querySelectorAll('a'));
```
- 类型检测,利用Object.prototype.toString.call()方法
```javascript
Object.prototype.toString.call(anyType)
```

### apply
```javascript
fun.apply(thisArg[,argsArray])
```
argsArray可以是数组或者类数组对象(es6开始)
```javascript
var banana = {
    color:'yellow',
    name:'banana',
    show:function(size,date){
        console.log(this.color,this.name);
        console.log(size,date);
    }
}
var apple = {
    color:'red',
    name:'apple'
}
banana.show.apply(apple,['big','2020']); // red apple  big 2020;
//call调用方式
banana.show.call(apple,'big','2020');//同上
```
apply把argsArray进行解构后赋值给调用函数的形参

apply应用：
- 数组追加,利用push来实现concat的效果
```javascript
var a = [1,2,3];
var b = [4,5];
Array.prototype.push.apply(a,b);
```
- 不确定参数解构
```javascript
function log(){
    console.log.apply(console,arguments);
}
log(1,2);//1 2 
//或者
function log(){
    var args = [].slice.call(arguments);
    //可以对args进行数组操作
    console.log.apply(console,args);
}
```

## bind
> bind方法返回一个绑定this的新函数，这个绑定效果不能被call、apply改变
```javascript
var banana = {
    color:'yellow',
    name:'banana',
    show:function(size,date){
        console.log(this.color,this.name,size,date);
    }
}
var apple = {
    color:'red',
    name:'apple'
}
var appleBindShowFn = banana.show.bind(apple)
//绑定this为apple
appleBindShowFn(); //red apple undefined undefined
//传参
appleBindShowFn('big','2020');//red apple big 2020

//预设参数
var appleBindShowFn2 = banana.show.bind(apple,'big','2020');
appleBindShowFn2();//red apple big 2020
//预设参数即使传参也无法改变
appleBindShowFn2('small','2019');//red apple big 2020

//被bind绑定this的新函数不能通过call、apply修改this指向，因为bind的优先级>call、apply
appleBindShowFn.call(banana);// red apple undefined undefined
appleBindShowFn.apply(banana);// red apple undefined undefined
```


# call\apply实现  
call和apply主要完成两个任务：
- 修改this指向
- 传参并执行函数

```javascript
var banana = {
    color:'yellow',
    show:function(){
        console.log(this.color);
    }
}
banana.show();//'yellow'

var apple = {   
    color:'red'
}
banana.show.call(apple); // 'red'

```
如何完成修改this并执行函数呢?
```javascript
var banana = {
    color:'yellow',
    show:function(){
        console.log(this.color);
    }
}
banana.show();//'yellow'

var apple = {   
    color:'red',
    show:banana.show
}
apple.show();//'red'
```
具体步骤如下：
- 将函数设为对象的属性
- 执行对象的函数
- 删除该函数属性
```javascript
apple.show = banana.show;
apple.show();
delete apple.show；
```

## 修改this指向的call、apply  
完成模拟修改this和执行函数：
```javascript
Function.prototype.call2 = function(argThis){
    //因为是函数调用call，所以this指向调用call的函数
    argThis.fn = this;
    argThis.fn();
    delete argThis.fn;
}

var banana = {
    color:'yellow';
}

function show(){
    console.log(this.color);
}

show.call2(banana);//yellow
```

## 传递参数的call、apply
```javascript
var banana = {
    color:'yellow';
}

function show(size,name){
    console.log(this.color,size,name);
}

show.call(banana,'big','banana'); // yellow big

```
由于call传入的参数不确定，我们可以从Arguments中取值，取出第二个到最后一个参数。
ES3的做法：
```javascript
var args = [];
for(var i = 1 , len = arguments.length ; i < len; i++  ){
    args.push('aguments['+ i + ']');
}
//执行后为[arguments[1],arguments[2]...]
```
最后通过eval方法拼接成一个函数:
```javascript
//这里args会调用toString,效果和args.join(',')一致
eval('argThis.fn('+args+')');
//也就是eval('argThis.fn(arguments[1],arguments[2]...)')
```
ES6可以通过解构运算符和arguments解决不定参的问题:
```javascript
var args = Array.prototype.slice.call(arguments,1);
argThis.fn(...args);
```

完整代码ES3版本：
```javascript
Function.prototype.call2 = function(argThis){
    argThis.fn = this;
    var args = [];
    for(var i = 1; i< arguments.length;i++){
        args.push('arguments['+i+']');
    }
    eval('argThis.fn('+args+')');
    delete argThis.fn;
}
```
完整代码ES6版本：
```javascript
Function.prototype.call2 = function(argThis){
    argThis.fn = this;
    let args = Array.prototype.slice.call(arguments,1);
    argThis.fn(...args);
    delete argThis.fn;
}
```
调用尝试：
```javascript
var banana = {
    color:'yellow';
}

function show(size,name){
    console.log(this.color,size,name);
}

show.call2(banana,'big','banana'); // yellow big banana
```

## null处理和返回值  
1. this参数可以传null，当为null的时候，视为指向window,严格模式下为undefined
```javascript
var value = 1 ;
function bar(){
    console.log(this.value);
}
bar.call(null);//1
```
2. 函数可以有返回值
```javascript

var banana = {
    color:'yellow';
}

function show(size,name){
    return {
        color:this.color,
        size,
        name
    };
}

//Object { color:yellow ... }
console.log(show.call(banana,'big','banana')); 
```

ES3完整代码：
```javascript
function getGlobalThis(){
    return this;
}
Function.prototype.call2 = function(argThis){
    argThis = argThis || getGlobalThis();
    argThis.fn = this;
    var args = [];
    for(var i = 0 ; i<arguments.length;i++){
        args.push('arguments['+i+']');
    }
    var result = eval('argThis.fn('+agrs+')');
    delete argThis.fn;
    return result;
}

```

## 从完整规范来实现
```
Function.prototype.apply(argThis,argArray);

func.apply(argThis,argArray);
```
查看apply的ES5规范：
1. 如果IsCallable(func)是false(也就是判断是否为函数),则抛出一个TypeError异常。
2. 如果argArray是null或者undefined,则返回提供argThis作为this值并以空参数列表调用func的[[Call]]内部方法的结果。(也就是参数为空的情况下，初始化参数为空数组，传递给func)
3. 返回提供argThis作为this值以空参数列表调用func的[[Call]]内部方法的结果
4. 如果Type(argArray)不是Object,则抛出一个TypeError异常。
5. 提供argThis作为this值并以argList作为参数列表，调用func的[[Call]]内部方法，返回结果。
6. 如果argThis为Undefined或者null时会被替换成全局对象

简单解释下就是：
1. 先判断调用call的对象是否为函数，不是则抛出异常
2. 如果传参为空，则设置参数为空数组[]
3. 如果传入的参数不是一个对象（因为apply接受类数组对象和数组,数组本质也是对象）,则抛出TypeError异常。
4. 需要将argArray解构成argList之后传参给函数
5. argThis为undefined或者null时会被替换成全局对象,在默认情况下是window,严格模式下是undefined
6. 如果argThis为除了undefined、null、Object之外的其他值，会被转化成Object并作为this的值

根据完整规范来实现apply:
```javascript
//写一个函数来获取全局this
function getGlobalThis(){
    return this;
}

Function.prototype.applyFn = function(argThis,argArray){
    //判断调用的this是否为函数类型
    if(typeof this !== "function"){
        throw new TypeError(this + 'is not a function');
    }
    if(argArray === undefined || argArray === null){
        argArray = []
    }
    //因为argArray必须是数组或者类数组对象，数组本质是对象
    if(typeof argArray !== 'object'){
        throw new TypeError('CreateListFromArrayLike called on non-object');
    } 
    if(typeof argThis === 'undefined' || argThis === null){
        argThis = getGlobalThis();
    }
    argThis = new Obejct(argThis);
    argThis.fn = this;
    var result = argThis.fn(...argArray);
    delete argThis.fn;
    return result;
}
```

属性命名问题：
- 如果argThis对象上有fn属性，就会被覆盖然后删除

es6解决方法：Symbol()来创建独一无二的值
es3:用时间戳生成

```javascript
let fn = '__'+new Date().getTime()；
argThis[fn] = this;
```

## undefined判断问题
undefined在es3和es5中都能被改写，undefined并不是保留词(reserved word),它只是全局对象的一个属性:
```javascript
var undefined = 10;
alert(undefined);
```
在es5中undefined已经是全局对象的一个只读(read-only)属性，不能被重写，但是在局部作用域中，还是可以被重写的。

```javascript
(function() {
  var undefined = 10;

  // 10 -- chrome
  alert(undefined);
})();

(function() {
  undefined = 10;

  // undefined -- chrome
  alert(undefined);
})();
```
所以判断一个值的类型是否为undefined用如下方法是不准确的：
```javascript
param === undefined
```
应该用以下方法:
```javascript
typeof param === 'undefined'
param === void 0;
```
查看void作用:
> The void operator evaluates the given expression and then returns undefined

***意思是void元素安抚能对和给定的表达式进行求值，然后返回undefined,也就是说,void后面跟上任意表达式，返回的都是undefined，至于为什么使用void 0,因为void 0最短。***

使用void 0代替undefined还能节省字节的大小，不少js压缩工具在压缩过程中，正是将undefined用void 0代替掉的。

## 生成执行函数
传参数的问题：
- ...运算符为es6
- eval已经不建议使用

使用new Function()来生成执行函数:
```
new Function([arg1[,arg2[,...argN]],]functionBody)
```
arg1,...argN是形参。functionBody是函数体(为字符串) 
简单使用例子：
```javascript
var sum = new Function('a','b','return a + b');
sum(1,2);//3
```
复杂使用例子：
```javascript
var banana = {
    color:'yellow',
    show:function(size,name){
        console.log(this.color);
        console.log(size,name);
    }
}
//传入(banana,'show',['big,banana'])实现banana.show(...['big','banana'])的效果
let func = new Function('
return arguments[0][arguments[1]](arguments[2][0],arguments[2][1])');
func(banana,'show',['big','banana']);
```
用函数来生成一个能够执行不定参数的函数:
```javascript
//apply和call版本一致
function generateFunction(argArrayLength){
    var code = 'return arguments[0][arguments[1]](';
    for(var i = 0; i < argArrayLength; i++){
        code += 'arguments[2]['+i+']';
        if(i != argArrayLength - 1){
            code += ',';
        }
    }
    code += ')';
    return new Function(code);
}
```

## 实现call、apply的完整代码
先来一份简易版，不进行类型检测:
apply实现：
主要步骤：
- 将函数作为对象的属性
- 执行函数
- 删除函数
- 返回函数值
```javascript
function getGlobalThis(){
    return this;
}

function generateFunction(argArraylength){
    var code = 'return arguments[0][arguments[1]](';
    for(var i = 0;i < argArraylength; i++){
        code += 'arguments[2]['+ i +']';
        if(i != argArraylength - 1){
            code+=',';
        }
    }
    code += ')';
    return new Function(code);
}

Function.prototype.applyFn = function(argThis,argArray){
    //绑定的this为undefined或者Null需要指定为全局this
    if(argThis === void 0 || argThis === null){
        argThis = getGlobalThis();
    }
    //生成一个随机属性名
    var fn = '__'+new Date().getTime();
    //防止有重名属性，先保存
    var originFn = argThis[fn];
    var hasOriginFn = argThis.hasOwnProperty(fn);
    argThis[fn] = this;
    //生成执行函数，解决不定参问题
    var func = generateFunction(argArray.length);
    var result = func(argThis,fn,argArray);
    delete argThis[fn];
    if(hasOriginFn){
        argThis[fn] = originFn;
    }
    return result;
}
```
call的实现与apply类似，只是传参方式不同
```javascript
function getGlobalThis(){
    return this;
}

function generateFunction(argArraylength){
    var code = 'return arguments[0][arguments[1]](';
    for(var i = 0;i < argArraylength; i++){
        code += 'arguments[2]['+ (1+i) +']';
        if(i != argArraylength - 1){
            code+=',';
        }
    }
    code += ')';
    return new Function(code);
}

Function.prototype.callFn = function(argThis){
    if(argThis === void 0 || argThis === null){
        argThis = getGlobalThis();
    }
    var fn = "__" + new Date().getTime();
    var originFn = argThis[fn];
    var hasOriginFn = argThis.hasOwnProperty(fn);
    argThis[fn] = this;
    //解决call不定参问题
    var func = generateFunction(arguments.length - 1);
    var result = func(argThis,fn,arguments);
    delete argThis[fn];
    if(hasOriginFn){
        argThis[fn] = originFn;
    }
    return result;
}

```
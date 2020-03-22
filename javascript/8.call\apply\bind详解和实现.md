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
//预设参数后，传入的参数按顺序传入原函数，这里small和2019为第三、第四个参数，没有形参接收
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
//apply和call版本一致，注意call是从1开始 
function generateFunction(argArrayLength){
    var code = 'return arguments[0][arguments[1]](';
    for(var i = 0; i < argArrayLength; i++){
        //call实现版本： code += 'arguments[2]['+(1+i)+']';
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

进行类型检测的完整版apply：
主要步骤还是那几个：
- 将函数作为对象的属性
- 执行函数
- 删除函数
- 返回函数结果
加上类型检测的步骤：(假设argThis为绑定的对象,argArray为传入的参数)
- 检测调用apply\call的是否为函数，如果不是，返回错误
- 检测argThis是否为Null或者undefined,是的话采用全局this
- 检测argThis是否可以添加属性，如果不能，返回错误
- 检测argArray如果是Null或者undefined,设置argArray为[]
- 检测argArray如果不是Object，返回错误
- argThis要进行Object的转化
```javascript
function getGlobalThis(){
    return this;
}

function generateFunction(argArrayLength){
    var code = 'return arguments[0][arguments[1]](';
    for(var i = 0 ; i < argArrayLength;i++){
        code += 'arguments[2]['+i+']';
        if(i !== argArrayLength-1 ){
            code += ',';
        }
    }
    code += ')';
    return new Function(code);
}

Function.prototype.applyFn = function(argThis,argArray){
    //检测this是否为函数
    if(typeof this !== 'function'){
        throw new TypeError(this+'is not a function');
    }
    //检测argArray是否为undefined或者Null
    if(argArray === void 0 || argArray === null){
        argArray = []
    }
    //检测argArray是否为Object
    if(typeof argArray !== 'object'){
        throw new TypeError('CreateListFromArrayLike called on non-object');
    }
    //检测argThis是否为null或者undefined
    if(argThis === null || argThis === void 0){
        argThis = getGlobalThis();
    }
    //判断argThis是否能够添加属性---省略
    argThis = new Object(argThis);
    var fn = '__' + new Date().getTime();
    var originFn = argThis[fn];
    var hasOriginFn = argThis.hasOwnProperty(fn);
    argThis[fn] = this;
    var func = generateFunction(argArray.length);
    var result = func(argThis,fn,argArray);
    delete argThis[fn];
    if(hasOriginFn){
        argThis[fn] === originFn;
    }
    return result;
}


```

# bind应用和实现
> bind方法会创建一个新函数。称为绑定函数。当调用这个绑定函数时，绑定函数会以创建它时传入bind()方法的第一个参数作为this，第二个及以后的参数作为原函数的参数在调用时按照参数顺序来调用原函数。

bind的作用：
- 创建一个绑定了this指向的函数
- 后续参数为预设参数，利用闭包保存着

```javascript
//function
console.log(Function.prototype.bind);
//function   说明bind执行后返回function
console.log(Function.prototype.bind());
//bind
console.log(Function.prototype.bind.name);
//'bound '
console.log(Function.prototype.bind().name);


var banana = {
    color:'yellow'
};
function original(a,b){
    console.log(this.color);
    console.log([a,b]);
    return false;
}
//预设1为形参a的值
var bound = original.bind(banana,1);
//'yellow',[1,2]
var boundResult = bound(2);
//false,bind返回的函数执行后可以有返回值
console.log(boundResult);
//2,返回original函数的形参个数
console.log(original.bind().length);
//bound original，返回的函数名为bound+原函数
console.log(bound.name);
//'bound '
console.log((function(){}).bind().name); 
//0
console.log((function(){}).bind().length); 
```
从上面的代码可以知道bind的几个特性:
- bind为Function.prototype的属性，说明每个函数都能调用
- 调用bind的函数中的this指向bind()函数的第一个参数
- 传给bind()的其他参数接收处理了，bind()之后返回的函数的参数也接收处理了，也就是说合并处理了。
- bind本身是一个函数，执行后仍然返回函数，函数名为bound+空格+原函数名。
- bind后返回的bound函数，执行后返回的是原函数的返回值。
- bind函数的形参长度(Function.prototype.bind.length)是1。bind后返回的bound函数形参与绑定的原函数形参个数一致。


## bind应用场景：
通常我们会用_this，that,self来保存this,或者使用箭头函数来绑定this.
```javascript
var foo = {
    bar:1,
    eventBind:function(){
        var _this = this;
        $('element').on('click',function(event){
            console.log(_this.bar);
        })
    },
    eventBind2:function(){
        $('element').on(click,(event)=>{
            console.log(this.bar);
        })
    },
    eventBind3:function(){
        $('element').on(click,function (event){
            console.log(this.bar);
        }.bind(this))
    }
}

```
柯里化函数实现:

```javascript
function test(x){
    return function(y){
        return x + y;
    }
}
test(1)(2);//3

function test2(a,b){
    return a + b;
}
test2.bind(null,1)(2);//3

```
预设参数:
```javascript
function list(){
    return Array.prototype.slice.call(arguments);
}

var list1 = list(1,2,3);//[1,2,3]

var leadingThirtySevenList = list.bind(null,37);
var list2 = leadingThirtySevenList();//[37]
var list3 = leadingThirtySevenList(1,2,3);//[37,1,2,3];

```
使用new实例化绑定函数，也能做到预设参数的效果
```javascript
function Test3(a, b) {
    this.a = a;
    this.b = b;
}
Test3.prototype.add = function () {
    return this.a + this.b;
}
// 如果不用 bind，正常来说这样处理
var t1 = new Test3(1, 2);
t1.add(); // 3, this 指向 t1
// 使用 bind
var NewTest3 = Test3.bind(null, 3);
var t2 = new NewTest3(4);
t2.add(); // 7, this 指向 t2
```

## bind实现
- 返回一个绑定this的函数,这个函数被执行时会执行调用Bind的原函数
- 能够预设参数
- 返回的函数能够作为构造函数

```javascript
Function.prototype.bindFn = function(argThis){
    var func = this;
    return function(){
        func.apply(argThis,arguments)
    }
}
```
解决预设参数:
```javascript
Function.prototype.bindFn = function(argThis){
    var func = this;
    var argArray = Array.prototype.slice.call(arguments,1);
    return function(){
        func.apply(argThis,argArray.concat(Array.prototype.slice.call(arguments)))
    }
}
```
解决生成的函数能够作为构造函数:
```javascript
function createObject(Child,Parent){
    function Fn(){
    }
    Fn.prototype = Parent.protoype;
    var fn = new Fn();
    fn.constructor = Child;
    return fn;
}

Function.prototype.bindFn = function(argThis){
    var func = this;
    var argArray = Array.prototype.slice.call(arguments,1);
    var bound = function(){
        var args = argArray.concat(Array.prototype.slice.call(arguments))
        if(this instanceof bound){
            func.apply(this,args);
        }else{
            func.apply(argThis,args);
        }
    }
    //保持原型关系
    if(this.prototype){
        //参照Object.create的实现
        var proto = createObject(bound,this)
        bound.prototype = proto;
    }
    //设置name和length属性
    Object.definedProperties(bound,{
        'length':{
            value:func.length
        },
        'name':{
            value:'bound '+func.name
        }
    })
    return bound;
}
```
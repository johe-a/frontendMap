<!--
 * @Description: 
 * @Author: johe.huang
 * @Date: 2020-03-18 17:20:19
 -->
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

```
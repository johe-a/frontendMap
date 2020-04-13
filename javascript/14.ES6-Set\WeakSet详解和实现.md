<!--
 * @Description: 
 * @Author: johe.huang
 * @Date: 2020-04-11 16:44:38
 -->
# 基本使用
数据结构Set,类似于数组,但是成员的值都是唯一的，没有重复的值。

Set本身是一个构造函数，用来生成Set数据结构。
Set函数可以接受一个数组（或者具有iterable接口的其他数据结构）作为参数，用来初始化。
```javascript
let set = new Set([1,2,3,4]);
//Set(4) {1,2,3,4}
console.log(set);

set = new Set(document.querySelectorAll('div'));
//6
console.log(set.size);

set = new Set(new Set([1,2,3,4]));
//4
console.log(set.size);

var iterableObject = {
    [Symbol.iterator](){
        let num = 10;
        let current = 1;
        return {
            next(){
                if(current<=num){
                    return {
                        value:current++,
                        done:false
                    }
                }else{
                    return {
                        done:true
                    }
                }
            }
        }
    }
}
set = new Set(iterableObject);
//Set(10) {1,2,3,...}
console.log(set);
```
从上面的例子可以知道，Set实际上是取参数的iterator接口进行初始化的。

# 属性和方法
- add(value):添加值，返回Set实例本身
- delete(value):删除值，返回一个布尔值表示是否删除成功。
- has(value):返回一个布尔值，表示该值是否为Set成员。
- clear():清除所有成员，无返回值。

```javascript
var set = new Set();
// Set(1){1}
set.add(1);
// Set(3){1,2,3}
set.add(2).add(3);

//true
console.log(set.delete(3));
//true
console.log(set.has(2));
//undefined
console.log(set.clear());
//false
console.log(set.has(1));

```

遍历方法：
- keys():返回key的迭代器
- values():返回value的迭代器
- entries():返回key和value的迭代器，也就是这个迭代器每次返回的值是一个[key,value]的键值对
- forEach():使用回调函数遍历每个成员，无返回值


```javascript
//values和keys一致，因为set的key和value相同
let set = new Set([1,2,3]);
//SetIterator{1,2,3}
console.log(set.keys());
//[1,2,3]
console.log(...set.keys());

```

```javascript
//SetIterator{1=>1,2=>2,3=>3}
console.log(set.entries());

//[[1,1,],[2,2],[3,3]]
console.log(...set.entries());
```

属性size返回成员总数。

# 模拟实现
实际上Set构造函数初始化时，取的是参数的迭代器，再对迭代器依次进行add操作。

for...of方法可以帮我们自动迭代迭代器，我们也可以自己实现。
1. 取到迭代器
2. 对迭代器进行迭代，直到返回值的done为true
```javascript
function forOf(iterable,callback){
    if(typeof iterable[Symbol.iterator]!=='function'){
        throw new Error("");
    }
    if(typeof callback !== 'function'){
        throw new Error("");
    }
    var iterator = iterable[Symbol.iterator]();
    var result = iterator.next();
    while(!result.done){
        callback(result.value);
        result = iterator.next();
    }
}
```

初步实现Set:

```javascript
function Set(iterable){
    this.size = 0;
    this.list = [];
    forOf(iterable,(value)=>{
        this.add(value);
    });
}
Set.prototype.add = function(value){
    if(this.list.indexOf(value)===-1){
        this.list.push(value);
        this.size++;
    }
    return this;
}
Set.prototype.has = function(value){
    return this.list.indexOf(value)!==-1 
}
Set.prototype.clear = function(){
    this.list.splice(0,this.list.length);
    this.size = 0;
}
Set.prototype.delete = function(value){
    var index = this.list.indexOf(value);
    if(index===-1){
        return false;
    }
    this.list.splice(index,1);
    this.size--;
    return true;
}
Set.prototype.forEach = function(callback,argThis){
    argThis = argThis||global;
    for(var i = 0;i < this.list.length;i++){
        callback.call(argThis,this.list[i],this.list[i],this);
    }
}
```

由于Set方法中，values()、keys()、entries()方法返回遍历器，而values\keys与entries返回的遍历器规则其实是一致的，只是返回的value不一致，我们可以写一个构造迭代器对象的方法。

```javascript
//写一个返回迭代器对象的方法，该方法迭代数组，并按修饰器修饰返回的value
function makeIterator(arr,descriptor){
    var current = 0;
    var obj = {
        next(){
            if(current<=arr.length){
                return {
                    value:descriptor(arr[current++]),
                    done:false
                }
            }else{
                return{
                    value:void 0,
                    done:true
                }
            }
        }
    }
    obj[Symbol.iterator] = function(){
        return obj;
    }
    return obj;
}

//values\keys一致，因为set的key和value相同
Set.prototype.values = Set.prototype.keys = function(){
    return makeIterator(this.list,function(value){
        return value
    })
}

Set.prototype.entries =function(){
    return makeIterator(this.list,function(value){
        return [value,value]
    })
}

Set.prototype[Symbol.iterator] = function(){
    return this.values();
}

Set.prototype.forEach = function(callback,argThis){
    argThis = argThis || global;
    var iterator = this.entries();
    forOf(iterator,function(value){
        callback.call(argThis,value[1],value[0],this);
    });
}

```

## 判断重复的漏洞
由于使用indexOf来检测重复，实质上与===符号相同
```javascript
// false
NaN === NaN
// -1
[NaN].indexOf(NaN)
```
对于真正的Set，是不能重复添加NaN的

处理的方式是当判断添加的值是NaN时，将其替换为一个独一无二的值，比如一个复杂的字符串，或者使用Symbol
```javascript
const NaNSymbol = Symbol('NaN');

function encodeValIfNaN = function(value){
    //判断是否为NaN的规则就是它不等于它本身
    return value !== value ? NaNSymbol:value;
}

function decodeValIfNaNSymbol  = function(value){
    return value === NaNSymbol ? NaN : value;
}
```

## 完整代码
```javascript
const NaNSymbol = Symbol('NaN');

function encodeValIfNaN(value){
    //判断是否为NaN的规则就是它不等于它本身
    return value !== value ? NaNSymbol:value;
}

function decodeValIfNaNSymbol(value){
    return value === NaNSymbol ? NaN : value;
}

function forOf(iterable,callback){
    if(typeof iterable[Symbol.iterator]!=='function'){
        throw new Error("");
    }
    if(typeof callback !== 'function'){
        throw new Error("");
    }
    var iterator = iterable[Symbol.iterator]();
    var result = iterator.next();
    while(!result.done){
        callback(result.value);
        result = iterator.next();
    }
}
function Set(iterable){
    this.size = 0;
    this.list = [];
    forOf(iterable,(value)=>{
        this.add(value);
    });
}
Set.prototype.add = function(value){
    if(this.list.indexOf(encodeValIfNaN(value))===-1){
        this.list.push(encodeValIfNaN(value));
        this.size++;
    }
    return this;
}
Set.prototype.has = function(value){
    return this.list.indexOf(encodeValIfNaN(value))!==-1 
}
Set.prototype.clear = function(){
    this.list.splice(0,this.list.length);
    this.size = 0;
}
Set.prototype.delete = function(value){
    var index = this.list.indexOf(encodeValIfNaN(value));
    if(index===-1){
        return false;
    }
    this.list.splice(index,1);
    this.size--;
    return true;
}
Set.prototype.forEach = function(callback,argThis){
    argThis = argThis||global;
    for(var i = 0;i < this.list.length;i++){
        callback.call(argThis,decodeValIfNaNSymbol(this.list[i]),decodeValIfNaNSymbol(this.list[i]),this);
    }
}

function makeIterator(arr,descriptor){
    var current = 0;
    var obj = {
        next(){
            if(current<=arr.length-1){
                return {
                    value:descriptor(arr[current++]),
                    done:false
                }
            }else{
                return{
                    value:void 0,
                    done:true
                }
            }
        }
    }
    obj[Symbol.iterator] = function(){
        return obj;
    }
    return obj;
}

//values\keys一致，因为set的key和value相同
Set.prototype.values = Set.prototype.keys = function(){
    return makeIterator(this.list,function(value){
        return decodeValIfNaNSymbol(value)
    })
}

Set.prototype.entries =function(){
    return makeIterator(this.list,function(value){
        return [decodeValIfNaNSymbol(value),decodeValIfNaNSymbol(value)]
    })
}

Set.prototype[Symbol.iterator] = function(){
    return this.values();
}

Set.prototype.forEach = function(callback,argThis){
    argThis = argThis || global;
    //这里entries已经decode过一遍，不需要再次decode
    var iterator = this.entries();
    forOf(iterator,function(value){
        callback.call(argThis,value[1],value[0],this);
    });
}
```

# WeakSet
WeakSet结构和set类似，但是与Set有三点不同：
- 它的成员只能是对象
- 它不能被遍历
- 它的成员都是弱引用

1. 它的成员只能是对象
```javascript
var weakSet = new WeakSet();
//Invalid value use in weak set
weakSet.add(1);
weakSet.add(Symbol());
```

2. 它不能被遍历
WeakSet没有遍历方法，也没有size属性
```javascript
var weakSet = new WeakSet([{a:1},{b:2}]);
//weakSet.forEach is not a function 
weakSet.forEach((item)=>{
    console.log(item);
})
//undefined
console.log(weakSet.size);
```

3. 它的成员都是弱引用
WeakSet的成员都是弱引用，垃圾回收机制不会考虑WeakSet对成员的引用，意味着WeakSet的成员一旦不被其他对象引用时，那么垃圾回收机制会自动回收该对象所占用的内存。
```javascript
var a = {test:1};
var ws = new WeakSet([a]);
//true
ws.has(a);
a = null;
//false
ws.has(a);
```
WeakSet的原型只有三种方法：
- WeakSet.prototype.add(value);
- WeakSet.prototype.delete(value);
- WeakSet.prototype.has(value)

# WeakSet的作用
WeakSet成员不被计入引用的特性，可以帮助我们不用考虑它的内存泄漏问题。  

例如：保证某个原型的方法只能被其实例调用时
```javascript
//如果用set实现
const set = new Set();
class Foo{
    constructor(){
        set.add(this);
    }
    method(){
        if(!set.has(this)){
            throw new TypeError('Foo.prototype.method 只能在Foo的实例上调用！');
        }
    }
}
```
如果用上面的方式去判断是否为Foo对象的实例，我们就要考虑set中对Foo对象的引用。如果Foo所有实例都没被引用了，Set当中还存在引用，则不会回收。
正确的做法是，先取消Set引用后，再取消对象的引用。
```javascript
//如果用set实现
const set = new Set();
class Foo{
    constructor(){
        set.add(this);
    }
    method(){
        if(!set.has(this)){
            throw new TypeError('Foo.prototype.method 只能在Foo的实例上调用！');
        }
    }
    destory(){
        //在取消对象引用前，要先调用这个方法
        set.delete(this);
    }
}
```
这种做法，如果没有手动调用destory前就释放了引用，就会造成内存泄漏

使用WeakSet可以不考虑这个问题：
```javascript
const ws = new WeakSet();
class Foo{
    constructor(){
        ws.add(this);
    }
    method(){
        if(!ws.has(this)){
             throw new TypeError('Foo.prototype.method 只能在Foo的实例上调用！');
        }
    }
}

```
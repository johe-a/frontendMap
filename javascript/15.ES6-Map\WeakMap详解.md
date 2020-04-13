<!--
 * @Description: 
 * @Author: johe.huang
 * @Date: 2020-04-13 22:06:53
 -->
# Map
Map存储的本质上与Object一样都是键值对。但是Object只能将字符串当做键名，这给它的使用带来了很大的限制。
```javascript
const data = {};
const element = document.querySelector('div');

data[element] = 'meta Data';

//实质上会被转化成字符串
data['[object HTMLDivElement]']
```

为了解决这个问题,ES6提供了新的数据结构Map。它类似于对象，也是键值对的集合，但是键的范围不限于字符串，各种类型的值都可以当做键名。

***也就是说，Object和Map本质上的区别是：***
- Object本质是'字符串'-'值'的键值对集合
- Map本质是'值'-'值'的键值对集合

# 基本用法
Map比Object更适合做键值对的集合。

```javascript
const map = new Map();
const o = { p :'hello world'};
map.set(o,'value');
//value
map.get(o);
//true
map.has(o);
map.delete(o);
//false
map.has(o);
```

构造函数形式创建Map
```javascript
const map = new Map([ ['key1','value1'],['key2','value2'] ]);
//true
map.has('key1');
//value1
map.get('key1');

```

事实上，任何具有iterator接口，并且迭代器每次都返回双元素的数组的对象，都可以被用来创建Map。
```javascript

const set = new Set([
  ['foo', 1],
  ['bar', 2]
]);
const m1 = new Map(set);
m1.get('foo') // 1

```
上面用set来创建Map,这是由于set具有iterator接口，其实set的iterator接口指向了它的values方法，也就等同于下面的对象
```javascript
var obj = {
    list:[['foo',1],['bar',2]],
    [Symbol.iterator](){
        let index = 0;
        let that = this;
        return {
            next(){
                if(index<that.list.length){
                    return {value:that.list[index++],done:false }
                }else{
                    return {value:void 0,done:true}
                }
            }
        }
    }
}
const m1 = new Map(obj);
//1
m1.get('foo');

```

# 属性和方法
Map具有以下属性和方法：
- size属性，获取Map的成员总数
- Map.prototype.set(key,value)
- Map.prototype.get(key)
- Map.prototype.has(key)
- Map.prototype.delete(key)
- Map.prototype.clear():删除所有成员

Map具有以下遍历方法
- Map.prototype.keys():返回键名的遍历器
- Map.prototype.values():返回键值的遍历器(默认的遍历器)
- Map.prototype.entries():返回所有成员的遍历器
- Map.prototype.forEach()
```javascript
Map[Symbol.iterator] = map.entries
```
```javascript
const map = new Map([
  ['F', 'no'],
  ['T',  'yes'],
]);

for (let key of map.keys()) {
  console.log(key);
}
// "F"
// "T"

for (let value of map.values()) {
  console.log(value);
}
// "no"
// "yes"

for (let item of map.entries()) {
  console.log(item[0], item[1]);
}
// "F" "no"
// "T" "yes"

// 或者
for (let [key, value] of map.entries()) {
  console.log(key, value);
}
// "F" "no"
// "T" "yes"

// 等同于使用map.entries(),也就是Map默认的遍历器为entries
for (let [key, value] of map) {
  console.log(key, value);
}
// "F" "no"
// "T" "yes"
```

# WeakMap
WeakMap和Map有以下几个不同点：
1. WeakMap只接受对象作为键名
```javascript
const map = new WeakMap();
//TypeError:Invalid value used as weak map key
map.set(1,2);
//TypeError:Invalid value used as weak map key
map.set(null,2);
```
2. WeakMap的键名所引用的对象是弱引用
在JS中，创建一个对象，就是建立一个强引用
```javascript
var obj = new Object();
```
只有当我们手动设置所有对当前对象的引用为Null时，才有可能回收Obj所引用的对象。
```javascript
obj = null;
```

正常情况下：
map其实建立了对key的强引用，当我们设置key=null时，只是去掉了key对Obj的强引用，没有去处调map对obj的强引用，所以对象还是不会被回收掉。
```javascript
const key = new Array(5*1024);
const map = new Map([[key,1]]);
```

***通过Node的允许手动执行垃圾回收机制的方法，可以验证这个问题***

```javascript
//允许手动执行垃圾回收机制
node --expose-gc

global.gc();
//返回Node的内存占用情况，单位是bytes
//heapUsed:4640360 约等于4.4M
process.memoryUsage();

const map = new Map();
let key = new Array(5*1024*1024);
map.set(key,1);
global.gc();
//heapUsed: 46851472 这里大约是44.6M
process.memoryUsage();

key = null;
global.gc();
//headUsed: 46754648 和上面差不多
process.memoryUsage();

//此时key为Null，其实没有任何作用
map.delete(key);
global.gc();
//heapUsed: 46755856
process.memoryUsage();
```
所以如果想要让对象被回收掉，需要先delete(key)，然后再设置key=null
```javascript
const map = new Map();
let key = new Array(5*1024*1024);
map.set(key,1);
global.gc();
console.log(process.memoryUsage());

map.delete(key);
key = null
global.gc();
console.log(process.memoryUsage());

```
如果使用WeakMap则不用担心WeakMap键值对对象的引用:
```javascript
global.gc();
console.log(process.memoryUsage());
const vm = new WeakMap();
let key = new Array(5*1024*1024);
vm.set(key,1);
key = null;
global.gc();
console.log(process.memoryUsage());
```

***也正是因为这样的特性，WeakMap内部有多少个成员，取决于垃圾回收机制有没有运行，运行前后很可能成员个数是不一样的，垃圾回收机制运行是不可预测的，所以规定WeakMap不能遍历,所以也没有size属性和clear()方法。WeakMap只有get、set、has、delete方法***

# WeakMap应用
1. 在DOM对象上保存相关数据
不用担心DOM被删除后，还存在内存泄漏的问题
```javascript
let wm = new WeakMap();
let element = document.querySelector("div");
wm.set(element,"data");
let value = wm.get(element);
//data
console.log(value);
element.parentNode.removeChild(element);
element = null;
//不需要担心WeakMap里面的引用
```
2. 数据缓存
当我们需要关联对象和数据，比如在不修改原有对象的情况下储存某些属性或者根据对象储存一些计算的值等，而又不想管理这些数据的死活时非常适合考虑使用 WeakMap。数据缓存就是一个非常好的例子：
```javascript
const cache = new WeakMap();
function countOwnKeys(obj) {
    if (cache.has(obj)) {
        console.log('Cached');
        return cache.get(obj);
    } else {
        console.log('Computed');
        const count = Object.keys(obj).length;
        cache.set(obj, count);
        return count;
    }
}
```
3. 实现对象的私有属性
WeakMap 也可以被用于实现私有变量，不过在 ES6 中实现私有变量的方式有很多种，这只是其中一种：
```javascript
const privateData = new WeakMap();

class Person {
    constructor(name, age) {
        privateData.set(this, { name: name, age: age });
    }

    getName() {
        return privateData.get(this).name;
    }

    getAge() {
        return privateData.get(this).age;
    }
}

export default Person;
```
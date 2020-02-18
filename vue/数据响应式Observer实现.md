## 目录
- [响应式系统](#响应式系统)
  * [监听(观察)数据](#--------)



## 响应式系统
>个人理解，响应式意味着数据的变更能够及时的响应，并且更新到依赖当前数据的视图上。

![响应式](https://tva1.sinaimg.cn/large/0082zybpgy1gc11vk8nk5j31640mg40q.jpg)

可以将响应式分解成三个步骤：
- 数据的更改和读取可监听（Object.defineProperty）
- 依赖（订阅者）收集（获取具体的vue实例对当前数据的依赖）
- 数据更新后的响应（通知订阅者）

### 监听(观察)数据
>通过Object.defineProperty我们可以很容易监听到数据的读取和更改
```javascript
/*
  obj：目标对象
  property:目标对象的属性名
  descriptor:描述符
*/
Object.defineProperty(obj,property,descriptor)

```
descriptor描述符的属性：
  - enumerable:为true时，该属性才能够出现在对象的枚举属性中,默认为false,for in 以及Object.keys()无法获取
  - configurable:为true时，该属性描述符才能够被改变，同时该属性也能从对应的对象上被删除。默认为false。
  - writable:为true时，value才能被赋值运算符改变。默认为false
  - value:该属性对应的值
  - get:定义getter
  - set:定义setter
  
  **如果一个描述符同时有(value或writable)和(get或set)关键字，将会产生一个异常。**

可以通过getter和setter来监听数据
```javascript
function observe(obj){
  if(!obj||typeof obj !=='object'){
    return 
  }
  for(let prop in obj){
    //如果当前属性对应的值是对象，递归监听
    //这里不考虑为数组的情况
    if(obj[prop]&&typeof obj[prop] === 'object'){
      observe(obj[prop])
    }
    defineReactive(obj,prop,obj[prop])
  }
}

function defineReactive(obj,prop,value){
  Object.defineProperty(obj,prop,{
      enumerable:true,
      configurable:true,
      get:function(){
        //在这里监听读操作
        return value
      },
      set:function(newValue){
        //在这里监听写操作
        value = newValue
      }
    })
}

class Vue{
  constructor(options){
    this._data = options.data()
    observe(this._data)
  }
}

```

### 依赖(订阅者)收集
>依赖(订阅者)收集帮助我们了解到哪一些vue实例使用了当前数据，在数据更新时我们就可以根据依赖来提醒哪些vue实例需要更新视图

例如:一个数据可能被多个vm实例的视图引用，当text1更新时，在视图层用到当前数据的实例需要更新视图
```javascript
let globalObj = {
    text1: 'text1'
};

let o1 = new Vue({
    template:
        `<div>
            <span>{{text1}}</span> 
        <div>`,
    data: globalObj
});

let o2 = new Vue({
    template:
        `<div>
            <span>{{text1}}</span> 
        <div>`,
    data: globalObj
});
```
**通过getter函数我们可以很清楚的知道依赖当前数据的实例**

```javascript
function defineReactive(obj,prop,value){
    ...
    Object.defineProperty(obj,prop,{
      ...
      get:function(){
        //在这里进行依赖收集
      }
    })
}
```

#### 实现一个订阅者的容器Dep(调度中心)
>哪个实例依赖了当前的数据，说明该实例需要订阅当前数据的更新，所以我们需要实现一个订阅者的容器，收集依赖当前数据的实例

![订阅者容器](https://tva1.sinaimg.cn/large/0082zybpgy1gc116d3zmmj31420ewjsi.jpg)

```javascript
class Dep{
  constructor(){
    //维护一个订阅者的数组
    this.subscribers = []
  }
  //增加订阅
  addSub(watcher){
    this.subscribers.push(watcher)
  }
  //通知所有订阅者视图更新
  notify(){
    this.subscribers.forEach((watcher)=>{
      watcher.update()
    })
  }
}

function defineReactive(obj,prop,value){
    //通过闭包维护value和Dep
    let Dep = new Dep()
    Object.defineProperty(obj,prop,{
      ...
      get:function(){
        //在这里进行订阅者收集
        Dep.addSub(watcher)
      },
      set:function(newValue){
        if(newValue!==value){
          value === newValue
          //通知订阅者
          Dep.notify()
        }
      }
    })
}
```

### 订阅者
>已知我们可以在setter中，通过订阅者的容器Dep来通知订阅者。

```javascript
class Watcher{
  constructor(){
    //存放当前Wathcer实例到Dep中
    Dep.target = this
  }
  update(){
    //调用视图刷新
  }
}
```

数据响应式完整代码(粗略版)
```javascript
function observe(obj){
  if(!obj||typeof obj !=='object'){
    return 
  }
  for(let prop in obj){
    //如果当前属性对应的值是对象，递归监听
    //这里不考虑为数组的情况
    if(obj[prop]&&typeof obj[prop] === 'object'){
      observe(obj[prop])
    }
    defineReactive(obj,prop,obj[prop])
  }
}

function defineReactive(obj,prop,value){
 //通过闭包维护value和Dep
  let Dep = new Dep()
  Object.defineProperty(obj,prop,{
      enumerable:true,
      configurable:true,
      get:function(){
        //在这里进行订阅者收集
        Dep.addSub(watcher)
      },
      set:function(newValue){
        if(newValue!==value){
          value === newValue
          //通知订阅者
          Dep.notify()
        }
      }
    })
}

//调度中心（订阅者容器，依赖的容器）
class Dep{
  constructor(){
    //维护一个订阅者的数组
    this.subscribers = []
  }
  //增加订阅
  addSub(watcher){
    this.subscribers.push(watcher)
  }
  //通知所有订阅者视图更新
  notify(){
    this.subscribers.forEach((watcher)=>{
      watcher.update()
    })
  }
}

//订阅者
class Watcher{
  constructor(){
    //存放当前Wathcer实例到Dep中
    Dep.target = this
  }
  update(){
    //调用视图刷新
  }
}


class Vue{
  constructor(options){
    this._data = options.data()
    observe(this._data)
    new Watcher()
    //触发getter
    console.log(this._data.a)
  }
}

new Vue({
  data:function(){
    return {
      a:1
    }
  }
})

```






















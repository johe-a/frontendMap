# computed

执行流程图和原理如下图

![](https://tva1.sinaimg.cn/large/0082zybpgy1gcatvk1585j310r0e3juj.jpg)

## initComputed
计算属性的初始化时发生在Vue实例初始化阶段的initState函数中的,执行了

```javscript
if(opts.computed){
    initComputed(vm,opts.computed)
}
```

initComputed函数的步骤：
- 获取computed属性的getter函数
- 创建一个computed的Watcher实例
- 如果key已存在vm实例中（则发出警告）,否则调用defineComputed

```javascript
const computedWatcherOptions = { computed: true }
function initComputed (vm: Component, computed: Object) {
  // $flow-disable-line
  const watchers = vm._computedWatchers = Object.creat(null)
  // computed properties are just getters during SSR
  const isSSR = isServerRendering()

  for (const key in computed) {
    const userDef = computed[key]
    //获取getter，这里可以看出computed的配置方式除了函数还能是对象
    const getter = typeof userDef === 'function' ? userDef : userDef.get
    if (process.env.NODE_ENV !== 'production' && getter == null) {
      warn(
        `Getter is missing for computed property "${key}".`,
        vm
      )
    }

    if (!isSSR) {
      // create internal watcher for the computed property.
      // 创建一个computed的Watcher
      watchers[key] = new Watcher(
        vm,
        getter || noop,
        noop,
        computedWatcherOptions
      )
    }

    // component-defined computed properties are already defined on the
    // component prototype. We only need to define computed properties defined
    // at instantiation here.
    // 从这里的判断可以看出props和data的数据已经被proxy到vm实例上，且优先级大于computed
    if (!(key in vm)) {
      defineComputed(vm, key, userDef)
    } else if (process.env.NODE_ENV !== 'production') {
      if (key in vm.$data) {
        warn(`The computed property "${key}" is already defined in data.`, vm)
      } else if (vm.$options.props && key in vm.$options.props) {
        warn(`The computed property "${key}" is already defined as a prop.`, vm)
      }
    }
  }
}
```
从上面的代码可以注意到几点：
1. computed的配置方式除了函数还可以是对象
2. computed创建的Watcher实例是一个Computed watcher
3. computed的属性不能与data和props中的重复

## defineComputed
```javascript
export function defineComputed (
  target: any,
  key: string,
  userDef: Object | Function
) {
  //如果不是SSR则默认需要cache
  const shouldCache = !isServerRendering()
  //如果是getter是函数
  if (typeof userDef === 'function') {
    //判断是否需要缓存，需要缓存则调用createComputedGetter,否则直接设置sharedPropertyDefinition.get为getter
    sharedPropertyDefinition.get = shouldCache
      ? createComputedGetter(key)
      : userDef
    sharedPropertyDefinition.set = noop
  } else {
    //对象形式，还要判断是否配置了cache为false,由此可见computed还有cache、set配置  
    sharedPropertyDefinition.get = userDef.get
      ? shouldCache && userDef.cache !== false
        ? createComputedGetter(key)
        : userDef.get
      : noop
    sharedPropertyDefinition.set = userDef.set
      ? userDef.set
      : noop
  }
  if (process.env.NODE_ENV !== 'production' &&
      sharedPropertyDefinition.set === noop) {
    sharedPropertyDefinition.set = function () {
      warn(
        `Computed property "${key}" was assigned to but it has no setter.`,
        this
      )
    }
  }
  //给计算属性添加getter和stter
  Object.defineProperty(target, key, sharedPropertyDefinition)
}

```
应该注意到，一个computed属性，也需要被数据劫持监听

createComputedGetter的定义
```javascript

function createComputedGetter (key) {
  return function computedGetter () {
    const watcher = this._computedWatchers && this._computedWatchers[key]
    if (watcher) {
      watcher.depend()
      return watcher.evaluate()
    }
  }
}

```
***在defineReactive中，被劫持的数据会在getter中进行依赖收集，这里的作用也是进行依赖收集，并返回值
也就是说computed Watcher应该不仅保存着它依赖数据的Dep,还应该维护着一个Dep订阅者中心来保存依赖当前计算属性值的Watcher***

## Computed Watcher

Computed Watcher完成两项工作：

- 完成计算属性与被依赖属性的绑定(Computed Watcher没有视图更新函数)
- 保存依赖计算属性的渲染Watcher到Dep中(也就是视图层使用了计算属性的元素渲染Watcher)

```javascript
export default class Watcher {
  vm: Component;      //存放vm实例
  expression: string;
  cb: Function;       //视图更新的回调函数
  lazy: boolean;      //true 下次触发时获取expOrFn当前值；false 立即获取当前值
  dirty: boolean;
  active: boolean;
  computed:boolean;   //是否为computed Watcher
  dep:Dep;            //保存依赖计算属性的Watcher
  deps: Array<Dep>;   //保存计算属性依赖数据的Dep
  newDeps: Array<Dep>;
  depIds: ISet;
  newDepIds: ISet;
  getter: Function;
  value: any;

  constructor (
    vm: Component,
    expOrFn: string | Function,
    cb: Function,
    options?: Object
  ) {
    //省略
    //这里是computed Watcher的不同之处
    if (this.computed) {
       //不会立即求值，同时持有一个Dep实例
       this.value = undefined
       this.dep = new Dep()
    } else {
       this.value = this.get()
    }
  }

  /**
   * Evaluate the getter, and re-collect dependencies.
   */
   /*获得getter的值并且重新进行依赖收集*/
  get () {
    /*将自身watcher观察者实例设置给Dep.target，用以依赖收集。*/
    pushTarget(this)
    let value
    const vm = this.vm
    //调用表达式，这里的getter指的是当前watcher对应的表达式，但表达式会触发依赖数据的getter
    if (this.user) {
      try {
        value = this.getter.call(vm, vm)
      } catch (e) {
        handleError(e, vm, `getter for watcher "${this.expression}"`)
      }
    } else {
      value = this.getter.call(vm, vm)
    }
    // 这里用了touch来形容，意味着触发
    // "touch" every property so they are all tracked as
    // dependencies for deep watching
    /*如果存在deep，则触发每个深层对象的依赖，追踪其变化*/
    if (this.deep) {
      /*递归每一个对象或者数组，触发它们的getter，使得对象或数组的每一个成员都被依赖收集，形成一个“深（deep）”依赖关系*/
      traverse(value)
    }

    /*将观察者实例从target栈中取出并设置给Dep.target*/
    popTarget()
    this.cleanupDeps()
    return value
  }

  /**
   * Add a dependency to this directive.
   */
   /*添加一个依赖关系到Deps集合中*/
  addDep (dep: Dep) {
    const id = dep.id
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id)
      this.newDeps.push(dep)
      if (!this.depIds.has(id)) {
        dep.addSub(this)
      }
    }
  }

  /**
   * Subscriber interface.
   * Will be called when a dependency changes.
   */
   /*
      调度者接口，当依赖发生改变的时候进行回调。
   */
  update () {
    /* istanbul ignore else */
    if (this.computed) {
      // A computed property watcher has two modes: lazy and activated.
      // It initializes as lazy by default, and only becomes activated when
      // it is depended on by at least one subscriber, which is typically
      // another computed property or a component's render function.
      if (this.dep.subs.length === 0) {
        // In lazy mode, we don't want to perform computations until necessary,
        // so we simply mark the watcher as dirty. The actual computation is
        // performed just-in-time in this.evaluate() when the computed property
        // is accessed.
        this.dirty = true
      } else {
        // In activated mode, we want to proactively perform the computation
        // but only notify our subscribers when the value has indeed changed.
        this.getAndInvoke(() => {
          this.dep.notify()
        })
      }
    } else if (this.sync) {
      this.run()
    } else {
      queueWatcher(this)
    }
  }

  /**
   * Scheduler job interface.
   * Will be called by the scheduler.
   */
   /*
      调度者工作接口，将被调度者回调。
    */
  run () {
    if (this.active) {
      const value = this.get()
      if (
        value !== this.value ||
        // Deep watchers and watchers on Object/Arrays should fire even
        // when the value is the same, because the value may
        // have mutated.
        /*
            即便值相同，拥有Deep属性的观察者以及在对象／数组上的观察者应该被触发更新，因为它们的值可能发生改变。
        */
        isObject(value) ||
        this.deep
      ) {
        // set new value
        const oldValue = this.value
        /*设置新的值*/
        this.value = value

        /*触发回调渲染视图*/
        if (this.user) {
          try {
            this.cb.call(this.vm, value, oldValue)
          } catch (e) {
            handleError(e, this.vm, `callback for watcher "${this.expression}"`)
          }
        } else {
          this.cb.call(this.vm, value, oldValue)
        }
      }
    }
  }

  /**
   * Evaluate the value of the watcher.
   * This only gets called for lazy watchers.
   */
   /*获取观察者的值，仅用于computed watchers*/
  evaluate () {
    if (this.dirty) {
      this.value = this.get()
      this.dirty = false
    }
    return this.value
  }

  /**
   * Depend on all deps collected by this watcher.
   */
   /*收集该watcher的所有deps依赖，仅用于Computed Watcher*/
  depend () {
    if (this.dep && Dep.target) {
       this.dep.depend()
    }
  }
}
```

在Compile阶段，会对元素进行遍历，对于文本节点会查看其是否包含{{}}指令，对于元素节点会对属性进行遍历，查看是否存在v-text之类的指令，生成Watcher实例绑定指令对应的视图更新函数与被依赖数据,查看以下实例
```vue
<template>
    <div>
        <span v-text="fullName"></span>
    </div>
</template>

<script>
export default {
  data() {
    return {
        firstName:'johe',
        secondName:'test'
    }
  },
  computed:{
      fullName(){
          return this.fistName + ' ' +this.secondName
      }
  }
}
</script>

```

在Compile阶段，会对span的属性进行遍历，当遍历到v-text时，会为其绑定text对应的视图更新函数和被依赖数据，是通过实例化Watcher来进行绑定的。同理，***当计算属性fullName在Compile阶段被触发getter时，应该收集当前被渲染元素节点span的Watcher实例，这个收集过程是通过Computed Watcher实现的***

即元素节点指令访问fullName,fullName的getter触发(根据上面的computedGetter)，调用Computed Watcher的depend(),depend方法调用Dep.depend()
Dep.depend()会调用当前元素节点对应的Watcher.addDep(),在调用Dep.addSub收集当前渲染Wathcer

总的流程：
元素节点```<span v-text="fullName"></span>```生成渲染Watcher->触发计算属性fullName的getter->调用Computed Watcher的Depend->调用Dep.depend()->调用渲染Watcher的addDep收集计算属性的Dep->调用计算属性Dep.addSub收集当前渲染Watcher.完成双向绑定

回顾下Dep类：
```
export default class Dep {
  static target: ?Watcher;
  id: number;
  subs: Array<Watcher>;

  constructor () {
    this.id = uid++
    this.subs = []
  }

  addSub (sub: Watcher) {
    this.subs.push(sub)
  }

  removeSub (sub: Watcher) {
    remove(this.subs, sub)
  }

  depend () {
    if (Dep.target) {
      Dep.target.addDep(this)
    }
  }

  notify () {
    // stabilize the subscriber list first
    const subs = this.subs.slice()
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}
```

所以Computed Watcher不仅依赖着它的getter中的数据，例如上图的this.firstName和this.secondName,也同时被元素节点对应的Watcher依赖。


## 计算属性依赖数据的绑定
fullName计算属性同时依赖着firstName和secondName，那么在fullName执行getter函数的时候，会触发firstName和secondName的getter，在getter中firstName的Dep和secondName的Dep完成了对Computed Watcher的依赖收集。
当firstName或者secondName更新时，setter函数被调用，通过Dep去发布更新的通知，调用Computed Watcher的update方法
```javascript
update () {
    /* istanbul ignore else */
    if (this.computed) {
      // A computed property watcher has two modes: lazy and activated.
      // It initializes as lazy by default, and only becomes activated when
      // it is depended on by at least one subscriber, which is typically
      // another computed property or a component's render function.
      if (this.dep.subs.length === 0) {
        // In lazy mode, we don't want to perform computations until necessary,
        // so we simply mark the watcher as dirty. The actual computation is
        // performed just-in-time in this.evaluate() when the computed property
        // is accessed.
        this.dirty = true
      } else {
        // In activated mode, we want to proactively perform the computation
        // but only notify our subscribers when the value has indeed changed.
        this.getAndInvoke(() => {
          this.dep.notify()
        })
      }
    } else if (this.sync) {
      this.run()
    } else {
      queueWatcher(this)
    }
}


getAndInvoke (cb: Function) {
  const value = this.get()
  if (
    value !== this.value ||
    // Deep watchers and watchers on Object/Arrays should fire even
    // when the value is the same, because the value may
    // have mutated.
    isObject(value) ||
    this.deep
  ) {
    // set new value
    const oldValue = this.value
    this.value = value
    this.dirty = false
    if (this.user) {
      try {
        cb.call(this.vm, value, oldValue)
      } catch (e) {
        handleError(e, this.vm, `callback for watcher "${this.expression}"`)
      }
    } else {
      cb.call(this.vm, value, oldValue)
    }
  }
}
```
通过查看update方法，可以知道computed watcher实际上是有两种模式的，lazy和active,如果this.dep.subs.length ===0成立，说明没人人订阅计算属性的变化，仅仅把dirty设置为true(作用为下次访问计算属性的时候才会求值)。
假设目前有元素节点依赖当前计算属性，则会调用getAndInvoke()方法,方法首先对计算属性进行求值，然后再调用Dep.notify通知依赖计算属性的Watcher进行视图更新。

![](https://tva1.sinaimg.cn/large/0082zybpgy1gcazpzoxjgj325g0g4af4.jpg)











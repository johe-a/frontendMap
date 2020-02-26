# computed
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
在Compile阶段，会对span的属性进行遍历，当遍历到v-text时，会为其绑定text对应的视图更新函数和被依赖数据，是通过实例化Watcher来进行绑定的(Watcher被实例化后，会获取当前表达式值，获取值的过程触发被依赖数据的getter，getter会在被依赖数据的Dep中添加Watcher，从而Watcher与被依赖数据产生绑定。而Watcher通过回调函数内的闭包，保存着对应元素节点的视图更新函数，从而实现视图更新函数与被依赖数据的绑定)。同理，***当计算属性fullName在Compile阶段被触发getter时，应该收集当前被渲染元素节点span的Watcher实例，这个收集过程是通过Computed Watcher实现的***
即Computed Watcher不仅依赖着它的getter中的数据，例如上图的this.firstName和this.secondName,也同时被元素节点对应的Watcher依赖。






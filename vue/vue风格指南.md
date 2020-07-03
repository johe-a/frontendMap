<!--
 * @Description: 
 * @Author: johe.huang
 * @Date: 2020-06-29 18:36:26
--> 
# 组件的data必须是一个函数
当组件中使用data属性的时候，它的值必须是返回一个对象的函数(除了new Vue之外的任何地方)。
```javascript
//bad
data:{
    listTilte:'',
    todos:[]
}
//good
data(){
    return {
        listTitile:'',
        todos:[]
    }
}
```
**假设TodoList组件的data是一个对象，在我们需要重用这个组件的时候，例如购物列表、事务列表等。因为每个组件的实例都引用了相同的数据对象，更改其中一个列表的标题就会改变每一个列表的标题。所以，data设置为函数是为了保证每个组件实例都生成一个独立的数据对象，互不影响**

# Prop定义尽量详细
- 写明组件的API，容易看懂组件的用法
- 在开发环境下，如果一个组件的prop格式不正确,Vue会告警
```javascript
//bad 
props:['status']
//good
props:{
    status:String
}
//better
props:{
    status:{
        type:String,
        required:true,
        validator:function(value){
            //限定枚举值
            return [
                'syncing',
                'synced',
                'version-conflict',
                'error'
            ].indexOf(value) !== -1;
        }
    }
}
```

# v-for必须设置唯一键值
总是用唯一key配合v-for,这样Vue在优化渲染的时候会把DOM的更改降到最低。

**实质原因：因为子节点在进行diff算法的时候，每一轮会对新旧的VNode首尾节点进行两两对比，一旦没有匹配上，就会相方设法让新开始节点的下标往内靠拢，这个时候会根据旧的VNode生成一个key的map，如果没有key的情况下，新的节点会匹配不到旧的节点，直接插入到旧的开始节点之前，即使存在可以复用的节点。**

假设存在A、B、C、D、E的列表，更新变成B、C、D列表，在进行两两对比判断时，由于旧的首尾节点被删除，所以一直无法匹配，又由于没有key，则会导致新的B、C、D直接插入，而旧的B、C、D被删除，得不到复用。

```html
<ul>
    <li v-for="todo in todos" :key="todo.id">
        {{todo.text}}
    </li>
</ul>

```
# v-if和v-for不要用在一个元素上
```html
//bad
<ul>
  <li
    v-for="user in users"
    v-if="user.isActive"
    :key="user.id"
  >
    {{ user.name }}
  </li>
</ul>
```
这是由于v-for比v-if具有更高的优先级，这个模板会经过如下运算：
```javascript
this.users.map(function (user) {
  if (user.isActive) {
    return user.name
  }
})
```
因此哪怕我们只渲染出一小部分用户的元素，也得在每次重渲染的时候遍历整个列表，不论活跃用户是否发生了变化。
- 渲染时会遍历所有用户，渲染低效
- 每次都遍历整个列表，不管user是否发生改变

通过将其更换为在如下的一个计算属性上遍历：
```javascript
<ul>
  <li
    v-for="user in activeUsers"
    :key="user.id"
  >
    {{ user.name }}
  </li>
</ul>

//good
computed: {
  activeUsers: function () {
    return this.users.filter(function (user) {
      return user.isActive
    })
  }
}
```
我们将会获得如下好处:
- 过滤后的列表只会在users数组发生变化的时候才会被重新运算
- 在渲染时只遍历活跃用户，渲染更高效


# 为组件样式设置作用域
对于应用来说，顶级 App 组件和布局组件中的样式可以是全局的，但是其它所有组件都应该是有作用域的。

这条规则只和单文件组件有关。你不一定要使用 scoped attribute。设置作用域也可以通过 CSS Modules，那是一个基于class 的类似 BEM 的策略，当然你也可以使用其它的库或约定。

**倾向于用CSS Modules或者BEM策略，因为scoped attribute的class名称不易于阅读**
```css
<!-- 使用 `scoped` attribute -->
<style scoped>
.button {
  border: none;
  border-radius: 2px;
}

.button-close {
  background-color: red;
}

<!-- 使用 CSS Modules -->
<style module>
.button {
  border: none;
  border-radius: 2px;
}

.buttonClose {
  background-color: red;
}
</style>

</style>

```

# Mixin和插件的函数名设置
始终为插件、混入等不考虑作为对外公共 API 的自定义私有 property 使用 $_ 前缀。并附带一个命名空间以回避和其它作者的冲突 (比如 $_yourPluginName_)。同名覆盖策略为组件的data、props、methods优先，但生命周期会合并，并且以mixin的先执行。
```javascript
//bad 
var myGreatMixin = {
  // ...
  methods: {
    update: function () {
      // ...
    }
  }
}
//good
var myGreatMixin = {
  // ...
  methods: {
    $_myGreatMixin_update: function () {
      // ...
    }
  }
}
```

# 组件的命名
组件文件名要么始终是单词大写开头，要么始终是横线连接。

单词大写开头对于代码编辑器的自动补全最为友好，因为这使得我们在JS中引用组件的方式尽可能的一致。
```
//bad
components/
| - mycomponent.vue

components/
| - myComponent.vue

//good
components/
| - my-component.vue

//good
components/
| - MyComponent.vue


```

# Prop名大小写
在声明prop的时候，应该始终使用驼峰，在HTML中应该使用横线连接:
```javascript
//bad 
props:{
    'greeting-text':String
}
<WelcomeMessage greetingText="hi">
//good
props:{
    greetingText:String
} 

<WelcomeMessage greeting-text="hi">
```

# 指令缩写
指令缩写(用:表示v-bind,@表示v-on,#表示v-slot:)应该要么都用，要么都不用，不应该混用
```html
<template #header>
  <h1>Here might be a page title</h1>
</template>

<template #footer>
  <p>Here's some contact info</p>
</template>
```

# 组件的选项顺序
- el : 触发组件外的影响
- name(提供组件名方便调试)/parent : 组件以外的知识
- functional(用于函数式组件) : 更改组件的类型
- delimiters(改变v-text的{{}}写法)/comments(是否保留html中的注释) : 模板修改器，改变模板的编译方式
- components/directives(自定义指令)/filters(自定义过滤器):模板内使用的资源
- extends(与mixins类似，等同于Vue.extend，用于从某个组件对象继承)/minxins:合并属性
- inheritAttrs/model/props/propsData(实例化含有Props接口的组件构造器时传入props):组件的接口
- data/computed:本地的响应式property
- watch:通过响应式时间出发的回调
- 生命周期钩子函数，按执行顺序
- 非响应式的属性：methods
- 渲染：template/render

# v-if/v-else 使用key
Vue会尽可能的更新DOM。这就意味着在相同类型的元素之间切换时，会修补已经存在的元素，而不是移除后添加一个新的元素。

```html
<div
  v-if="error"
  key="search-status"
>
  错误：{{ error }}
</div>
<div
  v-else
  key="search-results"
>
  {{ results }}
</div>

```
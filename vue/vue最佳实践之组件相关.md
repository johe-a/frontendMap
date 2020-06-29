# 前言
主要实践：组件的通信、组件的分类、组件的声明周期

父子组件通信的方式有很多种，例如props和emit、$attrs和$listeners、vuex、event bus、provide&inject、sync修饰符、插槽、$refs等。  
组件可以分为简单组件、复杂组件、全局组件、页面组件等。  

# 组件的通信方式
## sync修饰符 
在有些情况下，我们可能需要对一个prop进行"双向绑定",不幸的是，真正的双向绑定会带来维护上的问题，因为子组件可以变更父组件，且在父组件和子组件都没有明显的变更来源。

往常，我们修改props的数据是通过emit父组件的方法去更新的，现在我们可以通过update语法糖来简化：
```javascript
this.$emit('update:title',newTitle);
```
然后父组件可以监听那个事件并根据需要更新一个本地的数据:
```html
<text-document
    v-bind:title="doc.title"
    v-on:update:title="doc.title = $event"
>
</text-document>
```
为了方便起见，我们为这种模式提供一个缩写，即.sync修饰符:
```html
<text-document v-bind:title.sync="title"></text-document>
//等同于
<text-document :title.sync="title"></text-document>
```
**带有.sync修饰符的v-bind不能和表达式一起使用(例如v-bind:title.sync="doc.title+'!'")。你只能提供想要绑定的属性名,类似于v-model，但实际上只是语法糖，不是真正的双向绑定**

当我们用同一个对象同时设置多个prop的时候，也可以将这个.sync修饰符和v-bind配合使用：
```html
<text-document v-bind.sync="doc"></text-document>
```
这样会把doc对象中的每一个Property都作为一个独立的Prop穿进去，然后各自添加用于更新的v-on监听器

**用.sync绑定对象的情况下，只能绑定一个对象，之后的绑定都无效**

## $attrs和$listeners
$attrs:包含了父作用域中不作为Prop被识别的特性绑定。class和style除外。可以通过v-bind="$attrs"传入子组件。
```javascript
<child :title="title">
//child.vue
props:{
    //这里没有对title进行识别
},
methods:{
    getTitle(){
        //$attrs包含所有绑定但是未被props识别的属性。
        return this.$attrs.title;
    }
}
```
$listeners：包含了父作用域中的v-on事件监听器。它可以通过v-on="$listeners"传入内部组件。
```javascript
<child @event="event">
//child.vue
methods:{
    test(){
        this.$listeners.event();
    }
}

```

## provide & inject
provide和Inject主要为高阶插件/组件库提供用例，并不推荐直接用于应用程序代码中，并且这对选项需要一起使用。以允许一个祖先组件向其所有子孙后代注入一个依赖，不论组件层次有多深。
```html
//根组件引用子组件son
<div id="app">
    <son></son>
</div>
```
```javascript
let Son = Vue.extend({
    inject:{
        house:{
            //默认没有房子，父组件给的
            default:false
        },
        car:{
            //默认没有车子，父组件给的
            default:false
        },
        money:{
            //默认没有钱
            default:0
        }
    }
})

let app = new Vue({
    el:'##app',
    provide:{
        //注入
        house:true,
        car:true,
        money:10000
    },
    components:{
        Son
    }
});


```

## 插槽
默认插槽:
```html
//navigation-link.vue
<a :href="url">
    <slot></slot>
</a>
```
```html
<navigation-link url="/profile">
    Your Default
</navigation-link>
```
当组件渲染的时候，<slot>将会被替换为"Your Default"。插槽内可以包含任何模板代码，包括HTML，甚至是其他组件。

### 后备内容
为插槽设置一个具体的后备内容是很有用的，它只会在没有提供内容的时候被渲染。  
例如在一个submit-button组件内：
```html
<button type="Submit">
    <slot></slot>
</button>
```
我们可能希望这个<button>内的文本在大多数情况下都渲染文本"Submit",为了将"Submit"作为后备内容，我们可以将它放在<slot>标签内:
```html
<button type="Submit">
    <slot>Submit</slot>
</button>
```
当我们在一个组件内使用<submit-button>并且不提供任何插槽内容时:
```html
<submit-button></submit-button>
```
后备内容"Submit"将会被渲染:
```html
<button type="submit">
    Submit
</button>
```

### 插槽默认作用域
当你想在一个插槽内使用数据时，例如：
```html
<navigation-link url="/profile">
    Logged in as {{user.name}}
</navigation-link>
```
此时的user不是navigation-link组件内的作用域，是当前引用navigation-link组件的作用域，所以我们没办法访问到navigation-link下的url:
```html
<navigation-link url="/profile">
<!--这里的url是undefined-->
    {{url}}
</navigation-link>
```
**父级模板里的所有内容都是在父级作用域中编译的，子模板里的所有内容都是在子作用域中编译的。**

### 带作用域的插槽
为了让插槽内容可以访问子组件的数据，例如访问上文组件navigation-link中的link，我们可以这样写：
```html
<a :href="url">
    <!--绑定作用域-->
    <slot v-bind:url="url">
    </slot>
</a>
```
```html
<navigation url="/profile" >
    <template  v-slot:default="slotProps">
        {{slotProps.url}}
    </template>
</navigation>
```
如果出现多个插槽，始终为所有插槽使用完整的基于<template>语法：
```html
<current-user>
    <template v-slot:default="slotProps">
        {{slotProps.user.firstName}}
    </template>
    <template v-slot:other="otherSlotProps"> 
    </template>
</current-user>
```

### 解构插槽prop
我们还可以解构插槽的Prop
```html
//假设current-user的默认插槽绑定了user
<current-user v-slot="{ user }">
    {{user.firstName}}
</curent-user>
```
我们可以为Prop重命名
```html
<current-user v-slot="{ user:person }">
    {{user.person}}
</current-user>
```
甚至可以设置默认值
```html
<current-user v-slot="{ user= { firstName:'Guest'} }">
    {{user.firstName}}
</current-user>
```

### 具名插槽
有时候我们需要多个插槽，对于一个带有如下模板的<base-layout>组件：
```html
<div class="container">
    <header>
        <!-- 我们希望把页头放在这里-->
    </header>
    <main>
        <!-- 我们希望把主要内容放在这里 -->
    </main>
    <footer>
        <!-- 我们希望把页脚放在这里 -->
    </footer>
</div>
```
对于这种情况，<slot>元素有一个特殊的属性name，这个name可以用来定义额外的插槽:
```html
<div class="cotainer">
    <header>
        <slot name="header"></slot>
    </header>
    <main>
        <slot></slot>
    </main>
    </footer>
        <slot name="footer"></slot>
    </footer>
</div>
```
一个不带name的slot带有隐含的名字default。  
在向具名插槽提供内容的时候，我们可以在一个<template>元素上使用v-slot指令，以v-slot参数的形式提供名称:
```html
<base-layout>
    <template v-slot:header>
        <h1>title</h1>
    </template>
    <p>main content</p>
    <p>main content2</p>
    <template v-slot:footer>
        <p>footer</p>
    </template>
</base-layout>
<!--等同于-->
<base-layout>
    <template v-slot:header>
        <h1>header</h1>
    </template>
    <template v-slot:default>
        <p>main content</p>
        <p>main content2</p>
    </template>
    <template v-slot:footer>
        <p>footer</p>
    </template>
</base-layout>
```
**v-slot只能添加在template标签上**

### 具名插槽的缩写
与v-on和v-bind一样，可以缩写成@和:,v-slot也有缩写，v-slot:可以缩写为##，例如v-slot:header可以缩写为##header：
```html
<base-layout>
    <template ##header>
        <h1>title</h1>
    </template>
    <template ##default>
        <p>main content</p>
        <p>main content2</p>
    </template>
    <template ##footer>
        <p>footer</p>
    </template>
</base-layout>
```
如果希望使用缩写，必须始终以明确插槽名取而代之:
```html
<current-user ##default="{user}">
    {{user.firstName}}
</current-user>
```

# 组件的分类
组件是vue最核心的概念之一，但由于这个概念太过于宽泛，我们会在实际开发中看到各种各样的组件，对开发和维护的铜须带来了很大的困惑和混乱。我们可以把组件分成四类:

- view:页面组件
view指的是页面，也可以叫做page。它的定义为：和具体的某一条路由对应，在vue-router配置中指定。view是页面的容器，是其他组件的入口，可以和vuex store通信，再把数据分发给普通组件。

- global component:全局组件
全局组件，作为小工具而存在，例如toast、alert等。特点是具备全局性，直接嵌套在root下，不属于哪个view。全局组件也和vuex store通信，应该单独使用state中的一个module,不和其他业务实体用到的state混淆。  
其他组件想要修改它，可以直接派发响应的mutation。而要监听它的变化，则使用全局事件总线(event bus)
- simple component:简单组件
它的交互和数据都不多，基本上就是起到一个简单展示，拆分父组件的作用。这种组件和父组件之间通过最传统的方式进行通讯：父组件将props传入，它通过$emit触发事件到父组件，简单组件内部不写什么业务逻辑，一般不与vuex store通信。

- functional component:函数式组件
纯粹的简单展示组件，在简单组件不需要使用实例化，并且不需要生命周期的时候可以使用，它的渲染性能最好。

- complex component:复杂组件
复杂组件，特点是内部包含很多交互逻辑，常常需要访问接口。另外，需要展示的数据也往往比较多。  
对于复杂组件：
1. 如果所有的props都由父组件一一传入，如果要展示的数据很多，父组件template会变得臃肿
2. 如果所有的业务流程都需要子组件$emit,父组件的script代码会变得臃肿。
所以对于复杂组件，我们允许有一定的自主权，可以跳过父组件，自己和vuex通信。

![](https://tva1.sinaimg.cn/large/007S8ZIlly1gg7rsjqc43j30lo0f2758.jpg)

## 如何优雅的修改props
参考.sync修饰符，我们可以通过语法糖的形式，减少script中冗余的代码。


# 组件的生命周期
![](https://tva1.sinaimg.cn/large/007S8ZIlly1gg7ujmjio7j30u00xmh6g.jpg)

- beforeCreate
刚初始化vue实例，只有一些默认的生命周期函数。**data和methods中的数据都还未初始化，也就是无法通过this来访问。**

- created
**初始化注入injections以及数据可响应，代表着注入数据和data以及Methods都已经初始化好了，这是可以通过this来访问数据的最早生命周期，也是可以最早的可以进行异步请求数据的生命周期。**

- beforeMount
虚拟DOM已经编译好成一个模板字符串，等待挂载到页面中。

- mounted
**虚拟DOM的模板字符串已经挂载到页面中，也就是这一阶段为最早可以访问DOM的阶段。**,此时组件脱离了创建阶段，进入到了运行阶段，**mounted不会保证所有的子组件也都一起被挂载，如果希望等到整个视图都渲染完毕，可以在mounted内部使用vm.$nectTick**

- beforeUpdate
数据更新时调用，发生在虚拟 DOM 打补丁之前。这里适合在更新之前访问现有的 DOM，比如手动移除已添加的事件监听器。

- updated
数据改变了，页面也更新了，此时页面和data是同步的。**(宏任务和微任务也可以达到同样的效果)**,updated不会保证所有的子组件也都一起被重绘，如果希望等到整个视图都重绘完毕，可以在updated里面使用$nextTick

- beforeDestory
组件从运行阶段进入到了销毁阶段，此时data和methods、过滤器、指令还可以使用，还没到达真正的销毁阶段，**此时是做一些手动销毁的最佳时机，例如释放引用、取消监听等。**

- destoryed
组件被销毁

还有两个keep-alive组件才有的生命周期
- activated
keep-alive组件被激活的时候调用

- deactivated
keep-alive组件被停用时调用

# 父子组件的声明周期函数执行顺序
- 组件创建过程的顺序
父组件的beforeCreate->父组件的created->父组件的beforeMount->子组件的beforeCreate->子组件的created->子组件的beforeMount->子组件的mounted->父组件的mounted
￼![](https://tva1.sinaimg.cn/large/007S8ZIlly1gg81k3d8vtj308e08awej.jpg)
￼
**需要注意的一点是，官方说明父组件的mounted依然不能保证所有子组件已经挂载，所以要访问子组件的ref时，最早的周期是mounted，最稳妥的方式是在mounted内使用$nextTick**

- 组件的运行阶段顺序
子组件的更新：  
父组件beforeUpdate->子组件的beforeUpdate->子组件的updated->父组件的updated。  
父组件更新，不涉及到子组件更新时：  
父组件beforeUpdate->父组件的updated

**与mounted一致，updated也不能保证所有的子组件已经重绘完毕，如果希望在所有组件都重绘完毕后执行，可以在updated内使用$nextTick**

- 组件的销毁阶段顺序
父组件的beforeDestroy->子组件的beforeDestroy->子组件的destroyed->父组件的destroyed


# 手动监听生命周期
在一些场景下，我们可能为了减少反复横跳代码，会使用hook，使代码更加聚合。

例如我们在Mounted阶段可能会监听窗口变化来调整echarts图表大小。而后在beforeDestroy阶段进行监听事件的销毁。
```javascript
Vue.extend({
    mounted(){
        this.chart = echarts.init(this.$el);
        window.addEventListener('resize',this.resizeChart);
    },
    updated(){

    },
    created(){

    },
    beforeDestroy(){
        window.removeEventListener('resize',this.resizeChart);
    }
})
```
其中mounted和beforeDestroy之间可能隔了几十上百行代码，可读性很差，维护者可能不知道为什么要remove这个监听器，我们可以通过hook生命周期函数来使代码更加聚合：
```javascript
Vue.extend({
    mounted(){
        this.chart = echarts.init(this.$el);
        window.addEventListener('resize',this.resizeChart);
        //通过hook监听组件销毁钩子函数，并取消监听事件
        this.$once('hook:beforeDestroy',()=>{
            window.removeEventListener('resize',this.resizeChart);
        })
    }
})

```

# 监听子组件的生命周期
假设我们使用了一个第三方组件，需要监听第三方组件数据的变化，但是组件又没有提供change事件。我们可以通过监听组件的Updated钩子函数。
```html
<template>
    <!--组件的所有生命周期钩子都可以通过@hook:钩子函数名来监听-->
    <custom-select @hook:updated="handleSelectUpdated">
</template>
```

# keep-alive组件
keep-alive是vue内置的一个组件，可以使被包含的组件保留状态。避免重新加载。
- 一般结合路由和动态组件一起使用，用于缓存组件
- 提供include和exclude属性，include表示只有名称匹配的组件会被缓存，exclude表示匹配的组件不会被缓存，exclude的优先级比include高。
- 拥有两个生命周期钩子函数activated和deactivated。当组件被激活时触发activated钩子函数，当组件被停用时，调用deactivated钩子函数。


# 全局组件
Vue.extend是一个全局的API，用于创造一个类，这个类是Vue组件的构造器。参数是一个包含组件选项的对象。选项中的data必须是函数，这是为了防止组件被复用时，使用同一个引用。

我的理解是，创建一个Vue实例，但是带有特定的配置，用extend去继承
```javascript
var Profile = Vue.extend({
    template:'<p>{{firstName}} {{lastName}} {{alias}}</p>',
    data(){
        return {
            firstName:'huang',
            lastName:'johe',
            alias:'johe'
        }
    }
});

//将Profile组件挂载在元素上。
new Profile().$mount('#app');
```
当我们需要开发一些全局组件的时候，例如Loading、Notify、Message等组件，我们就可以使用Vue.extend:

loading组件
```html
<template>
  <transition name="custom-loading-fade">
    <!--loading蒙版-->
    <div v-show="visible" class="custom-loading-mask">
      <!--loading中间的图标-->
      <div class="custom-loading-spinner">
        <i class="custom-spinner-icon"></i>
        <!--loading上面显示的文字-->
        <p class="custom-loading-text">{{ text }}</p>
      </div>
    </div>
  </transition>
</template>

<script>
export default{
    data(){
        return {
            text:'',
            visible:false
        }
    }
}

</script>

```
用Vue.extend来生成组件的构造函数
```javascript
import Vue from 'vue';
//其实导出的是组件的配置，是一个含有配置项的对象
import LoadingComponent from './loading.vue';

// 通过Vue.extend将组件配置对象包装成一个组件构造器
const LoadingConstructor = Vue.extend(LoadingComponent);

// 用来保存Loading组件实例
let loading = undefined;

LoadingConstructor.prototype.close = function(){
    // 如果loading有引用，则去掉引用
    if(loading){
        loading = undefined;
    }
    // 将组件隐藏,这里的this指向Loading实例
    this.visible = false;

    setTimeout(()=>{
        //移除挂载的DOM元素
        if(this.$el && this.$el.parentNode){
            this.$el.parentNode.removeChild(this.$el);
        }
        //调用组件的$destroy方法进行组件销毁
        this.$destroy();
    },300)
};

// Loading函数，如果没有Loading组件则创建，有则返回，单例模式
const Loading = ( options = {} ) =>{
    //如果组件已经渲染，则返回
    if(loading){
        return loading;
    }
    //要挂载的元素，由于Loading挂载在全局，所以获取body
    const parent = document.body;
    // 组件属性
    const opts = {
        text:'',
        ...options
    }
    //生成一个Loading组件实例，相当于new Vue()只不过参数已经预设。
    const LoadingInstance = new LoadingConstructor({
        el: document.createElement('div'),
        data:opts
    });
    // 将loading元素挂载在全局
    parent.appendChild(instance.$el);
    // 显示加载动画
    Vue.nextTick(()=>{
        instance.visible = true
    })
    //将组件实例赋值给loading变量，保证单例
    loading = instance;
    return instance;
}
export default Loading
```
在页面内使用loading
```javascript
import Loading from './loading/index.js';
export default{
    created(){
        const loading = Loading({text:'正在加载...'});
        //三秒后关闭
        setTimeout(()=>{
            loading.close()
        },3000);
    }
}
```
将loading方法挂载到Vue.prototype上面
```javascript
Vue.prototype.$loading = Loading;
export default Loading;

//在组件内使用
const loading = this.$loading({text:'正在加载...'});
setTimeout(()=>{
    loading.close();
})
```

# 函数式组件
**函数式组件就是函数是组件，在React中，组件可以是类也可以是函数，当为函数式组件时，没有内部状态，也没有声明周期钩子函数。在vue中也类似，当为函数式组件时，没有内部状态，也没有声明周期钩子函数，也没有this。**

**在日常写代码的过程中，经常会开发一些纯展示型的业务组件，比如一些详情页面，列表界面等。它们有一个共同的特点是只需要将外部传入的数据进行展现，不需要有内部状态，也不需要有生命周期钩子函数里面做处理，类似于上文所说的简单组件(简单组件可能需要生命周期)。这个时候我们就可以考虑使用函数式组件**

```javascript
export default{
    // 通过配置functional属性指定组件为函数式组件
    functional:true,
    props:{
        avatar:{
            type:String
        }
    },
    /**
     * 渲染函数，类似于react类组件中的render
     * @param {*} context 函数式组件没有this,props,slots等都在context上
    */
   render(h,context){
       const { props } = context;
       if(props.avatar){
           return <img src={props.avatar}></img>
       }
       return <img src="default-avatar.png"></img>
   }
}
```
在上例中，我们定义了一个头像组件，如果外部传入头像，则显示传入的头像，否则显示默认头像。

为什么要使用函数式组件
1. 函数式组件不需要实例化、无状态、没有声明周期，所以渲染性能要好于普通组件
2. 函数式组件结构比较简单，代码结构清晰

函数式组件与普通组件的区别
1. 函数式组件需要在声明组件时指定functional属性
2. 函数式组件不需要实例化，所以没有this，this通过render函数的第二个参数来替代。
3. 函数式组件没有声明周期钩子函数，不能使用计算属性、侦听属性等。
4. 函数式组件不能通过$emit对外暴露时间，调用事件能通过context.listeners.click的方式调用外部传入的click事件
5. 因为函数式组件是没有实例化的，所以在外部通过ref去引用组件时，实际引用的是HTMLELement
6. 函数式组件的props可以不用显示声明，所以没有在props里面声明的属性都会自动隐式解析为Prop,而普通组件所有未声明的属性都被解析到$attrs中，这是和普通组件不同的店。

如果不想使用render函数(jsx的方式)，可以通过模板语法来声明
```html
<!--在template上添加functional属性-->
<template functional>
    <!--props可以不用声明，默认外部传入的都为Prop-->
    <img :src="props.avatar ? props.avatar:'default-avatar.png'"/>
</template>

```

# 自定义指令
除了核心功能默认内置的指令(v-model和v-show)，Vue也允许注册自定义指令。有的情况下，我们可能需要对普通DOM元素进行底层操作，这时候就会用到自定义指令。

**个人理解,指令类似于监听属性，当表达式更新时，对DOM执行一定的操作，例如v-if='expression',是在expression改变时，修改当前DOM的display为none，与watch不同的点是，它的触发条件更多样，不仅仅是表达式可以触发（实际上也是生命周期被触发,表达式更新导致的update生命周期），指令的生命周期也可以触发**

例如，我们需要页面加载时，就聚焦元素:
```javascript
// 全局自定义指令'v-focus'
Vue.directive('focus',{
    // 当被绑定的元素插入到DOM中时:
    inserted: function(el){
        //聚焦元素
        el.focus();
    }
})
```
如果想注册局部指令，组件中也接受一个directives的选项：
```javascript
directives:{
    focus:{
        //指令的定义
        inserted: function(el){
            el.focus();
        }
    }
}
```
指令使用:
```html
<input v-focus>
```
## 指令的钩子函数
一个指令定义对象可以提供如下几个钩子函数(均为可选):
- bind: 只调用一次，指令第一次绑定到元素时调用。在这里可以进行一次性的初始化设置。
- inserted: 被绑定元素插入父节点时调用(仅保证父节点存在，但不一定已经被插入文档中)
- update: 所在组件的VNode更新时调用，但是可能发生在其子VNode更新之前。指令的值可能发生了改变，也可能没有。但是我们可以通过比较更新前后的值来忽略不必要的模板更新。
- componentUpdated: 指令所在组件的VNode及其子VNode全部更新后调用。
- unbind: 只调用一次，指令与元素解绑时调用。

## 钩子函数的参数
指令钩子函数会被传入以下参数:
- el:指令所绑定的元素，可以用来直接操作DOM
- binding:一个对象，包含以下property
    - name:指令名，不包含v-前缀
    - value:指令的绑定值，例如v-my-directive="1+1"，值为2，即为表达式最新的值
    - oldValue:指令绑定的前一个值，仅在update和componentUpdated钩子中可用。无论值是否改变都可用。
    - expression:字符串形式的指令表达式。例如v-my-directive="1+1",表达式为"1 + 1"
    - arg:传给指令的桉树，可选。例如v-my-directive:foo中，参数为"foo"
    - modifiers:一个包含修饰符的对象。例如:v-my-directive.foo.bar,修饰符对象为{foo:treu,bar:true}
- vnode: Vue编译生成的虚拟节点。
- oldVnode:上一个虚拟节点，仅在update和componentUpdated钩子中使用

除了el之外，其他参数都应该是只读的，切勿进行修改。如果需要在钩子之间共享数据，建议通过元素的dataset属性来进行。

通过一个例子来看参数的值：
```html
<div id="hook-arguments-example" v-demo:foo.a.b="message"></div>
```
```javascript
Vue.directive('demo',{
    bind:function(el,binding,vnode){
        var s = JSON.stringify;
        el.innerHTML = `
            name:${s(binding.name)}
            value:${s(binding.value)}
            expression:${s(binding.expression)}
            argument:${s(binding.arg)}
            modifiers:${s(binding.modifiers)}
            vnode kyes:${Object.keys(vnode).join(',')}
        `
    }
})
new Vue({
    el:'#hook-arguments-example',
    data:{
        message:'hello!'
    }
})
```
渲染出来的效果
![](https://tva1.sinaimg.cn/large/007S8ZIlly1gg99bhcvfuj30z60cqmzd.jpg)

## 指令的动态参数
指令的参数可以是动态的。例如在v-mydirective:[argument]="value"中，argument参数可以根据数据进行更新。

例如我们想要创建一个自定义指令，用来通过固定布局将元素固定在页面上。我们可以像这样创建一个通过指令值来更新竖直位置像素值的自定义指令:
```html
<div id="baseexample">
    <p v-pin="200">Stick me 200px from the top of the page</p>
</div>
```
```javascript
Vue.directive('pin',{
    bind:function(el,binding,vnode){
        el.style.position ='fixed';
        el.style.top = binding.value+'px';
    }
})

new Vue({
    el:"#baseexample"
})
```
这首元素固定在距离顶部200像素的位置，但是如果我们现在需要把元素固定在左侧而不是顶部的话怎么办呢？这时候使用动态参数就可以方便的根据数据来进行更新。
```html
<div id="dynamicexample">
    <p v-pin:[direction]="200">I am pinned onto the page at 200px to the left.</p>
</div>
```
```javascript
Vue.directive('pin',{
    bind:function(el,binding,vnode){
        el.style.position='fixed';
        var s = (binding.arg ==='left'? 'left':'top');
        el.style[s] = binding.value + 'px';
    }
})

new Vue({
    el:'#dynamicexample',
    data:function(){
        return {
            direction:'left'
        }
    }
})


```

## 自定义指令实战
我们在使用ElementUI的时候，会用到v-loading来对挂载的元素进行loading控制，这一点是基于自定义指令实现的。

在上文中，我们开发了一个loading组件，但是这个组件是全局使用的，我们想要实现以下两个需求，必须要使用自定义指令：
- 将loading挂载到某一个元素上面，现在只能是全屏使用
- 可以使用指令在指定的元素上面挂载loading

开发v-loading指令：
```javascript
import Vue from 'vue';
import LoadingComponent from './loading';

const LoadingConstructor = Vue.extend(LoadingComponent);

Vue.directive('loading',{
    bind(el,binding){
        const instance = new LoadingConstrcutor({
            el:document.createElement('div'),
            data:{}
        })
        el.appendChild(instance.$el);
        el.instance = instance;
        Vue.nextTick(()=>{
            el.instance.visible = binding.value;
        });
    },
    update(el,binding){
        //update可能不是表达式的值更新了，所以要判断是否为表达式值更新
        if(binding.oldVlaue !== binding.value){
            el.instance.visible = binding.value
        }
    },
    unbind(el){
        const mask = el.instance.$el;
        if(mask.parentNode){
            mask.parentNode.removeChild(mask);
        }
        el.instance.$destroy();
        el.instance = undefined;
    }
})

```
在元素上使用指令
```html
<template>
    <div v-loading="visible"></div>
</template>

```
自定义指令还有哪些实战可用？
- 为组件添加loading效果、遮罩层
- 按钮级别权限控制v-permission
- 代码埋点，根据操作类型定义指令
- input输入框自动获取焦点


# 自定义生命周期钩子函数
要自定义声明周期钩子函数，要先了解VUE的合并策略。当我们使用Vue的mixins时，会发现，如果混入的methods里面的方法与组件的方法同名，则会被组件的方法覆盖，如果声明周期钩子函数重名，则混入的与组件自身的钩子函数都会被执行，且执行顺序是先混入后自身。

这是由于在Vue中，不同的选项有不同的合并策略，比如data、props、methods在混入时，同名属性覆盖，其他的直接合并（组件的优先级更高），而生命周期钩子函数则是将同名的钩子函数放到一个数组中，在调用时依次调用。

**在Vue中提供了一个api,Vue.config.optionMergeStrategies,可以通过这个api去自定义选项的合并策略**

```javascript
console.log(Vue.config.optionMergeStrategies);
```
![](https://tva1.sinaimg.cn/large/007S8ZIlly1gg9bmelrllj30u00ww49t.jpg)

通过上图可以看到Vue所有选项的合并策略函数，我们也可以通过覆盖上面的方法，来自定义合并策略函数，不过一般用不到。

## 自定义生命周期函数
自定义生命周期钩子函数需要有三个步骤：
- 自定义选项合并策略
- 自定义生命周期钩子函数的执行时机(关键)
- 自定义钩子函数的执行策略

假设有以下背景：
最近客户给领导反馈，我们的系统用一段时间，浏览器就变得有点卡，不知道为什么。问题出来了，本来想甩锅到后端，但是浏览器问题，没法甩锅啊，那就排查吧。
后来发现页面有许多定时器，ajax轮询还有动画，打开一个浏览器页签没发现问题，打开多了，浏览器就变得卡了,这时候我就想如果能在用户切换页签时候将这些都停掉，不久解决了。百度里面上下检索，找到了一个事件visibilitychange,可以用来判断浏览器页签是否显示。

```javascript
export default{
    created(){
        window.addEventListener('visibilitychange',this.$_handleVisiblityChange);
        this.$once('hook:beforeDestroy',()=>{
            window.removeEventListener('visibilitychange',this.$_handleVisiblityChange);
        })
    },
    methods:{
        $_handleVisiblityChange(){
            if(document.visiblityState === 'hidden'){
                //停掉一堆定时器
            }
            if(document.visibilityState === 'visible'){
                //开启一堆定时器
            }
        }
    }
}
```
通过上面的代码，可以看到在每一个需要监听处理的文件都要写一堆事件监听，判断页面是否显示的代码，一处两处还可以，文件多了就头疼了，这时候小编突发奇想，定义一个页面显示隐藏的生命周期钩子,把这些判断都封装起来

自定义生命周期钩子函数：pageHidden和pageVisible

```javascript
import Vue from 'vue';

// 添加生命周期钩子函数，决定选项的合并策略
export function init(){
    const optionMergeStrategies = Vue.config.optionMergeStrategies;

    //定义两个生命周期函数
    //并且将其合并策略指定成语created一致
    optionMergeStrategies.pageVisible = optionMergeStrategires.beforeCreate;
    optionMergeStrategies.pageHidden = optionMergeStrategies.created
}

// 决定生命周期钩子的执行策略
const notifyVisibilityChange = (lifeCycleName,vm)=>{
    // 生命周期函数会存在$options中，通过$options[lifeCycleName]获取生命周期
  const lifeCycles = vm.$options[lifeCycleName]
  // 因为使用了created的合并策略，所以是一个数组
  if (lifeCycles && lifeCycles.length) {
    // 遍历 lifeCycleName对应的生命周期函数列表，依次执行
    lifeCycles.forEach(lifecycle => {
      lifecycle.call(vm)
    })
  }
  // 遍历所有的子组件，然后依次递归执行
  if (vm.$children && vm.$children.length) {
    vm.$children.forEach(child => {
      notifyVisibilityChange(lifeCycleName, child)
    })
  }
}

// 决定新增生命周期钩子函数的执行时机
export function bind(rootVm){
    window.addEventListener('visibilitychange',()=>{
        //判断用哪个钩子函数
        let lifeCycleName = undefined;
        if(document.visibilityState === 'hidden'){
            lifeCycleName = 'pageHidden'
        }else if(document.visibilityState === 'visible'){
            lifeCycleName = 'pageVisible'
        }
        if(lifeCycleName){
            //通知所有组件生命周期发生变化了
            notifyVisibilityChange(lifeCycleName,rootVm);
        }
    })
}

```

应用：
```javascript
//main.js
import { init ,bind } from './utils/custom-life-cycle';

init();

const vm = new Vue({
    router,
    render:h => h(App)
}).$mount('#app');

bind(vm);
```
在组件内使用生命周期钩子函数:
```javascript
export default{
    pageVisible(){
        console.log('页面显示')
    },
    pageHidden(){
        console.log('页面隐藏')
    }
}

```
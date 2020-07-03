# 项目结构
Vuex不限制代码结构。但是规定了一些需要遵守的规则：
1. 应用层级的状态应该几种到单个store对象中。
2. 提交Mutation是修改状态的唯一方法，并且这个过程是同步的。
3. 异步逻辑都应该封装到action里面
```
├── index.html
├── main.js
├── api
│   └── ... # 抽取出API请求
├── components
│   ├── App.vue
│   └── ...
└── store
    ├── index.js          # 我们组装模块并导出 store 的地方
    ├── actions.js        # 根级别的 action
    ├── mutations.js      # 根级别的 mutation
    └── modules
        ├── cart.js       # 购物车模块
        └── products.js   # 产品
```

# 关于Mutation
## Mutation需遵循Vue的响应规则
既然Vuex的store中的状态是响应式的，那么当我们变更状态时，相应的组件也会自动更新。所以Mutation去修改state的时候，要遵循响应式规则。
1. 最好在store中初始化好所有需要的响应式的属性
2. 如果需要在对象上添加新的属性时，应该:
- 使用Vue.set
- 使用展开运算符替换旧对象
```javascript
//由于旧的state.obj属性上已经是可响应数据，这样的开销是最小的
state.obj = { ...state.obj, newProp:123}
```

## 使用常量替代Mutation事件类型
使用常量替代mutation事件类型在各种Flux实现中都是很常见的模式。把这些常量放在一个单独的文件中可以让你的代码合作者对整个app包含的mutation一目了然:
```javascript
// mutation-types.js
export const SOME_MUTATION = "SOME_MUTATION"
```
```javascript
//store.js
import Vuex from 'vuex';
import { SOME_MUTATION } from './mutation-types';

const store = new Vuex.Store({
    state:{},
    mutations:{
        [SOME_MUTATION](state){
        }
    }
})
 
```

## Mutation必须是同步函数
mutation必须是同步函数，这是为了让我们在用devtools调试的过程中，任何状态的改变都可以被追踪。
```javascript
mutations:{
    someMutation(state){
        api.callAsyncMethod().then(()=>{
            state.count++;
        })
    }
}
```
假设我们现在正在观察mutation日志，每一条mutation被记录，devtools都需要捕捉到前一状态和后以状态的快照。
然而在上面的例子中，Mutation的异步函数回调让这不可能完成。**因为当mutation被触发的时候，回调函数还没有被调用,devtools不知道什么时候回调函数实际上被调用。所以在回调函数中进行的状态改变都不可以被追踪**
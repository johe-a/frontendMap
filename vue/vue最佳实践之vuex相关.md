# 小型状态管理
在前端项目中，有许多数据需要在各个组件之间进行传递共享，这时候就需要有一个状态管理工具，一般情况下，我们都会使用Vuex，但对于小型项目来说，使用vuex可能是繁琐冗余的。我们可以使用Vue2.6提供的新API:Vue.observable手动打造一个Vuex

我们在使用vuex时，要保证两点：
- 要保证数据的单向流
- 要保证数据是可响应的(即数据的更新操作可以被订阅，用在计算属性或者侦听属性中)

```javascript
import Vue from 'vue';

//创建一个可响应的对象，即对象如果被触发getter可以收集依赖，更新时可以通知依赖更新
export const store = Vue.observable({
    userInfo:{},
    roleIds:[]
})

//创建一个mutations,修改属性，vuex的mutations中不能使用异步，如果要使用异步，则创建action
export const mutations = {
    setUserInfo(userInfo){
        store.userInfo = userInfo||{}
    },
    setRoleIds(roleIds){
        store.roleIds = roleIds||[]
    }
}
```
在组件内引用
```html
<template>
    <div>
        {{userInfo.name}}
    </div>
</template>

<script>
import { store,mutations } from '../store'
export default{
    computed:{
        userInfo(){
            return store.userInfo
        }
    },
    methods:{
        setUserInfo(){
            mutations.setUserInfo({
                name:'johe'
            })
        }
    }

}
</script>
```
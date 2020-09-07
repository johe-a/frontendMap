# 前言
Redux是一个状态管理工具，是为了解决React没有全局状态、组件之间交互复杂而产生的。

有以下场景时，可以考虑使用Redux
- 某个组件的状态需要共享
- 某个状态需要在任何地方都可以拿到
- 一个组件需要改变全局状态
- 一个组件需要改变另一个组件的状态

发生上面情况时，如果不使用 Redux 或者其他状态管理工具，不按照一定规律处理状态的读写，代码很快就会变成一团乱麻。你需要一种机制，可以在同一个地方查询状态、改变状态、传播状态的变化。


# 设计思想
1. Web应用是一个状态机，视图与状态一一对应
2. 所有的状态，保存在一个对象里面


# 基本概念
## Store
Store就是保存数据的地方，整个应用智能有一个Store。

Redux提供createStore这个函数，用来生成Store.
```javascript
import { createStore } from 'redux';
const store = createStore(fn);

```

## State
Store对象包含所有数据。如果想得到某个时点的数据，就要对Store生成快照。这种时点的数据集合，就叫做State。

当前时刻的State，通过store.getState()拿到
```javascript
import { createStore } from 'redux';
const store = createStore(fn);

const state = store.getState();
```
Redux规定，一个State对应一个View，只要State相同，View就相同。

## Action 
Action就是View发出的通知，表示State应该要发生变化。

Action是一个对象，其中type属性是必须的，表示Action的名称。其他属性可以自由设置。

有一个规范可以参考：
```javascript
const action = {
  type: 'ADD_TODO',
  payload: 'Learn Redux'
}

```

## Action Creator
View要发送多少种消息，就会有多少种Action,如果都手写会很麻烦。

为了解决这个问题，我们可以定义一个函数来生成Action，这个函数就叫Action Creator。（因为一个Action的type一般是不变的，我们只是要传递信息进去）
```javascript
const ADD_TODO = "添加TODO";

function addTodo(text) {
  return {
    type: ADD_TODO,
    text
  }
}

const action = addTodo('Learn Redux')

```

## 派发Action
store.dispatch是View发出Action的唯一方法。
```javascript
import { createStore } from 'redux';
const store = createStore(fn);

store.dispatch({
  type: "ADD_TODO",
  payload: "Learn Redux"
})
//or
store.dispatch(addTodo("Learn Redux"));

```

## Reducer
Store收到Action以后，必须给出一个新的State,这样View才会发生变化。这种State的计算过程就叫做Reducer（有点类似于数组的reduce函数的第一个参数）

Reducer是一个函数，它接受Action和当前State作为参数，返回一个新的State
```javascript
const reducer = function (state, action) {
  // ...
  return new_state;
}

```
整个应用的初始状态，可以作为State的默认值。
```javascript
const defaultState = 0;
const reducer = (state = defaultState, action) => {
  switch (action.type) {
    case 'ADD':
      return state + action.payload;
    default:
      return state;
  }
}

const state = reducer(1, {
  type: 'ADD',
  payload: 2
})

```
上面代码中，reducer函数收到名为ADD的 Action 以后，就返回一个新的 State，作为加法的计算结果。其他运算的逻辑（比如减法），也可以根据 Action 的不同来实现。

实际应用中，Reducer函数不用像上面这样手动调用，store.dispatch方法会触发Reducer的自动执行。为此，Store需要知道Reducer函数，做法就是在生成Store的时候，将Reducer传入createStore

```javascript
import { createStore } from 'redux';
const store = createStore(reducer);

```

**为什么这个函数叫做Reducer而呢，因为它可以作为数组的reduce方法的参数。**
```javascript
const actions = [
  { type: 'ADD', payload: 0 },
  { type: 'ADD', payload: 1 },
  { type: 'ADD', payload: 2 } 
]
const total = actions.reduce(reducer, 0);//3

```

简单理解，Reducer的作用首先是初始化State(也可以在createStore的时候，由第二个参数来决定State初始值)，决定每次派发Action时对State产生的影响。就像一台机器，我们需要派发指令(Action)给机器(Store),机器根据指令对应逻辑(Reducer)来产生新的状态（State）。

## Reducer是纯函数
Reducer函数最重要的特征是，它是一个纯函数。**也就是说，只要是同样的输入，必定得到同样的输出**

纯函数是函数式变成的概念，必须遵守以下约束：
- 不得改写参数
- 不能调用系统I/O的API
- 不能调用Date.now()或者Math.random()等不纯的方法，因为每次回得到不一样的结果

由于Reducer是纯函数，就可以保证同样的State，必定得到同样的View。但也正因为这一点，Reducer函数里面不能改变State，必须返回一个全新的对象。

想要得到新的State， 唯一的办法就是生成一个新的对象。
```javascript
// State 是一个对象
function reducer(state, action) {
  return Object.assign({}, state, { thingToChange });
  // 或者
  return { ...state, ...newState };
}

// State 是一个数组
function reducer(state, action) {
  return [...state, newItem];
}


```

## 为状态设置监听
State的改变始终是要服务于View的，也就是用到相关State的View，在State发生改变时，如果引用了State中的数据，应该更新该View。

Store允许使用store.subscribe方法设置监听函数，一旦State发生，就自动执行这个函数。
```javascript
import { createStore } from 'redux';
const store = createStore(reducer);

store.subscribe(listener);

```
显然，只要把View的更新函数（组件的render方法或者setState方法）放入Listener,就会实现View的自动渲染.

store.susbscribe方法返回一个函数，调用这个函数就可以解除监听。
```javascript
let unsubscribe = store.subscribe(() => {
  console.log(store.getState());
})

unsubscribe();
```

# 了解Store实现
上文中Store提供了三个方法
- store.getState()
- store.dispatch()
- store.subscribe()

而Store又是由createStore(reducer,defualtState)生成的,第二个参数表示State最初状态。

createStore方法的简单实现：
```javascript
const createStore = (reducer) => {
  let state;
  let listeners = [];
  // 返回当前状态
  const getState = () => state;
  // 派发Action,State更新通知订阅者
  const dispatch = (action) => {
    state = reducer(state, action);
    listenenrs.forEach(listener => listener());
  }
  // 订阅，返回一个删除订阅的方法
  const subscribe = (listener) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener );
    }
  }
  return { getState, dispatch, subscribe };
}

```

# Reducer的拆分
Reducer函数负责生成State，由于整个应用只有一个State对象，包含所有数据，对于大型应用来说，整个State必然十分庞大，导致Reducer函数也十分庞大。

```javascript
const chatReducer = (state = defaultState, action = {}) => {
  const { type, payload } = action;
  switch (type) {
    case ADD_CHART:
      return Object.assign({}, state, {
        chatLog: state.chatLog.concat(payload)
      });
      case CHANGE_STATUS:
      return Object.assign({}, state, {
        statusMessage: payload
      });
    case CHANGE_USERNAME:
      return Object.assign({}, state, {
        userName: payload
      });
    default: return state;
  }
}

```
上面代码中， 三种Action分别改变State的三个属性。ADD_CHART改变chatLog属性、CHANGE_STATUS改变statusMessage属性等等

这三个属性之间没有联系，这提示我们可以把RedUC而函数拆分，不同的函数负责处理不同的属性，最终把它们合并成一个大的Reducer即可。
```javascript
const chartReducer = (state = defualtState, action = {}) => {
  return (
    chatLog: chatLog(state.chatLog, action),
    statusMessage: statusMessage(state.statusMessage, action),
    userName: userName(state.userName, action)
  )
}

```
这种拆分与React应用的结构相吻合：一个React根组件由很多子组件构成，也就是说，子组件与子Reducer完全可以对应。


# Reducer的合并
Redux提供了一个combineReudcers方法，用于Reducer的拆分。只需要定义各个子Reducer函数，然后用这个方法，将它们合并成一个大的Reducer。
```javascript
import { combineReducers } from 'redux';

const chatReducer = combineReducers({
  chatLog,
  statusMessage,
  userName
})

```
上面的代码通过combineReducers方法将三个子Reducer合并成一个大的函数。

这种写法有一个前提，就是State的属性名必须与子Reducer同名，如果不同名，则采用下面的写法：
```javascript
const reducer = combineReducers({
  a: doSomethingWithA,
  b: processB,
  c: c
})

// 等同于
function reducer(state = {}, action) {
  return {
    a: doSomethingWithA(state.a, action),
    b: processB(state.b, action),
    c: c(state.c, action)
  }
}

```

combineReducer的简单实现：
```javascript
const combineReducers = reducers => {
  return (state = {}, action) => {
    return Object.keys(reducers).reduce(
      (nextState, key) => {
        nextState[key] = reducers[key](state[key], action);
        return nextState;
      },
      {} 
    );
  };
};

```

总之，combineReducers()做的就是产生一个整体的 Reducer 函数。该函数根据 State 的 key 去执行相应的子 Reducer，并将返回结果合并成一个大的 State 对象。

下面是combineReducer的简单实现。
```javascript
const combineReducers = reducers => {
  return (state = {}, action) => {
    return Object.keys(reducers).reduce(
      (nextState, key) => {
        nextState[key] = reducers[key](state[key], action);
        return nextState;
      },
      {} 
    );
  };
};
```
可以把子Reducer放在一个文件里面，然后统一引入。
```javsacript
import { combineReducers } from 'redux'
import * as reducers from './reducers'

const reducer = combineReducers(reducers)

```

# 工作流
!(Redux工作流)[https://tva1.sinaimg.cn/large/007S8ZIlgy1gic9u72urjj30zc0r0ajf.jpg]

Store就像一台状态机器，它对外提供接口，有分发Action的接口，有订阅的接口，有获取当前状态的接口等等。

状态机器需要接收Reducer,Reducer是用来告诉状态机如何根据Action来产生新的状态的。

1. 首先由用户（组件）发出Action指令
2. Store（状态机）接收到指令，调用Reducer得出新的状态
3. 用户通过Store.getState()获取当前状态，或者是在接收指令之前，通过Store.subscribe来订阅


# React-Redux
React-Redux将所有组件分为两大类：UI组件(presentational component)(纯展示组件？)和容器组件(Container compoennt)
## UI组件
特征：
- 只负责UI的呈现，不带有任何业务逻辑
- 没有状态
- 所有数据由Props提供
- 不使用任何Redux的API

```javascript
const Title = 
  value => <h1>{value}</h1>;
```
**因为不含有状态，UI组件又被称为“纯组件”，和纯函数一样，纯粹由参数决定它的值**

## 容器组件
容器组件特征：
- 负责管理数据和业务逻辑，不负责UI呈现
- 带有内部状态
- 使用Redux的API

**如果一个组件又有UI又有业务逻辑，那怎么办？将它拆分成下面的结构：外面是一个容器组件，里面包含了一个UI组件。前者负责与外部的通信，将数据传给后者，由后者渲染出视图。**

## connect()生成容器组件
React-Redux 规定，所有的 UI 组件都由用户提供，容器组件则是由 React-Redux 自动生成。也就是说，用户负责视觉层，状态管理则是全部交给它。

React-Redux 提供connect方法，用于从 UI 组件生成容器组件。connect的意思，就是将这两种组件连起来。
```javascript
import { connect } from 'react-redux';
const VisibleTodoList = connect()(TodoList);

```
上面代码中，TodoList是UI组件，VisibleToDoList就是由React-Redux通过connect方法自动生成的容器组件。

但是，因为没有定义业务逻辑，上面这个容器组件毫无意义，只是 UI 组件的一个单纯的包装层。为了定义业务逻辑，需要给出下面两方面的信息。
- 输入：外部的state对象如何转换为UI组件的参数
- 输出：用户发出的动作如何变为Action对象，从UI组件传出去

因此，connect方法的完整API如下：
```javascript
import { connect } from 'react-redux';

const VisibleTodoList = connect(
  mapStateToProps,
  mapDispatchToProps
)

```
上面代码中，connect方法接受两个参数：mapStateToProps和mapDispatchToProps。它们定义了 UI 组件的业务逻辑。前者负责输入逻辑，即将state映射到 UI 组件的参数（props），后者负责输出逻辑，即将用户对 UI 组件的操作映射成 Action。

## mapStateToProps()
mapStateToProps()决定了State对象到UI组件Props对象的映射关系。

作为函数，mapStateToProps执行后应该返回一个对象，里面的每一个键值对就是一个映射。请看下面的例子。
```javascript
const mapStateToProps = (state) => {
  return {
    todos: state.todos
  }
}

```
**mapStateToProps会订阅Store，每当State更新的时候，就会自动执行，重新计算UI组件的Props参数，从而触发UI组件的重新渲染。**

mapStateToProps的第一个参数总是state对象，还可以使用第二个参数，代表容器组件的props对象。

```javascript
// 容器组件的代码
//    <FilterLink filter="SHOW_ALL">
//      All
//    </FilterLink>

const mapStateToProps = (state, ownProps) => {
  return {
    active: ownProps.filter === state.visibilityFilter
  }
}

```

## mapDispatchToProps()
mapDispatchToProps是connect函数的第二个参数，用来建立 UI 组件的参数到store.dispatch方法的映射。也就是说，它定义了哪些用户的操作应该当作 Action，传给 Store。它可以是一个函数，也可以是一个对象。

函数时，需要自己手动派发action，可以在函数内添加除了派发Action的自定义行为。如果是对象，就仅仅只能派发Action。

如果mapDispatchToProps是一个函数，会得到dispatch和ownProps（容器组件的props对象）两个参数。
```javascript
const mapDispatchToProps = (
  dispatch,
  ownProps
) => {
  return {
    onClick: () => {
      dispatch({
        type: 'SET_VISIBILITY_FILTER',
        filter: ownProps.filter
      });
    }
  };
}

```

如果mapDispatchToProps是一个对象，它的每个键名也是对应 UI 组件的同名参数，键值应该是一个函数，会被当作 Action creator ，返回的 Action 会由 Redux 自动发出。举例来说，上面的mapDispatchToProps写成对象就是下面这样。

```javascript
const mapDispatchToProps = {
  onClick: (filter) => {
    type: 'SET_VISIBILITY_FILTER',
    filter: filter
  };
}


```

## Provider组件
connect方法生成容器组件以后，需要让容器组件拿到state对象，才能生成 UI 组件的参数。

一种解决方法是将state对象作为参数，传入容器组件。但是，这样做比较麻烦，尤其是容器组件可能在很深的层级，一级级将state传下去就很麻烦。

React-Redux 提供Provider组件，可以让容器组件拿到state。

```javascript
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import todoApp from './reducers'
import App from './components/App'

let store = createStore(todoApp);

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)


```
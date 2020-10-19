# 为什么要用hook
1. 组件之间复用状态逻辑很困难
React没有提供可复用性行为附加到组件的途径（例如把组件连接到store)。为了解决这个问题，一些库利用高阶组件,例如react-redux，返回容器组件。或者![render props](https://zh-hans.reactjs.org/docs/render-props.html),例如react-router。

但是这类方案需要重新组织组件结构，这可能会让代码难以理解。并且在React DevTool中观察React应用，会发现由providers，consumers，高阶组件，render props等其他组件形成的嵌套低于。

2. 组件内部逻辑过于耦合，导致难以理解
我们经常维护一些组件，组件起初很简单，但是逐渐会被状态逻辑和副作用充斥。每个生命周期常常包含一些不相关的逻辑。

例如，**组件经常在componentDidMount和componentDidUpdate中获取数据，但是同一个componentDidMount中可能会包含很多其他逻辑，例如事件监听，而之后需要在componentWillUnmount中清除。**

相互关联且需要对照修改的代码被进行了拆分，而完全不相关的代码却在同一个方法中组合在一起。如此很容易产生bug，并且导致逻辑不一致。（代码逻辑不够内聚）

**为了解决这个问题，Hook将组件中相互关联的部分拆分成更小的函数，而非强制按照生命周期划分。**

3. class组件难以理解
- 例如this的工作方式，事件必须记得绑定this，没有稳定的语提案。
- class不能很好地压缩，并且会使热重载不稳定。



# State Hook
简单来说State Hook就是让函数式组件拥有自己的状态。
```javascript
import React, { useState } from 'react';

function Example() {
  // 声明一个叫 "count" 的 state 变量
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}


```
等价于
```javascript
class Example extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0
    };
  }

  render() {
    return (
      <div>
        <p>You clicked {this.state.count} times</p>
        <button onClick={() => this.setState({ count: this.state.count + 1 })}>
          Click me
        </button>
      </div>
    );
  }
}


```
之前的函数组件，我们可能称其为"无状态组件"。但是现在我们为它们引入了使用React state的能力。所以现在函数组件+Hook可以用来替代class组件。

为什么叫做useState而不叫createState?因为create不是很正确，State只在组件首次渲染的时候被创建。在下一次重新渲染时，useState返回给我们当前的state。

## 惰性初始state
initialState 参数只会在组件的初始渲染中起作用，后续渲染时会被忽略。如果初始 state 需要通过复杂计算获得，则可以传入一个函数，在函数中计算并返回初始的 state，此函数只在初始渲染时被调用。
```javascript
const [state, setState] = useState(() => {
  const initialState = someExpensiveComputation(props);
  return initialState;
});

```

# Effect Hook
Effect Hook可以让你在函数组件内执行副作用操作。简单来说Effect Hook就是让函数组件有了生命周期。
```javascript
import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  //similar to componentDidMount and componentDidUpdate:
  useEffect(() => {
    document.title = `You clicked ${count} times`;
  });

  return (
    <div>
      <p>You clicked {count} times </p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  )
}

```
**什么是副作用？数据获取、设置订阅、手动更改React组件中的DOM都属于副作用。**

> 你可以把useEffect Hook看做componentDidMount，componentDidUpdate和componentWillUnmount这三个函数的组合。

在React组件中有两种常见副作用操作：需要清除的和不需要清除的。

## 无需清除的effect
有时候，我们只想在React更新Dom之后运行一些额外的代码。比如发送网络请求、手动变更DOM，记录日志等等。这些都是常见的无需清除的操作。

对比一下使用class和Hook是怎么实现这些副作用的。

### 使用class的例子
在class组件中，render函数时不应该有任何副作用的。一般来说，在这里执行操作太早了，基本上都希望在React更新DOM之后才执行我们的操作。（constructor初始化状态->调用render首次渲染->ComponentDidMount确认挂载）

```javascript
class Example extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0
    };
  }

  componentDidMount() {
    document.title = `You clicked ${this.state.count} times`;
  }
  componentDidUpdate() {
    document.title = `You clicked ${this.state.count} times`;
  }

  render() {
    return (
      <div>
        <p>You clicked {this.state.count} times</p>
        <button onClick={() => this.setState({ count: this.state.count + 1 })}>
          Click me
        </button>
      </div>
    );
  }
}
```
在这个class中，我们需要在两个生命周期函数中编写重复的代码。在很多情况下，我们希望在组件加载和更新时执行同样的操作。从概念上来说，我们希望它在每次渲染之后执行。但是React的class组件没有提供专业的方法。

### 使用hook的例子
```javascript
import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `You clicked ${count} times`;
  });

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

## 需要清除的effect
有一些副作用是需要清除的，例如订阅外部数据源。这种情况下，清除工作是非常重要的，可以防止引起内存泄露。

在React class中，**我们通常会在componentDidMount中设置订阅，并在componentWillUnmount中清除它**,假设我们有一个ChatAPI模块，它允许我们订阅好友的在线状态。

```javascript

class FriendStatus extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOnline: null };
    this.handleStatusChange = this.handleStatusChange.bind(this);
  }

  componentDidMount() {
    ChatAPI.subscribeToFriendStatus(
      this.props.friend.id,
      this.handleStatusChange
    );
  }
  componentWillUnmount() {
    ChatAPI.unsubscribeFromFriendStatus(
      this.props.friend.id,
      this.handleStatusChange
    );
  }
  handleStatusChange(status) {
    this.setState({
      isOnline: status.isOnline
    });
  }

  render() {
    if (this.state.isOnline === null) {
      return 'Loading...';
    }
    return this.state.isOnline ? 'Online' : 'Offline';
  }
}
```
**我们会注意到componentDidMount和componentWillUnmount之间互相对应。使用生命周期函数迫使我们拆分这些逻辑代码。**

如何使用 Hook 编写这个组件?

你可能认为需要单独的 effect 来执行清除操作。但由于添加和删除订阅的代码的紧密性，所以 useEffect 的设计是在同一个地方执行。如果你的 effect 返回一个函数，React 将会在执行清除操作时调用它：
```javascript
import React, { useState, useEffect } from 'react';

function FriendStatus(props) {
  const [isOnline, setIsOnline] = useState(null);

  useEffect(() => {
    function handleStatusChange(status) {
      setIsOnline(status.isOnline);
    }
    ChatAPI.subscribeToFriendStatus(props.friend.id, handleStatusChange);
    // Specify how to clean up after this effect:
    return function cleanup() {
      ChatAPI.unsubscribeFromFriendStatus(props.friend.id, handleStatusChange);
    };
  });

  if (isOnline === null) {
    return 'Loading...';
  }
  return isOnline ? 'Online' : 'Offline';
}

```
**为什么要在 effect 中返回一个函数？ 这是 effect 可选的清除机制。每个 effect 都可以返回一个清除函数。如此可以将添加和移除订阅的逻辑放在一起。它们都属于 effect 的一部分。React 何时清除 effect？ React 会在组件卸载的时候执行清除操作。正如之前学到的，effect 在每次渲染的时候都会执行。这就是为什么 React 会在执行当前 effect 之前对上一个 effect 进行清除**

```javascript
// Mount with { friend: { id: 100 } } props
ChatAPI.subscribeToFriendStatus(100, handleStatusChange);     // 运行第一个 effect

// Update with { friend: { id: 200 } } props
ChatAPI.unsubscribeFromFriendStatus(100, handleStatusChange); // 清除上一个 effect
ChatAPI.subscribeToFriendStatus(200, handleStatusChange);     // 运行下一个 effect

// Update with { friend: { id: 300 } } props
ChatAPI.unsubscribeFromFriendStatus(200, handleStatusChange); // 清除上一个 effect
ChatAPI.subscribeToFriendStatus(300, handleStatusChange);     // 运行下一个 effect

// Unmount
ChatAPI.unsubscribeFromFriendStatus(300, handleStatusChange); // 清除最后一个 effect

```
此默认行为保证了一致性，避免了在 class 组件中因为没有处理更新逻辑而导致常见的 bug。

## 按需调用Effect
默认情况下，Effect会在每次渲染后执行或者清除，在某些情况下，这会导致性能问题。在class组件中，我们可以通过componentDidUpdate中对prevProps或者PreveState的比较逻辑解决。
```javascript
componentDidUpdate(prevProps, prevState) {
  if (prevState.count !== this.state.count) {
    document.title = `You clicked ${this.state.count} times`;
  }
}

```
这是很常见的需求，所以它被内置到了 useEffect 的 Hook API 中。如果某些特定值在两次重渲染之间没有发生变化，你可以通知 React 跳过对 effect 的调用，只要传递数组作为 useEffect 的第二个可选参数即可。

```javascript
useEffect(() => {
  document.title = `You clicked ${count} times`;
}, [count]); // 仅在 count 更改时更新
```

> 如果想执行只运行一次的 effect（仅在组件挂载和卸载时执行），可以传递一个空数组（[]）作为第二个参数。这就告诉 React 你的 effect 不依赖于 props 或 state 中的任何值，所以它永远都不需要重复执行。这并不属于特殊情况 —— 它依然遵循依赖数组的工作方式。

与 componentDidMount、componentDidUpdate 不同的是，在浏览器完成布局与绘制之后，传给 useEffect 的函数会延迟调用。这使得它适用于许多常见的副作用场景，比如设置订阅和事件处理等情况，因此不应在函数中执行阻塞浏览器更新屏幕的操作。

然而，并非所有 effect 都可以被延迟执行。例如，在浏览器执行下一次绘制前，用户可见的 DOM 变更就必须同步执行，这样用户才不会感觉到视觉上的不一致。（概念上类似于被动监听事件和主动监听事件的区别。）React 为此提供了一个额外的 useLayoutEffect Hook 来处理这类 effect。它和 useEffect 的结构相同，区别只是调用时机不同。

虽然 useEffect 会在浏览器绘制后延迟执行，但会保证在任何新的渲染前执行。React 将在组件更新前刷新上一轮渲染的 effect。


# useCallback


# useRef
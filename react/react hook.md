- [为什么要用hook](#为什么要用hook)
- [State Hook](#state-hook)
  - [惰性初始state](#惰性初始state)
- [Effect Hook](#effect-hook)
  - [无需清除的effect](#无需清除的effect)
    - [使用class的例子](#使用class的例子)
    - [使用hook的例子](#使用hook的例子)
  - [需要清除的effect](#需要清除的effect)
  - [按需调用Effect](#按需调用effect)
- [useRef](#useref)
- [useCallback](#usecallback)
  - [使用useCallack的前后分析](#使用usecallack的前后分析)
  - [useCallback源码](#usecallback源码)
- [useMemo](#usememo)
- [缓存一个组件](#缓存一个组件)
  - [React.memo(通过对比函数决定组件更新)](#reactmemo通过对比函数决定组件更新)
  - [确保传入组件的Props不变化](#确保传入组件的props不变化)
    - [使用useCallback](#使用usecallback)
    - [使用useMemo](#使用usememo)
- [自定义Hook的实践](#自定义hook的实践)
  - [视图和逻辑拆分](#视图和逻辑拆分)
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

# useRef




# useCallback
语法:
```javascript
const memorizedCallback = useCallback(
  function cb(){
    doSomething(a, b);
  }, 
  [a, b]
);

```
在a和b不变的情况下，memorizedCallback的引用不变（指向cb），即useCallback的第一个入参函数会被缓存，从而达到渲染性能优化的目的。

## 使用useCallack的前后分析
从一个简单示例分析：
```javascript
// 在Hooks中获取上一次指定的props
const usePrevProps = value => {
  console.log('执行usePrevProps');
  const ref = React.useRef();
  React.useEffect(() => {
    console.log('执行useEffect');
    ref.current = value;
  });
  return ref.current;
}

function App() {
  const [count, setCount] = React.useState(0);
  const [total, setTotal] = React.useState(0);
  const handleCount = () => setCount(count + 1);
  const handleTotal = () => setTotal(total + 1);
  // 自定义hook来存储上一次的handleCount函数
  const prevHandleCount = usePrevProps(handleCount);
  
  console.log('两次处理函数是否相等：', prevHandleCount === handleCount);
  
  return (
    <div>
      <div>Count is {count}</div>
       <div>Total is {total}</div>
      <br/>
      <div>
        <button onClick={handleCount}>Increment Count</button>
        <button onClick={handleTotal}>Increment Total</button>
      </div>
    </div>
  )
}

ReactDOM.render(<App />, document.body);

/**
 *  首次执行：
 *  执行usePreProps
 *  两次处理函数是否相等: false
 *  执行useEffect（由于闭包的关系，缓存了上一个handleCount）
 *  点击后第一次重新渲染：
 *  执行usePreProps
 *  两次处理函数是否相等: false（由于handleCount被重复创建了）
 *  执行useEffect
 * /

```
上述例子在点击按钮时，会导致App组件重新渲染，每一次渲染时都会执行函数体，函数体内的handleCount被重复的创建，所以会一直输出false。

> 注意：usePrevProps内部使用了useRef和useRef(), 虽然usePrevProps、useRef是同步调用的，但是useEeffect是在组件渲染完毕后调用的，所以会延迟执行。


为了能够缓存handleCount，我们可以使用useCallback:
```javascript
// 在Hooks中获取上一次指定的props
const usePrevProps = value => {
  console.log('执行usePrevProps');
  const ref = React.useRef();
  React.useEffect(() => {
    console.log('执行useEffect');
    ref.current = value;
  });
  return ref.current;
}

function App() {
  const [count, setCount] = React.useState(0);
  const [total, setTotal] = React.useState(0);
  const handleCount = React.useCallback(() => setCount(count + 1), []);
  const handleTotal = () => setTotal(total + 1);
  // 自定义hook来存储上一次的handleCount函数
  const prevHandleCount = usePrevProps(handleCount);
  
  console.log('两次处理函数是否相等：', prevHandleCount === handleCount);
  
  return (
    <div>
      <div>Count is {count}</div>
       <div>Total is {total}</div>
      <br/>
      <div>
        <button onClick={handleCount}>Increment Count</button>
        <button onClick={handleTotal}>Increment Total</button>
      </div>
    </div>
  )
}

ReactDOM.render(<App />, document.body);

/**
 *  首次执行：
 *  执行usePreProps
 *  两次处理函数是否相等: false （此时ref.current还是个空值）
 *  执行useEffect（由于闭包的关系，缓存了上一个handleCount）
 *  点击后第一次重新渲染：
 *  执行usePreProps
 *  两次处理函数是否相等: true (useCallback缓存了handleCount)
 *  执行useEffect
 * /
```
> **传递给useCallback的第二个参数，代表它的依赖项，一旦依赖项没有改变，则传递给useCallback的第一个参数会被缓存。通过传入空数组，则每次依赖数组都不会被改变，得到永久缓存的效果。**
> 为什么要缓存函数？将handleCount传递给经过优化的组件时，由于handleCount一直在改变，会导致经过优化的组件(只要props相同，就不会重新渲染，例如通过React.memo、shouldComponentUpdate判断和pureComponent创建的组件)依然重复渲染。

如下所示：
```javascript
// 在Hooks中获取上一次指定的props
const usePrevProps = value => {
  console.log('执行usePrevProps');
  const ref = React.useRef();
  React.useEffect(() => {
    console.log('执行useEffect');
    ref.current = value;
  });
  return ref.current;
}

function App() {
  const [count, setCount] = React.useState(0);
  const [total, setTotal] = React.useState(0);
  const handleCount = () => setCount(count + 1);
  const handleTotal = () => setTotal(total + 1);
  // 自定义hook来存储上一次的handleCount函数
  const prevHandleCount = usePrevProps(handleCount);
  
  console.log('两次处理函数是否相等：', prevHandleCount === handleCount);
  
  return (
    <div>
      <div>Count is {count}</div>
       <div>Total is {total}</div>
      <br/>
      <div>
        <button onClick={handleCount}>Increment Count</button>
        <button onClick={handleTotal}>Increment Total</button>
        <CachedChildComponent click={handleCount} />
      </div>
    </div>
  )
}

const CachedChildComponent = React.memo(function ChildComponent({click}) {
  console.log('Child Component Render');
  return (
    <button onClick={click}>Child Click</button>
  )
})

ReactDOM.render(<App />, document.body);

/**
 *  首次执行：
 *  执行usePreProps
 *  两次处理函数是否相等: false （此时ref.current还是个空值）
 *  Child Component Render
 *  执行useEffect（由于闭包的关系，缓存了上一个handleCount）
 *  点击后第一次重新渲染：
 *  执行usePreProps
 *  两次处理函数是否相等: false 
 *  Child Component Render
 *  执行useEffect
 * /
```
CachedChildComponent在React.memo的控制下，只要传递给它的props不改变，它就不会重复渲染。但是handleCount的引用在每次渲染中都会改变，导致传递给CachedChildComponent的props中的click属性也一直在改变。达不到缓存的效果。

如果使用useCallback就能很好的解决这个问题。

## useCallback源码
```javascript
function updateCallback(callback, deps) {
  const hook = updateWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  const prevState = hook.memoizedState;
  if (prevState !== null) {
    if (nextDeps !== null) {
      const prevDeps = prevState[1];
      if (areHookInputsEqual(nextDeps, prevDeps)) {
        return prevState[0];
      }
    }
  }
  // 初始化缓存，第一次执行或者不存在依赖数组的情况下
  hook.memoizedState = [callback, nextDeps];
  return callback;
}
```

# useMemo
useMemo和useCallback几乎是一致的，他们的唯一区别：
- useCallback根据依赖，缓存第一个入参。
- useMemo根据依赖，缓存第一个入参执行后的值。

useMemo源码：
```javascript
function updateMemo(nextCreate, deps) {
  const hook = updateWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  const prevState = hook.memoizedState;
  if (prevState !== null) {
    if (nextDeps !== null) {
      const prevDeps = prevState[1];
      if (areHookInputsEqual(nextDeps, prevDeps)) {
        return prevState[0];
      }
    }
  }
  const nextValue = nextCreate(); 
  hook.memoizedState = [nextValue, nextDeps];
  return nextValue;
};
```

useMemo一般用于密集型计算大的一些缓存。
例如：
```javascript
// 在Hooks中获取上一次指定的props
const usePrevProps = value => {
  const ref = React.useRef();
  React.useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

function App() {
  const [count, setCount] = React.useState(0);
  const [total, setTotal] = React.useState(0);
  const calcValue = React.useMemo(() => {
    return Array(100000).fill('').map(v => /*一些大量计算*/ v);
  }, [count]);
  const handleCount = () => setCount(count => count + 1);
  const handleTotal = () => setTotal(total + 1);
  const prevCalcValue = usePrevProps(calcValue);
  
  console.log('两次计算结果是否相等：', prevCalcValue === calcValue);
  return (
    <div>
      <div>Count is {count}</div>
       <div>Total is {total}</div>
      <br/>
      <div>
        <button onClick={handleCount}>Increment Count</button>
        <button onClick={handleTotal}>Increment Total</button>
      </div>
    </div>
  )
}

ReactDOM.render(<App />, document.body)


```

# 缓存一个组件
在 class 组件中，我们通过 `ShouldComponentUpdate` 的生命周期来对组件进行缓存。在函数式组件中我们应该用什么方法来确保一个组件可缓存？  
先抛出结论，我们应该要确保以下两点：
1. 传入的 Props 没有改变的情况下，不重新渲染。
2. 减少不必要的 Props 变化。

## React.memo(通过对比函数决定组件更新)
首先认识 React 提供的高阶组件： `React.memo`，默认情况下，通过 `React.memo` 包裹的组件，会返回一个新的组件，该组件只在 Props 变化时进行更新(浅层比较)， 我们也可以通过 `React.memo` 提供的第二个参数来定义 `React.memo` 返回的组件是否更新(例如进行深层比较)。与 `ShouldComponentUpdate` 不同的是， `React.memo` 在比较函数返回 true 时不会更新， 返回 false 时更新，这一点和 `ShouldComponentUpdate` 相反。

```javascript
const Child: React.FC = React.memo(({name}) => (<span>name</span>));
```

当父组件引入子组件的时候，可能会造成一些不必要的子组件重复渲染浪费，例如：
```javascript
const Child: React.FC = (props) => {
  console.log('子组件渲染');
  return (<div>我是子组件</div>)
}

const Page: React.FC = (props) => {
  const [count, setCount] = useState(0);
  return (
    <>
      <button onClick={(e) => { setCount(count + 1) }}>加一</button>
      <p>count: {count}</p>
      <Child/>
    </>
  )
}
```
在没有使用 `React.memo` 包裹子组件之前，每次点击"加一"的按钮，都会导致 `count` 更新， `count` 更新导致父组件重新渲染，从而也导致 `Child` 组件重新渲染。

如果我们使用 `React.memo` 就能解决这个问题：
```javascript
const Child: React.FC = React.memo((props) => {
  console.log('子组件渲染');
  return (<div>我是子组件</div>)
});

const Page: React.FC = (props) => {
  const [count, setCount] = useState(0);
  return (
    <>
      <button onClick={(e) => { setCount(count + 1) }}>加一</button>
      <p>count: {count}</p>
      <Child/>
    </>
  )
}

```

现在，我们的组件仅当 Props 更新时才会更新。但是这还是不够，我们还要在引用此组件的同时，确保传入的 Props 尽可能不变化。

## 确保传入组件的Props不变化
使用 `React.memo` 返回的组件，可以确保在 Props 没有变更的情况下缓存组件，但是如果父组件传递的 Props 每次都在改变的话，`React.memo` 将会失去效果。那么，我们应该确保父组件，在传递值时，尽可能保持不变。

### 使用useCallback
例如，我们传入了一个匿名函数：
```javascript
const Child: React.FC = React.useMemo({onClick}) => {
  console.log('子组件');
  return (
    <>
      <button onClick={onClick.bind(null, '新的子组件名称')}>改变name</button>
    </>
  )
}

const Page: React.FC = (props) => {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('Child组件');
  return (
    <>
      <button onClick={(e) => { setCount(count + 1) }}>加一</button>
      <p>count: {count}</p>
      <Child onClick={(newName: sring) => setName(newName)}/>
    </>
  )
}

```
上面的例子中，我们每次改变count，都会导致父组件 `Page` 重新渲染，导致的 onClick 回调函数重新的定义，从而导致传入 Child 的 onClick函数引用改变。所以每次 Page 重新渲染都会导致 Child 重新渲染。

为了解决这个问题，我们可以使用 `useCallback` 的 hook 去缓存回调函数：
```javascript
const Child: React.FC = React.useMemo({onClick}) => {
  console.log('子组件');
  return (
    <>
      <button onClick={onClick.bind(null, '新的子组件名称')}>改变name</button>
    </>
  )
}

const Page: React.FC = (props) => {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('Child组件');
  const handler = useCallback((newName: sring) => {
    setName(newName);
  }, [setName])
  return (
    <>
      <button onClick={(e) => { setCount(count + 1) }}>加一</button>
      <p>count: {count}</p>
      <Child onClick={(newName: sring) => setName(newName)}/>
    </>
  )
}

```
现在，onClick 回调函数当且仅当 setName 方法改变时进行更新。

### 使用useMemo
上面的例子中，我们介绍了传入参数为匿名函数的情况，我们可能还会传入一个临时的对象：
```javascript
//子组件会有不必要渲染的例子
interface ChildProps {
    name: { name: string; color: string };
    onClick: Function;
}
const Child: React.FC = ({ name, onClick}: ChildProps) => {
    console.log('子组件?')
    return(
        <>
            <div style={{ color: name.color }}>我是一个子组件，父级传过来的数据：{name.name}</div>
            <button onClick={onClick.bind(null, '新的子组件name')}>改变name</button>
        </>
    );
}
const ChildMemo = memo(Child);

const Page: React.FC = (props) => {
    const [count, setCount] = useState(0);
    const [name, setName] = useState('Child组件');
    
    return (
        <>
            <button onClick={(e) => { setCount(count+1) }}>加1</button>
            <p>count:{count}</p>
            <ChildMemo 
                name={{ name, color: name.indexOf('name') !== -1 ? 'red' : 'green'}} 
                onClick={ useCallback((newName: string) => setName(newName), []) }
            />
        </>
    )
}


```
传入 Child name 属性的对象，在每次 Page 组件重新渲染时，都会重新创建，导致每次传入的引用不同，为了缓存一个值，我们可以使用 useMemo， useMemo 用于缓存一个执行函数的结果。
```javascript
//子组件会有不必要渲染的例子
interface ChildProps {
    name: { name: string; color: string };
    onClick: Function;
}
const Child: React.FC = ({ name, onClick}: ChildProps) => {
    console.log('子组件?')
    return(
        <>
            <div style={{ color: name.color }}>我是一个子组件，父级传过来的数据：{name.name}</div>
            <button onClick={onClick.bind(null, '新的子组件name')}>改变name</button>
        </>
    );
}
const ChildMemo = memo(Child);

const Page: React.FC = (props) => {
    const [count, setCount] = useState(0);
    const [name, setName] = useState('Child组件');
    const childName = useMemo(() => ({ name, color: name.indexOf('name') !== -1 ? 'red': 'green' }), [name]);
    return (
        <>
            <button onClick={(e) => { setCount(count+1) }}>加1</button>
            <p>count:{count}</p>
            <ChildMemo 
                name={childName} 
                onClick={ useCallback((newName: string) => setName(newName), []) }
            />
        </>
    )
}

```

# 自定义Hook的实践
自定义 Hook 是以 `use` 为前缀的函数，在自定义 hook 内可以使用任意的 hook (包括其他自定义hook)，那么自定义 hook 有什么作用呢。  
通常来说，自定义 hook 是用来抽象逻辑，用于逻辑复用的，主要有以下好处：
- hook 可读性高，易于维护。
- hook 不会侵入代码，不会造成嵌套，这是mixin做不到的
- hook 可以促使视图和逻辑拆分更明确，更易于复用。


## 视图和逻辑拆分
TODO: 项目中抽象逻辑的实例
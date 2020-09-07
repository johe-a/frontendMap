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


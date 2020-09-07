# 前言
高阶组件（High-Order Component）是React中用于复用组件逻辑的一种高级技巧。HOC自身不是React API的一部分，是一种基于React组合特性而形成的设计模式。

具体而言，高阶组件是参数为组件，返回值为新组件的函数：
```javascript
const EnhancedComponent = highOrderComponent(WraapedComponent);

```
组件是将Props转换成UI，而高阶组件是将组件转换为另一个组件。

HOC在React的第三方库中很常见，例如Redux的connect。

# HOC解决的问题
之前我们在抽象组件逻辑的时候，一般都会用到Mixin，例如分页器的逻辑（将分页器的页码、页数大小、页码改变时的回调、页数大小改变时的回调）抽象到Mixin。这样做会有些坏处，这个后部分解释。

假设我们现在有两个组件CommentList和BlogPost，它们能够抽象一部分相似的逻辑。例如都需要在ComponentDidMount设置对于全局状态的订阅、都需要在ComponentWillUnmount下清除订阅。
```javascript
class CommentList extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      // 假设 “DataSource” 是一个全局范围内的数据源
      comments: DataSource.getComments()
    };
  }

  componentDidMount() {
    // 订阅更改
    DataSource.addChangeListener(this.handleChange);
  }

  componentWillUnmount() {
    // 清除订阅
    DataSource.removeChangeListener(this.handleChange);
  }

  handleChange() {
    // 数据源更新时，更新组件状态
    this.setState({
      comments: DataSrouce.getComments()
    });
  }

  render() {
    return (
      <div>
        {this.state.comments.map((comment) => (
          <Comment comment={comment} key={comment.id}>
        ))}
      </div>
    )
  }
}

```
BlogPost组件
```javascript
class BlogPost extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      blogPost: DataSource.getBlogPost(props.id)
    };
  }

  componentDidMount() {
    DataSource.addChangeListener(this.handleChange);
  }

  componentWillUnmount() {
    DataSource.removeChangeListener(this.handleChange);
  }

  handleChange() {
    this.setState({
      blogPost: DataSource.getBlogPost(this.props.id)
    });
  }

  render() {
    return <TextBlock text={this.state.blogPost} />;
  }
}

```
CommentList和BlogPost都是在同样的生命周期订阅DataSource、清除订阅DataSource，但是他们在订阅时可能回调不一样。
- 在挂载时，向DataSource添加一个订阅
- 在监听器内部，当数据源发生变化时，调用setState
- 在卸载时，删除监听器

**在一个大型的应用程序中，这种订阅DataSource和调用setState的模式将一次又一次的发生，因此我们需要一个抽象，允许我们在一个地方定义这个逻辑，并在许多组件之间共享它。这就是高阶组件擅长的地方。**

对于订阅了DataSource的组件，我们可以编写一个创建组件函数，该函数接收一个子组件为它的其中一个参数，该子组件将订阅数据作为props。
```javascript
const CommentListWithSubscription = withSubscription(
  CommentList,
  // 监听回调时，数据的获取方式
  (DataSource) => DataSource.getComments()
);

const BlogPostWithSubscription = withSubscription(
  BlogPost,
  // 如果依赖props，可以设置参数
  (DataSource, props) => DataSource.getBlogPost(props.id)
)

```
CommentList和BlogPost将传递一个data prop，其中包含从DataSource检索到的最新数据
```javascript
function withSubscription(WrappedComponent, selectData) {
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        data: selectData(DataSource, props)
      };
      this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {
      DataSource.addListener(this.handleChange);
    }

    componentWillUnMount() {
      DataSource.removeListener(this.handleChange);
    }

    handleChange() {
      this.setState({
        data: selectData(DataSource, this.props)
      })
    }

    render() {
       return (
         <WrappedCommponent {...this.props} data={this.state.data}>
       )
    }

  }
}

```

**HOC不会修改传入的组件，也不会使用继承来复制其行为，相反，HOC通过组件包装在容器组件中来组成新组件，HOC是纯函数，没有副作用**，被包装组件接收来自容器组件的所有prop，同时也接收一个新的用于render的data prop。HOC不需要关旭数据的使用方式或者原因，而被 包装组件也不需要关心数据时怎么来的。

因为 withSubscription 是一个普通函数，你可以根据需要对参数进行增添或者删除。例如，您可能希望使 data prop 的名称可配置，以进一步将 HOC 与包装组件隔离开来。或者你可以接受一个配置 shouldComponentUpdate 的参数，或者一个配置数据源的参数。因为 HOC 可以控制组件的定义方式，这一切都变得有可能。

# HOC设计原则
- 不要修改原始组件，使用组合。
```javascript
function logProps(InputComponent) {
  InputComponent.prototype.componentDidUpdate = function(prevProps) {
    console.log('Current props: ', this.props);
    console.log('Previous props: ', prevProps);
  };
  // 返回原始的 input 组件，暗示它已经被修改。
  return InputComponent;
}

// 每次调用 logProps 时，增强组件都会有 log 输出。
const EnhancedComponent = logProps(InputComponent);
```
这样做会产生一些不良后果。其一是输入组件再也无法像 HOC 增强之前那样使用了。更严重的是，如果你再用另一个同样会修改 componentDidUpdate 的 HOC 增强它，那么前面的 HOC 就会失效！同时，这个 HOC 也无法应用于没有生命周期的函数组件。

HOC 不应该修改传入组件，而应该使用组合的方式，通过将组件包装在容器组件中实现功能：
```javascript
function logProps(WrappedComponent) {
  return class extends React.Component {
    componentDidUpdate(preProps) {
      console.log('Currnt Props:', this.props);
      console.log('Previous props:', preProps);
    }
    render() {
      // 将输入组件包装在容器中，而不对其进行修改。
      return <WrappedComponent {...this.props}/>;
    }
  }
}

```
> 你可能已经注意到 HOC 与容器组件模式之间有相似之处。容器组件担任将高级和低级关注点分离的责任，由容器管理订阅和状态，并将 prop 传递给处理 UI 的组件。HOC 使用容器作为其实现的一部分，你可以将 HOC 视为参数化容器组件。

- 将不相关的props传递给被包裹的组件
HOC为组件添加特性。自身不应该大幅改变约定。HOC返回的组件与元组件应该保持类似的接口。

**HOC应该透传与自身无关的props**

大多数HOC都应该包含类似于下面的render方法.
```javascript
render() {
  // 过滤掉非此 HOC 额外的 props，且不要进行透传
  const { extraProp, ...passThroughProps } = this.props;

  // 将 props 注入到被包装的组件中。
  // 通常为 state 的值或者实例方法。
  const injectedProp = someStateOrInstanceMethod;

  // 将 props 传递给被包装组件
  return (
    <WrappedComponent
      injectedProp={injectedProp}
      {...passThroughProps}
    />
  );
}


```

- 最大化可组合性
这个有点绕，意思是输出类型和输入类型相同的函数，可以组合在一起。

并不是所有的HOC都只需要接收一个参数，HOC有很多形式，例如：
```javascript
const NavBarWithRouter = withRouter(Navbar);
//or
const CommentWithRelay = Relay.createContainer(Comment, config);
//or
const ConnectedComment = connect(commentSelector, commentActions)(CommentList);
```
Redux的connect函数可能会有些难以理解，它实际上是一个返回高阶组件的高阶函数：
```javascript
// 返回一个接受参数为组件的函数，该函数生成高阶组件
const enhance = connect(mapStateToProps, mapDispatchToProps);
// 返回一个HOC，它会返回已经连接Redux Store的组件
const ConnectedComment = enhance(CommentList);

```
像connect函数返回的函数，是一个接收组件返回HOC的函数，具有签名Component => Component。对于输出类型与输入类型相同的函数很容易组合在一起。

```javascript
// withRouter的签名也是Component => Component
const NavBarWithRouter = withRouter(Navbar);

// 如果不组合，我们可能会这样写
const EnhancedComponent = withRouter(connect(mapStateToProps,mapDispatchToProps)(WrappedComponent));

// 对于输入和输出类型相同的函数，我们应该组合在一起
// compose(f,g,h)等同于(...args) => f(g(h(...args)))
const enhance = compose(
  withRouter,
  connect(mapStateToProps,mapDispatchToProps)
)
const EnhancedComponent = enhance(WrappedComponent);
```
许多第三方库都提供了compose工具函数，例如lodash.flowRight、Redux等


- HOC应该显示包装名称,方便调试
 HOC 创建的容器组件会与任何其他组件一样，会显示在 React Developer Tools 中。为了方便调试，请选择一个显示名称，以表明它是 HOC 的产物。

 最常见的方式是用 HOC 包住被包装组件的显示名称。比如高阶组件名为 withSubscription，并且被包装组件的显示名称为 CommentList，显示名称应该为 WithSubscription(CommentList)：
```javascript
function withSubscription(WrappedComponent) {
  class WithSubscription extends React.Component {/* ... */}
  WithSubscription.displayName = `WithSubscription(${getDisplayName(WrappedComponent)})`;
  return WithSubscription;
}

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}


```

- 不要在render方法中使用HOC
React 的 diff 算法（称为协调）使用组件标识来确定它是应该更新现有子树还是将其丢弃并挂载新子树。 如果从 render 返回的组件与前一个渲染中的组件相同（===），则 React 通过将子树与新子树进行区分来递归更新子树。 如果它们不相等，则完全卸载前一个子树。
```javascript
render() {
  // 每次调用 render 函数都会创建一个新的 EnhancedComponent
  // EnhancedComponent1 !== EnhancedComponent2
  const EnhancedComponent = enhance(MyComponent);
  // 这将导致子树每次渲染都会进行卸载，和重新挂载的操作！
  return <EnhancedComponent />;
}

```
这不仅仅是性能问题 - 重新挂载组件会导致该组件及其所有子组件的状态丢失。

- 务必赋值静态方法
有时在 React 组件上定义静态方法很有用。例如，Relay 容器暴露了一个静态方法 getFragment 以方便组合 GraphQL 片段。

但是，当你将 HOC 应用于组件时，原始组件将使用容器组件进行包装。这意味着新组件没有原始组件的任何静态方法。
为了解决这个问题，你可以在返回之前把这些方法拷贝到容器组件上：
```javascript
function enhance(WrappedComponent) {
  class Enhance extends React.Component {/*...*/}
  // 必须准确知道应该拷贝哪些方法 :(
  Enhance.staticMethod = WrappedComponent.staticMethod;
  return Enhance;
}
```
或者使用hoist-non-react-static自动拷贝所有非React静态方法：
```javascript
import hoistNonReactStatic from 'hoist-non-react-statics';
function enhance(WrappedComponent) {
  class Enhance extends React.Component {}
  hoistNonReaaactStatic(Enhancce, WrappedComponent);
  return Enhance;
}

```

- Refs不会被传递
虽然高阶组件的约定是将所有props传递给被包装组件，但是这对于refs并不适用。那是因为ref实际上不是一个Prop,就像key一样。它是由React专门处理的。如果将 ref 添加到 HOC 的返回组件中，则 ref 引用指向容器组件，而不是被包装组件。这个问题的解决方案是通过使用 React.forwardRef API。
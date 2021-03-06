- [JSX](#jsx)
  - [表达式](#表达式)
  - [属性](#属性)
  - [JSX的转译](#jsx的转译)
- [React元素渲染](#react元素渲染)
- [组件&Props](#组件props)
  - [渲染](#渲染)
  - [Props的只读性](#props的只读性)
- [组件State&生命周期](#组件state生命周期)
  - [class组件的生命周期](#class组件的生命周期)
  - [正确使用setState](#正确使用setstate)
  - [数据向下流动](#数据向下流动)
- [事件处理](#事件处理)
  - [关于事件的this](#关于事件的this)
  - [向事件回调传参](#向事件回调传参)
- [Refs&DOM](#refsdom)
- [Refs创建](#refs创建)
- [访问Refs](#访问refs)
- [另一种Refs设置方式(回调Refs)](#另一种refs设置方式回调refs)
- [使用useRef创建ref对象](#使用useref创建ref对象)
# JSX
```javascript
const element = <h1> hello, world!</h1>
```
被称为JSX，JSX可以很好的描述UI应该呈现出它应有交互的本质形式。JSX可以生成React元素。

为什么使用JSX？**React认为渲染逻辑本质上与UI逻辑内在耦合**,比如，在 UI 中需要绑定处理事件、在某些时刻状态发生变化时需要通知到 UI，以及需要在 UI 中展示准备好的数据。

React 并没有采用将标记与逻辑进行分离到不同文件这种人为地分离方式，而是通过将二者共同存放在称之为“组件”的松散耦合单元之中，来实现关注点分离。**即逻辑与视图绑定在组件中**

总结下使用JSX的原因：
- 通过组件和JSX，可以将视图与对应逻辑、状态耦合
- React利用JSX来描述和React元素（可以理解为虚拟DOM对象）

## 表达式
**JSX中可以通过大括号迁入表达式，并且JSX本身也是一个表达式**
```javascript
const name = 'Josh Perez';
const element = <h1>Hello, {name}</h1>;

ReactDOM.render(
  element,
  document.getElementById('root')
);
```
大括号内可以放入任何JS有效表达式
```javascript
function formatName(user) {
  return user.firstName + ' ' + user.lastName;
}

const user = {
  firstName: 'Harper',
  lastName: 'Perez'
};

const element = (
  <h1>
    Hello, {formatName(user)}!
  </h1>
);

ReactDOM.render(
  element,
  document.getElementById('root')
);

```
**JSX自己也是一个表达式,这是由于JSX表达式会被转为JS函数调用，并且对其取值后得到JS对象。也就是说我们可以在if语句和for循环等代码块内使用JSX，或者把JSX赋值给变量，把JSX当做参数传入，以及从函数中返回JSX。**

也就是说JSX可以被当做一个普通的JS对象来使用。
```javascript
function getGreeting(user) {
  if (user) {
    return <h1>Hello, {formatName(user)}!</h1>;
  }
  return <h1>Hello, Stranger.</h1>;
}
```
## 属性
JSX中的属性可以使用引号，来讲属性指定为字符串字面量，或者使用大括号，来在属性中插入一个JS表达式,对同一属性不能同时使用引号和大括号。
```javascript
const element = <div tabIndex="0"></div>;
const element = <img src={user.avatarUrl}></img>;
```
**JSX更接近JS而不是HTML，所以ReactDOM使用camlCase小驼峰命名，而不是HTML的属性命名。例如class改成了className，tabindex变为了tabIndex**

## JSX的转译
React通过函数React.createElement()来创建ReactDOM，createElement则需要接收一个DOM描述的对象。这个对象就从JSX得来：
```javascript
const element = (
  <h1 className="greeting">
    Hello, world!
  </h1>
)
//等同于
const element = React.createElement(
  'h1',
  {className: 'greeting'},
  'Hello, world!'
)

```
也就是说JSX会被转译成ReactDOM，即:
```javascript
JSX === React.createElement(文档描述对象)
```

# React元素渲染
元素是React应用的最小砖块。这里的元素就是ReactElement或者说ReactDOM
```javascript
const element = <h1>Hello, world</h1>;

```
与浏览器的 DOM 元素不同，React 元素是创建开销极小的普通对象。React DOM 会负责更新 DOM 来与 React 元素保持一致。


想要将一个 React 元素渲染到根 DOM 节点中，只需把它们一起传入 ReactDOM.render()：

```javascript
const element = <h1>react element</h1>;
ReactDOM.render(element, 
document.getElementById('root'));

```
React 只更新它需要更新的部分
React DOM 会将元素和它的子元素与它们之前的状态进行比较，并只会进行必要的更新来使 DOM 达到预期的状态。


# 组件&Props
组件从概念上类似于JS函数，它接收任意的入参，即props，并返回用于描述页面展示内容的React元素。  
也就是说组件是一个类似于能够接收参数的函数，该函数返回ReactElement，也就是ReactDOM。

组件分为：函数组件和class组件
```javascript
function welcome(props) {
  return <h1>Hello, {props.name}</h1>;
} 

```
class定义组件：
```javascript
class Welcome extends React.Component {
  render() {
    return <h1>hello, {this.props.name}</h1>
  }
}

```
## 渲染
我们之前遇到的React元素都只是DOM标签：
```javascript
const element = <div />;
```
但是React元素也可以是用户自定义的组件，因为组件会返回React元素
```javascript
const element = <Welcome name="Sara" />;
```
当React元素为用户自定义组件时，它将JSX所接收到的属性（attributes）以及子组件（children）转换为单个对象传递给组件，这个对象被称为props

例如如下代码：
```javascript
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>
}

const element = <Welcome name="Sara" />;
ReactDOM.render(
  element,
  document.getElementById('root')
)

```
1. 调用ReactDOM.render()该函数接收React元素，也是React.createElement后的返回结果或者是JSX。
2. React调用Welcome组件，并将{name: 'Sara'}作为props传入。
3. Welcome组件将JSX,也就是React元素作为返回值
4. ReactDOM将DOM高效的更新。

> 注意：组件名称必须以大写字母开头，React会将以小写字母开头的组件视为原生DOM标签.

## Props的只读性
组件无论是函数声明还是class声明形式，都不能修改自身的props。
```javascript
function sum(a,b) {
  return a + b;
}

```
注意的函数被称为纯函数，因为该函数不会尝试更改入参，且多次调用下相同的入参始终返回相同的结果。

**所有 React 组件都必须像纯函数一样保护它们的 props 不被更改。**

# 组件State&生命周期
**为了使得组件能够有自己的状态和生命周期，我们将组件定义为class，而不是函数。（这也意味着函数组件有更小的消耗）**

**每次组件更新(state更新)时,render方法都会被调用，但只要在相同的DOM节点中渲染组件，就仅有一个组件的class实例被创建使用。这就使得我们可以使用例如state或者声明周期方法等很多其他特性。**

- 如果组件要有自己的状态和生命周期，就需要用class来声明组件，而不是函数，这也意味着函数组件有更小的消耗。
- 只要在相同的DOM节点中渲染class组件，就仅有一个class实例被创建使用，由于class组件每次state更新时都会调用render函数来更新ReactElement，所以我们可以通过更新state来达到更新组件的目的。

```javascript
class Clock extends React.Component {
  constructor(props) {
    //始终使用props参数来调用父类的构造函数
    super(props);
    this.state = {date: new Date()};
  }

  render() {
    return (
      <div>
        <h2>
          {this.state.date.toLocaleTimeString()}
        </h2>
      </div>
    )
  }
}

```
## class组件的生命周期
**在具有许多组件的应用程序中，当组件被销毁时释放所占用的资源是非常重要的。**  

为了让Clock组件能够自动更新自己的状态，我们需要利用一个计时器，计时器应该设置在什么时候？初始化时，Clock组件有一个初始化的值，那么我们应该在Clock组件第一次被渲染到DOM中的时候，就为其设置一个计时器。**在React中，第一次被渲染到DOM的时刻被称为挂载(mount)**

同时，当DOM中Clock组件被删除时，应该清除计时器。否则计时器线程仍然会添加宏任务到队列中，导致资源浪费。**在React中，组件被删除的时候，称为卸载(unmount)**

- 组件挂载对应的生命周期：componentDidMount
- 组件卸载对应的生命周期：componentWillUnmount

```javascript
class Clock extends React.componet {
  constructor(props) {
    // 初始化阶段，初始化实例属性、props和state
    super(props);
    this.state = {
      date = new Date()
    }
  }

  componentDidMount() {
    // 组件被挂载后，渲染到DOM之后
    this.timerID = setInterval(
      () => this.tick(),
      1000
    )
  }

  componentDidUnMount() {
    clearInterval(this.timerID);
  }

  tick() {
    this.setState({
      date:new Date()
    })
  }

  render() {
    // 初始化后调用render来渲染组件
    return (
      <div>
        <h1>
          {this.state.date.toLocaleTimeString()}
        </h1>
      </div>
    )
  }
}

```
来看一下调用顺序：
1. 当<Clock />被传给ReactDOM.render()的时候，React会调用Clock组件的构造函数，进行初始化
2. 之后React会调用组件的render()方法。进行首次渲染
3. 当Clock的输出(ReactElement)被插入到DOM中之后,React就会调用ComponentDidMount()生命周期方法。
4. 每秒都会调用一次tick()方法，在这个方法之中会调用setState()来计划进行一次UI更新。得益于 setState() 的调用，React 能够知道 state 已经改变了，然后会重新调用 render() 方法来确定页面上该显示什么。这一次，render() 方法中的 this.state.date 就不一样了，如此以来就会渲染输出更新过的时间。React 也会相应的更新 DOM。
5. 一旦 Clock 组件从 DOM 中被移除，React 就会调用 componentWillUnmount() 生命周期方法，这样计时器就停止了。

## 正确使用setState
- 不要直接修改State
```javascript
// Wrong
this.state.comment = 'Hello';

```
应该使用setState来进行状态更新，构造函数时唯一可以给this.state赋值的地方

- State更新可能是异步的
处于性能考虑，React可能会把多个setState()调用合并成一个调用。

因为this.props和this.state可能会异步更新，所以不要依赖他们的值来更新下一个状态。
```javascript
// Wrong
this.setState({
  counter: this.state.counter + this.props.increment,
})

```
要解决这个问题，setState()接收一个函数而不是对象。这个函数用上一个state作为第一个参数，将此次更新被应用时的props作为第二个参数.
```javascript
// Correct
this.setState((state, props) => ({
  counter: state.counter + props.increment
}))
```

- State的更新会被合并
当我们调用setState()的时候，React会把我们提供的对象合并到当前的state中

例如：
```javascript
constructor(props) {
  super(props);
  this.state = {
    posts: [],
    comments: []
  }
}
componentDidMount() {
    fetchPosts().then(response => {
      this.setState({
        posts: response.posts
      });
    });

    fetchComments().then(response => {
      this.setState({
        comments: response.comments
      });
    });
}
```
这里的合并是浅合并，所以this.setState({comments})完整保留了this.state.posts但是完全替换了this.state.comments

## 数据向下流动
不管是父组件或是子组件都无法知道某个组件是有状态的还是无状态的，并且它们也并不关心它是函数组件还是 class 组件。

这就是为什么称 state 为局部的或是封装的的原因。除了拥有并设置了它的组件，其他组件都无法访问。

组件可以选择把它的 state 作为 props 向下传递到它的子组件中：
```javascript
<FormattedDate date={this.state.date} />

```
FormattedDate 组件会在其 props 中接收参数 date，但是组件本身无法知道它是来自于 Clock 的 state，或是 Clock 的 props，还是手动输入的。

这通常会被叫做“自上而下”或是“单向”的数据流。任何的 state 总是所属于特定的组件，而且从该 state 派生的任何数据或 UI 只能影响树中“低于”它们的组件。

如果你把一个以组件构成的树想象成一个 props 的数据瀑布的话，那么每一个组件的 state 就像是在任意一点上给瀑布增加额外的水源，但是它只能向下流动。


# 事件处理
React 元素的事件处理和 DOM 元素的很相似，但是有一点语法上的不同：
- React 事件的命名采用小驼峰式（camelCase），而不是纯小写。
- 使用 JSX 语法时你需要传入一个函数作为事件处理函数，而不是一个字符串。

HTML 
```javascript
<button onlick="activateLasers()">
</button>
```
JSX:
```javascript
<button onClick={activateLasers} />

```

在 React 中另一个不同点是你不能通过返回 false 的方式阻止默认行为。你必须显式的使用 preventDefault。

```javascript
<a href="#" onlick="console.log('hello'); return false">
</a>
```
在React中，可能是这样的：
```javascript
function ActionLink() {
  function handleClick(e) {
    e.preventDefault();
    console.log('hello');
  }

  return (
    <a href="#" onClick={handleClick}>
    </a>
  )
}

```
在这里，e 是一个合成事件。React 根据 W3C 规范来定义这些合成事件，**所以你不需要担心跨浏览器的兼容性问题**。React 事件与原生事件不完全相同。

## 关于事件的this
事件绑定时的处理函数，由于事件触发时所处上下文不在组件实例中，会导致this指向undefined,所以我们一定要显式绑定this：
```javascript
class Toggle extends React.Component {
  constructor(props) {
    super(props);
    this.state = {isToggleOn: true};

    //为了在回调中使用this，这个绑定必不可少
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.setState(state => ({
      isToggleOn: !state.isToggleOn
    }))
  }

  render() {
    return (
      <button onClick={this.handleClick}>
        {this.state.isToggleOn ? 'ON' : 'OFF'}
      </button>
    )
  }
}

ReactDOM.render(
  <Toggle />,
  document.getElementById('root')
)

```
如果觉得bind很麻烦，还有两种方式可以解决
- 实现性的public class fields语法，也就是在class内定义箭头函数

```javascript
class LigginButton extends React.Component {
  handleClick = () => {
    console.log('this is:',this)
  }

  render() {
    return (
        <button onClick={this.handleClick}>
          Click me
        </button>
    )
  }
}

```
- 在回调中使用箭头函数(不建议)
```javascript
class LoggingButton extends React.Component {
  handleClick() {
    console.log('this is:', this);
  }

  render() {
    // 此语法确保 `handleClick` 内的 `this` 已被绑定。
    return (
      <button onClick={() => this.handleClick()}>
        Click me
      </button>
    );
  }
}

```
**此语法问题在于每次渲染 LoggingButton 时都会创建不同的回调函数。在大多数情况下，这没什么问题，但如果该回调函数作为 prop 传入子组件时，这些组件可能会进行额外的重新渲染。我们通常建议在构造器中绑定或使用 class fields 语法来避免这类性能问题。**

## 向事件回调传参
在循环中，通常我们会为事件处理函数传递额外的参数。例如，若 id 是你要删除那一行的 ID，以下两种方式都可以向事件处理函数传递参数：
```javascript
<button onClick={(e) => this.deleteRow(id, e)} />

<button onClick={this.deleteRow.bind(this,id)} />
```
如果通过箭头函数的方式，事件对象必须显式的进行传递，而通过 bind 的方式，事件对象以及更多的参数将会被隐式的进行传递。


# Refs&DOM
> Refs 提供了一种方式，允许我们访问 DOM 节点或在 render 方法中创建的 React 元素。

Refs使用场景：
- 管理焦点
- 触发强制动画
- 集成第三方DOM库

# Refs创建
Refs使用React.createRef()创建，并通过ref属性附加到React元素中.
```javascript
class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
  }

  render() {
    return <div ref={this.myRef} />;
  }
}

```

# 访问Refs
ref的值根据节点的类型有所不同：
- 当ref属性用于HTML元素时，ref接收底层DOM元素作为其current属性
- 当ref属性用于自定义class组件时，ref对象接收组件的挂载实例作为current属性
- 不能在函数组件上使用ref属性，因为他们没有实例。

```javascript
class CustomTextInput extends React.Component {
  constructor(props) {
    super(props);
    // 创建一个 ref 来存储 textInput 的 DOM 元素
    this.textInput = React.createRef();
    this.focusTextInput = this.focusTextInput.bind(this);
  }

  focusTextInput() {
    // 直接使用原生 API 使 text 输入框获得焦点
    // 注意：我们通过 "current" 来访问 DOM 节点
    this.textInput.current.focus();
  }

  render() {
    // 告诉 React 我们想把 <input> ref 关联到
    // 构造器里创建的 `textInput` 上
    return (
      <div>
        <input
          type="text"
          ref={this.textInput} />
        <input
          type="button"
          value="Focus the text input"
          onClick={this.focusTextInput}
        />
      </div>
    );
  }
}

```
**React会在组件挂载时给current属性传入DOM元素，并在组件卸载时传入Null值。ref会在componentDidMount或者componentDidUpdate声明周期钩子触发前更新。**

为class组件添加Ref:  
如果我们想包装上面的 CustomTextInput，来模拟它挂载之后立即被点击的操作，我们可以使用 ref 来获取这个自定义的 input 组件并手动调用它的 focusTextInput 方法：
```javascript
class AutoFocusTextInput extends React.Component {
  constructor(props) {
    super(props);
    this.textInput = React.createRef();
  }

  componentDidMount() {
    this.textInput.current.focusTextInput();
  }

  render() {
    return (
      <CustomTextInput ref={this.textInput} />
    );
  }
}

```

不能在函数组件上使用ref属性，因为没有实例：
```javascript
function MyFunctionComponent() {
  return <input />;
}

class Parent extends React.Component {
  constructor(props) {
    super(props);
    this.textInput = React.createRef();
  }
  render() {
    // This will *not* work!
    return (
      <MyFunctionComponent ref={this.textInput} />
    );
  }
}

```
虽然不能再函数组件上使用ref属性，但是可以再函数组件内部使用ref属性，只要它指向一个DOM元素或者class组件.

# 另一种Refs设置方式(回调Refs)
不同于传递 createRef() 创建的 ref 属性，你会传递一个函数。这个函数中接受 React 组件实例或 HTML DOM 元素作为参数，以使它们能在其他地方被存储和访问

```javascript
class CustomTextInput extends React.Component {
  constructor(props) {
    super(props);

    this.textInput = null;

    this.setTextInputRef = element => {
      this.textInput = element;
    };

    this.focusTextInput = () => {
      // 使用原生 DOM API 使 text 输入框获得焦点
      if (this.textInput) this.textInput.focus();
    };
  }

  componentDidMount() {
    // 组件挂载后，让文本框自动获得焦点
    this.focusTextInput();
  }

  render() {
    // 使用 `ref` 的回调函数将 text 输入框 DOM 节点的引用存储到 React
    // 实例上（比如 this.textInput）
    return (
      <div>
        <input
          type="text"
          ref={this.setTextInputRef}
        />
        <input
          type="button"
          value="Focus the text input"
          onClick={this.focusTextInput}
        />
      </div>
    );
  }
}

```

React 将在组件挂载时，会调用 ref 回调函数并传入 DOM 元素，当卸载时调用它并传入 null。在 componentDidMount 或 componentDidUpdate 触发前，React 会保证 refs 一定是最新的。


你可以在组件间传递回调形式的 refs，就像你可以传递通过 React.createRef() 创建的对象 refs 一样。

```javascript
function CustomTextInput(props) {
  return (
    <div>
      <input ref={props.inputRef} />
    </div>
  );
}

class Parent extends React.Component {
  render() {
    return (
      <CustomTextInput
        inputRef={el => this.inputElement = el}
      />
    );
  }
}


```
# 使用useRef创建ref对象
```javascript
const refContainer = useRef(initialValue);

```
useRef 返回一个可变的ref对象，其.current属性被初始化为传入的参数，返回的ref对象在组件的整个生命周期内保持不变。

```javascript
import { useRef } from 'react';

function TextInputWithFocusButton() {
  cosnt inputEl = useRef(null);
  cosnt onButtonClick = () => {
    inputEl.current.focus();
  };
  return (
    <>
      <input ref={inputEl} type="text" />
      <button onClick={onButtonClick}>Focus the input</button>
    </>
  )
}

```
那么useRef和createRef有什么差别呢？
- createRef可以在函数式、类组件内使用
- useRef由于是hook，只能在函数式组件内使用

它们还有什么差别？
> useRef在react hook中的作用，就像一个变量，类似于this，可以存放任何东西，所以useRef每次渲染时，都会返回相同的引用。而createRef每次渲染都会返回一个新的引用（每次都会调用createRef来创建）。

```javascript
import React, {useState, useRef, createRef} from 'react';
const Rerender = () => {
  const [renderIndex, setRenderIndex] = useState(1);
  const refFromUseRef = useRef();
  const refFromCreateRef = createRef();

  if(!refFromUseRef.current) {
    refFromUseRef.current = renderIndex;
  }

  if(!refFromCreateRef.current) {
    refFromCreateRef.current = renderIndex;
  }

  return (
    <>
      <p>Current render index: {renderIndex}</p>
      <p>
        <b>refFromUseRef</b> value: {refFromUseRef.current}
      </p>
      <p>
        <b>refFromCreateRef</b> value: {refFromCreateRef.current}
      </p>
      <button onClick={() => setRenderIndex((pre) => pre + 1)}>re-render</button>
    </>
  )
}

```
**点击Button，可以看到使用createRef创建的对象一直在改变，因为每次渲染都会创建新的引用，而useRef一直指向相同的引用，就像对象实例内函数的this变量一样，一直指向某一个引用。所以useRef的作用是创建一个不会改变引用的对象。可以不仅仅用来保存ref**

ref对象内容发生变化的时候，useRef不会通知你，变更.current属性不会引发组件重新渲染。如果想要在React绑定或者解绑DOM节点ref时运行某些代码，需要使用回调ref来实现。

# 使用callback hook来实现回调ref


# 纯函数
一个函数的返回结果只依赖于它的参数，并且在执行过程里面没有副作用，我们就叫这个函数为纯函数。
- 函数的返回结果只依赖于它的参数
- 函数执行过程里面没有副作用
```javascript
const a = 1;
const foo = (b) => a + b;
foo(2);

```
foo函数不是一个纯函数，因为它返回的结果依赖于外部变量a，我们在不知道a的值的情况下，并不能保证foo(2)返回值是3，它的返回值是不可预料的。

```javascript
const foo= (a, b) => a + b;
foo(1, 2); //3
```
现在foo的返回结果只依赖于它的参数a和b。对于同样的入参，输出一定相同。这就满足纯函数的第一个条件，一个函数的返回结果只依赖于它的参数。

假设有以下函数:
```javascript
const a = 1
const foo = (obj, b) => {
  obj.x = 2
  return obj.x + b
}
const counter = { x: 1 }
foo(counter, 2) // => 4
counter.x // => 2
```
foo函数的执行对外部的counter产生了影响，它产生了副作用，修改了外部传进来的对象，所以它是不纯的。**如果函数修改的是内部构件的变量，然后对数据进行的修改不是副作用。**
```javascript
const foo = (b) => {
  const obj = { x: 1 };
  obj.x = 2;
  return obj.x + b;
}

```
除了修改外部的变量，一个函数在执行过程中还有很多方式可以产生副作用，例如发送Ajax请求，调用DOM API修改页面，甚至console.log也算是副作用。

为什么要煞费苦心的构建纯函数？ 因为纯函数非常靠谱，执行一个函数你不用担心它产生什么副作用，产生不可预料的行为。不管什么情况下，同样的入参都会输出相同的记过。如果你的应用程序大多数函数都是由纯函数组成，那么你的程序测试、调试起来会非常方便。

# context
Context提供了一种在组件之间共享值的方式，不必显式的通过组件数逐层传递props。
1. 创建Context
2. 订阅Context变化
3. 消费Context

## 创建context
```javascript
const MyContext = React.createContext(defaultValue);

```

在默认情况下，Context会在React DevTools中显示为Context.Provider和Context.Consumer。
![](https://tva1.sinaimg.cn/large/0081Kckwly1gkj1bl8yqrj30fi03k74f.jpg)

为了区分每个Context的命名，可以使用displayName属性：
```javascript
MyContext.displayName = 'ThemeContext';
```

使用后的效果：
![](https://tva1.sinaimg.cn/large/0081Kckwly1gkj1chhv92j30do034aa8.jpg)


使用hook创建context
```javascript

```

## 订阅Context变化
每个Context对象都会返回一个Provider组件，它允许消费组件订阅Context的变化。  
Provider接受一个value属性，传递给消费组件。一个Provider可以和多个消费组件有对应关系，多个Provider也可以嵌套使用，里层的会覆盖外层的数据。

```javascript
<MyContext.Provider value={/* 某个值 */}>
```

## 消费Context
### contextType类组件消费
```javascript
class MyClass extends React.Component {
  /* 任何生命周期 */
  componentDidMount() {
    let value = this.context;
  }
  render() {
    let value = this.context;
  }
}
MyClass.contextType = MyContext;

```
如果使用static语法，可以简化为：
```javascript
class MyClass extends React.Component {
  static contextType = MyContext;
}

```

### 使用Consumer组件消费
如果想在函数式组件消费，可以使用Consumer组件。
```javascript
<MyContext.Consumer>
  {value => ReactNode}
</MyContext.Consumer>
```
这种方法需要一个函数作为子元素，这个函数接受当前的context值。并返回一个React节点。

## 动态的Context
Context的消费值(值是一个引用，不会改变，准确来说是Context的消费值)由defaultValue和Provider上的value决定，如果Provider上的value改变，则Context的消费值也会跟着改变。利用这一点，我们可以修改Context的消费值（在Provider作用域之下）。
```javascript
import React , { createContext, useState } from 'react';
enum Theme {
  Light = 'light',
  Dark = 'dark'
}
const ThemeContext = createContext(Theme.Dark);
const Parent: React.FC<{}> = props => {
  const [state, setState] = useState(theme.Light);
  const changeStateHanlder = () => {
    setState((preState) => {
      return preState === theme.Dark ? theme.Light : theme.Dark;
    });
  };

  return (
    <>
      <ThemeContext.Provider value={ state }>
        <Child onClick={ changeStateHanlder } />
      </ThemeContext.Provider>
    </>
  );
};

interface ChildProps {
  [props: string]: any;
};

const Child:React.FC<ChildProps> = props => {
  return (
    <ThemeContext.Consumer>
      { 
        value => (
          <button {...props}>{value}</button>
        )
      }
    </ThemeContext.Consumer>
  )
}

```
这种方式需要逐层传递改变Context的方法，为了在嵌套组件中更新Context，我们可以把改变Context的方法也放到Context中：
```javascript
...
const ThemeContext = React.CreateContext({
  theme: Theme.Light,
  toggleTheme: () => {}
});

const Parent: React.FC<{}> = props => {
  const [state, setState] = useState(theme.Light);
  const changeStateHanlder = () => {
    setState((preState) => {
      return preState === theme.Dark ? theme.Light : theme.Dark;
    });
  };

  return (
    <>
      <ThemeContext.Provider value={{
        theme: state,
        toggleTheme: changeStateHanlder
      }}>
        <Child />
      </ThemeContext.Provider>
    </>
  );
};

...

const Child:React.FC<ChildProps> = props => {
  return (
    <ThemeContext.Consumer>
      { 
        value => (
          <button onClick={value.toggleTheme}>{value.theme}</button>
        )
      }
    </ThemeContext.Consumer>
  )
}

```

## 消费多个Context
```javascript
const ThemeContext = React.CreateContext({
  theme: Theme.Light,
  toggleTheme: () => {}
});
const UserContext = React.createContext({
  username: 'johe',
  toggleName: () => {}
})

const Parent: React.FC<{}> = props => {
  const [state, setState] = useState(theme.Light);
  const [user, setUser] = useState('johe'); 
  const changeStateHanlder = () => {
    setState((preState) => {
      return preState === theme.Dark ? theme.Light : theme.Dark;
    });
  };
  const userHandler = () => {
    setUser((preState) => {
      return preState === 'johe' ? 'xjj' : 'johe';
    })
  }

  return (
    <>
      <ThemeContext.Provider value={{
        theme: state,
        toggleTheme: changeStateHanlder
      }}>
        <UserContext.Provider value={{
          username: user,
          toggleName: userHandler
        }}>
          <Child />
        </UserContext.Provider>
      </ThemeContext.Provider>
    </>
  );
};

...

const Child:React.FC<ChildProps> = props => {
  return (
    <ThemeContext.Consumer>
      { 
        value => (
          <UserContext.Consumer>
          {
            user => (
              <button onClick={value.toggleTheme}>{value.theme}</button>
              <button onClick={user.toggleName}>
              {user.username}</button>
            ) 
          }
          </UserContext.Consumer>
        )
      }
    </ThemeContext.Consumer>
  )
}


```

# 错误边界
部分 UI 的 JavaScript 错误不应该导致整个应用崩溃，为了解决这个问题，React 16 引入了一个新的概念 —— 错误边界。

错误边界是一种 React 组件，这种组件可以捕获并打印发生在其子组件树任何位置的 JavaScript 错误，并且，它会渲染出备用 UI，而不是渲染那些崩溃了的子组件树。错误边界在渲染期间、生命周期方法和整个组件树的构造函数中捕获错误。

> 如果一个 class 组件中定义了 static getDerivedStateFromError() 或 componentDidCatch() 这两个生命周期方法中的任意一个（或两个）时，那么它就变成一个错误边界。当抛出错误后，请使用 static getDerivedStateFromError() 渲染备用 UI ，使用 componentDidCatch() 打印错误信息。

```javascript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 你同样可以将错误日志上报给服务器
    logErrorToMyService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // 你可以自定义降级后的 UI 并渲染
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children; 
  }
}

<ErrorBoundary>
  <MyWidget />
</ErrorBoundary>
```

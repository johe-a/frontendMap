# 前言
本文通过[build-your-own-react](https://pomb.us/build-your-own-react/)的博客。来理解`React`的术语、以及基本实现思路。

> 博客的目的是一步步重写`React`，遵循真实的`React`代码结构，但忽略所有的优化和非必要的功能。
> 注意这个博客是基于`React16.8`，所以包含了`React Hooks`并且没有任何类组件相关的内容。

创建一个`React`所需要的所有步骤如下：
1. `createElement` Function
2. `render` Function
3. Concurrent Mode（并发模式）
4. Fibers（Fiber，虚拟DOM）
5. Render and Commit Phases
   1. render确认需要渲染的DOM
   2. commit提交渲染
6. Reconciliation（协调）
7. Function Components
8. Hooks


# Step Zero: Review
回顾一些基础的概念，我们将使用原生的`Javascript`来实现以下`React`的基础代码。
1. 定义`React Element`
2. 获取`DOM`
3. 渲染`React Element`到`DOM`节点上
```javascript
const element = <h1 title="foo">Hello</h1>;
const container = document.getElementById("root");
ReactDOM.render(element, container);
```
在第一行，我们通过`JSX`定义了`React Element`，这不是标准的`Javascript`语法，所以我们需要替换`JSX`为合法的`JS`。

> `JSX`转化为`JS`，是通过构建工具例如`babel`转换的，转换过程往往很简单。替换代码中的标签，调用`createElement`函数，将标签名、属性、以及`children`作为参数。

```javascript
const element = React.createElement(
  "h1",
  {
    title: "foo",
  },
  "Hello"
)
```
一个`JSX Element`，是一个对象并且包含`type`和`props`（实际上有更多属性，但我们现在只关注这两个）
```javascript
const element = {
  type: "h1",
  props: {
    title: "foo",
    children: "Hello"
  }
}
```
> `type`是一个字符串描述了我们想创建的`DOM`节点，它是我们传递给`document.createElement`的`标签名`，也可以是一个函数，这将会在后面提到。`props`是另一个对象，包含了`JSX`属性的键值对，还包含了一个确切的属性`children`。`children`在上文中是一个字符串，但它通常应该作为一个数组，包含更多的`JSX Element`。

另一个需要我们替换的`React`代码，`render`方法是`React`更改`DOM`节点的地方，我们接下来将自己实现它。
```javascript
ReactDOM.render(element, container);
```
首先我们使用`element`的类型来创建`node`节点，然后赋值所有的`element`属性到`node`上。
> 为了避免混淆，接下来`element`都用来指定`React elements`，`node`用来指定`DOM elements`
```javascript
const element = {
  type: "h1",
  props: {
    title: "foo",
    children: "Hello",
  }
}

const node = document.createElement(element.type);
node["title"] = element.props.title;

const text = document.createTextNode("");
text["nodeValue"] = element.props.children;

node.appendChild(text);
container.appendChild(node);
```
使用`textNode`节点而不是设置`innerText`，可以让我们一视同仁的处理所有的`element`。注意我们使用了`nodeValue`来设置`textNode`的值，就像我们设置`h1`节点的`title`一样，这种表现就像我们拥有这样的对象描述：`props: {nodeValue: "hello"}`

# Step one: The CreateElement
让我们从一个新的应用开始，这次我们将替换`React`代码为我们创建的`React`版本。

从写`createElement`方法开始。我们将转换`JSX`为`JS`。
```javascript
const element = (
  <div id="foo">
    <a>bar</a>
    <b />
  </div>
);
const container = document.getElementById("root");
ReactDOM.render(element, container);
```
`JSX`是`React.createElement`的语法糖
```javascript
const element = React.createElement(
  "div",
  {
    id: "foo"
  },
  React.createElement(
    "a",
    null,
    "bar"
  ),
  React.createElement(
    "b"
  )
)
```
就像我们上一步提交到的，一个`React Element`就是一个包含`type`和`props`的对象。`createElement`唯一需要做的事情就是创建这个对象。

```javascript
// 例如，`createElement("div")`返回：
{
  "type": "div",
  "props": {
    "children": []
  }
}
// createElement("div", null, a)
{
  "type": "div",
  "props": {
    "children": [a]
  }
}
```
所以我们的`createElement`的实现如下：
```javascript
function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: []
    }
  }
}

function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map(child => typeof child === 'object' ? child : createTextElement(child)),
    }
  }
}
```
`children`数组可以会包含基本数据类型，例如`string`或者`number`。但我们还是将所有的`element`包裹为一个对象，创建一个独特的`TEXT_ELEMENT`类型给它们。

> `React`并不会包裹基本数据类型或者在没有`children`的情况下创建空数组，这里我们这样做是因为可以简化代码。在这个教程中更倾向于简单的代码而不是高性能代码。

我们现在仍然在使用`React`的`createElement`，为了将其替换，我们给自己的库一个命名，叫做`Didact`:
```javascript
const Didact = {
  createElement,
}

const element = Didact.createElement(
  "div",
  {id: "foo"},
  Didact.createElement("a", null, "bar"),
  Didact.createElement("b")
);
```
但是，为了使用`JSX`，我们需要告诉`babel`使用`Didact`的`createElement`而不是`React`的`createElement`去转换`JSX`。  
> 如果我们使用`@jsx`注释，`babel`编译到`JSX`则会使用我们定义的`function`
```javascript
/** @jsx Didact.createElement */
const element = (
  <div id="foo">
    <a>bar</a>
    <b />
  </div>
);
```

# Step two: The render Function
接下来，我们将写`ReactDOM.render`方法。  
现在，我们只关注新增内容添加到`DOM`里面，后面我们会处理更新和删除。
```javascript
function render(element, container) {
  // TODO create dom nodes
}

const Didact = {
  createElement,
  render,
}

Didact.render(element, container);
```
我们通过`element`描述对象的`type`创建`DOM`，然后添加`node`到`container`内，并且递归这一过程
```javascript
function render(element, container) {
  const dom = document.createElement(element.type);
  element.props.children.forEach(child => render(child, dom));
  container.appendChild(dom);
}
```
我们还需要处理文本`element`，当我们遇到`TEXT_ELEMENT`的时候：
```javascript
function render(element, container) {
  const dom = element.type === "TEXT_ELEMENT" ? document.createTextNode("") : document.createElement(element.type);
  ...
}
```
最后一件事，我们需要将`element`的`props`赋值给`node`:
```javascript
function render(element, container) {
  const dom = element.type === "TEXT_ELEMENT" ? document.createTextNode("") : document.createElement(element);
  const isProperty = key => key !== "children";
  Object.keys(element.props)
    .filter(isProperty)
    .forEach(prop => dom[prop] = element.props[prop]);
  element.props.children.forEach((child) => render(child, dom));
  container.appendChild(dom);
}
```
完整代码请看[codesandbox](https://codesandbox.io/s/didact-2-k6rbj)

# step three: Concurrent Mode
但是...在我们继续添加更多代码之前，我们需要重构代码。

> 问题出现在我们调用的递归。
> 一旦我们开始渲染，我们将无法停止，直到我们将整颗`element tree`渲染完毕。
> 如果这个树过大，将会阻塞主线程太长时间。
> 当浏览器需要做一些高优先级的任务时，例如处理用户输入，或者保持动画的平滑过度，则必须等待这棵树渲染完毕。
```javascript
function render(element, container) {
  ...
  element.props.children.forEach(child => render(child, dom));
  ...
}
```
所以我们需要拆散这个渲染过程为一个个小的单元，当我们完成每一个小单元的渲染时，让浏览器打断这个渲染过程，如果有任何高优先级的任务需要处理的时候。

我们使用`requestIdleCallback`去创建一个循环，可以将`requestIdleCallback`想象为`setTimeout`，但跟`setTimeout`不同的是，我们不用告诉`requestIdleCallback`什么时候去执行，浏览器将会运行`requestIdleCallback`，当浏览器的主线程处于空闲状态的时候。
```javascript
let nextUnitOfWork = null;

// 执行一个渲染循环
function workLoop(deadline) {
  // 存储主线程是否空闲的状态
  let shouldYield = false;
  // 当且仅当主线程空闲，并且有任务需要执行的时候，进入循环
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(
      nextUnitOfWork
    );
    shouldYield = deadline.timeRemaining() < 1;
  }
  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

// 执行并返回下一个任务
function performUnitOfWork(nextUnitOfWork) {
  // TODO
}
```

> `React`不再使用`requestIdleCallback`，现在使用[`scheduler`](https://github.com/facebook/react/tree/main/packages/scheduler)包。在这个例子中，他们在概念上是一样的。

> `requestIdleCallback`的回调中会有一个`IdleDeadline`对象，这个对象描述了还有多少空闲时间剩余(通过调用timeRemaining()，单位为ms)，以及这个回调是否已经被执行(didTimeout，当传递了超时参数的情况下才会有)。具体查看[MDN](https://developer.mozilla.org/en-US/docs/Web/API/IdleDeadline)

`requestIdleCallback`的回调中有一个`IdleDeadline`对象，我们可以通过这个对象来确认浏览器需要再次获得控制权的剩余时间。

> 为了开始这个循环，我们需要设置第一个工作单元(nextUnitWork)。然后写`performUnitOfWork`这个函数，这个函数不仅执行单元工作，还返回下一个单元的工作。

# step four: Fibers
为了组织工作单元，我们需要一个数据结构:`fiber tree`

每一个`element`将会有一个对应的`fiber`，并且每个`fiber`都会是一个工作单元。

假设我们将要渲染如下的`element tree`:
```javascript
Didact.render(
  <div>
    <h1>
      <p />
      <a />
    </h1>
    <h2 />
  </div>,
  container
);
```
可以看到我们的`Fiber Tree`将是这样的：
![fiber tree](https://pomb.us/static/a88a3ec01855349c14302f6da28e2b0c/d3fa7/fiber1.png)

> 在`render`方法中，我们将创建`root fiber`并且将其设置为第一个`nextUnitOfWork`。
> 然后接下来的工作将会发生在`performUnitOfWork`函数，在这个函数内，我们将为每个`fiber`做三件事情:
> 1. 添加当前`element`到`DOM`中
> 2. 创建`element`的`children`为对应的`fibers`
> 3. 选择下一个工作单元

> 为什么需要`fiber tree`这种数据结构？因为它可以帮助我们更容易找到下一个工作单元。这也就是为什么`fiber`数据结构存储了第一个子节点、兄弟节点、以及父节点的地址。
![fiber tree with link](https://pomb.us/static/c1105e4f7fc7292d91c78caee258d20d/d3fa7/fiber2.png)

`fiber`工作的执行，遵循深度优先遍历(DFS)：
- 当我们完成一个`fiber`的工作的执行，如果它有`child`，则`child`的`fiber`将会作为下一个执行单元。在我们的例子中，当我们执行完`div`的`fiber`工作后，下一个执行单元将会是`h1`的`fiber`。
- 如果`fiber`没有`child`，将使用`sibling`兄弟`fiber`作为下一个执行单元。例如，`p`的`fiber`没有`child`，所以`a`作为兄弟`fiber`是下一个执行单元。
- 如果`fiber`没有`child`也没有`sibling`，那么下一个执行单元将会是`uncle`，`uncle`是`parent`的`sibling`兄弟`fiber`。例如`a`和`h2`的`fibers`之间的关系。
- 如果`parent`也没有`sibling`，那么将继续向上寻找，直到找到祖先`fiber`具有`sibling`属性，或者到`root`的`fiber`。如果我们已经向上寻找到`root`。说明我们已经完成了这次`render`的所有的工作单元执行。

接下来，我们把这些理念一步步的用代码实现。

首先我们删除`render`函数中的代码，将创建一个`DOM`节点的方法剥离，在后面我们将会用到：
```javascript
function createDom(fiber) {
  const dom = fiber.type === 'TEXT_ELEMENT' ? document.createTextNode("") : document.createElement(fiber.type);
  const isProperty = key => key !== 'children';
  fiber.props.children.filter(isProperty).forEach(name => dom[name] = fiber.props[name]);
  return dom;
}

function render(element, container) {
  // TODO set next unit of work
}
```
在`render`函数内部，我们设置`nextUnitOfWork`为`fiber tree`的根节点

```javascript
function render(element, container) {
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [element],
    }
  }
}
let nextUnitOfWork = null;

```
然后，当浏览器处于空闲的时候，将会调用我们的工作循环函数`workLoop`，然后我们将会从`root fiber`开始工作。
```javascript
function workLoop(deadline) {
  ...
  while(nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(
      nextUnitOfWork
    )
  }
  ...
}

function performUnitOfWork(fiber) {
  // TODO add dom node
  // TODO create new fibers
  // TODO return next unit of work
}

```
接下来的重点就是如何执行单元工作，即`performUnitOfWork`的实现。
1. 首先我们将创建一个DOM节点并且添加到它的父级，并且将DOM放置在`fiber`的`dom`属性上方便追踪
```javascript
function performUnitOfWork(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  if (fiber.parent) {
    fiber.parent.dom.appendChild(fiber.dom);
  }

  // TODO create new fibers
  // TODO return next unit of work
}

```
2. 然后为每一个子级创建新的`fiber`，注意是创建`fiber`，而不是DOM
```javascript
function performUnitOfWork(fiber) {
  ...
  const elements = fiber.props.children;
  let index = 0;
  let prevSibling = null;
  while (index < elements.length) {
    const element = elements[index];
    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
    }
  }
  ...
}
```
3. 根据`fiber`的位置来设置`child`或者`sibling`属性。
```javascript
function performUnitOfWork(fiber) {
  ...
  let prevSibling = null;
  while (index < elements.length) {
    const element = elements[index];
    const newFiber = {
      dom: null,
      props: element.props,
      type: element.type,
      parent: fiber,
    };
    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }
    prevSibling = newFiber;
    index++;
  }
  ...
}

```
4. 根据深度优先遍历，寻找下一个执行单元，首先我们尝试`child`，然后`sibling`，最后在往上找`uncle`，或者祖先的兄弟元素等等。
```javascript
function performUnitOfWork(fiber) {
  ...
  // return next unit of work
  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
  while(nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
}

```
这就完成了我们的`performUnitOfWork`:
```javascript
function performUnitOfWork(fiber) {
  // 1.创建当前fiber的DOM
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  // 如果有父fiber,添加当前DOM到node中
  if (fiber.parent) {
    fiber.parent.dom.appendChild(fiber.dom);
  }
  // 2.为其child生成fibers
  const elements = fiber.props.children;
  let index = 0;
  // 记录上一个兄弟节点
  let prevSibling = null;
  while(index < elements.length) {
    const element = elements[index];
    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
    }
    // 下标为0的记录为当前fiber的子fiber
    if (index === 0) {
      fiber.child = newFiber;
    } else {
      // 下标不为0，将上一个兄弟节点的sibling设置为当前fiber
      prevSibling.sibling = newFiber;
    }
    // 更新当前fiber为上一个兄弟节点
    prevSibling = newFiber;
    index++;
  }
  // 3. 寻找下一个执行单元fiber,遵循深度优先遍历的规则
  if (fiber.child) {
    return fiber.child;
  }
  let curFiber = fiber;
  while(curFiber) {
    if (curFiber.sibling) {
      return curFiber.sibling;
    }
    curFiber = curFiber.parent;
  }
}
```

# step five: Render and Commit Phases
现在，我们有了另一个问题。  
在每一次执行单元工作`performUnitOfWork`的时候，我们都会添加一个新的`node`节点到`DOM`中。请记住，因为我们的`performUnitOfWork`是在浏览器空闲时间执行的，所以浏览器会中断我们的渲染工作，在整个`fiber tree`渲染完成之前。  
在这种情况下，用户将会看到不完整的`UI`，这是我们不想看到的。

所以我们需要将`performUnitOfWork`中操作`DOM`的部分删除。
```javascript
function performUnitOfWork(fiber) {
  // delete
  if (fiber.parent) {
    fiber.parent.dom.appendChild(fiber.dom);
  }
}

```
我们将记录`fiber tree`的根，我们称之为`work in progress root`或者`wipRoot`.
```javascript
function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    }
  }
  nextUnitOfWork = wipRoot;
}

let wipRoot = null;

```
> 然后，只要我们完成了所有的工作单元(我们知道完成的时机，是因为没有下一个工作单元)，我们将整个`fiber tree`进行提交。

我们通过`commitRoot`函数递归的添加所有的`node`到`DOM`中：
```javascript
function commitRoot() {
  // add nodes to dom
  commitWork(wipRoot.child);
  wipRoot = null;
}

function commitWork(fiber) {
  if (!fiber) {
    return;
  }
  const domParent = fiber.parent.dom;
  domParent.appendChild(fiber.dom);
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

...
function workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  // all unit work finish
  if (!nextUnitOfWork && wipRoot) {
    // commit all nodes to dom
    commitRoot()
  }
  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);
...
```

# step six: Reconciliation
到目前位置，我们成功添加了内容到`DOM`中，但是关于更新和删除`nodes`我们还没做到。

> 这就是我们接下来要去做的，我们需要**对`render`函数接收的`elements`与上一次提交到`DOM`的`fiber tree`进行比较。**
> 所以我们需要保存上一次提交到`DOM`的`fiber tree`引用，将其称为`currentRoot`
> 并且添加`alternate`属性给每一个`fiber`,这个属性用来链接旧的`fiber`。

```javascript
function commitRoot() {
  commitWork(wipRoot.child);
  // save
  currentRoot = wipRoot;
  wipRoot = null;
}
...
function render(element, container) {
  // new wipRoot
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    // save last commit fiber root
    alternate: currentRoot,
  }
  nextUnitOfWork = wipRoot;
}

let nextUnitOfWork = null;
let currentRoot = null;
let wipRoot = null;
...

```
接下来，我们抽取`performUnitOfWork`中创建新`fibers`的代码到`reconcileChildren`函数。
```javascript
function performUnitOfWork(fiber) {
  // create dom
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  // extract add fibers to reconcileChildren
  const elements = fiber.props.children;
  reconcileChildren(fiber, elements);
  // next fiber
  if(fiber.child) {
    return fiber.child
  }
  let nextFiber = fiber;
  while(nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent;
  }
}

function reconcileChildren(wipFiber, elements) {
  
}

```
> 在`reconcileChildren`函数中，我们需要`reconcile`协调旧的`fiber tree`和新的`elements`。
> 我们同时迭代旧的`fiber tree`(wipFiber.alternate)的孩子和当前`elements`(之所以叫elements是因为还没生成fiber)。

```javascript
function reconcileChildren(wipFiber, elements) {
  let index = 0;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  let prevSibling = null

  while(
    index < elements.length || oldFiber != null
  ) {
    const element = elements[index];
    // TODO compare oldFiber to element
  }
}

```
上面这段代码最关键的部分就是`oldFiber`和`element`。`element`是我们想要渲染到`DOM`的东西，而`oldFiber`是我们上一次已经渲染的`fiber`。  
我们需要比较它们，来得到应用于DOM的变化。

**没有Key的情况下比较流程:**
-  如果旧的`fiber`以及新的`element`具有相同的标签`type`，我们只需要保持`DOM`节点并且更新它的属性
-  如果标签类型不一样，则意味着有一个新的`element`，我们需要创建新的`DOM`节点。
-  如果标签类型不一致，并且存在旧的`fiber`,这意味着要删除旧的`DOM`节点。
> 注意，`React`会优先比较相同`key`的元素，这样会有更好的性能，例如孩子节点之间仅仅是替换位置，这种情况在相同`key`的条件下只需要替换位置而不需要`删除`或者`更新`节点。另外，标签类型不一样，可能是新的`element`在对应位置新增了元素，也可能是删除了元素。所以这里`标签类型不一样`包含了多种情况。

```javascript
function reconcileChildren(wipFiber, elements) {
  let index = 0;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  let prevSibling = null

  while(
    index < elements.length || oldFiber != null
  ) {
    const element = elements[index];
    // TODO compare oldFiber to element
    const sameType = 
      oldFiber &&
      element &&
      oldFiber.type === element.type;

    if (sameType) {
      // TODO update the node 
    }
    if (element && !sameType) {
      // TODO add this node
    }
    if (oldFiber && !sameType) {
      // TODO delete the oldFiber's node
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      wipFiber.child = newFiber;
    } else if(element) {
      prevSibling.sibling = newFiber;
    }
    prevSibling = newFiber;
    index++;

  }
}

```
当旧的`fiber`与新的`element`之前拥相同的标签`type`，我们会创建一个新的`fiber`保留旧的`fiber`的`DOM`，并传递新的`element`的属性。
> 这里我们需要一个新的属性`effectTag`，来标记更新，我们将会在`commit`阶段用到
```javascript
if (sameType) {
  newFiber = {
    type: oldFiber.type,
    props: element.props,
    dom: oldFiber.dom,
    parent: wipFiber,
    alternate: oldFiber,
    effectTag: "UPDATE",
  }
}
```
当标签类型不一致，但存在新的`element`的时候，需要新增`fiber`去替换旧的`fiber`，所以这里的`effectTag`设置为`PLACEMENT`
```javascript
if (element && !sameType) {
  newFiber = {
    type: element.type,
    props: element.props,
    dom: null,
    parent: wipFiber,
    alternate: null,
    effectTag: "PLACEMENT",
  }
}

```
当标签类型不一样，但旧的`fiber`存在的时候需要执行删除，这时候由于没有新的`element`，所以我们将`effectTag`设置在旧的`fiber`上。
> 当我们提交正在执行的`fiber root`的时候，没有旧的`fibers`信息，所以我们需要使用一个数组来保存删除的`nodes`。
```javascript
function render(element, container) {
  ...
  deletions = [];
  ...
}
...
let deletions = [];
...
function reconcileChildren(wipRoot, elements) {
  ...
  if (oldFiber && !sameType) {
    oldFiber.effectTag = "DELETION";
    deletions.push(oldFiber);
  }
  ...
}

```
然后我们在`commit`阶段时，可以通过`deletions`数组来访问到这些`fibers`:
```javascript
function commitRoot() {
  deletions.forEach(commitWork);
  ...
}

```
接下来，改变`commitWork`函数，去处理新的`effectTags`:
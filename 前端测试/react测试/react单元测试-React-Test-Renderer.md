# 简介
[React-Test-Renderer](https://reactjs.org/docs/test-renderer.html)是官方推荐的React测试库。该库提供了一个React的渲染器，可以将React组件渲染成一个纯粹的JavaScript对象，不依赖DOM也不依赖任何运行环境（浏览器等）。特别的，该库易于我们去获取一个快照而不需要依赖任何的真实环境，这是由于我们能够将组件渲染的JS对象快速生成快照。

例如：
```javascript
import TestRenderer from 'react-test-renderer';

function Link(props) {
  return <a href={props.page}>{props.children}</a>;
}

const testRenderer = TestRenderer.create(
  <Link page="https://www.facebook.com/">Facebook</Link>
);

console.log(testRenderer.toJSON());
// { type: 'a',
//   props: { href: 'https://www.facebook.com/' },
//   children: [ 'Facebook' ] }

```
通过Jest的快照测试特性去自动的保存一份JSON tree的副本到文件中，然后再后续的每一次测试运行之后，检查快照是否更新。

我们可以通过JSON tree来快速找到要操作的目标元素，但很多时候，组件本身是不渲染的。例如以下的`SubComponent`:
```javascript

import TestRenderer from 'react-test-renderer';

function MyComponent() {
  return (
    <div>
      <SubComponent foo="bar" />
      <p className="my">Hello</p>
    </div>
  )
}

function SubComponent() {
  return (
    <p className="sub">Sub</p>
  );
}

const testRenderer = TestRenderer.create(<MyComponent />);
const testInstance = testRenderer.root;

expect(testInstance.findByType(SubComponent).props.foo).toBe('bar');
expect(testInstance.findByProps({className: "sub"}).children).toEqual(['Sub']);

```
但`React-Test-Renderer`提供了`findByType`方法，只要我们传入需要查询的组件函数，就可以找到JSON tree中不存在的组件。例如上例子的`SubComponent`，并且可以通过`props`属性来访问到传递给组件的参数。然后我们可以浏览查询结果，找到具体的元素来进行断言。

# api
## TestRenderer
- create(): 接收一个组件，创建一个TestRenderer的实例（TestRenderer instance）
- act(): 执行异步操作，任何引起组件更新的操作都要在act内进行
React-Test-Renderer是遵循Arrange-Action-Assert的3A测试方式的，Arrange代表我们的准备阶段，通常是mock。Action就是执行操作，包裹在TestRenderer.act()内部。Assert就是断言，通常使用jest的expect来进行断言。

## TestRenderer Instance
由TestRenderer.create()创建得出的实例，拥有以下属性和方法：
- testRenderer.toJSON()
- testRenderer.toTree()
- testRenderer.update()
- testRenderer.unmount()
- testRenderer.getInstace()
- testRenderer.root

通常用到的有：
- toJSON()配合Jest的toMatchSnapshot来生成快照
- update(newComponent)更新组件实例，需要传入一个新的组件
- unmount()卸载组件实例，用于触发组件的生命周期
- root: 返回TestRenderer Instance的根对象，一般用于查找Instance中的节点用作断言或者进行某些操作

## TestRenderer Instance
由TestRenderer Instance的root属性返回或者由其他Instance通过findXXX返回。

拥有以下属性和方法：
- testRendererInstance.find()
- testRendererInstance.findByType()
- testRendererInstance.findByProps()
- testRendererInstance.findAll()
- testRendererInstance.findAllByType()
- testRendererInstance.findAllByProps()
- testRendererInstance.instance
- testRendererInstance.type
- testRendererInstance.props
- testRendererInstance.parent
- testRendererInstance.children

通常使用到的是findXXX方法，分别有以下作用
- findByType(Component)：接受一个组件的函数，返回组件的TestRenderer Instance
- findByProps(props): 接受一个props对象，例如id或者className等，返回拥有该props的元素TestRenderer Instance

通常使用的属性：
- props: 当前Instance的参数列表

# 如何测试React组件
当我们测试一个组件的时候，我们想测试的是什么？

其实一个React组件，就是一个函数，但这个函数通常含有副作用，这些副作用通常是`useEffect`、`useCallback`、交互事件带来的。

测试函数时，**第一点，也是最基本的是测试覆盖率，也就是我们要让函数的每一行代码在测试中都能运行到，为了让函数中的每一行都运行到，我们需要满足每一个分支的条件，在函数中，分支可能是由入参决定的，而在组件中，由于存在副作用，分支可能是由副作用决定的、或者内部状态、以及入参等等，具体情况需要具体分析。**

函数运行很简单，我们只需要直接执行它，而组件需要被运行，则需要被`渲染`，我们可以通过`React-Test-Renderer`来渲染组件：
```javascript
import renderer from 'react-test-renderer';
const TestComponent: React.FC = () => (<div></div>);
renderer.create(<TestComponent />);
```

**第二点，也是最重要的功能测试，也就是我们要让函数按我们预期的执行，如何判断函数是否按预期执行？通常我们会判断这个函数在一定的输入情况下，输出是否达到我们的预期，或者我们传入的回调函数是否被正确的调用。组件同样也是函数，但组件的输出是UI，为了判断UI是否正确输出，最好的方法就是生成快照，所以我们需要快照测试。**

简单来说，测试React组件，第一点是让React组件中的每一行代码都能被运行到，为了做到这一点，我们需要将所有的useState、useEffect、useCallback、其它hook以及第三方hook全部执行一遍，这些hook的本质也是函数，为了触发他们，我们可能要修改入参、通过操作DOM触发组件行为、从外部修改Context、或者从外部修改路由等等。一些第三方hook我们也可以通过mock进行模拟。第二点，也是要借助第一点的方式，把所有影响UI输出的路径情况都跑一遍，然后判断UI输出是否符合预期。

# 测试技巧-快照测试
> 什么是快照测试？简单来说就是根据当前UI的DOM结构生成一个照片(其实就是把能够反映DOM的Object对象存储到文件中)。为什么需要快照测试？因为快照测试可以帮助我们确认UI是否按预期被改变。

我们可能会说，UI是否改变我们当然知道，并不需要这个快照，但事实常常不是如此，因为一个页面或者一个组件，通常是由多种因素来影响它的渲染的，比如这个组件可能由多个人开发，其他人改变UI可能并不会知会我们，这个时候，改变这个UI的作者，在本地时将会看到快照测试不通过，这是一种确保UI更改能够符合我们预期的手段。类似的情况还有很多，例如我们依赖的某个公共方法、第三方模块，都有可能会影响UI的快照。

一个典型的快照测试过程，是渲染一个UI组件，然后取得它当前的快照，与保存在本地的旧快照进行对比。如果这两个快照不一致，快照测试将会不通过。快照测试不通过意味着两种情况，一种是快照被预期外的事情改变，一种是快照的确需要更新。

通过React-Test-Renderer和Jest，我们可以很容易的生成一个组件快照：
```javascript
import renderer from 'react-test-renderer';
const TestComponent: React.FC = () => (<div></div>);

describe('Test TestComponent', () => {
  let testRender: renderer.ReactTestRenderer;
  it('should render correctly', async () => {
    await renderer.act(async () => {
      testRender = await renderer.create(<TestComponent />);
    });
    expect(testRender.toJSON()).toMatchSnapshot();
  })
})
 
```

一个组件的UI输出，可能会有多种，我们在测试的过程中，需要为每一种会影响UI的路径执行完毕后，为不同的UI生成快照。

# 测试技巧-动态更新组件
更新组件的方式有多种，可能是由于内部状态改变而引起的，也有可能是外部传入的参数改变引起的。通过`React-Test-Renderer`，我们可以很容易创建固定参数的组件，但是反复的创建不同参数的组件，显得有些冗余。
```javascript

import renderer from 'react-test-renderer';

type Prop = {
  editable: boolean;
}

const Input: React.FC<Props> = ({editable}) => (<input disabled={!editable}/>);
renderer.create(<Input editable={false} />);
```
如上例子，我们渲染了一个不能被编辑的`input`元素，但此时我们想要更新`editable`参数为true，使得`Input`渲染一个可以被编辑的`input`元素，要如何做呢？重新创建一个`Input`吗？显然不是，这样太麻烦了，别忘了`Input`是个组件，我们可以在外面包裹一层容器，这个容器内部的`state`会传递给`Input`组件,`state`的更新从而也引起`Input`更新。

```javascript
import renderer from 'react-test-renderer';

const TestContainer: React.FC = () => {
  const [editable, setEditable] = useState(false);
  return <Input disabled={editable}/>
};
renderer.create(<TestContainer />);

```
是不是还少了什么？我们如何引起`TestContainer`内部的`state`变化呢? 答案是我们可以通过触发组件行为：
```javascript
import renderer from 'react-test-renderer';

const TestContainer: React.FC = () => {
  const [editable, setEditable] = useState(false);
  return (
    <>
      <Input disabled={editable}/>
      <div className="btn-setEditable--toggle" onClick={() => setEditable(!editable)}></div>
    </>
  )
};

describe('Test Input Component', () => {
  it('should render correctly when editable is true', async () => {
    let testRenderer: renderer.ReactTestRenderer;
    await renderer.act(async () => {
      testRenderer = await renderer.create(<TestContainer />);
      // 点击div，引起editable改变，从而引起Input更新
      await testRenderer.root.findByProps({
        className: 'btn-setEditable--toggle'
      }).props.onClick();
    });
    // 生成可编辑的快照
    expect(testRenderer.toJSON()).toMatchSnapshot();
  });
});

```

# 测试技巧-mock组件
组件就像函数一样，函数可以调用函数，组件也可以依赖其他组件，但有时候，我们只想测试单个组件或者模拟复杂的组件，这个时候我们可以使用`jest`的`mock`来模拟组件实现。例如`mock`掉`antd`库的`Button`组件。我们首先要找到组件的路径，确认文件的输出，是默认导出还是作为部分导出。这里的`Button`，路径是`antd/lib/Button/index.js`，并且`Button`是作为成员导出：
```javascript
export const Button = xxx;
```
所以我们使用`Jest`时可以这样`mock`：
```javascript
jest.mock('antd/lib/Button/index.js', () => ({
  Button: <div></div>
}))
```

# 测试技巧-mock timer
假设我们的组件中使用到了计时器，如何让这个计时器触发？正常情况下，使用`React-Test-Renderer`渲染的组件，不会触发计时器，但我们可以借助`jest`来模拟计时器。

```javascript
jest.useFakeTimers();

// 触发计时器
jest.advanceTimersByTime(500);
```
更多的timer mock，具体查看[官网](https://jestjs.io/docs/timer-mocks)

# 测试技巧-测试依赖React-Router的组件

# 测试技巧-测试依赖Provider的组件
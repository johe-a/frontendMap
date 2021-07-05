- [简介](#简介)
- [纯函数](#纯函数)
- [减少组件重复渲染](#减少组件重复渲染)
  - [正确使用useState和useSelector](#正确使用usestate和useselector)
- [Render Props](#render-props)
# 简介
记录react高级概念和应用场景。

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

# 减少组件重复渲染
## 正确使用useState和useSelector
[减少reRender](https://medium.com/welldone-software/how-to-reduce-unnecessary-re-renders-3f840d8b2f27)，通过查看这篇文章，可以知道正确的使用useState和useSelector能够减少重复渲染。
```javascript
const App = () => {
  const [counter, setCounter] = useState(0);
  return (
    <div>
      <button onClick={() => setCounter(counter + 1)}>
        {counter}
      </button>
      <Component1 />
      <Component2 />
      <Component3 />
    </div>
  )
}

```
在App组件中，counter这个state只有Button用到了，但是在button被点击更新counter的时候，会导致state更新，state更新则导致App重新渲染，同时导致Component1、2、3都重复渲染。
> 除非Component组件在内部通过shouldComponentUpdate判断或者是通过PureComponent、React.memo创建的组件，否则会导致重新渲染

为了解决这个问题，我们可以把state的位置给移动到button组件内部。

同样的，Redux中的useSelector也适用
```javascript
const App = () => {
  const dispatch = useDispatch();
  const counter = useSelector(state => state.counter);
  return (
    <div>
      <button onClick={() => dispatch(increaseCounter())}>
        {counter}
      </button>
      <Component1 />
      <Component2 />
      <Component3 />
    </div>
  )
}
```



# Render Props
[Render Props](https://zh-hans.reactjs.org/docs/render-props.html),是一种React复用组件逻辑的方法。  
一个含有Render Props的组件模型是这样子的：
```javascript
<Component render={data => (
  <h1> Hello {data.target} </h1>
)}>

const Component = function(props) {
  const [data, setData] = useState({ target: 'target'});
  return (
    <>
      {props.render(data)}
    </>
  )
}
```
等等，这看起来有点熟悉？这感觉就像是Vue的插槽，但Vue的插槽我们在使用的过程中大多是UI层面的复用，并且传递的是组件（也可以做到组件逻辑复用），而Render Props传递的是返回组件的函数，这个函数接受参数，使得组件逻辑能够得到复用。
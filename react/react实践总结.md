- [react脚手架](#react脚手架)
  - [npx](#npx)
  - [配置位置和修改](#配置位置和修改)
- [懒加载](#懒加载)
  - [Loadable](#loadable)
  - [React.lazy](#reactlazy)
- [hook](#hook)
  - [hook顺序](#hook顺序)
  - [setState](#setstate)
    - [使用单个还是多个state](#使用单个还是多个state)
    - [循环内的setState](#循环内的setstate)
  - [useEffect](#useeffect)
    - [useEffect内函数调用作为依赖时的问题](#useeffect内函数调用作为依赖时的问题)
    - [useEffect副作用清除函数内部的引用数据类型问题](#useeffect副作用清除函数内部的引用数据类型问题)
- [受控组件问题](#受控组件问题)
# react脚手架
## npx
create-react-app总是要搭配npx使用，经过查询，如果不使用npx，我们需要找到node_modules下对应模块的bin可执行脚本去执行，但是npx可以帮助我们省略这个步骤，帮我们找到Node_modules下模块的bin自动执行：
```shell
npx create-react-app 
// 等同于
node_modules/.bin/create-react-app
```
我们可以通过npx ls查看可以执行的命令
```shell
npx ls
```
类似的同名Npm衍生命令还有：
- nrm，查看当前使用的npm镜像，切换镜像: nrm ls 、 nrm use xxx
- nvm，查看已安装的node version，也可以切换node版本：nvm ls 、nvm use node@x.x.x

## 配置位置和修改
通过CRP创建的应用，其配置存储在node_modules下的react-scripts下面，会随着react-scripts包的更新来采用最新的配置。所以不能自定义配置，为了能够定制化webpack配置，经过搜索有一下方法：
- 通过CRP提供的eject脚本导出webpack配置，但后续没办法继续使用CRP
- 通过react-app-rewired，可以帮助我们在使用CRP的情况下来使用自定义的配置。

# 懒加载

## Loadable
在路由加载中看到了Loadble组件的使用，经过查阅，发现Loadble组件可以帮助我们异步加载组件，更好的进行代码分割(组件级别)。
Loadable组件的原理：Loadable组件是一个高阶组件，它通过import()语法和react提供的componentWillMount生命周期来实现，Loadable高阶组件的实现类似如下：
```javascript
class Loadable extends React.Component {
    state = {
        ChildComponent: null
    };
    componentWillMount() {
        import('xxx/ChildComponent').then(ChildComponent => {
            this.setState({ ChildComponent });
        })
    };
    render() {
        const { ChildComponent } = this.state;
        return ChildComponent ? <ChildComponent /> : <div> loading </div>
    }
}
```
在以前使用vue的时候，会通过import()语法对路由进行异步加载，但是没有考虑过组件级别的异步加载，Loadable不仅可以实现路由级别的异步加载，也能实现组件级别的异步加载。

## React.lazy
React.lazy函数能够让你渲染一个动态import的组件，易于代码分割。
```javascript
// before
import OtherComponent from './OtherComponent';
// after
const OtherComponent = React.lazy(() => import('./OtherComponent'));
```
当这个组件被初次渲染的时候，包含这个组件的bundle(代码分割后的bundle)会被自动加载。

**`React.lazy` 接受一个函数，这个函数必须使用动态的import()，并返回一个Promise，这个Promise会Resolve一个默认导出(default export)的模块。**

懒加载的组件必须在 `Suspense` 组件内渲染，`Suspense` 组件允许我们展示Loading内容，当我们等待懒加载组件进行加载的时候。（起到一个spinner的作用）

```javascript
import React, { Suspense } from 'react';

cosnt OtherComponent = React.lazy(() => import('./OtherComponent'));

function MyComponent() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <OtherComponent>
      </Suspense>
    </div>
  )
}

```
fallback属性接受任意的 `React Element`，这个 `React Element` 将会在等待组件加载时渲染。可以将 `Suspense` 组件放置到任何懒加载组件之上，甚至可以放在多个懒加载组件之上。
```javascript
import React, { Suspense } from 'react';

const OtherComponent = React.lazy(() => import('./OtherComponent'));
const AnotherComponent = React.lazy(() => import('./AnotherComponent'));

function MyComponent() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <section>
          <OtherComponent />
          <AnotherComponent />
        </section>
      </Suspense>
    </div>
  );
}

```
当我们加载某个组件出错时，我们可能需要展示一些良好的错误提示(而不是因为抛出的错误导致程序崩溃)，我们可能需要 ***错误边界***,我们可以将错误边界放置在任何懒加载组件之上：
```javascript
import React, { Suspense } from 'react';
import MyErrorBoundary from './MyErrorBoundary';

const OtherComponent = React.lazy(() => import('./OtherComponent'));
const AnotherComponent = React.lazy(() => import('./AnotherComponent'));

const MyComponent = () => (
  <div>
    <MyErrorBoundary>
      <Suspense fallback={<div>Loading...</div>}>
        <section>
          <OtherComponent />
          <AnotherComponent />
        </section>
      </Suspense>
    </MyErrorBoundary>
  </div>
);
```

# hook
## hook顺序
对hook不能放在条件和循环语句里面一直有疑问，经过查询后，理解hook是用链表存储的，每次渲染时从链表中按顺序取到hook数据，如果每次渲染时的顺序不一样，会导致数据对不上的问题，所以react强制要求hook不能放在条件和循环语句内，来确保每次渲染hook的数目是一致的。

## setState
### 使用单个还是多个state
我们在使用useState的时候，可以通过useState去声明多个state，这和我们在类组件中使用的state不同，类组件的state通常会被声明为一个对象，所有的数据都塞到state这个对象内。
```javascript
const [width, setWidth] = useState(0);
const [height, setHeight] = useState(0);
const [left, setLeft] = useState(0);
const [top, setTop] = useState(0);
```
但我们可以像类组件一样，塞到一个state里面
```javascript
const [state, setState] = useState({
  width: 0,
  height: 0,
  top: 0,
  left: 0,
})

```
在这种情况下，我们更新state，则需要手动将之前的数据合并，因为setState会将之前的数据替换，这一点和类组件的setState不同，类组件的setState会更新到之前的this.state对象。
```javascript
setState((preState) => {
  return {
    ...preState
    left: newLeft,
    top: newTop
  }
})
```
> 如果把状态拆分的过细，代码就会变得比较冗余。如果拆分粒度过粗，代码的可复用性就会降低（自定义hook不好写），那么到底哪些state应该合并，哪些state应该拆分呢？
- 将关联的state合并为一组state，例如上文的width和height可以合并为size，left和top可以合并为position
- 将完全不相关的state拆分为多组state，例如size和position

```javascript
const [size, setSize] = useState({ width: 0, height: 0 });
const [position, setPosition] = useState({ left: 0, top: 0 });
```

### 循环内的setState
尽量不要在循环内使用setState，我们可以在循环外部拷贝一份数据，对这份数据进行更改，在循环结束后，再将数据setState:
```javascript
const Test = () => {
  const [state, setState] = useState([]);
  useEffect(async () => {
    const number = await getNumber();
    const stateTemp = [...state];
    for(let i = 0; i < number; i++) {
      /* 
        而不是setState((preState) => {
          return [
            ...preState,
            i
          ]
        })
      */
      stateTemp.push(i);
    }
    setState(stateTemp);
  }, []);
}

```

## useEffect
### useEffect内函数调用作为依赖时的问题
在完成需求仓库自动同步的时候，发现useEffect总是会自动的添加内部使用到的函数，或者不添加的时候发生警告。
```javascript 
function TestComponent() {
    const computed = () => {
        console.log('computed');
    }
    useEffect(() => {
        computed();
    });
}
```
例如上面的useEffect内部调用了computed，但是没有添加到依赖时，会有警告。这种警告是合理的，当computed在某一次渲染之后被突然改变，我们确实应该去重新调用它。但是如果我们就这样把computed加入useEffect内，又会有新的错误：
```javascript
function TestComponent() {
    const computed = () => {
        console.log('computed');
    };
    useEffect(() => {
        computed();
    }, [computed]);
}

```
这样在每次TestComponent重新渲染的时候，由于computed重复的被声明，每一次的应用都不同，会导致useEffect内的函数被重复调用。为了解决这类问题，我们首先要明确自己依赖的函数是希望它是变化的，还是不变化的。大部分情况下，函数应该是不变化的。为了保证函数不变化，我们有两种处理方式：
- 在组件外部声明函数
- 通过useCallback声明函数，useCallback声明的函数，只有在其依赖数组的时候，才会重新声明。
```javascript
function TestComponent() {
    const computed = useCallback(() => {
        console.log('computed');
    }, []);
    useEffect(() => {
        computed();
    }, [computed]);
}
// or
const computed = () => {
    console.log('computed');
}
function TestComponent() {
    useEffect(() => {
        computed();
    }, [computed]);
}

```
### useEffect副作用清除函数内部的引用数据类型问题
useEffect的return函数用作清除副作用。当useEffect内的函数被执行之后，清除副作用的函数就被确定了，所以在清除副作用的函数内调用引用类型的state，会导致无法取得最新的state，具体例子如下：
```javascript
function TestComponent() {
  const [state, setState] = useState({count: 0});
  useEffect(() => {
    return () => {
      // 永远都是0，取不到最新值
      console.log(state.count);
    }
  }, []);
  return (
    <button onClick={(e) => setState({count: state.count + 1})}>
    </button>
  )
}
```
这是由于每次setState都会更新引用，又由于闭包的作用，返回函数取到的是第一次渲染之后的引用，所以不管state如何变化，都只能取到第一次渲染之后的结果。为了解决这个问题，我们可以使用useRef，useRef确保每次渲染时的引用都不变：
```javascript
function TestComponent() {
  const [state, setState] = useState({count: 0});
  const stateRef = useRef();
  stateRef.current = state;
  useEffect(() => {
    return () => {
      console.log(stateRef.current.count);
    }
  }, []);
  return (
    <button onClick={(e) => setState({count: state.count + 1})}>
    </button>
  )
}

```
如上修改后，由于stateRef的引用一直不会改变，只是其current属性在每次渲染后被改变，所以可以取到最新值。


# 受控组件问题
受控组件通常具有value和onChange的props属性，其中value决定了受控组件的值，onChange则是受控组件改变值的唯一途径。
```javascript
interface ControlProps {
  value: string;
  onChange: () => void;
}
const TextField = (props: ControlProps) => {
  const { value, onChange } = props;
  return (
    <input value={value} onChange={e => onChange(e.target.value)}/>
  )
} 

```
通常情况下，受控组件不需要维护自己的state,除非传入的数据不满足条件，需要经过二次处理。又或者在测试阶段，受控组件的功能需要独立测试，这时候我们可以先对state进行操作，后面联调阶段再删除。
```javascript
const TextField = (props: ControlProps) => {
  const { value, onChange } = props;
  const [inputValue, setInputValue] = useState('');
  useEffect(() => {
    // 对数据进行处理后再展示
    setInputValue(inputValue);
  }, value)
  return (
    <input value={inputValue} onChange={e => onChange(e.target.value)}/>
  )
} 
```
# 简介
从[React官方网站](https://zh-hans.reactjs.org/docs/testing.html)看测试概览。提到了两个比较重要的工具，一个是[Jest](https://jestjs.io/docs/zh-Hans/getting-started)、一个是[React测试库](https://testing-library.com/docs/react-testing-library/intro/)。
- Jest是一个JavaScript测试运行器。它允许你使用jsdom操作DOM。尽管jsdom只是对浏览器工作表现的一个近似模拟，对测试React组件来说它通常也已经够用了。
- React测试库是一组能让你不依赖React组件具体实现对他们进行测试的辅助工具。它让重构工作变得轻而易举，还会推动你拥抱有关无障碍的最佳实现。
那么Jest和React测试库分别具体做了什么事呢？这是我们要探讨的。

# React Testing Libary VS Enzyme
React测试库可以作为Airbnb的[Enzyme](https://enzymejs.github.io/enzyme/)测试库的替代方案，Enzyme提供一种测试React组件内部的能力。而React测试库不直接测试组件的实现细节，而是从一个React应用的角度去测试。

# React Testing Libary VS Jest 
React初学者经常会对React测试工具感到困惑，React测试库并不是Jest的替代方案，因为他们需要彼此，并且有不同的分工。  
开发者通常不能绕开Jest，因为它是最受欢迎的JS测试框架。  
Jest提供类似以下的函数给我们提供测试：
```javascript
describe('my function or component', () => {
  test('does the following', () => {

  });
})
```
> describe的包裹区域内是test suite(测试套件)，test(可以用it替代)的包裹区域是test case(测试用例)，测试套件内可以有多个测试用例，并且测试用例并不一定需要在测试套件内。
```javascript
describe('true is truthy and false is falsy',() => {
  test('true is truthy', () => {
    expect(true).toBe(true);
  });

  test('false is fasly',() => {
    expect(false).toBe(false);
  });
})

```
> 我们可以把assertions(断言，Jest中的expect)放到测试用例里面，断言可以为成功或者错误。
> 默认情况下，当我们执行npm test的时候，Jest会自动匹配所有以test.js为后缀的文件，我们可以在Jest配置文件内自己设置匹配模式。

如果你使用[create-react-app](https://zh-hans.reactjs.org/docs/create-a-new-react-app.html#create-react-app)创建react应用，Jest(and React测试库)是默认安装的。但如果是自己自定义的React程序，需要安装和配置Jest。

通过create-react-app创建的应用，当我们执行Npm test的时候，会自动执行/src/App.test.js
![执行结果](https://tva1.sinaimg.cn/large/0081Kckwgy1glpzwvmg3bj30y60lqe81.jpg)

可以看到App.test.js的逻辑如下：
```javascript
import { render, screen } from '@testing-library/react';
import App from './App';
test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});

```
1. 利用react测试库渲染APP组件
2. 利用react测试库获取元素
3. 利用Jest来进行写测试用例和断言

我们可以在App.test.js的同级目录下加上上述的测试，测试结果如下:
![my.test.js](https://tva1.sinaimg.cn/large/0081Kckwgy1glq0dmcpk6j31ce0oc4qq.jpg)

管中窥豹，可以看到Jest和React测试库的职责是不同的，react测试库是跟react打交道，Jest是跟测试用例打交道。  
```javascript
function sum(x, y) {
  return x + y;
}

describe('sum', () => {
  test('sums up two values', () => {
    expect(sum(2, 4)).toBe(6);
  });
});

```
在实际的JS项目中，通常上述的sum函数会在另一个文件，而测试用例会在test文件，我们会在test文件里面引入函数：
```javascript
import sum from './math.js';

describe('sum', () => {
  test('sums up tow values', () => {
    expect(sum(2, 4)).toBe(6);
  })
})

```
> 在上述案例中，我们还没看到Jest去操作React组件，再来看Jest是一个测试的runner，理解是不是更加深刻了？Jest给与我们运行测试的能力，除此之外，jest还提供了一系列API，例如test suites(测试套件，describe)、test cases(测试用例，it、test)、assertions(断言,expect)，当然jest提供的还不止这些，还有(spies、mocks、stubs等等)。

React测试库，和jest是截然不同的，它是其中一个可以测试React组件的库(还有Enzyme等)。


# React测试库：渲染一个组件
在这个章节你将会学会如何通过React测试库去渲染一个React组件，我们将会通过create-react-app创建的项目来进行介绍，会用到/src/App.js和它对应的测试文件App.test.js
```javascript
import React from 'react';
 
const title = 'Hello React';
 
function App() {
  return <div>{title}</div>;
}
 
export default App;

```

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
我们可以在App.test.js的同级目录下加上上述的测试，测试结果如下:
![my.test.js](https://tva1.sinaimg.cn/large/0081Kckwgy1glq0dmcpk6j31ce0oc4qq.jpg)

管中窥豹，可以看到Jest和React测试库的职责是不同的，react测试库是跟react打交道，Jest是跟测试用例打交道。  

在实际的JS项目中，通常上述的sum函数会在另一个文件，而测试用例会在test文件，我们会在test文件里面引入函数：
```javascript
import sum from './math.js';

describe('sum', () => {
  test('sums up tow values', () => {
    expect(sum(2, 4)).toBe(6);
  })
})

```
> 在上述案例中，我们还没看到Jest去操作React组件，Jest更像是一个测试的runner，理解是不是更加深刻了？Jest给与我们运行测试的能力，除此之外，jest还提供了一系列API，例如test suites(测试套件，describe)、test cases(测试用例，it、test)、assertions(断言,expect)，当然jest提供的还不止这些，还有(spies、mocks、stubs等等)。

React测试库，和jest是截然不同的，它是其中一个可以测试React组件的库(还有Enzyme等)。


# React测试库
## 渲染一个组件
在这个章节你将会学会如何通过React测试库去渲染一个React组件，我们将会通过create-react-app创建的项目来进行介绍，会用到/src/App.js和它对应的测试文件App.test.js
```javascript
import React from 'react';
 
const title = 'Hello React';
 
function App() {
  return <div>{title}</div>;
}
 
export default App;

```
我们可以通过React测试库去渲染一个组件，然后通过debug来查看组件的HTML可见输出。
```javascript
// app.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';

import App from './App';

describe('App', () => {
  test('renders App component', () => {
    render(<App />);

    screen.debug();
  })
})

```
React测试库并不关心组件的实现，而是提供一种像正常人类操作页面一样与React组件交互的方案。  
```javascript 
import React from 'react';
 
function App() {
  const [search, setSearch] = React.useState('');
 
  function handleChange(event) {
    setSearch(event.target.value);
  }
 
  return (
    <div>
      <Search value={search} onChange={handleChange}>
        Search:
      </Search>
 
      <p>Searches for {search ? search : '...'}</p>
    </div>
  );
}
 
function Search({ value, onChange, children }) {
  return (
    <div>
      <label htmlFor="search">{children}</label>
      <input
        id="search"
        type="text"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
 
export default App;
```
可以看到输出:
```html
<body>
  <div>
    <div>
      <div>
        <label
          for="search"
        >
          Search:
        </label>
        <input
          id="search"
          type="text"
          value=""
        />
      </div>
      <p>
        Searches for
        ...
      </p>
    </div>
  </div>
</body>
```
就像我们在浏览网站时看到的实际渲染一样，所以我们看到了HTML的结构作为输出，而不是单独的两个React组件。

## 元素查询
在我们渲染React组件之后，React测试库通过查询函数去获取元素，这些元素在这之后会被用作断言或者交互。
```javascript
import React from 'react';
import { render, screen } from '@testing-library/react';

import App from './App';

describe('App', () => {
  test('renders App Component', () => {
    render(<App />);
    screen.getByText('Search:');
  })
})

```
在获取元素之后，可以通过expect进行断言
```javascript
import React from 'react';
import { render, screen } from '@testing-library/react';

import App from './App';

describe('App', () => {
  test('renders App Component', () => {
    render(<App />);

    expect(screen.getByText('Search:')).toBeInTheDocument();
  })
})

```
尽管查询函数（getByText）等在查询不到满足条件的元素时会报错，但依然建议使用expect去进行断言，因为getByText等查询参数的报错会阻止测试程序继续进行下去。

getByText在传递字符串的情况下，查找规则是精准匹配，可以正则的形式进行模糊匹配：
```javascript
expect(screen.getByText(/Search/)).toBeInTheDocument();
```
其他的元素查询函数：
- getByRole ```<div role="alert"></div>```
- getByLabelText:```<label for="search" />```
- getByPlaceholderText:```<input placeholder="Search" />```
- getByAltText: ```<img alt="profile" />```
- getByDisplayValue: ```<input value="JavaScript">```
- getByTestId: ```<any data-testid="xxx">```


除此之外，还有queryByxxx和findByxxx的查询函数：
- queryByText/findByText
- queryByRole/findByRole
- queryByLabelText/findByLabelText
- queryByPlaceholderText/findByPlaceholderText
- queryByAltText/findByAltText
- queryByDisplayValue/findByDisplayValue

什么时候用get/query/find?，需要了解它们的不同。getBy返回元素或者错误。getBy在查找不到元素时返回错误，这是非常方便的，有助于我们在开发的过程中尽早的发现自己的用例发生了错误。

**但是getBy有个麻烦的问题，那就是它没办法通过断言去判断一个元素不存在**
```javascript
// 失败
expect(scrren.getByText(/Searches for JavaScript/)).toBeNull();
```
上面的测试用例是没用的，尽管我们在debug模式下可以看到含有"Search for JavaScript"的元素是不存在的。在我们做出断言之前，getBy在找不到元素的情况下抛出错误。**为了去判断元素是否存在，我们可以使用queryBy**：

```javascript
expect(screen.queryByText(/Searches for JavaScript/)).toBeNull();
```
> 所以，在每一次我们需要判断某个元素不存在时，使用queryBy，除此之外默认使用getBy。

那么什么时候去使用findBy?

**findBy用于查询一个在异步之后会被最终渲染的元素**

在以下的例子中，我们通过判断是否存在User进行渲染，通过uesEffect去异步获取User。
```javascript
function getUser() {
  return Promise.resolve({ 
    id: '1',
    name: 'johe'
  })
}

function App() {
  const [search, setSearch] = useState('');
  const [user, setUser] = useState(Null);
  
  useEffect(async () => {
    const user = await getUser();
    setUser(user);
  }, []);

  function handleChange(event) {
    setSearch(event.target.value);
  }
 
  return (
    <div>
      {user ? <p>Signed in as {user.name}</p> : null}
 
      <Search value={search} onChange={handleChange}>
        Search:
      </Search>
 
      <p>Searches for {search ? search : '...'}</p>
    </div>
  );
}
```
为了查询包含Signed in as的元素最终是否会存在，我们需要写一个异步的测试。
```javascript
import React from 'react';
import { render, screen } from '@testing-library/react';

import App from './App';

describe('App', async () => {
  test('renders App Component', async () => {
    render(<App />);

    expect(screen.queryByText(/Signed in as/)).toBeNull();

    expect(await screen.findByText(/Signed in as/)).toBeInTheDocument();
  })
})

```
在组件初次渲染之后，我们通过queryBy来替代getBy去判断元素不存在。然后我们await新的元素并且判断它将会被渲染，最终它将会在Promise被resolve之后渲染并且组件重新渲染。

> 判断一个元素最终存不存在，使用findBy。判断一个元素不存在，使用queryBy。否则默认情况下使用getBy。
> findBy通常可以用来做异步断言。

**如何去获取多个元素？**
- getAllBy
- queryAllBy
- findAllBy

## 断言函数
断言函数出现在你的断言右侧，在上面的测试中，我们已经使用了*toBeNull*和*toBeInTheDocument*。**正常情况下，这些断言函数来自Jest，但是React测试库拓展了，加入了一些自己的断言函数例如toBeInTheDocument。这些断言函数都来自额外的包，在默认情况下已经被设置(在通过CRP创建应用的情况下)。**
- toBeDisabled
- toBeEnabled
- toBeEmpty
- toBeEmptyDOMElement
- toBeInTheDocument
- toBeInvalid
- toBeRequired
- toBeValid
- toBeVisible
- toContainElement
- toContainHTML
- toHaveAttribute
- toHaveClass
- toHaveFocus
- toHaveFormValues
- toHaveStyle
- toHaveTextContent
- toHaveValue
- toHaveDisplayValue
- toBeChecked
- toBePartiallyChecked
- toHaveDescription

## 事件触发
到目前为止，我们所做的断言都是在判断一个元素是否渲染(getBy、queryBy)，和判断一个元素是否在重渲染阶段渲染(findBy)。那么实际的用户交互呢？例如用户通过键盘将信息输入到Input框内，点击表单的按钮等等。这些用户交互最终可能会影响到渲染。

我们可以通过React测试库的fireEvent去模拟用户交互行为：(输入文字到Input框内)
```javascript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import App from './App';

describe('App', () => {
  test('renders App Component', () => {
    render(<App />);
    
    screen.debug();

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Javascript' }
    });

    screen.debug();
  })
})

```
React测试库还提供了userEvent API，userEvent在fireEvent之上建立。我们可以使用userEvent去替代fireEvent，因为userEvent模仿的交互行为与人类行为更相似。例如fireEvent.change()仅仅会触发change事件，而userEvent.type可以触发的不仅仅是change事件，还有keDown、keyPress、keyUp事件等等。
```javascript
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import App from './App';

describe('App', async () => {
  test('renders App component', async () => {
    render(<App />);

    await userEvent.type(screen.getByRole('textbox'), 'Javascript');
  })
})

```
尽量使用userEvent API去替代fireEvent，尽管fireEvent中的有些特性userEvent还未包含，但将来可能会得到改善。

## 回调处理
通常在受控组件中，需要接收来自外部的value和onChange，这类受控组件可能没有自己的state，也没产生任何的副作用，仅仅是Props的输入和JSX的输出。这个时候，我们为了检测这个受控组件有没有正常的调用我们传入的onChange回调函数，该如何做呢？

假设有如下Search受控组件：
```javascript
function Search({ value, onChange, children }) {
  return (
    <div>
      <label htmlFor="search">{children}</label>
      <input
        id="search"
        type="text"
        role="textbox"
        value={value}
        onChange={onChange}
      >
    </div>
  );
}
```
我们想要测试当我们在Search的Input框内输入值时，onChange是否有按预期的被调用，则需要通过jest给我们提供的fn函数：
```javascript
describe('Search', () => {
  test('calls the onChange callback handler', () =>{
    const onChange = jest.fn();

    render(
      <Search value="" onChange={onChange}>
      </Search>
    );

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Javascript' },
    });

    expecet(onChange).toHaveBeenCalledTimes(1);
  })
})

```
可以看到onChange通过fireEvent触发的情况下，只调用了一次，这个时候，我们可以使用userEvent去替代fireEvent，比起fireEvent，userEvent更加的贴近人类的交互行为，在输入文字的时候，可以看到onChange会被调用多次（这是因为userEvent更加模拟了人类的键盘输入，keyDown等）
```javascript
describe('Search', async () => {
  test('calls the onChange callback handler', async () => {
    const onChange = jest.fn();

    render(
      <Search value="" onChange={onChange}>
        Search:
      </Search>
    );

    await userEvent.type(screen.getByRole('textbox'), 'JavaScript');
    
    expect(onChange).toHaveBeenCalledTimes(10);
  })
})

```
然而，React测试库并不鼓励我们进行单独组件的测试，而是鼓励我们进行集成测试（对一个具有完整功能的组件），只有这样我们才能实际的测试出state的变化会怎么样被应用和影响DOM，以及造成的副作用。

## mock请求
在实际交互过程中，网页会请求数据，拿到数据之后，组件再进行一些处理，为了更好的模拟与后台交互，我们需要拦截这些请求并返回mock的数据。

例如以下用axios请求的例子，在返回hits数据之后，我们会对其进行列表渲染，否则显示错误。
```javascript
import React from 'react';
import axios from 'axios';
 
const URL = 'http://hn.algolia.com/api/v1/search';
 
function App() {
  const [stories, setStories] = React.useState([]);
  const [error, setError] = React.useState(null);
 
  async function handleFetch(event) {
    let result;
 
    try {
      result = await axios.get(`${URL}?query=React`);
 
      setStories(result.data.hits);
    } catch (error) {
      setError(error);
    }
  }
 
  return (
    <div>
      <button type="button" onClick={handleFetch}>
        Fetch Stories
      </button>
 
      {error && <span>Something went wrong ...</span>}
 
      <ul>
        {stories.map((story) => (
          <li key={story.objectID}>
            <a href={story.url}>{story.title}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
 
export default App;
```
对应的测试应该类似如下：
```javascript
import React from 'react';
import axios from 'axios';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
 
import App from './App';
 
jest.mock('axios');
 
describe('App', () => {
  test('fetches stories from an API and displays them', async () => {
    const stories = [
      { objectID: '1', title: 'Hello' },
      { objectID: '2', title: 'React' },
    ];
 
    axios.get.mockImplementationOnce(() =>
      Promise.resolve({ data: { hits: stories } })
    );
 
    render(<App />);
 
    await userEvent.click(screen.getByRole('button'));
 
    const items = await screen.findAllByRole('listitem');
 
    expect(items).toHaveLength(2);
  });
});

```
我们还可以写一个错误返回情况下的测试用例，来确保返回错误时的提示能够正确渲染：
```javascript
test('fetches stories from an API and fails', async () => {
    axios.get.mockImplementationOnce(() =>
      Promise.reject(new Error())
    );
 
    render(<App />);
 
    await userEvent.click(screen.getByRole('button'));
 
    const message = await screen.findByText(/Something went wrong/);
 
    expect(message).toBeInTheDocument();
  });

```

React官方更推荐使用fetch API与Mock Service Worker库去模拟数据，例如以下通过fecth API进行请求的组件：
```javascript
// login.js
import * as React from 'react'

function Login() {
  const [state, setState] = React.useReducer((s, a) => ({...s, ...a}), {
    resolved: false,
    loading: false,
    error: null,
  })

  function handleSubmit(event) {
    event.preventDefault()
    const {usernameInput, passwordInput} = event.target.elements

    setState({loading: true, resolved: false, error: null})

    window
      .fetch('/api/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          username: usernameInput.value,
          password: passwordInput.value,
        }),
      })
      .then(r => r.json().then(data => (r.ok ? data : Promise.reject(data))))
      .then(
        user => {
          setState({loading: false, resolved: true, error: null})
          window.localStorage.setItem('token', user.token)
        },
        error => {
          setState({loading: false, resolved: false, error: error.message})
        },
      )
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="usernameInput">Username</label>
          <input id="usernameInput" />
        </div>
        <div>
          <label htmlFor="passwordInput">Password</label>
          <input id="passwordInput" type="password" />
        </div>
        <button type="submit">Submit{state.loading ? '...' : null}</button>
      </form>
      {state.error ? <div role="alert">{state.error}</div> : null}
      {state.resolved ? (
        <div role="alert">Congrats! You're signed in!</div>
      ) : null}
    </div>
  )
}

export default Login

```
通过msw（mock service worker)写的测试用例如下：
```javascript
// __tests__/login.js
// again, these first two imports are something you'd normally handle in
// your testing framework configuration rather than importing them in every file.
import '@testing-library/jest-dom'
import * as React from 'react'
// import API mocking utilities from Mock Service Worker.
import {rest} from 'msw'
import {setupServer} from 'msw/node'
// import testing utilities
import {render, fireEvent, screen} from '@testing-library/react'
import Login from '../login'

const fakeUserResponse = {token: 'fake_user_token'}
const server = setupServer(
  rest.post('/api/login', (req, res, ctx) => {
    return res(ctx.json(fakeUserResponse))
  }),
)

beforeAll(() => server.listen())
afterEach(() => {
  server.resetHandlers()
  window.localStorage.removeItem('token')
})
afterAll(() => server.close())

test('allows the user to login successfully', async () => {
  render(<Login />)

  // fill out the form
  fireEvent.change(screen.getByLabelText(/username/i), {
    target: {value: 'chuck'},
  })
  fireEvent.change(screen.getByLabelText(/password/i), {
    target: {value: 'norris'},
  })

  fireEvent.click(screen.getByText(/submit/i))

  // just like a manual tester, we'll instruct our test to wait for the alert
  // to show up before continuing with our assertions.
  const alert = await screen.findByRole('alert')

  // .toHaveTextContent() comes from jest-dom's assertions
  // otherwise you could use expect(alert.textContent).toMatch(/congrats/i)
  // but jest-dom will give you better error messages which is why it's recommended
  expect(alert).toHaveTextContent(/congrats/i)
  expect(window.localStorage.getItem('token')).toEqual(fakeUserResponse.token)
})

test('handles server exceptions', async () => {
  // mock the server error response for this test suite only.
  server.use(
    rest.post('/api/login', (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({message: 'Internal server error'}))
    }),
  )

  render(<Login />)

  // fill out the form
  fireEvent.change(screen.getByLabelText(/username/i), {
    target: {value: 'chuck'},
  })
  fireEvent.change(screen.getByLabelText(/password/i), {
    target: {value: 'norris'},
  })

  fireEvent.click(screen.getByText(/submit/i))

  // wait for the error message
  const alert = await screen.findByRole('alert')

  expect(alert).toHaveTextContent(/internal server error/i)
  expect(window.localStorage.getItem('token')).toBeNull()
})

```
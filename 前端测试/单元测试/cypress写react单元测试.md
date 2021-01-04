
# 前言
参考自cypress官方提供的博客：[文章链接](https://glebbahmutov.com/blog/test-the-interface/)，博客提供了一个很好的例子帮助我么从Jest+React Testing Library到Cypress + cypress-react-unit-test迁移。

# 开始
首先通过CRP(create-react-app)来创建一个标准的react应用，默认情况下，通过CRP创建的应用已经内置了Jest+React Testing Library，我们可以通过查看package.json来验证：
```json
...
"dependencies": {
    "@testing-library/jest-dom": "^5.11.4",
    "@testing-library/react": "^11.1.0",
    "@testing-library/user-event": "^12.1.10",
    "react": "^17.0.1",
    "react-dom": "^17.0.1",
    "react-scripts": "4.0.1",
    "web-vitals": "^0.2.4"
},
...
```
现在来安装我们的主角cypress和cypress react单元测试插件：
```shell
npm install --save-dev cypress cypress-react-unit-test @testing-library/cypress
```
运行以下命令，进行cypress的初始化，会生成cypress的文件夹和cypress.json:
```shell
npx cypress open
```
现在可以看到cypress.json生成在项目文件夹下，cypress.json是cypress的全局配置，我们在这里启用Component Testing(单元测试)和fetch polyfill的实验功能：
```shell
{
  "experimentalComponentTesting": true,
  "experimentalFetchPolyfill": true,
  "testFiles": "**/*cy-spec.js",
  "componentFolder": "src"
}

```
在用Jest那一套进行测试的时候，我们更倾向于测试文件接近我们的源文件，但是在cypress中，所有的测试用例都集中在__tests__文件夹下。Jest默认采用后缀.spec.js去匹配测试文件，我们这里用testFiles来配置后缀为.cy-spec.js。
```
src/components/
  __tests__/
    # Jest + RTL test files
    ExpandCollapse.spec.js
    Hello.spec.js
    Login.spec.js
    Pizza.spec.js
    RemotePizza_*.spec.js
    # Cypress + CTL test files
    ExpandCollapse.cy-spec.js
    Hello.cy-spec.js
    Login.cy-spec.js
    Pizza.cy-spec.js
    RemotePizza.cy-spec.js

  # component source files
  ExpandCollapse.js
  Login.js
  Pizza.js
  RemotePizza.js
```
由于这是一篇迁移文章，我们也配置一下Jest：
```javascript
// package.json
{
  "jest": {
    "testMatch": [
      "**/__tests__/**/*.spec.js"
    ]
  }
}

```
我们的项目是由create-react-app创建的，CRP创建的项目配置存放在node_modules下的react-scripts。通过查看package.json可以看到，所有的scripts实际上都是在跑react-scripts下的命令：
```json
"scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
},

```
为什么需要关注这个呢？我们需要让Cypress使用和react-scripts一样的配置，好让它能够理解打包机制：
```javascript
// cypress/plugins/index.js
modules.exports = (on, config) => {
  require('cypress-react-unit-test/plugins/react-scripts')(on, config);
  return config;
}

```
最后我们需要加载@testing-library/cypress和cypress-react-unit-test到Cypress support文件内，它将会引入查询命令，例如cy.findByText(类似于React Testing Library)。
```javascript
// cypress/support/index.js
// https://github.com/bahmutov/cypress-react-unit-test#install
require('cypress-react-unit-test/support');
// https://testing-library.com/docs/cypress-testing-library/intro
require('@testing-library/cypress/add-commands');

```

# Hello World(挂载和元素获取)
我们可以从Jest+RTL的单测例子Hello.spec.js开始，它没有对应的组件文件，因为它使用的是内联JSX：
```javascript
// src/components/__tests__/Hello.spec.js
import React from 'react';
import { render, screen } from '@testing-library/react';

test('hello world', () => {
  const { getByText } = render(<p>Hello Jest!</p>);
  expect(getByText('Hello Jest!')).toBeTruthy();
  // or
  expect(screen.getByText('Hello Jest!')).toBeTruthy();
})

```
使用cypress-react-unit-test来写相同功能的测试用例时，我们用mount来替代render，用findByText来替代getByText：
```javascript
// src/components/__tests__/Hello.cy-spec.js
import React from 'react';
import { mount } from 'cypress-react-unit-test';

it('hello world', () => {
  mount(<p>Hello Jest!</p>);
  cy.findByText('Hello Jest!');
})

```
然后我们通过如下命令来运行cypress测试：
```shell
npx cypress open
// or
yarn cypress open

```
可以看到测试通过了，类似如下![单测结构](https://tva1.sinaimg.cn/large/0081Kckwgy1gm9glzoxndj314x0u07ry.jpg)

> Tip：我们关注到一点，在mount命令的Log日志里，会看到<Unknown ...>的标识。这是因为我们的组件没有命名。

在实际的测试例子中，我们渲染的组件都会有命名，可能是一个函数名称，也可能是一个class名称：
```javascript
it('hello world component', () => {
  const HelloWorld = () => <p>Hello World!</p>;
  mount(<HelloWorld>);
  // or cy.contains
  cy.findByText('Hello World!');
})

```
![cypress测试结果](https://tva1.sinaimg.cn/large/0081Kckwgy1gm9gmptmnxj31dt0u0k04.jpg)

Cypress在e2e测试中提供的cy.contains API也能够直接使用，类似于cy.findByTextBy，如果文本不存在DOM中(4秒)，cy.contains会执行失败。如果我们的应用够快，我们可以在全局设置每次检索的等待时间，也可以在每个命令中配置。
```javascript
it('fails if text is not found', () => {
  const HelloWorld = () => <p>Hello World!</p>;
  mount(<HelloWorld>);
  cy.contains('Hello Mocha', {timeout: 200});
})

```

# 真实例子-扩大折叠组件的测试(事件处理和异步元素审查)
假设有一个ExpandCollapse组件，它的功能和名字一样，展开和收缩。展开时显示传入的children，收缩时隐藏传入的children:
```javascript
const ExpandCollapse = (props) => {
  const { children } = props;
  const [isExpanded, setExpanded] = useState(false);
  return (
    <>
      <button data-testid="expandCollapseBtn" onClick={() => setExpanded(!isExpanded)}>
        click
      </button>
      {isExpanded ? children : null}
    </>
  );
}

```
如果我们要写这个组件的测试用例，首先点击Button，查看children是否显示，再点击Button，查看children是否隐藏。通过Jest写的测试用例如下（原本的示例中使用了ARIA，无障碍阅读的概念，由于这个概念想要去理解和记住成本较高，所以我这里使用了testid属性来替代）：
```javascript
// src/components/__tests__/ExpandCollapse.spec.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ExpandCollapse from '../ExpandCollapse.js';

it('ExpandCollapse Test', () => {
  const children = 'Hello World';
  render(<ExpandCollapse>{children}</ExpandCollapse>);
  expect(screen.queryByText(children)).not.toBeInTheDocument();
  // 通过screen.debug来查看每个阶段的DOM。
  screen.debug();

  fireEvent.click(screen.getByTestId('expandCollapseBtn'));
  expect(screen.queryByText(children)).toBeInTheDocument();
  screen.debug();

  fireEvent.click(screen.getByTestId('expandCollapseBtn'));
  expect(screen.queryByText(children)).not.toBeInTheDocument();
  screen.debug();
});

```

让我们来看看同等的测试用例，这次使用cypress和cypress-react-unit-test来编写：
```javascript
import React from 'react';
import { mount } from 'cypress-react-unit-test';
import ExpandCollapse from '../ExpandCollapse';

it('ExpandCollapse Test', () => {
  const children = 'Hello World';
  mount(<ExpandCollapse>{children}</ExpandCollapse>);  
  cy.findByText(children).should('not.exist');

  cy.findByTestId('expandCollapseBtn').click();
  cy.findByText(children); // 内置断言

  cy.findByTestId('expandCollapseBtn').click();
  cy.findByText(children).should('not.exist');
});
```
上面的两个测试用例都是同步的（点击后立即断言），但是实际上，每一个交互动作，例如点击按钮，都是异步的，也就是执行完这个动作后的效果，应该是异步的，例如我们把刚刚的Button点击事件修改一下：
```javascript
<button data-testid="expandCollapseBtn" onClick={() => setTimeout(() => setExpanded(!isExpanded), 1000)}>
  click
</button>

```
使用Jest执行测试用例，可以看到报错信息:  
![报错信息](https://tva1.sinaimg.cn/large/0081Kckwgy1gm9igw9ylzj31a40u0dkc.jpg)

> 实际上，即使刚刚的测试用例改成0ms，用Jest进行测试也会报错。使用Cypress去执行测试用例，可以看到没有报错，这是由于Cypress的命令是异步的，即使我们把组件的更新从同步改成异步，或者设置delay，Cypress的Test Runner依旧会重复尝试命令直到DOM更新。

但是，默认情况下Cypress只会在4000ms内重试，超过4000ms就会报错，例如把刚刚的例子改成如下：
```javascript
<button data-testid="expandCollapseBtn" onClick={() => setTimeout(() => setExpanded(!isExpanded), 5000)}>
  click
</button>
```
再去执行cypress的测试用例会报错：
![](https://tva1.sinaimg.cn/large/0081Kckwgy1gm9qdsbaqij30zp0u0q5z.jpg)

## 用Jest+React-Testing-Library异步元素审查
那么用Jest+RTL可以做到异步获取元素吗？当然可以，Jest支持异步的测试用例，RTL支持异步的元素审查
- 异步判断元素存在：waitFor + getBy/queryBy 或者 findBy
- 异步判断元素不存在：waitFor + getBy/queryBy 或者 waitForElementToBeRemoved
```javascript
// src/components/__tests__/ExpandCollapse.spec.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ExpandCollapse from '../ExpandCollapse.js';

it('ExpandCollapse Test', async () => {
  const children = 'Hello World';
  render(<ExpandCollapse>{children}</ExpandCollapse>);
  expect(screen.queryByText(children)).not.toBeInTheDocument();
  // 通过screen.debug来查看每个阶段的DOM。
  screen.debug();

  fireEvent.click(screen.getByTestId('expandCollapseBtn'));
  expect(await screen.findByText(children)).toBeInTheDocument();
  /*
    await waitFor(() => {
      expect(screen.getByText(children)).toBeInTheDocument();
    })
  */
  screen.debug();

  fireEvent.click(screen.getByTestId('expandCollapseBtn'));
  await waitForElementToBeRemoved(() => queryByText(children));
  /*
    await waitFor(() => {
      expect(queryByText(children)).not.toBeInTheDocument();
    })
  */
  screen.debug();
});

```
如果用上述5000ms的例子来测试，依然会报错，这是由于waitFor和findBy默认情况下的超时时间为1000ms，Jest的默认函数超时时间为5000ms。waitFor的超时时间可以由第二个参数传入,而findBy的超时时间可以由第三个参数传入：
```javascript
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ExpandCollapse from '../ExpandCollapse.js';
// 设置jest的超时时间
jest.setTimeout(10000);

it('ExpandCollapse Test', async () => {
  const children = 'Hello World';
  render(<ExpandCollapse>{children}</ExpandCollapse>);
  expect(screen.queryByText(children)).not.toBeInTheDocument();

  fireEvent.click(screen.getByTestId('expandCollapseBtn'));
  // await waitFor(() => {
  //   expect(screen.queryByText(children)).toBeInTheDocument();
  // }, { timeout: 5000 });
  expect(await screen.findByText(children, {}, { timeout: 5000 })).toBeInTheDocument();

  fireEvent.click(screen.getByTestId('expandCollapseBtn'));
  await waitFor(() => {
    expect(screen.queryByText(children)).not.toBeInTheDocument();
  }, { timeout: 5000 });
});
```

## 用Cypress异步元素审查
同样的，cypress也提供了异步的审查机制，也是通过传入timeout来实现：
```javascript
import React from 'react';
import { mount } from 'cypress-react-unit-test';
import ExpandCollapse from '../ExpandCollapse';

it('ExpandCollapse Test', () => {
  const children = 'Hello World';
  mount(<ExpandCollapse>{children}</ExpandCollapse>);  
  cy.findByText(children).should('not.exist');

  cy.findByTestId('expandCollapseBtn').click();
  cy.findByText(children, { 
    timeout: 5000
  }); // 内置断言

  cy.findByTestId('expandCollapseBtn').click();
  cy.findByText(children, {
    timeout: 5000
  }).should('not.exist');
});
```

# Login Form(回调处理)
接下来的例子是一个含有提交按钮的表单，当用户填充输入框点击提交按钮之后，由父组件传入的onSubmit方法将会被调用：
```javascript
// src/components/Login.js
export default function Login ({ onSubmit }) {
  const [username, setUsername] = React.useState('');
  const [paswword, setPassword] = React.useState('');
  const handleSubmit = event => {
    event.preventDefault();
    onSubmit({ username, password });
  };
  return (
    <form onSubmit={handleSubmit} data-test-id="loginForm">
      <h3>Login</h3>
      <label>
        Username
        <input
          name="username"
          value={username}
          onChange={event => setUsername(event.target.value)}
          data-testid="loginForm-username"
        />
      </label>
      <label>
        Password
        <input
          name="password"
          type="password"
          value={password}
          onChange={event => setPassword(event.target.value)}
          data-testid="loginForm-password"
        />
      </label>
      <button type="submit" data-testid="loginForm-submit">Log in</button>
    </form>
  )
}

```
对于上述例子，我们需要传入onSubmit函数到被测试的组件内，需要关注的是
- 函数是否被调用，以及调用次数
- 调用时传入的参数是否按照预期

## 用Jest来写事件回调处理
通过Jest.fn来创建一个函数，将这个函数传入到被测试组件内，再通过Jest提供的断言函数来进行测试：
```javascript
// src/components/__tests__/Login.spec.js
import React from 'react';
import Login from '../Login';
import { screen, render, fireEvent } from '@testing-library/react';
// 待测试
describe('form', async () => {
  it('submits username and password usting testing-library', () => {
    const username = 'me';
    const password = 'please';
    const onSubmit = Jest.fn();
    render(<Login onSubmit={onSubmit} />);
    
    fireEvent.onChange(screen.queryByLabelText(/username/i), {
      target: {
        value: username
      }
    });
    fireEvent.onChange(screen.queryByLabelText(/username/i), {
      target: {
        value: username
      }
    });
    await fireEvent.submit(screen.queryTestId('loginForm-submit'));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({ username, password });
  })
})

```


## 用Cypress来写事件回调处理
可以通过cy.stub来创建一个函数作为父组件的onSubmit传入到被测试组件内，通过cy.stub创建的函数会在每个测试用例被重置，所以我们不用手动去重置它。

```javascript
// src/components/__tests__/Login.cy-spec.js
import React from 'react';
import Login from '../Login';
import { mount } from 'cypress-react-unit-test';

describe('form', () => {
  it('submits username and password usting testing-library', () => {
    const username = 'me';
    const password = 'please';
    const onSubmit = cy.stub();
    mount(<Login onSubmit={onSubmit} />);

    cy.findByLabelText(/username/i).type(username);
    cy.findByLabelText(/password/i).type(password);
    cy.findByRole('button', { name: /log in/i })
      .submit()
      .then(() => {
        expect(onSubmit).to.be.calledOnce;
        expect(onSubmit).to.be.calledWith({
          username,
          password,
        });
      });
  });
});

```

# Pizza toppings(网络请求)
最后一个例子是一个Pizza菜单的列表组件。
```javascript
export default function Pizza({ ingredients }) {
  return (
    <>
      <h3>Pizza</h3>
      <ul>
        {ingredients.map(ingredient => (
          <li key={ingredient}>{ingredient}</li>
        ))}
      </ul>
    </>
  )
}

```
如果这个列表是由外部通过Props传入的，那么这个测试用例会很简单。
```javascript
// src/components/__tests__/Pizza.cy-spec.js
// 通过cypress来写
import React from 'react';
import { mount } from 'cypress-react-unit-test';
import Pizza from '../Pizza';

it('contains all ingredients', () => {
  const ingredients = ['bacon', 'tomato', 'mozzarella', 'pineapples'];
  // component Pizza shows the passed list of toppings
  mount(<Pizza ingredients={ingredients} />);

  for (const ingredient of ingredients) {
    cy.findByText(ingredient);
  }
});

```
但在实际情况下，组件可能会通过请求来获得列表数据：
```javascript
import React from 'react';

export default function RemotePizza() {
  const [ingredients, setIngredients] = React.useState([]);

  const handleCook = async () => {
    const result = await window.fetch('/api/pizza', {
        method: 'GET',
        headers: {'Content-Type': 'application/json'}
    });
    result.json().then((data) => {
      setIngredients(data);
    })
  };

  return (
    <>
      <h3>Pizza</h3>
      <button data-testid="fetch-button" onClick={handleCook}>Cook</button>
      {ingredients.length > 0 && (
        <ul>
          {ingredients.map((ingredient) => (
            <li key={ingredient}>{ingredient}</li>
          ))}
        </ul>
      )}
    </>
  );
}
```


通过cypress，可以很容易的拦截请求，并设置返回的数据：
```javascript
//src/components/__tests__/RemotePizza.cy-spec.js
import React from 'react';
import { mount } from 'cypress-react-unit-test';
import RemotePizza from '../RemotePizza';

describe('RemotePizza Testing', () => {
  beforeEach(() => {
    cy.server();
    cy.fixture('ingredients')
      .as('ingredients')
      .then((ingredients) => {
        cy.route({
          method: 'GET',
          url: '/api/pizza', 
          response: ingredients
        }).as(
          'pizza'
        );
      })
  });
  it('download ingredients from internets (network mock)', function () {
    mount(<RemotePizza />);
    cy.contains('button', /cook/i).click();
    cy.wait('@pizza'); // make sure the network stub was used

    for (const ingredient of this.ingredients) {
      cy.contains(ingredient);
    }
  })
})


```
cypress运行结果：
![](https://tva1.sinaimg.cn/large/0081Kckwgy1gmbsflyc4rj31er0u0tbj.jpg)

通过Jest，我们需要借助msw(mock service worker)，这里要注意一下，原来的例子是等待某个DOM元素出现之后，才开始进行断言。在这里我使用了一个jest函数，在server的回调函数内调用，等待这个函数被调用后，说明已经有返回结果，这个时候进行断言，更加靠谱。
```javascript
import React from 'react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import ingredients from '../../../cypress/fixtures/ingredients.json';
import RemotePizza from '../RemotePizza';
const test = jest.fn();
const server = setupServer(
  rest.get('/api/pizza', (req, res, ctx) => {
    test();
    return res(ctx.json(ingredients))
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

it('RemotePizza Testing', async () => {
  render(<RemotePizza />);
  fireEvent.click(screen.queryByTestId('fetch-button'));
  screen.debug();
  await waitFor(() => {
    expect(test).toHaveBeenCalledTimes(1);
  });
  screen.debug();
  for (const ingredient of ingredients) {
    expect(screen.queryByText(ingredient)).toBeInTheDocument();
  }
})

```

# 结论
- Jest + RTL编写的测试用例，基本上可以完全迁移成Cypress+Cypress-react-unit-test，两者的API基本上是一致的。
- Cypress有一些独特的优势，比起Jest在命令行内跑
  - Cypress支持真实的浏览器运行环境
  - 具有每一个命令的执行日志和时间回溯的功能
  - 元素选择工具
![](https://tva1.sinaimg.cn/large/0081Kckwgy1gmbsjcunnvj313s0u0aan.jpg)
  - 失败时会有截图
- cypress的每个命令都是异步的，jest有一些是同步，有一些是异步，但也能满足要求。
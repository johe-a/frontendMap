- [Install](#install)
- [运行第一个测试](#运行第一个测试)
- [cypress语法](#cypress语法)
- [编写测试流程](#编写测试流程)
- [一个真实的测试](#一个真实的测试)
  - [访问测试页面](#访问测试页面)
  - [查询元素](#查询元素)
  - [点击元素](#点击元素)
  - [进行断言](#进行断言)
- [调试](#调试)
  - [调试命令](#调试命令)
- [调试本地程序](#调试本地程序)
- [测试策略](#测试策略)
  - [制造数据](#制造数据)
# Install
安装![Cypress](https://docs.cypress.io/guides/getting-started/installing-cypress.html)，并运行它的UI工具。
```json
//package.json
{
    "script": {
        "cypress-gui": "cypress open"
    }
}

```
```javascript
yarn cypress-gui
//or
npm run cypress-gui
```

# 运行第一个测试
在/cypress/integration下创建一个sample_spec.js的第一个测试文件。开始尝试写第一个通过和失败的测试。
```javascript
describe('My First Test', () => {
    it('Does not do much!', () => {
        expect(true).to.equal(true)
    })
})

```
![](https://tva1.sinaimg.cn/large/0081Kckwgy1gky2gm2dq2j30cf02xmx8.jpg)

第一个失败用例：
```javascript
descibe('My First Test', () => {
    it('Does not do much!', () => {
        expect(true).to.equal(false);
    })
})

```
在我们保存之后，Cypress的UI工具会展示这个错误，并且展示路径，可以点击蓝色的路径定位到错误文件。并且可以通过Cypress的控制台看到具体的错误。
![](https://tva1.sinaimg.cn/large/0081Kckwgy1gky2jaaay7j31u20t8wo2.jpg)

# cypress语法
cypress底层依赖很多优秀的开元测试框架，例如![Mocha](https://mochajs.cn/)（发音摩卡）和![Chai](https://docs.cypress.io/guides/references/assertions.html#Chai)。

Cypress采用了Mocha的bdd(Behavior-Driven Development)行为驱动开发语法，bdd非常适用于集成和单元测试。所有以下语法均来自Mocha:
- describe()
- context()
- it()
- before()
- beforeEach()
- afterEach()
- after()
- .only()
- .skip()

除此之外，Mocha提供了很好的async异步支持。Mocha提供了一个测试的框架，Chai则提供了简单的断言能力。Chai提供了可读性很好的断言和错误信息。
![Chai提供的断言](https://docs.cypress.io/guides/references/assertions.html#Chai)

# 编写测试流程
编写一个测试通常包含三个阶段：
- 设置应用的state
- 进行一个Action
- 断言应用的结果state

这三个阶段可能被描述成多种形式，例如"Given,When,Then"或者"Arrange,Act,Assert"。但他们的含义都是:
1. 将应用放进一个具体的state(状态)
2. 进行一些会导致应用状态改变的动作
3. 检查最终应用的状态

# 一个真实的测试
接下来我们通过一个真实的测试例子来体验测试流程：
1. 访问一个页面
2. 查询元素
3. 与元素进行交互
4. 断言页面的内容

## 访问测试页面
```javascript
describe('My First Test', () => {
    it('Visits the Kitchen Sink', () => {
        cy.visit('https://example.cypress.io');
    });
});

```
如果这个页面返回的不是2xx而是404或者500以及页面出现了JS错误都会返回failed.
![](https://tva1.sinaimg.cn/large/0081Kckwgy1gky4lpj7e5j31mq0tm79n.jpg)

## 查询元素
假设页面中含有一个content为type，我们要找到这个content，就需要使用cy.contains()

```javascript
describe('My First Test', () => {
    it('Visits the Kitchen Sink', () => {
        cy.visit('https://example.cypress.io');
        cy.contains('type');
    });
});

```
![](https://tva1.sinaimg.cn/large/0081Kckwgy1gky4opj9shj31i50u0afi.jpg)

如果页面中找不到，将会返回一个错误。可以看到contains执行大约在4秒之后，这是由于该命令需要在DOM中循环递归的查询，所以比较缓慢。

## 点击元素
```javascript
describe('My First Test', () => {
    it('Visits the Kitchen Sink', () => {
        cy.visit('https://example.cypress.io');
        cy.contains('type').click();
    });
});

```
Cypress采用链式调用的形式，这样可以语义化描述我们的测试。

## 进行断言
在上面点击链接后，我们应该会得到一个新的页面，但是我们不确定新的页面就是我们想访问的页面，这个时候可以判断URL，通过url()我们可以获取到页面的url，再通过should()进行断言。
```javascript
describe('My First Test', () => {
    it('clicking "type" navigates to a new url', () => {
        cy.visit('https://example.cypress.io');

        cy.contains('type').click();

        cy.url().should('include', './commands/actions');
    })
})
```

Cypress不会对一个测试的断言和交互进行限制。我们可以使用cy.get()去选择一个元素通过CSS选择器。还可以使用type()命令去输入文本到选中的input框。然后可以通过should()进行断言input框的内容和我们type进去的是否一致。
```javascript
describe('My First Test', () => {
  it('Gets, types and asserts', () => {
    cy.visit('https://example.cypress.io')

    cy.contains('type').click()

    // Should be on a new URL which includes '/commands/actions'
    cy.url().should('include', '/commands/actions')

    // Get an input, type into it and verify that the value has been updated
    cy.get('.action-email')
      .type('fake@email.com')
      .should('have.value', 'fake@email.com');
  })
})

```

# 调试
Cypress拥有许多工具帮助我们调试和理解测试。
- 提供时间回溯到每一个命令的快照
- 可以看到页面发生的事件
- 接收每一个命令的输出
- 命令的快照能够支持forward和backward
- Pause命令支持暂停
- 可视化隐藏和多种元素当被发现时

具体查看[debugging](https://docs.cypress.io/guides/getting-started/writing-your-first-test.html#Debugging)

## 调试命令
- cy.pause()
- cy.debug()

```javascript
describe('My First Test', () => {
  it('clicking "type" shows the right headings', () => {
    cy.visit('https://example.cypress.io')

    cy.pause()

    cy.contains('type').click()

    // Should be on a new URL which includes '/commands/actions'
    cy.url().should('include', '/commands/actions')

    // Get an input, type into it and verify that the value has been updated
    cy.get('.action-email')
      .type('fake@email.com')
      .should('have.value', 'fake@email.com')
  })
})
```
![](https://tva1.sinaimg.cn/large/0081Kckwgy1gky58klcykj30fn077dgb.jpg)


# 调试本地程序
1. 开启本地服务（前端服务）
2. 访问本地服务
3. 配置化访问本地服务

开启一个本地服务例如localhost:8080，然后访问它
```javascript
describe('The Home Page', () => {
    it('successfully loads', () => {
        cy.visit('http://localhost:8080')
    })
})

```

还可以通过配置cypress.json的方式来访问：
```json
{
    "baseUrl": "http://localhost:8080"
}

```
这样配置后，会自动的调用cy.visit()和cy.request()
```javascript
describe('The Home Page', () => {
    it('successfully loads', () => {
        cy.visit('/');
    })
})

```

# 测试策略
如何去测试、测试的边界和回归都决定于你和你的应用以及团队。但是依然有一些现代的web测试经验。

## 制造数据
总的来说，我们的web应用是受控于服务端的。我们使用JSON来与服务端进行通信，服务端的职责是返回能够反映某种状态的数据，一般来自于数据库。在自动化测试之前，web应用所做的就是CURD。去测试不同页面的状态，例如空页面或者分页页面，我们需要服务端才能使得状态能够被测试。

为了制造数据，有很多策略，在Cypress中有三种方法来帮助我们：
- cy.fixture(): 获取fixture数据
- cy.exec(): to run system commands 执行系统命令
- cy.task(): to run code in Node via the pluginsFile 在Node中执行代码
- cy.request(): to make HTTP requests 发起一个HTTP请求

如果你正在运行Node在你的服务端，你可能会在执行一个npm任务时，添加before和beforeEach的钩子函数：
```javascript
describe('The Home Page', () => {
    beforeEach(() => {
        // reset and seed the database prior to every test
        cy.exec('npm run db:reset && npm run db:seed');
    });
    
    it('successfully loads', () => {
        cy.visit('/');
    })
})

```
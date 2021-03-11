# 单元测试
`@nestjs/testing`包提供了一系列工具函数，帮助我们更好的进行 Nest 测试过程。

假设我们现在需要测试 CatsController 该 Controller 的 findAll() 调用 CatsService 的 findAll() 方法，所以我们重点需要测试 CatsController 的 findAll() 方法是否正常的调用了 CatsService 的 findAll() 方法。
```javascript
import  { Test } from '@nestjs/testing';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

describe('CatsController', () => {
  let catsController: CatsController;
  let catsService: CatsService;

  beforeEach(async () => {
    // 通过testing API 异步创建一个模块
    const moudleRef = await Test.createTestingModule({
      controllers: [CatsController],
      providers: [CatsSerivce],
    }).compile();

    catsService = moduleRef.get<CatsService>(CatsService);
    // 这里会自动的完成依赖注入
    catsController = moduleRef.get<CatsController>(CatsController);
  });

  describe('findAll', () => {
    if('should return an array of cats', async () => {
      // 测试的关键是查看是否调用
      const result = ['test'];
      // mock findAll方法的实现
      jest.spyOn(catsSetvice, 'findAll').mockImplementation(() => result);

      expect(await catsController.findAll()).toBe(result);
    })
  })
})
```
`Test` class 提供一个应用的执行上下文，这对 mock Nest 的运行时是非常必要的。`Test` class 拥有一个 `createTestingModule()` 方法，该方法接收一个 metadata 元数据对象，该对象和传递给 @Module 装饰器的一致，都是描述模块的 `元数据`。该方法返回一个 `TestingModule` 的实例，实例提供一些方法，对于单元测试来说，需要关注的是 `compile()` 方法，该方法启动一个模块(伴随它的依赖)，并且返回一个模块用于测试。

## 创建具有作用域范围的提供者
`TestingModule` 继承于 `模块的引用` 类，因此，它具有能力去创建一个 `具有作用域范围的` 提供者(transient or request-scoped)。我们可以通过 `resolve()` 方法来创建。
 
异步创建一个服务或者 Controller:
```javascript
const moduleRef = await Test.createTestingModule({
  controllers: [CatsController],
  providers: [CatsService],
}).compile();

catsService = await moduleRef.resolve(CatsService);
```

## 测试请求作用域范围(request-scoped)实例
`请求作用域范围`(request-scoped) 提供者在每一个请求来临时被创建，对应的实例将会被垃圾回收机制回收，当请求被处理完毕之后。这将会产生一个问题，因为我们没办法获取到由被测试请求生成的**依赖注入子树**（dependency injection sub-tree）。

我们知道，`resolve()`方法可以帮助我们创建一个动态的实例。并且我们可以传递一个独立的 `应用ID(context indentifier)` 去控制整个 `依赖注入容器子树` 的生命周期。那么我们如何将两者给结合起来，应用到测试用例中？

策略是生成一个 `应用ID` 并且强迫 Nest 去使用这个特制的 ID 去创建一个 子树(sub-tree) 为所有来临的请求。在这种情况下，我们可以在可测试的请求中重复获取实例。

为了实现这个策略，我们需要使用 `jest.spyOn()` 让 jest 植入到 `ContextIdFactory` 的 `'getByRequest'` 方法，并且 `mock` 它的实现：
```javascript
const contextId = ContextIdFactory.create();
jest
  .spyOn(ContextIdFactory, 'getByRequest')
  .mockImplementation(() => contextId);

```

现在，我们可以使用这个 `应用ID(contextId)` 去访问接下来的任何请求生成的 `依赖注入容器`:
```javascript
catsService = await moduleRef.resolve(CatsService, contextId);
```

# E2E
不同于单元测试，E2E测试集中于单独的模块和类，覆盖模块更高层次的交互（更加贴近终端用户的交互）。Nest使用 Supertest 库来模拟 HTTP requests.

```javascript
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { CatsModule } from '../src/cats/cats.module';
import { CatsService } from '../src/cats/cats.service';
import { INestApplication } from '@nestjs/common';

describe('Cats', () => {
  let app: INestApplication;
  let catsService = { findAll: () => ['test'] };

  beforeAll(async () => {
    // 测试模块，所以直接使用模块
    // 重写CatsService为自定义的对象
    // CatsController会调用CatsService，所以我们重写CatsService即可
    const moduleRef = await Test.createTestingModule({
      imports: [CatsModule],
    })
      .overrideProvider(CatsSerivce)
      .useValue(catsService)
      .compile();
    
    app = moduleRef.createNestApplication();
    await app.init();
  });

  it('/GET cats', () => {
    return request(app.getHttpServer())
      .get('/cats')
      .expect(200)
      .expect({
        data: catsService.findAll(),
      })
  });

  afterAll(async () => {
    await app.close();
  })
})


```
在这个例子中，我们替换了 `CatsService` 的实现，使用 `overrideProvider()` 提供一个替代的实现。同样的，Nest 提供了方法去重写 守卫(guards)、拦截器(interceptors)、过滤器(filters)和管道(pipes)，通过 `overrideGuard()`、`overrideInterceptor`、`overrideFilter()`、`overridePipe()`方法。

每个 override 方法都返回一个拥有以下三种方法的对象，用于描述自定义的提供者：
- useClass: 提供一个 class ，这个 class 将会被实例化，提供实例用于重写的对象(provider、guard等)。
- useValue: 提供一个实例用于重写的对象。
- useFactory: 提供一个函数方法，该函数返回的实例将会用于重写对象。

每一个 override 方法，相继的返回 `TestingModule` 实例，并且可以被其它方法串联起来，我们应该使用 `compile()` 方法在这个链式调用之后去让 Nest 实例化和初始化模块。

# 请求作用域实例

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

异步创建一个服务或者 Controller:
```javascript
const moduleRef = await Test.createTestingModule({
  controllers: [CatsController],
  providers: [CatsService],
}).compile();

catsService = await moduleRef.resolve(CatsService);
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

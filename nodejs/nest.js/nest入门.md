# 安装
[nest官网](https://docs.nestjs.cn/7/firststeps)

# 控制器-controller
> 控制器负责处理传入的请求和向客户端返回响应。
> 为了创建一个基本的控制器，Nest使用类和装饰器。装饰器将类与所需的元数据相关联，并使Nest能够创建路由映射（将请求绑定到相应的控制器）。


## 路由
> 路由机制控制哪个控制器接收哪些请求。通常控制器有多个路由。

查看以下例子，在Nest中，我们需要通过@Controller来创建一个控制器：
```javascript
import { Controller, Get } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Get()
  findAll(): string {
    return 'This action returs all cats';
  }
}

```
其中@Get()请求方法装饰器，告诉Nest为HTTP请求的特定端点创建处理程序。可以往@Get装饰器传入参数，代表路径，如果没有传，则可以认为是根路径，由于我们已经往@Controller内传入cats，则/cats就会映射到该函数。

> 所以Nest中的路由是 **@Controller+@Get/@Post** 的组合，分别指定 **Controller+Path**  
> 例如 **@Controller('customers')** 与 **@Get('profile')** 会为请求生成路由 **GET /customers/profile**

在上面的示例中，当对此端点发出GET请求时，会映射到findAll()处理方法。**注意，此处的函数名称完全是任意的。Nest不会对所选的函数名称附加任何意义。**

## 响应

此函数将返回 **200** 状态代码和相关的响应，在这种情况下只返回了一个字符串。 为什么会这样？ 首先介绍下Nest使用两种不同的操作响应选项概念：

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gmjvvcbz14j30se0gdjv8.jpg)


使用库express的方式：
```javascript
import { Controller, Get, Post, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@controller('cats')
export class CatsController {
  @Get()
  async findOne(@Res() res: Response) {
    res.setHeader('Content-Type', 'application/json');
    res.status(Http.status.OK);
    res.send({
      text: 'hello world';
    })
  }

  @Post() 
  create(@Res() res: Response) {
    res.status(HttpStatus.CREATED).send();
  }
}
```
虽然这种方法有效，在某些方面有更多的灵活性，但应该谨慎使用。这是因为失去了与Nest功能的兼容性，例如拦截器和@HttpCode()装饰器(不能共用)。此外，代码可能会变得依赖于平台(express等)，并且更难测试。  
因此，在可能的情况下，应该始终首选Nest标准方法。


## Request请求
Nest默认使用express的请求对象。我们可以强制Nest使用 **@Req()** 装饰器将请求对象注入处理程序。
```javascript
import { Controller, Get } from '@nestjs/common';
import { Request } from 'express';

@Controller('cats')
export class CatsController {
  @Get()
  findAll(@Req() request: Request): string {
    return 'This action returs all cats';
  }
}

```
**Request** 对象表示HTTP请求，并具有**Request**查询字符串、参数、HTTP头和正文的属性。但在大多数情况下，不必手动获取它们。我们可以使用专用的装饰器，比如开箱即用的 **@Body()** 和 **@Query()**。 装饰器和普通对象的比较：

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gmjwbix7e2j30sl0gvdg5.jpg)


## Restful API
添加一个POST处理程序：
```javascript
import { Controller, Get, Post } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Post()
  create(): string {
    return 'This action adds a new cat';
  }

  @Get()
  findAll(): string {
    return 'This action returns all cats';
  }
}
```
Nest以相同的方式提供其余的装饰器：
- @Put
- @Delete
- @Patch
- @options
- @Head
- @All

## 路由通配符
路由支持模式匹配。例如星号被用作通配符，将匹配任何字符串组成，
```javascript
@Get('ab*d');
findAkk()
 {
   return 'This route ueses a wildcard;'
 }
```
以上路由地址将匹配abcd、ab_cd、abecd等等。

## 状态码设置
如前面所说，默认情况下，响应的状态码总是200，除了 POST 请求外，此时它是201，我们可以通过在处理程序层添加@HttpCode（...） 装饰器来轻松更改此行为。

```javascript
import { HttpCode } from '@nestjs/common';
@Post()
@HttpCode(204);
create() {
  return 'This action adds a new Cat';
}

```

## Headers响应头
要指定自定义响应头，可以用@Header()修饰器或类库特有的响应对象(res.header()直接调用)。

```javascript
@Post()
@Header('Cache-Control', 'none');
create() {
  return 'This action adds a new cat';
}
```

## 重定向
要将响应重定向到特定的URL，可以使用@Redirect()装饰器或特定库的响应对象（res.redirect())。  
@Redirect()带有必须的url参数和可选的statusCode参数。如果省略，则statusCode默认为302(临时重定向)。
```javascript
@Get()
@Redirect('https://nestjs.com', 301)
```
有时候可能需要动态的重定向URL以及状态码，这个时候我们可以从对应的接口处理返回，返回对象包含url和statusCode(可选)
```json
{
  "url": string,
  "statusCode": number
}

```
返回的值将覆盖传递给@Redirect()装饰器的所有参数：
```javascript
@Get('docs')
@Redirect('https://docs.nestjs.com', 302)
getDocs(@Query('version') version) {
  if (version && version === '5') {
    return { url: 'https://docs.nestjs.com/v5/' }
  }
}

```

## 路由参数
当我们需要接收动态数据作为请求的一部分时，例如GET /cats/1，其中1指的是获取ID为1的cat。带有静态路径的路由将无法工作。为了定义带参数的路由，可以在路由中添加路由参数标记，以捕获请求URL中该位置的动态值。**并使用@Param()装饰器访问路由参数**
```javascript
@Get(':id')
findOne(@Param() params): string {
  console.log(params.id);
  return `this action returns a #${params.id} cat`;
}

```
可以使用特定的参数标记传递给装饰器，然后直接使用参数：
```javascript
@Get(':id')
findOne(@Param('id') id): string {
  return `This action returns a #${id} cat`;
}

```


## POST请求参数
之前的POST路由处理程序不接受任何客户端参数。如果要获取POST请求参数，可以使用 **@Body()** 参数来解决。

> 首先需要确定DTO(数据传输对象，实际上就是请求参数的结构体)，如果我们使用TS，可以简单的使用TS的interface或者ES6的class来实现这个对象。但是在nest中，推荐使用class， **这是由于TS的接口interface在编译过程中会被删除(TS本身是一种静态约束)，所以Nest不能在运行时引用它们。而class虽然是ES6的一部分，但编译后仍然会以ES5的原型形式存在，所以Nest可以在运行时进行引用。** 这一点很重要，因为诸如管道之类的特性在运行时能够访问变量的类型时，可以提供更多的可能性。

```javascript
// create-cat.dto.ts
export class CreateCatDto {
  readonly name: string;
  readonly age: number;
  readonly breed: string;
}

// cats.controller.ts
@Post()
create(@Body() createCatDto: CreateCatDto) {
  return {
    text: 'This action adds a new Cat'
  };
}

```
> 注意**@Body()**用于 **application/x-www-url-form-encoded** or **application/json**格式的解析，如果不是这两种，将取不到POST的请求参数。

我们可以通过fetch API来简单测试一下,首先启动应用，在控制台输入以下fetch请求
```javascript
const headers = new Headers({ 'Content-Type': 'application/json' });
const request = new Request('http://localhost:3000/cats', {
  method: 'POST',
  body: '{"name": "johe", "age": 24, "sex": "male"}',
  headers: headers
});
window.fetch(request).then(response => response.json()).then(result => console.log(result));

```
**需要注意的是，就像我们在响应章节里说的，正常情况下，返回的是对象或者数组时，将会自动序列化为JSON。如何是JS的基本类型，则只返回值，而不尝试序列化它。**
控制台有如下输出：
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gml66j3irnj30s004at8p.jpg)

可以看到命令行有如下输出：
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gml25nxuj2j31ro0gy1aq.jpg)

## 完整的Restful例子
```javascript 
import { Controller, Get, Query, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { CreateCatDto, UpdateCatDto, ListAllEntities } from './dto';

@Controller('cats')
export class CatsController {
  @Post()
  create(@Body() createCatDto: CreateCatDto) {
    return 'This action adds a new cat';
  }

  @Get()
  findAll(@Query() query: ListAllEntities) {
    return `This action returns all cats (limit: ${query.limit} items)`;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return `This action returns a #${id} cat`;
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateCatDto: UpdateCatDto) {
    return `This action updates a #${id} cat`;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return `This action removes a #${id} cat`;
  }
}
```
- 不管是什么请求，@Param用于获取路径path上的参数
- 不管是什么请求，@Body用于获取请求实体，需要设置请求实体的结构体
- @Query用于请求参数的获取

## 注册到模块
控制器已经准备就绪，可以使用，但是 Nest 不知道 CatsController 是否存在，所以它不会创建这个类的一个实例。

控制器总是属于模块，这就是为什么我们将 controllers 数组保存在 @module() 装饰器中。 由于除了根 ApplicationModule，我们没有其他模块，所以我们将使用它来介绍 CatsController：
```javascript
// app.module.ts

import { Module } from '@nestjs/common';
import { CatsController } from './cats/cats.controller';

@Module({
  controllers: [CatsController],
})
export class AppModule{}
```
我们使用 @Module()装饰器将元数据附加到模块类，Nest 现在可以轻松反映必须安装的控制器。

# 提供者Providers
> Providers是Nest的一个基本概念。许多基本的Nest类可以被视为provider-service,provider-repository,provider-factory,provider-helper等等。他们都可以通过contructor注入依赖关系。这意味着对象之间可以彼此创建各种关系，并且"连接"对象实例的功能在很大程度上可以由Nest运行时系统来完成。  
> Provider只是一个用@Injectable()装饰器注释的类

## 服务
创建一个CatsService，该服务负责数据存储和检索，因为它将被CatsController使用，因此它被定义为Provider是一个很好的选择(因为它将是一个可注入的类)。所以我们用@Injectable()来装饰类。

```javascript
// src/interface/cat.interface
export interface Cat {
  name: string;
  age: number;
  sex: string;
}

// src/cats.service.ts
import { Injectable } from '@nest/common';
import { Cat } from './interface/cat.interafce'

@Injectable()
export class CatsService {
  private readonly cats: Cat[] = [];

  addCat(cat: Cat) {
    this.cats.push(cat);
  }

  getCats(): Cat[] {
    return this.cats;
  }
}

```
现在让我们在CatsController里面使用这个服务：
```javascript
// src/Cats.controller.ts

import { Controller, Get, Post, Body } from '@nest/common';
import { CatsService } from './Cats.service';
import { Cat } from './interface/cat.interface'
import { CreateCatDto } from './create-cat.dto';

@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {}
  
  @Get()
  async getCats(): Promise<Cat[]> {
    return this.catsService.getCats();
  }

  @Post()
  addCat(@Body() createCatDto: CreateCatDto) {
    this.catsService.addCat(createCatDto);
  }
}
```
**CatsService**是通过类构造函数注入的。并且用到了私有属性private修饰符。

## 依赖注入
> 在上文中，我们看到了CatsService是通过构造函数注入的。在Nest中，借助TS的能力，管理依赖项非常容易。  
> Nest简历在强大的设计模式之上，这种设计模式通常称为依赖注入。这一概念在angular中也得到了使用。

那么TS的能力又是什么呢？其实主要借助了TS的语法糖能力，查看下面的示例代码：
```javascript
@Controller('cats')
export class CatsController {
  construtor(private readonly catsService: CatsService) {}
}
```
在TS中，其实等同于
```javascript
@Controller('cats')
export class CatsController {
  private readonly catsService: CatsSerivce;
  construtor(catsService: CatsService) {
    this.catService = catsSerivce;
  }
}
```
**在ts中，构造函数的参数如果加上了限定符(private、protected、public)之一时，会自动声明和赋值实例属性。**

那么Nest又做了什么呢？Nest在初始化CatsController的时候，传入了CatsService的一个实例。  
相当于：
```javascript
new CatsController(new CatsService());
```

## 生命周期
> Provider具有与应用程序生命周期同步的生命周期。在启动应用程序时，由于必须解析每个依赖项，所以必须实例化每个提供程序（也就是被@Injectable装饰的类，在启动应用程序的时候，都会被初始化，例如每一个service）

## 注册提供者到模块
我们需要在Nest中注册CatsService,以便它可以执行注入。我们可以在模块文件中将服务添加到@Module()装饰器的providers数组中：
```javascript
// app.module.ts
import { Module } from '@nestjs/common';
import { CatsController } from './Cats.Controller';
import { CatsService } from './Cats.Service';

@Module({
  controllers: [CatsController],
  providers: [CatsService]
})

```
得益于此，Nest现在能够解决CatsController类的依赖关系。

# 模块
> 模块是具有@Module()装饰器的类。@Module()装饰器提供了元数据，Nest用它来组织应用程序结构。
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gmmb4frgf7j30qy0emwej.jpg)

每个Nest应用至少有一个模块，即根模块。根模块是Nest开始安排应用程序树的地方。大多数情况下，我们将拥有多个模块，每个模块都有一组紧密相关的功能。

@Module()装饰器接受一个描述模块属性的对象：
```javascript
@Module({
  providers: [],
  controllers: [],
  imports: [],
  exports: [],
})
```
- providers: 由Nest注入器实例化的提供者，可以在整个模块中共享
- controllers: 必须创建的一组控制器
- imports: 导入模块的列表，这些模块导出了此模块中所需的提供者
- exports: 由本模块提供并在其他模块中可用的提供者的子集

默认情况下，模块会封装提供者，意味着没办法注入不是当前模块的组成部分(不存在providers数组中)，也不是从导入的模块导出的提供程序(imports中的模块中没有exports的提供者)。

## 功能模块
CatsController和CatsService属于同一个应用程序。应该考虑将它们移动到一个功能模块下，即CatsModule。然后将CatsModule导入到根模块（ApplicationModule）。
```javascript
// src/cats/cats.module.ts
import { Module } from '@nest/common';
import { CatsController } from './Cats.controller';
import { CatsService } from './Cats.service'

@Module({
  controllers: [CatsController],
  provifers: [CatsService],
})

export class CatsModule()
```
将该模块导入到根模块内(ApplicationModule):
```javascript
// src/app.module.ts
import { Module } from '@nestjs/common',
import { CatsMdule } from './cats/cats.module';

@Module({
  imports: [CatsModule],
})
export classs ApplicationModule();

```
我们现在的目录结构应该这样：
```
src
├──cats
│    ├──dto
│    │   └──create-cat.dto.ts
│    ├──interfaces
│    │     └──cat.interface.ts
│    ├─cats.service.ts
│    ├─cats.controller.ts
│    └──cats.module.ts
├──app.module.ts
└──main.ts

```

## 共享模块
> 在Nest中，默认情况下，模块是单例，因此我们可以轻松的在模块之间共享同一个提供者实例。
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gmmc91m49ij30qy0ad747.jpg)

**实际上，在Nest中每个模块都是一个共享模块。** 一旦创建就能被任意模块重复使用。假设我们将在几个模块之间共享CatsService实例，我们需要把CatsService放到exports数组中：
```javascript
// src/cats/cats.module.ts
import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
  exports: [CatsService],
})
export class CatsModule {};

```
现在，每个导入CatsModule的模块都可以访问CatsService，并且它们将共享相同的CatsService实例。

## 模块导出
模块可以导出它们的内部提供者（通过exports数组），也可以导出自己导入的模块（可以exports imports的模块）
```javascript
@Module({
  imports: [CommonModule],
  exports: [CommonModule]
})

export class CoreModule {}
```

## 依赖注入
提供者也可以注入到模块中(类)中（例如，用于配置目的）：
```javascript
// src/cats/cats.module.ts

import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

@Module({
  controller: [CatsController],
  providers: [CatsService]
})
export class CatsModule {
  constructor(private readonly catsService: CatsService) {}
}

```
由于[循环依赖性](https://docs.nestjs.cn/7/fundamentals?id=circular-dependency)，模块类不能注入到提供者中。


## 全局模块
**Nest将提供者封装在模块范围内，我们无法在其他地方使用模块的提供者而不导入他们。** 但是，有时候我们需要提供一组随时可用的东西，例如数据库连接。
```javascript
import { Module, Global } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

@Global()
@Module({
  controllers: [CatsController],
  proviers: [CatsService],
  exports: [CatsService],
})
export class CatsModule {}

```
> @Global 装饰器使模块称为全局作用域。全局模块应该只注册一次，最好由根或者核心模块注册。在上面的例子中，CatsService组件将无处不在，而想要使用CatsService的模块则不需要在imports数组中导入CatsModule。

使一切全局化并不是一个好的解决方案。 全局模块可用于减少必要模板文件的数量。 imports 数组仍然是使模块 API 透明的最佳方式。


# 中间件
**中间件是在路由处理程序之前调用的函数。** 中间件函数可以访问请求和响应对象，以及应用程序请求响应周期中的next()中间件函数。
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gmmdaxw7krj30qy0640sm.jpg)

Nest中间件实际上等价于express中间件。 中间件函数可以执行以下任务：
- 执行任何代码
- 对请求和响应对象进行更改
- 结束请求-响应周期
- 调用堆栈中的下一个中间件函数(next)
- 如果当前中间件函数没有结束请求-响应周期，它必须调用next()将控制传递给下一个中间件函数，否则请求会被挂起。

**可以在函数中或者具有@Injectable()装饰器的类中实现自定义Nest中间件。这个类应该实现NestMiddleware接口**
```javascript
// logger.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: Function) {
    console.log('Request...');
    next();
  }
}

```

## 依赖注入
Nest中间件完全支持依赖注入。就像提供者和控制器一样，它们能够注入属于同一模块的依赖项(@Module下的providers、imports等)，通过constructor。


## 应用中间件
中间件不能在 @Module() 装饰器中列出。我们必须使用模块类的 configure() 方法来设置它们。包含中间件的模块必须实现 NestModule 接口。我们将 LoggerMiddleware 设置在 ApplicationModule 层上。

```javascript 
// app.module.ts
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [CatsModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('cats');
  }
}
```
我们为之前在CatsController中定义的/cats路由处理程序设置了LoggerMiddleware。**还可以将包含路由路径的对象和请求方法传递给forRoutes()方法，进一步将中间件限制为特定的请求方法。**

在下面的示例中，我们导入了RequestMethod来引用所需的请求方法类型。
```javascript
// app.module.ts
import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [CatsModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({
        path: 'cats',
        method: RequestMethod.GET
      });
  }
}

```

简单来说在模块中设置中间件，有以下几点要求：
- 不能再在@Module装饰器中列出，需要在类的configure方法内设置
- 模块必须实现NestModule接口
- 使用模块消费者MiddlewareConsumer来设置中间件，其中forRoutes方法可以设置中间件处理的具体路由

> 可以使用 async/await来实现 configure()方法的异步化(例如，可以在 configure()方法体中等待异步操作的完成)。

路由支持模式匹配，例如星号被当做通配符：
```javascript
forRoutes({
  path: 'ab*cd',
  method: RequestMethod.ALL
});
```
以上路由地址将匹配abcd、ab_cd、abecd等等。

## 中间件消费者
MiddlewareConsumer是一个帮助类。它提供了集中内置方法来管理中间件。他们都可以被简单的链接起来。  
forRoutes()方法可以接受多种参数：
- 一个或者多个字符串,此时是路由列表
- 对象
- 一个Controller类或者多个Controller类，此时会把Controller内设置的路由全部应用中间件

下面是将中间件应用到单个控制器的示例：
```javascript
// src/app.module.ts
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { CatsModule } from './cats/cats.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CatsController } from './cats/cats.controller';

@Module({
  imports: [CatsModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes(CatsController);
  }
}

```
> apply()方法可以使用单个中间件，也可以使用多个参数来指定多个中间件，并且这些中间件会顺序执行。

```javascript
consumer.apply(cors(), helmet(), logger).forRoutes(CatsController);

```



有时我们想从应用中间件中排除某些路由。我们可以使用该 exclude() 方法轻松排除某些路线。此方法可以采用一个字符串，多个字符串或一个 RouteInfo 对象来标识要排除的路由，如下所示：
```javascript 
consumer
  .apply(LoggerMiddleware)
  .exclude(
    { path: 'cats', method: RequestMethod.GET },
    { path: 'cats', method: RequestMethod.POST },
    'cats/(.*)',
  )
  .forRoutes(CatsController);

```
在上面的示例中，LoggerMiddleware 将绑定到CatsController内部定义的所有路由，但排除传递给 exclude() 方法的路由。

## 函数式中间件
我们使用的 LoggerMiddleware 类非常简单。它没有成员，没有额外的方法，没有依赖关系。为什么我们不能只使用一个简单的函数？这是一个很好的问题，因为事实上 - 我们可以做到。这种类型的中间件称为函数式中间件。让我们把 logger 转换成函数。
```javascript
export function logger(req, res, next) {
  console.log(`Request...`);
  next();
};
```
然后在AppModule里面使用它：
```javascript
consumer
  .apply(logger)
  .forRoutes(CatsController);

```
> 当中间件没有任何依赖关系的时候，我们可以考虑使用函数式中间件。


## 全局中间件
如果我们想一次性将中间件绑定到每个注册路由，我们可以使用由INestApplication实例提供的 use()方法：

```javascript
const app = await NestFactory.create(AppModule);
app.use(logger);
await app.listen(3000);

```
- [安装](#安装)
- [控制器-controller](#控制器-controller)
  - [路由](#路由)
  - [响应](#响应)
  - [Request请求](#request请求)
  - [Restful API](#restful-api)
  - [路由通配符](#路由通配符)
  - [状态码设置](#状态码设置)
  - [Headers响应头](#headers响应头)
  - [重定向](#重定向)
  - [路由参数](#路由参数)
  - [POST请求参数](#post请求参数)
  - [完整的Restful例子](#完整的restful例子)
  - [注册到模块](#注册到模块)
- [提供者Providers](#提供者providers)
  - [服务](#服务)
  - [依赖注入](#依赖注入)
  - [生命周期](#生命周期)
  - [注册提供者到模块](#注册提供者到模块)
- [模块](#模块)
  - [功能模块](#功能模块)
  - [共享模块](#共享模块)
  - [模块导出](#模块导出)
  - [依赖注入](#依赖注入-1)
  - [全局模块](#全局模块)
- [中间件](#中间件)
  - [依赖注入](#依赖注入-2)
  - [应用中间件](#应用中间件)
  - [中间件消费者](#中间件消费者)
  - [函数式中间件](#函数式中间件)
  - [全局中间件](#全局中间件)
- [异常过滤器](#异常过滤器)
  - [基础异常类](#基础异常类)
  - [自定义异常](#自定义异常)
- [管道](#管道)
  - [自定义管道](#自定义管道)
  - [验证路由处理程序的参数](#验证路由处理程序的参数)
  - [配合Joi进行结构验证](#配合joi进行结构验证)
  - [配合class-validator的类验证器](#配合class-validator的类验证器)
    - [class-transformer](#class-transformer)
      - [简介](#简介)
      - [安装](#安装-1)
      - [方法](#方法)
    - [class-validator](#class-validator)
      - [使用](#使用)
    - [类验证器](#类验证器)
    - [使用管道](#使用管道)
    - [全局管道](#全局管道)
  - [转换管道](#转换管道)
  - [内置验证管道](#内置验证管道)
- [守卫](#守卫)
  - [授权守卫](#授权守卫)
  - [执行上下文](#执行上下文)
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

在Nest中，路由是由上到下按顺序匹配处理程序的，这意味着：
- 从上到下，请求处理程序优先级逐渐降低
- 同一个路由只能对应一个请求处理程序，不能对应多个

请求处理程序优先级逐渐降低：
```javascript
@Controller('cats')
export class CatsController {
  @Get(':id')
  getById(@Param('id') id) {
    
  }
  @Get('catch')
  catch() {

  }
}

```
由于:id会/cats/后紧跟的path作为id，所以/cats/catch会被/cats/:id捕获，由于路由从上到下处理，上面捕获的路由在下面则忽视，所以catch的处理程序并不会执行。

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
因为Controller也是路由的一部分，所以在@Controller装饰器上也可以设置路由参数，在@Controller上设置的路由参数，在所有的请求处理程序内都可以通过@Param获取。
```javascript
@Controller('accounts/:account')
export class AccountController {
  @Get('resource1/:someparam')
  getResource(@Param('account') account, @Param('someparam') someparam) {

  }
   
  @Get()
  getAccount(@Param('account') account) {

  }

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


# 异常过滤器
Nest内置的异常层负责处理整个应用程序中的所有抛出的异常。当捕获到未处理的异常时，最终用户将受到友好的响应。

每个异常都由全局异常过滤器处理，该过滤器处理类型 **HttpException及其子类** 的异常，当这个异常无法被识别时(既不是HttpException也不是继承的类HttpException)，用户将收到以下JSON响应：
```javascript
{
  "statusCode": 500,
  "message": "Internal server error"
}

```

## 基础异常类
Nest提供了一个内置的HttpException类，它从@nestjs/common包中导出。

假设在CatsController类里，我们有一个findAll()方法(GET路由)。假设此路由处理程序由于某种原因引发异常：
```javascript
import { Get, HttpException, HttpStatus.FORBIDDEN } from '@nestjs/common'
@Get()
async findAll() {
  throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
}

```
当客户端访问该路由时，响应如下所示：
```javascript
{
  "statusCode": 403,
  "message": "Forbidden"
}

```
**HttpException** 构造函数有两个必要的参数来决定响应：
- response: 参数定义JSON响应体，可以是string或object
- status: 参数定义HTTP状态代码

默认的响应主体包含两个属性：
- statusCode: 默认为status参数中提供的HTTP状态代码
- message: 基于状态的HTTP错误的简短描述

响应主体根据HttpException的response参数类型进行显示：
- 当response设置的是一个string时，采用默认的响应主体。此时：
  - response提供的值将作为默认响应主体的message。
  - status提供的值作为statusCode，并且设置Header的Status Code字段。
- 当response设置的是一个Object时，采用Object作为响应主体。此时：
  - response提供的Object将作为响应主体
  - status提供的值仅仅设置Header的Status Code字段。

一个覆盖响应体的例子：
```javascript
@Get()
async findAll() {
  throw new HttpException({
    status: HttpStatus.FORBIDDEN,
    error: 'This is a custom error message',
  }, HttpStatus.FORBIDDEN);
}

```

## 自定义异常
在许多情况下，我们无需编写自定义异常，而可以使用内置的Nest HTTP异常。如果真的需要创建自定义的异常，最好创建自己的异常层次结构。
其中自定义异常从HttpException类继承。使用这种方法，Nest可以识别异常，并自动处理错误响应。
```javascript
// forbidden.exception.ts
export class ForbiddenException extends HttpException {
  constructor() {
    super('Forbidden', HttpStatus.FORBIDDEN);
  }
}

```
在CatsController内使用：
```javascript
@Get()
async findAll() {
  throw new ForbiddenException();
}

```

# 管道
> 管道是具有@Injectable装饰器的类。管道应该实现PipeTransform接口。

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gmve3xpmg1j30n50d6mx5.jpg)

管道有两个类型：
- 转换：管道将输入数据转换为所需的数据输出。
- 验证：对输入数据进行验证，如果验证成功继续传递，验证失败则抛出异常。

在这两种情况下，**Nest会在调用控制器的理由处理程序之前插入管道，管道回显拦截方法的调用参数，进行转换或者是验证处理，然后用准换好或者是验证好的参数调用原方法。**

管道在异常区域内运行。这意味着当抛出异常时，它们由核心异常处理程序和应用于当前上下文的 异常过滤器 处理。当在 Pipe 中发生异常，controller 不会继续执行任何方法。

## 自定义管道
Nest自带六个开箱即用的管道，从@nestjs/common包中导出即：
- ValidationPipe
- ParseIntPipe
- ParseBoolPipe
- ParseArrayPipe
- ParseUUIDPipe
- DefaultValuePipe

手动构建一个ValidationPipe:
```javascript
// validate.pipe.ts

import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class ValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    return value;
  }
}

```
> PipeTransform<T, R>是一个通用接口，其中T表示value的类型，R表示transform()方法的返回类型。

**每个管道必须提供transform()方法**，这个方法有两个参数：
- value: 当前处理的参数
- metadata：元数据
元数据对象包含一些属性：
```javascript
export interface ArgumentMetadata {
  type: 'body' | 'query' | 'param' | 'custom';
  metaType?: Type<unknow>;
  data?: string;
}

```
| 参数 | 描述 |
|---|---|
| type | 告诉我们该属性是一个请求实体@Body()、查询参数@Query()还是路径参数@Param()，还是自定义参数 |
| metatype | 属性的元类型(就是参数的类型，如果是DTO则返回DTO，如果是string则返回String构造函数)，例如String，如果在函数签名中省略类型声明，或者使用原生JavaScript，则为undefined |
| data | 传递给装饰器的字符串，例如@Body('test')，如果括号留空，则为undefined |

> Typescript接口在编译期间消失，所以我们的DTO使用的接口而不是类的话，metatype的值将是一个Object。


## 验证路由处理程序的参数
我们来关注一下CatsController的create()方法。

```javascript
@Post()
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}

```

CreateCatDto的声明:
```javascript
export class CreateCatDto {
  name: string;
  age: number;
  breed: string;
}

```
我们要确保create方法能够正确的执行，则必须验证CreateCatDto里的三个属性。**虽然我们可以在路由处理程序方法中做到这一点，但是我们会打破单个责任原则(SRP,Single Resposibility Pricinple)。另一种方法是创建一个验证器类，并在那里委托任务。但是我们不得不每次都在方法开始的时候使用这个验证器。那么使用中间件验证呢？这可能是一个好主意，但是我们不可能创建一个整个应用程序通用的中间件，因为中间件不知道执行的环境，也不知道要调用的函数和它的参数（虽然可以获取到请求参数，但是不能知道它的DTO）**

在这种验证参数的场景下，我们应该使用管道。

## 配合Joi进行结构验证
有几种方式可以实现，一种常见的方式是使用基于结构的验证。[joi](https://github.com/sideway/joi)库允许我们使用一个可读的API以非常简单的方式创建schema(schema可以理解为ts中的Interface，只是通过joi来声明)。TS的类型验证不能再运行时进行验证，所以我们需要其他的结构声明&验证的库，joi库就能满足我们的要求。

```javascript
npm install --save @hapi/joi
npm install --save-dev @types/hapi__joi

```
joi的简单使用，声明一个结构，并对参数进行结构的验证：
```javascript
import * as Joi from '@hapi/joi';

const user = {
  username: 'johe'
}

const user2 = {
  username: 'j'
}

const schema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
  repeat_password: Joi.ref('password'),
  birth_year: Joi.number().integer().min(1900).max(2020),
});

// { value: { username: 'johe' }}
console.log(schema.validate(user));
/* { 
    value: { username: 'j'}, 
    error: { 
      details: [{
        message: "username" length must be at least 3 characters long"
        ...
      }] 
    }
  }
*/
console.log(schema.validate(user2));
```
我们通过Joi库创建了一个schema(schema可以理解为结构)，这个schema的username字段是必填的，并且必须是长度在3到30之间的字符串，然后通过schema的验证方法，我们可以验证输入的参数是否符合schema的规则。在正确的情况下，返回的字段里没有error，错误的情况下则有具体的error错误信息。

在下面的代码中，我们首先创建一个简单的class，在构造函数中传递schema参数，然后使用schema.validate()方法验证, 这段代码中，还没有指定控制器方法需要的schema。
```javascript
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ObjectSchema } from '@hapi/joi';

@Injectbale()
export class JoiValidationPipe implements PipeTransform {
  constructor(private schema: ObjectSchema) {}

  transform(value: any, metadata: ArgumentMetadata) {
    const { error } = this.schema.validate(value);
    if (error) {
      throw new BadRequestException('Validation failed');
    }
    return value;
  }
}

```
**绑定管道**，可以绑定在controller或者其方法上，我们可以使用 **@UsePipes()** 装饰器并创建一个管道实例。

```javascript
@Post()
@UsePipes(new JoiValidationPipe(createCatSchema))
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}

```

## 配合class-validator的类验证器
class-validator允许我们基于装饰器的验证。装饰器的功能非常强大，尤其是与Nest的Pipe功能相结合时使用，我们可以通过访问metatype信息做很多事情。
```shell
npm install --save class-validator class-transformer
```
安装完成后，我们就可以向CreateCatDto类添加一些装饰器
```javascript
// create-cat.dto.ts
import { IsString, IsInt } from 'class-validator';

export class CreateCatDto {
  @IsString()
  name: string;

  @IsInt()
  age: number;

  @IsString()
  breed: string;
}

```
类似的装饰器还有：@Length、@Contains()、@IsDate()等等，具体查看[class-validator](https://github.com/typestack/class-validator)

在接下来的代码示例中，用到了class-validator和[class-transformer](https://github.com/typestack/class-transformer),如果不明白这两个库的使用，看代码会有点懵，所以这里分别介绍下这两个库的使用和配合，这两个库的开发者是同一个人，并完成了很好的协同。

### class-transformer

#### 简介
在JS中,有两种类型对象：
- plain(literal)objects：对象字面量
- class(constructor)objects: 类

对象字面量(Plain objects)是Object构造函数的实例，而类对象是类的实例(类会定义构造函数、属性、及其方法等)。

也就是说plain objects通常是长这样的：
```javascript
const obj = {
  a: 1
}

const obj2 = new Object({
  a: 1
})
```
而类对象通常是这样的：
```javascript
class Obj {
  public readonly a: number;
}

```
**有的时候，我们需要将对象字面量转换成类对象，例如我们从后端加载json数据，通过JSON.parse进行解析之后，我们拥有了一个对象字面量，而不是一个已有DTO类的实例。**

例如我们现在有一个user.json:
```json
[
  {
    "id": 1,
    "firstName": "Johny",
    "lastName": "Cage",
    "age": 27
  },
  {
    "id": 2,
    "firstName": "Ismoil",
    "lastName": "Somoni",
    "age": 50
  },
  {
    "id": 3,
    "firstName": "Luke",
    "lastName": "Dacascos",
    "age": 12
  }
]

```
然后我们还有一个User的类：
```javascript
export class User {
  id: number;
  firstName: string;
  lastName: string;
  age: number;

  getName() {
    return this.firstName + ' ' + this.lastName;
  }

  isAdult() {
    return this.age > 36 && this.age < 60;
  }
}

```
这个时候，我们可能会假设我们正在下载用户列表，这些用户的数据类型就是User：
```javascript
fetch('users.json').then((users: User[]) => {
  // 我们在使用users的时候，类型提示能够得到很好的支持
  // 但是users的成员实际上并不是User的实例
  // 这意味着你不能使用User类的方法
})

```
在这段代码中，我们可以使用```users[0].id```或者```users[0].firstName```去访问User属性，但是我们没办使用```users[0].getName()```或者```users[0].isAdult()```，因为users的成员实际上并不是User类的实例，而是对象字面量。实际上这种写法只是欺骗了我们的编译器。

那么我们应该怎么做？如何让users数组的每个成员都称为User类的实例而不是字面量对象？其中一个解决方案是创建一个新的User类实例，然后再手动的奖所有属性都复制到这个新的User类实例里面。我们会很快的发现错误，当对象字面量的结构很复杂的时候。

这个时候就是class-transformer发挥作用的时候了，**class-transformer库的目的就是帮助我们将对象字面量映射称为我们已有类的实例**，按上面的例子来说，就是我们将users数组的对象字面量成员映射为User的实例。
```javascript
fetch('users.json').then((users: Object[]) => {
  const realUsers = plainToClass(User, users);
  // 现在每一个realUsers的成员都成为了User的实例
})

```
通过plaginToClass转化后，我们现在可以通过使用User的方法，例如```users[0].getName()```和```user[0].isAdult()```

#### 安装
Node端安装：
```shell
npm install class-transformer --save
npm install reflect-metadata --save
// optional可选
npm install es6-shim --save
```
其中**reflect-metadata**需要在全局中引入，例如app.ts:
```javascript
import 'reflect-metadata';
```
**es6-shim**模块是可选的，如果我们正在使用低版本不支持ES6的Node，则需要安装，并且同样在全局引入。

#### 方法
class-transformer包含以下方法：
- plainToClass(A, B): 这个方法转化对象字面量B为类A的实例，B可以是对象字面量数组。
- plainToClassFromExist(A', B): 这个方法将对象字面量B和类A的实例A'混合成一个新的实例
- classToPlain(A')：这个方法将A的实例A‘转化成对象字面量
- classToClass(A')：用于深拷贝实例
- seriablize(A'): 用于序列化实例，等同于classToPlain之后再JSON.stringify
- deserialize(A, B)和deserializeArray(A, ArrayOfB)：用于反序列化JSON为A的实例

使用例子：
```javascript
// plainToClass
import { plainToClass } from 'class-transformer';

let users = plainToClass(User, userJson); // to convert user plain object a single user. also supports arrays

// plainToClassFronExist
const defaultUser = new User();
defaultUser.role = 'user';

let mixedUser = plainToClassFromExist(defaultUser, user); // mixed user should have the value role = user when no value is set otherwise.

// classToPlain
import { classToPlain } from 'class-transformer';
let photo = classToPlain(photo);


// classToClass
import { classToClass } from 'class-transformer';
let photo = classToClass(photo);

// serialize
import { serialize } from 'class-transformer';
let photo = serialize(photo);

// deseriablize
import { deserialize } from 'class-transformer';
let photo = deserialize(Photo, photo);
```
**plainToClass方法，作用是将所有的对象字面量属性，设置到Class的实例内，尽管Class实例并没有声明这个属性**
```javascript
import { plainToClass } from 'class-transformer';

class User {
  id: number;
  firstName: string;
  lastName: string;
}

const fromPlainUser = {
  unknowProp: 'hello',
  firstName: 'Umed',
  lastName: 'Khudoiberdiev'
}

console.log(plainToClass(User, fromPlainUser));
/*
  User {
    unknowProp: 'hello there',
    firstName: 'Umed',
    lastName: 'Khudoiberdiev',
  }
*/

```
如果这个行为不符合你的要求，可以使用excludeExtraneousValues配置选项并且Expose所有的Class属性：
```javascript
import { Expose, plainToClass } from 'class-transformer';

class User {
  @Expose() id: number;
  @Expose() firstName: string;
  @Expose() lastName: string;
}

const fromPlainUser = {
  unkownProp: 'hello there',
  firstName: 'Umed',
  lastName: 'Khudoiberdiev',
};

console.log(plainToClass(User, fromPlainUser, { excludeExtraneousValues: true }));

// User {
//   id: undefined,
//   firstName: 'Umed',
//   lastName: 'Khudoiberdiev'
// }

```

### class-validator
class-validator简单来说就是提供类型声明和验证的库。

```javascript
npm install class-validator --save
```

#### 使用
在创建Class的时候，将class-validator提供的装饰器去装饰我们想要验证的属性，然后我们在实例化Class的时候，设置属性时会进行验证，也可以通过validate方法来验证实例是否满足Class的属性类型声明。
```javascript
import {
  validate,
  validateOrReject,
  Contains,
  IsInt,
  Length,
  IsEmail,
  IsFQDN,
  IsDate,
  Min,
  Max,
} from 'class-validator';

export class Post {
  @Length(10, 20)
  title: string;

  @Contains('hello')
  text: string;

  @IsInt()
  @Min(0)
  @Max(10)
  rating: number;

  @IsEmail()
  email: string;

  @IsFQDN()
  site: string;

  @IsDate()
  createDate: Date;
}

let post = new Post();
post.title = 'Hello'; // should not pass
post.text = 'this is a great post about hell world'; // should not pass
post.rating = 11; // should not pass
post.email = 'google.com'; // should not pass
post.site = 'googlecom'; // should not pass

validate(post).then(errors => {
  // errors is an array of validation errors
  if (errors.length > 0) {
    console.log('validation failed. errors: ', errors);
  } else {
    console.log('validation succeed');
  }
});

validateOrReject(post).catch(errors => {
  console.log('Promise rejected (validation failed). Errors: ', errors);
});
// or
async function validateOrRejectExample(input) {
  try {
    await validateOrReject(input);
  } catch (errors) {
    console.log('Caught promise rejection (validation failed). Errors: ', errors);
  }
}
```
返回的errors是一个ValidationError的对象数组，每一个ValidationError的结构如下：
```json
{
    target: Object; // Object that was validated.
    property: string; // Object's property that haven't pass validation.
    value: any; // Value that haven't pass a validation.
    constraints?: { // Constraints that failed validation with error messages.
        [type: string]: string;
    };
    children?: ValidationError[]; // Contains all nested validation errors of the property
}
```
在我们的例子中，错误可能会是这样：
```javascript
[{
    target: /* post object */,
    property: "title",
    value: "Hello",
    constraints: {
        length: "$property must be longer than or equal to 10 characters"
    }
}, {
    target: /* post object */,
    property: "text",
    value: "this is a great post about hell world",
    constraints: {
        contains: "text must contain a hello string"
    }
},
// and other errors
]

```
我们可以在装饰器的配置内设置验证的具体信息，当我们使用validate方法验证的时候，验证的错误信息会被返回给ValidationError对象。并且可以使用模板字符串：
- $value: 被验证的值
- $property: 被验证的属性
- $target: 被验证的class名
- $constraint1,$constraint2,... 装饰器的值
```javascript
import { MinLength, MaxLength, ValidationArguments } from 'class-validator';

export class Post {
  @MinLength(10, {
    message: (args: ValidationArguments) => {
      if (args.value.length === 1) {
        return 'Too short, minimum length is 1 character';
      } else {
        return 'Too short, minimum length is ' + args.constraints[0] + ' characters';
      }
    },
  })
  title: string;
}


```

### 类验证器
上文中已经介绍了class-transformer和class-validation的使用，可以知道这两个库分别的作用:
- class-transformer: 将对象字面量和class实例进行互相转换的库
- class-validation: 提供class属性类型声明的装饰器以及验证方法

假设我们现在需要对请求的参数进行验证，验证入参是否满足我们声明的DTO结构，来看下管道的写法：
```javascript
// validate.pipe.ts
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nest/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype) {
      return value;
    }
    const object = plainToClass(metatype, value);
    const errors = await validate(object);
    if (errors.length > 0) {
      throw new BadRequestException('Validation failed');
    }
    return value;
  }
}
```
上面的代码做了什么？让我们来一步步分析：
1. 实现一个管道
   1. 实现PipeTransform接口，该接口泛型的第一个参数为transform方法的传入值，第二个参数为返回值。
2. 使用class-transformer提供的plainToClass将传入的数据转换为meatatype的实例。
3. 通过class-validator提供的validate将metatype实例进行验证，如果验证不通过则返回BadRequestException异常。

注意上面的transform是异步的，由于class-validator的验证是可以异步的，所以Nest支持同步和异步的管道。

### 使用管道
参数范围的管道：
```javascript
@Post()
async create(@Body(new ValidationPipe()) createCatDto: CreateCatDto) {

}

```
方法范围的管道需要使用UsePipes()装饰器：
```javascript
import { Post, UsePipes } from '@nestjs/common';
@Post()
@UsePipes(new ValidationPipe())
async create(@Body() createCatDto: CreateCatDto) {

}

```

### 全局管道
```javascript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();

```
全局管道用于整个应用程序、每个控制器和每个路由处理程序。就依赖注入而言，从任何模块外部注册的全局管道（如上例所示）无法注入依赖，因为它们不属于任何模块。为了解决这个问题，可以使用以下构造直接为任何模块设置管道：
```javascript
import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';

@Module({
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe
    }
  ]
})
export class AppModule {}


```

## 转换管道
验证不是管道唯一的用处。在本章的开始部分，已经提到管道也可以将输入数据转换为所需的输出。这是可以的，因为从 transform 函数返回的值完全覆盖了参数先前的值。在什么时候使用？将客户端传来的数据经过一些修改，例如：
- 字符串转化为正数
- 有些数据具有默认值，用户不传时使用默认值

> 转换管道被插入在客户端请求和请求处理程序之间用来处理客户端请求。

例如：
```javascript
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const val = parseInt(value, 10);
    if (isNaN(val)) {
      throw new BadRequestException('Validation failed');
    }
    return val;
  }
}

```
处理参数id:
```javascript
@Get(':id')
async findOne(@Param('id', new ParseIntPipe()) id) {
  return await this.catsService.findOne(id);
}


```
我们可以在管道内根据ID从数据库中选择一个现有的用户实体：
```javascript
@Get(':id')
findOne(@Param('id', UserByIdPipe) userEntity: UserEntity) {
  return userEntity;
}

```
这个管道接收 id 参数并返回 UserEntity 数据, 这样做就可以抽象出一个根据 id 得到 UserEntity 的公共管道, 你的程序变得更符合声明式(Declarative 更好的代码语义和封装方式), 更 DRY (Don’t repeat yourself 减少重复代码) 编程规范.


## 内置验证管道
ValidationPipe和ParseIntPipe是内置管道，因此您不必自己构建这些管道（请记住， ValidationPipe 需要同时安装 class-validator 和 class-transformer 包）。与本章中构建ValidationPipe的示例相比，该内置的功能提供了[更多](https://docs.nestjs.cn/7/techniques/validation)的选项。


# 守卫
> 守卫是一个使用@Injectable()装饰器的类，守卫应该实现CanActivate接口。

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gmyr32z5s4j30p607hmx2.jpg)

守卫有一个单独的责任。它们根据运行时出现的某些条件(例如权限、角色、访问控制列表等)来确定给定的请求是否由路由处理程序处理。这通常称为授权。**在传统的Express应用程序中，通常由中间件处理授权。中间件是身份验证的良好选择。** 到目前为止，访问限制逻辑大多在中间件中。**但是中间件不知道调用next()函数之后会执行哪个处理程序**。**另一方面，守卫可以访问ExecutionContext实例，因此确切的知道接下来要执行什么。**守卫的设计与异常过滤器，管道和拦截器非常相似，目的是让你在请求/响应周期的正确位置插入处理逻辑，并以声明的方式进行插入。这有助于保持代码的简洁和声明性。

> 守卫在每个中间件之后执行，但在任何拦截器或者管道之前执行。

## 授权守卫
假设我们现在有授权守卫，用户是经过身份验证的，它将提取和验证token，确定请求是否可以继续。

```javascript
// auth.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  CanActivate(context: ExecutionContext):
    boolean | Promise<boolean> | Observable<boolean> {
      const request = context.switchToHttp().getRequest();
      return validateRequest(request);
    }
}

```
如何实现一个守卫？每个守卫必须实现一个canActivate函数（所以需要实现CanActivate）此函数应该返回一个布尔值，指示是否允许当前请求。它可以同步或者异步的返回响应(通过Promise或者Observable)
- 如果返回true，将处理用户调用
- false则忽略当前处理的请求

## 执行上下文
canActivate()函数接受参数ExecutionContext实例。ExecutionContext继承自ArgumentHost，ArgumentHost是传递给原始处理程序的参数包装器。  
ExecutionContext提供了更多功能，它拓展了ArgumentsHost，但是也提供了有关当前执行过程的更多信息：
```javascript
export interface ExecutionContext extends ArgumentHost {
  getClass<T = any>()： Type<T>;
  getHandler(): Function;
}

```
getHandler()方法返回对将要调用的处理程序的引用。getClass()方法返回这个特定处理程序所属的 Controller 类的类型。例如，如果当前处理的请求是 POST 请求，目标是 CatsController上的 create() 方法，那么 getHandler() 将返回对 create() 方法的引用，而 getClass()将返回一个CatsControllertype(而不是实例)。
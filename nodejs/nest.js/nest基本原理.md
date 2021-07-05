- [控制反转](#控制反转)
  - [什么是控制反转](#什么是控制反转)
- [依赖注入](#依赖注入)
  - [什么是依赖](#什么是依赖)
  - [什么是依赖注入](#什么是依赖注入)
- [Nest中的依赖注入](#nest中的依赖注入)
- [自定义提供者](#自定义提供者)
  - [字符串令牌提供者](#字符串令牌提供者)
  - [useClass](#useclass)
  - [useFactory](#usefactory)
  - [导出自定义提供者](#导出自定义提供者)
  - [提供者注入](#提供者注入)
- [动态模块](#动态模块)
  - [静态模块的绑定](#静态模块的绑定)
  - [动态模块定义](#动态模块定义)
  - [配置模块实例](#配置模块实例)
  - [可配置模块的实现](#可配置模块的实现)
- [作用域](#作用域)
  - [提供者作用域](#提供者作用域)
  - [控制器作用域](#控制器作用域)
  - [作用域制度](#作用域制度)
  - [获取原始请求对象(REQUEST)](#获取原始请求对象request)
- [模块的引用](#模块的引用)
  - [获取实例(控制器、提供者、任何可注入类)](#获取实例控制器提供者任何可注入类)
  - [获取具有作用域的实例](#获取具有作用域的实例)
  - [动态创建实例(用于未注册的提供者)](#动态创建实例用于未注册的提供者)
- [生命周期事件](#生命周期事件)
  - [生命周期](#生命周期)
  - [生命周期使用](#生命周期使用)
    - [异步的初始化](#异步的初始化)
# 控制反转
> Nest被称为Node的spring框架。Nest的核心原理之一和spring框架一样，都是IoC容器(Nest运行时系统)。
> 依赖注入是一种控制反转(IoC)技术，我们可以将依赖的实例化委派给IoC容器，而不是在自己的代码中执行。

## 什么是控制反转
在讨论控制反转之前，我们先来看看软件系统中耦合的对象。

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gmzx95a2c0j309k05l74o.jpg)

从图中可以看到，软件中的对象就像齿轮一样，协同工作，但是互相耦合，一个零件不能正常工作，整个系统就崩溃了。**齿轮组中齿轮之间的关系，与对象之间的耦合关系非常相似。**对象之间的耦合关系是无法避免的，也是必要的，这是协同工作的基础。**随着软件规模庞大，对象之间的依赖关系也越来越复杂，经常会出现对象之间的多重依赖性关系。对象之间耦合度过高的系统，必然会出现牵一发而动全身的情形。**

> 控制反转(Iversion of Control)是一种面向对象编程中的一种设计原则，用来减低计算机代码之间的耦合度，基本思想是借助于"第三方"实现具有依赖关系的对象之间的解耦。

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gmzxhe1ejwj30a8051q2y.jpg)

由于引进了第三方，也就是IoC容器，使得A、B、C、D这4个对象没有了耦合关系，齿轮之间的转动全部依靠第三方了，全部对象的控制权全部上缴给第三方IOC容器，所以，IOC容器成了整个系统的核心。  

那么，为什么要叫做控制反转？
1. 软件系统在没有引入IoC容器之前，对象之间互相依赖，例如对象A依赖于对象B，那么对象A在初始化或者运行到某一点的时候，自己必须主动去创建对象B或者使用已经创建的对象B，无论是创建还是使用对象B，控制权都在自己手上。
2. 软件系统在引入IoC容器之后，由于IoC容器的加入，对象A与对象B之间失去了直接联系，所以对象A在需要对象B的时候，IoC容器会主动创建一个对象B注入到对象A需要的地方。

**通过引入IoC容器前后的对比，我们不难看出，引入IoC容器之后，对象A获得依赖对象B的过程，由主动行为变成了被动行为，控制权颠倒了，这就是“控制反转”名称的由来。**

# 依赖注入
> 依赖注入就是将实例变量传入到一个对象中去。(Dependency injection means giving an object its instance variables)

## 什么是依赖
如果在Class A中，有Class B的依赖，则称Class A对Class B有一个依赖。

例如以下类Human中用到了一个Father对象，我们就说类Human对类Father有一个依赖。
```javascript
class Human {
  public father: Father;
  constructor() {
    this.father = new Father();
  }
}

```
仔细看这段代码，我们会发现一些问题：
1. 如果现在要改变father生成方式，例如我们需要用new Father(name)初始化father，则需要修改Human代码。
2. 如果想测试不同Father对象对Human的影响很困难，因为father初始化已经被写死。
3. 如果new Father()过程非常缓慢，单测时我们希望用已经初始化的father对象Mock掉这个过程也很困难。
4. Father实例不能被共享。

## 什么是依赖注入
上面讲依赖在构造函数中直接初始化的弊端在于两个类不够独立，不方便测试，实例不能共享。我们还有一种初始化方式：
```javascript
class Human {
  constructor(public father: Father) {
    this.father = father;
  }
}

```
上面代码中，我们将father对象作为构造函数的一个参数传入，**在调用Human的构造方法之前外部就已经初始化好了Father对象。**  
**像这种非主动初始化依赖，而通过外部来传入依赖的方式，我们就称为依赖注入。**

我们发现上存在的问题都很好的解决了。

我们已经分别解释了控制反转和依赖注入的概念，有些人会把控制反转和依赖注入等同，但实际上它们有着本质上的不同。
- 控制反转是一种软件工程的解耦思想
- 依赖注入是一种设计模式，IoC框架使用依赖注入来实现控制反转


# Nest中的依赖注入
> @Injectable()装饰器将类标记为提供者。  
> 要怎么理解@Injectable()呢？@Injectable()直译为可注入的类，意味着这个类可能在某处被注入，也就是这个类可以被作为依赖被注入。

>! 注意，可以注入的并不仅仅是类，可以是任何数据类型。例如常量、对象等等。

首先我们定义一个提供者CatsService：
```javascript
// cats.service.ts
import { Injectable } from '@nestjs/common';
import { Cat } from './interfaces/cat.interface';

@Injectable()
export class CatsService {
  private readonly cats: Cat[] = [];

  findAll(): Cat[] {
    return this.cats;
  }
}
```
然后我们要求nest将提供者注入到我们的控制器类中：
```javascript
import { Controller, Get } from '@nestjs/common';
import { CatsService } from './cats.service';
import { Cat } from './interfaces/cat.interface';

@Controller('cats')
export class CatsController {
  // 这里是重点
  constructor(private readonly CatsService: CatsService) {}

  @Get()
  async findAll(): Promise<Cat[]> {
    return this.catsService.findAll();
  }
}

```
上面的写法，就是依赖注入的写法，**意味着我们需要一个CatsService的实例被注入**。

> 上面的构造函数中为什么不需要写```this.catsService = catsService```呢？这是Typescript提供的语法糖。

最后，我们在Nest IoC容器中注册提供者：
```javascript
import { Module } from '@nestjs/common';
import { CatsController } from './cats/cats.controller';
import { CatsService } from './cats/cats.service';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
export class AppModule {}
```
这个过程中有三个关键步骤：
1. 用@Injectbale()装饰器声明CatsService类是一个可以由Nest IoC容器管理的类。
2. 在Controller中声明了一个依赖于CatsService的注入。
```javascript
constructor(private readonly catsService: CatsService)
```
3. 在app.module.ts中，我们将标记CatsService与Cats.service.ts文件中的CatsService类相关联。

> 当Nest IoC容器实例化CatsController的时候，会首先查找Controller所有的依赖项。当找到CatsService依赖项时，Nest会查找CatsService令牌的提供者，Nest将创建CatsService令牌提供者的实例，将其缓存并且返回，或者如果已经有缓存，则返回现有实例。

什么叫CatsService令牌的提供者？实际上，在app.module.ts中的提供者中，我们可以这样写：
```javascript
providers: [
  {
    provide: CatsService,
    useClass: CatsService,
  }
]

```
**在这里，我们明确地将令牌CatsService与类CatsService关联起来。这也意味着我们能够改变令牌的提供者，方便我们更加灵活的改变提供者或者是测试**

# 自定义提供者
在上面的例子中，我们通过provide属性和useClass属性将CatsSerivce令牌与CatsService类进行绑定，这样看起来灵活性很低，例如我们有以下要求时：
- 当我们需要自定义类的实例，而不是让Nest实例化，例如我们需要在实例时传入参数
- 当我们想要重用现有的类
- 当我们需要使用不同的提供者测试时

Nest可以让我们自定义提供程序来处理这些情况。包括但不限于以下几个属性
- useValue(值提供者)：通常用于注入常量值、外部库、模拟对象等等。
- useClass(类提供者)：通常用于绑定令牌应解析的类。
- useFactory(工厂提供者)：用工厂函数的方法，返回实际的provider。用于动态创建提供程序。
  
其中useValue、useFactory提供的依赖是可以直接被用的，而类提供者，Nest会进行实例化。

标准的提供者示例：
```javascript
@Module({
  controllers: [CatsController],
  providers: [CatsService],
})

```
providers 属性接受一个提供者数组。到目前为止，我们已经通过一个类名列表提供了这些提供者。 实际上，改语法是一种 useClass 的语法糖：
```javascript
providers: [
  {
    provider: CatsSerivce,
    useClass: CatsService,
  }
]

```
在这里我们明确的将令牌 `CatsSerivce` 与类 `CatsService` 关联起来。

## 字符串令牌提供者
上面的例子中，我们的令牌都是类名。有时候，我们可能希望灵活使用字符串或者符号作为` DI(Dependence Injection) `令牌。例如：
```javascript
import { connection } from './connection';
@Module({
  providers: [
    {
      provide: 'CONNECTION',
      useValue: connection,
    }
  ],
})
export class AppModule {}

```
在本例中，我们将字符串令牌 `CONNECTION` 与外部导入的 connection 进行关联。

同样的，以字符串作为令牌的提供者，依然可以依靠 `依赖注入` 能力进行注入，但是我们要用的 `@Inject()`  装饰器，这个装饰器接受令牌作为参数：
```javascript
import { Inject, Injectable } from '@nestjs/common';
@Injectable()
export class CatsRepository {
  constructor(@Inject('CONNECTION') connection: Connection) {}
}

```
为了清晰的代码组织，最佳时间是在单独的文件中（例如 constants.ts ）中定义字符串提供者令牌。

## useClass
我们可以动态确定令牌对应解析为的类，例如假设我们现在有一个抽象(或者默认)的 `ConfigService` 类，我们希望根据当前环境，提供不同的提供者实现：
```javascript
import ConfigService from './config.service';
const configServiceProvider = {
  provider: ConfigService,
  useClass: 
    process.env.NODE_ENV === 'development'
      ? DevelopmentConfigService
      : ProductionConfigService,
};

@Module({
  providers: [configServiceProvider],
})
export class AppModule{}
```
我们使用 ConfigService 类名称作为令牌。 对于任何依赖 ConfigService 的类，Nest 都会注入提供的类的实例 `DevelopmentConfigService` 或 `ProductionConfigService`


## useFactory
`useFactory` 语法允许动态创建提供程序。工厂函数返回实际的 `provier`。工厂功能可能会依赖于任何其他的提供者。

工厂函数提供者语法有一对相关的机制：
1. 工厂函数可以接收(可选)参数。
2. `inject` 属性接受一个提供者数组，在实例化过程中，`Nest` 将解析数组并将其作为参数传递给工厂函数。Nest 将从 inject 列表中以相同的顺序将实例作为参数传递给工厂函数。

```javascript
const connectionFactory = {
  provide: 'CONNECTION',
  useFactory: (optionsProvider: OptionsProvider) => {
    const options = optionsProvder.get();
    return new DatabaseConnection(options);
  },
  inject: [OptionsProvider],
};

@Module({
  providers: [connectionFactory],
})
export class AppModule {}

```

异步的提供者，使用`async/await`语法，工厂函数返回一个Promise：
```javascript
{
  provide: 'ASYNC_CONNECTION',
  useFactory: async () => {
    const connection = await createConnection(options);
    return connection;
  },
}

```

## 导出自定义提供者
与任何提供陈红旭一样，自定义提供程序的作用域仅限于其生命模块。要使它对其他模块可见，必须导出它。我们可以导出其令牌或者完整的提供程序对象：
```javascript
const connectionFactory = {
  provide: 'CONNECTION',
  useFactory: (optionsProvider: OptionsProvider) => {
    const options = optionsProvder.get();
    return new DatabaseConnection(options);
  },
  inject: [OptionsProvider],
};

@Module({
  providers: [connectionFactory],
  exports: ['CONNECTION'],
  // or 
  // exports: [connectionFactory],
})
export class AppModule {}

```

## 提供者注入
标准提供者的注入不需要进行显示注入，通过在构造函数声明类型即可。自定义提供者需要显示注入，利用 `@Inject` 装饰器：
```javascript
import { Injectable, Inject } from '@nestjs/common'

@Injectable()
export class CatsRepository {
  constructor(@Inject('CONNECTION') connection: Connection) {}
}


```

# 动态模块
## 静态模块的绑定
模块定义像 `提供者` 和 `控制器` 这样的组件组，它们为这些组件提供了`执行上下文`和`范围`。例如，**在模块中定义的提供程序对模块的其他成员可见，当提供者需要在模块外部可见时，它首先从其主机模块导出，然后导入到其消费模块。**

首先我们将定义一个 `UsersModule` 来提供和导出 `UsersService`。 `UsersModule` 是 `UsersService` 的主模块。

```javascript
import { Module } from '@nestjs/common';
import { UsersService } from './users/service';

@Module({
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

```
接下来，我们将定义一个 `AuthModule` , 它导入 `UsersModule` ，使得 `UsersModule` 导出的提供程序在 `AuthModule` 中可用：
```javascript
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}

```
这使得我们能够在 `AuthModule` 的提供程序中(例如`AuthService`)注入 `UsersService`:
```javascript
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}
}

```
我们将其称为`静态模块绑定`。Nest 在`主模块`和`消费模块`中已经声明了连接模块所需的所有信息。

Nest 通过以下方式使得 `UsersService` 在 `AutModule` 中可用：
1. 实例化 `UsersModule`, 包括传递导入 `UsersModule` 本身使用的其他模块，以及传递的任何依赖项。
2. 实例化 `AuthModule`，并将 `UsersModule` 导出的提供程序提供给 `AuthModule` 中的组件。
3. 在 `AuthService` 中注入 `UsersService` 实例。

## 动态模块定义
在静态模块绑定的方式下，**消费模块没有机会去影响主机模块怎么样配置提供者**。为什么消费模块可以配置主机模块的提供者这一点很重要？考虑以下场景，我们可能会有一个通用模块，这个模块在不同的需求下返回不同的实例。在许多不同的系统中，这通常可以被称为 `插件` 机制。在 `插件` 被消费者使用之前，它们通常需要一些配置。

在 Nest 中，一个好的例子是 `配置模块`(configuration module)， 使用 `配置模块` 来 `外部化` 配置信息对应用程序来说非常有用。**这使得应用程序可以很好的根据不同的环境来动态更改应用配置。**例如，在开发环境下使用开发数据库、测试环境下使用测试数据库等等。

**通过将配置参数的管理，委派给配置模块，使得应用程序能够保持独立于配置参数**

由于配置模块是通用的，需要由它的消费模块进行定制。动态模块在这里就可以发挥作用，利用动态模块的特性，我们可以让配置模块称为动态模块，这样消费模块就可以在导入配置模块时，使用 `API` 来定制配置模块。

**总的来说，动态模块提供 `API`用于消费模块导入主机模块时，定制主机模块的属性和行为。**


## 配置模块实例
我们的需求是让 `ConfigModule` 能够接受 `参数` 对象去定制化它，`动态模块` 给我们在导入模块时，传递参数给模块的能力。

仔细观察模块元数据 `imports` 的不同：
```javascript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [ConfigModule.register({ folder: './config' })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```
让我们来看看上面的动态模块例子发生了什么？
1. `ConfigModule` 是一个普通的 `class`，我们可以推测它必须拥有一个 `静态方法` 叫做 `register()`。我们清楚该方法是`静态的`，因为我们通过 `ConfigModule` 类来直接调用它，而不是 `ConfigModule` 类的一个实例。这个方法的名字实际上可以叫做任何名字，只是 `按照惯例` 我们会叫做 `forRoot()` 或者 `register()`
2. `register()` 方法是我们可以定义的，所以我们按照意愿接受任何参数
3. 由于我们在 AppModule 元数据的 imports 数组中使用了 `register()` 方法，所以我们可以推测 `register()` 方法应该返回一个类似于 AppModule 的模块。

实际上，`register()`方法返回的模块，我们称为 `动态模块(DynamicModule)`, 一个 `动态模块` 就像我们创建 `静态模块` 时提供的元数据对象一样，只不过拥有了另外的一个属性: `module`。

为了让 `register()` 返回 `动态模块`， 我们需要定义一个 `DynamicModule` 的接口来约束它。

```javascript
import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from './config.service';

@Module({})
export class ConfigModule {
  static register(): DynamicModule {
    return {
      module: ConfigModule,
      providers: [ConfigService],
      exports: [ConfigService],
    }
  }
}

```
通过上面的例子，我们可以知道：
1. `@Module` 装饰器不仅可以接收一个模块类，还可以接收一个 `动态模块` 对象，例如 ```imports: [ConfigModule.register(...)]```
2. 动态模块可以引入其他模块，如果动态模块依赖其他模块的提供者，可以通过动态模块的 `imports` 属性导入它们。


## 可配置模块的实现
假设我们现在有一个可配置模块的提供者叫做 `ConfigService` ，它根据实例化时传入的参数，来决定读取不同环境下的配置，并提供一个 get 方法来获取具体的配置参数。

为了简单展示 `ConfigService` 的功能，我们先硬编码所有的参数： 
```javascript
import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { EnvConfig } from './interfaces';

@Injectable()
export class ConfigService {
  private readonly envConfig: EnvConfig;

  constructor() {
    const options = { folder: './config' };
    const filePath = `${process.env.NODE_ENV || 'development'}.env`;
    const envFile = path.resolve(__dirname, '../../', options.folder, filePath);
    this.envConfig = dotenv.parse(fs.readFileSync(envFile));
  }

  get(key: string): string {
    return this.envConfig[key];
  }
}
 
```
现在， `ConfigService` 可以根据环境去找对应的环境配置了，但美中不足的是，**我们的文件夹路径是硬编码的**，所以我们接下来的任务是让 `ConfigSerivce`的构造函数接收参数，为了做到这一点，我们需要在 `ConfigModule` 的 `@Module` 接收元数据对象的 `imports` 属性中定义 `options` 的提供者。但很不巧，我们的 `ConfigModule` 是一个 `动态模块`，所以我们不能在 `@Module` 装饰器进行定义。我们应该在 `register()` 方法返回的 `动态模块对象` 内的 `imports` 数组进行 `options` 的提供者定义。这样定义的好处也是显而易见的，`register()`方法能够接受从消费模块传入的参数，使得我们的 `options` 也是动态的。

```javascript
import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from './config.service';

@Module({})
export class ConfigModule {
  static register(options): DynamicModule {
    return {
      module: ConfigModule,
      providers: [
        // 自定义提供者，将消费模块传入的options作为值
        {
          provider: 'CONFIG_OPTIONS',
          useValue: options,
        },
        ConfigService,
      ],
      exports: [ConfigService],
    }
  }
}

```
现在，我们可以利用 `依赖注入` 的机制，通过 `@Inject()` 将 `'CONFIG_OPTIONS'` 提供者注入到 `ConfigService` 的构造函数内。
```javascript
import { Inject, Injectable } from '@nestjs/common';
import { EnvConfig } from './interfaces';

@Inejctable()
export class ConfigService {
  private readonly envConfig: EnvConfig;

  constructor(@Inject('CONFIG_OPTIONS') private options) {
    const filePath = `${process.env.NODE_EN || 'development'}.env`;
    const envFile = path.resolve(__dirname, '../../', options.folder, filePath);
    this.envConfig = dotenv.parse(fs.readFileSync(envFile));
  }

  get(key: string): string {
    return this.envConfig[key];
  }

}

```
上面的示例中，我们使用了 `'CONFIG_OPTIONS'` 这个字符串令牌，并在 `ConfigModule` 和 `ConfigService` 中进行使用，最佳实践是我们通过常量的形式来存储这个令牌：
```javascript
// ./constants.ts
const CONFIG_OPTIONS = 'CONFIG_OPTIONS';
```

# 作用域
## 提供者作用域
一个提供者可能会有以下几种类型的作用域：
| 类型 | 作用域 |
|---|---|
| DEFAULT | 一个单例的提供者将会被整个应用共享，提供者实例的生命周期与应用声明周期直接绑定，当应用被启动的时候，所有的单例提供者将会被初始化，单例模式是默认的作用域。 |
| REQUEST | 每一个请求就会有一个新的实例，这个实例将会被垃圾回收机制回收，当一个请求完成了它的处理过程 |
| TRANSIENT | 临时(Transient)提供者将不会被消费者分享，每一个消费者对其进行注入时，都是一个新的实例 |

> 提示： 使用单例作用域是被官方推荐的，在不同的消费者和请求之间共享实例，意味着实例可以被缓存，并且在应用启动的过程中，初始化过程只会发生一次。

我们可以通过传递 `scope` 属性给 `@Injectable()` 装饰器来设置提供者的作用域。

```javascript
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class CatsService {}

```

同样的，对于自定义提供者，通过 `scope` 属性来设置：
```javascript
{
  provide: 'CACHE_MANAGER',
  useClass: CacheManager,
  scope: Scope.TRANSIENT,
}

```

## 控制器作用域
控制器也拥有作用域，它将会被应用于控制器的请求处理范围。和提供者类似，控制器的作用域声明了它的生命周期。对于一个 `request-scoped` (请求范围) 的控制器，每一个请求都会创建一个新的控制器实例，并且在请求处理完毕之后会被垃圾回收机制回收。

```javascript
@Controller({
  path: 'cats',
  scope: Scope.REQUEST,
})
export class CatsController {}
```

## 作用域制度
作用域将会在注入链中冒泡。如果一个控制器依赖了一个请求范围(`request-scoped`)的作用域的提供者，它也将变成请求范围的控制器。

假设我们有以下依赖图：  
`CatsController <- CatsService <- CatsRepository`，如果 `CatsService` 是一个 `请求范围` 作用域的提供者(其他默认是单例)，那么 `CatsController` 将会变成 `请求范围` 作用域的控制器，因为它依赖于它注入的服务，而 `CatsRepository` 没有依赖任何人，所以它将保持单例模式。

## 获取原始请求对象(REQUEST)
在一个 HTTP 应用下，我们可能会需要获取原始的请求对象引用，当我们在使用 `请求作用域的` 提供者时。我们可以通过注入 `REQUEST` 令牌来获取：
```javascript
import { Injectable, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class CatsService {
  constructor(@Inject(REQUEST) private request: Request) {}
}

```
在不同的系统或者协议下，获取请求对象的方式可能不同，例如在 `GraphQL` 应用下，我们需要注入 `CONTEXT` 令牌而不是 `REQEUST`:
```javascript
import { Injectable, Scope, Inject } from '@nestjs/common';
import { CONTEXT } from '@nestjs/graphql';

@Injectable({ scope: Scope.REQUEST })
export class CatsService {
  constructor(@Inject(CONTEXT) private context) {}
}

```

# 模块的引用
Nest 提供 `ModuleRef` 类，该类可以获取内部(`internal`)的提供者或者任何以注入令牌(`token`)作为查询(`lookup`)key的提供者。`ModuleRef` 类还提供方法去动态的初始化静态的和作用域范围的提供者。

```javascript
import { ModuleRef } from '@nestjs/core';
@Injetable()
export class CatsService {
  constructor(private moduleRef: ModuleRef)
}

```

## 获取实例(控制器、提供者、任何可注入类)
`ModuleRef` 实例拥有一个 `get()` 方法，该方法可以用于获取 `提供者` 、 `控制器` 、 `可注入类(例如守卫、拦截器、管道等)`，只要它们这些可注入类使用 token 或者 class 名称作为注入的令牌。

```javascript
@Injectable()
export class CatsService implements OnModuleInit {
  private service: Service;
  constructor(private moduleRef: ModuleRef) {}

  onModuleInit() {
    this.service = this.moduleRef.get(Service);
  }
}

```

> `get()` 方法不能用于获取具有 `作用域范围` 的提供者

如果需要获取一个全局的提供者(例如这个提供者被注入到不同的模块时)，我们可以将 `{ strict: false }` 作为第二个参数传递给 `get()` 方法。

```javascript
this.moduleRef.get(Service, { strict: false });

```

## 获取具有作用域的实例
如果需要动态的获取一个具有作用域范围的提供者(transient or request-scoped)，使用`resolve()`方法，传递`token`作为参数：
```javascript
@Injectable()
export class CatsService implements OnModuleInit {
  private transientService: TransientSerice;
  constructor(private moduleRef: ModuleRef) {}

  async onModuleInit() {
    this.transientSerivce = await this.moduleRef.resolve(TransientService);
  }
}


```
`resolve()` 方法每次返回一个单独的新实例，从它的 `依赖注入容器` (DI Container)子树。每一个子树都拥有一个单独的 `上下文标识` (context identifier)。

```javascript
@Injectable()
export class CatsService implements OnModuleInit {
  constructor(private moduleRef: ModuleRef) {}

  async onModuleInit() {
    const transientServices = await Promise.all([
      this.moduleRef.resolve(TransientService),
      this.moduleRef.resolve(TransientService),
    ]);
    // false
    console.log(transientServices[0] === transientServices[1]);
  }
}

```
如果希望在多次 `resolve()` 方法中返回同一个实例，需要确认它们具有同样的 `依赖注入容器子树` (DI container sub-tree)，然后传递这个 `上下文标识`(context indetifier)给 `resolve()` 方法。我们可以使用 `ContextIdFactory` 类来创建一个 `上下文标识`。该类提供一个 `create()` 方法去创建一个单独的标识。

```javascript
import { ContextIdFactory } from '@nestjs/core';
@Injectable()
export class CatsService implements OnModuleInit {
  constructor(private moduleRef: ModuleRef) {}

  async onModuleInit() {
    const contextId = ContextIdFactory.create();
    const transientServices = await Promise.all([
      this.moduleRef.resolve(TransientService, contextId),
      this.moduleRef.resolve(TransientService, contextId),
    ]);
    console.log(transientServices[0] === transientServices[1]);
  }
}

```

## 动态创建实例(用于未注册的提供者)
如果我们需要动态的创建一个类的实例，并且该类并没有注册为提供者，我们可以使用 `create()` 方法：
```javascript
@Injectable()
export class CatsService implements OnModuleInit {
  private catsFactory: CatsFactory;
  constructor(private moduleRef: ModuleRef) {}

  async onModuleInit() {
    this.catsFactory = await this.moduleRef.create(CatsFactory);
  }
}

```

# 生命周期事件
Nest 应用拥有生命周期。Nest 提供`生命周期事件`(hooks)使得关键的生命周期可见和可执行(执行注册代码在模块、提供者、控制器上)

## 生命周期
下面的图片描述了关键的生命周期事件顺序，从应用启动开始到 node 进程结束。  

我们可以将整个**生命周期给分解为三个阶段**： `初始化`(initializing)、`运行时`(running)、`结束`(terminating)。  

通过生命周期的事件，我们可以在适当的时机进行 `模块` 或者 `服务` 的初始化，管理连接(`active connection`)，并且优雅的关闭应用，当应用受到结束信号的时候。

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gofyc8dzwmj30qy0msgob.jpg)

Nest 会在每一个生命周期事件上，调用在 `模块(modules)`、 `提供者(injectables)`、 `控制器(controllers)`上注册的生命周期方法。就像上面的图标展示的，Nest 会在适当的时机调用生命周期方法去监听连接、在适当的时机去停止监听。

在下面的表格中，`onModuleDestroy`、`beforeApplicationShutdown`、`onApplicationShutdown`仅仅会在你调用 `app.close()`或者进程接收到终止信号的时候被触发。

| 事件 | 调用时机 |
|---|---|
| `onModuleInit()` | 调用一次，当主机模块的所有依赖的`onModuleInit`调用之后 |
| `onApplicationBootstrap()` | 调用一次，当所有的模块都被初始化时，但是在监听连接之前 |
| `onModuleDestroy` | 在接收到结束信号的时候调用 |
| `beforeApplicationShutdown()` | 在 `onModuleDestroy()` 事件处理完毕之后调用(Promise被resolved或者rejected)，一旦处理完毕，所有存在的连接都会被关闭(调用 app.close()) |
| `onApplicationShutdown()` | 当所有连接都被关闭之后调用 (app.close() resolves) |

>? 以上的生命周期事件并不会在 `具有作用域(request-scoped)` 的类上，因为它们的生命周期是不可预测的。它们由每一个请求创建，当请求处理完毕又自动的被垃圾回收机制回收。

## 生命周期使用
每一个生命周期的 hook 都有对应接口进行约束。接口在技术上是完全可选的，因为它们在TS被编译之后会消失。

但是，最佳实践是使用接口，因为它在强类型和编辑器提示上有益。

例如，以下的服务通过接口约束，并且实现声明周期的 `OnModuleInit hook`:

```javascript
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class UsersService implements OnModuleInit {
  onModuleInit() {
    console.log(`The module has been initialied`);
  }
}

```

### 异步的初始化
`OnModuleInit` 和 `OnApplicationBootstrap` hooks 都接受延迟初始化应用的过程。

```javascript 
async onModuleInit(): Promise<void> {
  await this.fetch();
}

```
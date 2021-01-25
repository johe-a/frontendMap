# 简介
> Nest被称为Node的spring框架。Nest的核心原理之一和spring框架一样，都是IoC容器(Nest运行时系统)。
> 依赖注入是一种控制反转(IoC)技术，我们可以将依赖的实例化委派给IoC容器，而不是在自己的代码中执行。

# 什么是控制反转
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

## 自定义提供者
在上面的例子中，我们通过provide属性和useClass属性将CatsSerivce令牌与CatsService类进行绑定，这样看起来灵活性很低，例如我们有以下要求时：
- 当我们需要自定义类的实例，而不是让Nest实例化，例如我们需要在实例时传入参数
- 当我们想要重用现有的类实例
- 当我们需要使用不同的提供者测试时

Nest可以让我们自定义提供程序来处理这些情况。包括但不限于以下几个属性
- useValue(值提供者)：通常用于注入常量值、外部库、模拟对象等等。
- useClass(类提供者)：通常用于绑定令牌应解析的类。
- useFactory(工厂提供者)：用工厂函数的方法，返回实际的provider。用于动态创建提供程序。
  
其中useValue、useFactory提供的依赖是可以直接被用的，而类提供者，Nest会进行实例化。

具体的使用请看[Nest官网](https://docs.nestjs.cn/6/fundamentals)
- [概念](#概念)
- [简单示例](#简单示例)
- [RxJS的优势*](#rxjs的优势)
  - [纯净性(Purity)](#纯净性purity)
  - [流动性(Flow)](#流动性flow)
- [Observable(可观察对象)](#observable可观察对象)
  - [拉取(pull) VS 推送(push)*](#拉取pull-vs-推送push)
  - [Observable与函数的对比*](#observable与函数的对比)
  - [Observale核心点](#observale核心点)
    - [创建Observable](#创建observable)
  - [订阅Observables](#订阅observables)
  - [执行Observables](#执行observables)
  - [清理Observable执行](#清理observable执行)
- [Observer(观察者)](#observer观察者)
- [Subscription(订阅)](#subscription订阅)
- [Subject(主体)](#subject主体)
- [Operators操作符](#operators操作符)
- [实例操作符 vs. 静态操作符](#实例操作符-vs-静态操作符)
# 概念
RxJS 是一个库，它通过使用 observable 序列来编写异步和基于事件的程序。它提供了一个核心类型 Observable，附属类型 (Observer、 Schedulers、 Subjects) 和受 [Array#extras] 启发的操作符 (map、filter、reduce、every, 等等)，这些数组操作符可以把异步事件作为集合来处理。

ReactiveX 结合了 `观察者模式`、`迭代器模式` 和 `使用集合的函数式编程`，以满足以一种理想方式来管理事件序列所需要的一切。

RxJS中用来解决异步事件管理的基本概念是：
- Observable (可观察对象): 表示一个概念，这个概念是一个可调用的未来值或事件的集合。
- Observer (观察者): 一个回调函数的集合，它知道如何去监听由 Observable 提供的值。
- Subscription (订阅): 表示 Observable 的执行，主要用于取消 Observable 的执行。
- Operators (操作符): 采用函数式编程风格的纯函数 (pure function)，使用像 map、filter、concat、flatMap 等这样的操作符来处理集合。
- Subject (主体): 相当于 EventEmitter，并且是将值或事件多路推送给多个 Observer 的唯一方式。
- Schedulers (调度器): 用来控制并发并且是中央集权的调度员，允许我们在发生计算时进行协调，例如 setTimeout 或 requestAnimationFrame 或其他。


> 总的来说，RxJS是一个提供单播/多播的可观察数据流，是一种可以多返回值的推送流。


# 简单示例
注册事件监听器的常规写法：
```javascript
var button = document.querySelector('button');
button.addEventListener('click', () => console.log('Clicked!'));

```
使用RxJS,创建一个observable来代替：
```javascript
var button = document.querySelector('button');
Rx.Observable.fromEvent(button, 'click')
  .subscibe(() => console.log('Clicked!'));

```


# RxJS的优势*

## 纯净性(Purity)
使得 RxJS 强大的正是它使用纯函数来产生值的能力。这意味着你的代码更不容易出错。  
通常你会创建一个非纯函数，在这个函数之外也使用了共享变量的代码，这将使得你的应用状态一团糟。
```javascript
var count = 0;
var button = document.querySelector('button');
button.addEventListener('click', () => console.log(`Clicked ${++count} times`));

```
使用RxJS，我们可以将应用状态隔离：
```javascript
var button = document.querySelector('button');
Rx.Observable.fromEvent(button, 'click')
  .scan(count => count + 1, 0)
  .subscribe(count => console.log(`Clicked ${count} times`));
```
`scan` 操作符的工作原理与数组的 `reduce` 类似。它需要一个暴露给回调函数当参数的初始值。每次回调函数运行后的返回值会作为下次回调函数运行时的参数。

**什么是纯函数**？  
一个函数的返回结果只依赖于它的参数，并且在执行过程里面没有副作用，我们就叫这个函数为纯函数。
- 函数的返回结果只依赖于它的参数
- 函数执行过程里面没有副作用
```javascript
const a = 1;
const foo = (b) => a + b;
foo(2);

```
foo函数不是一个纯函数，因为它返回的结果依赖于外部变量a，我们在不知道a的值的情况下，并不能保证foo(2)返回值是3，它的返回值是不可预料的。

```javascript
const foo= (a, b) => a + b;
foo(1, 2); //3
```
现在foo的返回结果只依赖于它的参数a和b。对于同样的入参，输出一定相同。这就满足纯函数的第一个条件，一个函数的返回结果只依赖于它的参数。

假设有以下函数:
```javascript
const a = 1
const foo = (obj, b) => {
  obj.x = 2
  return obj.x + b
}
const counter = { x: 1 }
foo(counter, 2) // => 4
counter.x // => 2
```
foo函数的执行对外部的counter产生了影响，它产生了副作用，修改了外部传进来的对象，所以它是不纯的。**如果函数修改的是内部构建的变量，然后对数据进行的修改不是副作用。**
```javascript
const foo = (b) => {
  const obj = { x: 1 };
  obj.x = 2;
  return obj.x + b;
}

```
除了修改外部的变量，一个函数在执行过程中还有很多方式可以产生副作用，例如发送Ajax请求，调用DOM API修改页面，甚至console.log也算是副作用。

为什么要煞费苦心的构建纯函数？ 因为纯函数非常靠谱，执行一个函数你不用担心它产生什么副作用，产生不可预料的行为。不管什么情况下，同样的入参都会输出相同的结果。如果你的应用程序大多数函数都是由纯函数组成，那么你的程序测试、调试起来会非常方便。

## 流动性(Flow)
RxJS提供了一整套操作符来帮助你控制事件如何流经observables。

下面的示例展示如何控制一秒钟内最多点击一次：
```javascript
var count = 0;
var reate = 1000;
var lastClick = Date.now() - rate;
var button = document.querySelector('button');
button.addEventListener('click', () => {
  if (Date.now() - lastClick >= rate) {
    console.log(`Clicked ${++count} times`);
    lastClick = Date.now();
  }
})

```
使用RxJS的写法：
```javascript
var button = document.querySelector('button');
Rx.Observable.fromEvent(button, 'click')
  .throttleTime(1000)
  .scan(count => count + 1, 0)
  .subscribe(count => console.log(`Clicked ${count} times`));

```

# Observable(可观察对象)
Observables是多个值的惰性推送集合。它填补了下面表单中的空白：
|| 单个值 | 多个值 |
|---|---|---|
| 拉取 | Function | Iterator |
| 推送 | Promise | Observable |

当订阅下面的Observable的时候，会立即同步地推送1、2、3，然后1秒后推送值4，再然后是完成流。
```javascript
const observable = Rx.Observable.create((observer) => {
  observer.next(1);
  observer.next(2);
  observer.next(3);

  setTimeout(() => {
    observer.next(4);
    observer.complete();
  }, 1000)
});

```
要调用Observable，我们需要订阅：
```javascript
console.log('just before subscribe');
observable.subscribe({
  next: x => console.log(`got value ${x}`),
  error: err => console.error(`something wrong occurred: ${err}`),
  complete: () => console.log('done'),
});
console.log('just after subscribe');
```
控制台执行结果：
```
just before subscribe
got value 1
got value 2
got value 3
just after subscribe
got value 4
done
```

## 拉取(pull) VS 推送(push)*
> `拉取`和`推送`是两种不同的协议，用来描述数据`生产者(Producer)`如何与数据`消费者(Consumer)`进行通信的。

- **什么是拉取？在拉取体系中，由消费者来决定何时从生产者哪里接收数据。生产者本身不知道数据是何时交付到消费者手中的。**
- **什么是推送？在推送体系中，由生产者来决定何时把数据发送给消费者，消费者本身不知道何时会接收到数据。**

|| **生产者** | **消费者** |
|---|---|---|
| **拉取** | **被动的:**当被请求时产生数据 | **主动的:**决定何时请求数据 |
| **推送** | **主动的:**按自己的节奏产生数据 | **被动的:**对收到的数据做出反应 |

有哪些拉取？  
- Function
- ES6引入了**generator函数和iterators**,这是另外一种类型的拉取体系。调用`iterator.next()`的代码是消费者，它会从iterator(生产者)那**取出多个值**。

有哪些推送？
- Promise是最常见的推送体系类型。Promise(生产者)将一个解析过的值传递给已注册的回调函数(消费者)，但不同于函数的是，由Promise来决定何时把值推送给回调函数。
- RxJS的Observables,是一个新的JavaScript推送体系。Observable是多个值的生产者，并将值"推送"给观察者(消费者)。

Function、Genrator、Promise、Observable的不同：
- `Function` 是惰性的评估运算，调用时会同步的返回一个单一值。
- `Generator` 是惰性的评估运算，调用时会同步地返回零到(有可能的)无线多个值。
- `Promise` 是最终可能(或可能不)返回单个值的运算。
- `Observable` 是惰性的评估运算，它可以从它被调用的时刻起同步或者异步的返回零到(有可能的)无限多个值。

## Observable与函数的对比*
> Observables像是没有参数，但可以泛化为多个值的函数。

假设有如下代码：
```javascript
function foo() {
  console.log('Hello');
  return 42;
}

var x = foo.call(); // 等同于 foo()
console.log(x);
var y = foo.call(); // 等同于 foo()
console.log(y);

/*
输出
"Hello"
42
"Hello"
42
*/
```
我们可以使用Observables重写上面的代码：
```javascript
const foo = Rx.Obervable.creare((observer) => {
  console.log('Hello');
  observer.next(42);
});

foo.subscribe((x) => console.log(x));
foo.subscribe((y) => console.log(y));
/*
输出
"Hello"
42
"Hello"
42
*/
```
可以看到输出是一样的，这是因为函数和Observables都是惰性运算。如果不调用函数，`console.log('Hello')`就不会执行。Observales 也是如此，如果你不"调用"它(使用subscribe)。`console.log('Hello')` 也不会执行。**此外，“调用”或“订阅”是独立的操作：两个函数调用会触发两个单独的副作用，两个 Observable 订阅同样也是触发两个单独的副作用。EventEmitters 共享副作用并且无论是否存在订阅者都会尽早执行，Observables 与之相反，不会共享副作用并且是延迟执行。**

Observables不是异步的：
```javascript
consple.log('before');
console.log(foo.call());
console.log('after');

/*
"before"
"Hello"
42
"after"
*/

```
使用Observables来做同样的事情：
```javascript
console.log('before');
foo.subscribe(x => console.log(x));
console.log('after');


/*
"before"
"Hello"
42
"after"
*/

```
这证明了foo的订阅完全是同步的，就像函数一样。

那么 `Observable` 与函数的区别是什么呢？**`Observable` 可以随着时间的推移"返回多个值"，这是函数做不到的**。
```javascript
function foo() {
  console.log('Hello');
  return 42;
  return 100; // 永远不会执行
}

```
函数只能返回一个值，但Observables可以这样：
```javascript
const foo = Rx.Observable.create((observer) =>{
  console.log('Hello');
  observer.next(42);
  observer.next(100);
  observer.next(200);
});

console.log('before');
foo.subscribe(x => console.log(x));
console.log('after');

/*
输出
before
Hello
42
100
200
after
*/

```
也可以异步的"返回"值：
```javascript
const foo = Rx.Observable.create((observer) => {
  console.log('Hello');
  observer.next(42);
  observer.next(100);
  observer.next(200);
  setTimeout(() => {
    observer.next(300); // 异步执行
  }, 1000);
});

console.log('before');
foo.subscribe(x => console.log(x));
console.log('after');

/*
输出
"before"
"Hello"
42
100
200
"after"
300
*/
```
- 函数调用的意思是"同步地给我一个值"
- Observable.subscribe()意思是"给我任意数量的值，无论是同步还是异步"

## Observale核心点
Observables 是使用 Rx.Observable.create 或创建操作符创建的，并使用观察者来订阅它，然后执行它并发送 next / error / complete 通知给观察者，而且执行可能会被清理。

### 创建Observable
`Rx.Observable.create` 是 `Observable` 构造函数的别名，它接收一个参数： `subscribe` 函数。
```javascript
const observable = Rx.Observable.create(subscribe(observer) => {
  const id = setInterval(() => {
    observer.next('hi')
  }, 1000);
});


```
> Observables 可以使用 create 来创建，但是通常我们使用`创建操作符`，像 of、 from、 interval 等等。

## 订阅Observables
```javascript
observable.subscribe(x => console.log(x));
```
`observable.subscribe` 和 `Observable.create(function subscribe(observer) {...})` 中的 `subscribe` 有着同样的名字，这并不是一个巧合。在库中，它们是不同的，但从实际出发，你可以认为在概念上它们是等同的。

> 订阅Observable像是调用函数，并提供接收数据的回调函数。

这与像 `addEventListener`/`removeEventListener` 这样的事件处理方法API是完全不同的。使用 `observable.subscribe`，**在 Observable 中不会将给定的观察者注册为监听器。 Observable 甚至不会去维护一个附加的观察者列表。**


## 执行Observables
`Observable.create(function subscribe(observer) {...}) `中...的代码表示 “Observable 执行”，它是惰性运算，只有在每个观察者订阅后才会执行。

Observable执行可以传递三种类型的值：
- "Next"通知： 发送一个值，比如数字、字符串、对象等等
- "Error"通知： 发送一个JS错误或者异常。
- ”Complete“通知： 不再发送任何值。

"Next" 通知是最重要，也是最常见的类型：它们表示传递给观察者的实际数据。"Error" 和 "Complete" 通知可能只会在 Observable 执行期间发生一次，并且只会执行其中的一个。

> 在 Observable 执行中, 可能会发送零个到无穷多个 "Next" 通知。如果发送的是 "Error" 或 "Complete" 通知的话，那么之后不会再发送任何通知了。

```javascript
var observable = Rx.Observable.create(subscribe(observer) => {
  try {
    observer.next(1);
    observer.next(2);
    observer.next(3);
    observer.complete();
  } catch (err) {
    observer.error(err); // 如果捕获到异常会发送一个错误
  }
});


```

## 清理Observable执行
因为 Observable 执行可能会是无限的，并且观察者可能希望终止执行，所以我们需要一个API来取消执行。因为每个执行都是其对应观察者专属的，一旦观察者完成接收值，它必须要一种方法来停止执行，以避免浪费计算能力或者内存资源。

当调用了 observable.subscribe ，观察者会被附加到新创建的 Observable 执行中。这个调用还返回一个对象，即 Subscription (订阅)
```javascript
const subscription = observable.subscribe(x => console.log(x));
// 稍后：
subscription.unsubscribe();
```
> 当你订阅了 Observable，你会得到一个 Subscription ，它表示进行中的执行。只要调用 unsubscribe() 方法就可以取消执行。

当我们使用 create() 方法创建 Observable 时，Observable 必须定义如何清理执行的资源。你可以通过在 function subscribe() 中返回一个自定义的 unsubscribe 函数。

```javascript
const observable = Rx.Observable.create(subscribe(observer) => {
  // 追踪 interval 资源
  const intervalID = setInterval(() => {
    observer.next('hi');
  }, 1000);

  // 提供取消和清理 interval 资源的方法
  return function unsubscribe() {
    clearInterval(intervalID);
  };
});

const unsubscribe = subscribe({next: (x) => console.log(x)});
// 稍后：
unsubscribe(); // 清理资源

```

# Observer(观察者)
这部分概念[官网](https://cn.rx.js.org/manual/overview.html)已经写得很清楚：观察者是由 Observable 发送的值的消费者。观察者只是一组回调函数的集合，每个回调函数对应一种 Observable 发送的通知类型：next、error 和 complete。

```javascript
const observer = {
  next: x => console.log('Observer got a next value: ' + x),
  error: err => console.error('Observer got an error: ' + err),
  complete: () => console.log('Observer got a complete notification'),
};

// or
cosnt observer = (x) => console.log(x);
```
只有一个函数的情况下会被当做next属性传递，在传递集合对象的时候，少了哪一个也是可以的，只是某些通知类型会被忽略。


# Subscription(订阅)
什么是 `Subscription` ？ - Subscription 是表示可清理资源的对象，通常是 Observable 的执行。Subscription 有一个重要的方法，即 unsubscribe，它不需要任何参数，只是用来清理由 Subscription 占用的资源。在上一个版本的 RxJS 中，Subscription 叫做 "Disposable" (可清理对象)。

```javascript
const observable = Rx.Observable.interval(1000);
const subscription = observable.subscribe(x => console.log(x));
// 稍后：
// 这会取消正在进行中的 Observable 执行
// Observable 执行是通过使用观察者调用 subscribe 方法启动的
subscription.unsubscribe();

```
Subscription 还可以合在一起，这样一个 Subscription 调用 unsubscribe() 方法，可能会有多个 Subscription 取消订阅 。你可以通过把一个 Subscription 添加到另一个上面来做这件事：

```javascript

const observable1 = Rx.Observable.interval(400);
const observable2 = Rx.Observable.interval(300);

const subscription = observable1.subscribe(x => console.log('first: ' + x));
const childSubscription = observable2.subscribe(x => console.log('second: ' + x));

subscription.add(childSubscription);

setTimeout(() => {
  // subscription 和 childSubscription 都会取消订阅
  subscription.unsubscribe();
}, 1000);
```
Subscriptions 还有一个 remove(otherSubscription) 方法，用来撤销一个已添加的子 Subscription 。


# Subject(主体)
- **什么是 Subject?**: 是一种特殊类型的 Observable，它允许将值多播给多个观察者，所以Subject是多播的，而普通的 Observable 是单播的。
> Subject 像是 Observable，但是可以多播给多个观察者。Subject 还像是 EventEmitters，维护着多个监听器的注册表。
- **每个 Subject 都是 Observable**: 对于 Subject，你可以提供一个观察者并使用 `subscribe` 方法，从观察者的角度而言，它无法判断 Observable 执行是来自普通的 Observable 还是 Subject 。 Subject 将给定的观察者注册到观察者列表中，类似于其他库或语言中的 addListener 的工作方式。
- **每个 Subject 都是观察者。** Subject 是一个有如下方法的对象： next(v)、error(e) 和 complete() 。要给 Subject 提供新值，只要调用 next(theValue)，它会将值多播给已注册监听该 Subject 的观察者们。

**总的来说，Subject像是一个没有提供数据的多播 Observable ，由于它缺乏数据，所以我们可以将其作为观察者去观察 Observable，从 Observable 接收数据再多播给观察者。Subject 更像是个待提供数据的EventEmitter， 维护了多个监听器的注册表。**

在下面的示例中，我们为 Subject 添加了两个观察者，然后给 Subject 提供一些值：

```javascript
const subject = new Rx.Subject();

subject.subscribe({
  next: (v) => console.log('observerA: ' + v)
});
subject.subscribe({
  next: (v) => console.log('observerB: ' + v)
});

subject.next(1);
subject.next(2);

/*
输出
observerA: 1
observerB: 1
observerA: 2
observerB: 2
*/
```
因为 Subject 也是观察者，这就意味着你可以把 Subject 作为参数传给任何 Observable 的 Subscribe 方法。
```javascript
const subject = new Rx.Subject();

subject.subscribe({
  next: (v) => console.log('observerA:' + v)
});

subject.subscribe({
  next: (v) => console.log('observerB:' + v)
})

const observable = Rx.Observable.from([1, 2, 3]);

observable.subscribe(subject); // 可以提供一个 Subject 作为观察者进行订阅

/* 
执行结果
observerA: 1
observerB: 1
observerA: 2
observerB: 2
observerA: 3
observerB: 3
*/

```
使用上面的方法，我们基本上只是通过 Subject 将单播的 Observable 执行转换为多播的。这也说明了 Subjects 是将任意 Observable 执行共享给多个观察者的唯一方式。

在底层，这就是 multicast 操作符的工作原理：观察者订阅一个基础的 Subject，然后 Subject 订阅源 Observable 。下面的示例与前面使用 observable.subscribe(subject) 的示例类似：

```javascript
var source = Rx.Observable.from([1, 2, 3]);
var subject = new Rx.Subject();
var multicasted = source.multicast(subject);

// 在底层使用了 `subject.subscribe({...})`:
multicasted.subscribe({
  next: (v) => console.log('observerA: ' + v)
});
multicasted.subscribe({
  next: (v) => console.log('observerB: ' + v)
});

// 在底层使用了 `source.subscribe(subject)`:
multicasted.connect();

```
multicast 操作符返回一个 Observable，它看起来和普通的 Observable 没什么区别，但当订阅时就像是 Subject 。multicast 返回的是 ConnectableObservable，它只是一个有 connect() 方法的 Observable 。

connect() 方法十分重要，它决定了何时启动共享的 Observable 执行。因为 connect() 方法在底层执行了 source.subscribe(subject)，所以它返回的是 Subscription，你可以取消订阅以取消共享的 Observable 执行。

# Operators操作符
操作符是 Observable 类型上的方法，比如 `.map(...)`、`.filter(...)`、`.merge(...)`，等等。当操作符被调用时，它们不会改变已经存在的 Observable 实例。相反，它们返回一个新的 Observable ，它的 subscription 逻辑基于第一个 Observable 。

> 操作符本质上是一个**纯函数(pure function)**， 它接收一个 Observable 作为输入，并生成一个新的 Observable 作为输出。 订阅输出 Observable 同样会订阅输入 Observable。

下面的示例中，我们创建一个自定义的操作符函数，它将从输入 Observable 接收的每个值都乘以10:
```javascript
const observable = Rx.Observable.from([1, 2, 3]);

const multipleByTen = (input) => {
  const output = Rx.Observable.create((observer) => {
    input.subscribe({
      next: (v) => observer.next(v * 10),
      error: (err) => observer.error(err),
      complete: () => observer.complete(),
    })
  });
  return output;
};

const output = multipleByTen(observable);
output.subscribe(x => console.log(x));

/*
输出
10
20
30
40
*/

```
注意，订阅 output 会导致 input Observable 也被订阅。我们称之为“操作符订阅链”。

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn2asxh7vvj30jg0b00ss.jpg)

# 实例操作符 vs. 静态操作符
- 什么是实例操作符？ - 通常提到操作符时，我们指的是实例操作符，它是 Observable 实例上的方法。举例来说，如果上面的 multiplyByTen 是官方提供的实例操作符，它看起来大致是这个样子的：

```javascript
Rx.Observable.prototype.multiplyByTen = function multiplyByTen() {
  var input = this;
  return Rx.Observable.create(function subscribe(observer) {
    input.subscribe({
      next: (v) => observer.next(10 * v),
      error: (err) => observer.error(err),
      complete: () => observer.complete()
    });
  });
}

```
注意，这里的this指向的是调用这个操作符的 Observable 函数：
```javascript
const observable = Rx.Observable.from([1, 2, 3, 4]).multipleByTen();

observable.subscribe(x => console.log(x));
```

> 也就是说，在 Observable 实例后面调用的操作符，就是实例操作符，它通过 this 来获取 Observable 实例。

- 什么是静态操作符？ 除了实例操作符，还有静态操作符，它们是直接附加到 Observable 类伤的。静态操作符在内部不使用 `this` 关键字，而是完全依赖于它的参数。

> 静态操作符是附加到 Observalbe 类上的纯函数，通常用来从头开始创建 Observalbe 。

最常用的静态操作符类型是所谓的**创建操作符**。它们只接收非 Observable 参数，比如数字，然后创建一个新的 Observable ，**而不是将一个输入 Observable 转换为输出 Observable **。

一个典型的静态操作符例子就是 interval 函数。它接收一个数字(非 Observable)作为参数，并生产一个 Observable 作为输出：

```javascript
const observable = Rx.Observable.interval(1000 /* 毫秒数 */);

```
然而，有些静态操作符可能不同于简单的创建。一些组合操作符可能是静态的，比如 merge、combineLatest、concat，等等。这些作为静态运算符是有道理的，因为它们将多个 Observables 作为输入，而不仅仅是一个，例如：

```javascript
const observable1 = Rx.Observable.interval(1000);
const observable2 = Rx.Observable.interval(400);

const merged = Rx.Observable.merge(observable1, observable2);


```
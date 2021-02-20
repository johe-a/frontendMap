# 创建操作符

## bindCallback(将回调转化为 Observable)

将 jQuery 的 getJSON 方法转化为 Observable

```javascript
// 假设我们有这个方法:jQuery.getJSON('/my/url', callback)
var getJSONAsObservable = Rx.Observable.bindCallback(jQuery.getJSON);
var result = getJSONAsObservable("/my/url");
result.subscribe(
  (x) => console.log(x),
  (e) => console.error(e)
);
```

## defer(在被订阅时创建 Observable，运行时返回Observable)

```javascript
var clicksOrInterval = Rx.Observable.defer(function () {
  if (Math.random() > 0.5) {
    return Rx.Observable.fromEvent(document, "click");
  } else {
    return Rx.Observable.interval(1000);
  }
});
clicksOrInterval.subscribe((x) => console.log(x));

// 结果如下:
// 如果Math.random()返回的值大于0.5，它会监听"document"上的点击事件; 当document
// 被点击，它会将点击事件对象打印到控制台。 如果结果小于0.5它会每秒发出一个从0开始自增数。
```

## from

将一个数组、类数组对象、Promise、迭代器对象或者类 Observable 对象创建为 Observable。

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnrqlxxojwj30zk09gq34.jpg)

```javascript
const arr = [10, 20, 30];
const result = Rx.Observable.from(arr);
result.subscribe((x) => console.log(x));
// 10 20 30
```

## fromEvent

创建一个来自于 DOM 事件，或者 Node 的 EventEmitter 事件或者其他事件的 Observable。

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnrrapyberj311a0gu753.jpg)

```javascript
const clicks = Rx.Observable.fromEvent(document, "click");
// susbcribe相当于执行 addEventListener
clicks.subscribe((x) => console.log(x));

// 每次点击 document 时，都会在控制台上输出 MouseEvent
```

## fromEventPattern

类似于 fromEvent ，需要自定义 addHandler 和 removeHandler 添加和删除事件处理器。addHandler 当输出的 Observable 被订阅的时候调用。 removeHandler 方法在取消订阅的时候被调用。

```javascript
const addClickHandler = (handler) => {
  document.addEventListener("click", handler);
};

const removeClickHandler = (handler) => {
  document.removeEventListener("click", handler);
};

const clicks = fromEventPattern(addClickHandler, removeClickHandler);

clicks.subscribe((x) => console.log(x));
```

## fromPromise(将 Promise 转化为 Observable)

```javascript
const result = Rx.Observable.fromPromise(fetch("http://myserver.com/"));
result.subscribe(
  (x) => console.log(x),
  (e) => console.error(e)
);
```

## interval(定期发出自增的数字)

定期发出自增的数字，从 0 开始

```javascript
const numbers = Rx.Observable.interval(1000);
numbers.subscribe((x) => console.log(x));
```

## repeat(重复源 Observable)

```javascript
import { of } from "rxjs";
import { repeat } from "rxjs/operators";
of(1, 2, 3)
  .pipe(repeat(3))
  .subscribe((x) => console.log(x));
```

## of(将提供的参数依次发出)

创建一个 Observable，它会依次发出由你提供的参数，最后发出完成通知。

```javascript
// 先发出10、20、30、a、b、c、然后从0开始每隔一秒发出自增数字
var numbers = Rx.Observable.of(10, 20, 30);
var letters = Rx.Observable.of("a", "b", "c");
var interval = Rx.Observable.interval(1000);
var result = numbers.concat(letters).concat(interval);
result.subscribe((x) => console.log(x));
```

## range(发出指定范围内的数字)

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnrsd4jbydj30zk09gwev.jpg)

```javascript
var numbers = Rx.Observable.range(1, 10);
numbers.subscribe((x) => console.log(x));
```

## timer(类似于 interval)

创建一个 Observable，该 Observable 在延时（initialDelay）之后开始发送并且在每个时间周期（period）后发出自增的数字。
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnrskvmvszj30zk09gt8x.jpg)

```javascript
// 3秒后，每隔一秒发出一个数字
var numbers = Rx.Observable.timer(3000, 1000);
numbers.subscribe((x) => console.log(x));
// 5秒后，发出一个数字0
var numbers = Rx.Observable.timer(5000);
numbers.subscribe((x) => console.log(x));
```

# 转换操作符
## mergeMap(生成多个Observable，并将其拍平成一个Observable)
将每个源值投射成 Observable ，将多个 Observable 会合并到输出成一个 Observable。

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnu3wv5j6tj30zk0kkt9l.jpg)

```javascript
import { of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
of('a', 'b', 'c').pipe(
  mergeMap(x => interval(1000).map(i => x + i))
).subscribe(
  x => console.log(x);
);

```
**简单来说， mergeMap 内的函数(假设为 project )，将源 Observable 的每个值通过 project 函数映射成 Observable，然后 mergeMap 将多个源值对应的 Observable 又合并起来(以源 Observable 输出的)。**

上面的例子中，将源值 a、b、c 分别映射为每一秒加上源值和秒数的 Observable即：
```javascript
// Observable1
a => 1000ms -> a0 -> 1000ms -> a1 -> 1000ms -> a2 -> ...
// Observable2
b => 1000ms -> b0 -> 1000ms -> b1 -> 1000ms -> b2 -> ... 
// Observable3
c => 1000ms -> c0 -> 1000ms -> c1 -> 1000ms -> c2 -> ... 

// after mergeMap
mergeMap(Observable1, Observable2, Observable3); 
// Observable
1000ms  -> a0 b0 c0 -> 1000ms -> a1 b1 c1 -> 1000ms -> a2 b2 c2
```



## buffer

将 Observable 发出的值缓冲起来直到 closingNotifier（入参） 发出数据, 在这个时候在输出 Observable 上发出该缓冲区的值并且内部开启一个新的缓冲区, 等待下一个 closingNotifier 的发送。

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnrsqg130lj30zk0kkt9f.jpg)

计数但不输出，直到document被点击时，输出之前计数的所有数值
```javascript
import { fromEvent, interval } from "rxjs";
import { buffer } from "rxjs/operators";
interval(1000)
  .pipe(buffer(fromEvent(document, "click")))
  .subscribe((x) => console.log(x));
```

# 过滤操作符

# 组合操作符

## forkJoin

将多个 Observable 的最后一个结果输出，输出时机为最长的那个 Observable complete 之后。

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gntzny5mbjj30zk0q4q3p.jpg)

```javascript
// 四秒后，输出[2, 3, 4]
forkJoin([
  of(1, 2),
  interval(1000).pipe(take(4)),
  Promise.resolve(4),
]).subscribe({
  next: (value) => console.log(value),
  complete: () => console.log("end!"),
});
```

当内部的 Observable 抛出错误时，或者 Promise 为 `OnRejected` 的状态时，可以使用观察对象的 `error` 属性获取

```javascript
// 将会输出4
forkJoin([of(1, 2), interval(1000).pipe(take(4)), Promise.reject(4)]).subscribe(
  {
    next: (value) => console.log(value),
    complete: () => console.log("end!"),
    error: (err) => console.log(err),
  }
);
```

# 多播操作符

# 错误处理操作符
## catchError(捕获Observable的throwError、Promise的Reject等)
> catError 内的函数必须返回一个 Observable

获取Observable的 error：
```javascript
import { catchError} from 'rxjs/operators';

Observable.create((observer) => {
  observer.error('error')
}).pipe(
  catchError(val => of(`error from catch ${val}`))
).subscribe({
  next: val => console.log(val),
})
```
获取 Observable 的 throwError（todo demo）

# 工具操作符
## tap/do(过程中执行副作用)
透明地执行操作或者副作用，比如打印日志等，该操作符不会影响 `Observable`
```javascript
tap<T>(nextOrObserver?: NextObserver<T> | ErrorObserver<T> | CompletionObserver<T> | ((x: T) => void), error?: (e: any) => void, complete?: () => void): MonoTypeOperatorFunction<T>

```
`nextOrObserver`、`ErrorOberver`、`CompletionObserver` 分别在 Observable 输出为 `next`、`error`、`complete`时执行。
```javascript
import { range } from 'rxjs';
import { tap, map } from 'rxjs/operators';

range(1, 5).pipe(
  tap(x => console.log('Before Map', x)),
  map(x => x + 10),
  tap(x => console.log('After Map', x))
).subscribe(x => console.log(x));
/*
before handle 1
after handled 11
11
before handle 2
after handled 12
12
before handle 3
after handled 13
13
before handle 4
after handled 14
14
before handle 5
after handled 15
*/
```
tap 在 Observable 处理过程中执行副作用很有用，而订阅 Observable 的 next 属性，并不能参与到这个过程中
## finalize(结束时执行副作用)
`finalize` 将会返回一个源 `Observable` 的镜像，但是它会执行传入的 `callback` 当源 `Observable` 终止时(Complete 或者 Error)

很多时候我们不知道创建的 Observable 会在哪里被消费，所以我们可以在创建 Observable 时就决定它最终会执行的 `callback`
```javascript
finalize<T>(callback: () => void): MonoTypeOperatorFunction<T>

```
当计数到3时，将 Loading 参数设置为 false
```javascript
import { interval } from 'rxjs';
import { finalize } from 'rxjs/operators';
let loading = false;
const nums = interval(1000).pipe(
  take(4),
  finalize(() => loading = false)
)
loading = true;
nums.subscribe({
  next: x => console.log(x),
});
```
值得注意的一点是， finalize 的 `callback` 函数在 `Observable` 的 `Complete` 之后执行。

在 `complete` 回调中设置 loading 为 false, 在 finalize 中可以获取到 loading 的值为 false。
```javascript
import { interval } from 'rxjs';
import { finalize } from 'rxjs/operators';
let loading = false;
const nums = interval(1000).pipe(
  take(4),
  finalize(() => console.log(loading))
)
loading = true;
nums.subscribe({
  next: x => console.log(x),
  complete: () => loading = false
});
// 输出
// 0 1 2 3 4 false
```

# 条件和布尔操作符

## iif(运行时选择 Observable)

```javascript
iif<T = never, F = never>(condition: () => boolean, trueResult: SubscribableOrPromise<T> = EMPTY, falseResult: SubscribableOrPromise<F> = EMPTY): Observable<T | F>
```

| 参数        | 含义                                                                                 |
| ----------- | ------------------------------------------------------------------------------------ |
| condition   | 条件判断函数，返回布尔值，为 true 时采用 `trueResult`，为 false 时采用 `falseResult` |
| trueResult  | `Optional`，默认是 `Empty`，类型是 `SubscriableOrPromise`，可被订阅对象或 Promise   |
| falseResult | 同 `trueResult`                                                                      |

```javascript
import { iif, of } from 'rxjs';

let subscribeFrist;
const fistOrSecond = iif(
  () => subscribeFrist,
  of('first'),
  of('second')
)
subscribeFirst = true;
// 输出第一个Observable的值
firstOrSecond.susbcribe(x => console.log(x));

```
当只有一个 `SubscriableOrPromise` 提供时， `condition` 返回 true 则采用，返回 false 时则直接 `Complete`
```javascript
let accessGranted;
const observableIfYouHaveAccess = iif(
  () => accessGranted,
  of('It seems you have an access...'), // Note that only one Observable is passed to the operator.
);
 
accessGranted = true;
observableIfYouHaveAccess.subscribe(
  value => console.log(value),
  err => {},
  () => console.log('The end'),
);
 
// Logs:
// "It seems you have an access..."
// "The end"
 
accessGranted = false;
observableIfYouHaveAccess.subscribe(
  value => console.log(value),
  err => {},
  () => console.log('The end'),
);
 
// Logs:
// "The end"


```

# 数学和聚合操作符

# Pipeable 操作符
`pipe` 操作符的作用，其实是与函数式编程中的 `compose` 组合息息相关的，正是由于 RxJS 是以函数式编程思想写的库，所以 RxJS 可以运用组合规律，pipe 的作用就是将操作符进行组合。当然我们也可以不使用 pipe，以链式操作符的形式来不停的使用实例操作符，但以链式形式去使用实例操作符有以下缺点：
1. 代码变得不直观
2. 实例操作符是Observable.prototype上的属性，是以打补丁的形式引入的，这使得我们没办法利用打包工具中的tree-shaking，一旦引入就会被打包，即使该操作符没有被使用到
而 `pipeable` 操作符，意味着可以被 pipe 组合的操作符是通过 import 形式按需引入的，而不是在 Observable.prototype 上进行补丁,每一次使用我们都需要从 `rxjs/operators` 中引入，由于import的解构引入特性，`tree-shaking` 只会打包引入并且使用了的操作符，很好的帮助我们减少构建包的体积。
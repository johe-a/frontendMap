# 创建操作符
## bindCallback(将回调转化为Observable)
将jQuery的getJSON方法转化为Observable
```javascript
// 假设我们有这个方法:jQuery.getJSON('/my/url', callback)
var getJSONAsObservable = Rx.Observable.bindCallback(jQuery.getJSON);
var result = getJSONAsObservable('/my/url');
result.subscribe(x => console.log(x), e => console.error(e));

```

## defer(在被订阅时创建Observable)
```javascript
var clicksOrInterval = Rx.Observable.defer(function () {
  if (Math.random() > 0.5) {
    return Rx.Observable.fromEvent(document, 'click');
  } else {
    return Rx.Observable.interval(1000);
  }
});
clicksOrInterval.subscribe(x => console.log(x));

// 结果如下:
// 如果Math.random()返回的值大于0.5，它会监听"document"上的点击事件; 当document
// 被点击，它会将点击事件对象打印到控制台。 如果结果小于0.5它会每秒发出一个从0开始自增数。

```

## from
将一个数组、类数组对象、Promise、迭代器对象或者类Observable对象创建为Observable。

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnrqlxxojwj30zk09gq34.jpg)

```javascript
const arr = [10, 20, 30];
const result = Rx.Observable.from(arr);
result.subscribe(x => console.log(x));
// 10 20 30
```

## fromEvent
创建一个来自于 DOM 事件，或者 Node 的 EventEmitter 事件或者其他事件的 Observable。

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnrrapyberj311a0gu753.jpg)

```javascript
const clicks = Rx.Observable.fromEvent(document, 'click');
// susbcribe相当于执行 addEventListener
clicks.subscribe(x => console.log(x));

// 每次点击 document 时，都会在控制台上输出 MouseEvent
```

## fromEventPattern
类似于 fromEvent ，需要自定义addHandler 和 removeHandler添加和删除事件处理器。addHandler 当输出的 Observable 被订阅的时候调用。 removeHandler 方法在取消订阅的时候被调用。

```javascript
const addClickHandler = (handler) => {
  document.addEventListener('click', handler);
}

const removeClickHandler = (handler) => {
  document.removeEventListener('click', handler);
}

const clicks = fromEventPattern(
  addClickHandler,
  removeClickHandler,
);

clicks.subscribe(x => console.log(x));

```

## fromPromise(将Promise转化为Observable)
```javascript
const result = Rx.Observable.fromPromise(fetch('http://myserver.com/'));
result.subscribe(x => console.log(x), e => console.error(e));

```

## interval(定期发出自增的数字)
定期发出自增的数字，从0开始
```javascript
const numbers = Rx.Observable.interval(1000);
numbers.subscribe(x => console.log(x));

```

## repeat(重复源Observable)
```javascript
import { of } from 'rxjs';
import { repeat } from 'rxjs/operators';
of(1, 2, 3).pipe(repeat(3)).subscribe(x => console.log(x));

```

## of(将提供的参数依次发出)
创建一个 Observable，它会依次发出由你提供的参数，最后发出完成通知。
```javascript
// 先发出10、20、30、a、b、c、然后从0开始每隔一秒发出自增数字
var numbers = Rx.Observable.of(10, 20, 30);
var letters = Rx.Observable.of('a', 'b', 'c');
var interval = Rx.Observable.interval(1000);
var result = numbers.concat(letters).concat(interval);
result.subscribe(x => console.log(x));

```

## range(发出指定范围内的数字)
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnrsd4jbydj30zk09gwev.jpg)
```javascript
var numbers = Rx.Observable.range(1, 10);
numbers.subscribe(x => console.log(x));


```

## timer(类似于interval)
创建一个 Observable，该 Observable 在延时（initialDelay）之后开始发送并且在每个时间周期（period）后发出自增的数字。
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnrskvmvszj30zk09gt8x.jpg)

```javascript
// 3秒后，每隔一秒发出一个数字
var numbers = Rx.Observable.timer(3000, 1000);
numbers.subscribe(x => console.log(x));
// 5秒后，发出一个数字0
var numbers = Rx.Observable.timer(5000);
numbers.subscribe(x => console.log(x));
```

# 转换操作符
## buffer
将 Observable 发出的值缓冲起来直到 closingNotifier（入参） 发出数据, 在这个时候在输出 Observable 上发出该缓冲区的值并且内部开启一个新的缓冲区, 等待下一个closingNotifier的发送。

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnrsqg130lj30zk0kkt9f.jpg)

```javascript
import { fromEvent, interval } from 'rxjs';
import { buffer } from 'rxjs/operators';
interval(1000).pipe(
  buffer(fromEvent(document, 'click'))
).subscribe(x => console.log(x));
```


# 过滤操作符



# 组合操作符



# 多播操作符




# 错误处理操作符




# 工具操作符




# 条件和布尔操作符






# 数学和聚合操作符





# Pipeable操作符








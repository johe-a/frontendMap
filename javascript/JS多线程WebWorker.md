<!--
 * @Description: 
 * @Author: johe.huang
 * @Date: 2020-03-04 00:28:37
 -->
# Web Worker
JavaScript 语言采用的是单线程模型，也就是说，所有任务只能在一个线程上完成，一次只能做一件事。前面的任务没做完，后面的任务只能等着。随着电脑计算能力的增强，尤其是多核 CPU 的出现，单线程带来很大的不便，无法充分发挥计算机的计算能力。

Web Worker 的作用，就是为 JavaScript 创造多线程环境，允许主线程创建 Worker 线程，将一些任务分配给后者运行。在主线程运行的同时，Worker 线程在后台运行，两者互不干扰。等到 Worker 线程完成计算任务，再把结果返回给主线程。这样的好处是，一些计算密集型或高延迟的任务，被 Worker 线程负担了，主线程（通常负责 UI 交互）就会很流畅，不会被阻塞或拖慢。

Worker 线程一旦新建成功，就会始终运行，不会被主线程上的活动（比如用户点击按钮、提交表单）打断。这样有利于随时响应主线程的通信。但是，这也造成了 Worker 比较耗费资源，不应该过度使用，而且一旦使用完毕，就应该关闭。

- webWorker创建一个新线程，不会阻塞主线程从而渲染流畅（主线程阻塞会阻塞渲染）
- WebWorker不会被主线程打断，但也造成Worker比较耗费资源，一旦使用完毕，就应该关闭
- 同源限制：分配给Worker线程运行的脚本文件，必须与主线程的脚本文件同源
- DOM限制：Worker线程没法操作和读取主线程所在的DOM对象，也无法使用document、window、parent这些对象，但是Worker线程可以访问navigator对象和location对象
- Worker和主线程不能直接通信，需要通过消息完成
- 脚本限制：不能指向alrt()和confirm方法
- 文件限制：加载的脚本必须来自网络，不能为本地文件

## API
构造函数:
```javascript
var myWorker = new Worker(jsUrl, options);
```
jsUrl是脚本的网址，必须遵循同源策略，并且只能加载JS脚本，否则会报错。  
第二个参数是配置对象：
```javascript
// 主线程
var myWorker = new Worker('worker.js', { name : 'myWorker' });

// Worker 线程
self.name // myWorker
```
Worker线程对象的属性和方法(主线程使用)：
- Worker.onerror：指定 error 事件的监听函数。
- Worker.onmessage：指定 message 事件的监听函数，发送过来的数据在Event.data属性中
- Worker.onmessageerror：指定 messageerror 事件的监听函数。发送的数据无法序列化成字符串时，会触发这个事件。
- Worker.postMessage()：向 Worker 线程发送消息。
- Worker.terminate()：立即终止 Worker 线程

Worker线程的属性和方法(worker线程使用):
- self.name： Worker 的名字。该属性只读，由构造函数指定。
- self.onmessage：指定message事件的监听函数。
- self.onmessageerror：指定 messageerror 事件的监听函数。发送的数据无法序列化成字符串时，会触发这个事件。
- self.close()：关闭 Worker 线程。
- self.postMessage()：向产生这个 Worker 线程发送消息。
- self.importScripts()：加载 JS 脚本。

## 基本使用
构造函数:Worker(url),接收一个文件的url，获取文件来创建一个Worker线程。
```javascript
var worker = new Worker('work.js')
```
主线程通过```worker.onmessage```来接收worker的数据，通过```worker.postMessage()```来传递给worker数据。

```javascript
worker.postMessage('hello')
worker.onmessage = function(event){
    //event.data为传过来的数据
    //do something
}
```
```javascript
self.onmessage = function(e){
    console.log(e.data)
}
//或者是
self.addEventListener('message',function(e){
    console.log(e.data)
})

```
通过importScripts方法可以在worker内部加载其他脚本
```javascript
importScripts('file1','file2')
```
关闭worker：
```
//主线程中
worker.terminate()
//worker线程
self.close()
```

## 传值问题
主线程与 Worker 之间的通信内容，可以是文本，也可以是对象。需要注意的是，这种通信是拷贝关系，即是传值而不是传址，Worker 对通信内容的修改，不会影响到主线程。事实上，浏览器内部的运行机制是，先将通信内容串行化，然后把串行化后的字符串发给 Worker，后者再将它还原。

***主线程和Worker之间传递的数据是传值的，而不是传址的，这样避免了Worker线程操作主线程的数据，传递数据时，会调用内容的toString()方法(二进制数据除外)，再传值,所以对象尽量经过JSON.stringify后传值***

主线程与worker之间可以交换二进制数据，比如File、Blob、ArrayBuffer等类型，也可以在线程之间发送，
```javascript
// 主线程
var uInt8Array = new Uint8Array(new ArrayBuffer(10));
for (var i = 0; i < uInt8Array.length; ++i) {
  uInt8Array[i] = i * 2; // [0, 2, 4, 6, 8,...]
}
worker.postMessage(uInt8Array);

// Worker 线程
self.onmessage = function (e) {
  var uInt8Array = e.data;
  postMessage('Inside worker.js: uInt8Array.toString() = ' + uInt8Array.toString());
  postMessage('Inside worker.js: uInt8Array.byteLength = ' + uInt8Array.byteLength);
};

```

## 转移大文件而不是拷贝
拷贝方式发送二进制数据，会造成性能问题。比如，主线程向 Worker 发送一个 500MB 文件，默认情况下浏览器会生成一个原文件的拷贝。为了解决这个问题，JavaScript 允许主线程把二进制数据直接转移给子线程，但是一旦转移，***主线程就无法再使用这些二进制数据了***，这是为了防止出现多个线程同时修改数据的麻烦局面。这种转移数据的方法，叫做Transferable Objects。这使得主线程可以快速把数据交给 Worker，对于影像处理、声音处理、3D 运算等就非常方便了，不会产生性能负担
```javascript

// Transferable Objects 格式
worker.postMessage(arrayBuffer, [arrayBuffer]);

// 例子
var ab = new ArrayBuffer(1);
worker.postMessage(ab, [ab]);

```

## 在页面内创建Web Worker
通常情况下，Worker 载入的是一个单独的 JavaScript 脚本文件，但是也可以载入与主线程在同一个网页的代码。

### 通过script标签
```javascript
<body>
    <script id="worker" type="app/worker">
      addEventListener('message', function () {
        postMessage('some message');
      }, false);
    </script>
</body>

```
上面是一段嵌入网页的脚本，注意必须指定<script>标签的type属性是一个浏览器不认识的值，上例是app / worker。

```javascript
//基于script的内容创建一个Blob对象
var blob = new Blob([document.querySelector('#worker').textContent]);
// 生成指向Blob对象的blobURL
var url = window.URL.createObjectURL(blob);
// 请求blobURL来创建worker
var worker = new Worker(url);

worker.onmessage = function (e) {
  // e.data === 'some message'
};
```


## worker线程完成轮询
有时，浏览器需要轮询服务器状态，以便第一时间得知状态改变。这个工作可以放在 Worker 里面。

```javascript
function createWorker(f) {
  var blob = new Blob(['(' + f.toString() +')()']);
  var url = window.URL.createObjectURL(blob);
  var worker = new Worker(url);
  return worker;
}

var pollingWorker = createWorker(function (e) {
  var cache;

  function compare(new, old) { ... };

  setInterval(function () {
    fetch('/my-api-endpoint').then(function (res) {
      var data = res.json();

      if (!compare(data, cache)) {
        cache = data;
        self.postMessage(data);
      }
    })
  }, 1000)
});

pollingWorker.onmessage = function () {
  // render data
}

pollingWorker.postMessage('init');

```

一个完整的使用例子:
```javascript
 function createWorker(fn) {
    var blob = new Blob([`(${fn.toString()})()`])
    var blobURL = window.URL.createObjectURL(blob)
    var worker = new Worker(blobURL)
    return worker
}
var webWorker = createWorker(function () {
    function init() {
        let i = 0
        setInterval(function () {
            self.postMessage(++i)
        }, 1000)
    }
    self.onmessage = function (messageEvent) {
        switch (messageEvent.data) {
            case "init":
                init()
                break
            case "stop":
                console.log("close!");
                self.close();
                break;
        }

    }
})
webWorker.onmessage = function (event) {
    console.log(event.data)
    if (event.data === 5) {
        webWorker.postMessage("stop")
        //主线程关闭webWorker.terminate()
    }
}
webWorker.postMessage("init")

```
<!--
 * @Description: 
 * @Author: johe.huang
 * @Date: 2020-06-04 15:12:45
--> 
# http报文结构
对于TCP而言，在传输的时候分为两个部分：TCP头部和数据部分。

对于HTTP，也是头部(header)和数据部分(body):
```
//HTTP报文结构
头部 + 空行 + 实体
```

## 头部
头部包含**起始行和头部字段**。
对于请求和响应来说，头部有所不同：  
![](https://tva1.sinaimg.cn/large/007S8ZIlgy1gfhk8dqtspj30zk0fltaf.jpg)

![](https://tva1.sinaimg.cn/large/007S8ZIlgy1gfhk9vpm38j30zk0fx0ui.jpg)


### 起始行
对于请求报文来说，起始行类似于：
```
GET /home HTTP/1.1
```
也就是:方法、路径、http版本

对于响应报文来说，起始行类似于：
```
HTTP/1.1 200 OK
```
响应报文的起始行也叫做状态行，由http版本、状态码、原因三部分组成。

- 请求报文：方法、路径、http版本
- 响应报文：http版本、状态码、原因
- 起始行中的每个部分用空格隔开，最后一个部分应该接一个换行，区分起始行和头部字段

### 头部字段
不管是请求头还是响应头，其中的字段是相当多的，头部字段的格式要遵循以下规则：
1. 字段名不区分大小写
2. 字段名不允许出现空格，不可以出现下划线_
3. 字段名后面必须紧跟着:
4. 字段值后面应该接一个换行，区分不同字段

### 空行
用来区分**头部和实体**,如果故意在头部中间加一个空行，后面的内容都会被视为实体


# HTTP的请求方法
http/1.1规定了以下请求方法：
- GET:通常用来获取资源
- HEAD:获取资源的元信息
- POST:提交数据，即上传数据
- PUT:修改数据
- DELETE:删除资源
- CONNECT:建立连接隧道，用于代理服务器
- OPTIONS:列出可对资源实行的请求方法，用来跨域请求
- TRACE:追踪请求-响应的传输路径

## GET和POST的区别(待细化)
- 从缓存角度：GET请求会被浏览器主动缓存，留下历史记录，而POST默认不会
- 从编码角度：GET只能进行URL编码(通过要用encodeURIComponet),只能接受ASCII字符，而POST没有限制
- 从参数角度：GET一般将参数放在URL中，因此不安全，POST放在请求体中，更适合传输敏感信息。
- 从幂等性角度：GET是幂等的（幂等表示执行相同的操作，结果也是相同的），而POST不是。
- 从TCP角度:GET请求会把请求报文一次性发出去，而POST会分为两个TCP数据包，首先发header部分，如果服务器响应100(continue),然后会发body部分。(火狐浏览器除外，它的POST请求只发一个TCP包)
- 从请求大小：GET请求的长度受限于浏览器或者服务器对URL长度的限制，而POST请求没有限制(其实还是会受限于服务器，例如413错误request entity too large)。
- 从安全性:GET将参数放在了URL，所以安全性较低


# 如何理解URI
URI，全称为(Uniform Resource Identifier),也就是统一资源标识符，它的作用很简单，就是区分互联网上不同的资源。

它并不是我们通常说的网址，网址指的是URL，实际上URI包含了URN和URL两个部分，由于URL过于普及，就默认将URL视为URL了。

## URI结构
URI的结构：
```
scheme://user:passwd@host:port path ?query #fragment
```
完整图如下：
![](https://tva1.sinaimg.cn/large/007S8ZIlgy1gfikfo045qj30zk06q0ti.jpg)

- scheme：表示协议名，例如http、https、file等。后面必须和://连在一起。
- user:passwd@:表示登录主机时的用户名和密码，不过很不安全，不推荐使用，也不常使用。
- host:port,表示主机名和端口。
- path:表示请求路径，标记资源所在位置。
- query表示查询参数，以？和path区分，通常为key=value形式，多个键值对之间用&隔开。
- fragment:表示URI所定位的资源内的一个锚点，浏览器可以根据这个锚点跳转到对应的位置。

例如如下URI：
```
https://www.baidu.com/s?wd=HTTP&rsv_spt=1
```
scheme为https，host:port为www.baidu.com(http默认端口为80,https默认端口为443),/s为path部分，wd=HTTP&rsv_spt=1是query部分。

## URI编码
URI只能使用ASCII,ASCII之外的字符是不支持显示的，还有一部分符号是界定符号(例如/和?以及&)，如果不加以处理就会导致解析出错。

因此URI引入了编码机制，将所有非ASCII码字符和界定符转为十六进制字节值，然后在前面加个%。

例如,空格被转义成了%20

# HTTP状态码
HTTP的状态码为三位数，被分为五类:
- 1xx:表示目前是协议处理的中间状态，还需要后续操作
- 2xx:表示成功状态
- 3xx:重定向状态，资源位置发生变动，需要重新请求。
- 4xx:请求报文有误。
- 5xx:服务端发送错误

1xx:中间状态
- 101 Switching Protocols,在HTTP升级为WebSocket的时候，如果服务器同意变更，就会发送状态码101.

2xx:(注意2xx不一定就代表成功了，例如206)
- 200,最常见的成功状态码
- 204,No Content，成功但是响应头后没有body数据
- 206,Partial Content,表示加载了部分内容，通常用于范围传输，例如HTTP分块下载和断点续传。**但是，在有代理服务器的情况下，可能是代理缓存区太小了(此时报错为ERR_CONTENT_LENGTH_MISMATCH)，导致无法加载完全，例如nginx，通过加大proxy_buffer的容量，设置proxy_buffer_size或者取消proxy_buffer**

3xx:资源位置变动
- 301 Moved Permanently即永久重定向，比如网站从HTTP升级到了HTTPS了，以前的站点再也不用，应当返回301，这个时候浏览器默认会做缓存优化，在二次访问的时候自动访问重定向的那个地址。
- 302 Found 临时重定向，与301不同，浏览器不会做缓存优化，例如在单点登录时，由于来源网址不同，登录成功后返回的网址也不同，所以一般用302临时重定向。
- 304 Not Modified,当协商缓存命中时会返回这个状态码。

4xx:通常是客户端的请求后端不满足或者不允许（需要协作修改）
- 400:Bad Request:并不知道哪里出错了
- 403:Forbidden:这实际上并不是请求报文出错了，而是服务器精致访问，原因有很多，比如法律禁止、信息敏感、或者是CORS Forbidden（通常出现在跨域，需要后端设置跨域允许访问的域名）
- 404:Not Found:资源未找到，表示没在服务器上找到相应资源（如果有配置Nginx,要看看是否有配置资源对应的Location,客户端需要检查URL有没有写错）
- 405:Method Not Allowed:请求方法不被服务器端允许。
- 408:Request Timeout:服务器等待了太长时间。
- 413:Request Entity Too Large 请求体的数据过大了，这个需要前后端协作，前端要考虑如何缩小发送的请求体大小，后端要设置请求体大小限制
- 414:Request-URI TOO Long:请求行里的URI太大。
- 416:范围请求越界，Range范围越界。

5xx:通常为服务端出错
- 500:Internal Server Error:服务器出错了
- 502:Bad Gateway:服务器自身是正常的，但访问的时候出错了，一般出现在服务器在重启
- 504:gate-way timeout:服务器请求超时，通常是代理服务器请求后台时，设置了超时时间。解决方法：
    - 确认超时的原因，分为以下几种
    - 连接服务器超时,设置proxy_connect_timeout,一般不超过90s
    - 服务器响应数据超时,设置proxy_read_timeout，默认为300s
    - 发送数据超时，设置proxy_send_timeout,默认为300s


# HTTP特点(需深入)
特点如下：
1. 灵活可拓展，一个是语义上的自由，只规定了基本格式。一个是传输形式的多样性，不仅仅可以传输文本，还能传输图片、视频等任意数据。
2. 可靠传输，HTTP基于TCP/IP，因此把这一特性继承了下来
3. 请求-应答。也就是一发一收、有来有回， 当然这个请求方和应答方不单单指客户端和服务器之间，如果某台服务器作为代理来连接后端的服务端，那么这台服务器也会扮演请求方的角色。
4. 无状态，这里的状态时指通信过程的上下文信息，而每次http请求都是独立、无关的，默认不需要保留状态信息。

HTTP缺点如下（也不能说缺点，有利有弊）：
- 无状态，所谓的优点和缺点要分场景来看
    - 在需要长连接的场景中，需要保存大量的上下文信息，以免传输大量重复的信息，那么这个时候无状态就是http的缺点了
    - 在不需要保存连接上下文信息的场景中，无状态反而减少了网络开销，称为了http的优点
- 明文传输,协议里的报文，主要是头部信息，不使用二进制数据，而是文本形式，
    - 为调试提供了便利
    - 同时也让http的报文信息暴露给了外界，给攻击者提供了便利，WIFI陷阱就是利用HTTP明文传输的缺点，诱导你连上热点，从而拿到你的敏感信息。
- 队头阻塞问题，当http开启长连接时，共用一个TCP连接，同一时刻只能处理一个请求，那么当前请求耗时过长的情况下，其它的请求只能处于阻塞状态。


# HTTP头部字段

## Accept系列字段
对于Accept系列字段，分为四个作用：指定数据格式、指定压缩方式、指定支持语言和字符集。

### 数据格式(Accept和Content-type)
HTTP支持非常多的数据格式，这么多格式的数据一起达到客户端，客户端怎么知道它的格式呢。

MIME(Multipurpose Internet Mail Extensions)多用途互联网邮件拓展，它首先用在垫子邮件系统中，让邮件可以发送任意类型的数据，HTTP从MIME type取了一部分来标记报文实体部分的数据类型。

- 对于发送端，采用Content-type来标志body部分的数据类型
- 对于接收端，采用Accept来指定想要收到的数据类型

Content-type和Accept两个字段的取值都是一样的，可以分为以下几个大类
- text类，以text/开头
    - text/html,text/plain,text/css等
- image类，以image/开头
    - image/git,image/jpeg,image/png
- audio/video类，以audio/和video/开头
    - audio/mpeg,video/mp4
- application类
    - application/json,application/javascript,application/pdf,application/octet-stream,application/x-www-form-urlencoded
- multipart类
    - multipart/form-data

### 压缩方式(Content-Encoding和Accept-Encoding)
数据一般都会进行编码压缩，采用什么样的压缩方式就体现在了发送方的Content-Encoding字段上，而接受什么样的压缩方式体现在了接受方的Accept-Encoding字段上，这个字段的取值有以下几种：
- gzip:当今最流行的压缩格式
- deflate:另外一种著名的压缩格式
- br:一种专门为HTTP发明的压缩算法
```
//发送端
Content-Encoding:gzip

//接收端
Accept-Encoding:gzip
```

### 支持语言(Content-Language和Accept-Language)
对于发送方，Content-Language，对于接受方对应的字段为Accept-Language:
```
// 发送端
Content-Language:zh-CN,zh,en
// 接收端
Accept-Language:zh-CN,zh,en
```

### 字符集
接受端:Accept-Charset，指定可以接受的字符集，发送端直接放在了Content-Type中，以charset属性指定:
```
//发送端
Content-Type: text/html; charset=utf-8
//接收端
Accept-Charset: charset=utf-8
```

### 总结
![](https://tva1.sinaimg.cn/large/007S8ZIlgy1gfin7c797mj30zk0hytax.jpg)


## 定长和不定长数据
### 定长包体(Content-Length)
对于定长包体，发送端在传输的时候一般会带上Content-Length，来指名包体的长度。

用NodeJS服务器模拟一下：
```javascript
const http = require('http');

const server = http.createServer();

server.on('request',(req,res)=>{
    if(req.url === '/'){
        res.setHeader('Content-Type':'text/plain');
        res.setHeader('Content-Length':10);
        res.write('helloworld');
    }
});

server.listen(8080,()=>{
    console.log("服务启动成功")
});

```
启动后访问localhost:8080，显示如下：
```
helloworld
```
如果我们把Content-Length设置的小一些:
```javascript
res.setHeader('Content-Length',8);
```
再次访问如下:
```
hellowor
```
后面的ld哪里去了呢。在http的响应体中直接被截取了。

如果我们把这个长度设置的大一些
```javascript
res.setHeader('Content-Length',12);
```
浏览器将会显示无法正常运作：
![](https://tva1.sinaimg.cn/large/007S8ZIlgy1gfinnw82fkj306w03kt8o.jpg)

总结：
- Content-Length长度比实际长度的实体要长，则无法正常运行
- Content-Length长度比实际长度的实体要短，可以正常运行，但实体超出部分会被截取

### 不定长包体(Transfer-Encoding需要深入)
上述是对于定长包体，那么对于不定长包体而言，是如何传输的？

http头部字段:
```
Transfer-Encoding:chunked
```
表示分块传输数据，设置这个字段后会自动产生两个效果：
- Content-Length字段会被忽略（因为这是用于定长包体的）
- 基于长连接持续推送动态内容

```javascript
const http = require('http');
const server = http.createServer();

server.on('request',(req,res)=>{
    if(req.url === '/'){
        res.setHeader('Content-Type','text/html;charset=utf8');
        res.setHeader('Content-Length',10);
        res.setHeader('Transfer-Encoding','chunked');
        res.write('</p>来啦</p>');
        setTimeout(()=>{
            res.write('第一次传输<br/>')
        },1000);
        setTimeout(()=>{
            res.write('第二次传输');
            res.end();
        },2000);
    }
});

server.listen(8009,()=>{
    console.log('服务已启动');
})

```
访问效果如下:
![](https://tva1.sinaimg.cn/large/007S8ZIlgy1gfiowrzk8cg306d07bjra.gif)

用telnet抓到的响应如下:

![](https://tva1.sinaimg.cn/large/007S8ZIlgy1gfioyey9cxj30ds0atjsb.jpg)

响应体的结构如下:
```
chunk长度(16进制的数)
第一个chunk的内容
chunk长度(16进制的数)
第二个chunk的内容
.....
0

```
最后是留有一个空行的。长度为0


## 范围请求(大文件下载)
对于几百M以上的大文件来说,如果要一口气全部传输过来显然是不现实的，会有大量的等待时间，严重影响用户体验（例如音乐、视频等等）,因此HTTP针对这一场景，采用了**范围请求**的解决方法，允许客户端仅仅请求一个资源的一部分。

### 服务端支持(Accept-Ranges)
前提是服务器支持范围请求，要支持这个功能，就必须加上这样一个响应头:
```
Accept-Ranges:none
```
用来告知客户端这边是支持范围请求的。

### 客户端请求
对于客户端而言，它需要制定请求哪一部分，通过Range这个请求头字段确定，格式为bytes=x-y:
- 0-499表示从开始到第499个字节
- 500-表示从第500字节到文件重点
- -100表示文件的最后100个字节
- 0- 表示从文件的开头到结尾

**服务器收到请求之后，首先验证范围是否合法，如果越界了那么返回416错误码，否则读取相应片段，返回206(partial content)状态码。**

**同时，服务器需要添加Content-Range字段，这个字段的格式根据请求头中Range字段的不同而有所差异。单段数据请求和多段数据请求的响应头是不一样的。**

单段数据和多段数据的请求头部:
```
//单段数据
Range:bytes=0-9
//多段数据
Range:bytes=0-9,30-39
```

针对单段数据，服务端的响应:

```
HTTP/1.1 206 Partial Content
Content-Length: 10
Accept-Ranges: bytes
Content-Range: bytes 0-9/100

i am xxxxx
```
**值得注意的是Content-Range字段，0-9表示返回的字节，100表示资源的总大小。**

针对多段数据,得到的响应:
```
HTTP/1.1 206 Partial Content
Content-Type: multipart/byteranges; boundary=00000010101
Content-Length: 189
Connection: keep-alive
Accept-Ranges: bytes


--00000010101
Content-Type: text/plain
Content-Range: bytes 0-9/96

i am xxxxx
--00000010101
Content-Type: text/plain
Content-Range: bytes 20-29/96

eex jspy e
--00000010101--

```
这个时候出现了一个非常关键的字段Content-Type: multipart/byteranges;boundary=00000010101，它代表了信息量是这样的:

- 请求一定是多段数据请求
- 响应体中的分隔符是 00000010101

因此，在响应体中各段数据之间会由这里指定的分隔符分开，而且在最后的分隔末尾添上--表示结束。
以上就是 http 针对大文件传输所采用的手段。

总结：
- 客户端通过Range:bytes=xxx来指定请求的范围，服务端检查是否越界，越界返回416，不越界返回206(partial content)，根据多段数据请求和单段数据请求，返回不同的响应体
- 对于客户端请求单段数据，服务端响应体包含Accept-Ranges和Content-Range,其中Content-Range包含请求返回的字节大小，和总资源大小。
```
Accept-Ranges: bytes
Content-Range: bytes 0-9/100
```
- 对于多段数据请求，服务端响应体中的Content-Type变成multipart/byteranges;boundary=xxxx，类似于multipart/form-data,包含分隔符，用以区分多段数据。
```
Content-Type: multipart/byteranges; boundary=00000010101
Accept-Ranges: bytes

--00000010101
Content-Type: text/plain
Content-Range: bytes 0-9/96

i am xxxxx
--00000010101
Content-Type: text/plain
Content-Range: bytes 20-29/96

eex jspy e
--00000010101--
```

## HTTP表单数据提交
在HTTP中有两种主要的表单提交方式，Content-Type的取值分别为：
- application/x-www-form-urlencoded
- multipart/form-data

表单请求一般是POST请求，因此我们将默认提交的数据放在请求体中。

### application/x-www-form-urlencoded
这种格式的表单内容，就像它的命名一样urlencoded,类似于GET中的查询参数，有以下特点：
- 以URL编码方式编码(也就是要转化成ASCII码)，这也意味着这种格式能够处理的数据类型有限，数据的键和值需要经过encodeURIComponent处理
- 以&分隔键值对
```
// 转换过程: {a: 1, b: 2} -> a=1&b=2 -> 如下(最终形式)
"a%3D1%26b%3D2"
```
我们可以写一个将对象转化为URL编码的函数：
```javascript
function transformURL(oldData){
    let str='';
    for(let key in oldData){
        str+= `${encodeURIComponent(key)}=${encodeURIComponent(oldData[key])}&`
    }
    //去掉最后一个&
    oldData = oldData.slice(0,-1);
    return oldData;
}

```

### multipart/form-data
传输的数据格式没有限制，例如文件和二进制数据，具有以下特点：
- 由于可以传输多种数据格式，必须要有分隔符来分隔不同的数据，所以请求头的Content-Type字段会包含boundary,且boundary值由浏览器默认指定。例如：```Content-Type: multipart/form-data;boundary=----WebkitFormBoundaryRRJKeWfHPGrS4LKe```
- 数据分为多个部分，每个部分之间通过分隔符来分隔，每部分表述均有HTTP头部描述子包体，如Content-Type(因为可能数据类型不一样),在最后的分隔符会加上--表示结束。
```
Content-Disposition: form-data;name="data1";
Content-Type: text/plain
data1
----WebkitFormBoundaryRRJKeWfHPGrS4LKe
Content-Disposition: form-data;name="data2";
Content-Type: text/plain
data2
----WebkitFormBoundaryRRJKeWfHPGrS4LKe--
```
在实际的场景中，对于图片等文件的上传，基本采用multipart/form-data而不用application/x-www-form-urlencoded，因为没有必要做URL编码，带来巨大的耗时的同时也占用了更多的空间。

# HTTP队头阻塞问题(需深入)
队头阻塞：
> HTTP传输是基于请求-应答的模式进行的，报文必须是一发一收，里面的任务被放在一个任务队列中串行执行（这里指的是异步http请求线程中的队列？还是服务器），一旦队首的请求处理太慢，就会阻塞后面请求的处理，这就是著名的HTTP队头阻塞问题。

如何解决队头阻塞问题：
- 并发连接
对于一个域名允许分配多个长连接(什么是长连接？需要弄清楚)，那么相当于增加了任务队列，不至于一个队伍的任务阻塞其它所有任务。在标准中规定客户端最多并发两个连接，但实际上chrome是6个。即使是提高了并发连接，还是不能满足人们对性能的需求。

- 域名分片
一个域名可以并发6个长连接，那么我们可以分配多几个域名。  
例如a.b.com、c.b.com，这样b.com域名下可以分出非常多的二级域名，而它们都指向同样的一台服务器，能够并发的长连接数更多了，也就更好的解决了队头阻塞问题。

# Cookie(需补充)
HTTP是一个无状态协议，每次http请求都是独立的、无关的，默认不需要保留状态信息。但有时候我们需要保存一些状态，例如用户登录信息等。  

HTTP为此引入了Cookie,Cookie本质就是浏览器里面存储的一个很小的文本文件，内部以键值对的方式来存储。  

客户端向同一个域名下发送请求，都会携带相同的Cookie，服务器拿到Cookie进行解析，便能拿到客户端的状态。服务端通过响应头部中的Set-Cookie字段来对客户端写入Cookie。

```
// 请求头
Cookie:a=xxx;b=xxx
// 响应头
Set-Cookie:a=xxx
Set-Cookie:b=xxx
```

## Cookie属性
### 有效期
Cookie的有效期可以通过Expires/Max-Age属性来设置。
- Expires为过期时间
- Max-Age用的是一段时间间隔，单位是秒，从浏览器收到响应报文开始计算。

通过浏览器查看，发现Expires和Max-Age整合到了一起。

Cookie过期，则会被删除，不会被发给服务端。

### 作用域
Domain和path(URI中的域名和路径)，设置Cookie的域名和路径，在发送请求之前，发现域名或者路径和这两个属性不匹配，就不会带上Cookie，类似于作用域。

对于路径来说,```/```表示域名下的任意路径都允许使用Cookie。

### 安全相关
- Secure:只能通过HTTPS传输cookie
- HttpOnly:只能通过HTTP传输，不能通过JS访问，这也是预防XSS攻击的重要手段。
- SameSite:
    - Strict:浏览器完全禁止第三方请求携带Cookie,比如请求a.com网站只能在a.com域名当中请求才能携带Cookie，在其他网站请求都不能。
    - Lax:相对宽松一点，但是只能在get方法提交表单的情况或者a标签发送get请求的情况下可以携带Cookie.
    - None:默认模式。请求会自动携带上Cookie

## Cookie的缺点
- 容量太小，体积上线只有4KB，只能用来存储少量的信息。
- 性能缺陷，Cookie紧跟着域名，不管域名下面的某一个地址需不需要这个Cookie，请求都会携带上完整的Cookie，随着请求数的增多，会造成巨大的性能浪费，因为请求携带了很多不必要的内容。可以通过Domain和Path置顶作用域来解决。
- 安全缺陷：由于Cookie以纯文本的形式在浏览器和服务器中传递，很容易被非法用户截取，然后进行一系列的篡改，在Cookie的有效期内重新发送给服务器。在HttpOnly为false的情况下，Cookie信息能直接通过JS脚本来读取。

# 如何理解HTTP代理
我们知道在HTTP是基于请求-响应模型的协议，一般由客户端发请求，服务器来进行响应。

引入代理之后，作为代理的服务器相当于一个中间人的角色。**对于客户端而言，表现为服务器进行响应，对于源服务器，表现为客户端发起请求，具有双重身份。**

HTTP代理有什么功能呢？
1. 负载均衡：客户端的请求只会先到达代理服务器，后面又多少源服务器，IP是多少，客户端是不知道的。代理服务器拿到这个请求之后，可以通过特定的算法分发给不同的源服务器，让各台源服务器的负载尽量平均。
2. 保障安全：利用心跳机制监控后台的服务器，一旦发现故障机就将其踢出集群。并且对于上下行的数据进行过滤，对非法IP限流，这些都是代理服务器的工作。
3. 缓存代理：将内容缓存到道理服务器，使得客户端可以直接从代理服务器获得而不用到源服务器。
4. 客户端访问不到的服务器，可以通过代理服务器访问，作为中间人角色，返回给客户端，例如VPN

## 代理相关头部字段
### Via
代理服务器需要标明自己的身份，在HTTP传输中留下自己的痕迹，则通过Via字段来记录。

假设现在有两台代理服务器，在客户端发送请求后，会经历这样一个过程:
```
客户端 -> 代理1 -> 代理2 -> 源服务器
```
在源服务器收到请求后，会在请求头拿到这个字段:
```
Via: proxy_server1,proxy_server2
```
而源服务器响应时，最终在客户端会拿到这样的响应头:
```
Via: proxy_server2,proxy_server1
```
**即Via中代理的顺序即为在HTTP传输中报文传达的顺序。**


### X-Forwarded-For
字面意思：为谁转发，记录的是请求方的IP地址。

### X-Real-IP
**获取客户端真实IP字段**，不管中间经过多少代理，这个字段始终记录最初的客户端IP。

**相应的，还有X-Forwarded-Host和X-Forwarded-Proto分别记录客户端的域名和协议名。**

### X-Forwarded-For产生的问题
X-Forwarded-For这个字段记录的是请求方的IP，这意味着每经过一个不同的代理，这个字段名字都要变，从客户端到代理1，这个字段是客户端的IP，从代理1到代理2，这个字段就变成了代理1的IP。

但是这会产生两个问题：
1. 意味着代理必须解析HTTP请求头，然后修改，比直接转发数据性能下降。
2. 在HTTPS通信加密的过程中，原始报文是不允许修改的。

由此产生了**代理协议**，一般使用明文版本，只需要在HTTP请求行上面加上这样格式的文本即可:

```
// PROXY + TCP4/TCP6 + 请求方地址 + 接收方地址 + 请求端口 + 接收端口
PROXY TCP4 0.0.0.1 0.0.0.2 1111 2222
GET / HTTP/1.1
...
```

# HTTP缓存
## 强缓存和协商缓存(需深入)

## 代理缓存
如果每次客户端缓存失效都要从源服务器获取，那给源服务器的压力是很大的。

**因此引入了代理缓存的机制，让代理服务器接管一部分的服务端HTTP缓存，客户端缓存过期后就近到代理缓存中获取，代理缓存过期了才请求源服务器，这样流量巨大的时候能够明显降低服务器的压力**

代理缓存的控制分为两部分，一部分是源服务器端的控制，一部分是客户端的控制。

## 源服务器的缓存控制
源服务器的缓存控制放在Cache-Control字段中
- private和public
在源服务器的响应头中，**会加上Cache-Control这个字段进行缓存控制，在它的值当中可以加入private或者public表示是否允许代理服务器缓存。private表示禁止，public表示允许。**对于私密数据，如果缓存到代理服务器，别人直接访问代理就可以拿到这些数据，是非常危险的，因此对于这些数据一般是不会允许代理服务器进行缓存的，将响应头部的Cache-Control设为private，而不是public。
- proxy-revalidate
must-revalidate表示客户端缓存过期就从源服务器获取，而proxy-revalidate表示代理服务器缓存过期就到源服务器获取。
- s-maxage
s是share的意思，限定了缓存在代理服务器中可以存放多久，和限制客户端缓存时间的max-age不冲突。

例如：在响应头中加入作业一个字段:
```
Cache-Control:public,max-age=1000,s-maxage=2000
```
相当于：这个响应是允许代理服务器缓存的，客户端缓存过期了就到代理中拿，并且在客户端的缓存时间为1000秒，在代理服务器中的缓存时间为2000s

## 客户端的缓存控制
- max-stale和min-fresh
在客户端的请求头中，可以加入这两个字段，来对代理服务器上的**缓存进行宽容和限制操作**
```
max-stale:5
```
表示客户端到代理服务器上拿缓存的时候，即使代理缓存过期了也不要紧，只要过期时间在5s之内，还是可以从代理中获取的。

```
min-fresh:5
```
表示代理缓存需要一定的新鲜度，不要等到缓存刚好到期再拿，一定要在到期前5秒之前的时间拿，否则拿不到。

- only-if-cached
这个字段加上后客户端值接受代理缓存，而不会接受源服务器的响应，如果代理缓存无效，则直接返回504(Gateway Timeout)

# 跨域
在前后端分离的开发模式中，经常会遇到跨域问题，即使Ajax请求发出去了，服务器也成功响应了，前端就是拿不到这个响应。

什么是跨域：
![](https://tva1.sinaimg.cn/large/007S8ZIlgy1gfk3tyhhjij30zk06q0ti.jpg)

**浏览器遵循同源策略，scheme协议、host主机、Port端口都相同则为同源**，非同源站点有这样一些限制：
- 不能读取和修改对方的DOM
- 不能访问对方的Cookie、IndexDB和LocalStorage
- 限制XMLHttpRequest
**当浏览器向目标URI发送Ajax请求时，只要当前URL和目标URL不同源，则产生跨域，被称为跨域请求**

**跨域请求的响应一般会被浏览器所拦截，注意是响应被浏览器拦截，其实已经成功到达客户端了,这就是为什么绕过浏览器来请求没有跨域问题**

服务端处理完数据后，将响应返回，浏览器主进程检查到跨域，且没有cors许可响应头，则将响应体全部丢掉，并不会发送给渲染进程，这就达到了拦截数据的目的。

## 跨域解决方案
### CORS(cross-origin resource sharing)
全程为跨域资源共享，需要浏览器和服务器的共同支持，IE10和非IE以上的浏览器支持CORS。服务器则需要附加特定的响应头。在弄清楚CORS原理之前，我们需要了解两个概念：**简单请求和非简单请求**

#### 简单请求和非简单请求
**浏览器根据请求方法和请求头的特定字段，将请求做了一下分类，凡是满足下面条件的属于简单请求**:
- 请求方法为GET、POST或者HEAD
- 请求头的取值范围:
    - Accept:接受的数据类型
    - Accept-Language:接受的语言
    - Content-Language:发送的数据语言
    - Content-Type的三个值
        - application/x-www-form-urlencoded
        - multipart/form-data
        - text/plain
满足以上规则的为简单请求，不满足则为非简单请求。

**简单请求的处理：**  
- Origin和Access-Control-Allow-Origin
**浏览器会在请求头当中，添加一个Origin字段，用来说明请求来自哪个源，服务器在拿到请求之后，在回应时对应地添加Access-Control-Allow-Origin字段，如果Origin不在这个字段的范围中，那么浏览器就会将响应拦截。**

**因此，Access-Control-Allow-Origin字段是服务器用来决定浏览器是否拦截这个响应，这是必需的字段。**

- Access-Control-Allow-Credentials
**这个字段是一个布尔值，表示是否允许发送Cookie,对于跨域请求，浏览器对这个字段默认值设为false,而如果需要拿到浏览器的Cookie，需要添加这个响应头并设置为true,并且再前端也需要设置withCredentials属性**
```javascript
let xhr = new XMLHttpRequest();
xhr.withCredentials = true;
```
**注意，如果Access-Control-Allow-Origin设置为*，不管客户端和服务端怎么设置，都不会发送Cookie**

- Access-Control-Expose-Headers
这个字段让客户端不仅可以拿到基本的6个响应字段(Cache-Control、Content-Language、Content-Type、Expires、Last-Modified和Pragma)，还能拿到这个字段声明的响应头字段。

例如：响应头部这样设置
```
Access-Control-Expose-Headers:aaa
```
前端就可以通过XMLHttpRequest.getResponseHeader('aaa')拿到aaa这个字段的值。


**非简单请求：**
- 预检请求,OPTIONS请求
非简单请求会先发送一个预检请求，这是由于非简单请求比较复杂，如果预检请求不通过，就没必要发送完整请求了。  
```javascript
var url = 'xxx.com';
var xhr = new XMLHttpRequest();
xhr.open('PUT',url,true);
//设置一个自定义头部，满足非简单请求
xhr.setRequestHeader('X-Custom-Header','xxx');
xhr.send();
```
当这段代码执行后，首先会发送预检请求，这个预检请求的请求行和请求体是下面这个格式:
```
OPTIONS / HTTP/1.1
Origin:当前地址
Host: xxx.com
Access-Control-Request-Method: PUT
Access-Control-Request-Headers: X-Custom-Header
```
- Access-Control-Reqeust-Method,列出这个跨域请求要用到哪个HTTP方法，给服务器检验
- Access-Control-Request-Headers,指出CORS请求将要加上什么请求头

预检请求的响应:
```
HTTP/1.1 200 OK
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT
Access-Control-Allow-Headers: X-Custom-Header
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 1728000
Content-Type: text/html; charset=utf-8
Content-Encoding: gzip
Content-Length: 0
```
- Access-Control-Allow-Origin:表示可以允许请求的源，可以填具体的源名，也可以填*表示允许任意源请求。
- Access-Control-Allow-Methods:表示允许请求的方法列表
- Access-Control-Allow-Credentials:允许携带Cookie
- Access-Control-Allow-Headers:允许的头部字段
- Access-Control-Max-Age:预检请求的有效期，在此期间，不用再发出另外一条预检请求。

**在预检请求的响应返回后，如果请求不满足响应头的条件，则触发XMLHttpRequest的onerror方法，当然后面真正的CORS请求也就不会发布出去了。这也可以看做是一种优化，如果请求的方法和头部字段不满足条件，就不发送完整的请求，以免浪费带宽。**

CORS 请求的响应。绕了这么一大转，到了真正的 CORS 请求就容易多了，现在它和简单请求的情况是一样的。浏览器自动加上Origin字段，服务端响应头返回Access-Control-Allow-Origin。可以参考以上简单请求部分的内容。

### JSONP
虽然XMLHttpRequest对象遵循同源策略，但是**script**标签不一样，它可以通过src填上目标地址从而发出GET请求，实现跨域请求并拿到响应。这就是JSONP的原理。

JSONP如何实现？
- 前端封装一个JSONP函数，能够为传入的URL和params生成src字符串
- 服务端通过前端传入的callback函数名，通过返回前端script标签执行callback函数，为callback函数传入数据

```javascript
function generateURL(url,params){
    let str = '';
    for(let key in params){
        str+= `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}&`
    }
    str.splice(0,-1);
    return `${url}?${str}`;
}
function JSONP(url,params,callback){
    return new Promise((resolve,reject)=>{
        let src = generateURL(url,params);
        let script = docuemnt.createElement('script');
        src += `&callback=${callback}`;
        script.src = src;
        window[callback] = (data)=>{
            resolve(data);
            document.body.removeChild(script);
        }
        document.body.append(script);
    });
}

```

服务端只要调用这个函数，将数据作为参数传递即可:
```javascript
const http = require('http');
const server = http.createServer();

server.on('request',(req,res)=>{
    if(req.url === '/'){
        let data = '模拟数据'
        let { callback } = req.query;
        res.end(`${callback}(${data})`);
    }
})
```
和CORS相比，JSONP最大的优势在于兼容性好，IE低版本不能使用CORS但可以使用JSONP，缺点也很明显，只支持GET请求。

### Nginx
Nginx如何解决跨域呢？**跨域是浏览器的一种安全策略，比如客户端的域名为client.com，服务端的域名为server.com，客户端向服务端发起ajax请求时，就会跨域，被浏览器拦截响应。但是如果由Nginx作为服务端，并且域名也为client.com,客户端去访问Nginx，由于域名相同，不会被浏览器拦截响应，再由Nginx作为代理服务器去访问服务端，即使域名不一致，也没有跨域问题，因为这中间没有浏览器做拦截。**

Nginx是一种高性能的**反向代理服务器**,什么是反向代理？
![](https://tva1.sinaimg.cn/large/007S8ZIlgy1gfl8w251w2j30rk0qoju5.jpg)

- 正向代理帮助客户端访问客户端访问不到的服务器(例如VPN，帮助我们Google)，然后将结果返回给客户端。为客户端做事。
- 反向代理拿到客户端的请求，将请求转发给其他的服务器，主要的场景是维持服务器的负载均衡。反向代理帮服务器拿到请求，然后选择一个合适的服务器，将请求转交。为服务端做事。

假设客户端为client.com,客户端访问client.com/api时,nginx就会接受到请求，并将请求转给proxy_pass也就是server.com:
```
server {
  listen  80;
  server_name  client.com;
  location /api {
    proxy_pass server.com;
  }
}
```
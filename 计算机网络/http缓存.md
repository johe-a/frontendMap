<!--
 * @Description: 
 * @Author: johe.huang
 * @Date: 2020-06-14 22:42:59
--> 
# 浏览器缓存的种类
跟浏览器相关的缓存有：
- DNS缓存
- CDN缓存
- HTTP缓存

# DNS缓存
DNS为域名解析系统，将域名解析称为实际的IP地址。  
DNS缓存分为以下层级：
- 浏览器DNS缓存
- 用户系统DNS缓存，一般位于系统的Hosts文件
- 网络提供商的DNS缓存

# CDN缓存

# HTTP缓存
假设浏览器存在一个缓存数据库，用于存储缓存信息，在客户端第一次请求数据时，此时缓存数据库中没有对应的缓存数据，需要请求服务器，服务器返回后，将数据存储至缓存数据库中。
![](https://tva1.sinaimg.cn/large/007S8ZIlgy1gfvn3w8h31j30b709174u.jpg)

## 缓存存放的位置
浏览器存储了资源，那么存放的位置在哪里呢？
- memory cache:顾名思义，将资源缓存到内存中。比较适用于需要频繁读取的资源，例如JS、图片,退出进程(关闭浏览器)就会被清除。
- disk cache:将资源存储到磁盘中，适用于不会频繁读取的资源(读取硬盘是IO操作)，例如html、css，退出进程不会被清除，因为存储在磁盘中。

缓存查找的优先级:
1. 在内存中查找
2. 在硬盘中查找
3. 如果内存和硬盘都没有，进行网络请求
4. 将服务器返回的资源和规则存储在内存和硬盘中。


## 强缓存和协商缓存
根据是否需要重新向服务器发起请求，缓存可以分类两大类：
- 强缓存(一旦命中就不请求后台，直接从浏览器缓存取)
- 协商缓存(向浏览器缓存获取标识，用标识向服务器查询资源是否变动)

**强缓存和协商缓存可以同时存在，并且强缓存的优先级大于协商缓存。**

如果仅基于强缓存，请求数据的流程如下：
![](https://tva1.sinaimg.cn/large/007S8ZIlgy1gfvn82czssj30o1098ab6.jpg)


如果仅基于协商缓存，请求数据的流程如下：
![](https://tva1.sinaimg.cn/large/007S8ZIlgy1gfvn8wb99pj30qb09gjsx.jpg)

可以看到，协商缓存只是保存标识，每次都向后台请求查询资源是否变动，而强缓存一旦命中就不请求后台。


## http头部字段
### 缓存相关的HTTP请求头
- Cache-Control/Expires,控制强缓存相关的字段
- If-None-Match/If-Modified-Since,控制协商缓存相关的字段

Expires:是一个绝对时间，代表这个资源的失效时间。 

![](https://tva1.sinaimg.cn/large/007S8ZIlgy1gfvngpqlgxj30ku07bwg8.jpg)

作为请求头Cache-Control常用的值：
- 与缓存性相关的值
    - no-cache:强制一定要协商缓存(Pragma:no-cache一样的效果，Pragma优先级更高)。
    - no-store:缓存不应存储有关客户端请求或服务器响应的任何内容，即不使用任何缓存。
    - public:可以被任何对象缓存，例如用户的浏览器，代理服务器
    - private:值可以被用户的浏览器缓存，代理服务器等不可以缓存
- 与缓存到期相关的值(Expires是绝对时间，这里通常是相对于请求的时间)
    - max-age=seconds:设置缓存存储的最大周期，超过这个时间缓存被认为过期(单位秒)。与Expires相反，时间是相对于请求的时间。

与缓存性相关的和缓存到期相关的值可以共同使用：
```
//表示任何对象都可以缓存，强缓存过期时间为3600s
cache-control:public,max-age=3600
```
Cache-Control中与缓存到期相关的值和Expires可以同时设置，但是Cache-Control的优先级更高。

![](https://tva1.sinaimg.cn/large/007S8ZIlgy1gfvnvf1e3uj30kt03ldgn.jpg)

If-None-Match为响应头的Etag,用来与Etag比对是否一致，如果不一致，说明资源发生了变化
If-Modified-Since，用来比对最后更新时间是否一致，如果不一致，则说明资源发生了变化

### 缓存相关的HTTP响应头
- Cache-Control,控制强缓存相关的字段
- Etag/Last-Modified,控制协商缓存相关的字段

作为响应头Cache-Control的值：
![](https://tva1.sinaimg.cn/large/007S8ZIlgy1gfvnzc7rtoj30kz08taci.jpg)

Etag与请求头的If-None-Match对应，用来保存资源的标识。  
Last-Modified与请求头的If-Modified-Since对应，用来比对时间是否一致

## 缓存的实验
假设服务器响应头部设置：
```
res.setHeader('Cache-Control','public,max-age=10');
```
第一次请求资源：正常返回资源，状态码为200，响应头部设置Cache-Control、Etag、Last-Modified
![](https://tva1.sinaimg.cn/large/007S8ZIlgy1gfvo8q87dbj30g50gy0ut.jpg)

十秒内再次请求资源：缓存时间还没过，此时命中强缓存，直接从浏览器缓存里面取，返回状态码200(from disk cache)，注意这次返回是由浏览器返回，没有请求到后台
![](https://tva1.sinaimg.cn/large/007S8ZIlgy1gfvo9tmkk9j30f50esgnc.jpg)

十秒后第三次请求资源：缓存时间已经过了，此时进行协商缓存的判断，设置请求头部If-None-Match和If-Modified-Since，跟响应头的Etag和Last-Modified比对，一致，所以返回304 Not Modified表示资源没有变更，可以从浏览器缓存中获取。
![](https://tva1.sinaimg.cn/large/007S8ZIlgy1gfvoalv3ijj30en0h6di7.jpg)

假设第三次请求时，资源发生了改变(比较发现Etag和If-None-Match以及Last-Modifed和If-Modified-Since不同)，将会从服务器返回最新的资源，和第一次请求时相同：
![](https://tva1.sinaimg.cn/large/007S8ZIlgy1gfvohvndpwj30dp0i2q5a.jpg)


## 总结
判断缓存的流程：
![](https://tva1.sinaimg.cn/large/007S8ZIlgy1gfvov0ftb6j30qa0hsjuo.jpg)

1. 浏览器首先判断该资源是否有缓存，如果没缓存，从服务器获取。
2. 如果有缓存，判断强缓存是否过期。
3. 如果强缓存没过期(Cache-Control和Expires,Cache-Control优先级更高)，直接返回200，从浏览器缓存获取资源，如果过期，则进行下一步。
4. 请求头部设置协商缓存字段(If-None-Match和If-Modified-Since)，服务器根据协商字段判断资源是否过期(If-None-Match/Etag的比较比If-Modified-Since/Last-Modified优先级更高)，如果没过期，则返回304 Not Modified，从浏览器缓存获取资源，如果过期，则进行下一步。
5. 强缓存和协商缓存都没有命中，则从服务器返回新的资源，设置新的强缓存、协商缓存。

>注意：**如果Cache-Control为no-cache，则意味着直接忽略强缓存，每次都必须进行协商缓存**
>如果Cache-Control为no-store，则意味着直接忽略缓存，每次都从服务器获取最新资源


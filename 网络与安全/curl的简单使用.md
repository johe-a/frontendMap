<!--
 * @Description: 
 * @Author: johe.huang
 * @Date: 2020-06-23 11:45:24
--> 
# curl
Curl是一个非常流行的命令行工具指令，经常被用于发起HTTP请求。但实际上，Curl只是很广泛的应用层协议。例如ftp、https、smtp等等。

我们可以通过curl --version来查看Curl的版本和支持的协议：
```shell
curl --version

curl 7.54.0 (x86_64-apple-darwin17.0) libcurl/7.54.0 LibreSSL/2.0.20 zlib/1.2.11 nghttp2/1.24.0
Protocols: dict file ftp ftps gopher http https imap imaps ldap ldaps pop3 pop3s rtsp smb smbs smtp smtps telnet tftp 
Features: AsynchDNS IPv6 Largefile GSS-API Kerberos SPNEGO NTLM NTLM_WB SSL libz HTTP2 UnixSockets HTTPS-proxy 
```

# 发起一个HTTP请求
默认情况下，Curl <url>使用的就是HTTP协议。
```shell
curl https://httpbin.org/get?answer=42
//返回响应体如下
{
  "args": {
    "answer": "42"
  }, 
  "headers": {
    "Accept": "*/*", 
    "Host": "httpbin.org", 
    "User-Agent": "curl/7.54.0", 
    "X-Amzn-Trace-Id": "Root=1-5ef17a08-b14fb34c89ec2340397b9ddc"
  }, 
  "origin": "218.17.222.50", 
  "url": "https://httpbin.org/get?answer=42"
}
```

我们可以通过Curl -i <url>参数来查看完整的响应(当前只有响应体没有响应头)
```shell
curl -i https://httpbin.org/get?answer=42
//响应头部
HTTP/2 200 
date: Tue, 23 Jun 2020 03:42:57 GMT
content-type: application/json
content-length: 287
server: gunicorn/19.9.0
access-control-allow-origin: *
access-control-allow-credentials: true
//响应体
{
  "args": {
    "answer": "42"
  }, 
  "headers": {
    "Accept": "*/*", 
    "Host": "httpbin.org", 
    "User-Agent": "curl/7.54.0", 
    "X-Amzn-Trace-Id": "Root=1-5ef17a41-f56d0eee8fd586ca1d8f7b74"
  }, 
  "origin": "218.17.222.50", 
  "url": "https://httpbin.org/get?answer=42"
}

```
# 下载一张图片
Wget是一个常用于下载文件的命令行工具，大部分Linux系统都包含Wget指令，但是OSX系统不内置该指令。

实质上**wget url**等同于**curl -OL url**

先看下Curl如何下载文件：**Curl -o filename url**,其中选项-o选项接filename可以为下载的文件命名（o感觉可以理解为output）:
```shell
curl -o miami-beach.jpg https://images.unsplash.com/photo-1506812574058-fc75fa93fead
% Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100 12.1M  100 12.1M    0     0  6083k      0  0:00:02  0:00:02 --:--:-- 6083k
```
而-O选项相当于--remote-name等同于-o photo-1506812574058-fc75fa93fead，将URL中最后一个/之后的信息作为文件名。-L选项告诉curl跟随重定向。

# 设置请求头部(发送验证信息)
在一些验证用户身份的场景下，我们在发送HTTP的时候经常需要设置头部，例如Cookie或者Token。

通过-H选项(理解为Header)，我们可以很方便的设置请求头部,例如我们的Cookie名为Haha：
```shell
curl -H "Cookie:haha" https://httpbin.org/get
//响应实体，返回的内容是请求的头部和请求参数
{
  "args": {}, 
  "headers": {
    "Accept": "*/*", 
    "Cookie": "haha", 
    "Host": "httpbin.org", 
    "User-Agent": "curl/7.54.0", 
    "X-Amzn-Trace-Id": "Root=1-5ef17f9a-deadb6fe3d2b38c171a8fecc"
  }, 
  "origin": "218.17.222.50", 
  "url": "https://httpbin.org/get"
}
```

# 发送一个POST请求
选项-X告诉curl使用HTTP的哪一种方法，例如POST、PUT等等。默认情况下。curl采用GET，所以不需要显示设置curl -X GET。

选项-X常常配合-d(理解为data)选项使用，它能够让你设置请求实体:
```shell
curl -X POST -d '{"answer":42}' https://httpbin.org/post

{
  "args": {}, 
  "data": "", 
  "files": {}, 
  "form": {
    "{\"answer\":42}": ""
  }, 
  "headers": {
    "Accept": "*/*", 
    "Content-Length": "13", 
    "Content-Type": "application/x-www-form-urlencoded", 
    "Host": "httpbin.org", 
    "User-Agent": "curl/7.54.0", 
    "X-Amzn-Trace-Id": "Root=1-5ef1809b-becd0e3ea972cc346b5f9381"
  }, 
  "json": null, 
  "origin": "218.17.222.50", 
  "url": "https://httpbin.org/post"
}

```
需要注意的一点是，默认情况下，curl设置请求的Content-Type为application/x-www-form-urlencoded,正如form-urlencoded所描述的，这是一种表单提交的类型，并且参数需要经过url编码，所以不适用于JSON(可以看到上述返回的实体中，数据被放在了form里面，并且整体被当成了一个key)。我们需要自己设置Content-Type为application/json，通过-H选项。

```shell
curl -X POST -H "Content-Type:application/json" -d "{'answer':42}" https://httpbin.org/post

{
  "args": {}, 
  //注意到数据从form转化到了data,并且格式正常
  "data": "{'answer':42}", 
  "files": {}, 
  "form": {}, 
  "headers": {
    "Accept": "*/*", 
    "Content-Length": "13", 
    "Content-Type": "application/json", 
    "Host": "httpbin.org", 
    "User-Agent": "curl/7.54.0", 
    "X-Amzn-Trace-Id": "Root=1-5ef181c3-f7b7651f9975ed04fc69de2c"
  }, 
  "json": null, 
  "origin": "218.17.222.50", 
  "url": "https://httpbin.org/post"
}
```

# 从本地加载请求实体
-d选项可以很方便的用于实体较小的请求。但是如果我们的请求实体很大，全部输入命令行是不现实的。幸好，-d选项支持从本地加载请求实体。

假设我们在本地拥有一个名为data.json的文件，包含以下请求实体:
```
{"answer":42}
```
通过@的前缀，来告诉curl从文件里加载请求实体：

```shell
curl -X PUT -d '@data.json' -H "Content-Type:application/json" https://httpbin.org/put

```
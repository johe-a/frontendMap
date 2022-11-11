# 简介
由于Http的传输过程中，我们会定义不同的数据类型、编码类型、压缩类型等。所以我们需要针对数据类型、编码类型、压缩类型进行解析。
`body-parser`帮我们解析HTTP请求，主要是`json`以及`urlencode`类型，暂不支持`formdata`类型解析，解析完毕后我们可以通过`request.body`获取到传输数据。

具体为什么使用`body-parser`，可以查看这篇文档：[body-parser的作用](https://www.cnblogs.com/chyingp/p/nodejs-learning-express-body-parser.html)
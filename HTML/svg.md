# SVG介绍
> SVG是一种XML语言，类似XHTML，可以用来绘制矢量图形。（SVG 不属于 HTML）

HTML提供了定义标题(H)、段落(section)、表格(table)等内容的元素，与此类似，SVG也提供了一些元素，用于定义圆形、矩形、曲线等。一个简单的SVG文档由 `<svg>` 根元素和节本的形状元素构成，另外还有一个 `g` 元素，它用于把若干个基本形状编程一个组。

SVG支持渐变、旋转、动画等等效果，还有与JS进行交互的功能。

SVG有两个重要的书写点：
- SVG的元素和属性必须按照标准格式书写，因为XML是区分大小写的。
- SVG的属性值必须用引号，就算是数值也必须这样做。

# SVG VS Canvas
加载慢是SVG的一个缺点，但是SVG也有自身的优点，比如它实现了DOM接口，这一点是比Canvas方便的。

# SVG版本
最接近完整版本的SVG版本是1.1版本，它基于1.0版本。完整的SVG1.2本来是下一个标准版本，但它又将被SVG2.0替代。


# 入门
```xml
<svg version="1.1"
     baseProfile="full"
     width="300"
     height="200"
     xmlns="http://www.w3.org/2000/svg" >
  
  <rect width="100%" height="100%" fill="red" />
  
  <circle cx="150" cy="100" r="80" fill="green" />

  <text x="150" y="125" font-size="60" text-anchor="middle" fill="white">SVG</text>

</svg>
```
保存为svg格式的文件，用浏览器打开可以看到如下图片：

![](https://tva1.sinaimg.cn/large/008eGmZEgy1goxaidwpivj30ag06za9w.jpg)

绘制流程包括以下几步：
1. 从svg根元素开始
   1. 在SVG2之前，version 属性和 baseProfile 属性用来识别SVG的版本。
   2. 作为XML的一种，SVG必须正确的绑定命名空间（在xmlns属性中绑定）。
2. 绘制一个矩形 `<rect/>`
3. 绘制一个半径为 80px 的圆 `<circle/>`（向右和向下偏移 cx 和 cy）
4. 绘制文字SVG，文字被填充白色。

SVG的规则是后来者居上，越后面的元素层级越高，越可见。

# 命名空间
什么是命名空间？作为XML的一个语言，SVG需要在一个命名空间内。这是为什么呢？因为SVG是属于XML的，但如果我们要在HTML中使用，必须使用一个命名空间，否则它们之间的标签会进行混淆。例如HTML和SVG都拥有`<title>`标签，我们如何区分使用的`<title>`是HTML还是SVG？为了区分具有相同名称的标签情况，就有了命名空间。

命名空间通过 `xmlns` 属性进行命名，在 `HTML` 和 `SVG` 的标签上：
```xml
<html xmlns="http://www.w3.org/1999/xhtml">
  <body>
    <!-- 在这里放置一些 XHTML 标签 -->
    <svg xmlns="http://www.w3.org/2000/svg" width="300px" height="200px">
      <!-- 在这里放置一些 SVG 标签 -->
    </svg>
    <!-- 在这里放置一些 XHTML 标签 -->
  </body>
</html>

```
在这个例子中根节点 `<html>` 的 `xmlns` 属性定义了XHTML为默认命名空间。结果就是它和它所有的子节标签，除了 `<svg>` 标签，都被用户代理解释为属于XHTML命名空间。 `<svg>` 标签拥有它自己的xmlns属性，通过重新定义默认的命名空间，告诉用户代理 `<svg>` 标签以及他所包含的标签（除非他们也重新定义了默认名称空间）属于SVG.


# 定位
对于所有元素，SVG使用的坐标系统或者说网格系统，和Canvas用的差不多（所有计算机绘图都差不多）。这种坐标系统是：以页面的左上角为(0,0)坐标点，坐标以像素为单位，x轴正方向是向右，y轴正方向是向下。注意，这和你小时候所教的绘图方式是相反的。但是在HTML文档中，元素都是用这种方式定位的。

![](https://tva1.sinaimg.cn/large/008eGmZEgy1goxazz3gezj3064064745.jpg)

定义一个矩形，即从左上角开始，向右延展100px，向下延展100px，形成一个100*100大的矩形。
```xml
<rect x="0" y="0" width="100" height="100" />
```

```xml
<svg width="200" height="200" viewBox="0 0 100 100">
```
这里定义的画布尺寸是`200*200`px。但是，viewBox属性定义了画布上可以显示的区域：从(0,0)点开始，`100宽*100高`的区域。这个`100*100`的区域，会放到`200*200`的画布上显示。于是就形成了放大两倍的效果。

# 基本形状
```xml
<?xml version="1.0" standalone="no"?>
<svg width="200" height="250" version="1.1" xmlns="http://www.w3.org/2000/svg">

  <rect x="10" y="10" width="30" height="30" stroke="black" fill="transparent" stroke-width="5"/>
  <rect x="60" y="10" rx="10" ry="10" width="30" height="30" stroke="black" fill="transparent" stroke-width="5"/>

  <circle cx="25" cy="75" r="20" stroke="red" fill="transparent" stroke-width="5"/>
  <ellipse cx="75" cy="75" rx="20" ry="5" stroke="red" fill="transparent" stroke-width="5"/>

  <line x1="10" x2="50" y1="110" y2="150" stroke="orange" fill="transparent" stroke-width="5"/>
  <polyline points="60 110 65 120 70 115 75 130 80 125 85 140 90 135 95 150 100 145"
      stroke="orange" fill="transparent" stroke-width="5"/>

  <polygon points="50 160 55 180 70 180 60 190 65 205 50 195 35 205 40 190 30 180 45 180"
      stroke="green" fill="transparent" stroke-width="5"/>

  <path d="M20,230 Q40,205 50,230 T90,230" fill="none" stroke="blue" stroke-width="5"/>
</svg>
```
基本形状如图：
![](https://tva1.sinaimg.cn/large/008eGmZEgy1goxbdusb02j303z09ga9v.jpg)

`rect`、`circle`、`ellipse`、`line`、`polyline`、`polygon`、`path`分别对应矩形、原型、椭圆形、线条、折线、多边形、路径。

除了`polyline`、`polygon`、`path`，其他的看标签属性都很容易明白。其中`rect`的圆角是通过`rx`(圆角的x方位半径) 和 `ry`(圆角的y方位半径) 定义的

对于`polyline`和 `polygon` 都需要指定点集合数列，每个数字用空白符、逗号、终止符号或者换行符分隔开。每个点必须包含两个数字。一个是x坐标，一个是y坐标。所以点列表 (0,0), (1,1) 和(2,2)可以写成这样：“0 0, 1 1, 2 2”。`polygon`与`polyline`不同的点在于，`polygon`在最后一个点处会自动回到第一个点。

`path` 是SVG中最常见的形状。你可以用path元素绘制各种图形。因为path很强大也很复杂，所以会在下一章进行详细介绍。这里只介绍一个定义路径形状的属性。`d` 属性是一个点集数列，以及其他关于如何绘制路径的信息。
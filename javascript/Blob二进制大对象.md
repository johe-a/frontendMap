# Blob
> Blob，Binary Large Object的缩写，代表二进制类型的大对象。Mysql中的Blob类型就表示二进制数据的容器，在Web中，Blob对象是二进制数据，但它是类似文件对象的二进制数据，因此可以操作File对象一样操作Blob对象，实际上，File继承自Blob

# Blob基本用法
## 创建
通过Blob的构造函数创建Blob对象：
```javascript
Blob(blobParts[,options])
```
- blobParts:为数组，数组中的每一项连接起来构成Blob对象的数据，数组中的每项元素可以是ArrayBuffer，ArrayBufferView,Blob,DOMString。
- options:可选项，置顶MIME类型和结束符方式
    - type，默认值为 ""，它代表了将会被放入到blob中的数组内容的MIME类型。
    - endings，默认值为"transparent"，用于指定包含行结束符\n的字符串如何被写入。 它是以下两个值中的一个： "native"，表示行结束符会被更改为适合宿主操作系统文件系统的换行符； "transparent"，表示会保持blob中保存的结束符不变。

```javascript
    var data1 = "a";
    var data2 = "b";
    var data3 = "<div style='color:red;'>This is a blob</div>";
    var data4 = { "name": "abc" };

    var blob1 = new Blob([data1]);
    var blob2 = new Blob([data1, data2]);
    var blob3 = new Blob([data3]);
    var blob4 = new Blob([JSON.stringify(data4)]);
    var blob5 = new Blob([data4]);
    var blob6 = new Blob([data3, data4]);

    console.log(blob1);  //输出：Blob {size: 1, type: ""}
    console.log(blob2);  //输出：Blob {size: 2, type: ""}
    console.log(blob3);  //输出：Blob {size: 44, type: ""}
    console.log(blob4);  //输出：Blob {size: 14, type: ""}
    console.log(blob5);  //输出：Blob {size: 15, type: ""}
    console.log(blob6);  //输出：Blob {size: 59, type: ""}
```
size代表Blob对象中所包含数据的字节数  
使用字符串和使用对象创建Blob是不同的，例如blob4通过```JSON.stringify```把data4对象转换成JSON字符串，而blob5则直接使用对象创建，两个blob对象的size分别为14和15。  
blob4的结果为"{"name":"abc"}"刚好是14个字节。  
blob5的记过为"[object Object]"是15个字节。  
实际上，当使用普通对象创建Blob对象时，相当于调用了普通对象的```toString()```方法得到字符串数据，然后在再创建Blob对象。

## slice分片方法
> Blob对象有一个sloce方法，放回一个新的Blob对象，包含了源Blob对象中范围内的数据。

```javascript
slice([start[,end[,contentType]]])
```
- start:起始下标，表示第一个会被拷贝进新的Blob字节的其实位置。如果是一个负数，那么这个偏移量将会从数据的末尾从后道歉开始计算。
- end：结束下标，如果传入负数，偏移量会从数据的末尾从后到前开始计算。
- contentType:新的Blob对象的文档类型，默认值为一个空的字符串。

```javascript
var data = "abcdef"
var blob1 = new Blob([data])
var blob2 = blob1.slice(0,3)

//输出：Blob {size:6,type:""}
console.log(blob1);
//输出：Blob {size:3,type:""}
console.log(blob2);
```

## Blob使用场景
### 分片上传
> File继承自Blob，所以我们可以用slice方法对大文件进行分片长传

```javascript
function uploadFile(file){
    //每片大小为1M
    var chunkSize = 1024*1024
    var totalSize = file.size
    //分片总数
    var chunckQuantity = Math.ceil(totalSize/chunkSize)
    //偏移量
    var offset = 0 
    var reader = new FileReader()
    //设置文件onload回调
    reader.onload = function(e){
        var xhr = new XMLHttpRequest()
        xhr.open("POST","http://xxx/upload?fileName="+file.name)
        xhr.overrideMimeType("application/octet-stream")

        xhr.onreadystatechange = function(){
            if(xhr.readState === XMLHttpRequest.DONE && xhr.status === 200){
                ++offset
                if(offset === chunkQuantity){
                    //上传完成
                }else if(offset === chunckQuantity){
                    //上传最后一片，偏移量结束点为文件大小
                    blob = file.slice(offset*chunckSize,totalSize)
                    reader.readAsBinaryString(blob)
                }else{
                    blob = file.slice(offset*chunckSzie,(offset+1)*chunckSize)
                    reader.readAsBinaryString(blob)
                }
            }else{
                alert("上传出错")
            }
        }
        if(xhr.sendAsBinary){
            //e.target.result为此次读取的分片二进制数据
            xhr.sendAsBinary(e.target.result)
        }else{
            xhr.send(e.targt.result)
        }
    }
    var blob = file.slice(0, chunkSize)
    reader.readAsBinaryString(blob)
}

```
可以进一步丰富，比如上传进度，使用多个XMLHttpRequest对象并行上传对象(需要传递分片数据的位置参数给服务端)等。

### Blob URL(资源地址)
Blob URL是Blob协议的URL：
```
blob:http://xxx
```
Blob URL可以通过URL.createObjectURL(blob)创建，在绝大部分场景下，我们可以像使用HTTP协议的URL一样，使用Blob URL。

常见的场景有：作为文件的下载地址和作为图片资源地址。

***作为文件的下载地址***:
```javascript
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Blob Test</title>
    <script>
        function createDownloadFile() {
            var content = "Blob Data";
            var blob = new Blob([content]);
            var link = document.getElementsByTagName("a")[0];
            link.download = "file";
            link.href = URL.createObjectURL(blob);
        }
        window.onload = createDownloadFile;
    </script>
</head>

<body>
    <a>下载</a>
</body>

</html>

```
点击下载按钮，浏览器将会下载一个名为file的文件，文件内容是Blob Data。通过Blob对象，在前端就可以动态生成文件，提供浏览器下载。

![](https://tva1.sinaimg.cn/large/00831rSTgy1gcg39gjalcj30zk0993zy.jpg)

***作为图片资源地址***
```
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Blob Test</title>
    <script>
        function handleFile(e) {
            var file = e.files[0];
            var blob = URL.createObjectURL(file);
            var img = document.getElementsByTagName("img")[0];
            img.src = blob;
            img.onload = function(e) {
                URL.revokeObjectURL(this.src);  // 释放createObjectURL创建的对象##
            }
        }
    </script>
</head>

<body>
    <input type="file" accept="image/*" onchange="handleFile(this)" />
    <br/>
    <img style="width:200px;height:200px">
</body>

</html>

```
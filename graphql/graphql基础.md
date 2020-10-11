# 什么是graphQL
> GraphQL 既是一种用于 API 的查询语言也是一个满足你数据查询的运行时。 GraphQL 对你的 API 中的数据提供了一套易于理解的完整描述，使得客户端能够准确地获得它需要的数据，而且没有任何冗余，也让 API 更容易地随着时间推移而演进，还能用于构建强大的开发者工具。

简单来说graphql就是一个API查询语言，并且还提供了运行时解析。

优势:
- 数据内容和格式由客户端来决定
- 不用写多个接口来处理请求，只需要一个接口来解析graphQL并返回值，以往每个接口可能对应一种SQL操作，例如REST API

劣势：
- 由于没有多个接口来处理请求，出现问题排查困难
- 客户端来决定数据内容和格式，可能有安全风险

# 查询
一个简单的查询如下，假设要查询Hero表的name和friends:
```typescript
query searchHumanFriends {
  hero {
    name
    friends {
      name 
    }
  }
}
```
查询结果如下:
```typescript
{
  "data": {
    "hero": {
      "name": "R2-D2",
      "friends": [
        {
          "name": "Luke Skywalker"
        },
        {
          "name": "Han Solo"
        },
        {
          "name": "Leia Organa"
        }
      ]
    }
  }
}
```
## 参数
假设我们要查human表id为1000的name和height:
```typescript
query humanNameAndHeight {
  human(id: "1000") {
    name 
    height
  }
}

```
在类似 REST 的系统中，你只能传递一组简单参数 —— 请求中的 query 参数和 URL 段。但是在 GraphQL 中，每一个字段和嵌套对象都能有自己的一组参数。
```typescript
query humanNameAndHeight {
  human(id: "1000") {
    name 
    height(unit: FOOT)
  }
}

```
查询结果:
```typescript
{
  "data": {
    "human": {
      "name": "Luke Skywalker",
      "height": 5.6430448
    }
  }
}
```

## 变量
```typescript
# { "graphiql": true, "variables": { "episode": JEDI } }
query HeroNameAndFriends($episode: Episode) {
  hero(episode: $episode) {
    name
    friends {
      name
    }
  }
}
```
变量定义看上去像是上述查询中的 ($episode: Episode)。其工作方式跟类型语言中函数的参数定义一样。它以列出所有变量，变量前缀必须为 $，后跟其类型，本例中为 Episode。

默认变量：
```typescript
query HeroNameAndFriends($episode: Episode = "JEDI") {
  hero(episode: $episode) {
    name
    friends {
      name
    }
  }
}

```

## 别名
假设我们需要查询Hero表的两个不同id的值，如果没有别名是没办法做到的。
```typescript
{
  empireHero: hero(episode: EMPIRE) {
    name
  }
  jediHero: hero(episode: JEDI) {
    name
  }
}

```
上例中，两个 hero 字段将会存在冲突，但是因为我们可以将其另取一个别名，我们也就可以在一次请求中得到两个结果。

## 片段
可以理解为结构体，用于复用一组字段。
```typescript
query xxx {
  leftHero: hero(id: "1000") {
    ...comparisionFileds
  }
  rightHero: hero(id: "2000") {
    ...comparisionFileds
  }
}

fragment comparisionFields on Character {
  name
  appearsIn
  friends {
    name
  }
}

```
查询结果：
```json
{
  "data": {
    "leftComparison": {
      "name": "Luke Skywalker",
      "appearsIn": [
        "NEWHOPE",
        "EMPIRE",
        "JEDI"
      ],
      "friends": [
        {
          "name": "Han Solo"
        },
        {
          "name": "Leia Organa"
        },
        {
          "name": "C-3PO"
        },
        {
          "name": "R2-D2"
        }
      ]
    },
    "rightComparison": {
      "name": "R2-D2",
      "appearsIn": [
        "NEWHOPE",
        "EMPIRE",
        "JEDI"
      ],
      "friends": [
        {
          "name": "Luke Skywalker"
        },
        {
          "name": "Han Solo"
        },
        {
          "name": "Leia Organa"
        }
      ]
    }
  }
}
```
### 在片段中使用变量
```typescript
query xxx($first: Int = 3) {
  leftHero: hero(id: "1000") {
    ...comparisionFileds
  }
  rightHero: hero(id: "2000") {
    ...comparisionFileds
  }
}

fragment comparisionFields on Character {
  name
  friendsConnection(first: $first) {
    totalCount
    edges {
      node {
        name
      }
    }
  }
}

```

## 操作名称
下面的示例包含了作为操作类型的关键字 query 以及操作名称 HeroNameAndFriends：
```typescript
query HeroNameAndFriends {
  hero {
    name
    friends {
      name
    }
  }
}
```
- 操作类型可以是 query、mutation 或 subscription，描述你打算做什么类型的操作。操作类型是必需的，除非你使用查询简写语法，在这种情况下，你无法为操作提供名称或变量定义。
- 操作名称是你的操作的有意义和明确的名称。它仅在有多个操作的文档中是必需的，但我们鼓励使用它，因为它对于调试和服务器端日志记录非常有用。 当在你的网络日志或是 GraphQL 服务器中出现问题时，通过名称来从你的代码库中找到一个查询比尝试去破译内容更加容易。 就把它想成你喜欢的程序语言中的函数名。例如，在 JavaScript 中，我们只用匿名函数就可以工作，但是当我们给了函数名之后，就更加容易追踪、调试我们的代码，并在其被调用的时候做日志。同理，GraphQL 的查询和变更名称，以及片段名称，都可以成为服务端侧用来识别不同 GraphQL 请求的有效调试工具。


## 指令
我们可能也需要一个方式使用变量动态地改变我们查询的结构。譬如我们假设有个 UI 组件，其有概括视图和详情视图，后者比前者拥有更多的字段。简单来说就是根据值动态改变结构：
```typescript
query Hero($episode: Episode, $withFriends: Boolean!) {
  hero(episode: $episode) {
    name
    friends @include(if: $withFriends) {
      name
    }
  }
}
```
输入
```json
{
  "episode": "JEDI",
  "withFriends": false
}
```
查询结果:
```json
{
  "data": {
    "hero": {
      "name": "R2-D2"
    }
  }
}
```
一个指令可以附着在字段或者片段包含的字段上，然后以任何服务端期待的方式来改变查询的执行。GraphQL 的核心规范包含两个指令，其必须被任何规范兼容的 GraphQL 服务器实现所支持
- @include(if: Boolean) 仅在参数为 true 时，包含此字段。
- @skip(if: Boolean) 如果参数为 true，跳过此字段。
# 什么是graphQL
> GraphQL 既是一种用于 API 的查询语言也是一个满足你数据查询的运行时。 GraphQL 对你的 API 中的数据提供了一套易于理解的完整描述，使得客户端能够准确地获得它需要的数据，而且没有任何冗余，也让 API 更容易地随着时间推移而演进，还能用于构建强大的开发者工具。

简单来说graphql就是一个API查询语言，并且还提供了运行时解析。
![](https://tva1.sinaimg.cn/large/007S8ZIlly1gjlk3s3e18j30ub058wf2.jpg)

优势:
- 数据内容和格式由客户端来决定
- 不用写多个接口来处理请求，只需要一个接口来解析graphQL并返回值，以往每个接口可能对应一种SQL操作，例如REST API

劣势：
- 由于没有多个接口来处理请求，出现问题排查困难
- 客户端来决定数据内容和格式，可能有安全风险

# 查询
一个简单的查询如下
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
假设我们要查human id为1000的name和height:
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

## 变更(Mutations)
REST中，任何请求都可能最后导致一些服务端副作用，但是约定上建议不要使用 GET 请求来修改数据。GraphQL 也是类似 —— 技术上而言，任何查询都可以被实现为导致数据写入。然而，建一个约定来规范任何导致写入的操作都应该显式通过变更（mutation）来发送。

就如同查询一样，如果任何变更字段返回一个对象类型，你也能请求其嵌套字段。获取一个对象变更后的新状态也是十分有用的。我们来看看一个变更例子：
```typescript
mutation CreateReviewForEpisode($ep: Episode!, $review: ReviewInput!) {
  createReview(episode: $ep, review: $review) {
    stars
    commentary
  }
}
//传入参数
{
  "ep": "JEDI",
  "review": {
    "stars": 5,
    "commentary": "This is a great movie!"
  }
}
//得到结果
{
  "data": {
    "createReview": {
      "stars": 5,
      "commentary": "This is a great movie!"
    }
  }
}
```
注意 createReview 字段如何返回了新建的 review 的 stars 和 commentary 字段。这在变更已有数据时特别有用，例如，当一个字段自增的时候，我们可以在一个请求中变更并查询这个字段的新值。

**一个变更也能包含多个字段，查询和变更之间的一个重要区别是:查询字段时，是并行执行，而变更字段时，是线性执行，一个接着一个。以确保不会出现竞态。**


## 内联片段（inline Fragments）
如果你查询的字段返回的是接口或者联合类型，那么你困难需要使用内敛片段来取出下层具体类型的数据：
```typescript
query HeroForEpisode($ep: Episode!) {
  hero(episode: $ep) {
    name
    ... on Droid {
      primaryFunction
    }
    ... on Human {
      height
    }
  }
}
//得到结果
{
  "data": {
    "hero": {
      "name": "R2-D2",
      "primaryFunction": "Astromech"
    }
  }
}
```

## 元字段
某些情况下，你并不知道你将从 GraphQL 服务获得什么类型，这时候你就需要一些方法在客户端来决定如何处理这些数据。GraphQL 允许你在查询的任何位置请求 __typename，一个元字段，以获得那个位置的对象类型名称。
```typescript
{
  search(text: "an") {
    __typename
    ... on Human {
      name
    }
    ... on Droid {
      name
    }
    ... on Starship {
      name
    }
  }
}
//结果
{
  "data": {
    "search": [
      {
        "__typename": "Human",
        "name": "Han Solo"
      },
      {
        "__typename": "Human",
        "name": "Leia Organa"
      },
      {
        "__typename": "Starship",
        "name": "TIE Advanced x1"
      }
    ]
  }
}
```
上面的查询中，search 返回了一个联合类型，其可能是三种选项之一。没有 __typename 字段的情况下，几乎不可能在客户端分辨开这三个不同的类型。

# Schema和类型
因为一个 GraphQL 查询的结构和结果非常相似，因此即便不知道服务器的情况，你也能预测查询会返回什么结果。但是一个关于我们所需要的数据的确切描述依然很有意义，我们能选择什么字段？服务器会返回哪种对象？这些对象下有哪些字段可用？这便是引入 schema 的原因。

## 类型语言（Type Language）
GraphQL 服务可以用任何语言编写，因为我们并不依赖于任何特定语言的句法句式（譬如 JavaScript）来与 GraphQL schema 沟通，我们定义了自己的简单语言，称之为 “GraphQL schema language” —— 它和 GraphQL 的查询语言很相似，让我们能够和 GraphQL schema 之间可以无语言差异地沟通。

## 对象类型和字段（Object Types and Fields）
```typescript
type Character {
  name: String!
  appersIn: [Episode!]!
}

```
- Character是一个GraphQL的对象类型，表示其实一个拥有一些字段的类型。
- name和appearsIn是Character类型上的字段。这意味着在一个操作 Character 类型的 GraphQL 查询中的任何部分，都只能出现 name 和 appearsIn 字段
- String是内置的标量类型之一。
- String!表示这个字段是非空的，意味着GraphQL服务保证当你查询这个字段后总会返回一个值。
- [Episode!]!表示一个非空的Episode数组，所以当我们查询appearsIn的时候，总能得到一个数组（零或者多个）。且由于Episode!也是非空的，你总是可以预期到数组中的每个项目都是一个Episode对象。

## 参数（Arguments）
GraphQL 对象类型上的每一个字段都可能有零个或者多个参数，例如下面的 length 字段：
```typescript
type Starship {
  id: ID!
  name: String!
  length(unit: LengthUnit = METER): Float
}

```
参数可能是必选或者可选的，当一个参数是可选的，我们定义一个默认值，如果unit参数没有传递，那么它将会被默认设置为METER。
非空类型修饰符也可以用于定义字段上的参数，如果这个参数上传递了一个空值（不管通过 GraphQL 字符串还是变量），那么会导致服务器返回一个验证错误。
```typescript
query DroidById($id: ID!) {
  droid(id: $id) {
    name
  }
}
//参数
{
  "id": null
}
//得到错误结果
{
  "errors": [
    {
      "message": "Variable \"$id\" of required type \"ID!\" was not provided.",
      "locations": [
        {
          "line": 1,
          "column": 17
        }
      ]
    }
  ]
}
```
非空和列表修饰符可以组合使用。例如你可以要求一个非空字符串的数组：
```typescript
myField: [String!]

```
这表示数组本身可以为空，但是不能有任何空值成员：
```
myField: null // 有效
myField: [] // 有效
myField: ['a', 'b'] // 有效
myField: ['a', null, 'b'] // 错误
```


## 查询和变更类型
你的 schema 中大部分的类型都是普通对象类型，但是一个 schema 内有两个特殊类型：
```
schema {
  query: Query
  mutation: Mutation
}
```

如果看到像这样的查询：
```typescript
query {
  hero {
    name
  }
  droid(id: "2000") {
    name
  }
}


```
则表示这个GraphQL服务需要一个Query类型：
```typescript
type Query {
  hero(episode: Episode): Character
  droid(id: ID!): Droid
}

```

## 枚举类型
```typescript
enum Episode {
  NEWHOPE
  EMPIRE
  JEDI
}
```
这表示无论我们在 schema 的哪处使用了 Episode，都可以肯定它返回的是 NEWHOPE、EMPIRE 和 JEDI 之一。


## 接口
跟许多类型系统一样，GraphQL 支持接口。一个接口是一个抽象类型，它包含某些字段，而对象类型必须包含这些字段，才能算实现了这个接口。
```typescript
interface Character {
  id: ID!
  name: String!
  friends: [Character]
  appearsIn: [Episode]!
}

```
任何实现Character接口的类型都要有这些字段：
```typescript
type Human implements Character {
  id: ID!
  name: String!
  friends: [Character]
  appearsIn: [Episode]!
  starships: [Starship]
  totalCredits: Int
}

type Droid implements Character {
  id: ID!
  name: String!
  friends: [Character]
  appearsIn: [Episode]!
  primaryFunction: String
}

```

## 联合类型
联合类型和接口十分相似，但是它并不指定类型之间的任何共同字段
```
union SearchResult = Human | Droid | Starship
```
注意，联合类型的成员需要是具体对象类型；你不能使用接口或者其他联合类型来创造一个联合类型。

## 输入类型
```typescript
input ReviewInput {
  stars: Int!
  commentary: String
}

```
你可以像这样在变更（mutation）中使用输入对象类型：
```typescript
mutation CreateReviewForEpisode($ep: Episode!, $review: ReviewInput!) {
  createReview(episode: $ep, review: $review) {
    stars
    commentary
  }
}

```

# 执行
GraphQL 不能脱离类型系统处理查询，让我们用一个类型系统的例子来说明一个查询的执行过程：
```typescript
type Query {
  human(id: ID!): Human
}

type Human {
  name: String
  appearsIn: [Episode]
  startships: [Startship]
}

enum Episode {
  NEWHOPE
  EMPIRE
  JEDI
}

type Starship {
  name: String
}

```
用一个例子来描述一个查询请求被执行的全过程：
```typescript
{
  human(id: 1002) {
    name
    appearsIn
    starships {
      name
    }
  }
}
//查询结果
{
  "data": {
    "human": {
      "name": "Han Solo",
      "appearsIn": [
        "NEWHOPE",
        "EMPIRE",
        "JEDI"
      ],
      "starships": [
        {
          "name": "Millenium Falcon"
        },
        {
          "name": "Imperial shuttle"
        }
      ]
    }
  }
}
```

## 解析器
每一个 GraphQL 服务端应用的顶层，必有一个类型代表着所有进入 GraphQL API 可能的入口点，我们将它称之为 Root 类型或 Query 类型。

在这个例子中查询类型提供了一个字段 human，并且接受一个参数 id。这个字段的解析器可能请求了数据库之后通过构造函数返回一个 Human 对象。
```typescript
Query: {
  human(obj, args, context, info) {
    return context.db.loadHumanByID(args.id).then(
      userData => new Human(userData)
    )
  }
}
```
这个例子使用了JS语言。解析器函数接收4个参数：
- obj：上一级对象，如果字段术语根节点查询类型时通常不会被使用。
- args：可以提供在GraphQL查询中传入的参数。
- context: 上下文。
- info: 一个保存与当前查询相关的字段特定信息以及schema详细信息的值。

context 提供了一个数据库访问对象，用来通过查询中传递的参数 id 来查询数据，因为从数据库拉取数据的过程是一个异步操作，该方法返回了一个 Promise 对象。

## 可以忽略的解析器
Human对象已经生成了，但是GraphQL还是会继续递归执行：
```typescript
Human: {
  name(obj, args, context, info) {
    return obj.na,e
  }
}
```
GraphQL 服务端应用的业务取决于类型系统的结构。在 human 对象返回值之前，由于类型系统确定了 human 字段将返回一个 Human 对象，GraphQL 会根据类型系统预设好的 Human 类型决定如何解析字段。

在这个例子中，对 name 字段的处理非常的清晰，name 字段对应的解析器被调用的时候，解析器回调函数的 obj 参数是由上层回调函数生成的 new Human 对象。在这个案例中，我们希望 Human 对象会拥有一个 name 属性可以让我们直接读取。

事实上，许多 GraphQL 库可以让你省略这些简单的解析器，假定一个字段没有提供解析器时，那么应​​该从上层返回对象中读取和返回和这个字段同名的属性。
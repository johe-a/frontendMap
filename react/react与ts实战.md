# 快速启动
使用TS编写react代码除了需要ts库之外，还至少需要两个库：
```
npm install --save-dev @types/{react,react-dom}
```
@types开头意味着已经提供了库的ts声明

# 编写函数组件
没有使用ts:
```javascript
import * as React from 'react'

export const Logo = props => {
    const { logo, className, alt } = props

    return (
        <img src={logo} className={className} alt={alt} />
    )
}

```
这样会在TS中报错，这是因为props没有定义类型.

假设我们定义props的类型:
```javascript
import * as React from 'react';

interface IProps {
  logo?: string
  className?: string
  alt?: string
}

export const Logo = (props: IProps) => {
  const { logo, className, alt } = props;

  return (
    <img src={logo} className={className} alt={alt}>
  )
}
```
但是Props一般来说都有children属性。如果需要我们一个个在自定义的prop类型内加children，一方面是容易出错，一方面是过于麻烦

现在有更规范的办法：type FunctionComponent<P> 其中已经定义了children类型：
```javascript
export const Logo: React.FunctionComponent<IProps> = props =>{
   ...
}

```
React.FunctionComponent<P>，由于函数式组件没有状态，只有Props，所以P代表Props的类型，传入Props的类型，返回一个函数式组件的类型声明，可想而知，该声明定义了一个函数，接收参数继承自Props类型，返回为一个React的Element.

如果我们这个组件是业务中的通用组件的话，甚至可以加上注释:
```javascript
interface IProps {
  /**
   * logo的地址
   */
   logo?: string
   className?: string
   alt?: string
}

```

# class组件
class组件是有状态的组件，除了传递props之外还需要state:
```javascript
import * as React from 'react';

interface Props {
  handleSubmit: (value: string) => void
}

interface State {
  itemText: string
}

export class TodoInput extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      itemText: ''
    }
  }
}

```
**这里可以思考下React.Component的作用，推测是一个接口，接收两个泛型Props和State，分别是Props和State的类型，为Props和State类型再加一层封装，并且定义生命周期函数、render函数等等**

React.Component会帮Props和State加上Readonly，确保他们是不可变的。

# 事件类型
//TODO
```typescript
function mouseHandler(e: MouseEvent) => {
}
document.addEventListener('mouseup', mouseupHandler)

```
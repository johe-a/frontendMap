
const bracketsMapper = new Map<string, string>(
  [
    ['(', ')'],
    ['{', '}'],
    ['[', ']'],
  ]
)
/**
 * 给定一个只包括 '('，')'，'{'，'}'，'['，']' 的字符串，判断字符串是否有效。
 * 有效字符串需满足： 左括号必须用相同类型的右括号闭合。
 * 左括号必须以正确的顺序闭合。
 * 注意空字符串可被认为是有效字符串。
 */
function isValid(str: string) {
  /**
   * 利用栈的先进后出思维，出栈的要求是栈顶与之匹配，否则不出栈，等到遍历结束，栈不为空，则不是有效字符串
   */
  const stack = [];
  const strArr = Array.prototype.slice.call(str);
  for(let i = 0; i < strArr.length; i++) {
    const curBracket = strArr[i];
    if (stack.length === 0) {
      stack.push(curBracket);
    } else {
      const last = stack[stack.length - 1];
      const rightBracket = bracketsMapper.get(last);
      if (rightBracket === curBracket) {
        stack.pop();
      } else {
        stack.push(curBracket);
      }
    }
  }
  return stack.length === 0;
}

console.log(isValid('[]{}[{}]({})([])([{}])'));
console.log(isValid('()'));
console.log(isValid('()['));
console.log(isValid('([)]'));


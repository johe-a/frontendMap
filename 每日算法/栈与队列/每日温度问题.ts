/**
 * 根据每日气温列表，重新生成一个列表，对应位置的输出是等待多少天温度才会升高超过当日，如果之后都不会升高，请在该位置使用0来代替。
 * 例如，给定一个列表 temperatures = [73, 74, 75, 71, 69, 72, 76, 73]，你的输出应该是 [1, 1, 4, 2, 1, 1, 0, 0]。
 */
function dailyTemperature(temperatures: number[]) {
  /**
   * 维护一个单调递减的栈，
   * 只要新元素打破了单调递减的规律，则对栈顶元素弹出与新元素比较，直到栈顶元素比新元素大，或者栈顶元素为空时，推入栈中。
   * 栈的入栈出栈规则：
   * 1. 入栈规则：当前元素比栈顶元素小，入栈内容为下标
   * 2. 出栈规则：栈顶元素比当前元素小
   */
  const stack: number[] = [];
  const result: number[] = new Array(temperatures.length).fill(0);
  for(let i = 0; i< temperatures.length; i++) {
    let topElement = temperatures[stack[stack.length-1]];
    const curElement = temperatures[i];
    // 栈顶元素比当前元素小，则说明需要出栈
    while(topElement < curElement && stack.length) {
      const topIndex = stack.pop();
      result[topIndex] = i - topIndex;
      topElement = temperatures[stack[stack.length-1]];
    }
    // 维护单调递减栈
    stack.push(i);
  }
  return result;
}

console.log(dailyTemperature([73, 74, 75, 71, 69, 72, 76, 73]))
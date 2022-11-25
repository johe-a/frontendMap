class MinStack {
  private stack: number[] = [];
  /**
   * 维护一个单调递减栈，若新push的元素小于最小栈顶元素，则推入。
   * 若pop的元素为当前最小栈顶元素，则一起pop。
   */
  private minStack: number[] = [];
  
  push(element: number) {
    this.stack.push(element);
    if (element <= this.minStack[this.minStack.length - 1] || this.minStack.length === 0) {
      this.minStack.push(element);
    }
  }

  top() {
    return this.stack[this.stack.length - 1];
  }

  getMin() {
    return this.minStack[this.minStack.length - 1];
  }

  pop() {
    /**
     * pop栈顶元素，如果当前元素与最小栈的栈顶元素相等，也随之pop
     * 这里为什么不需要比较最小栈的非栈顶元素？因为最小栈是一个单调递减栈，与位置强关联，当pop到当前元素时，如果有比它更小的，一定已经先pop出去了
     */
    if (this.stack.length === 0) {
      return;
    }
    const element = this.stack.pop();
    if (element === this.minStack[this.minStack.length - 1]) {
      this.minStack.pop();
    }
    return element;
  }

}
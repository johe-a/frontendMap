/**
 * 题目描述：使用栈实现队列的下列操作：
 * push(x) -- 将一个元素放入队列的尾部。
 * pop() -- 从队列首部移除元素。
 * peek() -- 返回队列首部的元素。
 * empty() -- 返回队列是否为空。
 * 只能使用标准的栈操作
 */
class QueueByStack {
  /**
   * 用栈模拟队列，因为队列是先进先出，而栈是先进后出，很容易得到栈的逆序输出是队列
   * 但是我们没办法直接通过reverse等方法来操作栈，我们需要利用栈的push和pop规则。
   * 所以我们需要两个栈，一个栈用于存放堆积的元素，另一个栈用于存放“逆序”的栈
   * 这个逆序的栈的维护就是重点，逆序栈的push应该当且仅当逆序栈为空的时候。
   * 这里检测逆序栈为空的时机有两个，一个是往栈push新内容的时候，一个是pop的时候。
   */
  private stack: number[] = [];
  private reverseStack: number[] = [];

  push(element: number) {
    if (!this.reverseStack.length) {
      this.reverseStack.push(element);
    } else {
      this.stack.push(element);
    }
    console.log(this.stack, this.reverseStack);
  }

  peek() {
    return this.reverseStack[this.reverseStack.length - 1];
  }

  pop() {
    const topElement = this.reverseStack.pop();
    if (this.reverseStack.length === 0) {
      while(this.stack.length) {
        this.reverseStack.push(this.stack.pop());
      }
    }
    console.log(this.stack, this.reverseStack);
    return topElement;
  }

  empty() {
    return this.reverseStack.length === 0 && this.stack.length === 0;
  }
}

const queue = new QueueByStack();
queue.push(1);
queue.push(2);
queue.push(3);
console.log(queue.peek());
console.log(queue.pop());
console.log(queue.empty());

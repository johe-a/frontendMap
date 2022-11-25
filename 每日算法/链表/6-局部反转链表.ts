import { LinkedNode } from "./linknode";

const linkedOrigin = new LinkedNode(1);

linkedOrigin.next = new LinkedNode(2, new LinkedNode(3, new LinkedNode(4, new LinkedNode(5))));
/**
 * 真题描述：反转从位置 m 到 n 的链表。请使用一趟扫描完成反转。
 * 示例:
 * 输入: 1->2->3->4->5->NULL, m = 2, n = 4 
 * 输出: 1->4->3->2->5->NULL
 */
function reversePartlyLinkedNode(head: LinkedNode, m: number, n: number) {
  /**
   * 快慢指针
   * 快指针先走n-m
   * 然后快慢指针同时走m步，这时候快指针到达n的位置，慢指针到达m的位置，反转这部分的链表
   */
  let dummy = new LinkedNode();
  dummy.next = head;
  let firstNode = dummy;
  let firstNodeAfter = dummy;
  let secondNode = dummy;
  let secondNodeBefore = dummy;
  let i = m;
  let j = n;
  // 走m步
  while(j) {
    firstNode = firstNode.next;
    j--;
  }
  // 走n步
  while(i) {
    secondNodeBefore = secondNode;
    secondNode = secondNode.next;
    i--;
  }
  if (!firstNode) {
    return null;
  }
  firstNodeAfter = firstNode.next;
  // 反转first和second之间的链表
  let originNode = secondNode;
  let preNode = secondNode;
  let curNode = secondNode.next;
  let nextNode = curNode.next;
  while(curNode !== firstNodeAfter) {
    curNode.next = preNode;
    preNode = curNode;
    curNode = nextNode;
    if (curNode) {
      nextNode = curNode.next;
    }
  }
  secondNodeBefore.next = preNode;
  originNode.next = curNode;
  return head;
}
console.log(JSON.stringify(reversePartlyLinkedNode(linkedOrigin, 2, 4)));

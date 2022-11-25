/**
 * 真题描述：给定一个链表，删除链表的倒数第 n 个结点，并且返回链表的头结点。
 * 示例： 给定一个链表: 1->2->3->4->5, 和 n = 2.
 * 当删除了倒数第二个结点后，链表变为 1->2->3->5.
 * 说明： 给定的 n 保证是有效的。
 */
import { LinkedNode } from './linknode';

const linkedOrigin = new LinkedNode(1);

linkedOrigin.next = new LinkedNode(2, new LinkedNode(3, new LinkedNode(4, new LinkedNode(5))));

/**
 * 删除链表的倒数第N个结点
 * @param {LinkedNode} linkNode 
 * @param {number} n
 */
function deleteNthMemberFromEnd(head: LinkedNode, n: number): LinkedNode | null {
  /**
   * 倒数第N个节点可以转化为正数的第length - n + 1个节点
   * 所以我们要想如何获取到第length - n个节点（被删除节点的前驱节点）
   * 为了获取第length - n个节点，我们可以有两种方式
   * 1. 走一次遍历获取链表的长度，再遍历一次找到第length-n个节点，这样要遍历两次，效率太低
   * 2. 利用这个length - n的特性（重点是结尾和该节点的间隔是n），我们可以利用一个快指针和慢指针来分别记录这个间隔
   *    其中快指针先走n步，然后快慢指针一起移动，直到快指针走到尾部时，就能得到length-n的那个节点。
   */
  // 所有的链表删除，由于不确定第一位是否会被删除，我们都需要创建一个dummy节点
  const originNode = new LinkedNode();
  originNode.next = head;
  let number = n;
  let fastNode: LinkedNode | undefined | null = originNode;
  let slowNode: LinkedNode = originNode;
  // 快指针先走n步
  while (number && fastNode) {
    fastNode = fastNode.next;
    number--;
  }
  // n无效，返回Null
  if (!fastNode) {
    return null;
  }
  // 慢指针与快指针同时走，直到快指针走到尾部
  while (fastNode.next && slowNode.next) {
    fastNode = fastNode.next;
    slowNode = slowNode.next;
  }
  slowNode.next = slowNode.next?.next;
  return originNode.next;
}


console.log(JSON.stringify(deleteNthMemberFromEnd(linkedOrigin, 2)));

/**
 * 也是使用双指针，只不过这个指针一先一后，保持先指针快于后指针N步，然后先指针和后指针同时移动
 * 这样只要先指针到达尾部，则能得到后指针是链表倒数第N个
 */
function getLastNthNode(head: LinkedNode, n: number): LinkedNode {
  console.log(arguments);
  let dummy = new LinkedNode(null);
  dummy.next = head;
  let startNode = dummy;
  let endNode = dummy;
  for(let i = 0; i < n; i++) {
    endNode = endNode.next;
  }
  if (!endNode) {
    return null;
  }
  while(endNode) {
    startNode = startNode.next;
    endNode = endNode.next;
  }
  return startNode.value;
}

console.log(getLastNthNode(linkedOrigin, 2));
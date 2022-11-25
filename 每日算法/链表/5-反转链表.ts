/**
 * 真题描述：定义一个函数，输入一个链表的头结点，反转该链表并输出反转后链表的头结点。
 * 示例:
 * 输入: 1->2->3->4->5->NULL
 * 输出: 5->4->3->2->1->NUL
 */
import { LinkedNode } from "./linknode";

const linkedOrigin = new LinkedNode(1);

linkedOrigin.next = new LinkedNode(2, new LinkedNode(3, new LinkedNode(4, new LinkedNode(5))));

function reverseLinkedNode (head: LinkedNode): LinkedNode | null | undefined {
  /**
   * 反转链表，关键是处理节点中的next引用
   * 如果我们要反转当前指针的引用，需要将它的前驱节点记录，并且将当前节点的next节点记录
   * 记录它的前驱节点是为了反转，记录它的next节点是为了防止next节点丢失而被删除
   * 那么这个反转链表需要三个指针来记录，分别记录当前节点、前驱节点、next节点
   * 当当前节点为Null时结束。
   */
  // 前驱节点
  let preNode = head;
  // 当前节点
  let curNode = head.next;
  // 反转链表在链表节点数量大于等于2时有作用
  if (!curNode) {
    return head;
  }
  // next节点
  let nextNode = curNode.next;
  preNode.next = null;
  while (curNode) {
    curNode.next = preNode;
    preNode = curNode;
    curNode = nextNode;
    nextNode = nextNode?.next;
  }
  return preNode;
}

// console.log(JSON.stringify(reverseLinkedNode(linkedOrigin)));
function reverseLinkedNodeRecursion(preNode:LinkedNode, curNode: LinkedNode): LinkedNode {
  let nextNode = curNode.next;
  curNode.next = preNode;
  preNode = curNode;
  if (nextNode) {
    curNode = nextNode;
    return reverseLinkedNodeRecursion(preNode, curNode);
  } else {
    return curNode;
  }
}

console.log(JSON.stringify(reverseLinkedNodeRecursion(null ,linkedOrigin)));


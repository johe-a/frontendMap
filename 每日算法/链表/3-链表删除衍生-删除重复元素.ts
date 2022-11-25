/**
 * 真题描述：给定一个排序链表，删除所有含有重复数字的结点，只保留原始链表中没有重复出现的数字。
 */
class LinkedItem {
  constructor(public value?:any, public next?: LinkedItem) {
    this.value = value;
    this.next = next;
  }
}


const linkedOriginTest = new LinkedItem(1);

linkedOriginTest.next = new LinkedItem(2, new LinkedItem(2, new LinkedItem(2, new LinkedItem(3, new LinkedItem(3)))));

function clearRepeatLinkedNode(head: LinkedItem): LinkedItem {
  // 当只有0个或1个节点时提前返回
  if (!head || !head.next ) {
    return head;
  }
  /**
   * 删除元素最重要的是记住前驱节点，但由于我们不确认第一个元素是否会被删除（例如1->1->2）的情况下第一个元素会被删除
   * 所以我们要创建一个空的头节点
   */
  const originalNode = new LinkedItem();
  originalNode.next = head;
  let curNode = originalNode;
  // 由于是经过排序的，我们依然比较相邻节点即可，我们要确认的始终是前驱节点，这个前驱节点要确保是一个不会被删除的节点
  // 只有后两个节点都存在的情况下有必要进行循环，因为当前节点确认不会被删除，若当前节点的下一个节点或下下个节点有一个不存在，都说明了当前链表不重复
  while (curNode.next && curNode.next?.next) {
    // 如果后续的两个节点存在重复的情况，说明子链表存在重复情况
    if (curNode.next.value === curNode.next.next.value) {
      let repeatValue = curNode.next.value;
      // 找到所有的重复元素，并且移除，移除通过操作当前节点的next
      while(curNode.next?.value === repeatValue) {
        curNode.next = curNode.next?.next;
      }
    } else {
      // 后面两个元素不重复，则确认下一个元素一定不会重复，则可以移动到下一个元素作为前驱结点
      curNode = curNode.next;
    }
  }
  return originalNode.next;
}

console.dir(clearRepeatLinkedNode(linkedOriginTest));
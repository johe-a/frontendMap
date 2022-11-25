/**
 * 真题描述：给定一个排序链表，删除所有重复的元素，使得每个元素只出现一次。
 */
class LinkedNode {
  constructor(public value?:any, public next?: LinkedNode | null) {
    this.value = value;
    this.next = next;
  }
}


const linkedOrigin = new LinkedNode(1);

linkedOrigin.next = new LinkedNode(2, new LinkedNode(2, new LinkedNode(2, new LinkedNode(3))));

/**
 * 去重有序的链表
 * @param linkNode 
 */
function uniqSortLinkedList(linkNode: LinkedNode): LinkedNode {
  /**
   * 由于是有序的，则只需要比较相邻元素即可，相邻元素相同，则直接删除，删除通过next的设置
   */
  let curLinkNode: LinkedNode | null | undefined = linkNode;
  while(curLinkNode && curLinkNode.next) {
    if (curLinkNode.value === curLinkNode.next.value) {
      curLinkNode.next = curLinkNode.next.next;
    } else {
      curLinkNode = curLinkNode.next;
    }
  }
  return linkNode;
}

console.dir(uniqSortLinkedList(linkedOrigin));
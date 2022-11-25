import { LinkedNode } from "./linknode";

const linkedOrigin = new LinkedNode(1);
linkedOrigin.next = new LinkedNode(2, new LinkedNode(3, new LinkedNode(4, new LinkedNode(5, linkedOrigin))));


/**
 * 给定一个链表，判断链表中是否有环。
 * 给每一个结点标记，通过游标遍历链表，如果重复走到有标记的结点，则为环形链表
 */
function isCircleLink(head: LinkedNode): number | false {
  let mapper = new Map<LinkedNode, number>();
  let curNode = head;
  let i = 1;
  while(curNode) {
    if (mapper.get(curNode)) {
      return mapper.get(curNode) - 1;
    }
    mapper.set(curNode, i);
    curNode = curNode.next;
    i++;
  }
  return false;
}

console.log(isCircleLink(linkedOrigin));
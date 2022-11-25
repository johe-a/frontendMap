
class LinkNode {
  constructor(public value?:any, public next?: LinkNode | null) {
    this.value = value;
    this.next = next;
  }
}


const linkedOneOrigin = new LinkNode(1);
const linkedTwoOrigin = new LinkNode(1);

linkedOneOrigin.next = new LinkNode(2, new LinkNode(3));
linkedTwoOrigin.next = new LinkNode(4, new LinkNode(5));


/**
 * 合并有序链表
 * @param {LinkNode} linkedOne 
 * @param {LinkNode} linkedTwo 
 * @returns 
 */
function combineSortLink(linkedOne: LinkNode, linkedTwo: LinkNode): LinkNode {
  const linkedOrigin: LinkNode = new LinkNode();
  let resultLinked = linkedOrigin;
  let linkedOneCurNode: LinkNode = linkedOne;
  let linkedTwoCurNode: LinkNode = linkedTwo;
  while (linkedOneCurNode && linkedTwoCurNode) {
    let curLinkNode: LinkNode;
    if (linkedOneCurNode.value <= linkedOneCurNode.value) {
      curLinkNode = linkedOneCurNode;
      linkedOneCurNode = linkedOneCurNode.next;
    } else {
      curLinkNode = linkedTwoCurNode;
      linkedTwoCurNode = linkedTwoCurNode.next;
    }
    resultLinked.next = curLinkNode;
    resultLinked = resultLinked.next;
  }
  if (linkedOneCurNode) {
    resultLinked.next = linkedOneCurNode;
  } else {
    resultLinked.next = linkedTwoCurNode;
  }
  return linkedOrigin.next;
}

console.dir(combineSortLink(linkedOneOrigin, linkedTwoOrigin));
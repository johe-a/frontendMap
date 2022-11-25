import { TreeNode, root } from "./mock";

function getPostOrderRecursion(root: TreeNode) {
  let result: string[] = [];
  function postOrderRecursion(root: TreeNode) {
    if (!root) {
      return;
    }
    postOrderRecursion(root.left);
    postOrderRecursion(root.right);
    result.push(root.val);
  }
  postOrderRecursion(root);
  return result;
}

console.log(getPostOrderRecursion(root));

function postOrder(root: TreeNode) {
  let result: string[] = [];
  const stack: TreeNode[] = [];
  let current = root;
  let lastVisited = null;
  while(current || stack.length) {
    // 当前层级线性入栈
    while(current) {
      stack.push(current);
      current = current.left;
    }
    current = stack[stack.length - 1];
    // 当前节点有下一层级，下一层级根节点入栈
    if (current.right && lastVisited !== current.right) {
      current = current.right;
    } else {
      // 当前节点的线性层级已经遍历，并且没有下一层级，则输出
      result.push(current.val);
      stack.pop();
      lastVisited = current;
      // 回退到之前的线性层级
      current = null;
    }
  }
  return result;
}


console.log(postOrder(root));

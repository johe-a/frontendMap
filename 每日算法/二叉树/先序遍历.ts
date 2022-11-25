import { root, TreeNode } from './mock';
function preOrder(root: TreeNode) {
  // 先序遍历，先进先输出，移除时机为当前子树遍历完毕
  const stack: TreeNode[] = [];
  const result: string[] = [];
  let current: TreeNode = root;
  while(current || stack.length) {
    while(current) {
      // 先遍历根节点
      result.push(current.val);
      stack.push(current);
      current = current.left;
    }
    current = stack.pop();
    current = current.right;
  }
  return result;
}

export default preOrder;

console.log(preOrder(root));
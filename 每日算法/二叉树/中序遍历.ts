import { root, TreeNode} from './mock';

function inOrder(root: TreeNode) {
  let current = root;
  const stack: TreeNode[] = [];
  const result: string[] = [];
  while(current || stack.length) {
    while(current) {
      stack.push(current);
      current = current.left;
    }
    // 当前左子树已经为空，可以输出根节点
    current = stack.pop();
    result.push(current.val);
    current = current.right;
  }
  return result;
}

export default inOrder;

console.log(inOrder(root));
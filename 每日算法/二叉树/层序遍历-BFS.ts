import { root, TreeNode } from './mock';


function levelOrder(root: TreeNode) {
  const queue: TreeNode[] = [];
  const result: string[] = [];
  queue.push(root);
  while(queue.length) {
    let current = queue.shift();
    result.push(current.val);
    if (current.left) {
      queue.push(current.left);
    }
    if (current.right) {
      queue.push(current.right);
    }
  }
  return result;
}

console.log(levelOrder(root));

export default levelOrder;
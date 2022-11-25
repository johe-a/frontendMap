import { TreeNode, root } from "./mock";

function reverseBinaryTree(tree: TreeNode) {
  if (!tree) {
    return null;
  }
  const originLeft = tree.left;
  tree.left = reverseBinaryTree(tree.right);
  tree.right = reverseBinaryTree(originLeft);
  return tree;
}

// console.log(JSON.stringify(reverseBinaryTree(root)));

// 层序遍历的思想来翻转二叉树
function reverseBinaryTreeByQueue(tree: TreeNode) {
  let queue: TreeNode[] = [];
  queue.push(tree);
  while(queue.length) {
    const top = queue.shift();
    const { left, right } = top
    left && queue.push(left);
    right && queue.push(right);
    top.left = right;
    top.right = left;
  }
  return tree;
}

console.log(JSON.stringify(reverseBinaryTreeByQueue(root)));

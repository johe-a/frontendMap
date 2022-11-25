/**
 * 从n个不同元素中任取m（m≤n）个元素，按照一定的顺序排列起来，叫做从n个不同元素中取出m个元素的一个排列。当m=n时所有的排列情况叫全排列。
 * 题目描述：给定一个没有重复数字的序列，返回其所有可能的全排列。
 * 示例：   
 * 输入: [1,2,3]
 * 输出: [
 *  [1,2,3],
 *  [1,3,2],
 *  [2,1,3],
 *  [2,3,1],
 *  [3,1,2],
 *  [3,2,1]
 * ]
 */
function permute(arr: number[]): Array<number[]> {
  /**
   * 全排列，可以看做是树的路径遍历DFS
   * 我们将根节点定义为空节点
   * 则第一层节点为第一个数组项可能的节点
   * 第二层节点为第二个数组项可能的节点
   * 以此类推。
   * 难点在于如何在不构造树的前提下，遍历这棵树
   */
  // 记录当前路径
  const curPath: number[] = [];
  // 记录当前循环中已经遍历过的数字
  const visited: Record<number, boolean> = {};
  // 记录所有路径结果
  const resultPath: Array<number[]> = [];
  const depthTravel = (depth: number) => {
    // 遍历的返回边界为当前路径===数组路径
    if (depth === arr.length) {
      resultPath.push(curPath.slice());
      return;
    }
    for(let i = 0; i < arr.length; i++) {
      // 记录深度遍历的当前路径下是否已经使用过这个元素
      if (!visited[arr[i]]) {
        // 记录元素并入栈
        visited[arr[i]] = true;
        curPath.push(arr[i]);
        // 使用递归和栈来记录深度优先遍历的路径
        depthTravel(depth + 1);
        // 当前路径已经遍历完毕，可以出栈
        curPath.pop();
        // 当前路径已经遍历完毕，不再记录，防止其他路径无法遍历该元素
        visited[arr[i]] = false;
      }
    }
  }
  depthTravel(0);
  return resultPath;
}

console.log(permute([1,2,3]));
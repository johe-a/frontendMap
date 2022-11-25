/**
 * 题目描述：给定一组不含重复元素的整数数组 nums，返回该数组所有可能的子集（幂集）。
 * 说明：解集不能包含重复的子集。
 * 示例: 输入: nums = [1,2,3]
 * 输出:
 * [
 *  [3],
 *  [1],
 *  [2],
 *  [1,2,3],
 *  [1,3],
 *  [2,3],
 *  [1,2],
 *  []
 * ]
 */

/**
 * 只要是穷举，就应该使用树的DFS思维，难点在于这棵树如何被我们想象，确定每一层的节点
 * 观察可以发现，以上输出是与顺序严格相关的，例如：
 * [3] = [空，空，3]
 * [1] = [1, 空， 空]
 * [2] = [空，2，空]
 * [1, 3] = [1, 空, 3]
 * 等
 * 所以我们可以考虑为一颗这样的树，树上的每一层节点为当前索引的数字是否出现
 *        root
 *   1          空
 *  2 空        2 空
 * 3 空 3空    3 空 3空
 */
function subsets(arr: number[]): Array<number[]> {
  // 记录结果的组合
  const resultSubsets: Array<number[]> = [];
  // 记录当前深度优先遍历的路径
  const curPath: number[] = [];
  const depthTravel = (depth: number) => {
    if (depth === arr.length) {
      resultSubsets.push(curPath.slice());
      return;
    }
    // 当前记录
    curPath.push(arr[depth]);
    depthTravel(depth + 1);
    // 当前不记录
    curPath.pop();
    depthTravel(depth + 1);
  }
  depthTravel(0);
  return resultSubsets;
}

console.log(subsets([1,2,3]));
 
 
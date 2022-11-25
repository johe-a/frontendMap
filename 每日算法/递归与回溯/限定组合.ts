function limitSubsets(n: number, k: number): Array<number[]> {
  if (k > n) {
    return [];
  }
  const resultLimitSubsets: Array<number[]> = [];
  const curPath: number[] = [];
  const depthTravel = (depth: number) => {
    // 由于是限定组合，边界为当前路径长度等于限定长度
    if (curPath.length === k) {
      resultLimitSubsets.push(curPath.slice());
      return;
    }
    // 如果当前深度遍历到了终点，也没找到限定组合，则返回
    if (depth === n + 1) {
      return;
    }
    // 当前数存在于深度遍历过程中的情况
    curPath.push(depth);
    depthTravel(depth + 1);
    // 当前数不存在于深度遍历过程中的情况
    curPath.pop();
    depthTravel(depth + 1);
  }
  depthTravel(1);
  return resultLimitSubsets;
}

console.log(limitSubsets(4, 2));
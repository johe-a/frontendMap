/**
 * 给出一个目标数字
 * 从一个数组内找出两个元素之和为目标数字
 * 例如 const a = [1,2,3];
 * targetNumber = 4;
 * 则输出目标数字1和3的下标0和2
 */
const targetNumber = 9;
const arr = [7, 11, 2, 8, 13, 15, 2];

/**
 * 获取两数之和为目标数字的两数下标
 * @param {number[]} arr 数组
 * @param {number} targetNumber 目标数字
 */
function getTwoNumberAddEqualToTargetFromArray(arr: number[], targetNumber: number) {
  /**
   * keyPoint: 
   * 1. 两数之和转化为两数之差
   * 2. Map结构存储已经遍历过的数字，空间换时间
   * 时间复杂度O(n)
   */
  const travelMap = new Map<number, number>();
  for(let i = 0; i < arr.length; i++) {
    const curNumber = arr[i];
    // 计算差值是否在travelMap出现过，没出现过则存储当前值
    const gapNumber = targetNumber - curNumber;
    const startIndex = travelMap.get(gapNumber);
    if (startIndex !== undefined) {
      return [startIndex, i];
    }
    travelMap.set(curNumber, i);
  }
  return null;
}

console.log(getTwoNumberAddEqualToTargetFromArray(arr, targetNumber));






function getTargetFromTwo(targetNumber: number, arr: number[]) {
  // 使用空间换时间，mapper的key记录当前数字和目标数字的差值，value记录下标
  const mapper: Map<number, number> = new Map();
  for(let i = 0 ; i < arr.length ; i++) {
    // 找到是否有差值等于当前数字的
    const mapIndex = mapper.get(arr[i]);
    if (mapIndex !== undefined) {
      return [mapIndex, i];
    }
    const numberGap = targetNumber - arr[i];
    mapper.set(numberGap, i);
  }
  return;
}

console.log(getTargetFromTwo( targetNumber, arr));

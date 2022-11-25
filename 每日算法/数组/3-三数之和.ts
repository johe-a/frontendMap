/**
 * 三数之和
 * 找出数组中的三个成员相加为目标数字的组合
 * 给定数组 nums = [-1, 0, 1, 2, -1, -4]，目标数字为0， 满足要求的三元组集合为： [ [-1, 0, 1], [-1, -1, 2] ]
 */
const target = 0;
const nums = [-1, 0, 1, 2, -1, -4];

// -4 -1 -1 0 1 2
/**
 * 获取三数之和为目标数字的组合
 * @param  {number[]} arr
 * @param  {number} targetNumber
 * @returns number
 */
const getThreeNumberSumEqualToTargetFromArray = (arr: number[], targetNumber: number): [number, number, number][] => {
  /**
   * keyPoint：
   * 两数之和利用的是两数之差，而三数之和也可以改成一个数固定，求差，判断其余两个数相加是否为差值
   * 关键是利用双指针碰撞，双指针碰撞的前提是数组是有序的，一个指针至于当前固定数的下标+1，一个指标至于尾部
   */
  const result: [number, number, number][] = [];
  const sortArr = arr.sort((a,b) => a-b);
  console.log(sortArr);
  const length = sortArr.length;
  for(let i = 0; i < length - 2; i ++) {
    let j = i + 1;
    let k = length - 1;
    const leftNumber = targetNumber - sortArr[i];
    if (i > 0 && sortArr[i] === sortArr[i-1]) {
      continue;
    }
    while(j < k) {
      if (sortArr[j] + sortArr[k] < leftNumber) {
        j++;
        while(j < k && sortArr[j] === sortArr[j-1]) {
          j++;
        }
      } else if (sortArr[j] + sortArr[k] > leftNumber) {
        k--;
        while(j < k && sortArr[k+1] === sortArr[k]) {
          k--;
        }
      } else {
        result.push([sortArr[i], sortArr[j], sortArr[k]]);
        j++;
        k--;
        while(j < k && sortArr[j] === sortArr[j-1]) {
          j++;
        }
        while(j < k && sortArr[k+1] === sortArr[k]) {
          k--;
        }
      }
    }
  }
  return result;
}
console.log(getThreeNumberSumEqualToTargetFromArray(nums, target));
import { mockArr } from './mock';
/**
 * 从第一个元素开始，重复比较相邻的两个项，若第一项比第二项更大，则交换两者位置，反之不动
 */
function bubbleSort(arr: number[]) {
  let result = arr.slice();
  for(let i = 0; i < arr.length; i++) {
    let flag = true;
    for (let j = 0; j < arr.length - i - 1; j ++) {
      if (result[j] > result[j + 1]) {
        flag = false;
        [result[j], result[j+1]] = [result[j+1], result[j]];
      }
    }
    if (flag) {
      return result;
    }
  }
  return result;
}

console.log(bubbleSort(mockArr));
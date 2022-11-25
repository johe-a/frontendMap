/**
 * 与归并排序类似，归并排序需要不断的拆分数组，而快速排序也需要拆分数组，但是拆分数组是依据一个标准来进行拆分
 * 通常拿当前数组的第一个元素作为基准，比它大的放右边，比它小的放左边。
 * 继续将左右两边的数组，将第一个元素作为基准，重复上述步骤
 * 直到元素的个数为1或者0时，直接返回
 */

import { mockArr } from "./mock";

function quickSort(arr: number[], begin: number, end: number) {
  if (begin >= end) {
    return arr;
  }
  let i = begin;
  let j = end;
  let base = arr[begin];
  while(i < j) {
    // 从末尾找比当前基准值小的值
    while(arr[j] >= base && j > i) {
      j--;
    }
    // 从开头找比当前基准值大的值
    while(arr[i] <= base && i < j) {
      i++;
    }
    // 如果不是基准值的位置，进行交换
    if (i < j) {
      [arr[j], arr[i]] = [arr[i], arr[j]];
    }
  }
  [arr[i], arr[begin]] = [arr[begin], arr[i]];
  quickSort(arr, 0, i-1);
  quickSort(arr, i+1, end);
  return arr;
}

console.log(quickSort(mockArr, 0, mockArr.length - 1))
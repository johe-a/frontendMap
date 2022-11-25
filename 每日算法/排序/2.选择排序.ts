import { mockArr } from './mock';
/**
 * 循环遍历数组，每次都找出当前范围内的最小值，放在当前范围的头部，然后缩小排序范围，重复以上操作，直到数组完全有序为止
 */
function selectSort(arr: number[]) {
  for(let i = 0; i < arr.length; i++) {
    let minIndex = i;
    for(let j = i + 1; j < arr.length; j++) {
      if (arr[j] < arr[minIndex]) {
        minIndex = j;
      }
    }
    [arr[i], arr[minIndex]] = [arr[minIndex],arr[i]];
  }
  return arr;
}

console.log(selectSort(mockArr));
import { mockArr } from './mock';
/**
 * 每个元素，找到当前元素在前面已排序的数组的位置进行插入。
 * 插入排序过程中，如果前面的元素比当前元素小，则往后顺移一位
 */
function insertSort(arr: number[]) {
  for(let i = 1; i < arr.length; i++) {
    let temp = arr[i];
    let j = i;
    while (j > 0 && arr[j-1] > temp) {
      arr[j] = arr[j-1];
      j--;
    }
    arr[j] = temp;
  }
  return arr;
}
console.log(insertSort(mockArr));

/**
 * 插入排序在查找自己的位置时，可以使用二分来查找，优化查找效率
 */
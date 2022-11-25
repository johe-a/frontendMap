import { mockArr } from "./mock";

function mergeSort(arr1: number[], arr2: number[]): number[] {
  let i = 0;
  let j = 0;
  const result: number[] = [];
  while (i < arr1.length && j < arr2.length) {
    if (arr1[i] < arr2[j]) {
      result.push(arr1[i])
      i++;
    } else {
      result.push(arr2[j]);
      j++;
    }
  }
  if (i === arr1.length) {
    result.push(...arr2.slice(j));
  } else {
    result.push(...arr1.slice(i));
  }
  return result;
}

function combineSort(arr: number[]): number[] {
  if (arr.length <= 1) {
    return arr;
  }
  const length = arr.length;
  const middle = length >> 1;
  const leftSorted = combineSort(arr.slice(0, middle));
  const rightSorted = combineSort(arr.slice(middle));
  return mergeSort(leftSorted, rightSorted);
}

console.log(combineSort(mockArr))